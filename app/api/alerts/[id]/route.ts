import { NextRequest, NextResponse } from "next/server"

import { pool } from "@/lib/db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type AlertRow = {
  id: number | string
  type?: string | null
  severity?: string | null
  status?: string | null
  source_id?: string | null
  risk_score?: number | string | null
  trust_score?: number | string | null
  occurrences?: number | string | null
  metadata?: Record<string, unknown> | null
  created_at?: string | Date | null
  last_seen_at?: string | Date | null
  last_evaluated_at?: string | Date | null
  resolved_at?: string | Date | null
  policy?: string | null
}

type AuditRow = {
  id: number | string
  event_type: string | null
  source_table: string | null
  source_id: string | null
  occurred_at: string | Date | null
  created_at: string | Date | null
  payload: Record<string, unknown> | null
  payload_hash: string | null
  event_hash: string | null
  previous_event_hash: string | null
  trust_score: number | string | null
}

function safeString(value: unknown): string | null {
  if (typeof value !== "string") return null

  const trimmed = value.trim()
  return trimmed.length ? trimmed : null
}

function normalizeDate(value: unknown): string | null {
  if (!value) return null

  const date = new Date(String(value))

  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  void req

  try {
    const { id } = await context.params
    const alertId = safeString(id)

    if (!alertId) {
      return NextResponse.json({ error: "INVALID_ALERT_ID" }, { status: 400 })
    }

    const alertRes = await pool.query(
      `
      SELECT *
      FROM alerts
      WHERE id::text = $1
      LIMIT 1
      `,
      [alertId]
    )

    const alertRows = alertRes.rows as AlertRow[]
    const alert = alertRows[0]

    if (!alert) {
      return NextResponse.json({ error: "ALERT_NOT_FOUND" }, { status: 404 })
    }

    const auditRes = await pool.query(
      `
      SELECT
        id,
        event_type,
        source_table,
        source_id,
        occurred_at,
        created_at,
        payload,
        payload_hash,
        event_hash,
        previous_event_hash,
        trust_score
      FROM event_chain
      WHERE source_table = 'alerts'
        AND source_id = $1
      ORDER BY created_at DESC
      LIMIT 50
      `,
      [alertId]
    )

    const auditRows = auditRes.rows as AuditRow[]

    return NextResponse.json({
      alert: {
        ...alert,
        created_at: normalizeDate(alert.created_at),
        last_seen_at: normalizeDate(alert.last_seen_at),
        last_evaluated_at: normalizeDate(alert.last_evaluated_at),
        resolved_at: normalizeDate(alert.resolved_at)
      },
      audit: auditRows.map((row: AuditRow) => ({
        ...row,
        occurred_at: normalizeDate(row.occurred_at),
        created_at: normalizeDate(row.created_at)
      })),
      meta: {
        generated_at: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error("ALERT_DETAIL_API_ERROR", error)

    return NextResponse.json(
      {
        error: "FAILED_TO_LOAD_ALERT",
        detail: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}