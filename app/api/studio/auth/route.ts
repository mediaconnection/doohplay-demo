// app/api/studio/auth/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getPool } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code")?.trim().toUpperCase()
  if (!code) return NextResponse.json({ ok: false, error: "code required" }, { status: 400 })

  try {
    const pool = getPool()
    const r = await pool.query(
      `SELECT id, name, business_type, primary_color, playlist_id::text FROM studio_clients WHERE code = $1 AND active = true LIMIT 1`,
      [code]
    )
    if (!r.rows[0]) return NextResponse.json({ ok: false }, { status: 401 })
    return NextResponse.json({ ok: true, client: r.rows[0] })
  } catch {
    return NextResponse.json({ ok: false, error: "db error" }, { status: 500 })
  }
}
