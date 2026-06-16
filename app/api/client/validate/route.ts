// app/api/client/validate/route.ts
import { getPool } from "@/lib/db"
import { NextRequest } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const pool = getPool()
  try {
    const code = req.nextUrl.searchParams.get("code")?.toUpperCase()
    if (!code) return Response.json({ valid: false, error: "code obrigatório" }, { status: 400 })

    const { rows } = await pool.query(
      `SELECT code, name FROM studio_clients WHERE code = $1 AND active = true LIMIT 1`,
      [code]
    )

    if (!rows[0]) return Response.json({ valid: false })

    return Response.json({ valid: true, name: rows[0].name, code: rows[0].code })
  } catch (err) {
    console.error("[validate]", err)
    return Response.json({ valid: false, error: String(err) }, { status: 500 })
  }
}
