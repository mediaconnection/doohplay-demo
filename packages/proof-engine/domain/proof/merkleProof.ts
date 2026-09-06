// @ts-nocheck
export { generateMerkleProof, generateMerkleProof as buildMerkleProof } from "../../../../lib/crypto/merkleRoot"
export { getMerkleProof } from "../../../../packages/proof-engine/proof/merkle/getMerkleProof"

export type MerkleProofNode = {
  position: "left" | "right"
  hash: string
}

