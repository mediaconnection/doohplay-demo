// @ts-nocheck
// services/proof.ts

import { pool } from "@/lib/db"
import { hashEvent } from "@/lib/crypto/hashEvent"
import { canonicalize } from "@/lib/crypto/canonical"

export async function appendToChain(event:any){

  const prevRes = await pool.query(`
    SELECT event_hash
    FROM event_chain
    ORDER BY id DESC
    LIMIT 1
  `)

  const previous_hash = prevRes.rows[0]?.event_hash || null

  const canonical = canonicalize({
    ...event,
    previous_hash
  })

  const event_hash = hashEvent(canonical)

  await pool.query(`
    INSERT INTO event_chain (
      event_hash,
      previous_hash,
      payload
    )
    VALUES ($1,$2,$3)
  `,[event_hash, previous_hash, event])

  return event_hash
}
