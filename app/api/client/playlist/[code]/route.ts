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

    // Canal DOOHPLAY (12/07/2026): precisa do business_type do cliente ANTES
    // da query unificada, pra filtrar/rotular o conteúdo institucional
    // segmentado corretamente. Busca junto com o name (já usado no fim da
    // rota) pra não duplicar round-trip.
    const clientInfo = await pool.query(
      `SELECT name, business_type, excluded_general_channels FROM studio_clients WHERE UPPER(code) = $1 LIMIT 1`,
      [upperCode]
    ).catch(() => ({ rows: [] as any[] }))
    const businessType = clientInfo.rows[0]?.business_type ?? null
    // Canal DOOHPLAY (passo 5): canais gerais (Turismo/Diversão) que o
    // dono desligou explicitamente — NULL/vazio (padrão) = recebe todos.
    const excludedChannels: string[] = clientInfo.rows[0]?.excluded_general_channels ?? []

    // ── Dono + Institucional — lidos da fundação unificada (Fase 1, 02/07/2026) ──
    // Substitui as antigas sub-queries separadas (CampaignMedia+playlist_schedule
    // e institutional_media). Migração validada com paridade 100% via
    // /api/admin/verify-migration/[code] antes deste corte (13=13, BARBE332).
    // Escrita já sincronizada (lib/unifiedSync.ts) em todas as rotas de upload
    // antes deste corte — testado com dado real (02/07/2026).
    // Reversão: git revert deste commit — tabelas antigas continuam intactas.
    const unifiedQuery = pool.query(`
      SELECT
        ca.source_id                    AS id,
        ca.name,
        ca.type,
        ca.url                          AS asset_url,
        ca.status,
        -- Canal DOOHPLAY (12/07/2026): institucional com segmento definido
        -- E que bate com o business_type do cliente vira categoria 'canal'
        -- (20% do tempo). Institucional sem segmento continua 'institucional'
        -- genérico (5%, todas as telas, comportamento de sempre).
        CASE
          WHEN cv.owner_type = 'institucional' AND p.segment_id IS NOT NULL THEN 'canal'
          ELSE cv.owner_type
        END                              AS slot_category,
        ca.display_format,
        ca.created_at,
        p.position,
        ca.duration_seconds             AS duration,
        p.active,
        p.days_of_week,
        p.start_time::text,
        p.end_time::text,
        p.start_date::text,
        p.end_date::text,
        p.screen_id
      FROM placements_v2 p
      JOIN creative_assets_v2 ca ON ca.id = p.creative_asset_id
      JOIN campaigns_v2 cv ON cv.id = ca.campaign_id
      LEFT JOIN inventory_segments_v2 seg ON seg.id = p.segment_id
      WHERE
        (
          cv.owner_type = 'dono' AND cv.owner_code = $1
          AND ($2::boolean OR p.screen_id = $3::uuid OR p.screen_id IS NULL)
        )
        OR (
          cv.owner_type = 'institucional'
          AND p.active = true
          AND p.start_date <= (NOW() AT TIME ZONE 'America/Sao_Paulo')::date
          AND p.end_date   >= (NOW() AT TIME ZONE 'America/Sao_Paulo')::date
          AND (p.start_time IS NULL OR p.end_time IS NULL
               OR (NOW() AT TIME ZONE 'America/Sao_Paulo')::time BETWEEN p.start_time AND p.end_time)
          AND (p.days_of_week IS NULL OR array_length(p.days_of_week, 1) IS NULL
               OR (ARRAY['sun','mon','tue','wed','thu','fri','sat'])[
                    EXTRACT(DOW FROM (NOW() AT TIME ZONE 'America/Sao_Paulo'))::int + 1
                  ] = ANY(p.days_of_week))
          -- Canal DOOHPLAY: sem segmento = institucional genérico, aparece
          -- em toda tela (comportamento de sempre). Com segmento = só
          -- aparece se o business_type do cliente estiver na lista de
          -- tipos do canal (canais amplos: "Beleza" cobre Barbearia +
          -- Salão de Beleza, por exemplo). Segmento definido que NÃO
          -- inclui o tipo do cliente = excluído por completo daqui.
          AND (p.segment_id IS NULL OR seg.criteria_json->'business_types' ? $4::text)
          -- Canal DOOHPLAY (passo 5): dono pode desligar canais GERAIS
          -- específicos (Turismo/Diversão) — canais de segmento nunca
          -- entram nessa lista (a rota de preferências valida isso).
          AND (p.segment_id IS NULL OR NOT (p.segment_id = ANY($5::uuid[])))
        )
      ORDER BY p.position ASC, ca.created_at ASC
    `, [upperCode, sameContent, screenId, businessType, excludedChannels])

    // ── Rede (Clube de Telas) — ainda não migrada pra fundação nova (0 registros
    // em produção hoje, fora do escopo da Fase 1) ──
    const networkQuery = pool.query(`
      SELECT
        nm.id,
        nm.name,
        nm.type,
        nm.url                          AS asset_url,
        nm.status,
        'rede'                          AS slot_category,
        'fullscreen'                     AS display_format,
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

    // ── Anunciante real (CampaignScreen) — ainda não migrada pra fundação nova
    // (0 registros em produção hoje, fora do escopo da Fase 1) ──
    const realAdsQuery = pool.query(`
      SELECT
        cm.id,
        cm.name,
        cm.type,
        cm.url                          AS asset_url,
        cm.status,
        'anunciante'                     AS slot_category,
        'fullscreen'                     AS display_format,
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



    const [unified, network, realAds] = await Promise.all([
      unifiedQuery, networkQuery, realAdsQuery,
    ])

    const items = [
      ...unified.rows,
      ...network.rows,
      ...realAds.rows,
    ]

    const client = clientInfo

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
