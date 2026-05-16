import { pool } from "@/lib/db"

interface ReputationResult {

  entity_type: string
  entity_id: string

  reputation_score: number

  impressions_count: number
  verified_impressions: number
  anchored_impressions: number

  trust_avg: number

}

export async function calculateReputationScore(
  type: "screen" | "campaign" | "network",
  id: string
): Promise<ReputationResult> {

  let impressionsQuery = ""
  let params: any[] = []

  if (type === "screen") {

    impressionsQuery = `
      select id
      from impressions
      where screen_id = $1
    `

    params = [id]

  } else if (type === "campaign") {

    impressionsQuery = `
      select id
      from impressions
      where campaign_id = $1
    `

    params = [id]

  } else {

    impressionsQuery = `
      select id
      from impressions
    `
  }

  const impressions = await pool.query(impressionsQuery, params)

  const impressionsCount = impressions.rowCount

  const verified = await pool.query(`
    select count(*)
    from proof_nodes
    where node_type = 'impression'
    and ref_id = any($1)
  `, [impressions.rows.map((i: Record<string, unknown>) => i.id)])

  const anchored = await pool.query(`
    select count(*)
    from proof_edges pe
    join proof_nodes pn
      on pn.node_id = pe.from_node
    where pn.node_type = 'block'
    and pe.relation = 'ANCHORED_IN'
  `)

  const trust = await pool.query(`
    select avg(score)
    from trust_scores
    where entity_type = 'impression'
    and entity_id = any($1)
  `, [impressions.rows.map((i: Record<string, unknown>) => i.id)])

  const verifiedCount = Number(verified.rows[0].count)
  const anchoredCount = Number(anchored.rows[0].count)
  const trustAvg = Number(trust.rows[0].avg || 0)

  /*
  Score calculation
  */

  const verificationRate =
    impressionsCount > 0
      ? verifiedCount / impressionsCount
      : 0

  const anchorRate =
    impressionsCount > 0
      ? anchoredCount / impressionsCount
      : 0

  const reputationScore =
    Math.round(
      (verificationRate * 40) +
      (anchorRate * 30) +
      (trustAvg * 0.3)
    )

  await pool.query(`
    insert into reputation_scores (
      entity_type,
      entity_id,
      reputation_score,
      impressions_count,
      verified_impressions,
      anchored_impressions,
      trust_avg
    )
    values ($1,$2,$3,$4,$5,$6,$7)
    on conflict (entity_type, entity_id)
    do update set
      reputation_score = excluded.reputation_score,
      impressions_count = excluded.impressions_count,
      verified_impressions = excluded.verified_impressions,
      anchored_impressions = excluded.anchored_impressions,
      trust_avg = excluded.trust_avg
  `, [
    type,
    id,
    reputationScore,
    impressionsCount,
    verifiedCount,
    anchoredCount,
    trustAvg
  ])

  return {
    entity_type: type,
    entity_id: id,
    reputation_score: reputationScore,
    impressions_count: impressionsCount,
    verified_impressions: verifiedCount,
    anchored_impressions: anchoredCount,
    trust_avg: trustAvg
  }

}