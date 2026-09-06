import { getCachedProof } from "@proof-engine/proof/cache/proofCache"
import { verifySignature } from "./signature"

export type VerifyResult = {
  valid: boolean
  hash: string
  signed: boolean
  immutable: boolean
  timestamped: boolean
  issued_at?: string
  keyId?: string
}

type CachedProof = {
  root?: unknown
  timestamp?: unknown
  signature?: unknown
  keyId?: unknown
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null
}

function asTimestamp(value: unknown): number | null {
  const timestamp = Number(value)
  return Number.isFinite(timestamp) && timestamp > 0 ? timestamp : null
}

export async function verifyHash(hash: string): Promise<VerifyResult | null> {
  const proof = (await getCachedProof(hash)) as CachedProof | null

  if (!proof) {
    return null
  }

  const root = asString(proof.root)
  const signature = asString(proof.signature)
  const timestamp = asTimestamp(proof.timestamp)
  const keyId = asString(proof.keyId)

  if (!root || !signature) {
    return {
      valid: false,
      hash,
      signed: false,
      immutable: true,
      timestamped: Boolean(timestamp),
      issued_at: timestamp
        ? new Date(timestamp * 1000).toISOString()
        : undefined,
      keyId: keyId ?? undefined
    }
  }

  const payload = JSON.stringify({
    root,
    timestamp
  })

  const signatureValid = verifySignature(payload, signature, {
    encoding: "hex"
  })

  return {
    valid: signatureValid,
    hash,
    signed: signatureValid,
    immutable: true,
    timestamped: Boolean(timestamp),
    issued_at: timestamp
      ? new Date(timestamp * 1000).toISOString()
      : undefined,
    keyId: keyId ?? undefined
  }
}