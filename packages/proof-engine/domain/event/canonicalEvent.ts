// @ts-nocheck
import { pool } from "@/lib/db"
import crypto from "crypto"

export async function buildCanonicalEvent(eventId: string) {
  const res = await pool.query(
    `SELECT * FROM event_ingestion WHERE id = $1`,
    [eventId]
  )

  const raw = res.rows[0]

  const canonicalPayload = {
    ...raw.payload,
    normalized_at: new Date().toISOString(),
  }

  const hash = crypto
    .createHash("sha256")
    .update(JSON.stringify(canonicalPayload))
    .digest("hex")

  return {
    event_id: eventId,
    payload: canonicalPayload,
    hash,
  }
}
