import { randomUUID } from "crypto"
import { NextRequest, NextResponse } from "next/server"

// Imports estáticos — usados em funções fora do handler GET
import { resolveProofInputByHash } from "@/lib/proof/adapters/supabase"
import { buildProofCacheKey, getCachedProof, setCachedProof } from "@/lib/proof/cache/proofCache"
import { runProofEngine } from "@/lib/proof/engine"
import { buildExplanation } from "@/lib/proof/explanation"
import { computeScore, getTrustLevel, getVerificationStatus } from "@/lib/proof/score"
import { enqueueProof } from "@/lib/proof/queue/proofQueue"

import type {
  EntityType,
  FailureReason,
  LayerResult,
  ProofInput,
  ProofMeta,
  ProofResultLike,
  TrustLevel,
  VerificationStatus
} from "@/lib/proof/types"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

/* =========================
   CONFIG
========================= */

const ENTITY_TYPES: readonly EntityType[] = ["event", "campaign", "block"]

const VALID_FAILURE_REASONS: readonly FailureReason[] = [
  "ICP_FAIL",
  "MERKLE_FAIL",
  "BLOCKCHAIN_FAIL",
  "INVALID_SIGNATURE",
  "CHAIN_INVALID",
  "CERT_REVOKED",
  "CERT_EXPIRED",
  "HASH_MISMATCH",
  "PROOF_NOT_FOUND",
  "INVALID_INPUT",
  "INVALID_MERKLE_ROOT",
  "INVALID_MERKLE_PROOF",
  "INVALID_BLOCKCHAIN_TX",
  "RPC_UNAVAILABLE",
  "LAYER_TIMEOUT",
]

/* =========================
   TYPES
========================= */

type RateLimitResult = {
  allowed: boolean
  remaining?: number
  reset?: number
}

type VerifyHashParams = {
  hash: string
}

type VerifyHashResponse = {
  ok?: boolean
  valid?: boolean | null
  pending?: boolean
  status?: VerificationStatus | "PENDING"
  trust?: TrustLevel
  trust_level?: TrustLevel
  risk?: "LOW" | "MEDIUM" | "HIGH"
  risk_level?: "LOW" | "MEDIUM" | "HIGH"
  score?: number
  reasons?: FailureReason[]
  explanation?: unknown
  layers?: LayerResult[]
  meta?: ProofMeta & Record<string, unknown>
  message?: string
  error?: string
  source?: "cache" | "live" | "queue"
  request_id: string
  hash?: string
  hash_0x?: string
  links?: {
    public_verify_url?: string
    explorer_event_url?: string | null
    explorer_block_url?: string | null
    polygon_url?: string | null
  }
  [key: string]: unknown
}

type ResolvedCandidate = {
  input: ProofInput
  cacheKey: string
}

type CandidateExecution = {
  input: ProofInput
  cacheKey: string
  result: ProofResultLike
  source: "cache" | "live"
}

/* =========================
   HELPERS
========================= */

function isCandidateExecution(value: CandidateExecution | null): value is CandidateExecution {
  return value !== null
}

function getIP(req: NextRequest): string {
  const forwardedFor = req.headers.get("x-forwarded-for")
  const realIp = req.headers.get("x-real-ip")
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0]?.trim()
    if (firstIp) return firstIp
  }
  if (realIp?.trim()) return realIp.trim()
  return "unknown"
}

function normalizeHash(value: string): string {
  return String(value ?? "").trim().toLowerCase().replace(/^0x/, "")
}

function formatHash0x(hash: string): string {
  return `0x${normalizeHash(hash)}`
}

function isValidHash(hash: string): boolean {
  return /^[a-f0-9]{64}$/i.test(normalizeHash(hash))
}

function getHashVariants(hash: string): string[] {
  const clean = normalizeHash(hash)
  return [...new Set([clean, formatHash0x(clean)])]
}

function isFailureReason(value: unknown): value is FailureReason {
  return (
    typeof value === "string" &&
    (VALID_FAILURE_REASONS as readonly string[]).includes(value)
  )
}

async function withTimeout<T>(fn: () => Promise<T>, ms: number): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error("TIMEOUT")), ms)
  })
  try {
    return await Promise.race([fn(), timeoutPromise])
  } finally {
    if (timeoutId) clearTimeout(timeoutId)
  }
}

function rateHeaders(rl: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Remaining": String(rl.remaining ?? 0),
    "X-RateLimit-Reset": String(rl.reset ?? 0),
  }
}

