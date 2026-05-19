import crypto from "crypto"

function sha256(data: string) {
  return crypto.createHash("sha256").update(data).digest("hex")
}

export function verifyMerkleProof(
  leaf: string,
  proof: string[],
  root: string
): boolean {

  let hash = sha256(leaf)

  for (const sibling of proof) {
    hash = sha256(hash + sibling)
  }

  return hash === root
}