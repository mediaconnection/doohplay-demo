import { createHmac, timingSafeEqual } from "crypto"
import { redis } from "./redis"

/* =========================
   TYPES
========================= */

type SignedCacheEnvelope = {
  payload: string
  signature: string
}

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue }

/* =========================
   CONFIG
========================= */

const DEFAULT_LAYER_CACHE_TTL_SECONDS = 60

/* =========================
   HELPERS
========================= */

function getSecret(): string {
  const secret = process.env.PROOF_CACHE_SECRET?.trim()

  if (!secret) {
    throw new Error("PROOF_CACHE_SECRET_NOT_CONFIGURED")
  }

  return secret
}

function normalizeKey(key: string): string {
  const normalized = String(key).trim()

  if (!normalized) {
    throw new Error("INVALID_LAYER_CACHE_KEY")
  }

  return normalized
}

function normalizeTtl(ttl: number): number {
  if (!Number.isFinite(ttl) || ttl <= 0) {
    return DEFAULT_LAYER_CACHE_TTL_SECONDS
  }

  return Math.max(1, Math.floor(ttl))
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("hex")
}

function safeEqualHex(a: string, b: string): boolean {
  try {
    const aBuf = Buffer.from(a, "hex")
    const bBuf = Buffer.from(b, "hex")

    if (aBuf.length !== bBuf.length) {
      return false
    }

    return timingSafeEqual(aBuf, bBuf)
  } catch {
    return false
  }
}

function wrap<T>(payload: T): string {
  const str = JSON.stringify(payload)

  const envelope: SignedCacheEnvelope = {
    payload: str,
    signature: sign(str)
  }

  return JSON.stringify(envelope)
}

function unwrap<T>(raw: string): T {
  const parsed = JSON.parse(raw) as Partial<SignedCacheEnvelope>

  if (
    !parsed ||
    typeof parsed !== "object" ||
    typeof parsed.payload !== "string" ||
    typeof parsed.signature !== "string"
  ) {
    throw new Error("INVALID_CACHE_ENVELOPE")
  }

  const expected = sign(parsed.payload)

  if (!safeEqualHex(parsed.signature, expected)) {
    throw new Error("CACHE_TAMPER")
  }

  return JSON.parse(parsed.payload) as T
}

/* =========================
   GENERIC GET/SET
========================= */

export async function getLayerCache<T = JsonValue>(
  key: string
): Promise<T | null> {
  try {
    const normalizedKey = normalizeKey(key)
    const raw = await redis.get(normalizedKey)

    if (!raw) return null

    return unwrap<T>(raw)
  } catch {
    return null
  }
}

export async function setLayerCache<T = JsonValue>(
  key: string,
  value: T,
  ttl: number
): Promise<void> {
  try {
    const normalizedKey = normalizeKey(key)
    const safeTtl = normalizeTtl(ttl)

    await redis.set(normalizedKey, wrap(value), "EX", safeTtl)
  } catch (error) {
    console.error("LAYER_CACHE_SET_ERROR", {
      key,
      error: error instanceof Error ? error.message : "UNKNOWN_ERROR"
    })
  }
}