// /lib/queue/workers/proofWorker.ts

import { Worker, Job } from "bullmq"
import { redis } from "../cache/redis"

import { runProofEngine } from "../engine"
import { setCachedProof, getCachedProof } from "../cache/proofCache"

import { getSigner } from "@/lib/domain/proof/getSigner"
import { getActiveKey } from "@/lib/domain/proof/keyRegistry"

import { increment, observe } from "@/lib/observability/metrics"
import { log } from "@/lib/observability/logger"

/* =========================
   TYPES
========================= */

type ProofJobData = {
  input: any
  traceId?: string
}

/* =========================
   HELPERS
========================= */

function isValidJob(data: any): data is ProofJobData {
  return data && typeof data === "object" && data.input !== undefined
}

function isValidHash(value: string) {
  return typeof value === "string" && /^[a-f0-9]{64}$/i.test(value)
}

/* =========================
   CANONICAL PAYLOAD (CRÍTICO)
========================= */

function buildPayload(root: string, timestamp: number) {
  return JSON.stringify({
    root,
    timestamp
  })
}

/* =========================
   WORKER
========================= */

export const proofWorker = new Worker(
  "proof-queue",
  async (job: Job<ProofJobData>) => {

    const start = Date.now()
    const traceId = job.data?.traceId || `proof-${job.id}`

    try {

      if (!isValidJob(job.data)) {
        throw new Error("Invalid proof job payload")
      }

      const { input } = job.data

      log("PROOF_JOB_START", {
        traceId,
        jobId: job.id
      })

      increment("proof_jobs_started")

      /* =========================
         CACHE CHECK (CRÍTICO)
      ========================= */

      const cached = await getCachedProof(input)

      if (cached) {
        log("PROOF_CACHE_HIT", { traceId })
        return cached
      }

      /* =========================
         ENGINE
      ========================= */

      const result = await runProofEngine(input)

      if (!result?.root || !isValidHash(result.root)) {
        throw new Error("Invalid Merkle root generated")
      }

      /* =========================
         TIMESTAMP
      ========================= */

      const timestamp = Math.floor(Date.now() / 1000)

      /* =========================
         PAYLOAD (CANÔNICO)
      ========================= */

      const payload = buildPayload(result.root, timestamp)

      /* =========================
         SIGNATURE
      ========================= */

      const signer = getSigner()
      const { keyId } = getActiveKey()

      const signature = await signer.sign(payload)

      /* =========================
         PROOF BUNDLE
      ========================= */

      const proofBundle = {
        ...result,
        signature,
        keyId,
        timestamp
      }

      /* =========================
         CACHE
      ========================= */

      await setCachedProof(input, proofBundle)

      increment("proof_jobs_success")

      log("PROOF_JOB_SUCCESS", {
        traceId,
        jobId: job.id,
        root: result.root,
        keyId
      })

      return proofBundle

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