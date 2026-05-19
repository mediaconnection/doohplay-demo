import type {
  ExplanationInput,
  ExplanationOutput,
  FailureReason,
  LayerName,
  LayerResult
} from "./types"
import { getTrustLevel } from "./score"

/* =========================
   CONFIG
========================= */

const CRITICAL_REASONS = new Set<FailureReason>([
  "CERT_REVOKED",
  "INVALID_SIGNATURE",
  "HASH_MISMATCH",
  "INVALID_INPUT",
  "PROOF_NOT_FOUND"
])

const RISK_REASONS = new Set<FailureReason>([
  "CERT_REVOKED",
  "CERT_EXPIRED",
  "INVALID_SIGNATURE",
  "CHAIN_INVALID",
  "MERKLE_FAIL",
  "BLOCKCHAIN_FAIL",
  "HASH_MISMATCH",
  "PROOF_NOT_FOUND",
  "INVALID_INPUT",
  "INVALID_MERKLE_ROOT",
  "INVALID_MERKLE_PROOF",
  "INVALID_BLOCKCHAIN_TX",
  "RPC_UNAVAILABLE",
  "LAYER_TIMEOUT"
])

/* =========================
   HELPERS
========================= */

function normalizeReasons(reasons: FailureReason[]): FailureReason[] {
  return [...new Set(reasons.filter(Boolean))]
}

function findLayer(
  layers: LayerResult[],
  name: LayerName
): LayerResult | undefined {
  return layers.find((layer) => layer.name === name)
}

function hasLayer(layers: LayerResult[], name: LayerName): boolean {
  return layers.some((l) => l.name === name)
}

function getLayerValid(layers: LayerResult[], name: LayerName): boolean {
  return findLayer(layers, name)?.valid === true
}

function getBooleanMeta(layer: LayerResult | undefined, key: string) {
  const v = layer?.meta?.[key]
  return typeof v === "boolean" ? v : undefined
}

function getArrayMeta(layer: LayerResult | undefined, key: string) {
  const v = layer?.meta?.[key]
  return Array.isArray(v) ? v : []
}

/* =========================
   CROSS-LAYER
========================= */

function hasCrossLayerIssue(layers: LayerResult[], code: string): boolean {
  const blockchain = findLayer(layers, "blockchain")
  const issues = getArrayMeta(blockchain, "cross_layer_issues")

  return issues.some((i: any) => i?.code === code)
}

/* =========================
   SUMMARY
========================= */

function buildSummary(
  status: ExplanationInput["status"],
  reasons: FailureReason[]
): string {
  if (status === "VERIFIED") {
    return "Prova validada com consistência entre assinatura, estrutura Merkle e ancoragem blockchain."
  }

  if (status === "WARNING") {
    return "Prova parcialmente válida com inconsistências técnicas que reduzem a confiança auditável."
  }

  if (reasons.includes("INVALID_INPUT")) {
    return "Falha por entrada inválida. A requisição não atende aos critérios mínimos."
  }

  if (reasons.includes("HASH_MISMATCH")) {
    return "Falha crítica: divergência entre hash informado e certificado."
  }

  if (reasons.includes("PROOF_NOT_FOUND")) {
    return "Falha: não existe prova certificada para o ativo."
  }

  return "Falha na validação criptográfica da prova."
}

/* =========================
   RECOMMENDATION
========================= */

function buildRecommendation(
  status: ExplanationInput["status"],
  reasons: FailureReason[],
  layers: LayerResult[]
): string | undefined {
  if (hasCrossLayerIssue(layers, "MERKLE_ROOT_MISMATCH")) {
    return "Revalidar consistência entre Merkle root calculada e ancorada."
  }

  if (hasCrossLayerIssue(layers, "HASH_IDENTITY_MISMATCH")) {
    return "Verificar identidade do ativo e integridade do hash certificado."
  }

  if (reasons.includes("INVALID_SIGNATURE")) {
    return "Revalidar assinatura digital e chave pública."
  }

  if (reasons.includes("CERT_REVOKED")) {
    return "Substituir certificado revogado imediatamente."
  }

  if (reasons.includes("MERKLE_FAIL")) {
    return "Reconstruir prova Merkle e validar árvore."
  }

  if (reasons.includes("BLOCKCHAIN_FAIL")) {
    return "Validar transação on-chain e confirmações."
  }

  if (status === "FAILED") {
    return "Bloquear confiança operacional até revalidação completa."
  }

  return undefined
}

