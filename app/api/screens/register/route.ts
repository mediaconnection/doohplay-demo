export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0


export async function POST(req: Request) {
    const { pool } = await import("@/lib/db")


  const body = await req.json()

  const res = await pool.query(`
    insert into screens (
      name,
      operator,
      latitude,
      longitude,
      city,
      country
    )
    values ($1,$2,$3,$4,$5,$6)
    returning *
  `, [
    body.name,
    body.operator,
    body.latitude,
    body.longitude,
    body.city,
    body.country
  ])

  return Response.json({
    success: true,
    screen: res.rows[0]
  })

}

