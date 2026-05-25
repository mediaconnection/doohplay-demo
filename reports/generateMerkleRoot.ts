// @ts-nocheck
import crypto from "crypto"

function hash(data: string) {
  return crypto
    .createHash("sha256")
    .update(data)
    .digest("hex")
}

export function generateMerkleRoot(
  hashes: string[]
) {

  if (hashes.length === 0) {
    throw new Error("Nenhum hash fornecido")
  }

  let level = hashes

  while (level.length > 1) {

    const next: string[] = []

    for (let i = 0; i < level.length; i += 2) {

      const left = level[i]
      const right = level[i + 1] || left

      next.push(hash(left + right))

    }

    level = next
  }

  return level[0]
}
