// @ts-nocheck
import IORedis from "ioredis"

const DEFAULT_REDIS_URL = "redis://127.0.0.1:6379"

let _redis: IORedis | null = null

export function getRedis(): IORedis {
  if (!_redis) {
    const REDIS_URL = process.env.REDIS_URL?.trim() || DEFAULT_REDIS_URL
    const isProd = process.env.NODE_ENV === "production"

    _redis = new IORedis(REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: true,
      lazyConnect: true,
      connectTimeout: 10_000,
      commandTimeout: 5_000,
      keepAlive: 30_000,
      retryStrategy(times) {
        return Math.min(times * 100, 2_000)
      },
      reconnectOnError(err) {
        const msg = err.message.toUpperCase()
        return msg.includes("READONLY") || msg.includes("ECONNRESET") || msg.includes("ETIMEDOUT")
      }
    })

    _redis.on("error", (err) => console.error("[Redis proof/cache] error:", err.message))
  }
  return _redis
}

export const redis = new Proxy({} as IORedis, {
  get(_, prop) {
    return (getRedis() as any)[prop]
  }
})