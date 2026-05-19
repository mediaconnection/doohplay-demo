// /lib/domain/proof/signature.ts

import crypto from "crypto"

/* =========================
   TYPES
========================= */

type VerifyOptions = {
  encoding?: "hex" | "base64"
  publicKey?: string
  domain?: string
}

/* =========================
   HELPERS
========================= */

function isValidHex(str: string): boolean {
  return typeof str === "string" && /^[a-f0-9]+$/i.test(str)
}

function getPublicKey(): string | null {
  return process.env.PUBLIC_KEY || null
}

function applyDomain(data: string, domain?: string) {
  if (!domain) return data
  return `${domain}:${data}`
}

/* =========================
   VERIFY SIGNATURE
========================= */

export function verifySignature(
  data: string,
  signature: string,
  options?: VerifyOptions
): boolean {

  try {
    /* =========================
       INPUT VALIDATION
    ========================= */

    if (!data || typeof data !== "string") return false
    if (!signature || typeof signature !== "string") return false

    const encoding = options?.encoding || "hex"

    if (encoding === "hex" && !isValidHex(signature)) {
      return false
    }

    /* =========================
       PUBLIC KEY
    ========================= */

    const publicKey = options?.publicKey || getPublicKey()

    if (!publicKey) {
      console.error("VERIFY_ERROR: Missing public key")
      return false
    }

    /* =========================
       DOMAIN SEPARATION (CRÍTICO)
    ========================= */

    const payload = applyDomain(data, options?.domain || "DOOHPLAY_PROOF")

    /* =========================
       VERIFY
    ========================= */

    const verifier = crypto.createVerify("SHA256")

    verifier.update(payload)
    verifier.end()

    return verifier.verify(publicKey, signature, encoding)

  } catch (err) {

    console.error("SIGNATURE_VERIFY_ERROR:", {
      error: (err as Error).message
    })

    return false
  }
}