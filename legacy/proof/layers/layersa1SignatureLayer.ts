import { verifyEventProof } from "@/lib/crypto/signEventProof"

export type A1SignatureLayerInput = {
  event_hash?: string | null
  signature?: string | null
  signature_algorithm?: string | null
  signature_encoding?: "base64" | "hex" | string | null
  proof_payload_hash?: string | null
  certificate_subject?: string | null
  certificate_issuer?: string | null
  certificate_serial_number?: string | null
  certificate_fingerprint?: string | null
  certificate_valid_to?: string | null
  certificate_days_remaining?: number | null
}

export async function a1SignatureLayer(input: A1SignatureLayerInput) {
  const reasons: string[] = []

  if (!input.signature) reasons.push("SIGNATURE_MISSING")
  if (!input.proof_payload_hash) reasons.push("PROOF_PAYLOAD_HASH_MISSING")
  if (!input.certificate_subject) reasons.push("CERTIFICATE_SUBJECT_MISSING")
  if (!input.certificate_issuer) reasons.push("CERTIFICATE_ISSUER_MISSING")

  let expired = false

  if (input.certificate_valid_to) {
    const validTo = new Date(input.certificate_valid_to)
    expired = !Number.isNaN(validTo.getTime()) && validTo.getTime() < Date.now()

    if (expired) {
      reasons.push("CERTIFICATE_EXPIRED")
    }
  }

  const signatureValid =
    reasons.length === 0 &&
    verifyEventProof({
      proof_payload_hash: input.proof_payload_hash!,
      signature: input.signature!,
      signature_encoding:
        input.signature_encoding === "hex" ? "hex" : "base64"
    })

  if (!signatureValid && !reasons.includes("SIGNATURE_MISSING")) {
    reasons.push("INVALID_SIGNATURE")
  }

  return {
    name: "a1_signature",
    valid: signatureValid,
    weight: 40,
    reasons,
    details: {
      signature_algorithm: input.signature_algorithm,
      signature_encoding: input.signature_encoding || "base64",
      certificate_subject: input.certificate_subject,
      certificate_issuer: input.certificate_issuer,
      certificate_serial_number: input.certificate_serial_number,
      certificate_fingerprint: input.certificate_fingerprint,
      certificate_valid_to: input.certificate_valid_to,
      certificate_days_remaining: input.certificate_days_remaining,
      expired
    }
  }
}