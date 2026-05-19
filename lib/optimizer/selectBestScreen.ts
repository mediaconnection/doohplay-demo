import { pool } from "@/lib/db"

export async function selectBestScreen(
  campaignId: string
) {

  const screens = await pool.query(`
    select
      s.id,
      s.city,
      ss.trust_score,
      ss.reputation_score,
      ss.impressions
    from screens s
    left join screen_stats ss
      on ss.screen_id = s.id
    where s.status = 'active'
  `)

  if (screens.rowCount === 0) {
    return null
  }

  let bestScreen = null
  let bestScore = -1

  for (const s of screens.rows) {

    const trust = Number(s.trust_score || 0)
    const reputation = Number(s.reputation_score || 0)
    const impressions = Number(s.impressions || 0)

    const score =
      (trust * 0.4) +
      (reputation * 0.4) +
      (Math.log(impressions + 1) * 0.2)

    if (score > bestScore) {

      bestScore = score
      bestScreen = s

    }

  }

  return bestScreen

}