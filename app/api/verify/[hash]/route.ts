import { randomUUID } from "crypto"
import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"
import { pool } from "@/lib/db"
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
  "ICP_FAIL", "MERKLE_FAIL", "BLOCKCHAIN_FAIL", "INVALID_SIGNATURE",
  "CHAIN_INVALID", "CERT_REVOKED", "CERT_EXPIRED", "HASH_MISMATCH",
  "PROOF_NOT_FOUND", "INVALID_INPUT", "INVALID_MERKLE_ROOT",
  "INVALID_MERKLE_PROOF", "INVALID_BLOCKCHAIN_TX", "RPC_UNAVAILABLE", "LAYER_TIMEOUT",
]

/* =========================
   TYPES
========================= */

type RateLimitResult = { allowed: boolean; remaining?: number; reset?: number }
type VerifyHashParams = { hash: string }
type VerifyHashResponse = {
  ok?: boolean; valid?: boolean | null; pending?: boolean
  status?: VerificationStatus | "PENDING"; trust?: TrustLevel; trust_level?: TrustLevel
  risk?: "LOW" | "MEDIUM" | "HIGH"; risk_level?: "LOW" | "MEDIUM" | "HIGH"
  score?: number; reasons?: FailureReason[]; explanation?: unknown; layers?: LayerResult[]
  meta?: ProofMeta & Record<string, unknown>; message?: string; error?: string
  source?: "cache" | "live" | "queue"; request_id: string; hash?: string; hash_0x?: string
  links?: { public_verify_url?: string; explorer_event_url?: string | null; explorer_block_url?: string | null; polygon_url?: string | null }
  [key: string]: unknown
}
type ResolvedCandidate = { input: ProofInput; cacheKey: string }
type CandidateExecution = { input: ProofInput; cacheKey: string; result: ProofResultLike; source: "cache" | "live" }

/* =========================
   HELPERS
========================= */

function isCandidateExecution(v: CandidateExecution | null): v is CandidateExecution { return v !== null }

function getIP(req: NextRequest): string {
  const ff = req.headers.get("x-forwarded-for")
  const ri = req.headers.get("x-real-ip")
  if (ff) { const ip = ff.split(",")[0]?.trim(); if (ip) return ip }
  if (ri?.trim()) return ri.trim()
  return "unknown"
}

function normalizeHash(value: string): string {
  return String(value ?? "").trim().toLowerCase().replace(/^0x/, "")
}

function formatHash0x(hash: string): string { return `0x${normalizeHash(hash)}` }
function isValidHash(hash: string): boolean { return /^[a-f0-9]{64}$/i.test(normalizeHash(hash)) }
function getHashVariants(hash: string): string[] {
  const clean = normalizeHash(hash)
  return [...new Set([clean, formatHash0x(clean)])]
}

function isFailureReason(v: unknown): v is FailureReason {
  return typeof v === "string" && (VALID_FAILURE_REASONS as readonly string[]).includes(v)
}

async function withTimeout<T>(fn: () => Promise<T>, ms: number): Promise<T> {
  let tid: ReturnType<typeof setTimeout> | undefined
  const t = new Promise<never>((_, rej) => { tid = setTimeout(() => rej(new Error("TIMEOUT")), ms) })
  try { return await Promise.race([fn(), t]) } finally { if (tid) clearTimeout(tid) }
}

function rateHeaders(rl: RateLimitResult): Record<string, string> {
  return { "X-RateLimit-Remaining": String(rl.remaining ?? 0), "X-RateLimit-Reset": String(rl.reset ?? 0) }
}

function getRetryAfterSeconds(reset?: number): string {
  if (typeof reset !== "number" || !Number.isFinite(reset)) return "60"
  return String(Math.ceil(Math.max(0, reset - Date.now()) / 1000) || 1)
}

function responseHeaders(rl: RateLimitResult, requestId: string, extra?: Record<string, string>): Record<string, string> {
  return { ...rateHeaders(rl), "X-Request-ID": requestId, "Cache-Control": "no-store", ...(extra ?? {}) }
}

function jsonResponse(body: VerifyHashResponse, status: number, rl: RateLimitResult, requestId: string, extra?: Record<string, string>) {
  return NextResponse.json(body, { status, headers: responseHeaders(rl, requestId, extra) })
}

function errorResponse(error: string, status: number, rl: RateLimitResult, requestId: string, extra?: Partial<VerifyHashResponse>, extraH?: Record<string, string>) {
  return jsonResponse({ ok: false, valid: false, error, request_id: requestId, ...extra }, status, rl, requestId, extraH)
}

function inferValidFromStatus(s: VerificationStatus): boolean { return s !== "FAILED" }

