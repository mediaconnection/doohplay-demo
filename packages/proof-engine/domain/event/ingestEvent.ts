// @ts-nocheck
import { pool } from "@/lib/db"
import crypto from "crypto"

/* =========================
   HASH DETERMINÍSTICO
========================= */

function generateEventHash(data: any): string {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(data))
    .digest("hex")
}

/* =========================
   INGESTÃO COM DEDUP
========================= */

export async function ingestEvent(input: any) {
  const hash = generateEventHash(input)

  const res = await pool.query(
    `
    INSERT INTO events (payload, event_hash)
    VALUES ($1, $2)
    ON CONFLICT (event_hash)
    DO UPDATE SET payload = EXCLUDED.payload
    RETURNING id
    `,
    [input, hash]
  )

  return {
    id: res.rows[0].id,
    hash
  }
}
