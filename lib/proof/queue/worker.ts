// /lib/queue/workers/proofWorker.ts

import { Worker, Job } from "bullmq"
import { redis } from "../cache/redis"

import { runProofEngine } from "../engine"
import { setCachedProof } from "../cache/proofCache"

import { log } from "@/lib/observability/logger"
import { increment, observe } from "@/lib/observability/metrics"

/* =========================
   TYPES
========================= */

type ProofJobData = {
  input: any
  traceId?: string
}

/* =========================
   VALIDATION
========================= */

function isValidJob(data: any): data is ProofJobData {
  return data && typeof data === "object" && data.input !== undefined
}

/* =========================
   WORKER
========================= */

export const proofWorker = new Worker(
  "proof-queue",
  async (job: Job<ProofJobData>) => {

    const start = Date.now()
    const traceId = job.data?.traceId || `proof-${job.id}`

    log("PROOF_JOB_START", {
      traceId,
      jobId: job.id
    })

    try {

      /* =========================
         VALIDATION
      ========================= */

      if (!isValidJob(job.data)) {
        throw new Error("Invalid proof job payload")
      }

      const { input } = job.data

      increment("proof_jobs_started")

      /* =========================
         EXECUTION
      ========================= */

      const result = await runProofEngine(input)

      /* =========================
         CACHE
      ========================= */

      await setCachedProof(input, result)

      increment("proof_jobs_success")

      log("PROOF_JOB_SUCCESS", {
        traceId,
        jobId: job.id
      })

      return result

    } catch (err: any) {

      increment("proof_jobs_failed")

      log("PROOF_JOB_ERROR", {
        traceId,
        jobId: job.id,
        error: err.message,
        stack: err.stack
      })

      throw err

    } finally {

      observe("proof_job_duration_ms", Date.now() - start)
    }
  },
  {
    connection: redis,
    concurrency: 5,
    limiter: {
      max: 50,
      duration: 1000
    }
  }
)

/* =========================
   EVENTS
========================= */

proofWorker.on("completed", (job) => {
  log("PROOF_JOB_COMPLETED", {
    jobId: job.id
  })
})

proofWorker.on("failed", (job, err) => {
  log("PROOF_JOB_FAILED", {
    jobId: job?.id,
    error: err.message
  })
})

proofWorker.on("error", (err) => {
  console.error("PROOF_WORKER_ERROR:", err)
})