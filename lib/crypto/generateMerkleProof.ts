import crypto from "crypto"

export type MerkleProofItem = {
  position: "left" | "right"
  hash: string
}

function sha256(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex")
}

function normalizeHash(value: string): string {
  return value.trim().toLowerCase().replace(/^0x/, "")
}

export function generateMerkleProof(
  leavesInput: string[],
  targetInput: string
): {
  root: string
  merkle_root: string
  proof: MerkleProofItem[]
} {
  const leaves = leavesInput.map(normalizeHash)
  const target = normalizeHash(targetInput)
  const targetIndex = leaves.indexOf(target)

  if (targetIndex < 0) {
    throw new Error("TARGET_NOT_FOUND_IN_LEAVES")
  }

  let index = targetIndex
  let level = [...leaves]
  const proof: MerkleProofItem[] = []

  while (level.length > 1) {
    const next: string[] = []

    for (let i = 0; i < level.length; i += 2) {
      const left = level[i]
      const right = level[i + 1] ?? left

      next.push(sha256(left + right))

      if (i === index || i + 1 === index) {
        const isLeft = index === i

        proof.push({
          position: isLeft ? "right" : "left",
          hash: isLeft ? right : left
        })
      }
    }

    index = Math.floor(index / 2)
    level = next
  }

  return {
    root: level[0],
    merkle_root: level[0],
    proof
  }
}
