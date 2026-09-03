import { Queue, Worker } from "bullmq"
import { getRedis } from "@/lib/redis"
import { runProofChainAggregator } from "@/lib/proof/aggregator/proofChainAggregator"
import { attachRateLimitCircuitBreaker } from "@/lib/queue/rateLimitCircuitBreaker"

const QUEUE_NAME = "proofchain-aggregator"
const REPEAT_EVERY_MS = 5 * 60 * 1000 // 5 minutes

// ─── Queue ───────────────────────────────────────────────────────────────────

let _aggregatorQueue: Queue | null = null

export function getAggregatorQueue(): Queue {
  if (!_aggregatorQueue) {
    _aggregatorQueue = new Queue(QUEUE_NAME, {
      connection: getRedis(),
    })
  }
  return _aggregatorQueue
}

export const aggregatorQueue = new Proxy({} as Queue, {
  get(_, prop) {
    const q = getAggregatorQueue()
    const value = q[prop as keyof Queue]
    return typeof value === "function" ? (value as Function).bind(q) : value
  },
})

// ─── Worker ──────────────────────────────────────────────────────────────────

let _aggregatorWorker: Worker | null = null

export function getAggregatorWorker(): Worker {
  if (!_aggregatorWorker) {
    _aggregatorWorker = new Worker(
      QUEUE_NAME,
      async (job) => {
        console.log(`[proofchain] Job ${job.id} started`)
        const result = await runProofChainAggregator()
        console.log("[proofchain] Done:", result)
        return result
      },
      {
        connection: getRedis(),
        concurrency: 1,
      }
    )

    // proofchain-aggregator so tem o proprio agendamento interno (5 em 5
    // min) como produtor -- processo em lote/eventual, tolera teto alto.
    attachRateLimitCircuitBreaker(_aggregatorWorker, { label: "aggregatorWorker", maxDelayMs: 10 * 60_000 })
  }
  return _aggregatorWorker
}

export const aggregatorWorker = new Proxy({} as Worker, {
  get(_, prop) {
    const w = getAggregatorWorker()
    const value = w[prop as keyof Worker]
    return typeof value === "function" ? (value as Function).bind(w) : value
  },
})

// ─── Scheduler ───────────────────────────────────────────────────────────────

export async function scheduleAggregatorJob(): Promise<void> {
  // Idempotente de propósito: worker.ts chama isso a cada boot, e o worker
  // reinicia com muita frequência (auto-deploy em qualquer commit do repo,
  // não só mudanças relacionadas a fila). Sem essa checagem, todo boot batia
  // no Upstash com um write de agendamento completo, mesmo quando o job
  // repetido já existia — contribuindo pro rate-limit persistente
  // investigado em 2026-08-27 (ver STATUS_PROJETO.md). Agora só faz 1
  // leitura leve na maioria dos boots, e só escreve se realmente faltar.
  const queue = getAggregatorQueue()
  const existing = await queue.getRepeatableJobs()
  const alreadyScheduled = existing.some((job) => job.id === "proofchain-aggregator-repeat")

  if (alreadyScheduled) {
    console.log("[proofchain] Repeat job já estava agendado — nada a fazer.")
    return
  }

  await queue.add(
    "aggregate",
    {},
    {
      repeat: { every: REPEAT_EVERY_MS },
      jobId: "proofchain-aggregator-repeat",
    }
  )
  console.log(`[proofchain] Scheduled repeat job every ${REPEAT_EVERY_MS / 1000}s`)
}