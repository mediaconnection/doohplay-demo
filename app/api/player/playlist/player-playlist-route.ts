import { NextRequest, NextResponse } from "next/server"
import { pool } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code")?.trim().toUpperCase()

  if (!code) {
    return NextResponse.json({ error: "player_code obrigatório" }, { status: 400 })
  }

  try {
    // Buscar player
    const playerRes = await pool.query(
      `SELECT id, name, location, is_active FROM players WHERE player_code = $1 LIMIT 1`,
      [code]
    )
    const player = playerRes.rows[0]
    if (!player) {
      return NextResponse.json({ error: "Player não encontrado" }, { status: 404 })
    }
    if (!player.is_active) {
      return NextResponse.json({ error: "Player inativo" }, { status: 403 })
    }

    // Buscar campanhas ativas com mídias para este player
    const playlistRes = await pool.query(`
      SELECT
        c.id AS campaign_id,
        c.name AS campaign_name,
        c.duration_seconds,
        c.media_url,
        c.media_type,
        c.priority,
        mf.id AS media_file_id,
        mf.url AS media_file_url,
        mf.duration_seconds AS media_duration,
        mf.media_type AS media_file_type,
        mf.file_name
      FROM campaigns c
      LEFT JOIN campaign_assets ca ON ca.campaign_id = c.id
      LEFT JOIN campaign_media cm ON cm.campaign_id = c.id
      LEFT JOIN media_files mf ON mf.id = ca.media_id OR mf.id = cm.media_id
      WHERE c.is_active = true
        AND (c.start_date IS NULL OR c.start_date <= NOW())
        AND (c.end_date IS NULL OR c.end_date >= NOW())
        AND (
          c.player_code = $1
          OR EXISTS (
            SELECT 1 FROM player_campaigns pc WHERE pc.player_id = $2 AND pc.campaign_id = c.id
          )
          OR c.player_code IS NULL
        )
      ORDER BY c.priority DESC NULLS LAST, c.created_at DESC
      LIMIT 20
    `, [code, player.id])

    // Montar playlist — usa media_file_url se disponível, senão media_url da campanha
    const items = playlistRes.rows
      .filter(r => r.media_file_url || r.media_url)
      .map(r => ({
        campaign_id: r.campaign_id,
        campaign_name: r.campaign_name,
        media_id: r.media_file_id ?? null,
        url: r.media_file_url ?? r.media_url,
        type: r.media_file_type ?? r.media_type ?? "video",
        duration: r.media_duration ?? r.duration_seconds ?? 30,
        file_name: r.file_name ?? null,
      }))

    // Se não há mídias cadastradas, retorna playlist de demo
    const playlist = items.length > 0 ? items : [
      {
        campaign_id: "aaaaaaaa-0001-0001-0001-000000000001",
        campaign_name: "Demo — Barbearia Zimermam",
        media_id: null,
        url: "https://doohplay-demo.onrender.com/demo/zimermam-ad.mp4",
        type: "video",
        duration: 30,
        file_name: "demo.mp4",
      }
    ]

    // Atualizar last_ping do player
    await pool.query(
      `UPDATE players SET last_ping = NOW() WHERE id = $1`,
      [player.id]
    ).catch(() => {})

    return NextResponse.json({
      ok: true,
      player: {
        id: player.id,
        name: player.name,
        location: player.location,
        code,
      },
      playlist,
      generated_at: new Date().toISOString(),
    })
  } catch (err) {
    console.error("Playlist error:", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
