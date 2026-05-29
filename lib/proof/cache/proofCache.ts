// @ts-nocheck
import Redis from "ioredis"
import type { EntityType, ProofResultLike } from "../types"

export type CachedProof = ProofResultLike

const DEFAULT_TTL_SECONDS = 3600

let _redis: Redis | null = null

function getRedis(): Redis {
  if (!_redis) {
    _redis = new Redis(process.env.REDIS_URL as string, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      lazyConnect: false,
    })
    _redis.on("error", (e) => console.error("[proofCache] Redis error:", e.message))
  }
  return _redis
}

function normalizeKey(key: string): string {
  const normalized = String(key).trim().toLowerCase().replace(/^0x/, "")
  if (!normalized) throw new Error("INVALID_PROOF_CACHE_KEY")
  return "proof:" + normalized
}

export function buildProofCacheKey(input: {
  hash: string
  entity_id: string
  entity_type: EntityType
}): string {
  return normalizeKey(
    `${input.entity_type}:${input.entity_id}:${input.hash}`
  )
}

export async function getCachedProof(
  key: string
): Promise<CachedProof | null> {
  try {
    const r = getRedis()
    const val = await r.get(normalizeKey(key))
    if (!val) return null
    return JSON.parse(val)
  } catch {
    return null
  }
}

export async function setCachedProof(
  key: string,
  value: CachedProof,
  ttlMs?: number
): Promise<void> {
  try {
    const r = getRedis()
    const ttl = Math.floor((ttlMs ?? DEFAULT_TTL_SECONDS * 1000) / 1000)
    await r.set(normalizeKey(key), JSON.stringify(value), "EX", ttl)
  } catch (e) {
    console.error("[proofCache] setCachedProof error:", e)
  }
}

export async function hasCachedProof(key: string): Promise<boolean> {
  try {
    const r = getRedis()
    return (await r.exists(normalizeKey(key))) === 1
  } catch {
    return false
  }
}

export async function deleteCachedProof(key: string): Promise<void> {
  try {
    const r = getRedis()
    await r.del(normalizeKey(key))
  } catch {}
}

export async function clearProofCache(): Promise<void> {
  try {
    const r = getRedis()
    const keys = await r.keys("proof:*")
    if (keys.length > 0) await r.del(...keys)
  } catch {}
}

export function getProofCacheSize(): number {
  return 0
}
