import { Queue, Worker } from "bullmq"
import { getRedis } from "@/lib/redis"
import { runProofChainAggregator } from "@/lib/proof/aggregator/proofChainAggregator"

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
  await getAggregatorQueue().add(
    "aggregate",
    {},
    {
      repeat: { every: REPEAT_EVERY_MS },
      jobId: "proofchain-aggregator-repeat",
    }
  )
  console.log(`[proofchain] Scheduled repeat job every ${REPEAT_EVERY_MS / 1000}s`)
}