// @ts-nocheck
export { generateMerkleProof, generateMerkleProof as buildMerkleProof } from "../../crypto/merkleRoot"
export { getMerkleProof } from "../../proof/merkle/getMerkleProof"

export type MerkleProofNode = {
  position: "left" | "right"
  hash: string
}

