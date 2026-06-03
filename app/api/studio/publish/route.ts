import { NextRequest, NextResponse } from "next/server"
import { pool } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, asset_url, type, duration, campaign_id, title } = body

    if (!code || !asset_url) {
      return NextResponse.json({ error: "code e asset_url obrigatórios" }, { status: 400 })
    }

    // Buscar cliente
    const clientRes = await pool.query(
      `SELECT * FROM studio_clients WHERE code = $1 AND active = true LIMIT 1`,
      [code.trim().toUpperCase()]
    )
    const client = clientRes.rows[0]
    if (!client) return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 })

    // Se não tem playlist, criar uma
    let playlistId = client.playlist_id
    if (!playlistId) {
      const plRes = await pool.query(
        `INSERT INTO playlists (name, active, created_at) VALUES ($1, true, NOW()) RETURNING id`,
        [`Playlist ${client.name}`]
      )
      playlistId = plRes.rows[0].id

      // Criar screen se não existe
      if (!client.screen_id && client.player_id) {
        const scRes = await pool.query(
          `INSERT INTO screens (name, player_id, playlist_id, status, venue_name, created_at)
           VALUES ($1, $2, $3, 'online', $4, NOW()) RETURNING id`,
          [`Tela ${client.name}`, client.player_id, playlistId, client.name]
        )
        await pool.query(
          `UPDATE studio_clients SET playlist_id = $1, screen_id = $2 WHERE code = $3`,
          [playlistId, scRes.rows[0].id, code.trim().toUpperCase()]
        )
      } else {
        await pool.query(
          `UPDATE studio_clients SET playlist_id = $1 WHERE code = $2`,
          [playlistId, code.trim().toUpperCase()]
        )
      }
    }

    // Contar itens atuais para posição
    const countRes = await pool.query(
      `SELECT COUNT(*)::int AS total FROM playlist_items WHERE playlist_id = $1`,
      [playlistId]
    )
    const position = (countRes.rows[0]?.total ?? 0) + 1

    // Inserir item na playlist
    const itemRes = await pool.query(
      `INSERT INTO playlist_items (playlist_id, asset_url, type, duration, campaign_id, position, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING id`,
      [playlistId, asset_url, type ?? "image", duration ?? 15, campaign_id ?? null, position]
    )

    return NextResponse.json({
      ok: true,
      item_id: itemRes.rows[0].id,
      playlist_id: playlistId,
      position,
      message: `Anúncio "${title}" publicado na playlist!`,
    })
  } catch (err) {
    console.error("Studio publish error:", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
