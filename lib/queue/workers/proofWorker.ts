import { Worker, type Job } from "bullmq"
import { createHash } from "crypto"
import { getRedis } from "@/lib/redis"
import { runProofEngine } from "../engine"
import { setCachedProof, getCachedProof } from "../cache/proofCache"
import { getSigner } from "@/lib/domain/proof/getSigner"
import { getActiveKey } from "@/lib/domain/proof/keyRegistry"
import { increment, observe } from "@/lib/observability/metrics"
import { log } from "@/lib/observability/logger"

type ProofJobData = {
  input: Record<string, unknown>
  traceId?: string
}

type ProofResult = {
  score: number
  valid: boolean
  status: string
  trust: string
  reasons: string[]
  layers: unknown[]
  explanation?: unknown
  meta?: unknown
  [key: string]: unknown
}

type ProofBundle = ProofResult & {
  signature: unknown
  keyId: string
  timestamp: number
  root: string
}

function isValidJob(data: unknown): data is ProofJobData {
  return (
    data !== null &&
    typeof data === "object" &&
    "input" in data &&
    (data as ProofJobData).input !== undefined
  )
}

function isValidProofResult(result: unknown): result is ProofResult {
  return (
    result !== null &&
    typeof result === "object" &&
    typeof (result as ProofResult).score === "number"
  )
}

function buildPayload(root: string, timestamp: number): string {
  return JSON.stringify({ root, timestamp })
}

function buildScoreHash(score: number, timestamp: number): string {
  return createHash("sha256")
    .update(String(score) + String(timestamp))
    .digest("hex")
}

function getCacheKey(input: Record<string, unknown>): string {
  return String(input?.hash ?? "")
}

let _proofWorker: Worker | null = null

export function getProofWorker(): Worker {
  if (!_proofWorker) {
    _proofWorker = new Worker(
      "proof-queue",
      async (job: Job<ProofJobData>) => {
        const start = Date.now()
        const traceId = job.data?.traceId ?? `proof-${job.id}`

        try {
          if (!isValidJob(job.data)) {
            throw new Error("Invalid proof job payload")
          }

          const { input } = job.data

          log("PROOF_JOB_START", { traceId, jobId: job.id })
          increment("proof_jobs_started")

          /* ── Cache check ── */
          const cacheKey = getCacheKey(input)
          const cached = await getCachedProof(cacheKey)
          if (cached) {
            log("PROOF_CACHE_HIT", { traceId })
            return cached
          }

          /* ── Engine ── */
          const result = await runProofEngine(input)

          if (!isValidProofResult(result)) {
            throw new Error("Invalid proof engine result")
          }

          /* ── Timestamp ── */
          const timestamp = Math.floor(Date.now() / 1000)

          /* ── Root hash ── */
          const root = buildScoreHash(result.score, timestamp)

          /* ── Signature ── */
          const payload = buildPayload(root, timestamp)
          const signer = getSigner()
          const { keyId } = getActiveKey()
          const signature = await signer.sign(payload)

          /* ── Proof bundle ── */
          const proofBundle: ProofBundle = {
            ...result,
            root,
            signature,
            keyId,
            timestamp,
          }

          /* ── Cache write ── */
          await setCachedProof(cacheKey, proofBundle)

          increment("proof_jobs_success")
          log("PROOF_JOB_SUCCESS", {
            traceId,
            jobId: job.id,
            score: result.score,
            root,
            keyId,
          })

          return proofBundle
        } catch (err: unknown) {
          const error = err instanceof Error ? err : new Error(String(err))

          increment("proof_jobs_failed")
          log("PROOF_JOB_ERROR", {
            traceId,
            jobId: job.id,
            error: error.message,
            stack: error.stack,
          })

          throw err
        } finally {
          observe("proof_job_duration_ms", Date.now() - start)
        }
      },
      {
        connection: getRedis(),
        concurrency: 5,
        stalledInterval: 60_000,
        lockDuration: 60_000,
        limiter: {
          max: 50,
          duration: 1000,
        },
      }
    )

    _proofWorker.on("completed", (job) => {
      log("PROOF_JOB_COMPLETED", { jobId: job.id })
    })

    _proofWorker.on("failed", (job, err) => {
      log("PROOF_JOB_FAILED", {
        jobId: job?.id,
        error: err.message,
      })
    })

    _proofWorker.on("error", (err) => {
      console.error("PROOF_WORKER_ERROR:", err)
    })
  }

  return _proofWorker
}

export const proofWorker = new Proxy({} as Worker, {
  get(_, prop) {
    const w = getProofWorker()
    const value = w[prop as keyof Worker]
    return typeof value === "function" ? (value as Function).bind(w) : value
  },
})