import {
  verifyMerkleProof,
  type MerkleProofItem
} from "./batchMerkle"

import {
  verifyBlockchainAnchor,
  type BlockchainVerifyInput
} from "./blockchainVerify"

export type BatchMerkleInput = {
  leaf: string
  proof: MerkleProofItem[]
  root: string
}

export type BatchCrossLayerInput = {
  merkle: BatchMerkleInput[]
  blockchain: BlockchainVerifyInput
}

type MerkleProofResult = {
  leaf: string
  root: string
  valid: boolean
}

type BatchMerkleResult = {
  valid: boolean
  total: number
  valid_count: number
  invalid_count: number
  results: MerkleProofResult[]
}

function verifyBatchMerkleProofs(input: BatchMerkleInput[]): BatchMerkleResult {
  const results: MerkleProofResult[] = input.map((item) => ({
    leaf: item.leaf,
    root: item.root,
    valid: verifyMerkleProof(item.leaf, item.proof, item.root)
  }))

  const validCount = results.filter((item) => item.valid).length

  return {
    valid: results.length > 0 && validCount === results.length,
    total: results.length,
    valid_count: validCount,
    invalid_count: results.length - validCount,
    results
  }
}

export async function verifyBatchCrossLayer(input: BatchCrossLayerInput) {
  const merkle = verifyBatchMerkleProofs(input.merkle)
  const blockchain = await verifyBlockchainAnchor(input.blockchain)

  const crossLayerValid =
    merkle.valid &&
    blockchain.valid === true &&
    blockchain.anchored === true

  const issues: string[] = []

  if (!merkle.valid) issues.push("BATCH_MERKLE_INVALID")
  if (blockchain.anchored !== true) issues.push("BLOCKCHAIN_NOT_ANCHORED")
  if (blockchain.valid !== true) issues.push("BLOCKCHAIN_INVALID")

  return {
    status: crossLayerValid ? "VERIFIED" : "WARNING",
    valid: crossLayerValid,
    trust_level: crossLayerValid ? "HIGH" : "MEDIUM",
    risk: crossLayerValid ? "LOW" : "MEDIUM",
    score: crossLayerValid ? 100 : merkle.valid ? 70 : 40,
    merkle,
    blockchain,
    cross_layer: {
      valid: crossLayerValid,
      consistent: crossLayerValid,
      issues
    },
    meta: {
      schema_version: "batch-cross-layer-v1",
      generated_at: new Date().toISOString()
    }
  }
}