function getRetryAfterSeconds(reset?: number): string {
  if (typeof reset !== "number" || !Number.isFinite(reset)) return "60"
  const diffMs = Math.max(0, reset - Date.now())
  const seconds = Math.ceil(diffMs / 1000)
  return String(seconds || 1)
}

function responseHeaders(
  rl: RateLimitResult,
  requestId: string,
  extraHeaders?: Record<string, string>
): Record<string, string> {
  return {
    ...rateHeaders(rl),
    "X-Request-ID": requestId,
    "Cache-Control": "no-store",
    ...(extraHeaders ?? {}),
  }
}

function jsonResponse(
  body: VerifyHashResponse,
  status: number,
  rl: RateLimitResult,
  requestId: string,
  extraHeaders?: Record<string, string>
) {
  return NextResponse.json(body, {
    status,
    headers: responseHeaders(rl, requestId, extraHeaders),
  })
}

function errorResponse(
  error: string,
  status: number,
  rl: RateLimitResult,
  requestId: string,
  extra?: Partial<VerifyHashResponse>,
  extraHeaders?: Record<string, string>
) {
  return jsonResponse(
    { ok: false, valid: false, error, request_id: requestId, ...extra },
    status,
    rl,
    requestId,
    extraHeaders
  )
}

function inferValidFromStatus(status: VerificationStatus): boolean {
  return status !== "FAILED"
}

function inferRiskLevel(
  status: VerificationStatus,
  trust: TrustLevel
): "LOW" | "MEDIUM" | "HIGH" {
  if (status === "FAILED") return "HIGH"
  if (status === "WARNING") return "MEDIUM"
  if (trust === "LOW") return "HIGH"
  if (trust === "MEDIUM") return "MEDIUM"
  return "LOW"
}

function normalizeLayers(layers: unknown): LayerResult[] {
  if (!Array.isArray(layers)) return []
  return layers.filter(
    (layer): layer is LayerResult =>
      !!layer &&
      typeof layer === "object" &&
      typeof (layer as LayerResult).name === "string" &&
      typeof (layer as LayerResult).valid === "boolean"
  )
}

function normalizeReasons(reasons: unknown): FailureReason[] {
  if (!Array.isArray(reasons)) return []
  return [
    ...new Set(
      reasons.filter(isFailureReason).map((reason) => reason.trim() as FailureReason)
    ),
  ]
}

function normalizeMeta(meta: unknown): ProofMeta | undefined {
  if (!meta || typeof meta !== "object" || Array.isArray(meta)) return undefined
  return meta as ProofMeta
}

function getPolygonExplorerBase(): string {
  return (
    process.env.POLYGON_EXPLORER_URL ??
    process.env.NEXT_PUBLIC_POLYGON_EXPLORER_URL ??
    "https://polygonscan.com/tx/"
  ).trim()
}

function buildLinks(req: NextRequest, hash: string, meta?: ProofMeta) {
  const origin = new URL(req.url).origin
  const normalizedHash = normalizeHash(hash)
  const metaRecord = meta && typeof meta === "object" ? (meta as Record<string, unknown>) : {}
  const polygonBase = getPolygonExplorerBase()

  const txHash =
    typeof metaRecord.tx_hash === "string"
      ? metaRecord.tx_hash
      : typeof metaRecord.blockchain_tx === "string"
        ? metaRecord.blockchain_tx
        : null

  const eventId =
    typeof metaRecord.entity_id === "string" && metaRecord.entity_type === "event"
      ? metaRecord.entity_id
      : null

  const blockId =
    typeof metaRecord.entity_id === "string" && metaRecord.entity_type === "block"
      ? metaRecord.entity_id
      : null

  return {
    public_verify_url: `${origin}/verify/${normalizedHash}`,
    explorer_event_url: eventId ? `${origin}/explorer/event/${eventId}` : null,
    explorer_block_url: blockId ? `${origin}/explorer/block/${blockId}` : null,
    polygon_url: polygonBase && txHash ? `${polygonBase}${txHash}` : null,
  }
}

/* =========================
   RESULT ENRICH
========================= */

