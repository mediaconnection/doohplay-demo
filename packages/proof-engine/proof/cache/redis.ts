// Reexport puro do client oficial (packages/shared-infra/redis.ts) -- suas
// proteções de timeout/retry (connectTimeout, commandTimeout, keepAlive,
// retryStrategy) foram incorporadas lá em 2026-09-12, na consolidação das
// conexões Redis duplicadas. Zero consumidor real confirmado neste
// arquivo (só via lib/queue/cache/redis.ts, que por sua vez também não
// tem consumidor real) -- mantido como reexport por consistência, não
// removido.
export { redis, getRedis } from "@/lib/redis"