// @ts-nocheck
import Redis from "ioredis"

let _redis: Redis | null = null

export function getRedis(): Redis {
  if (!_redis) {
    _redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      connectTimeout: 10_000,
      commandTimeout: 5_000,
      keepAlive: 30_000,
      retryStrategy(times) {
        return Math.min(times * 100, 2_000)
      },
    })
    _redis.on("error", (err) => {
      console.warn("[Redis] error (non-fatal):", err.message)
    })
  }
  return _redis
}

export const redis = new Proxy({} as Redis, {
  get(_, prop) {
    return (getRedis() as any)[prop]
  }
})
