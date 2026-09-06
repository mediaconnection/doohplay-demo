export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

import { NextRequest, NextResponse } from "next/server"


export const runtime = "nodejs"

type EntityType = "event" | "campaign" | "block"

type RawVerifyInput = {
  hash?: unknown
  entity_id?: unknown
  entity_type?: unknown
}

type VerifyInput = {
  hash: string
  entity_id: string
  entity_type: EntityType
}

function getApiKey(req: NextRequest): string {
  return req.headers.get("x-api-key") || ""
}

function getIP(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  )
}

function isValidInput(body: unknown): body is RawVerifyInput {
  return Boolean(
    body &&
      typeof body === "object" &&
      typeof (body as RawVerifyInput).hash === "string" &&
      typeof (body as RawVerifyInput).entity_id === "string" &&
      typeof (body as RawVerifyInput).entity_type === "string"
  )
}

function isValidHash(hash: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(hash)
}

function normalizeEntityType(value: unknown): EntityType {
  if (value === "campaign") return "campaign"
  if (value === "block") return "block"
  return "event"
}

function normalize(body: RawVerifyInput): VerifyInput {
  return {
    hash: String(body.hash).trim().toLowerCase(),
    entity_id: String(body.entity_id),
    entity_type: normalizeEntityType(body.entity_type)
  }
}

async function safeJson(req: NextRequest): Promise<unknown> {
  try {
    return await req.json()
  } catch {
    return null
  }
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timeout: NodeJS.Timeout | undefined

  return Promise.race([
    promise.finally(() => {
      if (timeout) clearTimeout(timeout)
    }),
    new Promise<T>((_, reject) => {
      timeout = setTimeout(() => reject(new Error("TIMEOUT")), ms)
    })
  ])
}

export async function POST(req: NextRequest) {
    const { runProofEngine } = await import("@proof-engine/proof/engine")
    const { computeScore, getScoreLabel } = await import("@proof-engine/proof/score")
    const { rateLimit } = await import("@/lib/security/rateLimit")
    const { checkLimit } = await import("@/lib/api/checkLimit")
    const { trackUsage } = await import("@/lib/api/trackUsage")

  try {
    const apiKey = getApiKey(req)

    if (!apiKey) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 })
    }

    const ip = getIP(req)
    const rl = await rateLimit(ip)

    if (!rl.allowed) {
      return NextResponse.json(
        { error: "RATE_LIMIT_EXCEEDED" },
        {
          status: 429,
          headers: {
            "X-RateLimit-Remaining": String(rl.remaining),
            "X-RateLimit-Reset": String(rl.reset)
          }
        }
      )
    }

    const limit = await checkLimit(apiKey)

    if (!limit.allowed) {
      return NextResponse.json(
        {
          error: "PLAN_LIMIT_EXCEEDED",
          used: limit.used,
          limit: limit.limit
        },
        { status: 402 }
      )
    }

    const raw = await safeJson(req)

    if (!isValidInput(raw)) {
      return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 })
    }

    const rawHash = String(raw.hash)

    if (!isValidHash(rawHash)) {
      return NextResponse.json({ error: "INVALID_HASH" }, { status: 400 })
    }

    const body = normalize(raw)

    const result = await withTimeout(runProofEngine(body), 4000)

    const score = computeScore(result.layers ?? [])
    const label = getScoreLabel(score)

    trackUsage(apiKey, "verify").catch(() => {})

    return NextResponse.json(
      {
        valid: score >= 70,
        score,
        trust_level: label,
        status: result.valid ? "VERIFIED" : "WARNING",
        timestamp: new Date().toISOString()
      },
      {
        headers: {
          "X-RateLimit-Remaining": String(rl.remaining),
          "X-RateLimit-Reset": String(rl.reset),
          "X-Plan-Used": String(limit.used),
          "X-Plan-Limit": String(limit.limit),
          "Cache-Control": "no-store"
        }
      }
    )
  } catch (error) {
    console.error("PUBLIC_API_VERIFY_ERROR", error)

    if (error instanceof Error && error.message === "TIMEOUT") {
      return NextResponse.json({ error: "TIMEOUT" }, { status: 504 })
    }

    return NextResponse.json(
      {
        error: "INTERNAL_ERROR",
        detail: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
