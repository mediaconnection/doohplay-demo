import { pool, db } from "@/lib/db"
import type { TrustGraphFilters } from "./types"

type RawNodeRow = {
  node_id: string
  label: string
  node_type: string
  executions: number
  invalid_events: number
  score: number
  last_seen_at: Date | string | null
}

type RawEdgeRow = {
  edge_id: string
  source: string
  target: string
  relation: string
  executions: number
  invalid_events: number
  weight: number
  last_seen_at: Date | string | null
}

type SqlFilterBuildResult = {
  whereSql: string
  params: Array<string | number>
}

const DEFAULT_HOURS = 24
const MAX_HOURS = 24 * 30

const DEFAULT_LIMIT_NODES = 200
const MAX_LIMIT_NODES = 1000

const DEFAULT_LIMIT_EDGES = 400
const MAX_LIMIT_EDGES = 3000

function normalizePositiveInt(
  value: unknown,
  fallback: number,
  max: number
): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback
  }

  const normalized = Math.trunc(value)

  if (normalized <= 0) {
    return fallback
  }

  return Math.min(normalized, max)
}

function normalizeOptionalString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function normalizeNodeLimit(filters: TrustGraphFilters): number {
  return normalizePositiveInt(
    filters.limitNodes,
    DEFAULT_LIMIT_NODES,
    MAX_LIMIT_NODES
  )
}

function normalizeEdgeLimit(filters: TrustGraphFilters): number {
  return normalizePositiveInt(
    filters.limitEdges,
    DEFAULT_LIMIT_EDGES,
    MAX_LIMIT_EDGES
  )
}

function buildBaseFilters(filters: TrustGraphFilters): SqlFilterBuildResult {
  const conditions: string[] = []
  const params: Array<string | number> = []

  const hours = normalizePositiveInt(filters.hours, DEFAULT_HOURS, MAX_HOURS)
  params.push(hours)
  conditions.push(`e.occurred_at >= NOW() - ($1::int * INTERVAL '1 hour')`)

  const campaignId = normalizeOptionalString(filters.campaignId)
  const advertiserId = normalizeOptionalString(filters.advertiserId)
  const deviceId = normalizeOptionalString(filters.deviceId)

  if (campaignId) {
    params.push(campaignId)
    conditions.push(`
      COALESCE(
        NULLIF(BTRIM(CASE WHEN e.payload IS NOT NULL THEN e.payload->>'campaign_id' END), ''),
        CASE
          WHEN e.source_table = 'campaigns'
            THEN NULLIF(BTRIM(e.source_id::text), '')
          ELSE NULL
        END
      ) = $${params.length}
    `)
  }

  if (advertiserId) {
    params.push(advertiserId)
    conditions.push(`
      COALESCE(
        NULLIF(BTRIM(e.client_id::text), ''),
        NULLIF(BTRIM(CASE WHEN e.payload IS NOT NULL THEN e.payload->>'advertiser_id' END), ''),
        NULLIF(BTRIM(CASE WHEN e.payload IS NOT NULL THEN e.payload->>'client_id' END), '')
      ) = $${params.length}
    `)
  }

  if (deviceId) {
    params.push(deviceId)
    conditions.push(`
      COALESCE(
        CASE
          WHEN e.source_table IN ('screens', 'players', 'devices', 'display_events')
            THEN NULLIF(BTRIM(e.source_id::text), '')
          ELSE NULL
        END,
        NULLIF(BTRIM(CASE WHEN e.payload IS NOT NULL THEN e.payload->>'device_id' END), ''),
        NULLIF(BTRIM(CASE WHEN e.payload IS NOT NULL THEN e.payload->>'player_id' END), ''),
        NULLIF(BTRIM(CASE WHEN e.payload IS NOT NULL THEN e.payload->>'screen_id' END), '')
      ) = $${params.length}
    `)
  }

  return {
    whereSql: `WHERE ${conditions.join(" AND ")}`,
    params
  }
}

