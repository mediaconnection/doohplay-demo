// @ts-nocheck
import { pool } from "@/lib/db"

export async function getBaseline(campaignId: string) {
  const res = await pool.query(
    `
    SELECT COUNT(*)::int as count
    FROM event_chain
    WHERE campaign_id = $1
      AND created_at >= NOW() - INTERVAL '24 hours'
    `,
    [campaignId]
  )

  const total = res.rows[0]?.count || 0

  // média por hora
  return total / 24
}
