import { NextRequest, NextResponse } from "next/server"
import { pool } from "@/lib/db"

export const dynamic = "force-dynamic"

// GET — lista itens da playlist de um cliente
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")?.trim().toUpperCase()

    if (!code) return NextResponse.json({ error: "code obrigatório" }, { status: 400 })

    const clientRes = await pool.query(
      `SELECT playlist_id FROM studio_clients WHERE code = $1 AND active = true LIMIT 1`,
      [code]
    )
    const client = clientRes.rows[0]
    if (!client?.playlist_id) return NextResponse.json({ items: [] })

    const itemsRes = await pool.query(
      `SELECT id, asset_url, type, duration, position, campaign_id, created_at
       FROM playlist_items
       WHERE playlist_id = $1
       ORDER BY position ASC`,
      [client.playlist_id]
    )

    return NextResponse.json({ ok: true, items: itemsRes.rows })
  } catch (err) {
    console.error("Playlist GET error:", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

// DELETE — remove um item da playlist
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get("item_id")
    const code = searchParams.get("code")?.trim().toUpperCase()

    if (!itemId || !code) return NextResponse.json({ error: "item_id e code obrigatórios" }, { status: 400 })

    // Verificar que o item pertence ao cliente
    const check = await pool.query(
      `SELECT pi.id FROM playlist_items pi
       JOIN studio_clients sc ON sc.playlist_id = pi.playlist_id
       WHERE pi.id = $1 AND sc.code = $2`,
      [itemId, code]
    )
    if (!check.rows.length) return NextResponse.json({ error: "Item não encontrado" }, { status: 404 })

    // Deletar item
    await pool.query(`DELETE FROM playlist_items WHERE id = $1`, [itemId])

    // Reordenar posições restantes
    await pool.query(
      `WITH ordered AS (
        SELECT id, ROW_NUMBER() OVER (ORDER BY position ASC) AS new_pos
        FROM playlist_items pi
        JOIN studio_clients sc ON sc.playlist_id = pi.playlist_id
        WHERE sc.code = $1
      )
      UPDATE playlist_items SET position = ordered.new_pos
      FROM ordered WHERE playlist_items.id = ordered.id`,
      [code]
    )

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("Playlist DELETE error:", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

// PATCH — reordena itens (recebe array de ids na nova ordem)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, order } = body // order: string[] — ids na nova sequência

    if (!code || !Array.isArray(order)) {
      return NextResponse.json({ error: "code e order obrigatórios" }, { status: 400 })
    }

    const client = await pool.query(
      `SELECT playlist_id FROM studio_clients WHERE code = $1 AND active = true LIMIT 1`,
      [code.trim().toUpperCase()]
    )
    if (!client.rows[0]?.playlist_id) return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 })

    // Atualizar posições em batch
    for (let i = 0; i < order.length; i++) {
      await pool.query(
        `UPDATE playlist_items SET position = $1 WHERE id = $2 AND playlist_id = $3`,
        [i + 1, order[i], client.rows[0].playlist_id]
      )
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("Playlist PATCH error:", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
