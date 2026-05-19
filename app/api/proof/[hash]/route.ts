import { NextRequest, NextResponse } from "next/server"

import { getCachedProof } from "@/lib/proof/cache/proofCache"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function normalizeHash(value: unknown): string | null {
  if (typeof value !== "string") return null

  const normalized = value.trim().toLowerCase().replace(/^0x/, "")
  return /^[a-f0-9]{64}$/.test(normalized) ? normalized : null
}

function readBoolean(value: unknown): boolean | null {
  if (typeof value === "boolean") return value
  return null
}

function buildVerificationSummary(proof: unknown) {
  const record =
    proof && typeof proof === "object" ? (proof as Record<string, unknown>) : {}

  const valid =
    readBoolean(record.valid) ??
    readBoolean(record.ok) ??
    readBoolean(record.verified) ??
    false

  const status =
    typeof record.status === "string"
      ? record.status
      : valid
        ? "VERIFIED"
        : "WARNING"

  const reasons = Array.isArray(record.reasons)
    ? record.reasons.filter((item): item is string => typeof item === "string")
    : []

  return {
    valid,
    status,
    reasons,
    source: "cached_proof"
  }
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ hash: string }> }
) {
  void req

  try {
    const { hash: rawHash } = await context.params
    const hash = normalizeHash(rawHash)

    if (!hash) {
      return NextResponse.json({ error: "INVALID_HASH" }, { status: 400 })
    }

    const proof = await getCachedProof(hash)

    if (!proof) {
      return NextResponse.json({ error: "PROOF_NOT_FOUND" }, { status: 404 })
    }

    const verification = buildVerificationSummary(proof)

    return NextResponse.json(
      {
        ok: true,
        hash,
        proof,
        verification,
        meta: {
          generated_at: new Date().toISOString()
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
    console.error("PROOF_GET_ROUTE_ERROR", error)

    return NextResponse.json(
      {
        ok: false,
        error: "INTERNAL_ERROR",
        detail: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}