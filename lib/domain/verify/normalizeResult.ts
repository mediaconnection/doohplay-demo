import type { VerificationResult } from "@/app/verify/[hash]/components/types"

export function normalizeResult(input: VerificationResult): VerificationResult {
  const details = input.details ?? {}

  return {
    ...input,

    status: input.status ?? "FAILED",
    trust_level: input.trust_level ?? "LOW",
    risk_level: input.risk_level ?? "HIGH",

    score:
      typeof input.score === "number"
        ? input.score
        : typeof input.metadata?.score === "number"
        ? input.metadata.score
        : 0,

    confidence:
      typeof input.confidence === "number"
        ? input.confidence
        : typeof input.metadata?.confidence === "number"
        ? input.metadata.confidence
        : 0,

    details: {
      event_exists: !!details.event_exists,
      hash_valid: !!details.hash_valid,
      signature_valid: details.signature_valid ?? null,
      certificate_valid: details.certificate_valid ?? null,
      certificate_found: details.certificate_found ?? false,
      certificate_revoked: details.certificate_revoked ?? false,
      merkle_valid: details.merkle_valid ?? null,
      anchored: details.anchored ?? false,
      blockchain_valid: details.blockchain_valid ?? null,
      chain_valid: details.chain_valid ?? false,
      timestamp_valid: details.timestamp_valid ?? null,
      certificate_hash_valid: details.certificate_hash_valid ?? null,
      integrity: details.integrity ?? false
    },

    layers: Array.isArray(input.layers) ? input.layers : [],

    explanation: {
      ...input.explanation,
      key_factors: input.explanation?.key_factors ?? [],
      risk_factors: input.explanation?.risk_factors ?? [],
      audit_flags: input.explanation?.audit_flags ?? []
    }
  }
}