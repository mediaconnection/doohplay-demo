import { Queue } from "bullmq"
import { getRedis } from "@/lib/redis"

let _dlq: Queue | null = null

export function getDlq(): Queue {
  if (!_dlq) {
    _dlq = new Queue("risk-dlq", {
      connection: getRedis(),
    })
  }
  return _dlq
}

// Proxy para compatibilidade com imports existentes
export const dlq = new Proxy({} as Queue, {
  get(_, prop) {
    const q = getDlq()
    const value = q[prop as keyof Queue]
    return typeof value === "function" ? (value as Function).bind(q) : value
  },
})