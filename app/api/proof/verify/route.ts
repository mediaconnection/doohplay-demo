export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

// /app/api/proof/verify/route.ts

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"


/* =========================
   SCHEMA
========================= */

const ProofSchema = z.object({
  leaf: z.string().min(64),
  root: z.string().min(64),
  proof: z.array(
    z.object({
      position: z.enum(["left", "right"]),
      hash: z.string().min(64)
    })
  )
})

/* =========================
   ROUTE
========================= */

export async function POST(req: NextRequest) {
    const { verifyMerkleProof } = await import("@/lib/domain/proof/verifyProof")

  try {
    const body = await req.json().catch(() => null)

    if (!body) {
      return NextResponse.json(
        { error: "Invalid JSON" },
        { status: 400 }
      )
    }

    const parsed = ProofSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid proof format",
          details: parsed.error.flatten()
        },
        { status: 400 }
      )
    }

    const { leaf, proof, root } = parsed.data

    const isValid = verifyMerkleProof(leaf, proof, root)

    return NextResponse.json({
      valid: isValid
    })

  } catch (err) {
    console.error("VERIFY_ERROR:", err)

    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    )
  }
}

