// @ts-nocheck
import { verifyMerkleProof } from "./verifyMerkleProof"

export function verifyProofGraph(graph: any) {

  if (!graph.merkle) {
    return { valid: false, reason: "Missing Merkle proof" }
  }

  const merkleValid = verifyMerkleProof(
    graph.merkle.leaf,
    graph.merkle.proof,
    graph.merkle.root
  )

  if (!merkleValid) {
    return { valid: false, reason: "Invalid Merkle proof" }
  }

  if (!graph.block) {
    return { valid: false, reason: "Missing block" }
  }

  if (!graph.anchor) {
    return { valid: false, reason: "Missing anchor" }
  }

  return { valid: true }
}
