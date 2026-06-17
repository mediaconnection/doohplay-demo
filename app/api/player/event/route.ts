// app/api/player/event/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getPool } from "@/lib/db"
import { randomUUID } from "crypto"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  const pool = getPool()
  try {
    const { media_id, screen_code, played_at, asset_url, duration } = await req.json()
    if (!screen_code) return NextResponse.json({ error: "screen_code obrigatório" }, { status: 400 })

    // Busca player_id do cliente
    const { rows } = await pool.query(`
      SELECT player_id::text FROM studio_clients
      WHERE UPPER(code) = UPPER($1) AND player_id IS NOT NULL
      LIMIT 1
    `, [screen_code])

    if (!rows[0]?.player_id) return NextResponse.json({ ok: true, skipped: "sem player" })

    const playedAt  = played_at ?? new Date().toISOString()
    const id        = randomUUID()
    // event_hash único baseado em player + mídia + timestamp
    const eventHash = Buffer.from(`${rows[0].player_id}:${media_id ?? ""}:${playedAt}`).toString("base64")

    await pool.query(`
      INSERT INTO display_events (id, player_id, media_id, played_at, event_hash, asset_url, duration)
      VALUES ($1::uuid, $2::uuid, $3::uuid, $4::timestamptz, $5, $6, $7)
      ON CONFLICT DO NOTHING
    `, [
      id,
      rows[0].player_id,
      media_id ?? null,
      playedAt,
      eventHash,
      asset_url ?? null,
      duration ?? null,
    ])

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[player/event]", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
