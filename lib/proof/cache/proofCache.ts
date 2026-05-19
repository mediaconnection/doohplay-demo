import type { EntityType, ProofResultLike } from "../types"

export type CachedProof = ProofResultLike

type CacheEntry = {
  value: CachedProof
  expiresAt: number
}

type ProofCacheKeyInput = {
  hash: string
  entity_id: string
  entity_type: EntityType
}

const DEFAULT_PROOF_CACHE_TTL_MS = 60_000

const proofCache = new Map<string, CacheEntry>()

function normalizeKey(key: string): string {
  const normalized = String(key).trim().toLowerCase()

  if (!normalized) {
    throw new Error("INVALID_PROOF_CACHE_KEY")
  }

  return normalized
}

function normalizeHash(value: string): string {
  return String(value).trim().toLowerCase().replace(/^0x/, "")
}

function isValidEntityType(value: unknown): value is EntityType {
  return value === "event" || value === "campaign" || value === "block"
}

function normalizeEntityId(value: string): string {
  const normalized = String(value).trim().toLowerCase()

  if (!normalized) {
    throw new Error("INVALID_PROOF_CACHE_ENTITY_ID")
  }

  return normalized
}

function readEnvTtlMs(): number | null {
  const raw =
    process.env.PROOF_CACHE_TTL_MS ??
    process.env.VERIFY_PROOF_CACHE_TTL_MS ??
    null

  if (raw) {
    const parsed = Number(raw)
    if (Number.isFinite(parsed) && parsed > 0) {
      return Math.floor(parsed)
    }
  }

  const rawSeconds =
    process.env.PROOF_CACHE_TTL_SECONDS ??
    process.env.VERIFY_PROOF_CACHE_TTL_SECONDS ??
    null

  if (rawSeconds) {
    const parsed = Number(rawSeconds)
    if (Number.isFinite(parsed) && parsed > 0) {
      return Math.floor(parsed * 1000)
    }
  }

  return null
}

function getSafeTtl(ttlMs?: number): number {
  if (typeof ttlMs === "number" && Number.isFinite(ttlMs) && ttlMs > 0) {
    return Math.floor(ttlMs)
  }

  return readEnvTtlMs() ?? DEFAULT_PROOF_CACHE_TTL_MS
}

function cloneValue<T>(value: T): T {
  try {
    return structuredClone(value)
  } catch {
    try {
      return JSON.parse(JSON.stringify(value)) as T
    } catch {
      return value
    }
  }
}

function isExpired(entry: CacheEntry): boolean {
  return Date.now() >= entry.expiresAt
}

function cleanupExpiredEntries(): void {
  const now = Date.now()

  for (const [key, entry] of proofCache.entries()) {
    if (now >= entry.expiresAt) {
      proofCache.delete(key)
    }
  }
}

function ensureValidHash(hash: string): string {
  const normalized = normalizeHash(hash)

  if (!normalized || !/^[a-f0-9]{64}$/i.test(normalized)) {
    throw new Error("INVALID_PROOF_CACHE_HASH")
  }

  return normalized
}

export function buildProofCacheKey(input: ProofCacheKeyInput): string {
  if (!isValidEntityType(input.entity_type)) {
    throw new Error("INVALID_PROOF_CACHE_ENTITY_TYPE")
  }

  const entityType = input.entity_type
  const entityId = normalizeEntityId(input.entity_id)
  const hash = ensureValidHash(input.hash)

  return normalizeKey(`${entityType}:${entityId}:${hash}`)
}

export async function getCachedProof(
  key: string
): Promise<CachedProof | null> {
  const normalizedKey = normalizeKey(key)
  const entry = proofCache.get(normalizedKey)

  if (!entry) return null

  if (isExpired(entry)) {
    proofCache.delete(normalizedKey)
    return null
  }

  return cloneValue(entry.value)
}

export async function setCachedProof(
  key: string,
  value: CachedProof,
  ttlMs?: number
): Promise<void> {
  const normalizedKey = normalizeKey(key)
  const safeTtl = getSafeTtl(ttlMs)

  cleanupExpiredEntries()

  proofCache.set(normalizedKey, {
    value: cloneValue(value),
    expiresAt: Date.now() + safeTtl
  })
}

export async function hasCachedProof(key: string): Promise<boolean> {
  const normalizedKey = normalizeKey(key)
  const entry = proofCache.get(normalizedKey)

  if (!entry) return false

  if (isExpired(entry)) {
    proofCache.delete(normalizedKey)
    return false
  }

  return true
}

export async function deleteCachedProof(key: string): Promise<void> {
  proofCache.delete(normalizeKey(key))
}

export async function clearProofCache(): Promise<void> {
  proofCache.clear()
}

export function getProofCacheSize(): number {
  cleanupExpiredEntries()
  return proofCache.size
}