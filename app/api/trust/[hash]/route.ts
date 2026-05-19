import { NextRequest, NextResponse } from "next/server"

import { buildProofGraph } from "@/lib/proof/buildProofGraph"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function normalizeHash(value: unknown): string | null {
  if (typeof value !== "string") return null

  const normalized = value.trim().toLowerCase().replace(/^0x/, "")
  return /^[a-f0-9]{64}$/.test(normalized) ? normalized : null
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ hash: string }> }
) {
  try {
    const { hash: rawHash } = await context.params
    const hash = normalizeHash(rawHash)

    if (!hash) {
      return NextResponse.json(
        { success: false, error: "INVALID_HASH" },
        { status: 400 }
      )
    }

    const graph = await buildProofGraph(hash)

    return NextResponse.json({
      success: true,
      graph
    })
  } catch (error) {
    console.error("TRUST_HASH_ROUTE_ERROR", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "INTERNAL_ERROR"
      },
      { status: 500 }
    )
  }
}