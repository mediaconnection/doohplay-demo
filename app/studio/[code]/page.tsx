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
      `SELECT id, asset_url, type, duration, position, campaign_id, created_at, starts_at, ends_at
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

// PATCH — reordena itens OU atualiza datas de validade
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, order, item_id, starts_at, ends_at } = body

    if (!code) return NextResponse.json({ error: "code obrigatório" }, { status: 400 })

    const clientRes = await pool.query(
      `SELECT playlist_id FROM studio_clients WHERE code = $1 AND active = true LIMIT 1`,
      [code.trim().toUpperCase()]
    )
    if (!clientRes.rows[0]?.playlist_id) return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 })

    // Modo 1: atualizar datas de um item específico
    if (item_id) {
      await pool.query(
        `UPDATE playlist_items
         SET starts_at = $1, ends_at = $2
         WHERE id = $3 AND playlist_id = $4`,
        [
          starts_at ? new Date(starts_at).toISOString() : null,
          ends_at ? new Date(ends_at).toISOString() : null,
          item_id,
          clientRes.rows[0].playlist_id
        ]
      )
      return NextResponse.json({ ok: true })
    }

    // Modo 2: reordenar itens
    if (Array.isArray(order)) {
      for (let i = 0; i < order.length; i++) {
        await pool.query(
          `UPDATE playlist_items SET position = $1 WHERE id = $2 AND playlist_id = $3`,
          [i + 1, order[i], clientRes.rows[0].playlist_id]
        )
      }
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: "order ou item_id obrigatório" }, { status: 400 })

  } catch (err) {
    console.error("Playlist PATCH error:", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
