import { verifyPkcs7 } from "./verifyPkcs7"
import { verifyChain } from "./verifyChain"
import { checkOCSP } from "./checkOCSP"
import { checkCRL } from "./checkCRL"

/* =========================
   TYPES
========================= */

export type VerifyFullResult = {
  signature: boolean
  chain: boolean
  revoked: boolean
  expired: boolean
  reason:
    | "VALID"
    | "INVALID_SIGNATURE"
    | "INVALID_CHAIN"
    | "REVOKED_OCSP"
    | "REVOKED_CRL"
    | "EXPIRED"
    | "OCSP_FAILED"
}

/* =========================
   HELPERS
========================= */

function isValidHex(hash: string) {
  return /^[a-fA-F0-9]{64}$/.test(hash)
}

function isExpired(cert: any): boolean {
  try {
    const now = new Date()

    const notBefore = new Date(cert.validity.notBefore)
    const notAfter = new Date(cert.validity.notAfter)

    return now < notBefore || now > notAfter
  } catch {
    return true
  }
}

/* =========================
   MAIN
========================= */

export async function verifyFull(
  signature: string,
  hash: string,
  caCerts: string[]
): Promise<VerifyFullResult> {

  /* =========================
     🛡️ INPUT VALIDATION
  ========================= */

  if (!signature || typeof signature !== "string") {
    return {
      signature: false,
      chain: false,
      revoked: false,
      expired: false,
      reason: "INVALID_SIGNATURE"
    }
  }

  if (!isValidHex(hash)) {
    return {
      signature: false,
      chain: false,
      revoked: false,
      expired: false,
      reason: "INVALID_SIGNATURE"
    }
  }

  if (!Array.isArray(caCerts) || caCerts.length === 0) {
    return {
      signature: false,
      chain: false,
      revoked: false,
      expired: false,
      reason: "INVALID_CHAIN"
    }
  }

  /* =========================
     🔐 PKCS7
  ========================= */

  const sig = verifyPkcs7(signature, hash)

  if (!sig.valid || !sig.certificate) {
    return {
      signature: false,
      chain: false,
      revoked: false,
      expired: false,
      reason: "INVALID_SIGNATURE"
    }
  }

  /* =========================
     ⏱️ EXPIRATION CHECK
  ========================= */

  const expired = isExpired(sig.certificate)

  if (expired) {
    return {
      signature: true,
      chain: false,
      revoked: false,
      expired: true,
      reason: "EXPIRED"
    }
  }

  /* =========================
     🔗 CHAIN VALIDATION
  ========================= */

  const chain = verifyChain(
    sig.certificate,
    caCerts
  )

  if (!chain.valid) {
    return {
      signature: true,
      chain: false,
      revoked: false,
      expired: false,
      reason: "INVALID_CHAIN"
    }
  }

  /* =========================
     🌐 OCSP (PRIORITÁRIO)
  ========================= */

  let ocspFailed = false

  if (sig.issuerCert) {
    try {
      const ocsp = await checkOCSP(
        sig.certificate,
        sig.issuerCert
      )

      if (ocsp.revoked) {
        return {
          signature: true,
          chain: true,
          revoked: true,
          expired: false,
          reason: "REVOKED_OCSP"
        }
      }

    } catch (err) {
      console.warn("OCSP failed:", err)
      ocspFailed = true
    }
  } else {
    ocspFailed = true
  }

  /* =========================
     📜 CRL (FALLBACK)
  ========================= */

  try {
    const crl = await checkCRL(sig.certificate)

    if (crl.revoked) {
      return {
        signature: true,
        chain: true,
        revoked: true,
        expired: false,
        reason: "REVOKED_CRL"
      }
    }

  } catch (err) {
    console.error("CRL failed:", err)

    // 🔥 fallback crítico
    if (ocspFailed) {
      return {
        signature: true,
        chain: true,
        revoked: false,
        expired: false,
        reason: "OCSP_FAILED"
      }
    }
  }

  /* =========================
     ✅ OK
  ========================= */

  return {
    signature: true,
    chain: true,
    revoked: false,
    expired: false,
    reason: ocspFailed ? "OCSP_FAILED" : "VALID"
  }
}