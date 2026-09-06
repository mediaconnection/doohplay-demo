import { NextRequest, NextResponse } from "next/server"

import { buildProofGraph } from "@proof-engine/proof/buildProofGraph"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function safeString(value: unknown): string | null {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
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

    const graph = await buildProofGraph(campaignId)

    return NextResponse.json(graph)
  } catch (error) {
    console.error("PROOF_GRAPH_ROUTE_ERROR", error)

    return NextResponse.json(
      {
        error: "PROOF_GRAPH_FAILED",
        detail: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}