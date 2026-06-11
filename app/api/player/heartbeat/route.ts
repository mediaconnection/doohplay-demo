// app/api/player/heartbeat/route.ts
import { getPool } from "@/lib/db"
import { NextRequest } from "next/server"

export const dynamic = "force-dynamic"

// POST — player atualiza last_ping (chamado pelo Fire Stick a cada 30s)
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

// GET — dashboard consulta status do player pelo UUID do player
// Chamado pelo hook usePlayerStatus a cada 30s
export async function GET(req: NextRequest) {
  const pool = getPool()
  try {
    const id = req.nextUrl.searchParams.get("id")
    if (!id) return Response.json({ error: "id obrigatório" }, { status: 400 })

    const { rows } = await pool.query(
      `SELECT id::text, last_ping::text, is_active FROM players WHERE id = $1 LIMIT 1`,
      [id]
    )

    if (!rows[0]) return Response.json({ error: "player não encontrado" }, { status: 404 })

    const { last_ping, is_active } = rows[0]
    const online = last_ping
      ? (Date.now() - new Date(last_ping).getTime()) < 3 * 60 * 1000
      : false

    return Response.json({ ok: true, last_ping, online, is_active })
  } catch (err) {
    console.error("[heartbeat/status]", err)
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