export async function queryTrustGraphNodes(
  filters: TrustGraphFilters
): Promise<RawNodeRow[]> {
  const { whereSql, params } = buildBaseFilters(filters)
  const limitNodes = normalizeNodeLimit(filters)
  const limitParamIndex = params.length + 1

  const sql = `
    WITH base_events AS (
      SELECT
        e.event_id::text AS event_id,

        COALESCE(
          NULLIF(BTRIM(e.event_type), ''),
          'UNKNOWN_EVENT'
        ) AS event_type_key,

        COALESCE(
          NULLIF(BTRIM(e.source_table), ''),
          'unknown'
        ) AS source_table_key,

        CASE
          WHEN e.source_table IN ('screens', 'players', 'devices', 'display_events')
            AND NULLIF(BTRIM(e.source_id::text), '') IS NOT NULL
            THEN NULLIF(BTRIM(e.source_id::text), '')

          WHEN NULLIF(BTRIM(CASE WHEN e.payload IS NOT NULL THEN e.payload->>'device_id' END), '') IS NOT NULL
            THEN NULLIF(BTRIM(CASE WHEN e.payload IS NOT NULL THEN e.payload->>'device_id' END), '')

          WHEN NULLIF(BTRIM(CASE WHEN e.payload IS NOT NULL THEN e.payload->>'player_id' END), '') IS NOT NULL
            THEN NULLIF(BTRIM(CASE WHEN e.payload IS NOT NULL THEN e.payload->>'player_id' END), '')

          WHEN NULLIF(BTRIM(CASE WHEN e.payload IS NOT NULL THEN e.payload->>'screen_id' END), '') IS NOT NULL
            THEN NULLIF(BTRIM(CASE WHEN e.payload IS NOT NULL THEN e.payload->>'screen_id' END), '')

          ELSE NULL
        END AS source_key,

        COALESCE(
          NULLIF(BTRIM(CASE WHEN e.payload IS NOT NULL THEN e.payload->>'campaign_id' END), ''),
          CASE
            WHEN e.source_table = 'campaigns'
              THEN NULLIF(BTRIM(e.source_id::text), '')
            ELSE NULL
          END
        ) AS campaign_key,

        COALESCE(
          NULLIF(BTRIM(e.client_id::text), ''),
          NULLIF(BTRIM(CASE WHEN e.payload IS NOT NULL THEN e.payload->>'advertiser_id' END), ''),
          NULLIF(BTRIM(CASE WHEN e.payload IS NOT NULL THEN e.payload->>'client_id' END), '')
        ) AS advertiser_key,

        e.occurred_at,

        CASE
          WHEN UPPER(COALESCE(NULLIF(BTRIM(e.event_type), ''), '')) LIKE '%FAIL%' THEN 1
          WHEN UPPER(COALESCE(NULLIF(BTRIM(e.event_type), ''), '')) LIKE '%ERROR%' THEN 1
          WHEN UPPER(COALESCE(NULLIF(BTRIM(CASE WHEN e.payload IS NOT NULL THEN e.payload->>'verification_status' END), ''), '')) = 'FAILED' THEN 1
          WHEN UPPER(COALESCE(NULLIF(BTRIM(CASE WHEN e.payload IS NOT NULL THEN e.payload->>'status' END), ''), '')) = 'FAILED' THEN 1
          WHEN COALESCE(CASE WHEN e.payload IS NOT NULL THEN e.payload->>'fraud' END, 'false') = 'true' THEN 1
          WHEN COALESCE(CASE WHEN e.payload IS NOT NULL THEN e.payload->>'invalid' END, 'false') = 'true' THEN 1
          WHEN COALESCE(e.trust_score, 100) < 40 THEN 1
          ELSE 0
        END AS is_invalid,

        CASE
          WHEN e.trust_score IS NOT NULL
            THEN LEAST(100, GREATEST(0, e.trust_score::numeric))
          WHEN NULLIF(BTRIM(CASE WHEN e.payload IS NOT NULL THEN e.payload->>'trust_score' END), '') ~ '^[0-9]+(\\.[0-9]+)?$'
            THEN LEAST(100, GREATEST(0, (e.payload->>'trust_score')::numeric))
          WHEN UPPER(COALESCE(NULLIF(BTRIM(e.event_type), ''), '')) IN ('AD_PLAY_END', 'PLAYER_HEARTBEAT', 'IMPRESSION')
            THEN 90
          WHEN UPPER(COALESCE(NULLIF(BTRIM(e.event_type), ''), '')) LIKE '%FAIL%'
            OR UPPER(COALESCE(NULLIF(BTRIM(e.event_type), ''), '')) LIKE '%ERROR%'
            THEN 25
          ELSE 75
        END AS trust_score
      FROM public.event_chain e
      ${whereSql}
    ),
    expanded_nodes AS (
      SELECT
        CONCAT('event_type:', be.event_type_key) AS node_id,
        be.event_type_key AS label,
        'event_type' AS node_type,
        be.is_invalid,
        be.trust_score,
        be.occurred_at
      FROM base_events be

      UNION ALL

      SELECT
        CONCAT('source_table:', be.source_table_key) AS node_id,
        be.source_table_key AS label,
        'source_table' AS node_type,
        be.is_invalid,
        be.trust_score,
        be.occurred_at
      FROM base_events be

      UNION ALL

      SELECT
        CONCAT('source:', be.source_key) AS node_id,
        be.source_key AS label,
        'source' AS node_type,
        be.is_invalid,
        be.trust_score,
        be.occurred_at
      FROM base_events be
      WHERE be.source_key IS NOT NULL

      UNION ALL

      SELECT
        CONCAT('campaign:', be.campaign_key) AS node_id,
        be.campaign_key AS label,
        'campaign' AS node_type,
        be.is_invalid,
        be.trust_score,
        be.occurred_at
      FROM base_events be
      WHERE be.campaign_key IS NOT NULL

      UNION ALL

      SELECT
        CONCAT('advertiser:', be.advertiser_key) AS node_id,
        be.advertiser_key AS label,
        'advertiser' AS node_type,
        be.is_invalid,
        be.trust_score,
        be.occurred_at
      FROM base_events be
      WHERE be.advertiser_key IS NOT NULL
    )
    SELECT
      en.node_id,
      en.label,
      en.node_type,
      COUNT(*)::int AS executions,
      COALESCE(SUM(en.is_invalid), 0)::int AS invalid_events,
      ROUND(AVG(en.trust_score))::int AS score,
      MAX(en.occurred_at) AS last_seen_at
    FROM expanded_nodes en
    GROUP BY
      en.node_id,
      en.label,
      en.node_type
    ORDER BY
      executions DESC,
      invalid_events DESC,
      score ASC,
      en.node_id ASC
    LIMIT $${limitParamIndex}
  `

  const result = await db.query<RawNodeRow>(sql, [...params, limitNodes])
  return result.rows ?? []
}

