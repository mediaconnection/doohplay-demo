// @ts-nocheck
import crypto from "crypto"

function hash(data: string) {
  return crypto
    .createHash("sha256")
    .update(data)
    .digest("hex")
}

export function buildMerkleTree(leaves: string[]) {

  if (leaves.length === 0) {
    throw new Error("Nenhum hash fornecido")
  }

  let level = leaves

  while (level.length > 1) {

    const nextLevel: string[] = []

    for (let i = 0; i < level.length; i += 2) {

      const left = level[i]
      const right = level[i + 1] || left

      const combined = hash(left + right)

      nextLevel.push(combined)
    }

    level = nextLevel
  }

  return level[0]
}
