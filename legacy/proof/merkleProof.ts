import {
  buildMerkleProof as buildMerkleProofCore,
  buildMerkleRoot,
  normalizeHash,
  isHex64,
  type MerkleProofItem
} from "@proof-engine/domain/proof/merkleBatch"

export type MerkleProofNode = MerkleProofItem

export type MerkleProofResult = {
  root: string
  merkle_root: string
  proof: MerkleProofNode[]
}

/* =========================
   HELPERS
========================= */

function normalizeLeaves(leaves: string[]): string[] {
  return leaves.map(normalizeHash).filter(isHex64)
}

/* =========================
   MODERN COMPAT
========================= */

export function buildMerkleProof(
  leaves: string[],
  targetHash: string
): MerkleProofNode[] {
  const normalizedLeaves = normalizeLeaves(leaves)
  const target = normalizeHash(targetHash)

  const result = buildMerkleProofCore(normalizedLeaves, target)
  const proof = Array.isArray(result) ? result : (result as { proof?: MerkleProofNode[] }).proof ?? []

  if (!proof.length) {
    throw new Error("TARGET_HASH_NOT_FOUND")
  }

  return proof
}

/* =========================
   LEGACY COMPAT
========================= */

export function generateMerkleProof(
  hashes: string[],
  index: number
): MerkleProofResult {
  const normalizedLeaves = normalizeLeaves(hashes)

  if (!normalizedLeaves.length) {
    throw new Error("EMPTY_MERKLE_TREE")
  }

  if (index < 0 || index >= normalizedLeaves.length) {
    throw new Error("INVALID_INDEX")
  }

  const target = normalizedLeaves[index]
  const root = buildMerkleRoot(normalizedLeaves)
  const _result = buildMerkleProofCore(normalizedLeaves, target)
  const proof: MerkleProofNode[] = Array.isArray(_result) ? _result : ((_result as { proof?: MerkleProofNode[] }).proof ?? [])

  if (!root || !proof.length) {
    throw new Error("MERKLE_PROOF_GENERATION_FAILED")
  }

  return {
    root,
    merkle_root: root,
    proof
  }
}