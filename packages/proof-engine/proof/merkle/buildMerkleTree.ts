// @ts-nocheck
import crypto from "crypto"

function hash(data: string): string {
  return crypto
    .createHash("sha256")
    .update(data)
    .digest("hex")
}

export function buildMerkleTree(leaves: string[]) {

  if (leaves.length === 0) {
    throw new Error("Cannot build Merkle tree with no leaves")
  }

  let level = leaves.map(hash)

  const tree: string[][] = [level]

  while (level.length > 1) {

    const nextLevel: string[] = []

    for (let i = 0; i < level.length; i += 2) {

      const left = level[i]
      const right = level[i + 1] || left

      const combined = hash(left + right)

      nextLevel.push(combined)
    }

    level = nextLevel
    tree.push(level)

  }

  return {
    root: level[0],
    tree
  }

}
