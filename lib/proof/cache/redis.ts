// @ts-nocheck
import IORedis from "ioredis"

const DEFAULT_REDIS_URL = "redis://127.0.0.1:6379"
let _redis = null

export function getRedis() {
  if (!_redis) {
    const url = process.env.REDIS_URL?.trim() || DEFAULT_REDIS_URL
    _redis = new IORedis(url, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      lazyConnect: true,
      connectTimeout: 10000,
      commandTimeout: 5000,
      keepAlive: 30000,
      retryStrategy(times) { return Math.min(times * 100, 2000) }
    })
    _redis.on("error", (err) => console.error("[Redis proof/cache] error:", err.message))
  }
  return _redis
}

export const redis = new Proxy({}, { get(_, prop) { return getRedis()[prop] } })