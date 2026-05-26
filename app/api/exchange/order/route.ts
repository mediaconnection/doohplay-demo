export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0


export async function POST(req: Request) {
    const { pool } = await import("@/lib/db")


  const body = await req.json()

  const order = await pool.query(`
    insert into media_orders (
      campaign_id,
      token_id,
      side,
      price,
      quantity
    )
    values ($1,$2,$3,$4,$5)
    returning *
  `, [
    body.campaign_id,
    body.token_id,
    body.side,
    body.price,
    body.quantity
  ])

  return Response.json({
    success: true,
    order: order.rows[0]
  })

}

