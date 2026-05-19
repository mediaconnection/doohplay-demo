import { NextRequest, NextResponse } from "next/server"

import { generateCampaignCertificate } from "@/lib/certificate/generateCampaignCertificate"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function safeString(value: unknown): string | null {
  if (typeof value !== "string") return null

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
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

    if (!campaignId) {
      return NextResponse.json(
        { error: "INVALID_CAMPAIGN_ID" },
        { status: 400 }
      )
    }

    if (!start || !end) {
      return NextResponse.json(
        { error: "START_AND_END_REQUIRED" },
        { status: 400 }
      )
    }

    const pdf = await generateCampaignCertificate(campaignId, start, end)

    return new Response(toArrayBuffer(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="campaign_${campaignId}.pdf"`,
        "Cache-Control": "no-store"
      }
    })
  } catch (error) {
    console.error("CAMPAIGN_PROOF_ROUTE_ERROR", error)

    return NextResponse.json(
      {
        error: "CAMPAIGN_PROOF_FAILED",
        detail: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}