import crypto from "crypto"
import { MerkleProofNode } from "./merkleProof"

/* =========================
   HASH
========================= */

function hash(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex")
}

/* =========================
   VALIDATION
========================= */

function isValidHash(value: string): boolean {
  return typeof value === "string" && /^[a-f0-9]{64}$/i.test(value)
}

/* =========================
   VERIFY MERKLE PROOF
========================= */

export function verifyMerkleProof(
  targetHash: string,
  proof: MerkleProofNode[] = [],
  root: string
): boolean {
  try {

    /* =========================
       BASIC VALIDATION
    ========================= */

    if (!isValidHash(targetHash)) return false
    if (!isValidHash(root)) return false

    if (!Array.isArray(proof)) return false

    /* =========================
       EDGE CASE: SINGLE NODE TREE
    ========================= */

    if (proof.length === 0) {
      return targetHash === root
    }

    /* =========================
       REBUILD HASH PATH
    ========================= */

    let computed = targetHash

    for (const rawStep of proof) {
      const step = typeof rawStep === "string"
        ? { hash: rawStep, position: "right" as const }
        : rawStep as { hash?: string; position?: "left" | "right" }

      if (!step || !isValidHash(step.hash)) {
        return false
      }

      if (step.position === "left") {
        computed = hash((step.hash ?? "") + computed)
      } else if (step.position === "right") {
        computed = hash(computed + (step.hash ?? ""))
      } else {
        // posição inválida → prova inválida
        return false
      }
    }

    /* =========================
       FINAL CHECK
    ========================= */

    return computed === root

  } catch (err) {
    console.error("❌ verifyMerkleProof error:", err)
    return false
  }
}