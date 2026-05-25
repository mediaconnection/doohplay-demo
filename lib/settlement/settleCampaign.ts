// @ts-nocheck
import { pool } from "@/lib/db"

export async function settleCampaign(campaignId: string) {

  const impressions = await pool.query(`
    select id
    from impressions
    where campaign_id = $1
  `, [campaignId])

  let total = 0

  for (const imp of impressions.rows) {

    total++

  }

  return {
    campaign_id: campaignId,
    impressions: total
  }

}
