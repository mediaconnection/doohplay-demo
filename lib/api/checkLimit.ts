import { pool } from "@/lib/db"

export async function checkLimit(apiKey: string) {
  const keyRes = await pool.query(
    `SELECT monthly_limit FROM api_keys WHERE api_key = $1`,
    [apiKey]
  )

  if (!keyRes.rows.length) return { allowed: false }

  const limit = keyRes.rows[0].monthly_limit

  const usageRes = await pool.query(
    `
    SELECT COUNT(*) 
    FROM api_usage
    WHERE api_key = $1
    AND created_at >= date_trunc('month', NOW())
    `,
    [apiKey]
  )

  const used = Number(usageRes.rows[0].count)

  return {
    allowed: used < limit,
    used,
    limit
  }
}