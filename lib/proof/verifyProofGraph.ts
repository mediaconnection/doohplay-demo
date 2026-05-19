import crypto from "crypto"
import { ProofGraph } from "./types/ProofGraph"

function hash(data: string) {
  return crypto
    .createHash("sha256")
    .update(data)
    .digest("hex")
}

export function verifyMerkleProof(
  leaf: string,
  proof: string[],
  root: string
): boolean {

  let computedHash = hash(leaf)

  for (const sibling of proof) {
    computedHash = hash(computedHash + sibling)
  }

  return computedHash === root

}

export function verifyProofGraph(graph: ProofGraph) {

  if (!graph.merkle) {
    return {
      valid: false,
      reason: "Missing merkle proof"
    }
  }

  const merkleValid = verifyMerkleProof(
    graph.merkle.leaf,
    graph.merkle.proof,
    graph.merkle.root
  )

  if (!merkleValid) {
    return {
      valid: false,
      reason: "Invalid Merkle proof"
    }
  }

  if (!graph.block) {
    return {
      valid: false,
      reason: "Missing ledger block"
    }
  }

  if (!graph.anchor) {
    return {
      valid: false,
      reason: "Missing anchor"
    }
  }

  return {
    valid: true
  }

}