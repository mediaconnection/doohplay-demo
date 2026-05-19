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

export type FraudCluster = {
  nodeIds: string[]
  edgeCount: number
  risk: "SAFE" | "WATCH" | "HIGH_RISK"
}

export function detectFraudClusters(
  nodes: GraphNode[],
  edges: GraphEdge[]
): FraudCluster[] {
  const suspiciousEdges = edges.filter(
    (edge) => edge.risk === "HIGH" || edge.risk === "MEDIUM"
  )

  const adjacency = new Map<string, Set<string>>()

  for (const edge of suspiciousEdges) {
    if (!adjacency.has(edge.source)) adjacency.set(edge.source, new Set())
    if (!adjacency.has(edge.target)) adjacency.set(edge.target, new Set())

    adjacency.get(edge.source)?.add(edge.target)
    adjacency.get(edge.target)?.add(edge.source)
  }

  const visited = new Set<string>()
  const validNodeIds = new Set(nodes.map((node) => node.id))
  const clusters: FraudCluster[] = []

  for (const nodeId of adjacency.keys()) {
    if (visited.has(nodeId) || !validNodeIds.has(nodeId)) continue

    const stack = [nodeId]
    const component: string[] = []

    while (stack.length) {
      const current = stack.pop()
      if (!current || visited.has(current)) continue

      visited.add(current)
      component.push(current)

      for (const next of adjacency.get(current) ?? []) {
        if (!visited.has(next)) stack.push(next)
      }
    }

    const componentSet = new Set(component)

    const edgeCount = suspiciousEdges.filter(
      (edge) => componentSet.has(edge.source) && componentSet.has(edge.target)
    ).length

    const risk: FraudCluster["risk"] =
      component.length >= 5 || edgeCount >= 5
        ? "HIGH_RISK"
        : component.length >= 3
          ? "WATCH"
          : "SAFE"

    clusters.push({
      nodeIds: component,
      edgeCount,
      risk
    })
  }

  return clusters.sort((a, b) => b.edgeCount - a.edgeCount)
}