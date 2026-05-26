import { createHash } from "crypto"
import { Queue } from "bullmq"
import type { EntityType, ProofInput } from "../types"
import { getRedis } from "@/lib/redis"

/* =========================
   TYPES
========================= */

export type ProofQueueJobName = "verify"
export type ProofQueuePayload = ProofInput

/* =========================
   CONFIG
========================= */

const QUEUE_NAME = "proof-queue"
const JOB_PRIORITY = 1
const JOB_ATTEMPTS = 3
const JOB_BACKOFF_DELAY_MS = 2_000
const REMOVE_ON_COMPLETE_COUNT = 100
const REMOVE_ON_FAIL_COUNT = 500

const ALLOWED_ENTITY_TYPES: readonly EntityType[] = ["event", "campaign", "block"]

/* =========================
   QUEUE (lazy)
========================= */

let _proofQueue: Queue<ProofQueuePayload, void, ProofQueueJobName> | null = null

export function getProofQueue(): Queue<ProofQueuePayload, void, ProofQueueJobName> {
  if (!_proofQueue) {
    _proofQueue = new Queue<ProofQueuePayload, void, ProofQueueJobName>(
      QUEUE_NAME,
      {
        connection: getRedis(),
        defaultJobOptions: {
          attempts: JOB_ATTEMPTS,
          backoff: {
            type: "exponential",
            delay: JOB_BACKOFF_DELAY_MS,
          },
          removeOnComplete: REMOVE_ON_COMPLETE_COUNT,
          removeOnFail: REMOVE_ON_FAIL_COUNT,
        },
      }
    )
  }
  return _proofQueue
}

// Proxy para compatibilidade com imports existentes
export const proofQueue = new Proxy(
  {} as Queue<ProofQueuePayload, void, ProofQueueJobName>,
  {
    get(_, prop) {
      const q = getProofQueue()
      const value = q[prop as keyof typeof q]
      return typeof value === "function" ? (value as Function).bind(q) : value
    },
  }
)

/* =========================
   HELPERS
========================= */

function normalizeHash(value: string): string {
  return value.trim().toLowerCase().replace(/^0x/, "")
}

function isValidHash(value: string): boolean {
  return /^[a-f0-9]{64}$/i.test(normalizeHash(value))
}

function normalizeEntityId(value: string): string {
  return value.trim()
}

function isEntityType(value: unknown): value is EntityType {
  return (
    typeof value === "string" &&
    (ALLOWED_ENTITY_TYPES as readonly string[]).includes(value)
  )
}

function isValidInput(input: unknown): input is ProofInput {
  if (!input || typeof input !== "object") return false

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

function normalizeInput(input: ProofInput): ProofInput {
  return {
    hash: normalizeHash(input.hash),
    entity_id: normalizeEntityId(input.entity_id),
    entity_type: input.entity_type,
    payload: input.payload,
  }
}

function buildJobId(input: ProofInput): string {
  const normalized = normalizeInput(input)
  const raw = `${normalized.entity_type}:${normalized.entity_id}:${normalized.hash}`
  return createHash("sha256").update(raw).digest("hex")
}

function isDuplicateJobError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false

  const message =
    "message" in error && typeof error.message === "string"
      ? error.message
      : ""

  return (
    message.includes("JobId") ||
    message.includes("jobId") ||
    message.includes("already exists")
  )
}

/* =========================
   ENQUEUE
========================= */

export async function enqueueProof(input: unknown): Promise<void> {
  if (!isValidInput(input)) {
    throw new Error("INVALID_QUEUE_INPUT")
  }

  const normalized = normalizeInput(input)
  const jobId = buildJobId(normalized)

  try {
    await getProofQueue().add("verify", normalized, {
      jobId,
      priority: JOB_PRIORITY,
    })
  } catch (error) {
    if (isDuplicateJobError(error)) return

    console.error("QUEUE_ENQUEUE_ERROR", {
      queue: QUEUE_NAME,
      jobId,
      hash: normalized.hash,
      entity_id: normalized.entity_id,
      entity_type: normalized.entity_type,
      error: error instanceof Error ? error.message : "UNKNOWN_ERROR",
    })

    throw error
  }
}