function enrichProofResult(
  req: NextRequest,
  hash: string,
  result: ProofResultLike,
  requestId: string,
  source: "cache" | "live"
): VerifyHashResponse {
  const layers = normalizeLayers(result.layers)
  const reasons = normalizeReasons(result.reasons)

  const score =
    typeof result.score === "number" && Number.isFinite(result.score)
      ? result.score
      : computeScore(layers, reasons)

  const status: VerificationStatus =
    result.status === "VERIFIED" || result.status === "WARNING" || result.status === "FAILED"
      ? result.status
      : getVerificationStatus(score)

  const valid =
    typeof result.valid === "boolean" ? result.valid : inferValidFromStatus(status)

  const trust: TrustLevel =
    result.trust === "HIGH" || result.trust === "MEDIUM" || result.trust === "LOW"
      ? result.trust
      : getTrustLevel(score)

  const risk = inferRiskLevel(status, trust)
  const explanation = result.explanation ?? buildExplanation({ status, score, reasons, layers })
  const baseMeta = normalizeMeta(result.meta)
  const meta: ProofMeta | undefined = baseMeta
    ? { ...baseMeta, cache_hit: source === "cache", source }
    : { cache_hit: source === "cache", source }

  const normalizedHash = normalizeHash(hash)

  return {
    ...result,
    ok: true,
    valid,
    status,
    trust,
    trust_level: trust,
    risk,
    risk_level: risk,
    score,
    reasons,
    layers,
    explanation,
    meta,
    source,
    request_id: requestId,
    hash: normalizedHash,
    hash_0x: formatHash0x(normalizedHash),
    links: buildLinks(req, normalizedHash, meta),
  }
}

/* =========================
   CANDIDATES
========================= */

function getCandidateRank(candidate: CandidateExecution): number {
  const result = candidate.result
  const score =
    typeof result.score === "number" && Number.isFinite(result.score) ? result.score : -1
  const status =
    result.status === "VERIFIED" || result.status === "WARNING" || result.status === "FAILED"
      ? result.status
      : "FAILED"
  const sourceBonus = candidate.source === "cache" ? 1 : 0
  const validBonus = result.valid === true ? 1000 : 0
  const statusBonus = status === "VERIFIED" ? 500 : status === "WARNING" ? 250 : 0
  return validBonus + statusBonus + score + sourceBonus
}

function pickBestCandidate(candidates: CandidateExecution[]): CandidateExecution | null {
  if (candidates.length === 0) return null
  return [...candidates].sort((a, b) => getCandidateRank(b) - getCandidateRank(a))[0] ?? null
}

/* =========================
   CACHE
========================= */

async function safeGetCachedProof(key: string): Promise<ProofResultLike | null> {
  try {
    return (await getCachedProof(key)) as ProofResultLike | null
  } catch (error) {
    console.warn("PROOF_CACHE_GET_ERROR", {
      key,
      error: error instanceof Error ? error.message : "UNKNOWN_ERROR",
    })
    return null
  }
}

async function safeSetCachedProof(key: string, value: ProofResultLike): Promise<void> {
  try {
    await setCachedProof(key, value)
  } catch (error) {
    console.warn("PROOF_CACHE_SET_ERROR", {
      key,
      error: error instanceof Error ? error.message : "UNKNOWN_ERROR",
    })
  }
}

/* =========================
   RESOLUTION
========================= */

async function resolveCandidates(hash: string): Promise<ResolvedCandidate[]> {
  const hashesToTry = getHashVariants(hash)

  const resolved = await Promise.all(
    ENTITY_TYPES.flatMap((entityType) =>
      hashesToTry.map(async (hashVariant) => {
        try {
          const input = await resolveProofInputByHash(hashVariant, { entity_type: entityType })
          if (!input) return null

          const cacheKey = buildProofCacheKey({
            hash: input.hash,
            entity_id: input.entity_id,
            entity_type: input.entity_type,
          })

          return { input, cacheKey }
        } catch (error) {
          console.warn("VERIFY_HASH_RESOLVE_FAIL", {
            hash: hashVariant,
            entity_type: entityType,
            error: error instanceof Error ? error.message : "UNKNOWN_ERROR",
          })
          return null
        }
      })
    )
  )

  const unique = new Map<string, ResolvedCandidate>()

  for (const candidate of resolved) {
    if (!candidate) continue
    const dedupeKey = [
      normalizeHash(candidate.input.hash),
      candidate.input.entity_id,
      candidate.input.entity_type,
    ].join(":")
    if (!unique.has(dedupeKey)) unique.set(dedupeKey, candidate)
  }

  return [...unique.values()]
}

async function tryCacheCandidates(
  resolvedCandidates: ResolvedCandidate[]
): Promise<CandidateExecution[]> {
  const candidates = await Promise.all(
    resolvedCandidates.map(async (candidate): Promise<CandidateExecution | null> => {
      const cached = await safeGetCachedProof(candidate.cacheKey)
      if (!cached) return null
      return { input: candidate.input, cacheKey: candidate.cacheKey, result: cached, source: "cache" }
    })
  )
  return candidates.filter(isCandidateExecution)
}

