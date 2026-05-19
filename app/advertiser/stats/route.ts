import { pool } from "@/lib/db"

export async function GET() {

  const campaigns = await pool.query(`
    select count(*) from campaigns
  `)

  const impressions = await pool.query(`
    select count(*) from impressions
  `)

  const proofs = await pool.query(`
    select count(*) from proof_nodes
    where node_type = 'impression'
  `)

  const trust = await pool.query(`
    select avg(score)
    from trust_scores
    where entity_type = 'impression'
  `)

  return Response.json({
    campaigns: Number(campaigns.rows[0].count),
    impressions: Number(impressions.rows[0].count),
    proofs: Number(proofs.rows[0].count),
    trust: Number(trust.rows[0].avg || 0)
  })

}