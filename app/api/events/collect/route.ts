export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

// app/api/events/collect/route.ts


export async function POST(req:Request){
    const { pool } = await import("@/lib/db")
    const { publishEvent } = await import("@/lib/queue")


  const body = await req.json()

  const id = crypto.randomUUID()

  await pool.query(`
    INSERT INTO raw_events (id, payload, received_at)
    VALUES ($1,$2,NOW())
  `,[id, body])

  await publishEvent({
    id,
    ...body
  })

  return Response.json({ ok:true, id })
}

