import { getPool } from "@/lib/db"
import { NextRequest } from "next/server"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  const pool = getPool()
  try {
    const { code } = await req.json()
    if (!code) return Response.json({ error: "code obrigatório" }, { status: 400 })

    await pool.query(
      `UPDATE players SET last_ping = NOW()
       WHERE id = (SELECT player_id FROM studio_clients WHERE code = $1 LIMIT 1)`,
      [code.toUpperCase()]
    )

    return Response.json({ ok: true, ts: new Date().toISOString() })
  } catch (err) {
    console.error("[heartbeat]", err)
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
