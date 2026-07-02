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
  const playerId = req.nextUrl.searchParams.get("player_id")
  const pool = getPool()
  try {
    // Conteúdo diferente por tela física (V1, 30/06/2026) — retrocompatível:
    // sem player_id na query, ou tela com same_content=true (padrão), tudo
    // funciona exatamente como antes. Só quando o dono explicitamente marca
    // uma tela como same_content=false é que a playlist passa a filtrar só
    // mídia atribuída àquela tela (playlist_schedule.screen_id).
    let screenId: string | null = null
    let sameContent = true
    if (playerId) {
      const screenRes = await pool.query(
        `SELECT id, same_content FROM client_screens WHERE player_id = $1 LIMIT 1`,
        [playerId]
      )
      if (screenRes.rows[0]) {
        screenId = screenRes.rows[0].id
        sameContent = screenRes.rows[0].same_content
      }
    }

    // ── Dono + Anunciante (CampaignMedia, distinguidos por content_source) ──
    // Mantém o agendamento (playlist_schedule) que o dono configura no dashboard.
    const ownAndAdsQuery = pool.query(`
      SELECT
        cm.id,
        cm.name,
        cm.type,
        cm.url                          AS asset_url,
        cm.status,
        CASE WHEN cm.content_source = 'exemplo' THEN 'dono' ELSE cm.content_source END AS slot_category,
        cm."createdAt"                  AS created_at,
        COALESCE(ps.position,
          ROW_NUMBER() OVER (ORDER BY cm."createdAt" ASC)::int) AS position,
        COALESCE(ps.duration, 15)       AS duration,
        COALESCE(ps.active,   true)     AS active,
        ps.days_of_week,
        ps.start_time::text,
        ps.end_time::text,
        ps.start_date::text,
        ps.end_date::text,
        ps.screen_id
      FROM "CampaignMedia" cm
      JOIN "Campaign" c ON c.id = cm."campaignId"
      LEFT JOIN playlist_schedule ps
        ON ps.media_id = cm.id AND ps.client_code = $1
      WHERE c."advertiserCode" = $1
        AND ($2::boolean OR ps.screen_id = $3::uuid)
      ORDER BY COALESCE(ps.position, 999), cm."createdAt" ASC
    `, [upperCode, sameContent, screenId])

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
    // Filtro de agendamento (data + horário + dia da semana) aplicado aqui,
    // no SQL, e não no player — é o único ponto que TODOS os players (web,
    // Android nativo, Fire Stick) atravessam antes de exibir. Horário
    // comparado em America/Sao_Paulo, já que o Postgres roda em UTC.
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
        im.days_of_week,
        im.start_time::text,
        im.end_time::text,
        im.start_date::text,
        im.end_date::text
      FROM institutional_media im
      WHERE im.active = true
        AND im.start_date <= (NOW() AT TIME ZONE 'America/Sao_Paulo')::date
        AND im.end_date   >= (NOW() AT TIME ZONE 'America/Sao_Paulo')::date
        AND (
          im.start_time IS NULL OR im.end_time IS NULL
          OR (NOW() AT TIME ZONE 'America/Sao_Paulo')::time BETWEEN im.start_time AND im.end_time
        )
        AND (
          im.days_of_week IS NULL OR array_length(im.days_of_week, 1) IS NULL
          OR (ARRAY['sun','mon','tue','wed','thu','fri','sat'])[
               EXTRACT(DOW FROM (NOW() AT TIME ZONE 'America/Sao_Paulo'))::int + 1
             ] = ANY(im.days_of_week)
        )
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

    const client = await pool.query(
      `SELECT name FROM studio_clients WHERE UPPER(code) = $1 LIMIT 1`,
      [upperCode]
    ).catch(() => ({ rows: [] as any[] }))

    return NextResponse.json({
      ok: true,
      name: client.rows[0]?.name ?? upperCode,
      items,
      // "slides" e "playlist" são aliases do mesmo array — mantidos para
      // compatibilidade com clientes (player web antigo, app Android nativo)
      // que possam esperar a lista sob nomes de campo diferentes.
      slides: items,
      playlist: items,
      generated_at: new Date().toISOString(),
    })
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

      // Sincroniza agendamento com a fundação unificada (Fase 1) — best-effort.
      // Só atualiza placements_v2 (posição/ativo/agendamento); não mexe em
      // nome/url/tipo (creative_assets_v2), que são gerenciados no upload.
      // Nota: duration aqui é um override específico do client_code, não
      // sincronizado pra creative_assets_v2.duration_seconds — limitação
      // conhecida, sem impacto prático hoje (BARBE332 não usa esse override).
      pool.query(`
        UPDATE placements_v2
        SET position = $1, active = $2, days_of_week = $3,
            start_time = $4, end_time = $5, start_date = $6, end_date = $7
        WHERE source_table = 'playlist_schedule' AND source_id = $8
      `, [
        item.position ?? 0, item.active ?? true, item.days_of_week ?? null,
        item.start_time ?? null, item.end_time ?? null,
        item.start_date ?? null, item.end_date ?? null,
        `${code.toUpperCase()}:${item.id}`,
      ]).catch((e: any) => console.error("[unifiedSync] playlist PATCH sync failed:", e))
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[playlist PATCH]", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
