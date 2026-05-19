import { pool } from "@/lib/db"

/* =========================
   TYPES
========================= */

export type OpenOrUpdateAlertInput = {
  type: string
  severity?: string
  sourceId?: string
  metadata?: Record<string, unknown>
}

/* =========================
   HELPERS
========================= */

function safeString(value: unknown): string | null {
  if (typeof value !== "string") return null
  const v = value.trim()
  return v.length ? v : null
}

/* =========================
   MAIN FUNCTION
========================= */

export async function openOrUpdateAlert(
  input: OpenOrUpdateAlertInput
) {
  const type = safeString(input.type)

  if (!type) {
    throw new Error("INVALID_ALERT_TYPE")
  }

  const severity = safeString(input.severity) ?? "MEDIUM"
  const sourceId = safeString(input.sourceId)

  try {
    /* =========================
       CHECK EXISTING ALERT
    ========================= */

    const existing = await pool.query(
      `
      SELECT id, occurrences
      FROM alerts
      WHERE type = $1
        AND source_id = $2
        AND resolved = false
      LIMIT 1
      `,
      [type, sourceId]
    )

    let alert

    if (existing.rowCount && existing.rows[0]) {
      const row = existing.rows[0]

      /* =========================
         UPDATE EXISTING
      ========================= */

      const updated = await pool.query(
        `
        UPDATE alerts
        SET
          occurrences = occurrences + 1,
          last_seen_at = now(),
          metadata = $2
        WHERE id = $1
        RETURNING *
        `,
        [row.id, input.metadata ?? null]
      )

      alert = updated.rows[0]
    } else {
      /* =========================
         CREATE NEW ALERT
      ========================= */

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
          resolved
        )
        VALUES ($1, $2, $3, $4, now(), now(), 1, false)
        RETURNING *
        `,
        [
          type,
          severity,
          sourceId,
          input.metadata ?? null
        ]
      )

      alert = inserted.rows[0]
    }

    /* =========================
       OPTIONAL: AUDIT TRAIL
    ========================= */

    try {
      await pool.query(
        `
        INSERT INTO event_chain (
          event_type,
          payload,
          occurred_at,
          created_at
        )
        VALUES ($1, $2, now(), now())
        `,
        [
          "alert_event",
          JSON.stringify({
            type,
            severity,
            source_id: sourceId,
            alert_id: alert.id
          })
        ]
      )
    } catch (err) {
      console.warn("ALERT_AUDIT_FAILED", err)
    }

    /* =========================
       RESPONSE
    ========================= */

    return {
      ok: true,
      alert_id: alert.id,
      type: alert.type,
      severity: alert.severity,
      source_id: alert.source_id,
      occurrences: alert.occurrences,
      updated_at: alert.last_seen_at,
      metadata: alert.metadata ?? null
    }

  } catch (error) {
    console.error("OPEN_OR_UPDATE_ALERT_ERROR", error)
    throw error
  }
}