import IORedis from "ioredis"

/* =========================
   CONFIG
========================= */

const DEFAULT_REDIS_URL = "redis://127.0.0.1:6379"
const REDIS_URL = process.env.REDIS_URL?.trim() || DEFAULT_REDIS_URL
const isProd = process.env.NODE_ENV === "production"

const CONNECT_TIMEOUT_MS = 10_000
const COMMAND_TIMEOUT_MS = 5_000
const MAX_RETRY_DELAY_MS = 2_000

/* =========================
   HELPERS
========================= */

function shouldReconnectOnError(message: string): boolean {
  const normalized = message.toUpperCase()

  return (
    normalized.includes("READONLY") ||
    normalized.includes("ECONNRESET") ||
    normalized.includes("ETIMEDOUT")
  )
}

function logInfo(message: string): void {
  if (!isProd) {
    console.log(message)
  }
}

function logWarn(message: string): void {
  if (!isProd) {
    console.warn(message)
  }
}

/* =========================
   REDIS INSTANCE
========================= */

export const redis = new IORedis(REDIS_URL, {
  maxRetriesPerRequest: null, // obrigatório para BullMQ
  enableReadyCheck: true,
  lazyConnect: false,
  connectTimeout: CONNECT_TIMEOUT_MS,
  commandTimeout: COMMAND_TIMEOUT_MS,
  keepAlive: 30_000,

  retryStrategy(times) {
    return Math.min(times * 100, MAX_RETRY_DELAY_MS)
  },

  reconnectOnError(err) {
    return shouldReconnectOnError(err.message)
  }
})

/* =========================
   EVENTS (OBSERVABILITY)
========================= */

redis.on("connect", () => {
  logInfo("🟢 Redis connected")
})

redis.on("ready", () => {
  logInfo("✅ Redis ready")
})

redis.on("error", (err) => {
  console.error("🔴 Redis error:", err.message)
})

redis.on("close", () => {
  logWarn("🟡 Redis connection closed")
})

redis.on("reconnecting", () => {
  logWarn("🔄 Redis reconnecting...")
})

redis.on("end", () => {
  logWarn("⛔ Redis connection ended")
})