async function tryLiveCandidates(
  resolvedCandidates: ResolvedCandidate[]
): Promise<CandidateExecution[]> {
  const candidates = await Promise.all(
    resolvedCandidates.map(async (candidate): Promise<CandidateExecution | null> => {
      try {
        const result = await runProofEngine(candidate.input)
        await safeSetCachedProof(candidate.cacheKey, result)
        return { input: candidate.input, cacheKey: candidate.cacheKey, result, source: "live" }
      } catch (error) {
        console.warn("VERIFY_HASH_LIVE_CANDIDATE_FAIL", {
          entity_id: candidate.input.entity_id,
          entity_type: candidate.input.entity_type,
          error: error instanceof Error ? error.message : "UNKNOWN_ERROR",
        })
        return null
      }
    })
  )
  return candidates.filter(isCandidateExecution)
}

/* =========================
   GET
========================= */

export async function GET(
  req: NextRequest,
  context: { params: Promise<VerifyHashParams> }
) {
  // Imports dinâmicos apenas para módulos que só são usados dentro do handler
  const { verifyEnv } = await import("@/lib/config/env")
  const { rateLimit } = await import("@/lib/security/rateLimit")

  const ENGINE_TIMEOUT_MS = verifyEnv.engineTimeoutMs
  const requestId = randomUUID()

  try {
    const ip = getIP(req)
    const rl = (await rateLimit(ip)) as RateLimitResult

    if (!rl.allowed) {
      return errorResponse("RATE_LIMIT_EXCEEDED", 429, rl, requestId, undefined, {
        "Retry-After": getRetryAfterSeconds(rl.reset),
      })
    }

    const { hash: rawHash } = await context.params
    const hash = normalizeHash(rawHash)

    if (!hash || !isValidHash(hash)) {
      return errorResponse("INVALID_HASH_FORMAT", 400, rl, requestId, { hash })
    }

    const resolvedCandidates = await resolveCandidates(hash)

    if (resolvedCandidates.length === 0) {
      return errorResponse("PROOF_NOT_FOUND", 404, rl, requestId, {
        hash,
        hash_0x: formatHash0x(hash),
        debug: { tried_hashes: getHashVariants(hash), entity_types: ENTITY_TYPES },
      })
    }

    const cachedCandidates = await tryCacheCandidates(resolvedCandidates)
    const cachedBest = pickBestCandidate(cachedCandidates)

    if (cachedBest) {
      return jsonResponse(
        enrichProofResult(req, hash, cachedBest.result, requestId, "cache"),
        200, rl, requestId
      )
    }

    try {
      const liveCandidates = await withTimeout(() => tryLiveCandidates(resolvedCandidates), ENGINE_TIMEOUT_MS)
      const liveBest = pickBestCandidate(liveCandidates)

      if (liveBest) {
        return jsonResponse(
          enrichProofResult(req, hash, liveBest.result, requestId, "live"),
          200, rl, requestId
        )
      }
    } catch (error) {
      if (!(error instanceof Error) || error.message !== "TIMEOUT") {
        console.warn("VERIFY_HASH_SYNC_FAIL", {
          requestId,
          hash,
          error: error instanceof Error ? error.message : error,
        })
      }
    }

    try {
      await Promise.all(resolvedCandidates.map((candidate) => enqueueProof(candidate.input)))
    } catch (error) {
      console.error("VERIFY_HASH_QUEUE_ERROR", {
        requestId,
        hash,
        error: error instanceof Error ? error.message : error,
      })
      return errorResponse("QUEUE_FAILED", 500, rl, requestId, {
        hash,
        hash_0x: formatHash0x(hash),
      })
    }

    return jsonResponse(
      {
        ok: true,
        valid: null,
        pending: true,
        status: "PENDING",
        message: "Proof verification queued for asynchronous processing",
        source: "queue",
        request_id: requestId,
        hash,
        hash_0x: formatHash0x(hash),
        links: buildLinks(req, hash),
      },
      202, rl, requestId
    )
  } catch (error) {
    console.error("VERIFY_HASH_ROUTE_ERROR", {
      requestId,
      error: error instanceof Error ? error.message : error,
    })
    return NextResponse.json(
      { ok: false, valid: false, error: "INTERNAL_ERROR", request_id: requestId },
      { status: 500, headers: { "X-Request-ID": requestId, "Cache-Control": "no-store" } }
    )
  }
}

/* =========================
   POST DISABLED
========================= */

export async function POST() {
  return NextResponse.json(
    { ok: false, valid: false, error: "METHOD_NOT_ALLOWED" },
    { status: 405, headers: { Allow: "GET", "Cache-Control": "no-store" } }
  )
}