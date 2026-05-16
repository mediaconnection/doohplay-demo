import IORedis from "ioredis"

const redis = new IORedis(process.env.REDIS_URL!)

const TTL = 60 * 60 // 1h

export async function acquireLock(eventId: number) {
  const key = `lock:event:${eventId}`

  const result = await redis.set(key, "1", "EX", TTL, "NX")

  return result === "OK"
}

export async function releaseLock(eventId: number) {
  await redis.del(`lock:event:${eventId}`)
}