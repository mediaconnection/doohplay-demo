export type TrustScoreStatus = "PASS" | "PARTIAL" | "FAIL" | "NOT_EVALUATED"

export type TrustScoreImpact = "positive" | "negative" | "neutral"

export type TrustScoreFactor = {
  code: string
  label: string
  impact: TrustScoreImpact
  value: boolean | null
  points: number
}

export type TrustScoreDomainKey =
  | "event_integrity"
  | "chain_of_custody"
  | "merkle_evidence"
  | "blockchain_anchor"
  | "certificate_assurance"
  | "timestamp_assurance"
  | "signature_assurance"

export type TrustScoreDomain = {
  key: TrustScoreDomainKey
  label: string
  weight: number
  score: number
  status: TrustScoreStatus
  factors: TrustScoreFactor[]
}

export type TrustScoreBreakdown = {
  final_score: number
  trust_level: "HIGH" | "MEDIUM" | "LOW"
  methodology: string
  domains: TrustScoreDomain[]
  strengths: string[]
  penalties: string[]
  summary: string
}

export type TrustScoreInput = {
  event_exists: boolean
  event_hash_valid: boolean

  chain_valid: boolean
  chain_head: boolean

  merkle_included: boolean
  merkle_proof_present: boolean

  block_exists: boolean
  anchored: boolean
  tx_hash_format_valid: boolean

  certificate_found: boolean
  certificate_valid: boolean | null
  cert_chain_valid: boolean | null
  revoked: boolean | null

  timestamp_token_present: boolean | null

  signature_present: boolean
  signature_valid: boolean | null
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)))
}

function scoreToTrustLevel(score: number): "HIGH" | "MEDIUM" | "LOW" {
  if (score >= 80) return "HIGH"
  if (score >= 50) return "MEDIUM"
  return "LOW"
}

function resolveDomainStatus(
  score: number,
  weight: number,
  hasEvaluableSignals = true
): TrustScoreStatus {
  if (weight <= 0 || !hasEvaluableSignals) return "NOT_EVALUATED"
  if (score <= 0) return "FAIL"
  if (score >= weight) return "PASS"
  return "PARTIAL"
}

function positiveLabel(code: string): string {
  const map: Record<string, string> = {
    EVENT_FOUND: "Evento localizado",
    EVENT_HASH_VALID: "Hash do evento consistente",
    CHAIN_VALID: "Encadeamento preservado",
    CHAIN_HEAD: "Evento identificado como ponta da cadeia",
    MERKLE_INCLUDED: "Evento incluído em lote Merkle",
    MERKLE_PROOF_PRESENT: "Prova Merkle disponível",
    BLOCK_FOUND: "Bloco associado localizado",
    BLOCKCHAIN_ANCHORED: "Ancoragem blockchain presente",
    TX_HASH_VALID: "TX hash com formato consistente",
    CERTIFICATE_FOUND: "Certificado localizado",
    CERTIFICATE_VALID: "Certificado válido",
    CERT_CHAIN_VALID: "Cadeia do certificado válida",
    TSA_TIMESTAMP_PRESENT: "Timestamp confiável presente",
    SIGNATURE_PRESENT: "Assinatura presente",
    SIGNATURE_VALID: "Assinatura validada",
  }

  return map[code] ?? code
}

function negativeLabel(code: string): string {
  const map: Record<string, string> = {
    EVENT_NOT_FOUND: "Evento não localizado",
    EVENT_HASH_MISMATCH: "Hash do evento divergente",
    CHAIN_INVALID: "Falha na cadeia histórica",
    MERKLE_ROOT_MISSING: "Merkle root ausente",
    MERKLE_PROOF_MISSING: "Prova Merkle ausente",
    BLOCK_NOT_FOUND: "Bloco não localizado",
    BLOCKCHAIN_NOT_ANCHORED: "Âncora blockchain ausente",
    TX_HASH_INVALID: "TX hash inconsistente",
    CERTIFICATE_NOT_FOUND: "Certificado não localizado",
    CERTIFICATE_INVALID: "Certificado inválido",
    CERT_CHAIN_INVALID: "Cadeia do certificado inválida",
    CERT_REVOKED: "Certificado revogado",
    TSA_TIMESTAMP_MISSING: "Timestamp confiável ausente",
    SIGNATURE_MISSING: "Assinatura ausente",
    SIGNATURE_INVALID: "Assinatura inválida",
  }

  return map[code] ?? code
}

function makeFactor(
  code: string,
  label: string,
  impact: TrustScoreImpact,
  value: boolean | null,
  points: number
): TrustScoreFactor {
  return {
    code,
    label,
    impact,
    value,
    points,
  }
}

