export const dynamic = 'force-dynamic';
import { pool } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)

  const q = searchParams.get("q") || ""
  const page = parseInt(searchParams.get("page") || "1")
  const limit = 20
  const offset = (page - 1) * limit

  const where = q ? `WHERE name ILIKE $1` : ""

  const values = q
    ? [`%${q}%`, limit, offset]
    : [limit, offset]

  const result = await pool.query(
    `
    SELECT id, name, status, events, score
    FROM clients
    ${where}
    ORDER BY created_at DESC
    LIMIT $${q ? 2 : 1}
    OFFSET $${q ? 3 : 2}
    `,
    values
  )

  return NextResponse.json(result.rows)
}
