// lib/redis.ts
import Redis from "ioredis"

export const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379")

redis.on("error", (err) => {
  console.warn("[Redis] error (non-fatal):", err.message)
})