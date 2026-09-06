// @ts-nocheck
import type { GraphEdge, GraphNode, RiskLevel } from "./types"

export type FraudCluster = {
  id: string
  severity: "LOW" | "MEDIUM" | "HIGH"
  nodeIds: string[]
  edgeIds: string[]
  highRiskEdges: number
  mediumRiskEdges: number
  repeatedConnections: number
  avgWeight: number
  density: number
  recencyScore: number
}

function toSafeNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value
  }

  if (typeof value === "string") {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) {
      return parsed
    }
  }

  return fallback
}

function clamp(value: unknown, min = 0, max = 100): number {
  const safeValue = toSafeNumber(value, min)
  return Math.min(max, Math.max(min, safeValue))
}

function round2(value: unknown): number {
  return Number(toSafeNumber(value, 0).toFixed(2))
}

function normalizeId(value: unknown): string | null {
  if (typeof value !== "string") {
    return null
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function getEdgeNodeId(
  value: GraphEdge["source"] | GraphEdge["target"]
): string | null {
  if (typeof value === "string") {
    return normalizeId(value)
  }

  if (value && typeof value === "object" && "id" in value) {
    return normalizeId((value as { id?: unknown }).id)
  }

  return null
}

function normalizeRisk(risk: unknown): RiskLevel | undefined {
  if (risk === "HIGH" || risk === "MEDIUM" || risk === "LOW") {
    return risk
  }

  if (risk === "HIGH_RISK") return "HIGH"
  if (risk === "WATCH") return "MEDIUM"
  if (risk === "SAFE") return "LOW"

  return undefined
}

function edgeWeight(edge: GraphEdge): number {
  return clamp(edge.weight, 0, 100)
}

function normalizeRelation(value: unknown): string {
  if (typeof value !== "string") {
    return "related"
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : "related"
}

function buildEdgeId(edge: GraphEdge, index: number): string {
  const source = getEdgeNodeId(edge.source) ?? "unknown-source"
  const target = getEdgeNodeId(edge.target) ?? "unknown-target"
  const relation = normalizeRelation(edge.relation)

  return `${source}__${target}__${relation}__${index}`
}

function validNodeIds(nodes: GraphNode[]): Set<string> {
  const ids = new Set<string>()

  for (const node of nodes) {
    const id = normalizeId(node?.id)
    if (id) ids.add(id)
  }

  return ids
}

function buildUndirectedEdgeKey(edge: GraphEdge): string | null {
  const source = getEdgeNodeId(edge.source)
  const target = getEdgeNodeId(edge.target)

  if (!source || !target || source === target) {
    return null
  }

  const left = source < target ? source : target
  const right = source < target ? target : source
  const relation = normalizeRelation(edge.relation)
  const weight = edgeWeight(edge)

  return `${left}__${right}__${relation}__${weight}`
}

function safeEdges(edges: GraphEdge[], nodeIds: Set<string>): GraphEdge[] {
  if (!Array.isArray(edges)) return []

  const seen = new Set<string>()
  const result: GraphEdge[] = []

  for (const edge of edges) {
    if (!edge || typeof edge !== "object") continue

    const source = getEdgeNodeId(edge.source)
    const target = getEdgeNodeId(edge.target)

    if (!source || !target) continue
    if (source === target) continue
    if (!nodeIds.has(source) || !nodeIds.has(target)) continue

    const dedupeKey = buildUndirectedEdgeKey(edge)
    if (!dedupeKey || seen.has(dedupeKey)) continue

    seen.add(dedupeKey)

    result.push({
      ...edge,
      source,
      target,
      relation: normalizeRelation(edge.relation)
    })
  }

  return result
}

function buildAdjacency(edges: GraphEdge[]) {
  const adjacency = new Map<string, Set<string>>()

  for (const edge of edges) {
    const source = getEdgeNodeId(edge.source)
    const target = getEdgeNodeId(edge.target)

    if (!source || !target || source === target) continue

    if (!adjacency.has(source)) adjacency.set(source, new Set())
    if (!adjacency.has(target)) adjacency.set(target, new Set())

    adjacency.get(source)?.add(target)
    adjacency.get(target)?.add(source)
  }

  return adjacency
}

function findConnectedComponents(edges: GraphEdge[]): string[][] {
  const adjacency = buildAdjacency(edges)
  const visited = new Set<string>()
  const clusters: string[][] = []

  for (const nodeId of adjacency.keys()) {
    if (visited.has(nodeId)) continue

    const stack = [nodeId]
    const component: string[] = []

    while (stack.length > 0) {
      const current = stack.pop()
      if (!current || visited.has(current)) continue

      visited.add(current)
      component.push(current)

      for (const next of adjacency.get(current) ?? []) {
        if (!visited.has(next)) {
          stack.push(next)
        }
      }
    }

    if (component.length >= 2) {
      component.sort((a, b) => a.localeCompare(b))
      clusters.push(component)
    }
  }

  return clusters
}

function clusterSeverity(
  avgWeight: number,
  density: number,
  highRiskEdges: number,
  mediumRiskEdges: number,
  repeatedConnections: number
): "LOW" | "MEDIUM" | "HIGH" {
  if (
    highRiskEdges >= 2 ||
    (avgWeight >= 75 && density >= 0.6) ||
    repeatedConnections >= 2 ||
    (highRiskEdges >= 1 && mediumRiskEdges >= 2)
  ) {
    return "HIGH"
  }

  if (
    highRiskEdges >= 1 ||
    mediumRiskEdges >= 2 ||
    (avgWeight >= 50 && density >= 0.35) ||
    repeatedConnections >= 1
  ) {
    return "MEDIUM"
  }

  return "LOW"
}

export function detectFraudClusters(
  nodes: GraphNode[],
  edges: GraphEdge[]
): FraudCluster[] {
  const nodeIds = validNodeIds(Array.isArray(nodes) ? nodes : [])
  const normalizedEdges = safeEdges(edges, nodeIds)

  if (nodeIds.size === 0 || normalizedEdges.length === 0) {
    return []
  }

  const suspiciousEdges = normalizedEdges.filter((edge) => {
    const risk = normalizeRisk(edge.risk)
    const weight = edgeWeight(edge)

    return risk === "HIGH" || risk === "MEDIUM" || weight >= 45
  })

  if (suspiciousEdges.length === 0) {
    return []
  }

  const components = findConnectedComponents(suspiciousEdges)
  const clusters: FraudCluster[] = []

  components.forEach((component, clusterIndex) => {
    const componentSet = new Set(component)

    const clusterEdges = suspiciousEdges.filter((edge) => {
      const source = getEdgeNodeId(edge.source)
      const target = getEdgeNodeId(edge.target)

      return Boolean(
        source &&
          target &&
          componentSet.has(source) &&
          componentSet.has(target)
      )
    })

    if (clusterEdges.length === 0) {
      return
    }

    const edgeIds = clusterEdges.map((edge, edgeIndex) =>
      buildEdgeId(edge, edgeIndex)
    )

    let totalWeight = 0
    let highRiskEdges = 0
    let mediumRiskEdges = 0

    const pairCounts = new Map<string, number>()

    for (const edge of clusterEdges) {
      const source = getEdgeNodeId(edge.source)
      const target = getEdgeNodeId(edge.target)
      if (!source || !target) continue

      const weight = edgeWeight(edge)
      const risk = normalizeRisk(edge.risk)

      totalWeight += weight

      if (risk === "HIGH") {
        highRiskEdges += 1
      } else if (risk === "MEDIUM") {
        mediumRiskEdges += 1
      }

      const pairKey =
        source < target ? `${source}__${target}` : `${target}__${source}`

      pairCounts.set(pairKey, (pairCounts.get(pairKey) ?? 0) + 1)
    }

    let repeatedConnections = 0
    for (const count of pairCounts.values()) {
      if (count > 1) {
        repeatedConnections += count - 1
      }
    }

    const avgWeight =
      clusterEdges.length > 0 ? totalWeight / clusterEdges.length : 0

    const possibleEdges =
      component.length > 1
        ? (component.length * (component.length - 1)) / 2
        : 1

    const density =
      possibleEdges > 0 ? clusterEdges.length / possibleEdges : 0

    const recencyScore = clamp(avgWeight * 0.6 + density * 40, 0, 100)

    const severity = clusterSeverity(
      avgWeight,
      density,
      highRiskEdges,
      mediumRiskEdges,
      repeatedConnections
    )

    clusters.push({
      id: `cluster-${clusterIndex + 1}`,
      severity,
      nodeIds: component,
      edgeIds,
      highRiskEdges,
      mediumRiskEdges,
      repeatedConnections,
      avgWeight: round2(avgWeight),
      density: round2(density),
      recencyScore: round2(recencyScore)
    })
  })

  return clusters.sort((a, b) => {
    const rank = { HIGH: 3, MEDIUM: 2, LOW: 1 }
    const severityDiff = rank[b.severity] - rank[a.severity]

    if (severityDiff !== 0) return severityDiff
    if (b.avgWeight !== a.avgWeight) return b.avgWeight - a.avgWeight
    if (b.density !== a.density) return b.density - a.density
    if (b.highRiskEdges !== a.highRiskEdges) return b.highRiskEdges - a.highRiskEdges

    return a.id.localeCompare(b.id)
  })
}
