// @ts-nocheck
import { createHash } from "crypto"

export type MerkleProofStep = {
  hash: string
  position: "left" | "right"
}

export function isValidHash(hash: unknown): hash is string {
  return typeof hash === "string" && /^[a-f0-9]{64}$/i.test(hash)
}

export function sha256(data: string | Buffer): string {
  return createHash("sha256").update(data).digest("hex")
}

export function hashPair(left: string, right: string): string {
  if (!isValidHash(left)) {
    throw new Error("Invalid left hash")
  }

  if (!isValidHash(right)) {
    throw new Error("Invalid right hash")
  }

  return sha256(Buffer.concat([Buffer.from(left, "hex"), Buffer.from(right, "hex")]))
}

export function verifyMerkleProof(
  leaf: string,
  proof: MerkleProofStep[],
  root: string
): boolean {
  if (!isValidHash(leaf)) {
    throw new Error("Invalid leaf hash")
  }

  if (!isValidHash(root)) {
    throw new Error("Invalid Merkle root")
  }

  if (!Array.isArray(proof)) {
    throw new Error("Proof must be an array")
  }

  let hash = leaf.toLowerCase()

  for (const step of proof) {
    if (
      !step ||
      !isValidHash(step.hash) ||
      (step.position !== "left" && step.position !== "right")
    ) {
      throw new Error("Invalid proof step")
    }

    const sibling = step.hash.toLowerCase()

    hash =
      step.position === "left"
        ? hashPair(sibling, hash)
        : hashPair(hash, sibling)
  }

  return hash === root.toLowerCase()
}
