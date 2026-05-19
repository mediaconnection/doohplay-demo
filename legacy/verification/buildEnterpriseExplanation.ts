export function buildEnterpriseExplanation(params: {
  status: "VERIFIED" | "WARNING" | "FAILED"
  risk: "LOW" | "MEDIUM" | "HIGH"
  confidence: {
    level: "HIGH" | "MEDIUM" | "LOW"
    score: number
    reasons: string[]
  }
  reasons: string[]
  event: any
  certificate: any
  anchor: any
  hashValid: boolean
  merkleValid: boolean
  certificateHashValid: boolean
  signatureValid: boolean
  chainValid: boolean
  revoked: boolean
}) {
  const {
    status,
    risk,
    confidence,
    reasons,
    event,
    certificate,
    anchor,
    hashValid,
    merkleValid,
    certificateHashValid,
    signatureValid,
    chainValid,
    revoked
  } = params

  return {
    executive_summary:
      status === "VERIFIED"
        ? "Os testes de integridade e autenticidade foram concluídos sem desvios materiais."
        : status === "WARNING"
        ? "Foram identificadas ressalvas que reduzem o nível de confiança do registro."
        : "Foram identificadas falhas críticas que comprometem a confiabilidade do registro.",

    audit_opinion:
      status === "VERIFIED"
        ? "Conclusão favorável."
        : status === "WARNING"
        ? "Conclusão com ressalvas."
        : "Conclusão desfavorável.",

    assurance_level: confidence.level,
    score: confidence.score,
    status,
    risk,

    key_findings: reasons,

    evidence_summary: {
      event_found: !!event,
      event_hash_valid: hashValid,
      merkle_valid: event?.merkle_root ? merkleValid : null,
      certificate_found: !!certificate,
      certificate_hash_valid: certificate ? certificateHashValid : null,
      signature_valid: certificate ? signatureValid : null,
      cert_chain_valid: certificate ? chainValid : null,
      revoked: certificate ? revoked : null,
      blockchain_anchored: anchor ? anchor.anchored : null
    }
  }
}