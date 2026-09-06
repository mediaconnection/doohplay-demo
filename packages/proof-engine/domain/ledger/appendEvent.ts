// @ts-nocheck
import { pool } from "@/lib/db"
import crypto from "crypto"

export async function appendEventToLedger(event: any) {
  const last = await pool.query(`
    SELECT event_hash
    FROM event_chain
    ORDER BY created_at DESC
    LIMIT 1
  `)

  const prevHash = last.rows[0]?.event_hash || null
  const combined = `${prevHash || ""}${event.hash}`
  const eventHash = crypto
    .createHash("sha256")
    .update(combined)
    .digest("hex")

  const res = await pool.query(
    `
    INSERT INTO event_chain (
      event_id,
      event_hash,
      previous_event_hash,
      payload
    )
    VALUES ($1, $2, $3, $4)
    RETURNING *
    `,
    [event.event_id, eventHash, prevHash, event.payload]
  )

  return res.rows[0]
}
