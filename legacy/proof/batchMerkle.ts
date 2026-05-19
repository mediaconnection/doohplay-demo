import {
  buildMerkleProof,
  buildMerkleRoot,
  verifyMerkleProofFromBatch,
  type MerkleProofItem
} from "./merkleBatch"

export type { MerkleProofItem } from "./merkleBatch"

export type BatchMerkleProofResult = {
  leaf: string
  root: string
  proof: MerkleProofItem[]
  valid: boolean
}

function normalizeHash(value: string): string {
  return value.trim().toLowerCase().replace(/^0x/, "")
}

function isValidHash(value: string): boolean {
  return /^[a-f0-9]{64}$/i.test(normalizeHash(value))
}

export function verifyMerkleProof(
  leaf: string,
  proof: MerkleProofItem[],
  root: string
): boolean {
  const result = verifyMerkleProofFromBatch(
    normalizeHash(leaf),
    normalizeHash(root),
    proof
  )

  return result.valid === true
}

export function buildBatchMerkleProofs(
  hashes: string[]
): BatchMerkleProofResult[] {
  const cleanHashes = hashes.map(normalizeHash).filter(isValidHash)

  if (!cleanHashes.length) return []

  const root = buildMerkleRoot(cleanHashes)

  if (!root) return []

  return cleanHashes.map((leaf): BatchMerkleProofResult => {
    const proof = buildMerkleProof(cleanHashes, leaf) ?? []

    return {
      leaf,
      root,
      proof,
      valid: proof.length > 0 ? verifyMerkleProof(leaf, proof, root) : false
    }
  })
}

export { buildMerkleProof, buildMerkleRoot }