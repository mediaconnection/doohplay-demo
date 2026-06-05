import { NextResponse } from "next/server"
import { getPool } from "@/lib/db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const start  = searchParams.get("start")
    const end    = searchParams.get("end")
    const player = searchParams.get("player")

    if (start && isNaN(Date.parse(start))) {
      return NextResponse.json({ error: "Parâmetro 'start' inválido" }, { status: 400 })
    }
    if (end && isNaN(Date.parse(end))) {
      return NextResponse.json({ error: "Parâmetro 'end' inválido" }, { status: 400 })
    }

    const params: string[] = []
    const conditions: string[] = []

    if (start) {
      params.push(start)
      conditions.push(`pl.started_at >= $${params.length}`)
    }
    if (end) {
      params.push(end)
      conditions.push(`pl.started_at <= $${params.length}`)
    }
    if (player) {
      params.push(player)
      conditions.push(`pl.player_id = $${params.length}`)
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""

    const query = `
      SELECT
        c.id                                       AS campaign_id,
        c.name                                     AS campaign_name,
        COUNT(pl.id)                               AS executions_done,
        COALESCE(SUM(pl.duration_seconds), 0)      AS total_seconds,
        COALESCE(SUM(pl.duration_seconds) / 60, 0) AS total_minutes
      FROM public.campaigns c
      LEFT JOIN public.play_logs_certified pl
        ON pl.campaign_id = c.id
      ${where}
      GROUP BY c.id, c.name
      ORDER BY c.name;
    `

    const { rows } = await getPool().query(query, params)
    return NextResponse.json(rows)
  } catch (error) {
    console.error("[REPORTS_CAMPAIGNS]", error)
    return NextResponse.json({ error: "Erro ao carregar relatório" }, { status: 500 })
  }
}
