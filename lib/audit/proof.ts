// @ts-nocheck
// lib/audit/proof.ts

import { buildMerkleProof } from "@/lib/domain/proof/merkleProof"
import { AuditProof, MerkleProofStep } from "./types"

/**
 * 🌳 Gera a prova completa de um evento dentro de um bloco
 */
export function buildAuditProof(params: {
  eventHash: string
  blockHashes: string[]
  blockHash: string
  prevBlockHash?: string | null
  merkleRoot: string
  signature?: string | null
  timestamp?: string | null
}): AuditProof {

  const {
    eventHash,
    blockHashes,
    blockHash,
    prevBlockHash,
    merkleRoot,
    signature,
    timestamp
  } = params

  if (!blockHashes.length) {
    throw new Error("Empty block hashes")
  }

  // 🌳 gerar merkle proof
  const _mp = buildMerkleProof(blockHashes, eventHash)
  const merkleProof: MerkleProofStep[] = Array.isArray(_mp) ? _mp : (_mp as { proof: MerkleProofStep[] }).proof ?? []

  return {
    block_hash: blockHash,
    prev_block_hash: prevBlockHash || null,
    merkle_root: merkleRoot,
    merkle_proof: merkleProof,
    signature: signature || null,
    timestamp: timestamp || null
  }
}
