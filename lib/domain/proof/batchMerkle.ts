// @ts-nocheck
export { verifyMerkleProof } from "../../proof/merkle/verifyMerkleProof"

export type BatchMerkleProof = {
  leaf: string
  proof: string[]
  root: string
}

export async function buildBatchMerkleProofs(
  _hashes: string[]
): Promise<BatchMerkleProof[]> {
  throw new Error("buildBatchMerkleProofs: not implemented")
}