function inferRiskLevel(s: VerificationStatus, t: TrustLevel): "LOW" | "MEDIUM" | "HIGH" {
  if (s === "FAILED") return "HIGH"
  if (s === "WARNING") return "MEDIUM"
  if (t === "LOW") return "HIGH"
  if (t === "MEDIUM") return "MEDIUM"
  return "LOW"
}

function normalizeLayers(layers: unknown): LayerResult[] {
  if (!Array.isArray(layers)) return []
  return layers.filter((l): l is LayerResult => !!l && typeof l === "object" && typeof (l as LayerResult).name === "string" && typeof (l as LayerResult).valid === "boolean")
}

function normalizeReasons(reasons: unknown): FailureReason[] {
  if (!Array.isArray(reasons)) return []
  return [...new Set(reasons.filter(isFailureReason).map(r => r.trim() as FailureReason))]
}

function normalizeMeta(meta: unknown): ProofMeta | undefined {
  if (!meta || typeof meta !== "object" || Array.isArray(meta)) return undefined
  return meta as ProofMeta
}

function getPolygonExplorerBase(): string {
  return (process.env.POLYGON_EXPLORER_URL ?? process.env.NEXT_PUBLIC_POLYGON_EXPLORER_URL ?? "https://polygonscan.com/tx/").trim()
}

function buildLinks(req: NextRequest, hash: string, meta?: ProofMeta) {
  const origin = new URL(req.url).origin
  const h = normalizeHash(hash)
  const m = meta && typeof meta === "object" ? (meta as Record<string, unknown>) : {}
  const pb = getPolygonExplorerBase()
  const tx = typeof m.tx_hash === "string" ? m.tx_hash : typeof m.blockchain_tx === "string" ? m.blockchain_tx : null
  const eid = typeof m.entity_id === "string" && m.entity_type === "event" ? m.entity_id : null
  const bid = typeof m.entity_id === "string" && m.entity_type === "block" ? m.entity_id : null
  return {
    public_verify_url: `${origin}/verify/${h}`,
    explorer_event_url: eid ? `${origin}/explorer/event/${eid}` : null,
    explorer_block_url: bid ? `${origin}/explorer/block/${bid}` : null,
    polygon_url: pb && tx ? `${pb}${tx}` : null,
  }
}

/* =========================
   INLINE RESOLUTION
   (Supabase admin client inline aqui — sem depender de
   lib/proof/adapters/supabase, webpack não inclui Proxy lazy-loaded daquele
   módulo. O pool de Postgres usa o cliente oficial compartilhado de
   @/lib/db, importado no topo do arquivo.)
========================= */

function getSupabaseAdmin() {
  return createClient(
    process.env.SUPABASE_URL ?? "",
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
    { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }
  )
}

async function resolveFromEventChain(hash: string): Promise<ProofInput | null> {
  try {
    const result = await pool.query(
      `SELECT e.event_id::text, e.event_hash, b.merkle_root, b.tx_hash
       FROM public.event_chain e
       LEFT JOIN public.event_blocks b ON b.id = e.block_id
       WHERE lower(replace(e.event_hash, '0x', '')) = $1
       LIMIT 1`,
      [hash]
    )
    const row = result.rows[0]
    if (!row?.event_id) return null
    return { hash, entity_id: row.event_id, entity_type: "event" }
  } catch {
    return null
  }
}

async function resolveFromEventBlocks(hash: string): Promise<ProofInput | null> {
  try {
    const result = await pool.query(
      `SELECT id::text FROM public.event_blocks
       WHERE lower(replace(coalesce(block_hash,''), '0x', '')) = $1
          OR lower(replace(coalesce(merkle_root,''), '0x', '')) = $1
          OR lower(replace(coalesce(tx_hash,''), '0x', '')) = $1
       LIMIT 1`,
      [hash]
    )
    const row = result.rows[0]
    if (!row?.id) return null
    return { hash, entity_id: row.id, entity_type: "block" }
  } catch {
    return null
  }
}

async function resolveFromCertifications(hash: string): Promise<ProofInput | null> {
  try {
    const s = getSupabaseAdmin()
    const { data } = await s
      .from("certifications")
      .select("entity_id, entity_type, content_hash")
      .eq("content_hash", hash)
      .in("entity_type", ["event", "campaign", "block"])
      .order("created_at", { ascending: false })
      .limit(5)
    if (!data || data.length === 0) return null
    for (const row of data) {
      if (row.entity_id && row.entity_type) {
        return { hash: row.content_hash ?? hash, entity_id: row.entity_id, entity_type: row.entity_type as EntityType }
      }
    }
    return null
  } catch {
    return null
  }
}

