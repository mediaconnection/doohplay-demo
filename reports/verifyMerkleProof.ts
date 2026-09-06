// @ts-nocheck
import {
  hashMerkleNode,
  normalizeHash,
  isHex64,
  type MerkleProofItem
} from "@proof-engine/domain/proof/merkleBatch"

export type ProofNode = MerkleProofItem

export function verifyMerkleProof(
  leaf: string,
  proof: ProofNode[],
  root: string
): boolean {

  const normalizedLeaf = normalizeHash(leaf)
  const normalizedRoot = normalizeHash(root)

  if (!isHex64(normalizedLeaf)) {
    throw new Error("INVALID_LEAF_HASH")
  }

  if (!isHex64(normalizedRoot)) {
    throw new Error("INVALID_ROOT_HASH")
  }

  if (!Array.isArray(proof)) {
    throw new Error("INVALID_PROOF")
  }

  let current = normalizedLeaf

  for (const rawStep of proof) {
    const step = typeof rawStep === "string"
      ? { hash: rawStep, position: "right" as const }
      : rawStep as { hash?: string; position?: "left" | "right" }

    const sibling = normalizeHash(step.hash)

    if (!isHex64(sibling)) {
      throw new Error("INVALID_PROOF_NODE")
    }

    if (step.position === "left") {
      current = hashMerkleNode(sibling, current)
    } else {
      current = hashMerkleNode(current, sibling)
    }
  }

  return current === normalizedRoot
}
