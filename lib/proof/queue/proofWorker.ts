// @ts-nocheck
import { Worker, type Job } from "bullmq"

import { redis } from "../cache/redis"
import {
  buildProofCacheKey,
  setCachedProof
} from "../cache/proofCache"
import { runProofEngine } from "../engine"
import { buildExplanation } from "../explanation"
import {
  computeScore,
  getTrustLevel,
  getVerificationStatus
} from "../score"
import type {
  EntityType,
  FailureReason,
  LayerResult,
  ProofInput,
  ProofResultLike,
  TrustLevel,
  VerificationStatus
} from "../types"

/* =========================
   CONFIG
========================= */

const WORKER_NAME = "proof-queue"
const WORKER_CONCURRENCY = 5

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
  "LAYER_TIMEOUT"
]

const ALLOWED_ENTITY_TYPES: readonly EntityType[] = [
  "event",
  "campaign",
  "block"
]

/* =========================
   HELPERS
========================= */

function isFailureReason(value: unknown): value is FailureReason {
  return (
    typeof value === "string" &&
    (VALID_FAILURE_REASONS as readonly string[]).includes(value)
  )
}

function isEntityType(value: unknown): value is EntityType {
  return (
    typeof value === "string" &&
    (ALLOWED_ENTITY_TYPES as readonly string[]).includes(value)
  )
}

function normalizeHash(value: string): string {
  return value.trim().toLowerCase().replace(/^0x/, "")
}

function isValidHash(value: string): boolean {
  return /^[a-f0-9]{64}$/i.test(normalizeHash(value))
}

function isValidProofInput(input: unknown): input is ProofInput {
  if (!input || typeof input !== "object") {
    return false
  }

  const candidate = input as Partial<ProofInput>

  return (
    typeof candidate.hash === "string" &&
    candidate.hash.trim().length > 0 &&
    isValidHash(candidate.hash) &&
    typeof candidate.entity_id === "string" &&
    candidate.entity_id.trim().length > 0 &&
    isEntityType(candidate.entity_type)
  )
}

function normalizeProofInput(input: ProofInput): ProofInput {
  return {
    hash: normalizeHash(input.hash),
    entity_id: String(input.entity_id).trim(),
    entity_type: input.entity_type,
    payload: input.payload
  }
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
      reasons
        .filter(isFailureReason)
        .map((reason) => reason.trim() as FailureReason)
    )
  ]
}

function inferValidFromStatus(status: VerificationStatus): boolean {
  return status !== "FAILED"
}

function enrichProofResult(result: ProofResultLike): ProofResultLike {
  const layers = normalizeLayers(result.layers)
  const reasons = normalizeReasons(result.reasons)

  const score =
    typeof result.score === "number" && Number.isFinite(result.score)
      ? result.score
      : computeScore(layers, reasons)

  const status: VerificationStatus =
    result.status === "VERIFIED" ||
    result.status === "WARNING" ||
    result.status === "FAILED"
      ? result.status
      : getVerificationStatus(score)

  const valid =
    typeof result.valid === "boolean"
      ? result.valid
      : inferValidFromStatus(status)

  const trust: TrustLevel =
    result.trust === "HIGH" ||
    result.trust === "MEDIUM" ||
    result.trust === "LOW"
      ? result.trust
      : getTrustLevel(score)

  const explanation =
    result.explanation ??
    buildExplanation({
      status,
      score,
      reasons,
      layers
    })

  return {
    ...result,
    valid,
    layers,
    reasons,
    score,
    trust,
    status,
    explanation
  }
}

function sanitizeJobDataForLog(data: unknown): Record<string, unknown> | null {
  if (!data || typeof data !== "object") {
    return null
  }

  const candidate = data as Partial<ProofInput>

  return {
    hash: typeof candidate.hash === "string" ? normalizeHash(candidate.hash) : null,
    entity_id:
      typeof candidate.entity_id === "string" ? candidate.entity_id.trim() : null,
    entity_type: isEntityType(candidate.entity_type) ? candidate.entity_type : null
  }
}

/* =========================
   WORKER
========================= */

async function processProofJob(job: Job<ProofInput>) {
  const startedAt = Date.now()

  if (!isValidProofInput(job.data)) {
    throw new Error("INVALID_QUEUE_JOB_INPUT")
  }

  const input = normalizeProofInput(job.data)

  const result = await runProofEngine(input)
  const enriched = enrichProofResult(result)

  const cacheKey = buildProofCacheKey({
    hash: input.hash,
    entity_id: input.entity_id,
    entity_type: input.entity_type
  })

  await setCachedProof(cacheKey, enriched)

  return {
    ok: true,
    cache_key: cacheKey,
    entity_id: input.entity_id,
    entity_type: input.entity_type,
    hash: input.hash,
    status: enriched.status ?? "FAILED",
    score:
      typeof enriched.score === "number" && Number.isFinite(enriched.score)
        ? enriched.score
        : 0,
    execution_ms: Date.now() - startedAt
  }
}

export const proofWorker = new Worker<ProofInput>(
  WORKER_NAME,
  async (job) => {
    return processProofJob(job)
  },
  {
    connection: redis,
    concurrency: WORKER_CONCURRENCY
  }
)

/* =========================
   EVENTS
========================= */

proofWorker.on("completed", (job, result) => {
  console.log("PROOF_WORKER_COMPLETED", {
    jobId: job.id,
    name: job.name,
    result
  })
})

proofWorker.on("failed", (job, error) => {
  console.error("PROOF_WORKER_FAILED", {
    jobId: job?.id,
    name: job?.name,
    data: sanitizeJobDataForLog(job?.data),
    error: error instanceof Error ? error.message : "UNKNOWN_ERROR"
  })
})

proofWorker.on("error", (error) => {
  console.error("PROOF_WORKER_ERROR", {
    error: error instanceof Error ? error.message : "UNKNOWN_ERROR"
  })
})