async function resolveFromDigitalCertifications(hash: string): Promise<ProofInput | null> {
  try {
    const s = getSupabaseAdmin()
    const { data } = await s
      .from("digital_certifications")
      .select("id, content_hash, event, is_public")
      .eq("content_hash", hash)
      .eq("is_public", true)
      .limit(5)
    if (!data || data.length === 0) return null
    for (const row of data) {
      const entityId = row.event?.event_id ?? row.id
      if (entityId) {
        return { hash: row.content_hash ?? hash, entity_id: entityId, entity_type: "event" }
      }
    }
    return null
  } catch {
    return null
  }
}

async function resolveProofInput(hash: string): Promise<ProofInput | null> {
  const clean = normalizeHash(hash)
  if (!clean || !isValidHash(clean)) return null

  // 1. event_chain (fonte primária)
  const fromEvent = await resolveFromEventChain(clean)
  if (fromEvent) return fromEvent

  // 2. event_blocks
  const fromBlock = await resolveFromEventBlocks(clean)
  if (fromBlock) return fromBlock

  // 3. certifications (schema antigo)
  const fromCert = await resolveFromCertifications(clean)
  if (fromCert) return fromCert

  // 4. digital_certifications (schema novo)
  const fromDigital = await resolveFromDigitalCertifications(clean)
  if (fromDigital) return fromDigital

  return null
}

/* =========================
   RESULT ENRICH
========================= */

function enrichProofResult(req: NextRequest, hash: string, result: ProofResultLike, requestId: string, source: "cache" | "live"): VerifyHashResponse {
  const layers = normalizeLayers(result.layers)
  const reasons = normalizeReasons(result.reasons)
  const score = typeof result.score === "number" && Number.isFinite(result.score) ? result.score : computeScore(layers, reasons)
  const status: VerificationStatus = result.status === "VERIFIED" || result.status === "WARNING" || result.status === "FAILED" ? result.status : getVerificationStatus(score)
  const valid = typeof result.valid === "boolean" ? result.valid : inferValidFromStatus(status)
  const trust: TrustLevel = result.trust === "HIGH" || result.trust === "MEDIUM" || result.trust === "LOW" ? result.trust : getTrustLevel(score)
  const risk = inferRiskLevel(status, trust)
  const explanation = result.explanation ?? buildExplanation({ status, score, reasons, layers })
  const baseMeta = normalizeMeta(result.meta)
  const meta: ProofMeta | undefined = baseMeta ? { ...baseMeta, cache_hit: source === "cache", source } : { cache_hit: source === "cache", source }
  const h = normalizeHash(hash)
  return { ...result, ok: true, valid, status, trust, trust_level: trust, risk, risk_level: risk, score, reasons, layers, explanation, meta, source, request_id: requestId, hash: h, hash_0x: formatHash0x(h), links: buildLinks(req, h, meta) }
}

/* =========================
   CANDIDATES
========================= */

function getCandidateRank(c: CandidateExecution): number {
  const r = c.result
  const score = typeof r.score === "number" && Number.isFinite(r.score) ? r.score : -1
  const status = r.status === "VERIFIED" || r.status === "WARNING" || r.status === "FAILED" ? r.status : "FAILED"
  return (r.valid === true ? 1000 : 0) + (status === "VERIFIED" ? 500 : status === "WARNING" ? 250 : 0) + score + (c.source === "cache" ? 1 : 0)
}

function pickBestCandidate(cs: CandidateExecution[]): CandidateExecution | null {
  if (cs.length === 0) return null
  return [...cs].sort((a, b) => getCandidateRank(b) - getCandidateRank(a))[0] ?? null
}

/* =========================
   CACHE
========================= */

async function safeGetCachedProof(key: string): Promise<ProofResultLike | null> {
  try { return (await getCachedProof(key)) as ProofResultLike | null } catch { return null }
}

async function safeSetCachedProof(key: string, value: ProofResultLike): Promise<void> {
  try { await setCachedProof(key, value) } catch { /* ignore */ }
}

/* =========================
   RESOLUTION
========================= */

async function resolveCandidates(hash: string): Promise<ResolvedCandidate[]> {
  const hashesToTry = getHashVariants(hash)
  const unique = new Map<string, ResolvedCandidate>()

  await Promise.all(
    hashesToTry.map(async (hashVariant) => {
      try {
        const input = await resolveProofInput(hashVariant)
        if (!input) return
        const cacheKey = buildProofCacheKey({ hash: input.hash, entity_id: input.entity_id, entity_type: input.entity_type })
        const dedupeKey = [normalizeHash(input.hash), input.entity_id, input.entity_type].join(":")
        if (!unique.has(dedupeKey)) unique.set(dedupeKey, { input, cacheKey })
      } catch (error) {
        console.warn("VERIFY_HASH_RESOLVE_FAIL", { hash: hashVariant, error: error instanceof Error ? error.message : "UNKNOWN_ERROR" })
      }
    })
  )

  return [...unique.values()]
}

