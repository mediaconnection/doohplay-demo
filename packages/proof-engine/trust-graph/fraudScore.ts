// @ts-nocheck
import type {
  FraudScoreBreakdown,
  GraphEdge,
  GraphNode,
  RiskLevel
} from "./types"

function toSafeNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value

  if (typeof value === "string") {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }

  return fallback
}

function normalizeId(value: unknown): string | null {
  if (typeof value !== "string") return null

  const normalized = value.trim()
  return normalized.length > 0 ? normalized : null
}

function clamp(value: unknown, min = 0, max = 100): number {
  const v = toSafeNumber(value, min)
  return Math.min(max, Math.max(min, v))
}

function round2(value: unknown): number {
  return Number(toSafeNumber(value, 0).toFixed(2))
}

function safeWeight(value: unknown): number {
  return clamp(value, 0, 100)
}

function normalizeRisk(risk: unknown): RiskLevel | undefined {
  if (risk === "HIGH" || risk === "MEDIUM" || risk === "LOW") return risk
  if (risk === "HIGH_RISK") return "HIGH"
  if (risk === "WATCH") return "MEDIUM"
  if (risk === "SAFE") return "LOW"
  return undefined
}

function riskMultiplier(risk: RiskLevel | undefined): number {
  switch (risk) {
    case "HIGH":
      return 1
    case "MEDIUM":
      return 0.6
    case "LOW":
      return 0.2
    default:
      return 0
  }
}

function uniqueNonEmptyStrings(values: unknown[]): string[] {
  const set = new Set<string>()

  for (const value of values) {
    if (typeof value !== "string") continue

    const normalized = value.trim()
    if (normalized) set.add(normalized)
  }

  return [...set]
}

function getEdgeNodeId(
  value: GraphEdge["source"] | GraphEdge["target"]
): string | null {
  if (typeof value === "string") return normalizeId(value)

  if (value && typeof value === "object" && "id" in value) {
    return normalizeId((value as { id?: unknown }).id)
  }

  return null
}

function getNodeTrust(node: GraphNode): number | null {
  const trust = node?.trust
  if (typeof trust !== "number" || !Number.isFinite(trust)) return null
  return clamp(trust)
}

function buildEdgeDedupKey(edge: GraphEdge): string | null {
  const source = getEdgeNodeId(edge.source)
  const target = getEdgeNodeId(edge.target)

  if (!source || !target || source === target) {
    return null
  }

  const left = source < target ? source : target
  const right = source < target ? target : source
  const relation =
    typeof edge.relation === "string" && edge.relation.trim()
      ? edge.relation.trim()
      : "related"
  const weight = safeWeight(edge.weight)
  const risk = normalizeRisk(edge.risk) ?? "LOW"

  return `${left}__${right}__${relation}__${weight}__${risk}`
}

function emptyBreakdown(): FraudScoreBreakdown {
  return {
    connectivity: 0,
    riskExposure: 0,
    suspiciousWeight: 0,
    recurrence: 0,
    final: 0,
    reasons: []
  }
}

export function fraudScoreBreakdown(
  node: GraphNode,
  edges: GraphEdge[]
): FraudScoreBreakdown {
  const nodeId = normalizeId(node?.id)
  if (!nodeId) return emptyBreakdown()

  const safeEdges = Array.isArray(edges) ? edges : []
  const seen = new Set<string>()

  const related = safeEdges.filter((edge) => {
    if (!edge || typeof edge !== "object") return false

    const source = getEdgeNodeId(edge.source)
    const target = getEdgeNodeId(edge.target)

    if (!source || !target) return false
    if (source === target) return false
    if (source !== nodeId && target !== nodeId) return false

    const dedupeKey = buildEdgeDedupKey(edge)
    if (!dedupeKey || seen.has(dedupeKey)) return false

    seen.add(dedupeKey)
    return true
  })

  let totalWeight = 0
  let riskPoints = 0
  let high = 0
  let medium = 0
  let low = 0

  for (const edge of related) {
    const weight = safeWeight(edge.weight)
    const risk = normalizeRisk(edge.risk)

    totalWeight += weight
    riskPoints += weight * riskMultiplier(risk)

    if (risk === "HIGH") high += 1
    else if (risk === "MEDIUM") medium += 1
    else if (risk === "LOW") low += 1
  }

  const totalConnections = related.length
  const avgWeight = totalConnections > 0 ? totalWeight / totalConnections : 0
  const avgRiskPoints = totalConnections > 0 ? riskPoints / totalConnections : 0

  const connectivity = clamp(totalConnections * 6)
  const riskExposure = clamp(avgRiskPoints)
  const suspiciousWeight = clamp(avgWeight)
  const recurrence = clamp(high * 15 + medium * 6 + low * 2)

  let final =
    connectivity * 0.18 +
    riskExposure * 0.32 +
    suspiciousWeight * 0.2 +
    recurrence * 0.3

  if (high >= 2) {
    final += 12
  } else if (high === 1) {
    final += 6
  }

  const trust = getNodeTrust(node)

  if (trust !== null) {
    final += (100 - trust) * 0.18
  }

  if (totalConnections === 0 && trust !== null) {
    final = clamp((100 - trust) * 0.12)
  }

  final = clamp(final)

  const reasons: string[] = []

  if (totalConnections >= 8) {
    reasons.push("Alta conectividade com múltiplas entidades")
  } else if (totalConnections >= 4) {
    reasons.push("Conectividade acima do padrão esperado")
  }

  if (high > 0) {
    reasons.push(`${high} ligação(ões) de alto risco`)
  }

  if (medium >= 3) {
    reasons.push("Recorrência de vínculos de risco médio")
  } else if (medium >= 1 && high === 0) {
    reasons.push("Presença de conexões com risco moderado")
  }

  if (avgWeight >= 70) {
    reasons.push("Peso médio elevado nas conexões")
  } else if (avgWeight >= 45) {
    reasons.push("Peso médio relevante nas conexões")
  }

  if (riskExposure >= 70) {
    reasons.push("Exposição elevada a conexões suspeitas")
  } else if (riskExposure >= 45) {
    reasons.push("Exposição moderada a conexões de risco")
  }

  if (riskExposure >= 65 && totalConnections <= 2) {
    reasons.push("Poucas conexões, mas com alta criticidade")
  }

  if (trust !== null && trust < 50) {
    reasons.push("Trust score histórico reduzido")
  } else if (trust !== null && trust < 70) {
    reasons.push("Trust score histórico em atenção")
  }

  if (totalConnections === 0 && trust === null) {
    reasons.push("Sem contexto relacional suficiente para análise")
  } else if (totalConnections === 0 && trust !== null && trust >= 70) {
    reasons.push("Sem sinais relevantes de risco relacional")
  }

  return {
    connectivity: round2(connectivity),
    riskExposure: round2(riskExposure),
    suspiciousWeight: round2(suspiciousWeight),
    recurrence: round2(recurrence),
    final: round2(final),
    reasons: uniqueNonEmptyStrings(reasons)
  }
}

export function fraudScore(node: GraphNode, edges: GraphEdge[]): number {
  return fraudScoreBreakdown(node, edges).final
}

export function fraudLabel(score: number): "SAFE" | "WATCH" | "HIGH_RISK" {
  const safeScore = clamp(score)

  if (safeScore >= 70) return "HIGH_RISK"
  if (safeScore >= 40) return "WATCH"
  return "SAFE"
}
