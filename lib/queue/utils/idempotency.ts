// @ts-nocheck
import { redis } from "@/lib/redis"

const TTL = 60 * 60 // 1h

export async function acquireLock(eventId: number) {
  const key = `lock:event:${eventId}`

  const result = await redis.set(key, "1", "EX", TTL, "NX")

  return result === "OK"
}

export async function releaseLock(eventId: number) {
  await redis.del(`lock:event:${eventId}`)
}
