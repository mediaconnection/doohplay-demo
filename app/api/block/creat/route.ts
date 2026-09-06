export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

import { NextResponse } from "next/server"

export async function GET() {
    const { createBlock } = await import("@proof-engine/domain/block/createBlock")

  try {
    const result = await createBlock()

    return NextResponse.json({
      success: true,
      result
    })
  } catch (err) {
    console.error(err)

    return NextResponse.json(
      { error: "Failed to create block" },
      { status: 500 }
    )
  }
}

