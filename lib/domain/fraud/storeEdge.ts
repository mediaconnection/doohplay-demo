// /lib/domain/fraud/storeEdge.ts

import { pool } from "@/lib/db"

export async function storeFraudEdge(
  clientId: number,
  fingerprint: { ip: string; device: string }
) {
  await pool.query(
    `
    INSERT INTO fraud_edges (client_id, ip, device)
    VALUES ($1, $2, $3)
    `,
    [clientId, fingerprint.ip, fingerprint.device]
  )
}