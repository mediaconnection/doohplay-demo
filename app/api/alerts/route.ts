export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

import { NextRequest, NextResponse } from "next/server"

import { pool } from "@/lib/db"

export const runtime = "nodejs"

type AlertRow = {
  id: number | string
  type: string
  severity: string | null
  status: string | null
  source_id: string | null
  risk_score: number | string | null
  trust_score: number | string | null
  occurrences: number | string | null
  metadata: Record<string, unknown> | null
  created_at: string | Date
  last_seen_at: string | Date | null
  last_evaluated_at: string | Date | null
  resolved_at: string | Date | null
  policy: string | null
}

function safeString(value: unknown): string | null {
  if (typeof value !== "string") return null

  const trimmed = value.trim()
  return trimmed.length ? trimmed : null
}

function safeInt(value: unknown, fallback: number): number {
  const n = Number(value)
  return Number.isInteger(n) && n > 0 ? n : fallback
}

function normalizeNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null

  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function normalizeDate(value: string | Date | null): string | null {
  if (!value) return null

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

function normalizeAlert(row: AlertRow) {
  return {
    id: row.id,
    type: row.type,
    severity: row.severity ?? "MEDIUM",
    status: row.status ?? (row.resolved_at ? "RESOLVED" : "OPEN"),
    source_id: row.source_id,
    risk_score: normalizeNumber(row.risk_score),
    trust_score: normalizeNumber(row.trust_score),
    occurrences: Number(row.occurrences ?? 0),
    policy: row.policy,
    metadata: row.metadata ?? {},
    created_at: normalizeDate(row.created_at),
    last_seen_at: normalizeDate(row.last_seen_at),
    last_evaluated_at: normalizeDate(row.last_evaluated_at),
    resolved_at: normalizeDate(row.resolved_at)
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    const severity = safeString(searchParams.get("severity"))
    const status = safeString(searchParams.get("status"))
    const type = safeString(searchParams.get("type"))
    const sourceId = safeString(searchParams.get("source_id"))

    const limit = Math.min(safeInt(searchParams.get("limit"), 50), 100)
    const page = safeInt(searchParams.get("page"), 1)
    const offset = (page - 1) * limit

    const where: string[] = []
    const params: unknown[] = []

    if (severity) {
      params.push(severity)
      where.push(`severity = $${params.length}`)
    }

    if (type) {
      params.push(type)
      where.push(`type = $${params.length}`)
    }

    if (sourceId) {
      params.push(sourceId)
      where.push(`source_id = $${params.length}`)
    }

    if (status) {
      if (status === "RESOLVED") {
        where.push("resolved_at IS NOT NULL")
      } else {
        params.push(status)
        where.push(`COALESCE(status, 'OPEN') = $${params.length}`)
        where.push("resolved_at IS NULL")
      }
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : ""

    const totalRes = await pool.query(
      `
      SELECT count(*)::text AS total
      FROM alerts
      ${whereSql}
      `,
      params
    )

    const queryParams = [...params, limit, offset]

    const result = await pool.query(
      `
      SELECT
        id,
        type,
        severity,
        status,
        source_id,
        risk_score,
        trust_score,
        occurrences,
        metadata,
        created_at,
        last_seen_at,
        last_evaluated_at,
        resolved_at,
        policy
      FROM alerts
      ${whereSql}
      ORDER BY
        CASE COALESCE(status, 'OPEN')
          WHEN 'ESCALATED' THEN 1
          WHEN 'OPEN' THEN 2
          WHEN 'RESOLVED' THEN 3
          ELSE 4
        END,
        COALESCE(risk_score, 0) DESC,
        last_seen_at DESC NULLS LAST,
        created_at DESC
      LIMIT $${queryParams.length - 1}
      OFFSET $${queryParams.length}
      `,
      queryParams
    )

    const totalRows = totalRes.rows as Array<{ total: string }>
    const alertRows = result.rows as AlertRow[]

    return NextResponse.json({
      alerts: alertRows.map((row: AlertRow) => normalizeAlert(row)),
      pagination: {
        page,
        limit,
        total: Number(totalRows[0]?.total ?? 0)
      },
      meta: {
        generated_at: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error("ALERTS_LIST_API_ERROR", error)

    return NextResponse.json(
      {
        error: "FAILED_TO_LOAD_ALERTS",
        detail: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
