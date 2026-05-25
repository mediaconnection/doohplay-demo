// @ts-nocheck
import crypto from "crypto"

function sha256(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex")
}

type ProofNode = {
  position: "left" | "right"
  hash: string
}

/**
 * Gera Merkle Proof de um hash dentro de uma lista
 */
export function generateMerkleProof(
  leaves: string[],
  targetHash: string
) {
  if (!leaves.length) {
    throw new Error("Empty tree")
  }

  let index = leaves.indexOf(targetHash)

  if (index === -1) {
    throw new Error("Target hash not found in leaves")
  }

  let proof: ProofNode[] = []
  let level = [...leaves]

  while (level.length > 1) {
    let nextLevel: string[] = []

    for (let i = 0; i < level.length; i += 2) {
      const left = level[i]
      const right = level[i + 1] || left

      const combined = sha256(left + right)
      nextLevel.push(combined)

      // se o target está neste par
      if (i === index || i + 1 === index) {
        if (i === index) {
          // target é LEFT → sibling é RIGHT
          proof.push({
            position: "right",
            hash: right
          })
        } else {
          // target é RIGHT → sibling é LEFT
          proof.push({
            position: "left",
            hash: left
          })
        }

        index = Math.floor(i / 2)
      }
    }

    level = nextLevel
  }

  return {
    merkle_root: level[0],
    proof
  }
}
