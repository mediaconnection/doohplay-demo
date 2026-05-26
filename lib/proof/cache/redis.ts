import IORedis from "ioredis"

const DEFAULT_REDIS_URL = "redis://127.0.0.1:6379"

let _redis: IORedis | null = null

export function getRedis(): IORedis {
  if (!_redis) {
    const url = process.env.REDIS_URL?.trim() || DEFAULT_REDIS_URL

    // require dentro da função evita avaliação do módulo durante o build
    _redis = new IORedis(url, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      lazyConnect: true,
      connectTimeout: 10_000,
      commandTimeout: 5_000,
      keepAlive: 30_000,
      retryStrategy(times) {
        return Math.min(times * 100, 2_000)
      },
    })

    _redis.on("error", (err) =>
      console.error("[Redis proof/cache] error:", err.message)
    )
  }

  return _redis
}

// Proxy com .bind() — garante que o `this` correto é preservado nos métodos
export const redis = new Proxy({} as IORedis, {
  get(_, prop) {
    const client = getRedis()
    const value = client[prop as keyof IORedis]
    return typeof value === "function"
      ? (value as Function).bind(client)
      : value
  },
})