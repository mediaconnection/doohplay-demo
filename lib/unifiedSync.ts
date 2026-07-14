// lib/unifiedSync.ts
// Mantém campaigns_v2/creative_assets_v2/placements_v2 em dia sempre que
// conteúdo é criado/editado/removido nas tabelas antigas (CampaignMedia,
// playlist_schedule, institutional_media). Criado em 02/07/2026 depois de
// descobrir que a Fase 1 unificou a LEITURA mas não a ESCRITA — sem isso,
// conteúdo novo silenciosamente não apareceria via a fundação nova.
//
// Todas as funções aqui são "best-effort": se o sync falhar, loga o erro
// mas NUNCA derruba a operação principal (upload, edição, etc.) — a tabela
// antiga continua sendo a fonte real até o corte de leitura ser feito.
import type { Pool } from "pg"

// ── Dono / Anunciante direto (CampaignMedia + playlist_schedule) ──────────
export async function syncDonoMediaToUnified(pool: Pool, params: {
  campaignId: string
  ownerCode: string
  campaignName?: string
  mediaId: string
  name: string
  url: string
  type: string            // 'image' | 'video'
  status: string          // status vindo de CampaignMedia.status ('pending','approved','rejected',...)
  durationSeconds?: number
  position?: number
  active?: boolean
  startDate?: string | null
  endDate?: string | null
  startTime?: string | null
  endTime?: string | null
  daysOfWeek?: string[] | null
  screenId?: string | null
}) {
  try {
    const mappedStatus =
      params.status === "rejected" ? "rejected" :
      params.status === "approved" ? "approved" : "pending_review"

    const campaignRes = await pool.query(
      `INSERT INTO campaigns_v2 (owner_type, owner_code, name, status, source_table, source_id)
       VALUES ('dono', $1, $2, 'active', 'Campaign', $3)
       ON CONFLICT (source_table, source_id) DO UPDATE SET owner_code = EXCLUDED.owner_code
       RETURNING id`,
      [params.ownerCode, params.campaignName || "Promoções da Loja", params.campaignId]
    )
    const campaignV2Id = campaignRes.rows[0].id

    const assetRes = await pool.query(
      `INSERT INTO creative_assets_v2
         (campaign_id, name, url, type, display_format, duration_seconds, status, source_table, source_id)
       VALUES ($1,$2,$3,$4,'fullscreen',$5,$6,'CampaignMedia',$7)
       ON CONFLICT (source_table, source_id) DO UPDATE SET
         name = EXCLUDED.name, url = EXCLUDED.url, type = EXCLUDED.type,
         duration_seconds = EXCLUDED.duration_seconds, status = EXCLUDED.status
       RETURNING id`,
      [campaignV2Id, params.name, params.url, params.type, params.durationSeconds ?? 15, mappedStatus, params.mediaId]
    )
    const assetId = assetRes.rows[0].id

    // Convenção de source_id igual à migração original (Fase 1): permite que
    // upload (cria o placement default) e edição de agendamento (PATCH da
    // playlist) apontem pro MESMO registro em placements_v2, sem duplicar.
    const placementSourceId = `${params.ownerCode}:${params.mediaId}`

    await pool.query(
      `INSERT INTO placements_v2
         (creative_asset_id, screen_id, position, start_date, end_date,
          start_time, end_time, days_of_week, active, source_table, source_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'playlist_schedule',$10)
       ON CONFLICT (source_table, source_id) DO UPDATE SET
         screen_id = EXCLUDED.screen_id, position = EXCLUDED.position,
         start_date = EXCLUDED.start_date, end_date = EXCLUDED.end_date,
         start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time,
         days_of_week = EXCLUDED.days_of_week, active = EXCLUDED.active`,
      [assetId, params.screenId ?? null, params.position ?? 0,
       params.startDate ?? null, params.endDate ?? null,
       params.startTime ?? null, params.endTime ?? null, params.daysOfWeek ?? null,
       params.active ?? true, placementSourceId]
    )
  } catch (err) {
    console.error("[unifiedSync] syncDonoMediaToUnified failed:", err)
  }
}

