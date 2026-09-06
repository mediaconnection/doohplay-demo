// /lib/domain/proof/signature.ts

import crypto from "crypto"

/* =========================
   ENV VALIDATION
========================= */

const PUBLIC_KEY = process.env.PUBLIC_KEY ?? ""

function requirePublicKey(): string {
  if (!PUBLIC_KEY) throw new Error("PUBLIC_KEY is not defined")
  return PUBLIC_KEY
}

/* =========================
   HELPERS
========================= */

function isValidHex(str: string): boolean {
  return typeof str === "string" && /^[a-f0-9]+$/i.test(str)
}

/* =========================
   VERIFY SIGNATURE
========================= */

export function verifySignature(
  data: string,
  signature: string,
  options?: {
    encoding?: "hex" | "base64"
  }
): boolean {

  try {
    if (!data || typeof data !== "string") return false
    if (!signature || typeof signature !== "string") return false

    const encoding = options?.encoding || "hex"

    // valida formato se hex
    if (encoding === "hex" && !isValidHex(signature)) {
      return false
    }

    const verifier = crypto.createVerify("SHA256")

    verifier.update(data)
    verifier.end()

    return verifier.verify(requirePublicKey(), signature, encoding)

  } catch (err) {

    // opcional: log estruturado
    console.error("SIGNATURE_VERIFY_ERROR:", {
      error: (err as Error).message
    })

    return false
  }
}