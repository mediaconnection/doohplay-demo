import { Worker, type Job } from "bullmq"
import { getRedis } from "@/lib/redis"
import { runProofEngine } from "../engine"
import { setCachedProof } from "../cache/proofCache"
import { log } from "@/lib/observability/logger"
import { increment, observe } from "@/lib/observability/metrics"

/* =========================
   TYPES
========================= */

type ProofJobData = {
  input: Record<string, unknown>
  traceId?: string
}

/* =========================
   VALIDATION
========================= */

function isValidJob(data: unknown): data is ProofJobData {
  return (
    data !== null &&
    typeof data === "object" &&
    "input" in data &&
    (data as ProofJobData).input !== undefined
  )
}

/* =========================
   WORKER (lazy)
========================= */

let _proofWorker: Worker | null = null

export function getProofWorker(): Worker {
  if (!_proofWorker) {
    _proofWorker = new Worker(
      "proof-queue",
      async (job: Job<ProofJobData>) => {
        const start = Date.now()
        const traceId = job.data?.traceId ?? `proof-${job.id}`

        log("PROOF_JOB_START", { traceId, jobId: job.id })

        try {
          if (!isValidJob(job.data)) {
            throw new Error("Invalid proof job payload")
          }

          const { input } = job.data

          increment("proof_jobs_started")

          const result = await runProofEngine(input)

          await setCachedProof(input, result)

          increment("proof_jobs_success")
          log("PROOF_JOB_SUCCESS", { traceId, jobId: job.id })

          return result
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
      log("PROOF_JOB_FAILED", { jobId: job?.id, error: err.message })
    })

    _proofWorker.on("error", (err) => {
      console.error("PROOF_WORKER_ERROR:", err)
    })
  }

  return _proofWorker
}

// Proxy para compatibilidade com imports existentes
export const proofWorker = new Proxy({} as Worker, {
  get(_, prop) {
    const w = getProofWorker()
    const value = w[prop as keyof Worker]
    return typeof value === "function" ? (value as Function).bind(w) : value
  },
})