import { detectFraudClusters } from "./detectFraudClusters"
import { fraudLabel, fraudScoreBreakdown } from "./fraudScore"

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

export type NodeAnalysis = {
  id: string
  score: number
  label: "SAFE" | "WATCH" | "HIGH_RISK"
  reasons: string[]
  breakdown: ReturnType<typeof fraudScoreBreakdown>
}

export type TrustNetworkAnalysis = {
  nodes: NodeAnalysis[]
  clusters: ReturnType<typeof detectFraudClusters>
  summary: {
    totalNodes: number
    totalEdges: number
    highRiskNodes: number
    watchNodes: number
    suspiciousClusters: number
  }
}

export function analyzeTrustNetwork(
  nodes: GraphNode[],
  edges: GraphEdge[]
): TrustNetworkAnalysis {
  const safeNodes = Array.isArray(nodes) ? nodes : []
  const safeEdges = Array.isArray(edges) ? edges : []

  const analyzedNodes: NodeAnalysis[] = safeNodes.map((node) => {
    const breakdown = fraudScoreBreakdown(node, safeEdges)
    const label = fraudLabel(breakdown.final)

    const reasons: string[] = []

    if (breakdown.connectionCount >= 8) reasons.push("HIGH_CONNECTION_VOLUME")
    if (breakdown.highRiskEdges >= 2) reasons.push("MULTIPLE_HIGH_RISK_EDGES")
    if (breakdown.mediumRiskEdges >= 3) reasons.push("REPEATED_MEDIUM_RISK_PATTERNS")
    if (breakdown.suspiciousDensity >= 50) reasons.push("HIGH_SUSPICIOUS_DENSITY")

    return {
      id: node.id,
      score: breakdown.final,
      label,
      reasons,
      breakdown
    }
  })

  const clusters = detectFraudClusters(safeNodes, safeEdges)

  return {
    nodes: analyzedNodes,
    clusters,
    summary: {
      totalNodes: safeNodes.length,
      totalEdges: safeEdges.length,
      highRiskNodes: analyzedNodes.filter((node) => node.label === "HIGH_RISK").length,
      watchNodes: analyzedNodes.filter((node) => node.label === "WATCH").length,
      suspiciousClusters: clusters.filter(
        (cluster) => cluster.risk === "HIGH_RISK" || cluster.risk === "WATCH"
      ).length
    }
  }
}