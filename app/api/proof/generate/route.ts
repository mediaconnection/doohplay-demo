export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server"
import { generateMerkleProof } from "@/lib/domain/proof/merkleProof"

export async function POST(req: NextRequest) {
  const body = await req.json()

  const { hashes, index } = body

  const result = generateMerkleProof(hashes, index)

  return NextResponse.json(result)
}
