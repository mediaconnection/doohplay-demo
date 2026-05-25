// @ts-nocheck
import { pool } from "@/lib/db"

export async function getVerificationHistory(hash: string) {
  const res = await pool.query(`
    SELECT status, trust, created_at
    FROM verification_logs
    WHERE hash = $1
    ORDER BY created_at DESC
    LIMIT 10
  `, [hash])

  return res.rows
}
