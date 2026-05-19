import { NextRequest, NextResponse } from "next/server"

import { buildProofGraphNetwork } from "@/lib/proof/graph/buildProofGraphNetwork"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function safeString(value: unknown): string | null {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ impression_id: string }> }
) {
  try {
    const { impression_id } = await context.params
    const impressionId = safeString(impression_id)

    if (!impressionId) {
      return NextResponse.json(
        { success: false, error: "INVALID_IMPRESSION_ID" },
        { status: 400 }
      )
    }

    const result = await buildProofGraphNetwork(impressionId)

    return NextResponse.json({
      success: true,
      graph: result
    })
  } catch (error) {
    console.error("BUILD_PROOF_GRAPH_ROUTE_ERROR", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "INTERNAL_ERROR"
      },
      { status: 500 }
    )
  }
}