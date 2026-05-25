// @ts-nocheck
import { detectFraudClusters } from "./detectFraudClusters"
import { fraudLabel, fraudScoreBreakdown } from "./fraudScore"
import type { FraudScoreBreakdown, GraphEdge, GraphNode } from "./types"

export type NodeAnalysis = {
  id: string
  type?: GraphNode["type"]
  displayLabel?: string
  trust?: number
  score: number
  label: "SAFE" | "WATCH" | "HIGH_RISK"
  reasons: string[]
  metadata?: GraphNode["metadata"]
  breakdown: FraudScoreBreakdown
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
    highSeverityClusters: number
    mediumSeverityClusters: number
  }
}

function clampScore(value: unknown): number {
  const n = Number(value)
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(100, Math.round(n)))
}

function uniqueNonEmptyStrings(values: unknown): string[] {
  if (!Array.isArray(values)) return []

  const seen = new Set<string>()
  const result: string[] = []

  for (const value of values) {
    if (typeof value !== "string") continue
    const normalized = value.trim()
    if (!normalized || seen.has(normalized)) continue
    seen.add(normalized)
    result.push(normalized)
  }

  return result
}

function normalizeNodeId(value: unknown): string | null {
  if (typeof value !== "string") return null
  const normalized = value.trim()
  return normalized.length > 0 ? normalized : null
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

function toSafeNode(node: unknown): GraphNode | null {
  if (!node || typeof node !== "object") return null

  const candidate = node as GraphNode
  const id = normalizeNodeId(candidate.id)
  if (!id) return null

  return {
    ...candidate,
    id,
    label:
      typeof candidate.label === "string" && candidate.label.trim()
        ? candidate.label.trim()
        : undefined,
    trust:
      typeof candidate.trust === "number" && Number.isFinite(candidate.trust)
        ? clampScore(candidate.trust)
        : undefined,
    score:
      typeof candidate.score === "number" && Number.isFinite(candidate.score)
        ? clampScore(candidate.score)
        : undefined,
    metadata:
      candidate.metadata &&
      typeof candidate.metadata === "object" &&
      !Array.isArray(candidate.metadata)
        ? candidate.metadata
        : undefined
  }
}

function toSafeNodes(nodes: GraphNode[] | null | undefined): GraphNode[] {
  if (!Array.isArray(nodes)) return []

  const seen = new Set<string>()
  const result: GraphNode[] = []

  for (const node of nodes) {
    const safeNode = toSafeNode(node)
    if (!safeNode || seen.has(safeNode.id)) continue
    seen.add(safeNode.id)
    result.push(safeNode)
  }

  return result
}

function getEdgeEndpointId(value: unknown): string | null {
  if (typeof value === "string") return normalizeNodeId(value)

  if (value && typeof value === "object" && "id" in value) {
    return normalizeNodeId((value as { id?: unknown }).id)
  }

  return null
}

function normalizeEdgePairKey(
  source: string,
  target: string,
  relation?: string,
  weight?: unknown
): string {
  const [left, right] = source < target ? [source, target] : [target, source]
  return `${left}__${right}__${relation ?? ""}__${weight ?? ""}`
}

function toSafeEdges(
  edges: GraphEdge[] | null | undefined,
  validNodeIds: Set<string>
): GraphEdge[] {
  if (!Array.isArray(edges)) return []

  const seen = new Set<string>()
  const result: GraphEdge[] = []

  for (const edge of edges) {
    if (!edge || typeof edge !== "object") continue

    const source = getEdgeEndpointId(edge.source)
    const target = getEdgeEndpointId(edge.target)

    if (!source || !target) continue
    if (!validNodeIds.has(source) || !validNodeIds.has(target)) continue
    if (source === target) continue

    const relation =
      typeof edge.relation === "string" && edge.relation.trim()
        ? edge.relation.trim()
        : undefined

    const createdAt =
      typeof edge.createdAt === "string" && edge.createdAt.trim()
        ? edge.createdAt.trim()
        : undefined

    const dedupeKey = normalizeEdgePairKey(
      source,
      target,
      relation,
      edge.weight
    )

    if (seen.has(dedupeKey)) continue
    seen.add(dedupeKey)

    result.push({
      ...edge,
      source,
      target,
      relation,
      createdAt
    })
  }

  return result
}

function normalizeBreakdown(
  breakdown: FraudScoreBreakdown | null | undefined
): FraudScoreBreakdown {
  const safe = breakdown ?? emptyBreakdown()

  return {
    connectivity: clampScore(safe.connectivity),
    riskExposure: clampScore(safe.riskExposure),
    suspiciousWeight: clampScore(safe.suspiciousWeight),
    recurrence: clampScore(safe.recurrence),
    final: clampScore(safe.final),
    reasons: uniqueNonEmptyStrings(safe.reasons)
  }
}

function safeFraudBreakdown(
  node: GraphNode,
  edges: GraphEdge[]
): FraudScoreBreakdown {
  try {
    return normalizeBreakdown(fraudScoreBreakdown(node, edges))
  } catch {
    return emptyBreakdown()
  }
}

function safeFraudLabel(score: number): "SAFE" | "WATCH" | "HIGH_RISK" {
  try {
    const label = fraudLabel(score)
    return label === "SAFE" || label === "WATCH" || label === "HIGH_RISK"
      ? label
      : "SAFE"
  } catch {
    return "SAFE"
  }
}

function clusterSeverityCounts(
  clusters: ReturnType<typeof detectFraudClusters>
) {
  let suspiciousClusters = 0
  let highSeverityClusters = 0
  let mediumSeverityClusters = 0

  for (const cluster of clusters) {
    if (!cluster || typeof cluster !== "object") continue

    if (cluster.severity === "HIGH") {
      highSeverityClusters += 1
      suspiciousClusters += 1
    }

    if (cluster.severity === "MEDIUM") {
      mediumSeverityClusters += 1
      suspiciousClusters += 1
    }
  }

  return {
    suspiciousClusters,
    highSeverityClusters,
    mediumSeverityClusters
  }
}

function sortAnalyzedNodes(nodes: NodeAnalysis[]): NodeAnalysis[] {
  const riskRank = { HIGH_RISK: 3, WATCH: 2, SAFE: 1 }

  return [...nodes].sort((a, b) => {
    const riskDiff = riskRank[b.label] - riskRank[a.label]
    if (riskDiff !== 0) return riskDiff
    if (b.score !== a.score) return b.score - a.score
    return a.id.localeCompare(b.id)
  })
}

export function analyzeTrustNetwork(
  nodes: GraphNode[] = [],
  edges: GraphEdge[] = []
): TrustNetworkAnalysis {
  const safeNodes = toSafeNodes(nodes)
  const validNodeIds = new Set(safeNodes.map((node) => node.id))
  const safeEdges = toSafeEdges(edges, validNodeIds)

  let clusters: ReturnType<typeof detectFraudClusters> = []

  try {
    clusters = detectFraudClusters(safeNodes, safeEdges)
  } catch {
    clusters = []
  }

  const clusteredNodeIds = new Set<string>()

  for (const cluster of clusters) {
    if (!cluster || typeof cluster !== "object") continue
    if (!Array.isArray(cluster.nodeIds)) continue

    for (const nodeId of cluster.nodeIds) {
      const normalized = normalizeNodeId(nodeId)
      if (normalized) clusteredNodeIds.add(normalized)
    }
  }

  const analyzedNodes = safeNodes.map<NodeAnalysis>((node) => {
    const calculatedBreakdown = safeFraudBreakdown(node, safeEdges)
    let finalScore = clampScore(calculatedBreakdown.final)

    if (clusteredNodeIds.has(node.id)) {
      finalScore = clampScore(finalScore + 5)
    }

    const reasons = uniqueNonEmptyStrings([
      ...calculatedBreakdown.reasons,
      ...(clusteredNodeIds.has(node.id)
        ? ["Nó pertence a cluster suspeito"]
        : [])
    ])

    const finalBreakdown: FraudScoreBreakdown = {
      ...calculatedBreakdown,
      final: finalScore,
      reasons
    }

    return {
      id: node.id,
      type: node.type,
      displayLabel:
        typeof node.label === "string" && node.label.trim()
          ? node.label.trim()
          : node.id,
      trust: node.trust,
      score: finalScore,
      label: safeFraudLabel(finalScore),
      reasons,
      metadata: node.metadata,
      breakdown: finalBreakdown
    }
  })

  const sortedNodes = sortAnalyzedNodes(analyzedNodes)

  const highRiskNodes = sortedNodes.filter(
    (node) => node.label === "HIGH_RISK"
  ).length

  const watchNodes = sortedNodes.filter(
    (node) => node.label === "WATCH"
  ).length

  const {
    suspiciousClusters,
    highSeverityClusters,
    mediumSeverityClusters
  } = clusterSeverityCounts(clusters)

  return {
    nodes: sortedNodes,
    clusters,
    summary: {
      totalNodes: sortedNodes.length,
      totalEdges: safeEdges.length,
      highRiskNodes,
      watchNodes,
      suspiciousClusters,
      highSeverityClusters,
      mediumSeverityClusters
    }
  }
}
