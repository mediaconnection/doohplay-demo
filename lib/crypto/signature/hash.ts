import { createHash } from "crypto"
import { canonicalizePayload } from "./canonical"
import type { CanonicalPayloadResult } from "./types"

export function sha256Hex(data: string | Buffer): string {
  return createHash("sha256").update(data).digest("hex")
}

export function canonicalDigest(payload: unknown): CanonicalPayloadResult {
  const canonical = canonicalizePayload(payload)
  const digest_hex = sha256Hex(canonical)

  return {
    canonical,
    digest_hex
  }
}