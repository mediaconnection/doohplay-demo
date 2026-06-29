// app/api/advertiser/[code]/daily-stats/route.ts
// Exibições REAIS por dia (últimos 7 dias) — substitui o Math.random() que
// existia antes na aba "Relatórios" do anunciante, mudando a cada reload da
// página e mostrando dado completamente fictício pra quem está pagando.
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
    const { rows } = await pool.query(`
      SELECT
        TO_CHAR(de.played_at, 'YYYY-MM-DD') AS day,
        COUNT(*)::int AS views
      FROM display_events de
      JOIN "CampaignMedia" cm ON cm.id::text = de.media_id::text
      JOIN "Campaign" c ON c.id = cm."campaignId"
      WHERE c."advertiserCode" = $1
        AND de.played_at >= NOW() - INTERVAL '7 days'
      GROUP BY day
      ORDER BY day ASC
    `, [upperCode])

    // Preenche os 7 dias mesmo sem exibição registrada, pra o gráfico não
    // ficar com buracos — mas com valor real 0, nunca um número inventado.
    const byDay: Record<string, number> = {}
    rows.forEach((r: any) => { byDay[r.day] = Number(r.views) })

    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (6 - i))
      const key = d.toISOString().slice(0, 10)
      return {
        label: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
        value: byDay[key] ?? 0,
      }
    })

    return NextResponse.json({ days })
  } catch (err) {
    console.error("[advertiser/daily-stats GET]", err)
    return NextResponse.json({ days: [], error: String(err) }, { status: 500 })
  }
}
