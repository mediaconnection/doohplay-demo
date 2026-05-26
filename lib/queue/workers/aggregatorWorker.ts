import { Queue } from "bullmq"
import { getRedis } from "@/lib/redis"

let _riskQueue: Queue | null = null

export function getRiskQueue(): Queue {
  if (!_riskQueue) {
    _riskQueue = new Queue("risk-processing", {
      connection: getRedis(),
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 2000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    })
  }
  return _riskQueue
}

// Proxy para compatibilidade com imports existentes
export const riskQueue = new Proxy({} as Queue, {
  get(_, prop) {
    const q = getRiskQueue()
    const value = q[prop as keyof Queue]
    return typeof value === "function" ? (value as Function).bind(q) : value
  },
})