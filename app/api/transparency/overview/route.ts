export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0


export async function GET() {
    const { pool } = await import("@/lib/db")


  const screens = await pool.query(`
    select count(*) from screens
  `)

  const campaigns = await pool.query(`
    select count(*) from campaigns
  `)

  const impressions = await pool.query(`
    select count(*) from impressions
  `)

  const anchored = await pool.query(`
    select count(*)
    from proof_edges
    where relation = 'ANCHORED_IN'
  `)

  const avgTrust = await pool.query(`
    select avg(score)
    from trust_scores
    where entity_type = 'impression'
  `)

  const topScreens = await pool.query(`
    select entity_id, reputation_score
    from reputation_scores
    where entity_type = 'screen'
    order by reputation_score desc
    limit 10
  `)

  const topCampaigns = await pool.query(`
    select entity_id, score
    from trust_scores
    where entity_type = 'campaign'
    order by score desc
    limit 10
  `)

  return Response.json({
    screens: Number(screens.rows[0].count),
    campaigns: Number(campaigns.rows[0].count),
    impressions: Number(impressions.rows[0].count),
    anchored_impressions: Number(anchored.rows[0].count),
    avg_trust_score: Number(avgTrust.rows[0].avg || 0),
    top_screens: topScreens.rows,
    top_campaigns: topCampaigns.rows
  })

}

