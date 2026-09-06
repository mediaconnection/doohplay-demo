import { NextRequest } from "next/server"

import { pool } from "@/lib/db"
import { calculateRiskScore } from "@proof-engine/domain/analytics/riskScore"
import { detectTrend } from "@proof-engine/domain/analytics/trend"
import { fillMissingDays } from "@proof-engine/domain/analytics/fillTimeline"
import { forecastLinear } from "@proof-engine/domain/analytics/forecast"
import { generatePredictiveAlerts } from "@proof-engine/domain/analytics/predictiveAlerts"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type CurrentRow = {
  day: string | Date
  avg_trust: number | string | null
  total_events: number | string | null
}

type PreviousRow = {
  avg_trust: number | string | null
}

type TimelinePoint = {
  date: string
  trust: number | null
  events: number
}

type TrendDirection = "improving" | "declining" | "stable"
type ComparisonDirection = "up" | "down" | "stable"

type Comparison = {
  current_avg: number | null
  previous_avg: number | null
  delta: number | null
  direction: ComparisonDirection
}

function toDateKey(value: string | Date): string {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString().slice(0, 10)
  }

  return date.toISOString().slice(0, 10)
}

function safeRound(value: unknown): number | null {
  if (value === null || value === undefined) return null

  const n = Number(value)
  return Number.isFinite(n) ? Math.round(n) : null
}

function normalizeTrend(value: unknown): TrendDirection {
  if (value === "improving") return "improving"
  if (value === "declining") return "declining"
  return "stable"
}

function smoothSeries(values: Array<number | null>): Array<number | null> {
  return values.map((value, index, arr) => {
    if (value === null) return null

    const prev = arr[index - 1] ?? value
    const next = arr[index + 1] ?? value

    const nums = [prev, value, next].filter(
      (item): item is number => item !== null && Number.isFinite(item)
    )

    if (!nums.length) return null

    return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length)
  })
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ client_id: string }> }
) {
  void req

  try {
    const { client_id } = await context.params
    const clientId = Number(client_id)

    if (!Number.isInteger(clientId) || clientId <= 0) {
      return Response.json({ error: "Invalid client id" }, { status: 400 })
    }

    const currentRes = await pool.query(
      `
      SELECT
        date_trunc('day', created_at)::text AS day,
        avg(trust_score)::float AS avg_trust,
        count(*)::int AS total_events
      FROM public.event_chain
      WHERE client_id = $1
        AND created_at >= now() - interval '30 days'
      GROUP BY day
      ORDER BY day ASC
      `,
      [clientId]
    )

    const currentRows = currentRes.rows as CurrentRow[]

    const currentTimelineRaw: TimelinePoint[] = currentRows.map(
      (row: CurrentRow) => ({
        date: toDateKey(row.day),
        trust: safeRound(row.avg_trust),
        events: Number(row.total_events ?? 0)
      })
    )

    const timeline: TimelinePoint[] = fillMissingDays(currentTimelineRaw, 30)

    const rawSeries = timeline.map((point: TimelinePoint) => point.trust)
    const smoothedSeries = smoothSeries(rawSeries)

    const validPoints = smoothedSeries.filter(
      (value): value is number => value !== null && Number.isFinite(value)
    )

    const dataDensity = validPoints.length / 30
    const hasEnoughData = validPoints.length >= 5

    const prevRes = await pool.query(
      `
      SELECT avg(trust_score)::float AS avg_trust
      FROM public.event_chain
      WHERE client_id = $1
        AND created_at >= now() - interval '60 days'
        AND created_at < now() - interval '30 days'
      `,
      [clientId]
    )

    const prevRows = prevRes.rows as PreviousRow[]
    const prevAvg = safeRound(prevRows[0]?.avg_trust ?? null)

    const trend: TrendDirection =
      validPoints.length >= 2
        ? normalizeTrend(detectTrend(validPoints))
        : "stable"

    let comparison: Comparison = {
      current_avg: null,
      previous_avg: prevAvg,
      delta: null,
      direction: "stable"
    }

    if (validPoints.length > 0 && prevAvg !== null) {
      const currentAvg =
        validPoints.reduce((sum, value) => sum + value, 0) / validPoints.length

      const delta = currentAvg - prevAvg

      comparison = {
        current_avg: Math.round(currentAvg),
        previous_avg: prevAvg,
        delta: Math.round(delta),
        direction: delta > 5 ? "up" : delta < -5 ? "down" : "stable"
      }
    }

    const forecast =
      hasEnoughData && dataDensity > 0.4 ? forecastLinear(validPoints, 7) : []

    const alerts =
      forecast.length > 0
        ? generatePredictiveAlerts({
            trend,
            currentValues: validPoints,
            forecast
          })
        : []

    const risk =
      forecast.length > 0 && typeof comparison.delta === "number"
        ? calculateRiskScore({
            trend,
            forecast,
            comparison: {
              delta: comparison.delta
            },
            alerts
          })
        : null

    const confidence = Math.round(Math.min(1, dataDensity) * 100)

    return Response.json({
      timeline,
      trend,
      comparison,
      forecast,
      alerts,
      risk,
      confidence,
      meta: {
        client_id: clientId,
        data_points: validPoints.length,
        density: dataDensity,
        generated_at: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error("TRUST_TIMELINE_API_ERROR", error)

    return Response.json(
      {
        error: "Failed to load timeline",
        detail: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}