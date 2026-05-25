// @ts-nocheck
import { pool } from "@/lib/db"

export async function mintMediaToken(
  campaignId: string,
  impressions: number,
  proofRoot: string,
  owner: string
) {

  const res = await pool.query(`
    insert into media_tokens (
      campaign_id,
      impressions,
      proof_root,
      owner
    )
    values ($1,$2,$3,$4)
    returning *
  `, [
    campaignId,
    impressions,
    proofRoot,
    owner
  ])

  return res.rows[0]

}
