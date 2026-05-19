import { pool } from "@/lib/db"
import { selectBestScreen } from "@/lib/optimizer/selectBestScreen"

export async function selectCreative(
  screenId: string
) {

  const screen = await selectBestScreen("auto")

  if (!screen) {
    return null
  }

  const res = await pool.query(`
    select c.*
    from creatives c
    join campaigns ca
      on ca.id = c.campaign_id
    where
      now() between ca.start_date and ca.end_date
    order by random()
    limit 1
  `)

  if (res.rowCount === 0) {
    return null
  }

  return res.rows[0]

}