// /lib/domain/proof/merkle.ts

import crypto from "crypto"

export type MerkleProofNode = {
  hash: string
  position: "left" | "right"
}

export type MerkleTree = {
  root: string
  levels: string[][]
  leaves: string[]
}

function normalizeHash(value: string): string {
  return value.trim().toLowerCase().replace(/^0x/, "")
}

function formatHash(value: string): string {
  return `0x${normalizeHash(value)}`
}

function isHex64(value: string): boolean {
  return /^[a-f0-9]{64}$/.test(normalizeHash(value))
}

function hashPair(left: string, right: string): string {
  return crypto
    .createHash("sha256")
    .update(
      Buffer.concat([
        Buffer.from(normalizeHash(left), "hex"),
        Buffer.from(normalizeHash(right), "hex")
      ])
    )
    .digest("hex")
}

export function buildMerkleTree(hashes: string[]): MerkleTree {
  if (!Array.isArray(hashes) || hashes.length === 0) {
    throw new Error("NO_MERKLE_LEAVES")
  }

  const leaves = hashes.map((hash) => {
    const normalized = normalizeHash(hash)

    if (!isHex64(normalized)) {
      throw new Error(`INVALID_MERKLE_LEAF:${hash}`)
    }

    return normalized
  })

  const levels: string[][] = [leaves]

  while (levels[levels.length - 1].length > 1) {
    const current = levels[levels.length - 1]
    const next: string[] = []

    for (let i = 0; i < current.length; i += 2) {
      const left = current[i]
      const right = current[i + 1] ?? current[i]

      next.push(hashPair(left, right))
    }

    levels.push(next)
  }

  return {
    root: formatHash(levels[levels.length - 1][0]),
    levels,
    leaves
  }
}

export function getMerkleProof(
  tree: MerkleTree,
  leafHash: string
): MerkleProofNode[] {
  const normalizedLeaf = normalizeHash(leafHash)

  if (!isHex64(normalizedLeaf)) {
    throw new Error(`INVALID_MERKLE_LEAF:${leafHash}`)
  }

  let index = tree.leaves.findIndex((leaf) => leaf === normalizedLeaf)

  if (index === -1) {
    throw new Error(`LEAF_NOT_FOUND:${leafHash}`)
  }

  const proof: MerkleProofNode[] = []

  for (let level = 0; level < tree.levels.length - 1; level += 1) {
    const current = tree.levels[level]
    const isRightNode = index % 2 === 1
    const siblingIndex = isRightNode ? index - 1 : index + 1
    const sibling = current[siblingIndex] ?? current[index]

    proof.push({
      hash: formatHash(sibling),
      position: isRightNode ? "left" : "right"
    })

    index = Math.floor(index / 2)
  }

  return proof
}

export function buildMerkleRoot(hashes: string[]): string {
  return buildMerkleTree(hashes).root
}