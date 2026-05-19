import { createVerify, createPublicKey } from "crypto"
import { canonicalDigest } from "./hash"
import type {
  SignatureEvidencePackage,
  VerifySignatureResult
} from "./types"

function extractPublicKeyPem(pkg: SignatureEvidencePackage): string | null {
  if (pkg.signature.public_key_pem?.trim()) {
    return pkg.signature.public_key_pem
  }

  if (pkg.signature.certificate_pem?.trim()) {
    try {
      return createPublicKey(pkg.signature.certificate_pem)
        .export({ format: "pem", type: "spki" })
        .toString()
    } catch {
      return null
    }
  }

  return null
}

export function verifyEvidencePackage(
  payload: unknown,
  pkg: SignatureEvidencePackage
): VerifySignatureResult {
  const reasons: string[] = []
  const recomputed = canonicalDigest(payload)

  const digest_match = recomputed.digest_hex === pkg.digest_hex
  if (!digest_match) {
    reasons.push("HASH_MISMATCH")
  }

  const publicKeyPem = extractPublicKeyPem(pkg)
  const certificate_present = Boolean(pkg.signature.certificate_pem)

  let signature_valid = false
  if (!publicKeyPem) {
    reasons.push("PUBLIC_KEY_UNAVAILABLE")
  } else {
    try {
      const verifier = createVerify(pkg.signature.algorithm)
      verifier.update(pkg.canonical)
      verifier.end()

      signature_valid = verifier.verify(
        publicKeyPem,
        pkg.signature.signature_base64,
        "base64"
      )

      if (!signature_valid) {
        reasons.push("INVALID_SIGNATURE")
      }
    } catch {
      reasons.push("SIGNATURE_VERIFICATION_ERROR")
    }
  }

  const timestamp_present = Boolean(pkg.timestamp?.token_base64)
  const timestamp_valid = timestamp_present

  return {
    valid: digest_match && signature_valid,
    algorithm: pkg.signature.algorithm,
    digest_match,
    signature_valid,
    certificate_present,
    timestamp_present,
    timestamp_valid,
    reasons,
    details: {
      signed_at: pkg.signature.signed_at,
      timestamped_at: pkg.timestamp?.gen_time ?? null,
      entity_id: pkg.entity_id,
      entity_type: pkg.entity_type
    }
  }
}