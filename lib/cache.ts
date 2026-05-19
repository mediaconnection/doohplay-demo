import { redis } from "@/lib/redis"

export async function invalidateCache(key: string) {
  try {
    await redis.del(key)
  } catch (err) {
    console.error("cache invalidate error", err)
  }
}