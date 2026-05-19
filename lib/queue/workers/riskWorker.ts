// /lib/queue/workers/riskWorker.ts

import { Worker, Job } from "bullmq"
import IORedis from "ioredis"

import { computeRisk } from "@/lib/domain/analytics/computeRisk"
import { autoBlockClient } from "@/lib/domain/risk/engine"
import { updateClientRiskStats } from "@/lib/domain/risk/fraudIntelligence"
import { checkAlerts } from "@/lib/observability/alerts"

import { increment, observe } from "@/lib/observability/metrics"
import { log } from "@/lib/observability/logger"

/* =========================
   REDIS CONNECTION
========================= */

if (!process.env.REDIS_URL) {
  throw new Error("REDIS_URL is not defined")
}

const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null
})

/* =========================
   IDEMPOTENCY (TTL SAFE)
========================= */

const processedEvents = new Map<number, number>() // eventId → timestamp
const IDEMPOTENCY_TTL = 60 * 60 * 1000 // 1h

function isDuplicate(eventId: number) {
  const now = Date.now()

  // cleanup antigo
  for (const [id, ts] of processedEvents.entries()) {
    if (now - ts > IDEMPOTENCY_TTL) {
      processedEvents.delete(id)
    }
  }

  if (processedEvents.has(eventId)) {
    return true
  }

  processedEvents.set(eventId, now)
  return false
}

/* =========================
   TYPES
========================= */

type JobData = {
  eventId: number
  clientId: number
  data: any
  traceId?: string
}

/* =========================
   VALIDATION
========================= */

function isValidJobData(data: any): data is JobData {
  return (
    data &&
    typeof data.eventId === "number" &&
    typeof data.clientId === "number" &&
    data.data !== undefined
  )
}

/* =========================
   TIMEOUT (SAFE)
========================= */

async function withTimeout<T>(
  fn: () => Promise<T>,
  ms: number
): Promise<T> {

  let timeout: NodeJS.Timeout

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => {
      reject(new Error("Timeout"))
    }, ms)
  })

  try {
    return await Promise.race([fn(), timeoutPromise])
  } finally {
    clearTimeout(timeout!)
  }
}

/* =========================
   WORKER
========================= */

export const riskWorker = new Worker(
  "risk-processing",
  async (job: Job<JobData>) => {

    const start = Date.now()
    const traceId = job.data?.traceId || `job-${job.id}`

    try {

      if (!isValidJobData(job.data)) {
        throw new Error("Invalid job payload")
      }

      const { eventId, clientId, data } = job.data

      /* =========================
         IDEMPOTENCY
      ========================= */

      if (isDuplicate(eventId)) {
        log("JOB_SKIPPED_DUPLICATE", { traceId, eventId })
        return { skipped: true }
      }

      log("JOB_START", {
        traceId,
        jobId: job.id,
        eventId,
        clientId
      })

      increment("jobs_started")

      /* =========================
         RISK COMPUTE
      ========================= */

      const risk = computeRisk(data)

      /* =========================
         BLOCK ENGINE (timeout)
      ========================= */

      const result = await withTimeout(
        () => autoBlockClient(clientId, risk),
        3000
      )

      if (result.blocked) {
        increment("clients_blocked")
      }

      /* =========================
         FRAUD INTELLIGENCE
      ========================= */

      await updateClientRiskStats(
        clientId,
        risk,
        result.blocked
      )

      /* =========================
         ALERTS
      ========================= */

      if (result.blocked || risk.riskLevel === "critical") {
        await checkAlerts()
      }

      increment("jobs_success")

      log("JOB_SUCCESS", {
        traceId,
        clientId,
        riskLevel: risk.riskLevel,
        blocked: result.blocked
      })

      return {
        success: true,
        riskLevel: risk.riskLevel,
        blocked: result.blocked
      }

    } catch (err: any) {

      increment("jobs_failed")

      const isTimeout = err.message === "Timeout"

      log("JOB_ERROR", {
        traceId,
        jobId: job.id,
        type: isTimeout ? "timeout" : "error",
        error: err.message,
        stack: err.stack
      })

      throw err

    } finally {

      observe("job_duration_ms", Date.now() - start)
    }
  },
  {
    connection,
    concurrency: 10,
    limiter: {
      max: 100,
      duration: 1000
    }
  }
)

/* =========================
   EVENTS
========================= */

riskWorker.on("completed", (job) => {
  log("JOB_COMPLETED", { jobId: job.id })
})

riskWorker.on("failed", (job, err) => {
  log("JOB_FAILED", {
    jobId: job?.id,
    error: err.message
  })
})

riskWorker.on("error", (err) => {
  console.error("WORKER_ERROR:", err)
})