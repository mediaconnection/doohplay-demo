// @ts-nocheck
import crypto from "crypto"

export function buildIdempotencyKey(input: any) {
  const raw = `${input.hash}:${input.entity_id}:${input.entity_type}`

  return crypto.createHash("sha256").update(raw).digest("hex")
}
