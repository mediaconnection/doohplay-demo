import { Queue, Worker } from "bullmq"
import { connection } from "../connection"
import { runProofChainAggregator } from "@/lib/proof/aggregator/proofChainAggregator"

const QUEUE_NAME = "proofchain-aggregator"
const REPEAT_EVERY_MS = 5 * 60 * 1000 // 5 minutes

export const aggregatorQueue = new Queue(QUEUE_NAME, { connection })

export const aggregatorWorker = new Worker(
  QUEUE_NAME,
  async (job) => {
    console.log(`[proofchain] Job ${job.id} started`)
    const result = await runProofChainAggregator()
    console.log("[proofchain] Done:", result)
    return result
  },
  { connection, concurrency: 1 }
)

export async function scheduleAggregatorJob(): Promise<void> {
  await aggregatorQueue.add(
    "aggregate",
    {},
    {
      repeat: { every: REPEAT_EVERY_MS },
      jobId: "proofchain-aggregator-repeat",
    }
  )
  console.log(`[proofchain] Scheduled repeat job every ${REPEAT_EVERY_MS / 1000}s`)
}
