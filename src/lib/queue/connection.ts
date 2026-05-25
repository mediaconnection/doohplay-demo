// @ts-nocheck
import IORedis from "ioredis"

export const connection = new IORedis(
  process.env.REDIS_URL || "redis://localhost:6379",
  { maxRetriesPerRequest: null }
)

connection.on("error", (err) => {
  console.warn("[Redis] connection error (non-fatal):", err.message)
})
