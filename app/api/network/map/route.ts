// app/api/admin/network-map/route.ts
export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

import { NextResponse } from "next/server"
import { getPool } from "@/lib/db"

export const runtime = "nodejs"

type NetworkMapRisk = "SAFE" | "WATCH" | "HIGH_RISK"
type NetworkMapStatus = "online" | "offline"

type NetworkMapRow = {
  player_id: string | null
  player_name: string | null
  latitude: number | string | null
  longitude: number | string | null
  location: string | null
  device_type: string | null
  platform: string | null
  player_code: string | null
  heartbeat_status: string | null
  last_seen_at: string | Date | null
  executions: number | string | null
  invalid_events: number | string | null
  score: number | string | null
  risk: string | null
  client_name: string | null
  client_code: string | null
}

export type NetworkMapItem = {
  id: string
  name: string
  latitude: number | null
  longitude: number | null
  status: NetworkMapStatus
  score: number
  risk: NetworkMapRisk
  executions: number
  invalidEvents: number
  lastSeenAt: string | null
  metadata: {
    location: string | null
    deviceType: string | null
    platform: string | null
    playerCode: string | null
    clientName: string | null
    clientCode: string | null
  }
}

type NetworkMapResponse = {
  success: boolean
  data: NetworkMapItem[]
  summary?: {
    total: number
    online: number
    offline: number
    safe: number
    watch: number
    highRisk: number
    withCoordinates: number
    withoutCoordinates: number
    generatedAt: string
  }
  error?: string
}

function toSafeNumber(value: unknown): number | null {
  const numeric =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : NaN
  return Number.isFinite(numeric) ? numeric : null
}

function normalizeStatus(
  heartbeatStatus: string | null,
  lastSeenAt: string | Date | null
): NetworkMapStatus {
  const normalized = heartbeatStatus?.trim().toLowerCase()
  if (normalized === "online") return "online"
  if (normalized === "offline") return "offline"
  if (!lastSeenAt) return "offline"
  const time = new Date(lastSeenAt).getTime()
  if (Number.isNaN(time)) return "offline"
  return Date.now() - time <= 3 * 60 * 1000 ? "online" : "offline"
}

function clampScore(value: unknown): number {
  const numeric = toSafeNumber(value)
  if (numeric === null) return 0
  return Math.max(0, Math.min(100, Math.round(numeric)))
}

function normalizeRisk(value: string | null | undefined): NetworkMapRisk {
  const normalized = value?.trim().toUpperCase()
  if (normalized === "HIGH_RISK") return "HIGH_RISK"
  if (normalized === "WATCH") return "WATCH"
  return "SAFE"
}

function toSafeInteger(value: unknown): number {
  const numeric = toSafeNumber(value)
  if (numeric === null) return 0
  return Math.max(0, Math.trunc(numeric))
}

function toIsoString(value: string | Date | null): string | null {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString()
}

function hasValidCoordinates(item: NetworkMapItem): boolean {
  return (
    typeof item.latitude === "number" &&
    Number.isFinite(item.latitude) &&
    typeof item.longitude === "number" &&
    Number.isFinite(item.longitude)
  )
}

