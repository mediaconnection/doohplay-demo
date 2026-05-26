export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

import { NextRequest, NextResponse } from "next/server"

import { pool } from "@/lib/db"

export const runtime = "nodejs"

type Period = "today" | "7d" | "30d"

type CampaignExportRow = {
  campaign: string | null
  executions: number | string | null
  seconds: number | string | null
  cpm: number | string | null
  gross_amount: number | string | null
}

function resolvePeriod(period?: string): { start: string; end: string } {
  const end = new Date()
  const start = new Date(end)

  switch (period as Period) {
    case "today":
      start.setHours(0, 0, 0, 0)
      break
    case "7d":
      start.setDate(end.getDate() - 7)
      break
    case "30d":
    default:
      start.setDate(end.getDate() - 30)
      break
  }

  return {
    start: start.toISOString(),
    end: end.toISOString()
  }
}

function safeCsvValue(value: unknown): string {
  if (value === null || value === undefined) return ""

  const text = String(value).replace(/"/g, '""')

  if (/[;"\n\r]/.test(text)) {
    return `"${text}"`
  }

  return text
}

function normalizeUuid(value: string | null): string | null {
  if (!value) return null

  const trimmed = value.trim()

  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{12}$/i.test(
    trimmed
  )
    ? trimmed
    : null
}

export async function GET(req: NextRequest) {
  try {
    const period = req.nextUrl.searchParams.get("period") ?? undefined
    const campaign = normalizeUuid(req.nextUrl.searchParams.get("campaign"))

    const { start, end } = resolvePeriod(period)

    const result = await pool.query(
      `
      SELECT
        c.name AS campaign,
        COUNT(pl.id)::int AS executions,
        COALESCE(SUM(pl.duration_seconds), 0)::int AS seconds,
        25.00::numeric AS cpm,
        ROUND((COUNT(pl.id)::numeric / 1000) * 25.00, 2) AS gross_amount
      FROM public.campaigns c
      LEFT JOIN public.play_logs_certified pl
        ON pl.campaign_id = c.id
       AND pl.created_at >= $1
       AND pl.created_at <  $2
      WHERE ($3::uuid IS NULL OR c.id = $3::uuid)
      GROUP BY c.name
      ORDER BY c.name ASC
      `,
      [start, end, campaign]
    )

    const rows = result.rows as CampaignExportRow[]

    const header = ["Campanha", "Execuções", "Tempo (s)", "CPM", "Valor (R$)"]

    const lines = rows.map((row) =>
      [
        row.campaign,
        row.executions,
        row.seconds,
        row.cpm,
        row.gross_amount
      ]
        .map(safeCsvValue)
        .join(";")
    )

    const csv = [header.join(";"), ...lines].join("\n")

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="relatorio-campanhas.csv"`,
        "Cache-Control": "no-store"
      }
    })
  } catch (error) {
    console.error("CAMPAIGN_EXPORT_ROUTE_ERROR", error)

    return NextResponse.json(
      {
        error: "CAMPAIGN_EXPORT_FAILED",
        detail: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
