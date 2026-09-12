// @ts-nocheck
import Redis from "ioredis"

let _redis: Redis | null = null

// Instrumentação temporária (2026-09-12, reavaliar até ~2026-09-15): conta
// comandos Redis reais emitidos por este processo, por janela de tempo, pra
// decidir consolidar mais vs. upgrade do Upstash com dado real de volume em
// vez de estimativa -- ver STATUS_PROJETO.md, "Instrumentação de contagem
// de comandos Redis". Não decide nem age sozinha, só loga. Remover depois
// da decisão (não deixar rodando indefinidamente).
let _cmdCount = 0
let _windowStart = Date.now()
const LOG_INTERVAL_MS = 15 * 60 * 1000

function logCommandWindow() {
  const elapsedMin = (Date.now() - _windowStart) / 60000
  const rate = elapsedMin > 0 ? _cmdCount / elapsedMin : 0
  console.log(
    `[redis-instrumentation] ${_cmdCount} comandos em ${elapsedMin.toFixed(1)}min (~${rate.toFixed(1)}/min)`
  )
  _cmdCount = 0
  _windowStart = Date.now()
}

export function getRedis(): Redis {
  if (!_redis) {
    _redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      connectTimeout: 10_000,
      commandTimeout: 5_000,
      keepAlive: 30_000,
      retryStrategy(times) {
        return Math.min(times * 100, 2_000)
      },
    })
    _redis.on("error", (err) => {
      console.warn("[Redis] error (non-fatal):", err.message)
    })

    const originalSendCommand = _redis.sendCommand.bind(_redis)
    _redis.sendCommand = (...args) => {
      try {
        _cmdCount++
      } catch {}
      return originalSendCommand(...args)
    }

    setInterval(logCommandWindow, LOG_INTERVAL_MS).unref?.()
  }
  return _redis
}

export const redis = new Proxy({} as Redis, {
  get(_, prop) {
    return (getRedis() as any)[prop]
  }
})
