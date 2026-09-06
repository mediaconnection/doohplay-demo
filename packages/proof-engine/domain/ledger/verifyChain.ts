// @ts-nocheck
import crypto from "crypto"

import { pool } from "@/lib/db"

type ChainRow = {
  event_hash: string | null
  previous_event_hash: string | null
  prev_hash?: string | null
}

export type VerifyEventChainResult =
  | {
      valid: true
      depth: number
    }
  | {
      valid: false
      depth?: number
      error: string
    }

function normalizeHash(value: unknown): string | null {
  if (typeof value !== "string") return null

  const normalized = value.trim().toLowerCase().replace(/^0x/, "")
  return /^[a-f0-9]{64}$/.test(normalized) ? normalized : null
}

function hash(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex")
}

export async function verifyEventChain(
  startHash: string
): Promise<VerifyEventChainResult> {
  const normalizedStartHash = normalizeHash(startHash)

  if (!normalizedStartHash) {
    return { valid: false, error: "Invalid start hash" }
  }

  const visited = new Set<string>()

  let currentHash: string | null = normalizedStartHash
  let depth = 0

  while (currentHash) {
    if (visited.has(currentHash)) {
      return { valid: false, depth, error: "Loop detected" }
    }

    visited.add(currentHash)

    const result = await pool.query(
      `
      SELECT
        event_hash,
        previous_event_hash,
        previous_event_hash AS prev_hash
      FROM public.event_chain
      WHERE lower(replace(event_hash, '0x', '')) = $1
      LIMIT 1
      `,
      [currentHash]
    )

    const rows = result.rows as ChainRow[]
    const event = rows[0]

    if (!event) {
      return { valid: false, depth, error: "Missing event in chain" }
    }

    const eventHash = normalizeHash(event.event_hash)

    if (eventHash !== currentHash) {
      return { valid: false, depth, error: "Hash mismatch" }
    }

    currentHash =
      normalizeHash(event.previous_event_hash) ??
      normalizeHash(event.prev_hash)

    depth += 1

    if (depth > 1000) {
      return { valid: false, depth, error: "Chain too deep" }
    }
  }

  hash(String(depth))

  return { valid: true, depth }
}

export default verifyEventChain
