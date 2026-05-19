import { pool } from "@/lib/db"
import crypto from "crypto"

export async function buildProof(event: any) {
  // simplificado (evoluímos depois)
  const proofHash = crypto
    .createHash("sha256")
    .update(event.event_hash)
    .digest("hex")

  await pool.query(
    `
    INSERT INTO event_proofs (
      event_id,
      proof_hash,
      created_at
    )
    VALUES ($1, $2, NOW())
  `,
    [event.event_id, proofHash]
  )
}