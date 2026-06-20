// app/api/client/playlist/[code]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getPool } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const upperCode = code.toUpperCase()
  const pool = getPool()
  try {
    // ── Dono + Anunciante (CampaignMedia, distinguidos por content_source) ──
    // Mantém o agendamento (playlist_schedule) que o dono configura no dashboard.
    const ownAndAdsQuery = pool.query(`
      SELECT
        cm.id,
        cm.name,
        cm.type,
        cm.url                          AS asset_url,
        cm.status,
        cm.content_source               AS slot_category,
        cm."createdAt"                  AS created_at,
        COALESCE(ps.position,
          ROW_NUMBER() OVER (ORDER BY cm."createdAt" ASC)::int) AS position,
        COALESCE(ps.duration, 15)       AS duration,
        COALESCE(ps.active,   true)     AS active,
        ps.days_of_week,
        ps.start_time::text,
        ps.end_time::text,
        ps.start_date::text,
        ps.end_date::text
      FROM "CampaignMedia" cm
      JOIN "Campaign" c ON c.id = cm."campaignId"
      LEFT JOIN playlist_schedule ps
        ON ps.media_id = cm.id AND ps.client_code = $1
      WHERE c."advertiserCode" = $1
      ORDER BY COALESCE(ps.position, 999), cm."createdAt" ASC
    `, [upperCode])

    // ── Rede (Clube de Telas) — mídias de parceiros distribuídas para esta tela ──
    const networkQuery = pool.query(`
      SELECT
        nm.id,
        nm.name,
        nm.type,
        nm.url                          AS asset_url,
        nm.status,
        'rede'                          AS slot_category,
        nm.created_at,
        999                              AS position,
        15                               AS duration,
        true                             AS active,
        NULL::text[]                     AS days_of_week,
        NULL::text                       AS start_time,
        NULL::text                       AS end_time,
        NULL::text                       AS start_date,
        NULL::text                       AS end_date
      FROM network_media_distribution nmd
      JOIN network_media nm ON nm.id = nmd.network_media_id
      WHERE nmd.displayed_on_code = $1
        AND nmd.active = true
        AND nm.status = 'approved'
    `, [upperCode])

    // ── Institucional (DOOHPLAY) — exibido em todas as telas ──
    const institutionalQuery = pool.query(`
      SELECT
        im.id,
        im.name,
        im.type,
        im.url                          AS asset_url,
        'approved'                      AS status,
        'institucional'                 AS slot_category,
        im.created_at,
        im.position,
        im.duration,
        im.active,
        NULL::text[]                     AS days_of_week,
        NULL::text                       AS start_time,
        NULL::text                       AS end_time,
        NULL::text                       AS start_date,
        NULL::text                       AS end_date
      FROM institutional_media im
      WHERE im.active = true
      ORDER BY im.position ASC
    `)

    // ── Anunciante real — campanhas de terceiros vinculadas explicitamente
    // a esta tela via CampaignScreen (fluxo de venda real, separado do
    // upload do próprio dono que usa Campaign "Promoções da Loja").
    const realAdsQuery = pool.query(`
      SELECT
        cm.id,
        cm.name,
        cm.type,
        cm.url                          AS asset_url,
        cm.status,
        'anunciante'                     AS slot_category,
        cm."createdAt"                  AS created_at,
        999                              AS position,
        15                               AS duration,
        true                             AS active,
        NULL::text[]                     AS days_of_week,
        NULL::text                       AS start_time,
        NULL::text                       AS end_time,
        NULL::text                       AS start_date,
        NULL::text                       AS end_date
      FROM "CampaignScreen" cs
      JOIN "Campaign" c ON c.id = cs."campaignId"
      JOIN "CampaignMedia" cm ON cm."campaignId" = c.id
      WHERE cs."screenId" = $1
        AND c.status = 'active'
        AND c."startDate" <= NOW()
        AND c."endDate" >= NOW()
        AND cm.status != 'rejected'
    `, [upperCode])



    const [ownAndAds, network, institutional, realAds] = await Promise.all([
      ownAndAdsQuery, networkQuery, institutionalQuery, realAdsQuery,
    ])

    const items = [
      ...ownAndAds.rows,
      ...network.rows,
      ...institutional.rows,
      ...realAds.rows,
    ]

    return NextResponse.json({ items })
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
    for (const item of items) {
      await pool.query(`
        INSERT INTO playlist_schedule
          (client_code, media_id, position, duration, active,
           days_of_week, start_time, end_time, start_date, end_date)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        ON CONFLICT (client_code, media_id) DO UPDATE SET
          position     = EXCLUDED.position,
          duration     = EXCLUDED.duration,
          active       = EXCLUDED.active,
          days_of_week = EXCLUDED.days_of_week,
          start_time   = EXCLUDED.start_time,
          end_time     = EXCLUDED.end_time,
          start_date   = EXCLUDED.start_date,
          end_date     = EXCLUDED.end_date
      `, [
        code.toUpperCase(),
        item.id,
        item.position ?? 0,
        item.duration ?? 15,
        item.active   ?? true,
        item.days_of_week ?? null,
        item.start_time   ?? null,
        item.end_time     ?? null,
        item.start_date   ?? null,
        item.end_date     ?? null,
      ])
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[playlist PATCH]", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
