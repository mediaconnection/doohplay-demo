// lib/queue/workers/offlineAlertWorker.ts
// Repeatable job (mesmo padrão de lib/queue/workers/alertWorker.ts, o
// agregador do proofchain) pra checar telas offline periodicamente dentro
// do processo já existente doohplay-workers — decisão consciente de não
// criar um Render Cron Job novo (recurso cobrado à parte) pra uma
// checagem que cabe perfeitamente num processo que já roda 24/7.
import { Queue, Worker } from "bullmq"
import { getRedis } from "@/lib/redis"
import { runScreenOfflineAlertCheck } from "@/lib/screens/offlineAlertCheck"
import { attachRateLimitCircuitBreaker } from "@/lib/queue/rateLimitCircuitBreaker"

const QUEUE_NAME = "screen-offline-alert"
const REPEAT_EVERY_MS = 10 * 60 * 1000 // 10 minutes

let _offlineAlertQueue: Queue | null = null

export function getOfflineAlertQueue(): Queue {
  if (!_offlineAlertQueue) {
    _offlineAlertQueue = new Queue(QUEUE_NAME, { connection: getRedis() })
  }
  return _offlineAlertQueue
}

let _offlineAlertWorker: Worker | null = null

export function getOfflineAlertWorker(): Worker {
  if (!_offlineAlertWorker) {
    _offlineAlertWorker = new Worker(
      QUEUE_NAME,
      async (job) => {
        const result = await runScreenOfflineAlertCheck()
        if (result.alerted.length || result.recovered.length) {
          console.log(`[offline-alert] Job ${job.id}:`, result)
        }
        return result
      },
      { connection: getRedis(), concurrency: 1 }
    )
    attachRateLimitCircuitBreaker(_offlineAlertWorker, { label: "offlineAlertWorker", maxDelayMs: 10 * 60_000 })
  }
  return _offlineAlertWorker
}

// Idempotente de propósito, mesmo motivo do proofchain-aggregator: worker.ts
// reinicia com frequência (qualquer commit que toque lib/**), e sem essa
// checagem cada boot bateria no Upstash com um write de agendamento
// completo — mesma classe de problema já investigada nesta sessão pro
// rate-limit do Redis.
//
// Achado no primeiro deploy real (2026-09-13): o boot bateu direto no
// rate-limit do Upstash (mesmo fenômeno intermitente que a instrumentação
// desta sessão monitora) e a tentativa falhou sem retry -- diferente do
// processamento de job (protegido pelo circuit breaker), essa chamada de
// agendamento só rodava 1x no boot. Adicionado retry curto aqui pra não
// depender de sorte de timing num redeploy pra se auto-curar.
async function scheduleWithRetry(attempts = 3, baseDelayMs = 15_000): Promise<void> {
  for (let i = 0; i < attempts; i++) {
    try {
      const queue = getOfflineAlertQueue()
      const existing = await queue.getRepeatableJobs()
      const alreadyScheduled = existing.some((job) => job.id === "screen-offline-alert-repeat")

      if (alreadyScheduled) {
        console.log("[offline-alert] Repeat job já estava agendado — nada a fazer.")
        return
      }

      await queue.add(
        "check",
        {},
        { repeat: { every: REPEAT_EVERY_MS }, jobId: "screen-offline-alert-repeat" }
      )
      console.log(`[offline-alert] Scheduled repeat job every ${REPEAT_EVERY_MS / 1000}s`)
      return
    } catch (err: any) {
      const isLastAttempt = i === attempts - 1
      console.error(`[offline-alert] Falha ao agendar (tentativa ${i + 1}/${attempts}):`, err.message)
      if (isLastAttempt) throw err
      const delay = baseDelayMs * 2 ** i
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }
}

export async function scheduleOfflineAlertJob(): Promise<void> {
  return scheduleWithRetry()
}
