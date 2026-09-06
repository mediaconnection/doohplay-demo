export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
    const { verifyAuditProof } = await import("@/lib/audit/verify")

    const { verifyICP } = await import("@proof-engine/domain/proof/verifyICP")

  try {
    const body = await req.json()

    const {
      event_hash,
      proof,
      icp_signature,
      content_hash
    } = body ?? {}

    if (!event_hash || !proof) {
      return NextResponse.json(
        { valid: false, error: "invalid payload" },
        { status: 400 }
      )
    }

    // 🌳 + 🔗 + 🔐 (interno)
    const audit = verifyAuditProof(event_hash, proof)

    // 🔐 ICP (jurídico)
    let icpValid = false

    try {
      if (icp_signature && content_hash) {
        const icp = await verifyICP(icp_signature, content_hash)
        icpValid = icp.valid
      }
    } catch (err) {
      console.error("ICP verify failed", err)
    }

    // 🧠 decisão final
    const layers = {
      merkle: audit.merkle_valid,
      block: audit.block_valid,
      signature: audit.signature_valid,
      icp: icpValid
    }

    const valid =
      audit.fully_verified &&
      (icp_signature ? icpValid : true)

    let confidence = "LOW"

    if (valid && icpValid) confidence = "HIGH"
    else if (audit.fully_verified) confidence = "MEDIUM"

    return NextResponse.json({
      valid,
      confidence,
      layers,
      details: audit.details
    })

  } catch (err) {
    console.error("FULL VERIFY ERROR", err)

    return NextResponse.json(
      { valid: false, error: "internal error" },
      { status: 500 }
    )
  }
}

