// @ts-nocheck
import crypto from "crypto"
import { pool } from "@/lib/db"
import type { AlertContext } from "../policies/types"
import type { EnrichedAlert } from "./enrichAlert"
import type { AlertRiskResult } from "./computeRiskScore"
import type { PersistedAlert } from "./persistAlert"

function sha256(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex")
}

function stableJson(value: Record<string, unknown>): string {
  return JSON.stringify(
    Object.keys(value)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = value[key]
        return acc
      }, {})
  )
}

export async function auditAlert(params: {
  alert: PersistedAlert
  ctx: AlertContext
  enriched: EnrichedAlert
  risk: AlertRiskResult
}): Promise<void> {
  const { alert, ctx, enriched, risk } = params

  const payload = {
    alert_id: alert.id,
    alert_type: alert.type,
    severity: alert.severity,
    status: alert.status,
    source_id: alert.source_id,
    risk_score: risk.score,
    policy_severity: risk.policy_severity,
    trust_score: enriched.trust_score,
    trust_label: enriched.trust_label,
    risk_factors: risk.factors,
    metadata: enriched.metadata,
    occurred_at: ctx.now.toISOString()
  }

  const payloadCanonical = stableJson(payload)
  const payloadHash = sha256(payloadCanonical)

  try {
    const previous = await pool.query(
      `
      SELECT event_hash
      FROM event_chain
      WHERE event_hash IS NOT NULL
      ORDER BY chain_index DESC NULLS LAST, id DESC
      LIMIT 1
      `
    )

    const previousEventHash = previous.rows[0]?.event_hash ?? null
    const eventHash = sha256(`${previousEventHash ?? ""}:${payloadHash}`)

    await pool.query(
      `
      INSERT INTO event_chain (
        event_type,
        source_table,
        source_id,
        occurred_at,
        payload,
        payload_hash,
        event_hash,
        previous_event_hash,
        created_at,
        trust_score
      )
      VALUES (
        $1, $2, $3,
        now(),
        $4::jsonb,
        $5, $6, $7,
        now(),
        $8
      )
      `,
      [
        "ALERT_EVENT",
        "alerts",
        String(alert.id),
        JSON.stringify(payload),
        payloadHash,
        eventHash,
        previousEventHash,
        risk.score
      ]
    )
  } catch (error) {
    console.warn("ALERT_AUDIT_FAILED", error)
  }
}