async function tryCacheCandidates(candidates: ResolvedCandidate[]): Promise<CandidateExecution[]> {
  const results = await Promise.all(candidates.map(async (c): Promise<CandidateExecution | null> => {
    const cached = await safeGetCachedProof(c.cacheKey)
    if (!cached) return null
    return { input: c.input, cacheKey: c.cacheKey, result: cached, source: "cache" }
  }))
  return results.filter(isCandidateExecution)
}

async function tryLiveCandidates(candidates: ResolvedCandidate[]): Promise<CandidateExecution[]> {
  const results = await Promise.all(candidates.map(async (c): Promise<CandidateExecution | null> => {
    try {
      const result = await runProofEngine(c.input)
      await safeSetCachedProof(c.cacheKey, result)
      return { input: c.input, cacheKey: c.cacheKey, result, source: "live" }
    } catch (error) {
      console.warn("VERIFY_HASH_LIVE_CANDIDATE_FAIL", { entity_id: c.input.entity_id, entity_type: c.input.entity_type, error: error instanceof Error ? error.message : "UNKNOWN_ERROR" })
      return null
    }
  }))
  return results.filter(isCandidateExecution)
}

/* =========================
   GET
========================= */

export async function GET(req: NextRequest, context: { params: Promise<VerifyHashParams> }) {
  const { verifyEnv } = await import("@/lib/config/env")
  const { rateLimit } = await import("@/lib/security/rateLimit")
  const ENGINE_TIMEOUT_MS = verifyEnv.engineTimeoutMs
  const requestId = randomUUID()

  try {
    const ip = getIP(req)
    const rl = (await rateLimit(ip)) as RateLimitResult

    if (!rl.allowed) {
      return errorResponse("RATE_LIMIT_EXCEEDED", 429, rl, requestId, undefined, { "Retry-After": getRetryAfterSeconds(rl.reset) })
    }

    const { hash: rawHash } = await context.params
    const hash = normalizeHash(rawHash)

    if (!hash || !isValidHash(hash)) {
      return errorResponse("INVALID_HASH_FORMAT", 400, rl, requestId, { hash })
    }

    const resolvedCandidates = await resolveCandidates(hash)

    if (resolvedCandidates.length === 0) {
      return errorResponse("PROOF_NOT_FOUND", 404, rl, requestId, {
        hash, hash_0x: formatHash0x(hash),
        debug: { tried_hashes: getHashVariants(hash), entity_types: ENTITY_TYPES },
      })
    }

    const cachedCandidates = await tryCacheCandidates(resolvedCandidates)
    const cachedBest = pickBestCandidate(cachedCandidates)
    if (cachedBest) {
      return jsonResponse(enrichProofResult(req, hash, cachedBest.result, requestId, "cache"), 200, rl, requestId)
    }

    try {
      const liveCandidates = await withTimeout(() => tryLiveCandidates(resolvedCandidates), ENGINE_TIMEOUT_MS)
      const liveBest = pickBestCandidate(liveCandidates)
      if (liveBest) {
        return jsonResponse(enrichProofResult(req, hash, liveBest.result, requestId, "live"), 200, rl, requestId)
      }
    } catch (error) {
      if (!(error instanceof Error) || error.message !== "TIMEOUT") {
        console.warn("VERIFY_HASH_SYNC_FAIL", { requestId, hash, error: error instanceof Error ? error.message : error })
      }
    }

    try {
      await Promise.all(resolvedCandidates.map(c => enqueueProof(c.input)))
    } catch (error) {
      console.error("VERIFY_HASH_QUEUE_ERROR", { requestId, hash, error: error instanceof Error ? error.message : error })
      return errorResponse("QUEUE_FAILED", 500, rl, requestId, { hash, hash_0x: formatHash0x(hash) })
    }

    return jsonResponse({
      ok: true, valid: null, pending: true, status: "PENDING",
      message: "Proof verification queued for asynchronous processing",
      source: "queue", request_id: requestId, hash, hash_0x: formatHash0x(hash), links: buildLinks(req, hash),
    }, 202, rl, requestId)

  } catch (error) {
    console.error("VERIFY_HASH_ROUTE_ERROR", { requestId, error: error instanceof Error ? error.message : error })
    return NextResponse.json({ ok: false, valid: false, error: "INTERNAL_ERROR", request_id: requestId },
      { status: 500, headers: { "X-Request-ID": requestId, "Cache-Control": "no-store" } })
  }
}

/* =========================
   POST DISABLED
========================= */

export async function POST() {
  return NextResponse.json({ ok: false, valid: false, error: "METHOD_NOT_ALLOWED" },
    { status: 405, headers: { Allow: "GET", "Cache-Control": "no-store" } })
}