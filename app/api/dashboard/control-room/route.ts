export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { cpmEstimateValue } from "@/lib/cpmEstimate"

export const runtime = "nodejs"

type ScreenQueryRow = {
  player_id: string
  label: string
  client_code: string | null
  online: boolean
  last_ping: string | null
  impressions_today: number
  impressions_30d: number
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const { pool } = await import("@/lib/db")

  try {
    const screensResult = await pool.query(
      `
      WITH today_counts AS (
        SELECT player_id, COUNT(*) AS impressions_today
        FROM display_events
        WHERE played_at >= date_trunc('day', now())
          AND player_id IS NOT NULL
        GROUP BY player_id
      ),
      last30_counts AS (
        SELECT player_id, COUNT(*) AS impressions_30d
        FROM display_events
        WHERE played_at >= now() - interval '30 days'
          AND player_id IS NOT NULL
        GROUP BY player_id
      )
      SELECT
        p.id AS player_id,
        COALESCE(sc.name, cs.label, p.name, 'Player ' || p.id::text) AS label,
        sc.code AS client_code,
        (p.last_ping > now() - interval '5 minutes') AS online,
        p.last_ping,
        COALESCE(tc.impressions_today, 0)::int AS impressions_today,
        COALESCE(l30.impressions_30d, 0)::int AS impressions_30d
      FROM players p
      INNER JOIN studio_clients sc ON sc.player_id = p.id
      LEFT JOIN client_screens cs ON cs.player_id = p.id
      LEFT JOIN today_counts tc ON tc.player_id = p.id
      LEFT JOIN last30_counts l30 ON l30.player_id = p.id
      ORDER BY impressions_today DESC NULLS LAST
      `
    )

    // Contagem filtrada por event_chain.occurred_at (quando o evento
    // aconteceu), não certifications.created_at (quando foi certificado) —
    // achado em produção: o pipeline processa backlog em lote, então
    // "certificações criadas hoje" não corresponde a "eventos de hoje"
    // (11.980 certificações criadas em 27/08 certificavam eventos de
    // 26/08). Filtrar pelo evento original torna o número comparável com
    // impressions_today. O aviso de dado parado (proofs_last_updated_at)
    // continua vindo de certifications.created_at — propositalmente
    // diferente, mede se o pipeline está rodando, não se houve evento hoje.
    const proofsResult = await pool.query(
      `
      SELECT COUNT(*)::int AS proofs_registered_today
      FROM certifications c
      JOIN event_chain e ON e.event_hash = c.content_hash
      WHERE e.occurred_at >= date_trunc('day', now())
      `
    )

    const proofsLastUpdatedResult = await pool.query(
      `SELECT MAX(created_at) AS proofs_last_updated_at FROM certifications`
    )

    const screens = (screensResult.rows as ScreenQueryRow[]).map((row) => {
      const cpm = cpmEstimateValue(Number(row.impressions_30d ?? 0))
      const impressionsToday = Number(row.impressions_today ?? 0)
      const estimatedRevenueToday = Number(((impressionsToday / 1000) * cpm).toFixed(2))

      return {
        player_id: row.player_id,
        label: row.label,
        client_code: row.client_code,
        online: row.online,
        last_ping: row.last_ping,
        impressions_today: impressionsToday,
        estimated_revenue_today: estimatedRevenueToday,
        cpm,
      }
    })

    const impressionsTodayTotal = screens.reduce((sum, s) => sum + s.impressions_today, 0)
    const estimatedRevenueTodayTotal = Number(
      screens.reduce((sum, s) => sum + s.estimated_revenue_today, 0).toFixed(2)
    )
    const avgCpm =
      impressionsTodayTotal > 0
        ? Number(((estimatedRevenueTodayTotal / impressionsTodayTotal) * 1000).toFixed(2))
        : 0

    const proofsRow = proofsResult.rows[0] ?? { proofs_registered_today: 0 }
    const proofsLastUpdatedRow = proofsLastUpdatedResult.rows[0] ?? { proofs_last_updated_at: null }

    return NextResponse.json(
      {
        screens,
        totals: {
          impressions_today: impressionsTodayTotal,
          estimated_revenue_today: estimatedRevenueTodayTotal,
          avg_cpm: avgCpm,
          proofs_registered_today: Number(proofsRow.proofs_registered_today ?? 0),
          proofs_last_updated_at: proofsLastUpdatedRow.proofs_last_updated_at,
        },
        generated_at: new Date().toISOString(),
      },
      { headers: { "Cache-Control": "no-store" } }
    )
  } catch (error) {
    console.error("DASHBOARD_CONTROL_ROOM_ROUTE_ERROR", error)

    return NextResponse.json(
      {
        error: "Erro ao buscar dados da central de controle",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
