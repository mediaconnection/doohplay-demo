import { Queue } from "bullmq"
import { Redis } from "ioredis"

const QUEUE_NAME = "alerts"

function createRedisConnection(): Redis {
  const url = process.env.REDIS_URL

  if (!url) {
    console.warn("[alertQueue] REDIS_URL não definida — fila desabilitada")
    return null as unknown as Redis
  }

  const redis = new Redis(url, {
    lazyConnect: true,
    enableOfflineQueue: false,
    maxRetriesPerRequest: 0,
  })

  redis.on("error", (err) => {
    console.error("[alertQueue] Redis error:", err.message)
  })

  return redis
}

function createAlertQueue(): Queue {
  const connection = createRedisConnection()

  if (!connection) {
    // Retorna um objeto fake para não quebrar imports em build/dev sem Redis
    return {
      add: async () => null,
      close: async () => {},
    } as unknown as Queue
  }

  return new Queue(QUEUE_NAME, {
    connection,
    defaultJobOptions: {
      attempts: 5,
      backoff: { type: "exponential", delay: 2000 },
      removeOnComplete: true,
      removeOnFail: false,
    },
  })
}

// Singleton lazy — não conecta no build
let _queue: Queue | null = null

export const alertQueue: Queue = new Proxy({} as Queue, {
  get(_, prop) {
    if (!_queue) _queue = createAlertQueue()
    const value = _queue[prop as keyof Queue]
    return typeof value === "function" ? value.bind(_queue) : value
  },
})
