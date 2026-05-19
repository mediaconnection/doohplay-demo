import { NextRequest, NextResponse } from "next/server"

import { createSettlement } from "@/lib/settlement/createSettlement"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function safeString(value: unknown): string | null {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function safeAmount(value: unknown): number | null {
  const amount = Number(value)
  return Number.isFinite(amount) && amount > 0 ? amount : null
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

    const body = await req.json().catch(() => null)
    const amount = safeAmount(body?.amount)

    if (amount === null) {
      return NextResponse.json(
        { success: false, error: "INVALID_AMOUNT" },
        { status: 400 }
      )
    }

    const settlement = await createSettlement(impressionId, amount)

    return NextResponse.json({
      success: true,
      settlement
    })
  } catch (error) {
    console.error("SETTLEMENT_IMPRESSION_ROUTE_ERROR", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "INTERNAL_ERROR"
      },
      { status: 500 }
    )
  }
}