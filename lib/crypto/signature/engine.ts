import { randomUUID } from "crypto"
import { signCanonicalPayload } from "./signer"
import { requestTimestampForSignature } from "./tsa"
import type {
  SignatureEvidencePackage,
  SignatureInput
} from "./types"

export async function signWithTimestamp(
  input: SignatureInput
): Promise<SignatureEvidencePackage> {
  const request_id = randomUUID()

  const signed = signCanonicalPayload(input)

  let warnings: string[] = []
  let timestamp = null

  if (input.include_timestamp !== false) {
    try {
      timestamp = await requestTimestampForSignature(
        signed.signature_base64
      )
    } catch (error) {
      warnings.push(
        error instanceof Error ? error.message : "TSA_REQUEST_FAILED"
      )
    }
  }

  return {
    status: timestamp ? "TIMESTAMPED" : "SIGNED",
    entity_id: input.entity_id,
    entity_type: input.entity_type,
    digest_hex: signed.digest_hex,
    canonical: signed.canonical,
    signature: {
      algorithm: signed.algorithm,
      signature_base64: signed.signature_base64,
      digest_hex: signed.digest_hex,
      signed_at: signed.signed_at,
      certificate_pem: signed.certificate_pem,
      certificate_chain_pem: signed.certificate_chain_pem,
      public_key_pem: signed.public_key_pem ?? null
    },
    timestamp,
    created_at: new Date().toISOString(),
    request_id,
    warnings
  }
}