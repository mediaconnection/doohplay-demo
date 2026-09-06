export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
    const { verifyAll } = await import("@proof-engine/domain/proof/verifyAll")

  try {
    const body = await req.json()

    const result = verifyAll(body)

    return NextResponse.json(result)

  } catch (err) {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    )
  }
}

