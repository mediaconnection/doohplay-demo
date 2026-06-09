import { NextRequest, NextResponse } from "next/server"
import { getPool } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(_req: NextRequest, { params }: { params: { code: string } }) {
  const code = params.code?.toUpperCase()
  if (!code) return NextResponse.json({ ok: false, error: "code required" }, { status: 400 })

  const pool = getPool()

  try {
    // Client info
    const cr = await pool.query(
      `SELECT id::text, code, name, business_type, address, player_id::text, active
       FROM studio_clients WHERE code = $1 LIMIT 1`,
      [code]
    )
    const client = cr.rows[0]
    if (!client) return NextResponse.json({ ok: false, error: "not found" }, { status: 404 })

    let player = null
    let stats = { total_plays: 0, plays_today: 0, plays_week: 0, plays_month: 0, total_seconds: 0, last_play: null }

    if (client.player_id) {
      const [pr, sr] = await Promise.all([
        pool.query(
          `SELECT id::text, last_seen::text, sla_30d, trust_score FROM players WHERE id = $1 LIMIT 1`,
          [client.player_id]
        ),
        pool.query(
          `SELECT
             COUNT(*)::int AS total_plays,
             COUNT(*) FILTER (WHERE played_at >= CURRENT_DATE)::int AS plays_today,
             COUNT(*) FILTER (WHERE played_at >= CURRENT_DATE - INTERVAL '7 days')::int AS plays_week,
             COUNT(*) FILTER (WHERE played_at >= DATE_TRUNC('month', CURRENT_DATE))::int AS plays_month,
             COALESCE(SUM(duration), 0)::int AS total_seconds,
             MAX(played_at)::text AS last_play
           FROM display_events WHERE player_id = $1`,
          [client.player_id]
        ),
      ])
      player = pr.rows[0] ?? null
      stats = sr.rows[0] ?? stats
    }

    const online = player?.last_seen
      ? (Date.now() - new Date(player.last_seen).getTime()) < 3 * 60 * 1000
      : false

    return NextResponse.json({
      ok: true,
      client: { ...client },
      player: player ? { ...player, online } : null,
      stats,
    })
  } catch (err) {
    console.error("[portal/api] error:", err)
    return NextResponse.json({ ok: false, error: "db error" }, { status: 500 })
  }
}