function scoreDomain(
  domain: Omit<TrustScoreDomain, "score" | "status">,
  hasEvaluableSignals = true
): TrustScoreDomain {
  const total = domain.factors.reduce((sum, factor) => sum + factor.points, 0)
  const score = hasEvaluableSignals
    ? Math.max(0, Math.min(domain.weight, total))
    : 0

  return {
    ...domain,
    score,
    status: resolveDomainStatus(score, domain.weight, hasEvaluableSignals),
  }
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values))
}

function hasCriticalPenalty(penalties: string[]): boolean {
  const critical = new Set([
    negativeLabel("EVENT_HASH_MISMATCH"),
    negativeLabel("CHAIN_INVALID"),
    negativeLabel("CERT_REVOKED"),
    negativeLabel("SIGNATURE_INVALID"),
  ])

  return penalties.some((item) => critical.has(item))
}

export function buildTrustScoreBreakdown(
  input: TrustScoreInput
): TrustScoreBreakdown {
  const certificateDomainActive =
    input.certificate_found ||
    input.certificate_valid !== null ||
    input.cert_chain_valid !== null ||
    input.revoked !== null

  const timestampDomainActive = input.timestamp_token_present !== null

  const signatureDomainActive =
    input.signature_present || input.signature_valid !== null

  const domains: TrustScoreDomain[] = [
    scoreDomain({
      key: "event_integrity",
      label: "Event Integrity",
      weight: 25,
      factors: [
        makeFactor(
          "EVENT_FOUND",
          positiveLabel("EVENT_FOUND"),
          "positive",
          input.event_exists,
          input.event_exists ? 10 : 0
        ),
        makeFactor(
          "EVENT_HASH_VALID",
          positiveLabel("EVENT_HASH_VALID"),
          "positive",
          input.event_hash_valid,
          input.event_hash_valid ? 15 : 0
        ),
      ],
    }),

    scoreDomain({
      key: "chain_of_custody",
      label: "Chain of Custody",
      weight: 10,
      factors: [
        makeFactor(
          "CHAIN_VALID",
          positiveLabel("CHAIN_VALID"),
          "positive",
          input.chain_valid,
          input.chain_valid ? 10 : 0
        ),
        makeFactor(
          "CHAIN_HEAD",
          positiveLabel("CHAIN_HEAD"),
          "neutral",
          input.chain_head,
          0
        ),
      ],
    }),

    scoreDomain({
      key: "merkle_evidence",
      label: "Merkle Evidence",
      weight: 20,
      factors: [
        makeFactor(
          "MERKLE_INCLUDED",
          positiveLabel("MERKLE_INCLUDED"),
          "positive",
          input.merkle_included,
          input.merkle_included ? 10 : 0
        ),
        makeFactor(
          "MERKLE_PROOF_PRESENT",
          positiveLabel("MERKLE_PROOF_PRESENT"),
          "positive",
          input.merkle_proof_present,
          input.merkle_proof_present ? 10 : 0
        ),
      ],
    }),

    scoreDomain({
      key: "blockchain_anchor",
      label: "Blockchain Anchor",
      weight: 15,
      factors: [
        makeFactor(
          "BLOCK_FOUND",
          positiveLabel("BLOCK_FOUND"),
          "positive",
          input.block_exists,
          input.block_exists ? 5 : 0
        ),
        makeFactor(
          "BLOCKCHAIN_ANCHORED",
          positiveLabel("BLOCKCHAIN_ANCHORED"),
          "positive",
          input.anchored,
          input.anchored ? 7 : 0
        ),
        makeFactor(
          "TX_HASH_VALID",
          positiveLabel("TX_HASH_VALID"),
          "positive",
          input.tx_hash_format_valid,
          input.block_exists && input.anchored && input.tx_hash_format_valid ? 3 : 0
        ),
      ],
    }),

    scoreDomain(
      {
        key: "certificate_assurance",
        label: "Certificate Assurance",
        weight: 15,
        factors: [
          makeFactor(
            "CERTIFICATE_FOUND",
            positiveLabel("CERTIFICATE_FOUND"),
            "positive",
            input.certificate_found,
            input.certificate_found ? 5 : 0
          ),
          makeFactor(
            "CERTIFICATE_VALID",
            positiveLabel("CERTIFICATE_VALID"),
            "positive",
            input.certificate_valid,
            input.certificate_valid === true ? 7 : 0
          ),
          makeFactor(
            "CERT_CHAIN_VALID",
            positiveLabel("CERT_CHAIN_VALID"),
            "positive",
            input.cert_chain_valid,
            input.cert_chain_valid === true ? 3 : 0
          ),
          makeFactor(
            "CERT_REVOKED",
            negativeLabel("CERT_REVOKED"),
            "negative",
            input.revoked,
            input.revoked === true ? -15 : 0
          ),
        ],
      },
      certificateDomainActive
    ),

    scoreDomain(
      {
        key: "timestamp_assurance",
        label: "Timestamp Assurance",
        weight: 5,
        factors: [
          makeFactor(
            "TSA_TIMESTAMP_PRESENT",
            positiveLabel("TSA_TIMESTAMP_PRESENT"),
            "positive",
            input.timestamp_token_present,
            input.timestamp_token_present === true ? 5 : 0
          ),
        ],
      },
      timestampDomainActive
    ),

    scoreDomain(
      {
        key: "signature_assurance",
        label: "Signature Assurance",
        weight: 10,
        factors: [
          makeFactor(
            "SIGNATURE_PRESENT",
            positiveLabel("SIGNATURE_PRESENT"),
            "positive",
            input.signature_present,
            input.signature_present ? 4 : 0
          ),
          makeFactor(
            "SIGNATURE_VALID",
            positiveLabel("SIGNATURE_VALID"),
            "positive",
            input.signature_valid,
            input.signature_valid === true ? 6 : 0
          ),
        ],
      },
      signatureDomainActive
    ),
  ]

  const activeDomains = domains.filter(
    (domain) => domain.status !== "NOT_EVALUATED" && domain.weight > 0
  )

  const activeWeight = activeDomains.reduce((sum, domain) => sum + domain.weight, 0)
  const rawScore = activeDomains.reduce((sum, domain) => sum + domain.score, 0)

  const final_score =
    activeWeight > 0 ? clampScore((rawScore / activeWeight) * 100) : 0

  const strengths: string[] = []
  const penalties: string[] = []

  for (const domain of domains) {
    for (const factor of domain.factors) {
      if (factor.impact === "positive" && factor.value === true) {
        strengths.push(factor.label)
      }

      if (factor.impact === "negative" && factor.value === true) {
        penalties.push(factor.label)
      }
    }
  }

  if (!input.event_exists) {
    penalties.push(negativeLabel("EVENT_NOT_FOUND"))
  }

  if (input.event_exists && !input.event_hash_valid) {
    penalties.push(negativeLabel("EVENT_HASH_MISMATCH"))
  }

  if (input.event_exists && !input.chain_valid) {
    penalties.push(negativeLabel("CHAIN_INVALID"))
  }

  if (input.event_exists && !input.merkle_included) {
    penalties.push(negativeLabel("MERKLE_ROOT_MISSING"))
  }

  if (input.merkle_included && !input.merkle_proof_present) {
    penalties.push(negativeLabel("MERKLE_PROOF_MISSING"))
  }

  if (input.event_exists && !input.block_exists) {
    penalties.push(negativeLabel("BLOCK_NOT_FOUND"))
  }

  if (input.block_exists && !input.anchored) {
    penalties.push(negativeLabel("BLOCKCHAIN_NOT_ANCHORED"))
  }

  if (input.anchored && !input.tx_hash_format_valid) {
    penalties.push(negativeLabel("TX_HASH_INVALID"))
  }

  if (certificateDomainActive && !input.certificate_found) {
    penalties.push(negativeLabel("CERTIFICATE_NOT_FOUND"))
  }

  if (input.certificate_found && input.certificate_valid === false) {
    penalties.push(negativeLabel("CERTIFICATE_INVALID"))
  }

  if (input.certificate_found && input.cert_chain_valid === false) {
    penalties.push(negativeLabel("CERT_CHAIN_INVALID"))
  }

  if (input.revoked === true) {
    penalties.push(negativeLabel("CERT_REVOKED"))
  }

  if (timestampDomainActive && input.timestamp_token_present === false) {
    penalties.push(negativeLabel("TSA_TIMESTAMP_MISSING"))
  }

  if (!input.signature_present) {
    penalties.push(negativeLabel("SIGNATURE_MISSING"))
  }

  if (input.signature_valid === false) {
    penalties.push(negativeLabel("SIGNATURE_INVALID"))
  }

  const normalizedStrengths = unique(strengths).slice(0, 10)
  const normalizedPenalties = unique(penalties).slice(0, 10)
  const trust_level = scoreToTrustLevel(final_score)

  const summary = hasCriticalPenalty(normalizedPenalties)
    ? "A evidência contém inconsistências críticas e não deve ser tratada como confiável sem revisão técnica e validação complementar."
    : trust_level === "HIGH"
      ? "A evidência apresenta alta confiabilidade, com integridade estrutural e provas criptográficas suficientes para uso auditável."
      : trust_level === "MEDIUM"
        ? "A evidência apresenta confiabilidade moderada, com integridade principal preservada, porém com lacunas complementares de prova ou ancoragem."
        : "A evidência apresenta baixa confiabilidade e requer revisão técnica antes de uso auditável."

  return {
    final_score,
    trust_level,
    methodology: "verify-enterprise-v3",
    domains,
    strengths: normalizedStrengths,
    penalties: normalizedPenalties,
    summary,
  }
}