export async function GET() {
  const pool = getPool()
  try {
    const res = await pool.query(`
      WITH latest_heartbeat AS (
        SELECT DISTINCT ON (ph.player_id)
          ph.player_id,
          ph.status AS heartbeat_status,
          ph.last_seen_at
        FROM public.player_heartbeats ph
        WHERE ph.player_id IS NOT NULL
        ORDER BY ph.player_id, ph.last_seen_at DESC NULLS LAST
      ),
      player_metrics AS (
        SELECT
          ec.device_id AS player_id,
          COUNT(*)::int AS executions,
          SUM(
            CASE
              WHEN lower(coalesce(ec.payload->>'invalid', 'false')) = 'true'
                THEN 1
              ELSE 0
            END
          )::int AS invalid_events
        FROM public.event_chain ec
        WHERE ec.device_id IS NOT NULL
        GROUP BY ec.device_id
      ),
      graph_nodes AS (
        SELECT
          tgn.ref_id AS player_id,
          coalesce(tgn.score, 0)::float AS score,
          coalesce(tgn.risk, 'SAFE') AS risk
        FROM public.trust_graph_nodes tgn
        WHERE tgn.node_type IN ('device', 'player')
      ),
      players_base AS (
        SELECT
          p.id::text AS player_id,
          coalesce(
            nullif(trim(p.name), ''),
            nullif(trim(p.player_code), ''),
            'Player ' || p.id::text
          ) AS player_name,
          p.latitude,
          p.longitude,
          p.location,
          p.device_type,
          p.platform,
          p.player_code,
          sc.name AS client_name,
          sc.code AS client_code
        FROM public.players p
        LEFT JOIN public.studio_clients sc ON sc.player_id = p.id
      ),
      all_players AS (
        SELECT player_id FROM latest_heartbeat
        UNION
        SELECT player_id FROM player_metrics
        UNION
        SELECT player_id FROM graph_nodes
        UNION
        SELECT player_id FROM players_base
      )
      SELECT
        ap.player_id,
        pb.player_name,
        pb.latitude,
        pb.longitude,
        pb.location,
        pb.device_type,
        pb.platform,
        pb.player_code,
        pb.client_name,
        pb.client_code,
        lh.heartbeat_status,
        lh.last_seen_at,
        coalesce(pm.executions, 0)::int AS executions,
        coalesce(pm.invalid_events, 0)::int AS invalid_events,
        coalesce(gn.score, 0)::float AS score,
        coalesce(gn.risk, 'SAFE') AS risk
      FROM all_players ap
      LEFT JOIN players_base pb ON pb.player_id = ap.player_id
      LEFT JOIN latest_heartbeat lh ON lh.player_id = ap.player_id
      LEFT JOIN player_metrics pm ON pm.player_id = ap.player_id
      LEFT JOIN graph_nodes gn ON gn.player_id = ap.player_id
      WHERE ap.player_id IS NOT NULL
      ORDER BY lh.last_seen_at DESC NULLS LAST, ap.player_id ASC
      LIMIT 1000
    `)

    const rows = res.rows as NetworkMapRow[]

    const items: NetworkMapItem[] = rows
      .filter(row => typeof row.player_id === "string" && row.player_id.trim().length > 0)
      .map((row): NetworkMapItem => {
        const playerId = String(row.player_id).trim()
        return {
          id: playerId,
          name: row.player_name?.trim() || `Player ${playerId}`,
          latitude:  toSafeNumber(row.latitude),
          longitude: toSafeNumber(row.longitude),
          status:    normalizeStatus(row.heartbeat_status, row.last_seen_at),
          score:     clampScore(row.score),
          risk:      normalizeRisk(row.risk),
          executions:   toSafeInteger(row.executions),
          invalidEvents: toSafeInteger(row.invalid_events),
          lastSeenAt: toIsoString(row.last_seen_at),
          metadata: {
            location:   row.location,
            deviceType: row.device_type,
            platform:   row.platform,
            playerCode: row.player_code,
            clientName: row.client_name,
            clientCode: row.client_code,
          },
        }
      })

    const withCoordinates = items.filter(hasValidCoordinates).length

    const response: NetworkMapResponse = {
      success: true,
      data: items,
      summary: {
        total:    items.length,
        online:   items.filter(i => i.status === "online").length,
        offline:  items.filter(i => i.status === "offline").length,
        safe:     items.filter(i => i.risk === "SAFE").length,
        watch:    items.filter(i => i.risk === "WATCH").length,
        highRisk: items.filter(i => i.risk === "HIGH_RISK").length,
        withCoordinates,
        withoutCoordinates: items.length - withCoordinates,
        generatedAt: new Date().toISOString(),
      },
    }

    return NextResponse.json(response, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    })
  } catch (error) {
    console.error("NETWORK_MAP_FETCH_FAILED", error)
    return NextResponse.json(
      { success: false, data: [], error: error instanceof Error ? error.message : "internal_error" },
      { status: 500 }
    )
  }
}