export async function queryTrustGraphEdges(
  filters: TrustGraphFilters
): Promise<RawEdgeRow[]> {
  const { whereSql, params } = buildBaseFilters(filters)
  const limitEdges = normalizeEdgeLimit(filters)
  const limitParamIndex = params.length + 1

  const sql = `
    WITH base_events AS (
      SELECT
        e.event_id::text AS event_id,

        COALESCE(
          NULLIF(BTRIM(e.event_type), ''),
          'UNKNOWN_EVENT'
        ) AS event_type_key,

        COALESCE(
          NULLIF(BTRIM(e.source_table), ''),
          'unknown'
        ) AS source_table_key,

        CASE
          WHEN e.source_table IN ('screens', 'players', 'devices', 'display_events')
            AND NULLIF(BTRIM(e.source_id::text), '') IS NOT NULL
            THEN NULLIF(BTRIM(e.source_id::text), '')

          WHEN NULLIF(BTRIM(CASE WHEN e.payload IS NOT NULL THEN e.payload->>'device_id' END), '') IS NOT NULL
            THEN NULLIF(BTRIM(CASE WHEN e.payload IS NOT NULL THEN e.payload->>'device_id' END), '')

          WHEN NULLIF(BTRIM(CASE WHEN e.payload IS NOT NULL THEN e.payload->>'player_id' END), '') IS NOT NULL
            THEN NULLIF(BTRIM(CASE WHEN e.payload IS NOT NULL THEN e.payload->>'player_id' END), '')

          WHEN NULLIF(BTRIM(CASE WHEN e.payload IS NOT NULL THEN e.payload->>'screen_id' END), '') IS NOT NULL
            THEN NULLIF(BTRIM(CASE WHEN e.payload IS NOT NULL THEN e.payload->>'screen_id' END), '')

          ELSE NULL
        END AS source_key,

        COALESCE(
          NULLIF(BTRIM(CASE WHEN e.payload IS NOT NULL THEN e.payload->>'campaign_id' END), ''),
          CASE
            WHEN e.source_table = 'campaigns'
              THEN NULLIF(BTRIM(e.source_id::text), '')
            ELSE NULL
          END
        ) AS campaign_key,

        COALESCE(
          NULLIF(BTRIM(e.client_id::text), ''),
          NULLIF(BTRIM(CASE WHEN e.payload IS NOT NULL THEN e.payload->>'advertiser_id' END), ''),
          NULLIF(BTRIM(CASE WHEN e.payload IS NOT NULL THEN e.payload->>'client_id' END), '')
        ) AS advertiser_key,

        NULLIF(BTRIM(e.tx_hash), '') AS tx_hash,
        NULLIF(BTRIM(e.block_id::text), '') AS block_id,
        e.block_height,
        e.anchored_at,
        e.occurred_at,

        CASE
          WHEN UPPER(COALESCE(NULLIF(BTRIM(e.event_type), ''), '')) LIKE '%FAIL%' THEN 1
          WHEN UPPER(COALESCE(NULLIF(BTRIM(e.event_type), ''), '')) LIKE '%ERROR%' THEN 1
          WHEN UPPER(COALESCE(NULLIF(BTRIM(CASE WHEN e.payload IS NOT NULL THEN e.payload->>'verification_status' END), ''), '')) = 'FAILED' THEN 1
          WHEN UPPER(COALESCE(NULLIF(BTRIM(CASE WHEN e.payload IS NOT NULL THEN e.payload->>'status' END), ''), '')) = 'FAILED' THEN 1
          WHEN COALESCE(CASE WHEN e.payload IS NOT NULL THEN e.payload->>'fraud' END, 'false') = 'true' THEN 1
          WHEN COALESCE(CASE WHEN e.payload IS NOT NULL THEN e.payload->>'invalid' END, 'false') = 'true' THEN 1
          WHEN COALESCE(e.trust_score, 100) < 40 THEN 1
          ELSE 0
        END AS is_invalid
      FROM public.event_chain e
      ${whereSql}
    ),
    relations AS (
      SELECT
        CONCAT('event_type:', be.event_type_key) AS source,
        CONCAT('source_table:', be.source_table_key) AS target,
        'event_type_to_source_table' AS relation,
        be.is_invalid,
        be.occurred_at
      FROM base_events be

      UNION ALL

      SELECT
        CONCAT('source_table:', be.source_table_key) AS source,
        CONCAT('source:', be.source_key) AS target,
        'source_table_to_source' AS relation,
        be.is_invalid,
        be.occurred_at
      FROM base_events be
      WHERE be.source_key IS NOT NULL

      UNION ALL

      SELECT
        CONCAT('event_type:', be.event_type_key) AS source,
        CONCAT('source:', be.source_key) AS target,
        'event_type_to_source' AS relation,
        be.is_invalid,
        be.occurred_at
      FROM base_events be
      WHERE be.source_key IS NOT NULL

      UNION ALL

      SELECT
        CONCAT('campaign:', be.campaign_key) AS source,
        CONCAT('advertiser:', be.advertiser_key) AS target,
        'campaign_to_advertiser' AS relation,
        be.is_invalid,
        be.occurred_at
      FROM base_events be
      WHERE be.campaign_key IS NOT NULL
        AND be.advertiser_key IS NOT NULL

      UNION ALL

      SELECT
        CONCAT('source:', be.source_key) AS source,
        CONCAT('campaign:', be.campaign_key) AS target,
        'source_to_campaign' AS relation,
        be.is_invalid,
        be.occurred_at
      FROM base_events be
      WHERE be.source_key IS NOT NULL
        AND be.campaign_key IS NOT NULL

      UNION ALL

      SELECT
        CONCAT('source:', be.source_key) AS source,
        CONCAT('advertiser:', be.advertiser_key) AS target,
        'source_to_advertiser' AS relation,
        be.is_invalid,
        be.occurred_at
      FROM base_events be
      WHERE be.source_key IS NOT NULL
        AND be.advertiser_key IS NOT NULL

      UNION ALL

      SELECT
        CONCAT('source:', be.source_key) AS source,
        CONCAT('source:', be2.source_key) AS target,
        'shared_tx_hash' AS relation,
        CASE
          WHEN be.is_invalid = 1 OR be2.is_invalid = 1 THEN 1
          ELSE 0
        END AS is_invalid,
        GREATEST(be.occurred_at, be2.occurred_at) AS occurred_at
      FROM base_events be
      INNER JOIN base_events be2
        ON be.tx_hash IS NOT NULL
       AND be2.tx_hash IS NOT NULL
       AND be.tx_hash = be2.tx_hash
       AND be.source_key IS NOT NULL
       AND be2.source_key IS NOT NULL
       AND be.source_key < be2.source_key

      UNION ALL

      SELECT
        CONCAT('source:', be.source_key) AS source,
        CONCAT('source:', be2.source_key) AS target,
        'shared_block_id' AS relation,
        CASE
          WHEN be.is_invalid = 1 OR be2.is_invalid = 1 THEN 1
          ELSE 0
        END AS is_invalid,
        GREATEST(be.occurred_at, be2.occurred_at) AS occurred_at
      FROM base_events be
      INNER JOIN base_events be2
        ON be.block_id IS NOT NULL
       AND be2.block_id IS NOT NULL
       AND be.block_id = be2.block_id
       AND be.source_key IS NOT NULL
       AND be2.source_key IS NOT NULL
       AND be.source_key < be2.source_key

      UNION ALL

      SELECT
        CONCAT('source:', be.source_key) AS source,
        CONCAT('source:', be2.source_key) AS target,
        'shared_block_height' AS relation,
        CASE
          WHEN be.is_invalid = 1 OR be2.is_invalid = 1 THEN 1
          ELSE 0
        END AS is_invalid,
        GREATEST(be.occurred_at, be2.occurred_at) AS occurred_at
      FROM base_events be
      INNER JOIN base_events be2
        ON be.block_height IS NOT NULL
       AND be2.block_height IS NOT NULL
       AND be.block_height = be2.block_height
       AND be.source_key IS NOT NULL
       AND be2.source_key IS NOT NULL
       AND be.source_key < be2.source_key

      UNION ALL

      SELECT
        CONCAT('source:', be.source_key) AS source,
        CONCAT('source_table:', 'anchored') AS target,
        'source_to_anchor_state' AS relation,
        be.is_invalid,
        be.occurred_at
      FROM base_events be
      WHERE be.source_key IS NOT NULL
        AND be.anchored_at IS NOT NULL
    )
    SELECT
      CONCAT(r.source, '=>', r.target, ':', r.relation) AS edge_id,
      r.source,
      r.target,
      r.relation,
      COUNT(*)::int AS executions,
      COALESCE(SUM(r.is_invalid), 0)::int AS invalid_events,
      GREATEST(1, COUNT(*)::int) AS weight,
      MAX(r.occurred_at) AS last_seen_at
    FROM relations r
    WHERE r.source <> r.target
    GROUP BY
      r.source,
      r.target,
      r.relation
    ORDER BY
      weight DESC,
      invalid_events DESC,
      r.source ASC,
      r.target ASC,
      r.relation ASC
    LIMIT $${limitParamIndex}
  `

  const result = await db.query<RawEdgeRow>(sql, [...params, limitEdges])
  return result.rows ?? []
}