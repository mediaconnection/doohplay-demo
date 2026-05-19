import crypto from "crypto"
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

function normalizeAuditForPdf(
  audit: Awaited<ReturnType<typeof generateCampaignAudit>>
): PdfAuditInput {
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
  if (bytes instanceof ArrayBuffer) return bytes

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

    const { searchParams } = new URL(req.url)
    const start = safeString(searchParams.get("start"))
    const end = safeString(searchParams.get("end"))

    if (!campaignId || !start || !end) {
      return NextResponse.json({ error: "INVALID_PARAMS" }, { status: 400 })
    }

    const audit = await generateCampaignAudit(campaignId, start, end)
    const normalizedAudit = normalizeAuditForPdf(audit)

    const initialPdfBytes = await generateAuditPdf(normalizedAudit)

    const documentHash = crypto
      .createHash("sha256")
      .update(initialPdfBytes)
      .digest("hex")

    const finalPdfBytes = await generateAuditPdf({
      ...normalizedAudit,
      document_hash: documentHash
    } as PdfAuditInput)

    return new Response(toArrayBuffer(finalPdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="campaign-${campaignId}.pdf"`,
        "X-Document-Hash": documentHash,
        "Cache-Control": "no-store"
      }
    })
  } catch (error) {
    console.error("CAMPAIGN_PDF_ROUTE_ERROR", error)

    return NextResponse.json(
      {
        error: "INTERNAL_ERROR",
        detail: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}