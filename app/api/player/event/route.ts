// app/api/player/event/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getPool } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  const pool = getPool()
  try {
    const { media_id, screen_code, played_at } = await req.json()
    if (!screen_code) return NextResponse.json({ error: "screen_code obrigatório" }, { status: 400 })

    // Busca player_id do cliente
    const { rows } = await pool.query(`
      SELECT player_id::text FROM studio_clients
      WHERE UPPER(code) = UPPER($1) AND player_id IS NOT NULL
      LIMIT 1
    `, [screen_code])

    if (!rows[0]?.player_id) return NextResponse.json({ ok: true, skipped: "sem player" })

    // Registra display event
    await pool.query(`
      INSERT INTO display_events (player_id, played_at)
      VALUES ($1::uuid, $2::timestamptz)
    `, [rows[0].player_id, played_at ?? new Date().toISOString()])

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[player/event]", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
