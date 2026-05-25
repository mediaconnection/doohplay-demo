export const dynamic = 'force-dynamic';
import { pool } from "@/lib/db"

export async function GET() {

  /*
  TOTAL IMPRESSIONS
  */

  const totalImpressions = await pool.query(`
    select count(*) as count
    from impressions
  `)

  /*
  VERIFIED IMPRESSIONS
  */

  const verifiedImpressions = await pool.query(`
    select count(*) as count
    from proof_nodes
    where node_type = 'impression'
  `)

  /*
  ANCHORED IMPRESSIONS
  */

  const anchoredImpressions = await pool.query(`
    select count(*) as count
    from proof_edges
    where relation = 'ANCHORED_IN'
  `)

  /*
  TRUST SCORE
  */

  const trustScore = await pool.query(`
    select avg(score) as avg
    from trust_scores
    where entity_type = 'impression'
  `)

  /*
  DAILY IMPRESSIONS
  */

  const dailyImpressions = await pool.query(`
    select
      date(played_at) as date,
      count(*) as count
    from impressions
    group by date(played_at)
    order by date(played_at) desc
    limit 14
  `)

  /*
  CAMPAIGN PERFORMANCE
  */

  const campaigns = await pool.query(`
    select
      c.id,
      c.name,
      count(i.id) as impressions
    from campaigns c
    left join impressions i
      on i.campaign_id = c.id
    group by c.id
    order by impressions desc
    limit 20
  `)

  /*
  TRUST PER CAMPAIGN
  */

  const trustPerCampaign = await pool.query(`
    select
      entity_id,
      avg(score) as trust_score
    from trust_scores
    where entity_type = 'impression'
    group by entity_id
  `)

  /*
  MERGE CAMPAIGN DATA
  */

  const campaignMap: Record<string, any> = {}

  campaigns.rows.forEach((c: any) => {

    campaignMap[c.id] = {
      id: c.id,
      name: c.name,
      impressions: Number(c.impressions),
      verified: 0,
      trust_score: 0
    }

  })

  trustPerCampaign.rows.forEach((t: any) => {

    if (campaignMap[t.entity_id]) {

      campaignMap[t.entity_id].trust_score =
        Number(t.trust_score)

    }

  })

  const campaignList = Object.values(campaignMap)

  return Response.json({

    total_impressions: Number(
      totalImpressions.rows[0].count
    ),

    verified_impressions: Number(
      verifiedImpressions.rows[0].count
    ),

    anchored_impressions: Number(
      anchoredImpressions.rows[0].count
    ),

    avg_trust_score: Number(
      trustScore.rows[0].avg || 0
    ),

    daily_impressions: dailyImpressions.rows.map(
      (d: any) => ({
        date: d.date,
        count: Number(d.count)
      })
    ),

    campaigns: campaignList

  })

}
