import { NextRequest, NextResponse } from "next/server"

import { verifyHash } from "@proof-engine/domain/proof/service"

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
        { valid: false, error: "INVALID_HASH" },
        { status: 400 }
      )
    }

    const data = await verifyHash(hash)

    if (!data) {
      return NextResponse.json(
        { valid: false, error: "NOT_FOUND" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        valid: Boolean(data.valid),
        timestamp: Date.now()
      },
      {
        headers: {
          "Cache-Control": "public, max-age=60"
        }
      }
    )
  } catch (error) {
    console.error("PROOF_STATUS_ROUTE_ERROR", error)

    return NextResponse.json(
      {
        valid: false,
        error: "INTERNAL_ERROR",
        detail: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}