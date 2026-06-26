// app/api/player/heartbeat/route.ts
import { getPool } from "@/lib/db"
import { NextRequest } from "next/server"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  const pool = getPool()
  try {
    const body = await req.json()
    // ✅ aceita tanto "code" (APK) quanto "screen_code" (player web)
    const code = body.code ?? body.screen_code
    if (!code) return Response.json({ error: "code obrigatório" }, { status: 400 })

    const result = await pool.query(
      `UPDATE players SET last_ping = NOW()
       WHERE id = (SELECT player_id FROM studio_clients WHERE UPPER(code) = UPPER($1) LIMIT 1)`,
      [code]
    )

    // Antes, isso retornava {ok:true} mesmo se nenhuma linha fosse
    // atualizada (player_id nulo, ou players sem registro correspondente)
    // — escondia silenciosamente um cliente sem heartbeat de verdade.
    if (result.rowCount === 0) {
      console.warn(`[heartbeat] nenhuma linha atualizada para code=${code} — player_id ausente ou inválido em studio_clients`)
      return Response.json({ ok: false, warning: "player_id não encontrado ou inválido para este código" }, { status: 200 })
    }

    return Response.json({ ok: true, ts: new Date().toISOString() })
  } catch (err) {
    console.error("[heartbeat]", err)
    return Response.json({ error: String(err) }, { status: 500 })
  }
}

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
