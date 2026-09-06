// @ts-nocheck
export type GraphNode = {
  id: string
  type?: string
  label?: string
  score?: number
  risk?: string
  metadata?: Record<string, unknown>
}

export type GraphEdge = {
  id?: string
  source: string
  target: string
  relation?: string
  weight?: number
  risk?: string
  createdAt?: string
  metadata?: Record<string, unknown>
}

export type FraudBreakdown = {
  connectionCount: number
  highRiskEdges: number
  mediumRiskEdges: number
  suspiciousDensity: number
  final: number
}

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value))
}

export function fraudScoreBreakdown(
  node: GraphNode,
  edges: GraphEdge[]
): FraudBreakdown {
  const related = edges.filter(
    (edge) => edge.source === node.id || edge.target === node.id
  )

  const highRiskEdges = related.filter((edge) => edge.risk === "HIGH").length
  const mediumRiskEdges = related.filter((edge) => edge.risk === "MEDIUM").length
  const connectionCount = related.length

  const suspiciousDensity =
    connectionCount === 0
      ? 0
      : ((highRiskEdges + mediumRiskEdges * 0.5) / connectionCount) * 100

  let score = 0
  score += Math.min(connectionCount * 4, 30)
  score += highRiskEdges * 20
  score += mediumRiskEdges * 10
  score += suspiciousDensity * 0.4

  return {
    connectionCount,
    highRiskEdges,
    mediumRiskEdges,
    suspiciousDensity: Math.round(suspiciousDensity * 100) / 100,
    final: clamp(Math.round(score))
  }
}

export function fraudLabel(score: number): "SAFE" | "WATCH" | "HIGH_RISK" {
  if (score >= 70) return "HIGH_RISK"
  if (score >= 40) return "WATCH"
  return "SAFE"
}
