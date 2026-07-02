// app/api/admin/verify-migration/[code]/route.ts
// Somente leitura. Roda a lógica ANTIGA (Campaign/CampaignMedia/playlist_schedule
// + institutional_media) e a lógica NOVA (campaigns_v2/creative_assets_v2/
// placements_v2) lado a lado, pro mesmo client_code, e devolve um diff.
// Não altera nada. Serve pra provar paridade antes do corte real no player.
//
// Cobre: dono + institucional (migrados na Fase 1).
// NÃO cobre: rede (network_media) e anunciante real (CampaignScreen) —
// ambos com 0 registros em produção hoje, fora do escopo da Fase 1.
import { NextRequest, NextResponse } from "next/server"
import { getPool } from "@/lib/db"

export const dynamic = "force-dynamic"

function checkAuth(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret")
  return secret && secret === process.env.ADMIN_SECRET
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  if (!checkAuth(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const { code } = await params
  const upperCode = code.toUpperCase()
  const pool = getPool()

  try {
    // ── ANTIGO (exatamente o que app/api/client/playlist/[code]/route.ts usa hoje) ──
    const oldOwnAndAds = pool.query(`
      SELECT
        cm.id, cm.name, cm.type, cm.url AS asset_url,
        CASE WHEN cm.content_source = 'exemplo' THEN 'dono' ELSE cm.content_source END AS slot_category,
        COALESCE(ps.position, ROW_NUMBER() OVER (ORDER BY cm."createdAt" ASC)::int) AS position,
        COALESCE(ps.duration, 15) AS duration,
        COALESCE(ps.active, true) AS active
      FROM "CampaignMedia" cm
      JOIN "Campaign" c ON c.id = cm."campaignId"
      LEFT JOIN playlist_schedule ps ON ps.media_id = cm.id AND ps.client_code = $1
      WHERE c."advertiserCode" = $1
      ORDER BY COALESCE(ps.position, 999), cm."createdAt" ASC
    `, [upperCode])

    const oldInstitutional = pool.query(`
      SELECT im.id, im.name, im.type, im.url AS asset_url, 'institucional' AS slot_category,
             im.position, im.duration, im.active
      FROM institutional_media im
      WHERE im.active = true
        AND im.start_date <= (NOW() AT TIME ZONE 'America/Sao_Paulo')::date
        AND im.end_date   >= (NOW() AT TIME ZONE 'America/Sao_Paulo')::date
        AND (im.start_time IS NULL OR im.end_time IS NULL
             OR (NOW() AT TIME ZONE 'America/Sao_Paulo')::time BETWEEN im.start_time AND im.end_time)
        AND (im.days_of_week IS NULL OR array_length(im.days_of_week,1) IS NULL
             OR (ARRAY['sun','mon','tue','wed','thu','fri','sat'])[
                  EXTRACT(DOW FROM (NOW() AT TIME ZONE 'America/Sao_Paulo'))::int + 1
                ] = ANY(im.days_of_week))
      ORDER BY im.position ASC
    `)

    // ── NOVO (fundação unificada) ──
    const newUnified = pool.query(`
      SELECT
        ca.source_id AS id, ca.name, ca.type, ca.url AS asset_url,
        cv.owner_type AS slot_category,
        p.position, ca.duration_seconds AS duration, p.active
      FROM placements_v2 p
      JOIN creative_assets_v2 ca ON ca.id = p.creative_asset_id
      JOIN campaigns_v2 cv ON cv.id = ca.campaign_id
      WHERE
        (cv.owner_type = 'dono' AND cv.owner_code = $1)
        OR (
          cv.owner_type = 'institucional'
          AND p.active = true
          AND p.start_date <= (NOW() AT TIME ZONE 'America/Sao_Paulo')::date
          AND p.end_date   >= (NOW() AT TIME ZONE 'America/Sao_Paulo')::date
          AND (p.start_time IS NULL OR p.end_time IS NULL
               OR (NOW() AT TIME ZONE 'America/Sao_Paulo')::time BETWEEN p.start_time AND p.end_time)
          AND (p.days_of_week IS NULL OR array_length(p.days_of_week,1) IS NULL
               OR (ARRAY['sun','mon','tue','wed','thu','fri','sat'])[
                    EXTRACT(DOW FROM (NOW() AT TIME ZONE 'America/Sao_Paulo'))::int + 1
                  ] = ANY(p.days_of_week))
        )
      ORDER BY p.position ASC
    `, [upperCode])

    const [ownAndAds, institutionalOld, unified] = await Promise.all([
      oldOwnAndAds, oldInstitutional, newUnified,
    ])

    const oldItems = [...ownAndAds.rows, ...institutionalOld.rows] as any[]
    const newItems = unified.rows as any[]

    const oldIds = new Set(oldItems.map((i: any) => String(i.id)))
    const newIds = new Set(newItems.map((i: any) => String(i.id)))

    const missingInNew = [...oldIds].filter((id: string) => !newIds.has(id))
    const extraInNew   = [...newIds].filter((id: string) => !oldIds.has(id))

    // Compara campos item a item pros que existem nos dois lados
    const fieldDiffs: any[] = []
    for (const oldItem of oldItems) {
      const newItem = newItems.find((n: any) => String(n.id) === String(oldItem.id))
      if (!newItem) continue
      const diffs: Record<string, [any, any]> = {}
      for (const field of ["name", "type", "asset_url", "slot_category", "position", "duration", "active"]) {
        if (String(oldItem[field]) !== String(newItem[field])) {
          diffs[field] = [oldItem[field], newItem[field]]
        }
      }
      if (Object.keys(diffs).length > 0) {
        fieldDiffs.push({ id: oldItem.id, diffs })
      }
    }

    const parity = missingInNew.length === 0 && extraInNew.length === 0 && fieldDiffs.length === 0

    return NextResponse.json({
      client_code: upperCode,
      parity,
      old_count: oldItems.length,
      new_count: newItems.length,
      missing_in_new: missingInNew,   // existe no sistema antigo, sumiu na fundação nova
      extra_in_new: extraInNew,       // existe na fundação nova, não existe no antigo
      field_diffs: fieldDiffs,        // mesmo id, campos diferentes
      note: parity
        ? "✅ Paridade total — os dois sistemas retornam exatamente o mesmo conteúdo."
        : "⚠️ Diferenças encontradas — NÃO fazer o corte de código até isso zerar.",
    })
  } catch (err: any) {
    console.error("[admin/verify-migration GET]", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
