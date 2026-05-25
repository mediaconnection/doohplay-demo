// @ts-nocheck
import IORedis from "ioredis"

const redis = new IORedis(process.env.REDIS_URL!)

/* =========================
   COUNTERS
========================= */

export async function increment(metric: string, value = 1) {
  if (!metric) return

  await redis.incrby(`metrics:counter:${metric}`, value)
}

export async function getCounter(metric: string) {
  const val = await redis.get(`metrics:counter:${metric}`)
  return Number(val || 0)
}

/* =========================
   HISTOGRAM (simplificado)
========================= */

export async function observe(metric: string, value: number) {
  if (!metric || !Number.isFinite(value)) return

  const key = `metrics:hist:${metric}`

  await redis.hincrby(key, "count", 1)
  await redis.hincrbyfloat(key, "sum", value)

  const min = await redis.hget(key, "min")
  const max = await redis.hget(key, "max")

  if (!min || value < Number(min)) {
    await redis.hset(key, "min", value)
  }

  if (!max || value > Number(max)) {
    await redis.hset(key, "max", value)
  }
}

export async function getHistogram(metric: string) {
  const data = await redis.hgetall(`metrics:hist:${metric}`)

  const count = Number(data.count || 0)
  const sum = Number(data.sum || 0)

  return {
    count,
    sum,
    min: Number(data.min || 0),
    max: Number(data.max || 0),
    avg: count > 0 ? sum / count : 0
  }
}
