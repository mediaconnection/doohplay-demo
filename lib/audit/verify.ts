// lib/audit/verify.ts

import crypto from "crypto"
import { AuditProof, AuditVerificationResult } from "./types"

/**
 * 🔐 hash SHA-256 padrão
 */
function sha256(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex")
}

/**
 * 🔎 valida formato de hash
 */
function isValidHash(hash?: string | null): boolean {
  return typeof hash === "string" && /^[a-f0-9]{64}$/i.test(hash)
}

/**
 * 🌳 valida Merkle Proof
 */
export function verifyMerkleProof(
  eventHash: string,
  proof: AuditProof["merkle_proof"],
  merkleRoot: string
): { valid: boolean; computedRoot: string } {

  if (!isValidHash(eventHash) || !isValidHash(merkleRoot)) {
    return { valid: false, computedRoot: "" }
  }

  if (!Array.isArray(proof) || proof.length === 0) {
    return { valid: false, computedRoot: "" }
  }

  let computed = eventHash

  for (const step of proof) {
    if (!step || !isValidHash(step.hash)) {
      return { valid: false, computedRoot: "" }
    }

    if (step.position === "left") {
      computed = sha256(step.hash + computed)
    } else if (step.position === "right") {
      computed = sha256(computed + step.hash)
    } else {
      return { valid: false, computedRoot: "" }
    }
  }

  return {
    valid: computed === merkleRoot,
    computedRoot: computed
  }
}

/**
 * 🔗 valida hash do bloco
 */
export function verifyBlockHash(
  prevBlockHash: string | null | undefined,
  merkleRoot: string,
  blockHash: string
): boolean {

  if (!isValidHash(merkleRoot) || !isValidHash(blockHash)) {
    return false
  }

  if (prevBlockHash && !isValidHash(prevBlockHash)) {
    return false
  }

  const expected = sha256((prevBlockHash || "") + merkleRoot)

  return expected === blockHash
}

/**
 * 🔐 valida assinatura (placeholder ICP)
 */
export function verifySignature(
  blockHash: string,
  signature?: string | null
): boolean {

  if (!signature || !isValidHash(blockHash)) {
    return false
  }

  // ⚠️ placeholder — substituir por ICP real
  const expected = sha256("ICP_PRIVATE_KEY" + blockHash)

  return expected === signature
}

/**
 * 🧠 verificação completa
 */
export function verifyAuditProof(
  eventHash: string,
  proof: AuditProof
): AuditVerificationResult {

  // 🔒 valida estrutura mínima
  if (
    !proof ||
    !isValidHash(eventHash) ||
    !isValidHash(proof.block_hash) ||
    !isValidHash(proof.merkle_root)
  ) {
    return {
      merkle_valid: false,
      block_valid: false,
      signature_valid: false,
      fully_verified: false
    }
  }

  // 🌳 merkle
  const merkle = verifyMerkleProof(
    eventHash,
    proof.merkle_proof,
    proof.merkle_root
  )

  // 🔗 bloco
  const blockValid = verifyBlockHash(
    proof.prev_block_hash,
    proof.merkle_root,
    proof.block_hash
  )

  // 🔐 assinatura
  const signatureValid = proof.signature
    ? verifySignature(proof.block_hash, proof.signature)
    : false

  const fullyVerified =
    merkle.valid &&
    blockValid &&
    (proof.signature ? signatureValid : true)

  return {
    merkle_valid: merkle.valid,
    block_valid: blockValid,
    signature_valid: signatureValid,
    fully_verified: fullyVerified,
    details: {
      expected_root: proof.merkle_root,
      computed_root: merkle.computedRoot
    }
  }
}