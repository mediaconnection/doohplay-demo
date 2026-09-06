export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
    const { generateMerkleProof } = await import("@proof-engine/domain/proof/merkleProof")

  const body = await req.json()

  const { hashes, index } = body

  const result = generateMerkleProof(hashes, index)

  return NextResponse.json(result)
}

