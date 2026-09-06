// /lib/domain/proof/verifyAll.ts

import { verifyMerkleProof } from "./verifyProof"
import { verifySignature } from "../../packages/proof-engine/legacy/proof/signature"

/* =========================
   TYPES
========================= */

type ProofBundle = {
  leaf: string
  proof: { position: "left" | "right"; hash: string }[]
  root: string
  signature: string
  timestamp: number
}

type VerifyResult = {
  valid: boolean
  errors: string[]
}

/* =========================
   CONFIG
========================= */

const MAX_AGE_SECONDS = 60 * 60 * 24 // 24h

/* =========================
   VERIFY ALL
========================= */

export function verifyAll(
  bundle: ProofBundle
): VerifyResult {

  const errors: string[] = []

  /* =========================
     1. MERKLE VALIDATION
  ========================= */

  const merkleValid = verifyMerkleProof(
    bundle.leaf,
    bundle.proof,
    bundle.root
  )

  if (!merkleValid) {
    errors.push("invalid_merkle_proof")
  }

  /* =========================
     2. SIGNATURE VALIDATION
  ========================= */

  const payload = `${bundle.root}:${bundle.timestamp}`

  const signatureValid = verifySignature(payload, bundle.signature)

  if (!signatureValid) {
    errors.push("invalid_signature")
  }

  /* =========================
     3. TIMESTAMP VALIDATION
  ========================= */

  const now = Math.floor(Date.now() / 1000)

  if (bundle.timestamp > now) {
    errors.push("timestamp_in_future")
  }

  if (now - bundle.timestamp > MAX_AGE_SECONDS) {
    errors.push("timestamp_expired")
  }

  /* =========================
     RESULT
  ========================= */

  return {
    valid: errors.length === 0,
    errors
  }
}