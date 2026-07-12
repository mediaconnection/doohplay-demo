// app/api/studio/publish/route.ts
// Reescrita completa (12/07/2026) — o arquivo antigo era uma cópia
// acidental de playlist/route.ts (GET/DELETE/PATCH), sem NENHUM handler de
// POST. Toda vez que alguém clicava em "Publicar na tela" no Studio, a
// requisição batia numa rota sem POST (405), silenciosamente ignorado pelo
// catch{} do frontend — nada nunca era publicado de verdade.
//
// Além disso, mesmo com POST, a versão antiga escrevia em playlist_items
// (tabela órfã que app/player/page.tsx, o player real, nunca lê). Esta
// versão publica no sistema real: mesmo pipeline testado e funcionando de
// app/api/client/generate-creative/route.ts (Campaign -> CampaignMedia ->
// playlist_schedule -> sync pra fundação unificada).
import { NextRequest, NextResponse } from "next/server"
import { getPool } from "@/lib/db"
import { buildHtml, segmentKeyFor, SEGMENT_COLORS, renderImageAndUpload, publishToRealPlaylist } from "@/lib/publishMedia"

export const dynamic     = "force-dynamic"
export const maxDuration = 60

export async function POST(req: NextRequest) {
  const pool = getPool()
  try {
    const body = await req.json()
    const { code, type, duration } = body
    if (!code || !type) {
      return NextResponse.json({ error: "code e type são obrigatórios" }, { status: 400 })
    }
    const upperCode = String(code).toUpperCase()
    const dur = Number(duration) || 15

    const clientRes = await pool.query(
      `SELECT name, business_type, screen_orientation FROM studio_clients WHERE code = $1 AND active = true LIMIT 1`,
      [upperCode]
    )
    if (!clientRes.rows[0]) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 })
    }
    const { name: businessName, business_type, screen_orientation } = clientRes.rows[0]
    const orientation: "landscape" | "portrait" = screen_orientation === "portrait" ? "portrait" : "landscape"

    // ── Template (Editor de anúncios / resultado da IA) ──────────────────
    // Renderiza de verdade via Puppeteer, mesmo pipeline do generate-creative
    // já testado e funcionando — troca a ideia antiga de publicar uma URL de
    // preview ao vivo (tipo 'url', que o player real nunca soube renderizar).
    if (type === "template") {
      const { headline, subline, cta, price, photo_url } = body
      if (!headline?.trim()) {
        return NextResponse.json({ error: "Título é obrigatório" }, { status: 400 })
      }
      const colors = SEGMENT_COLORS[segmentKeyFor(business_type)]
      const html = buildHtml({
        title: headline,
        subtitle: subline || "",
        price: price || undefined,
        cta: cta || "Saiba mais",
        primaryColor: colors.primary,
        accentColor: colors.accent,
        businessName: String(businessName).toUpperCase(),
        orientation,
        photoUrl: photo_url || undefined,
      })
      const url = await renderImageAndUpload({ code: upperCode, html, orientation })
      const { mediaId } = await publishToRealPlaylist(pool, {
        code: upperCode, name: `${headline} (Studio)`, url, type: "image", duration: dur,
      })
      return NextResponse.json({ ok: true, mediaId, url })
    }

    // ── YouTube ────────────────────────────────────────────────────────
    // O player real já sabe renderizar type 'youtube' (Fase 9) — só
    // precisava de um jeito do cliente publicar isso sozinho, que não
    // existia antes desta rota funcionar de verdade.
    if (type === "youtube") {
      const { asset_url, title } = body
      if (!asset_url?.trim()) {
        return NextResponse.json({ error: "URL do YouTube é obrigatória" }, { status: 400 })
      }
      const { mediaId } = await publishToRealPlaylist(pool, {
        code: upperCode, name: title || "YouTube", url: asset_url.trim(), type: "youtube", duration: dur,
      })
      return NextResponse.json({ ok: true, mediaId })
    }

    // ── Vídeo (upload já feito via /api/studio/upload) ────────────────────
    if (type === "video") {
      const { asset_url, title } = body
      if (!asset_url?.trim()) {
        return NextResponse.json({ error: "Vídeo não encontrado — faça upload primeiro" }, { status: 400 })
      }
      const { mediaId } = await publishToRealPlaylist(pool, {
        code: upperCode, name: title || "Vídeo", url: asset_url.trim(), type: "video", duration: dur,
      })
      return NextResponse.json({ ok: true, mediaId })
    }

    // ── Live / HLS — honesto: o player real ainda não sabe renderizar
    // stream ao vivo (sem suporte a HLS hoje). Falha explícita em vez de
    // fingir sucesso, diferente do bug que corrigimos aqui.
    if (type === "hls") {
      return NextResponse.json(
        { error: "Transmissão ao vivo ainda não é suportada pelo player — fica pra uma próxima sessão." },
        { status: 501 }
      )
    }

    return NextResponse.json({ error: `Tipo '${type}' não reconhecido` }, { status: 400 })
  } catch (err: any) {
    console.error("[studio/publish]", err)
    return NextResponse.json({ error: err.message || "Erro interno" }, { status: 500 })
  }
}
