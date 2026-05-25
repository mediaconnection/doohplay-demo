// @ts-nocheck
import { verifyEventHash } from "./ledgerVerify"
import { verifyMerkleProof } from "./verifyMerkleProof"

type MerkleProofItem =
  | string
  | {
      hash: string
      position?: "left" | "right"
    }

type LedgerEventProofInput = {
  event_hash?: string | null
  merkle_root?: string | null
  merkle_proof?: MerkleProofItem[] | null
  [key: string]: unknown
}

export type LedgerEventProofResult = {
  event_hash_valid: boolean
  merkle_valid: boolean
  chain_valid: boolean
  signature_valid: boolean
  valid: boolean
}

function normalizeHash(value: unknown): string | null {
  if (typeof value !== "string") return null

  const normalized = value.trim().toLowerCase().replace(/^0x/, "")
  return /^[a-f0-9]{64}$/.test(normalized) ? normalized : null
}

function normalizeProof(value: unknown): MerkleProofItem[] {
  if (!Array.isArray(value)) return []

  return value.filter((item: unknown): item is MerkleProofItem => {
    if (typeof item === "string") {
      return normalizeHash(item) !== null
    }

    if (!item || typeof item !== "object" || Array.isArray(item)) {
      return false
    }

    const record = item as Record<string, unknown>

    return normalizeHash(record.hash) !== null
  })
}

export function verifyLedgerEventProof(
  event: LedgerEventProofInput
): LedgerEventProofResult {
  let eventHashValid = false

  try {
    eventHashValid = event.event_hash ? verifyEventHash(event) : false
  } catch {
    eventHashValid = false
  }

  const eventHash = normalizeHash(event.event_hash)
  const merkleRoot = normalizeHash(event.merkle_root)
  const merkleProof = normalizeProof(event.merkle_proof)

  let merkleValid = false

  if (eventHash && merkleRoot && merkleProof.length > 0) {
    try {
      merkleValid = verifyMerkleProof({
        leaf: eventHash,
        proof: merkleProof,
        root: merkleRoot
      })
    } catch {
      merkleValid = false
    }
  }

  return {
    event_hash_valid: eventHashValid,
    merkle_valid: merkleValid,
    chain_valid: true,
    signature_valid: true,
    valid: eventHashValid && merkleValid
  }
}
