// lib/domain/proof/batchMerkle.ts

import crypto from "crypto"

export type MerkleProofItem = {
  position: "left" | "right"
  hash: string
}

export type BatchMerkleProofResult = {
  leaf: string
  root: string
  proof: MerkleProofItem[]
  valid: boolean
}

function normalizeHash(value: string): string {
  return value.trim().toLowerCase().replace(/^0x/, "")
}

function isHash(value: string): boolean {
  return /^[a-f0-9]{64}$/i.test(normalizeHash(value))
}

function sha256Hex(buffer: Buffer): string {
  return crypto.createHash("sha256").update(buffer).digest("hex")
}

function hashNode(left: string, right: string): string {
  return sha256Hex(
    Buffer.concat([
      Buffer.from([0x01]),
      Buffer.from(normalizeHash(left), "hex"),
      Buffer.from(normalizeHash(right), "hex")
    ])
  )
}

export function buildMerkleRoot(hashes: string[]): string | null {
  let level = hashes.map(normalizeHash).filter(isHash)

  if (level.length === 0) return null
  if (level.length === 1) return level[0]

  while (level.length > 1) {
    const next: string[] = []

    for (let i = 0; i < level.length; i += 2) {
      const left = level[i]
      const right = level[i + 1] ?? left
      next.push(hashNode(left, right))
    }

    level = next
  }

  return level[0]
}

export function buildMerkleProof(
  hashes: string[],
  targetHash: string
): MerkleProofItem[] {
  let level = hashes.map(normalizeHash).filter(isHash)
  let index = level.indexOf(normalizeHash(targetHash))

  if (index < 0) return []

  const proof: MerkleProofItem[] = []

  while (level.length > 1) {
    const isRight = index % 2 === 1
    const pairIndex = isRight ? index - 1 : index + 1
    const pairHash = level[pairIndex] ?? level[index]

    proof.push({
      position: isRight ? "left" : "right",
      hash: pairHash
    })

    const next: string[] = []

    for (let i = 0; i < level.length; i += 2) {
      const left = level[i]
      const right = level[i + 1] ?? left
      next.push(hashNode(left, right))
    }

    index = Math.floor(index / 2)
    level = next
  }

  return proof
}

export function verifyMerkleProof(
  leaf: string,
  proof: MerkleProofItem[],
  root: string
): boolean {
  if (!isHash(leaf) || !isHash(root)) return false

  let computed = normalizeHash(leaf)

  for (const item of proof) {
    if (!isHash(item.hash)) return false

    computed =
      item.position === "left"
        ? hashNode(item.hash, computed)
        : hashNode(computed, item.hash)
  }

  return computed === normalizeHash(root)
}

export function buildBatchMerkleProofs(
  hashes: string[]
): BatchMerkleProofResult[] {
  const cleanHashes = hashes.map(normalizeHash).filter(isHash)
  const root = buildMerkleRoot(cleanHashes)

  if (!root) return []

  return cleanHashes.map((leaf) => {
    const proof = buildMerkleProof(cleanHashes, leaf)

    return {
      leaf,
      root,
      proof,
      valid: verifyMerkleProof(leaf, proof, root)
    }
  })
}