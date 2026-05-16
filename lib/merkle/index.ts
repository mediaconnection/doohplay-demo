export { buildMerkleTree } from "../proof/merkle/buildMerkleTree"
export { getMerkleProof } from "../proof/merkle/getMerkleProof"
export {
  verifyMerkleProof,
  type MerkleProofItem,
} from "../proof/merkle/verifyMerkleProof"
export { generateMerkleProof } from "../crypto/merkleRoot"
export { buildMerkleRoot } from "../../src/core/audit/merkleRoot"
export { normalizeHash } from "../proof/chain"

export { generateMerkleProof as buildMerkleProof } from "../crypto/merkleRoot"

export function isHex64(value: unknown): value is string {
  return typeof value === "string" && /^[a-f0-9]{64}$/i.test(value)
}
