// @ts-nocheck
export { generateMerkleProof, generateMerkleProof as buildMerkleProof } from "../../crypto/merkleRoot"
export { getMerkleProof } from "../../../packages/proof-engine/proof/merkle/getMerkleProof"

export type MerkleProofNode = {
  position: "left" | "right"
  hash: string
}