/* =========================
   FLAGS
========================= */

function buildAuditFlags(
  reasons: FailureReason[],
  layers: LayerResult[]
): FailureReason[] {
  const flags = new Set<FailureReason>()

  for (const r of reasons) {
    if (CRITICAL_REASONS.has(r) || RISK_REASONS.has(r)) {
      flags.add(r)
    }
  }

  if (hasLayer(layers, "icp") && !getLayerValid(layers, "icp")) {
    flags.add("ICP_FAIL")
  }

  if (hasLayer(layers, "merkle") && !getLayerValid(layers, "merkle")) {
    flags.add("MERKLE_FAIL")
  }

  if (hasLayer(layers, "blockchain") && !getLayerValid(layers, "blockchain")) {
    flags.add("BLOCKCHAIN_FAIL")
  }

  return [...flags]
}

/* =========================
   PUBLIC API
========================= */

export function buildExplanation(
  params: ExplanationInput
): ExplanationOutput {
  const reasons = normalizeReasons(params.reasons)
  const trust_level = getTrustLevel(params.score)

  const icp = findLayer(params.layers, "icp")
  const merkle = findLayer(params.layers, "merkle")
  const blockchain = findLayer(params.layers, "blockchain")

  const summary = buildSummary(params.status, reasons)

  const audit_flags = buildAuditFlags(reasons, params.layers)

  const key_factors = [
    ...reasons.filter((r) => CRITICAL_REASONS.has(r)),
    ...reasons
  ].slice(0, 5)

  const risk_factors = reasons.filter((r) => RISK_REASONS.has(r))

  const technical_details = {
    icp: icp?.valid === true,
    merkle: merkle?.valid === true,
    blockchain: blockchain?.valid === true,

    signature_valid:
      getBooleanMeta(icp, "signature_valid") ??
      getBooleanMeta(icp, "signature_present") ??
      icp?.valid === true,

    certificate_present:
      getBooleanMeta(icp, "certificate_present") ??
      hasLayer(params.layers, "icp"),

    chain_valid:
      getBooleanMeta(icp, "chain_valid") ??
      !reasons.includes("CHAIN_INVALID"),

    revoked:
      getBooleanMeta(icp, "revoked") ??
      reasons.includes("CERT_REVOKED"),

    anchored:
      getBooleanMeta(blockchain, "anchored") ??
      blockchain?.valid === true,

    merkle_root_valid:
      getBooleanMeta(merkle, "merkle_root_valid") ??
      merkle?.valid === true,

    merkle_proof_valid:
      getBooleanMeta(merkle, "merkle_proof_valid") ??
      merkle?.valid === true
  }

  return {
    summary,
    status: params.status,
    score: params.score,
    trust_level,
    key_factors,
    risk_factors,
    technical_details,
    audit_flags,
    recommendation: buildRecommendation(params.status, reasons, params.layers),

    audit: {
      layers: params.layers.map((l) => ({
        name: l.name,
        valid: l.valid,
        weight: l.weight,
        reasons: l.reasons ?? []
      }))
    },

    compliance: {
      icp_brasil: icp?.valid === true,
      blockchain_anchor: blockchain?.valid === true,
      merkle_proof: merkle?.valid === true,
      signature_valid: technical_details.signature_valid,
      certificate_valid:
        technical_details.certificate_present &&
        technical_details.revoked !== true
    }
  }
}