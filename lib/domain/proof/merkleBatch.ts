// @ts-nocheck
export { buildBatchMerkleProofs } from "./batchMerkle"
export type { BatchMerkleProof } from "./batchMerkle"
export { normalizeHash } from "../../../packages/proof-engine/proof/chain"
export { buildMerkleRoot } from "../../../src/core/audit/merkleRoot"
export { generateMerkleProof as buildMerkleProof } from "../../crypto/merkleRoot"
export { type MerkleProofItem } from "../../../packages/proof-engine/proof/merkle/verifyMerkleProof"
export { isHex64 } from "../../merkle/index"

export function hashMerkleNode(left: string, right: string): string {
  const { createHash } = require("crypto") as typeof import("crypto")
  return createHash("sha256")
    .update(Buffer.from(left, "hex"))
    .update(Buffer.from(right, "hex"))
    .digest("hex")
}

