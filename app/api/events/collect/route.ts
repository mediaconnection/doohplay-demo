export const dynamic = 'force-dynamic';
// app/api/events/collect/route.ts

import { pool } from "@/lib/db"
import { publishEvent } from "@/lib/queue"

export async function POST(req:Request){

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
