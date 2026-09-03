import { Worker, type Job } from "bullmq"
import { getRedis } from "@/lib/redis"
import { computeRisk } from "@/lib/domain/analytics/computeRisk"
import { autoBlockClient } from "@/lib/domain/risk/engine"
import { updateClientRiskStats } from "@/lib/domain/risk/fraudIntelligence"
import { checkAlerts } from "@/lib/observability/alerts"
import { increment, observe } from "@/lib/observability/metrics"
import { log } from "@/lib/observability/logger"
import { attachRateLimitCircuitBreaker } from "@/lib/queue/rateLimitCircuitBreaker"

/* =========================
   TYPES
========================= */

type JobData = {
  eventId: number
  clientId: number
  data: Record<string, unknown>
  traceId?: string
}

/* =========================
   IDEMPOTENCY (TTL SAFE)
========================= */

const processedEvents = new Map<number, number>() // eventId → timestamp
const IDEMPOTENCY_TTL = 60 * 60 * 1000 // 1h

function isDuplicate(eventId: number): boolean {
  const now = Date.now()

  // cleanup expirados
  for (const [id, ts] of processedEvents.entries()) {
    if (now - ts > IDEMPOTENCY_TTL) {
      processedEvents.delete(id)
    }
  }

  if (processedEvents.has(eventId)) return true

  processedEvents.set(eventId, now)
  return false
}

/* =========================
   VALIDATION
========================= */

function isValidJobData(data: unknown): data is JobData {
  return (
    data !== null &&
    typeof data === "object" &&
    typeof (data as JobData).eventId === "number" &&
    typeof (data as JobData).clientId === "number" &&
    (data as JobData).data !== undefined
  )
}

/* =========================
   TIMEOUT
========================= */

async function withTimeout<T>(fn: () => Promise<T>, ms: number): Promise<T> {
  let timeout: NodeJS.Timeout

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => reject(new Error("Timeout")), ms)
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

let _riskWorker: Worker | null = null

export function getRiskWorker(): Worker {
  if (!_riskWorker) {
    _riskWorker = new Worker(
      "risk-processing",
      async (job: Job<JobData>) => {
        const start = Date.now()
        const traceId = job.data?.traceId ?? `job-${job.id}`

        try {
          if (!isValidJobData(job.data)) {
            throw new Error("Invalid job payload")
          }

          const { eventId, clientId, data } = job.data

          /* ── Idempotency ── */

          if (isDuplicate(eventId)) {
            log("JOB_SKIPPED_DUPLICATE", { traceId, eventId })
            return { skipped: true }
          }

          log("JOB_START", { traceId, jobId: job.id, eventId, clientId })
          increment("jobs_started")

          /* ── Risk compute ── */

          const risk = computeRisk(data)

          /* ── Block engine ── */

          const result = await withTimeout(
            () => autoBlockClient(clientId, risk),
            3000
          )

          if (result.blocked) {
            increment("clients_blocked")
          }

          /* ── Fraud intelligence ── */

          await updateClientRiskStats(clientId, risk, result.blocked)

          /* ── Alerts ── */

          if (result.blocked || risk.riskLevel === "critical") {
            await checkAlerts()
          }

          increment("jobs_success")
          log("JOB_SUCCESS", {
            traceId,
            clientId,
            riskLevel: risk.riskLevel,
            blocked: result.blocked,
          })

          return {
            success: true,
            riskLevel: risk.riskLevel,
            blocked: result.blocked,
          }
        } catch (err: unknown) {
          const error = err instanceof Error ? err : new Error(String(err))
          const isTimeout = error.message === "Timeout"

          increment("jobs_failed")
          log("JOB_ERROR", {
            traceId,
            jobId: job.id,
            type: isTimeout ? "timeout" : "error",
            error: error.message,
            stack: error.stack,
          })

          throw err
        } finally {
          observe("job_duration_ms", Date.now() - start)
        }
      },
      {
        connection: getRedis(),
        concurrency: 10,
        limiter: {
          max: 100,
          duration: 1000,
        },
      }
    )

    /* ── Events ── */

    _riskWorker.on("completed", (job) => {
      log("JOB_COMPLETED", { jobId: job.id })
    })

    _riskWorker.on("failed", (job, err) => {
      log("JOB_FAILED", { jobId: job?.id, error: err.message })
    })

    _riskWorker.on("error", (err) => {
      console.error("WORKER_ERROR:", err)
    })

    // risk-queue tem trafego real (app/api/events/route.ts) -- teto mais
    // curto que as filas sem produtor, pra nao acumular backlog demais.
    attachRateLimitCircuitBreaker(_riskWorker, { label: "riskWorker", maxDelayMs: 2 * 60_000 })
  }

  return _riskWorker
}

// Proxy para compatibilidade com imports existentes
export const riskWorker = new Proxy({} as Worker, {
  get(_, prop) {
    const w = getRiskWorker()
    const value = w[prop as keyof Worker]
    return typeof value === "function" ? (value as Function).bind(w) : value
  },
})