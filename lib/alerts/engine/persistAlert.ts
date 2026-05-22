import { pool } from "@/lib/db"
import type { AlertContext, AlertPolicy } from "../policies/types"
import type { EnrichedAlert } from "./enrichAlert"
import type { AlertRiskResult } from "./computeRiskScore"

export type PersistedAlert = {
  id: number | string
  type: string
  severity: string
  source_id: string | null
  status: string
  risk_score: number | null
  trust_score: number | null
  occurrences: number
  metadata: Record<string, unknown> | null
  created_at: string
  last_seen_at: string
  last_evaluated_at?: string | null
  policy?: string | null
  resolved_at?: string | null
}

function toJsonb(value: Record<string, unknown> | null | undefined): string {
  return JSON.stringify(value ?? {})
}

export async function persistAlert(params: {
  ctx: AlertContext
  policy: AlertPolicy
  enriched: EnrichedAlert
  risk: AlertRiskResult
}): Promise<PersistedAlert> {
  const { policy, enriched, risk } = params

  const existing = await pool.query(
    `
    SELECT id
    FROM alerts
    WHERE type = $1
      AND source_id IS NOT DISTINCT FROM $2
      AND resolved_at IS NULL
      AND COALESCE(status, 'OPEN') <> 'RESOLVED'
    ORDER BY created_at DESC
    LIMIT 1
    `,
    [policy.type, enriched.source_id]
  )

  if (existing.rowCount && existing.rows[0]) {
    const updated = await pool.query(
      `
      UPDATE alerts
      SET
        severity = $2,
        status = $3,
        risk_score = $4,
        trust_score = $5,
        metadata = COALESCE(metadata, '{}'::jsonb) || $6::jsonb,
        occurrences = COALESCE(occurrences, 0) + 1,
        last_seen_at = now(),
        last_evaluated_at = now(),
        policy = $7
      WHERE id = $1
      RETURNING *
      `,
      [
        existing.rows[0].id,
        risk.severity,
        risk.status,
        risk.score,
        enriched.trust_score,
        toJsonb(enriched.metadata),
        policy.type
      ]
    )

    return updated.rows[0]
  }

  const inserted = await pool.query(
    `
    INSERT INTO alerts (
      type,
      severity,
      source_id,
      metadata,
      created_at,
      last_seen_at,
      occurrences,
      status,
      risk_score,
      trust_score,
      last_evaluated_at,
      policy
    )
    VALUES (
      $1, $2, $3, $4::jsonb,
      now(), now(), 1,
      $5, $6, $7, now(), $8
    )
    RETURNING *
    `,
    [
      policy.type,
      risk.severity,
      enriched.source_id,
      toJsonb(enriched.metadata),
      risk.status,
      risk.score,
      enriched.trust_score,
      policy.type
    ]
  )

  return inserted.rows[0]
}