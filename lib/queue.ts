// @ts-nocheck
// lib/queue.ts
import { Queue } from "bullmq"
import { getRedis } from "./redis"

let _eventQueue: Queue | null = null

function getEventQueue(): Queue {
  if (!_eventQueue) {
    _eventQueue = new Queue("event-queue", {
      connection: getRedis(),
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 2000 },
        removeOnComplete: true,
        removeOnFail: false,
      },
    })
  }
  return _eventQueue
}

export async function publishEvent(event: any) {
  const queue = getEventQueue()
  await queue.add("write-event", { payload: event }, { jobId: event.id })
}
