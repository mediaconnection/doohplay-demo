import { NextRequest, NextResponse } from "next/server"

import { generateCampaignAudit } from "@/lib/audit/generateCampaignAudit"
import { detectAlerts } from "@/lib/domain/alerts/detectAlerts"
import { enqueueAlerts } from "@/lib/queue/enqueueAlert"
import type { Alert } from "@/lib/domain/alerts/types"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type CampaignAuditReport = Awaited<ReturnType<typeof generateCampaignAudit>>

function isValidISODate(date: string): boolean {
  const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/

  if (!isoRegex.test(date)) return false

  const d = new Date(date)
  return !Number.isNaN(d.getTime()) && d.toISOString() === date
}

function isValidCampaignId(id: string): boolean {
  return /^[a-zA-Z0-9_-]{1,100}$/.test(id)
}

function safeString(value: unknown): string | null {
  if (typeof value !== "string") return null

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function toNumber(value: unknown): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function getTotalEvents(report: CampaignAuditReport): number {
  if ("total_events" in report) {
    return toNumber(report.total_events)
  }

  return toNumber(report.total_plays)
}

function getVerifiedEvents(report: CampaignAuditReport): number {
  if ("verified_events" in report) {
    return toNumber(report.verified_events)
  }

  return Array.isArray(report.plays) ? report.plays.length : 0
}

function getAverageTrust(report: CampaignAuditReport): number {
  if ("trust" in report && report.trust && typeof report.trust === "object") {
    return toNumber(
      (report.trust as { average?: unknown; avg?: unknown }).average ??
        (report.trust as { average?: unknown; avg?: unknown }).avg
    )
  }

  return 0
}

function getAnchoredRate(report: CampaignAuditReport): number {
  if ("trust" in report && report.trust && typeof report.trust === "object") {
    return toNumber(
      (report.trust as { anchored_rate?: unknown }).anchored_rate
    )
  }

  if (Array.isArray(report.plays) && report.plays.length > 0) {
    const anchored = report.plays.filter((play) => Boolean(play.merkle_root)).length
    return anchored / report.plays.length
  }

  return 0
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ campaign_id: string }> }
) {
  try {
    const { campaign_id } = await context.params
    const campaignId = safeString(campaign_id)

    if (!campaignId || !isValidCampaignId(campaignId)) {
      return NextResponse.json(
        { success: false, error: "Invalid campaign_id" },
        { status: 400 }
      )
    }

    const { searchParams } = new URL(req.url)

    const start = safeString(searchParams.get("start"))
    const end = safeString(searchParams.get("end"))

    if (!start || !end) {
      return NextResponse.json(
        { success: false, error: "start and end are required" },
        { status: 400 }
      )
    }

    if (!isValidISODate(start) || !isValidISODate(end)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)"
        },
        { status: 400 }
      )
    }

    const startDate = new Date(start)
    const endDate = new Date(end)

    if (startDate >= endDate) {
      return NextResponse.json(
        { success: false, error: "start must be before end" },
        { status: 400 }
      )
    }

    const maxRangeDays = 31
    const diffDays = Math.floor(
      (endDate.getTime() - startDate.getTime()) / 86_400_000
    )

    if (diffDays > maxRangeDays) {
      return NextResponse.json(
        {
          success: false,
          error: `Max range is ${maxRangeDays} days`
        },
        { status: 400 }
      )
    }

    const normalizedStart = startDate.toISOString()
    const normalizedEnd = endDate.toISOString()

    const report = await generateCampaignAudit(
      campaignId,
      normalizedStart,
      normalizedEnd
    )

    const total = getTotalEvents(report)
    const verified = getVerifiedEvents(report)
    const verificationRate = total > 0 ? Math.min(verified / total, 1) : 0

    const averageTrust = getAverageTrust(report)
    const anchoredRate = getAnchoredRate(report)

    let alerts: Alert[] = []

    if (total > 0) {
      alerts = detectAlerts({
        trust_average: averageTrust,
        anchored_rate: anchoredRate,
        verification_rate: verificationRate,
        total_events: total
      })
    }

    if (alerts.length > 0) {
      void enqueueAlerts(campaignId, alerts)
    }

    return NextResponse.json(
      {
        success: true,
        campaign_id: campaignId,
        period: {
          start: normalizedStart,
          end: normalizedEnd
        },
        summary: {
          total_events: total,
          verified_events: verified,
          total_plays: "total_plays" in report ? report.total_plays : total,
          verification_rate: verificationRate
        },
        trust: {
          average: averageTrust,
          anchored_rate: anchoredRate
        },
        alerts,
        report
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
          "Surrogate-Control": "no-store"
        }
      }
    )
  } catch (error) {
    console.error("CAMPAIGN_AUDIT_ROUTE_ERROR", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "internal server error"
      },
      { status: 500 }
    )
  }
}