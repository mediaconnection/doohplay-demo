import { Worker } from "bullmq"
import { getRedis } from "@/lib/redis"
import { writeEvent } from "@/lib/ledger/writeEvent"

let _eventWorker: Worker | null = null

export function getEventWorker(): Worker {
  if (!_eventWorker) {
    _eventWorker = new Worker(
      "event-queue",
      async (job) => {
        if (job.name === "write-event") {
          console.log("⚡ Processing event:", job.id)
          await writeEvent({
            payload: job.data.payload,
          })
        }
      },
      {
        connection: getRedis(),
        concurrency: 5,
      }
    )
  }
  return _eventWorker
}

// Proxy para compatibilidade com imports existentes
export const eventWorker = new Proxy({} as Worker, {
  get(_, prop) {
    const w = getEventWorker()
    const value = w[prop as keyof Worker]
    return typeof value === "function" ? (value as Function).bind(w) : value
  },
})