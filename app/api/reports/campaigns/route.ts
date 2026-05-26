export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

import { NextResponse } from "next/server"
import { getPool } from "@/lib/db"

export const runtime = "nodejs"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const start = searchParams.get("start")
    const end = searchParams.get("end")
    const player = searchParams.get("player")

    const params: string[] = []
    let where = "WHERE 1=1"

    if (start && end) {
      params.push(start, end)
      where += ` AND pl.started_at >= $${params.length - 1}
                 AND pl.started_at <= $${params.length}`
    }

    if (player) {
      params.push(player)
      where += ` AND pl.player_id = $${params.length}`
    }

    const query = `
      SELECT
        c.id   AS campaign_id,
        c.name AS campaign_name,
        COUNT(pl.id) AS executions_done,
        COALESCE(SUM(pl.duration_seconds), 0) AS total_seconds
      FROM public.campaigns c
      LEFT JOIN public.play_logs_certified pl
        ON pl.campaign_id = c.id
      ${where}
      GROUP BY c.id, c.name
      ORDER BY c.name;
    `

    // getPool() é lazy — não conecta durante o build
    const { rows } = await getPool().query(query, params)

    return NextResponse.json(rows)
  } catch (error) {
    console.error("[REPORTS_CAMPAIGNS]", error)
    return NextResponse.json(
      { error: "Erro ao carregar relatório" },
      { status: 500 }
    )
  }
}
