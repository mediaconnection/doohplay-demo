import type { DecisionResult, VerificationLayer } from "./decisionEngine"

export function buildEnterpriseExplanation(
  decision: DecisionResult,
  layers: VerificationLayer[]
) {
  const criticalReasons = decision.reasons.filter((reason) =>
    [
      "INVALID_SIGNATURE",
      "CERT_REVOKED",
      "CHAIN_INVALID",
      "MERKLE_FAIL",
      "BLOCKCHAIN_FAIL"
    ].includes(reason)
  )

  return {
    summary: getSummary(decision),
    score: decision.score,
    trust_level: decision.trust_level,
    risk_level: decision.risk_level,

    audit: {
      layers: layers.map((layer) => ({
        name: "name" in layer ? layer.name : undefined,
        valid: layer.valid,
        weight: layer.weight,
        reasons: layer.reasons
      }))
    },

    key_factors: decision.reasons.slice(0, 5),
    critical_factors: criticalReasons,

    compliance: {
      icp_brasil: layers.some(
        (layer) => "name" in layer && layer.name === "icp" && layer.valid
      ),
      blockchain_anchor: layers.some(
        (layer) =>
          "name" in layer && layer.name === "blockchain" && layer.valid
      ),
      merkle_proof: layers.some(
        (layer) => "name" in layer && layer.name === "merkle" && layer.valid
      )
    }
  }
}

function getSummary(decision: DecisionResult): string {
  if (decision.status === "VERIFIED") {
    return "Evento validado com alta integridade criptográfica e rastreabilidade completa."
  }

  if (decision.status === "WARNING") {
    return "Evento válido com ressalvas. Nem todas as camadas foram confirmadas."
  }

  return "Falha crítica na verificação. Integridade não garantida."
}