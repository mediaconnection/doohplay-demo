import { NextRequest, NextResponse } from "next/server"

import { generateProofCertificate } from "@/core/audit/generateProofCertificate"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function safeHash(value: unknown): string | null {
  if (typeof value !== "string") return null

  const normalized = value.trim().toLowerCase().replace(/^0x/, "")
  return /^[a-f0-9]{64}$/.test(normalized) ? normalized : null
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ hash: string }> }
) {
  void req

  try {
    const { hash: rawHash } = await context.params
    const hash = safeHash(rawHash)

    if (!hash) {
      return NextResponse.json({ error: "INVALID_HASH" }, { status: 400 })
    }

    const certificate = await generateProofCertificate()

    return NextResponse.json(
      {
        ok: true,
        hash,
        certificate,
        meta: {
          generated_at: new Date().toISOString(),
          mode: "stub-json",
          note: "generateProofCertificate ainda não retorna PDF"
        }
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store"
        }
      }
    )
  } catch (error) {
    console.error("PROOF_CERTIFICATE_ROUTE_ERROR", error)

    return NextResponse.json(
      {
        error: "PROOF_CERTIFICATE_FAILED",
        detail: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}