export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

import { NextResponse } from "next/server"

export async function POST() {
    const { syncTrustGraphFromEventChain } = await import("@proof-engine/domain/trust-graph/syncFromEventChain")

  try {
    const result = await syncTrustGraphFromEventChain(10000)

    return NextResponse.json({
      success: true,
      ...result
    })
  } catch (error) {
    console.error("trust graph sync error", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "internal_error"
      },
      { status: 500 }
    )
  }
}

