export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

import crypto from "crypto"

export async function POST(req: Request) {
    const { pool } = await import("@/lib/db")


  const body = await req.json()

  const payload = JSON.stringify(body)

  const hash = crypto
    .createHash("sha256")
    .update(payload)
    .digest("hex")

  const res = await pool.query(`
    insert into evidence (
      type,
      source,
      hash,
      metadata
    )
    values ($1,$2,$3,$4)
    returning *
  `, [
    body.type,
    body.source,
    hash,
    body
  ])

  return Response.json({
    success: true,
    evidence: res.rows[0]
  })

}

