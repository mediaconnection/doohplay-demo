// /lib/domain/fraud/detectCluster.ts

import { pool } from "@/lib/db"

export async function detectFraudCluster(clientId: number) {

  const res = await pool.query(`
    SELECT ip, COUNT(DISTINCT client_id) as clients
    FROM fraud_edges
    WHERE ip IN (
      SELECT ip FROM fraud_edges WHERE client_id = $1
    )
    GROUP BY ip
    HAVING COUNT(DISTINCT client_id) >= 3
  `, [clientId])

  return res.rows
}