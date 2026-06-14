// app/api/client/playlist/[code]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getPool } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const pool = getPool()

  try {
    // Busca mídias com posição da playlist_schedule (ou ordem padrão)
    const { rows } = await pool.query(`
      SELECT
        cm.id,
        cm.name,
        cm.type,
        cm.url        AS asset_url,
        cm.status,
        cm."createdAt" AS created_at,
        COALESCE(ps.position, ROW_NUMBER() OVER (ORDER BY cm."createdAt" ASC)::int) AS position,
        COALESCE(ps.period,   'all')  AS period,
        COALESCE(ps.duration, 15)     AS duration,
        COALESCE(ps.active,   true)   AS active
      FROM "CampaignMedia" cm
      JOIN "Campaign" c ON c.id = cm."campaignId"
      LEFT JOIN playlist_schedule ps ON ps.media_id = cm.id AND ps.client_code = $1
      WHERE c."advertiserCode" = $1
      ORDER BY COALESCE(ps.position, 999), cm."createdAt" ASC
    `, [code.toUpperCase()])

    return NextResponse.json({ items: rows })
  } catch (err) {
    console.error("[playlist GET]", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const pool = getPool()

  try {
    const { items } = await req.json()
    // items: [{ id, position, period, duration, active }]

    for (const item of items) {
      await pool.query(`
        INSERT INTO playlist_schedule (client_code, media_id, position, period, duration, active)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (client_code, media_id) DO UPDATE SET
          position  = EXCLUDED.position,
          period    = EXCLUDED.period,
          duration  = EXCLUDED.duration,
          active    = EXCLUDED.active
      `, [code.toUpperCase(), item.id, item.position, item.period ?? 'all', item.duration ?? 15, item.active ?? true])
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[playlist PATCH]", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
