import { Worker, type Job } from "bullmq"
import { getRedis } from "@/lib/redis"
import { writeEvent } from "@/lib/ledger/writeEvent"

type EventJobData = {
  payload: Record<string, unknown>
}

let _eventWorker: Worker | null = null

export function getEventWorker(): Worker {
  if (!_eventWorker) {
    _eventWorker = new Worker(
      "event-queue",
      async (job: Job<EventJobData>) => {
        if (job.name === "write-event") {
          console.log(`[eventWorker] ⚡ Processing event: ${job.id}`)
          await writeEvent({ payload: job.data.payload })
          console.log(`[eventWorker] ✅ Event processed: ${job.id}`)
        }
      },
      {
        connection: getRedis(),
        concurrency: 5,
      }
    )

    _eventWorker.on("failed", (job, err) => {
      console.error(`[eventWorker] ❌ Job failed: ${job?.id}`, err)
    })

    _eventWorker.on("completed", (job) => {
      console.log(`[eventWorker] 🎉 Job done: ${job.id}`)
    })
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