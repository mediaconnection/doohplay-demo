import { pool } from "@/lib/db"

export async function GET() {

  const screens = await pool.query(`
    select count(*) from screens
  `)

  const impressions = await pool.query(`
    select count(*) from impressions
  `)

  const proofs = await pool.query(`
    select count(*)
    from proof_nodes
    where node_type = 'impression'
  `)

  const revenue = await pool.query(`
    select sum(amount)
    from settlements
    where status = 'verified'
  `)

  return Response.json({

    screens: Number(screens.rows[0].count),

    impressions: Number(impressions.rows[0].count),

    proofs: Number(proofs.rows[0].count),

    revenue: Number(revenue.rows[0].sum || 0)

  })

}