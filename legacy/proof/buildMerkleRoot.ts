import {
  hashMerkleNode,
  normalizeHash,
  isHex64
} from "@proof-engine/domain/proof/merkleBatch"

export function buildMerkleRoot(leaves: string[]): string {

  const normalized = leaves
    .map(normalizeHash)
    .filter(isHex64)

  if (!normalized.length) {
    throw new Error("EMPTY_MERKLE_TREE")
  }

  let level = normalized

  while (level.length > 1) {
    const next: string[] = []

    for (let i = 0; i < level.length; i += 2) {
      const left = level[i]
      const right = level[i + 1] || left

      next.push(hashMerkleNode(left, right))
    }

    level = next
  }

  return level[0]
}