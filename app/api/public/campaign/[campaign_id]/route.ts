import { NextRequest, NextResponse } from "next/server"

import { generateCampaignAudit } from "@/lib/audit/generateCampaignAudit"
import { hashReport, signReport } from "@/lib/crypto/reportProof"
import { detectAlerts } from "@proof-engine/domain/alerts/detectAlerts"
import { validateApiKey } from "@/lib/security/validateApiKey"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type AuditPlay = {
  event_hash?: unknown
  screen_id?: unknown
  played_at?: unknown
  merkle_root?: unknown
  merkle_proof?: unknown
}

type CampaignAuditReport = {
  campaign_id?: unknown
  period?: {
    start?: unknown
    end?: unknown
  }
  total_plays?: unknown
  plays?: AuditPlay[]
  ledger_anchor?: unknown
  signature?: unknown
}

function sortObject(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortObject)

  if (value !== null && typeof value === "object") {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = sortObject((value as Record<string, unknown>)[key])
        return acc
      }, {})
  }

  return value
}

function stableStringify(value: unknown): string {
  return JSON.stringify(sortObject(value))
}

function toNumber(value: unknown): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function safeString(value: unknown): string | null {
  if (typeof value !== "string") return null

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function isValidISODate(date: string): boolean {
  const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/

  if (!isoRegex.test(date)) return false

  const parsed = new Date(date)
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString() === date
}

function isValidCampaignId(id: string): boolean {
  return /^[a-zA-Z0-9_-]{1,100}$/.test(id)
}

function hasEventHash(play: AuditPlay): boolean {
  return Boolean(safeString(play.event_hash))
}

function hasMerkleProof(play: AuditPlay): boolean {
  return Array.isArray(play.merkle_proof) && play.merkle_proof.length > 0
}

function hasMerkleRoot(play: AuditPlay): boolean {
  return Boolean(safeString(play.merkle_root))
}

function calculateAverageTrust(plays: AuditPlay[]): number {
  if (plays.length === 0) return 0

  const totalScore = plays.reduce((sum: number, play: AuditPlay) => {
    let score = 0

    if (hasEventHash(play)) score += 40
    if (hasMerkleRoot(play)) score += 30
    if (hasMerkleProof(play)) score += 30

    return sum + score
  }, 0)

  return Number((totalScore / plays.length).toFixed(2))
}

function isAnchored(value: unknown): boolean {
  if (!value || typeof value !== "object") return false

  const anchor = value as Record<string, unknown>

  return Boolean(
    safeString(anchor.tx_hash) ||
      safeString(anchor.transaction_hash) ||
      safeString(anchor.blockchain_tx) ||
      safeString(anchor.merkle_root)
  )
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ campaign_id: string }> }
) {
  try {
    const isAuthorized = validateApiKey(req)

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { campaign_id } = await context.params
    const campaignId = safeString(campaign_id)

    if (!campaignId || !isValidCampaignId(campaignId)) {
      return NextResponse.json(
        { success: false, error: "Invalid campaign_id" },
        { status: 400 }
      )
    }

    const start = safeString(req.nextUrl.searchParams.get("start"))
    const end = safeString(req.nextUrl.searchParams.get("end"))

    if (!start || !end) {
      return NextResponse.json(
        { success: false, error: "Missing period" },
        { status: 400 }
      )
    }

    if (!isValidISODate(start) || !isValidISODate(end)) {
      return NextResponse.json(
        { success: false, error: "Invalid ISO format" },
        { status: 400 }
      )
    }

    const startDate = new Date(start)
    const endDate = new Date(end)

    if (startDate >= endDate) {
      return NextResponse.json(
        { success: false, error: "Invalid period" },
        { status: 400 }
      )
    }

    const diffDays = (endDate.getTime() - startDate.getTime()) / 86_400_000

    if (diffDays > 31) {
      return NextResponse.json(
        { success: false, error: "Max range is 31 days" },
        { status: 400 }
      )
    }

    const rawReport = await generateCampaignAudit(
      campaignId,
      startDate.toISOString(),
      endDate.toISOString()
    )

    if (!rawReport) {
      return NextResponse.json(
        { success: false, error: "Report error" },
        { status: 500 }
      )
    }

    const report = rawReport as CampaignAuditReport
    const plays = Array.isArray(report.plays) ? report.plays : []

    const total = toNumber(report.total_plays) || plays.length
    const verified = plays.filter((play: AuditPlay) => hasEventHash(play)).length
    const verificationRate = total > 0 ? Math.min(verified / total, 1) : 0

    const averageTrust = calculateAverageTrust(plays)
    const anchoredRate = isAnchored(report.ledger_anchor) ? 1 : 0

    const alerts =
      total > 0
        ? detectAlerts({
            trust_average: averageTrust,
            anchored_rate: anchoredRate,
            verification_rate: verificationRate,
            total_events: total
          }) || []
        : []

    const payload = {
      campaign_id: campaignId,
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      },
      summary: {
        total_events: total,
        verified_events: verified,
        verification_rate: verificationRate,
        total_plays: total
      },
      trust: {
        average: averageTrust,
        anchored_rate: anchoredRate
      },
      alerts,
      ledger_anchor: report.ledger_anchor ?? null,
      plays,
      verification: {
        status: averageTrust >= 80 ? "verified" : "warning",
        score: averageTrust
      }
    }

    const normalized = stableStringify(payload)
    const reportHash = hashReport(normalized)
    const signature = signReport(reportHash)

    return NextResponse.json(
      {
        success: true,
        ...payload,
        proof: {
          hash: reportHash,
          signature,
          algorithm: "SHA256",
          public_key: process.env.PUBLIC_KEY || null
        }
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
    console.error("PUBLIC_CAMPAIGN_ROUTE_ERROR", error)

    return NextResponse.json(
      {
        success: false,
        error: "Internal error",
        detail: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}