import { NextRequest, NextResponse } from "next/server"

import { generateCampaignAudit } from "@/lib/audit/generateCampaignAudit"
import { generateAuditPdf } from "@/lib/pdf/generateAuditPdf"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type PdfAuditInput = Parameters<typeof generateAuditPdf>[0]

function safeString(value: unknown): string | null {
  if (typeof value !== "string") return null

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function extractSignature(value: unknown): string {
  if (typeof value === "string") return value

  if (
    value &&
    typeof value === "object" &&
    "signedHash" in value &&
    typeof value.signedHash === "string"
  ) {
    return value.signedHash
  }

  return ""
}

function normalizeAuditForPdf(audit: Awaited<ReturnType<typeof generateCampaignAudit>>): PdfAuditInput {
  return {
    ...audit,
    signature: extractSignature(audit.signature),
    ledger_anchor: {
      merkle_root: audit.ledger_anchor?.merkle_root ?? "",
      anchored_at: audit.ledger_anchor?.anchored_at ?? null
    },
    plays: audit.plays.map((play) => ({
      ...play,
      merkle_root: play.merkle_root ?? "",
      merkle_proof: play.merkle_proof ?? []
    }))
  } as PdfAuditInput
}

function toArrayBuffer(bytes: Uint8Array | ArrayBuffer): ArrayBuffer {
  if (bytes instanceof ArrayBuffer) {
    return bytes
  }

  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength
  ) as ArrayBuffer
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ campaign_id: string }> }
) {
  try {
    const { campaign_id } = await context.params
    const campaignId = safeString(campaign_id)

    if (!campaignId) {
      return NextResponse.json(
        { error: "INVALID_CAMPAIGN_ID" },
        { status: 400 }
      )
    }

    const { searchParams } = new URL(req.url)

    const start = safeString(searchParams.get("start"))
    const end = safeString(searchParams.get("end"))

    if (!start || !end) {
      return NextResponse.json(
        { error: "START_AND_END_REQUIRED" },
        { status: 400 }
      )
    }

    const audit = await generateCampaignAudit(campaignId, start, end)
    const pdfBytes = await generateAuditPdf(normalizeAuditForPdf(audit))

    return new Response(toArrayBuffer(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="audit-${campaignId}.pdf"`,
        "Cache-Control": "no-store"
      }
    })
  } catch (error) {
    console.error("CAMPAIGN_AUDIT_CERTIFICATE_ERROR", error)

    return NextResponse.json(
      {
        error: "FAILED_TO_GENERATE_AUDIT_CERTIFICATE",
        detail: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}