export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

import { NextResponse } from "next/server"

import { pool } from "@/lib/db"
import { redis } from "@/lib/redis"

export const runtime = "nodejs"

type CountRow = {
  total: number | string | null
}

type TrustRow = {
  total: number | string | null
  valid: number | string | null
  anchored: number | string | null
  chain_valid: number | string | null
}

type DistributionRow = {
  label: string | null
  total: number | string | null
}

type TimelineRow = {
  day: string | Date | null
  total: number | string | null
  valid: number | string | null
}

function toNumber(value: unknown): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function ratio(part: number, total: number): number {
  if (total <= 0) return 0
  return Number((part / total).toFixed(4))
}

function percent(value: number): number {
  return Math.round(value * 100)
}

function toIsoDate(value: string | Date | null): string | null {
  if (!value) return null

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null

  return date.toISOString().slice(0, 10)
}

export async function GET() {
  try {
    const cacheKey = "trust:summary"

    const cached = await redis.get(cacheKey)

    if (cached) {
      return NextResponse.json(JSON.parse(cached), {
        headers: {
          "Cache-Control": "no-store",
          "X-Cache": "HIT"
        }
      })
    }

    const totalRes = await pool.query(`
      SELECT COUNT(*)::int AS total
      FROM public.event_chain
    `)

    const trustRes = await pool.query(`
      SELECT
        COUNT(*)::int AS total,
        SUM(
          CASE
            WHEN coalesce(trust_score, 0) >= 70 THEN 1
            ELSE 0
          END
        )::int AS valid,
        SUM(
          CASE
            WHEN tx_hash IS NOT NULL AND trim(tx_hash) <> '' THEN 1
            ELSE 0
          END
        )::int AS anchored,
        SUM(
          CASE
            WHEN previous_event_hash IS NULL
              OR trim(previous_event_hash) = ''
              OR previous_event_hash IN (
                SELECT event_hash FROM public.event_chain
              )
            THEN 1
            ELSE 0
          END
        )::int AS chain_valid
      FROM public.event_chain
    `)

    const distributionRes = await pool.query(`
      SELECT
        CASE
          WHEN coalesce(trust_score, 0) >= 85 THEN 'HIGH'
          WHEN coalesce(trust_score, 0) >= 70 THEN 'MEDIUM'
          ELSE 'LOW'
        END AS label,
        COUNT(*)::int AS total
      FROM public.event_chain
      GROUP BY label
      ORDER BY label ASC
    `)

    const timelineRes = await pool.query(`
      SELECT
        date_trunc('day', created_at)::date AS day,
        COUNT(*)::int AS total,
        SUM(
          CASE
            WHEN coalesce(trust_score, 0) >= 70 THEN 1
            ELSE 0
          END
        )::int AS valid
      FROM public.event_chain
      WHERE created_at >= now() - interval '30 days'
      GROUP BY day
      ORDER BY day ASC
    `)

    const totalRows = totalRes.rows as CountRow[]
    const trustRows = trustRes.rows as TrustRow[]
    const distributionRows = distributionRes.rows as DistributionRow[]
    const timelineRows = timelineRes.rows as TimelineRow[]

    const total = toNumber(totalRows[0]?.total)
    const metrics = trustRows[0]

    const valid = toNumber(metrics?.valid)
    const anchored = toNumber(metrics?.anchored)
    const chainValid = toNumber(metrics?.chain_valid)

    const valid_ratio = ratio(valid, total)
    const anchor_ratio = ratio(anchored, total)
    const chain_ratio = ratio(chainValid, total)

    const global_score = Math.round(
      percent(valid_ratio) * 0.4 +
        percent(anchor_ratio) * 0.35 +
        percent(chain_ratio) * 0.25
    )

    const alerts: string[] = []

    if (total === 0) alerts.push("NO_EVENTS")
    if (valid_ratio < 0.7 && total > 0) alerts.push("LOW_VALIDATION_RATIO")
    if (anchor_ratio < 0.5 && total > 0) alerts.push("LOW_ANCHOR_RATIO")
    if (chain_ratio < 0.9 && total > 0) alerts.push("CHAIN_INTEGRITY_WARNING")

    const distribution = distributionRows.map((row) => ({
      label: row.label ?? "UNKNOWN",
      total: toNumber(row.total)
    }))

    const timeline = timelineRows.map((row) => ({
      day: toIsoDate(row.day),
      total: toNumber(row.total),
      valid: toNumber(row.valid)
    }))

    const result = {
      global_score,
      valid_ratio,
      anchor_ratio,
      chain_ratio,
      alerts,
      distribution,
      timeline,
      meta: {
        total_events: total,
        generated_at: new Date().toISOString()
      }
    }

    await redis.set(cacheKey, JSON.stringify(result), "EX", 60)

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "no-store",
        "X-Cache": "MISS"
      }
    })
  } catch (error) {
    console.error("TRUST_SUMMARY_ROUTE_ERROR", error)

    return NextResponse.json(
      {
        error: "internal error",
        detail: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
