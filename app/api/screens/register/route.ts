import { pool } from "@/lib/db"

export async function POST(req: Request) {

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