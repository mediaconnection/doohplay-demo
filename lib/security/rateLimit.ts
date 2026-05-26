// lib/security/rateLimit.ts
import type { NextRequest } from "next/server"
import type { Redis as RedisType } from "ioredis"

export const runtime = "nodejs"

export type RateLimitResult = {
  allowed: boolean
  remaining: number
  reset: number
}

const WINDOW_SECONDS = Number(process.env.VERIFY_RATE_LIMIT_WINDOW_SECONDS ?? 60)
const LIMIT = Number(process.env.VERIFY_RATE_LIMIT ?? 30)

let redis: RedisType | null = null

function getRedis(): RedisType {
  if (!redis) {
    const REDIS_URL = process.env.REDIS_URL ?? "redis://127.0.0.1:6379"
    // import dinâmico via require para evitar top-level module evaluation
    const Redis = require("ioredis")
    redis = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 2,
      enableReadyCheck: false, // ← false evita conexão eagerly no require()
      lazyConnect: true,       // ← só conecta quando o primeiro comando rodar
    }) as RedisType
  }
  return redis
}

function getIpFromRequest(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip")?.trim() ||
    "unknown"
  )
}

function normalizeKey(input: string | NextRequest): string {
  if (typeof input === "string") {
    return input.trim() || "unknown"
  }
  return getIpFromRequest(input)
}

export async function rateLimit(
  input: string | NextRequest
): Promise<RateLimitResult> {
  const key = `rate-limit:verify:${normalizeKey(input)}`
  const now = Date.now()
  const reset = now + WINDOW_SECONDS * 1000

  try {
    const client = getRedis()

    // Com lazyConnect: true, garantimos que está conectado antes do primeiro comando
    if (client.status === "wait") {
      await client.connect()
    }

    const count = await client.incr(key)

    if (count === 1) {
      await client.expire(key, WINDOW_SECONDS)
    }

    const ttl = await client.ttl(key)
    const resetAt = now + Math.max(ttl, 1) * 1000

    return {
      allowed: count <= LIMIT,
      remaining: Math.max(0, LIMIT - count),
      reset: resetAt,
    }
  } catch (error) {
    console.warn("RATE_LIMIT_REDIS_ERROR", {
      error: error instanceof Error ? error.message : "UNKNOWN_ERROR",
    })
    // Fail open: se Redis cair, não bloqueia o usuário
    return {
      allowed: true,
      remaining: LIMIT,
      reset,
    }
  }
}