// ── Institucional (institutional_media) ────────────────────────────────────
export async function syncInstitutionalToUnified(pool: Pool, params: {
  mediaId: string
  name: string
  url: string
  type: string
  durationSeconds?: number
  position?: number
  active?: boolean
  startDate?: string | null
  endDate?: string | null
  startTime?: string | null
  endTime?: string | null
  daysOfWeek?: string[] | null
  displayFormat?: string
  // Canal DOOHPLAY (12/07/2026): null/undefined = conteúdo institucional
  // genérico (5% do tempo de tela, todas as telas — comportamento de sempre).
  // Com segmentId = conteúdo do "canal" daquele segmento (20% do tempo,
  // só telas cujo business_type bate com o critério do segmento).
  segmentId?: string | null
  // Fase 19 (14/07/2026): só usados quando type === 'layout' | 'youtube'.
  // Sem isso esses dois tipos nunca chegavam em creative_assets_v2 — ficavam
  // configurados no admin mas nunca tocavam na tela real (achado 14/07/2026).
  layoutTemplateId?: string | null
  zoneContent?: Record<string, { type: string; url: string; name: string }> | null
  sequenceGroup?: string | null
}) {
  try {
    const campaignRes = await pool.query(
      `INSERT INTO campaigns_v2 (owner_type, owner_code, name, status, source_table, source_id)
       VALUES ('institucional', 'DOOHPLAY', 'Conteúdo Institucional DOOHPLAY', 'active',
               'institutional_media_umbrella', 'umbrella')
       ON CONFLICT (source_table, source_id) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`
    )
    const campaignV2Id = campaignRes.rows[0].id

    const assetRes = await pool.query(
      `INSERT INTO creative_assets_v2
         (campaign_id, name, url, type, display_format, duration_seconds, status, source_table, source_id,
          layout_template_id, zone_content, sequence_group)
       VALUES ($1,$2,$3,$4,$5,$6,'approved','institutional_media',$7,$8,$9,$10)
       ON CONFLICT (source_table, source_id) DO UPDATE SET
         name = EXCLUDED.name, url = EXCLUDED.url, type = EXCLUDED.type,
         display_format = EXCLUDED.display_format, duration_seconds = EXCLUDED.duration_seconds,
         layout_template_id = EXCLUDED.layout_template_id, zone_content = EXCLUDED.zone_content,
         sequence_group = EXCLUDED.sequence_group
       RETURNING id`,
      [campaignV2Id, params.name, params.url, params.type, params.displayFormat || "fullscreen",
       params.durationSeconds ?? 15, params.mediaId,
       params.layoutTemplateId ?? null,
       params.zoneContent ? JSON.stringify(params.zoneContent) : null,
       params.sequenceGroup ?? null]
    )
    const assetId = assetRes.rows[0].id

    await pool.query(
      `INSERT INTO placements_v2
         (creative_asset_id, position, start_date, end_date, start_time, end_time,
          days_of_week, active, segment_id, source_table, source_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'institutional_media',$10)
       ON CONFLICT (source_table, source_id) DO UPDATE SET
         position = EXCLUDED.position, start_date = EXCLUDED.start_date, end_date = EXCLUDED.end_date,
         start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time,
         days_of_week = EXCLUDED.days_of_week, active = EXCLUDED.active,
         segment_id = EXCLUDED.segment_id`,
      [assetId, params.position ?? 0, params.startDate ?? null, params.endDate ?? null,
       params.startTime ?? null, params.endTime ?? null, params.daysOfWeek ?? null,
       params.active ?? true, params.segmentId ?? null, params.mediaId]
    )
  } catch (err) {
    console.error("[unifiedSync] syncInstitutionalToUnified failed:", err)
  }
}

export async function removeInstitutionalFromUnified(pool: Pool, mediaId: string) {
  try {
    await pool.query(
      `DELETE FROM placements_v2 WHERE source_table = 'institutional_media' AND source_id = $1`,
      [mediaId]
    )
    await pool.query(
      `DELETE FROM creative_assets_v2 WHERE source_table = 'institutional_media' AND source_id = $1`,
      [mediaId]
    )
  } catch (err) {
    console.error("[unifiedSync] removeInstitutionalFromUnified failed:", err)
  }
}
