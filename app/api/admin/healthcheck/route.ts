// app/api/admin/healthcheck/route.ts
// Detecta automaticamente o tipo exato de regressão que aconteceu em
// 25/06/2026 (categoria sempre "anunciante", vazamento de conteúdo entre
// clientes) — sem isso, o incidente ficou em produção por HORAS porque a
// única forma de notar era rodar curl manualmente. Pensado para ser
// chamado por um cron externo (Render Cron Job, ou serviço gratuito como
// cron-job.org) a cada 15-30 minutos.
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { getPool } from "@/lib/db"

export const dynamic = "force-dynamic"

// Cliente(s) de referência conhecido(s), usados como "canário" — se o
// comportamento esperado mudar pra eles, é sinal forte de regressão.
const REFERENCE_CLIENTS = ["BARBE332"]

async function checkClient(pool: any, code: string) {
  const issues: string[] = []

  const res = await fetch(`https://doohplay.com.br/api/client/playlist/${code}`)
  const data = await res.json().catch(() => null)

  if (!res.ok || !data) {
    issues.push(`Playlist não respondeu corretamente (status ${res.status})`)
    return { code, ok: false, issues }
  }

  const items = data.items ?? []

  if (items.length === 0) {
    // Não é erro por si só (cliente pode estar sem mídia), só registrar.
    return { code, ok: true, issues: [], note: "playlist vazia" }
  }

  // ── Checagem 1: categoria sempre igual (sinal do incidente anterior) ──
  const categories = new Set(items.map((i: any) => i.slot_category))
  if (categories.size === 1 && categories.has("anunciante")) {
    // Confirma contra o banco: se a maioria dessas mídias tem
    // content_source = 'dono' de verdade, isso é uma regressão clara.
    const ids = items.map((i: any) => i.id)
    const realSources = await pool.query(
      `SELECT content_source, COUNT(*) FROM "CampaignMedia" WHERE id = ANY($1) GROUP BY content_source`,
      [ids]
    ).catch(() => ({ rows: [] }))
    const hasNonAnunciante = realSources.rows.some((r: any) => r.content_source !== "anunciante")
    if (hasNonAnunciante) {
      issues.push(`Todos os itens retornados têm slot_category="anunciante", mas o banco mostra content_source diferente — possível regressão na rota de playlist (mesmo padrão do incidente de 25/06/2026)`)
    }
  }

  // ── Checagem 2: vazamento entre clientes (campaign_id de outro advertiserCode) ──
  const campaignIds = [...new Set(items.map((i: any) => i.campaign_id).filter(Boolean))]
  if (campaignIds.length > 0) {
    const campaigns = await pool.query(
      `SELECT id, "advertiserCode" FROM "Campaign" WHERE id = ANY($1)`,
      [campaignIds]
    ).catch(() => ({ rows: [] }))
    const foreignCampaigns = campaigns.rows.filter((c: any) => c.advertiserCode !== code)
    if (foreignCampaigns.length > 0) {
      issues.push(`Playlist de ${code} inclui campanha de outro advertiserCode (${foreignCampaigns.map((c: any) => c.advertiserCode).join(", ")}) — vazamento entre clientes`)
    }
  }

  return { code, ok: issues.length === 0, issues }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession()
  const { searchParams } = req.nextUrl
  const secret = searchParams.get("secret")
  const isNextAuth = !!session?.user
  const isLegacy = secret && secret === process.env.ADMIN_SECRET
  if (!isNextAuth && !isLegacy) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const pool = getPool()
  const results = await Promise.all(REFERENCE_CLIENTS.map(code => checkClient(pool, code)))
  const allOk = results.every(r => r.ok)

  return NextResponse.json({
    ok: allOk,
    checked_at: new Date().toISOString(),
    results,
  }, { status: allOk ? 200 : 500 })
  // status 500 quando há problema é deliberado — serviços de cron externos
  // (ex: cron-job.org, UptimeRobot) costumam alertar automaticamente em
  // qualquer resposta não-2xx, sem precisar configurar lógica extra.
}
