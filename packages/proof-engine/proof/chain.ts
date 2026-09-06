// @ts-nocheck
import { createHash } from "crypto"

/* =========================
   CONSTANTS
========================= */

const HASH_REGEX = /^[a-f0-9]{64}$/i

/* =========================
   NORMALIZATION
========================= */

export function normalizeHash(input: string | null | undefined): string {
  if (!input) return ""

  return input
    .toString()
    .trim()
    .toLowerCase()
    .replace(/^0x/, "")
}

/* =========================
   VALIDATION
========================= */

export function isValidHash(hash: string): boolean {
  return HASH_REGEX.test(normalizeHash(hash))
}

/* =========================
   SHA256
========================= */

export function sha256(data: string): string {
  return createHash("sha256").update(data).digest("hex")
}

/* =========================
   CHAIN HASH (CANONICAL)
========================= */

export function buildChainHash(
  previousHash: string | null,
  eventHash: string
): string {
  const prev = normalizeHash(previousHash)
  const curr = normalizeHash(eventHash)

  if (!isValidHash(curr)) {
    throw new Error("INVALID_EVENT_HASH")
  }

  if (prev && !isValidHash(prev)) {
    throw new Error("INVALID_PREVIOUS_HASH")
  }

  /**
   * Canonical structure:
   * versioned + deterministic
   */
  const payload = JSON.stringify({
    v: 1,
    previous: prev || null,
    current: curr
  })

  return sha256(payload)
}
