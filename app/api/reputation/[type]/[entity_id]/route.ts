import { NextRequest, NextResponse } from "next/server"

import { calculateReputationScore } from "@/lib/proof/reputation/calculateReputationScore"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function safeString(value: unknown): string | null {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ type: string; entity_id: string }> }
) {
  try {
    const { type, entity_id } = await context.params

    const entityType = safeString(type)
    const entityId = safeString(entity_id)

    if (!entityType || !entityId) {
      return NextResponse.json(
        { success: false, error: "INVALID_REPUTATION_PARAMS" },
        { status: 400 }
      )
    }

    const result = await calculateReputationScore(entityType as any, entityId)

    return NextResponse.json({
      success: true,
      reputation: result
    })
  } catch (error) {
    console.error("REPUTATION_ROUTE_ERROR", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "INTERNAL_ERROR"
      },
      { status: 500 }
    )
  }
}