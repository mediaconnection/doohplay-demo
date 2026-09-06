// @ts-nocheck
export { buildMerkleTree } from "../../packages/proof-engine/proof/merkle/buildMerkleTree"
export { getMerkleProof } from "../../packages/proof-engine/proof/merkle/getMerkleProof"
export {
  verifyMerkleProof,
  type MerkleProofItem,
} from "../../packages/proof-engine/proof/merkle/verifyMerkleProof"
export { generateMerkleProof } from "../crypto/merkleRoot"
export { buildMerkleRoot } from "../../src/core/audit/merkleRoot"
export { normalizeHash } from "../../packages/proof-engine/proof/chain"

export { generateMerkleProof as buildMerkleProof } from "../crypto/merkleRoot"

export function isHex64(value: unknown): value is string {
  return typeof value === "string" && /^[a-f0-9]{64}$/i.test(value)
}

