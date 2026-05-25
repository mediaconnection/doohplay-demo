// @ts-nocheck
import IORedis from "ioredis"

const redis = new IORedis(process.env.REDIS_URL!)

const TTL = 60 // segundos

export async function acquireLock(key: string) {
  const lockKey = `anchor:lock:${key}`

  const result = await redis.set(lockKey, "1", "EX", TTL, "NX")

  return result === "OK"
}

export async function releaseLock(key: string) {
  const lockKey = `anchor:lock:${key}`
  await redis.del(lockKey)
}

export async function isAlreadyAnchored(key: string) {
  const cacheKey = `anchor:done:${key}`
  return (await redis.get(cacheKey)) === "1"
}

export async function markAnchored(key: string) {
  const cacheKey = `anchor:done:${key}`
  await redis.set(cacheKey, "1", "EX", 86400)
}
