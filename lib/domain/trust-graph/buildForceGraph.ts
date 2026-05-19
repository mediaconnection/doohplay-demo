import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  type Simulation,
  type SimulationLinkDatum,
  type SimulationNodeDatum
} from "d3-force"

export type ForceNode = SimulationNodeDatum & {
  id: string
  score?: number
  radius?: number
  fx?: number | null
  fy?: number | null
}

export type ForceEdge = SimulationLinkDatum<ForceNode> & {
  source: string | ForceNode
  target: string | ForceNode
  weight?: number
  risk?: "LOW" | "MEDIUM" | "HIGH"
  label?: string
}

export type ForceGraphResult = {
  simulation: Simulation<ForceNode, ForceEdge>
  nodes: ForceNode[]
  edges: ForceEdge[]
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function safeNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback
}

function normalizeNodeId(value: unknown): string | null {
  if (typeof value !== "string") return null

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function getEdgeNodeId(value: string | ForceNode): string | null {
  if (typeof value === "string") return normalizeNodeId(value)

  return normalizeNodeId(value.id)
}

function normalizeRisk(value: unknown): ForceEdge["risk"] | undefined {
  if (value === "LOW" || value === "MEDIUM" || value === "HIGH") {
    return value
  }

  return undefined
}

function normalizeLabel(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

function getNodeRadius(score?: number): number {
  const safeScore = clamp(safeNumber(score, 50), 0, 100)

  if (safeScore < 40) return 18
  if (safeScore < 75) return 14
  return 11
}

function getLinkDistance(weight?: number): number {
  const safeWeight = clamp(safeNumber(weight, 1), 1, 100)

  if (safeWeight >= 80) return 48
  if (safeWeight >= 50) return 78
  return 112
}

function getLinkStrength(weight?: number): number {
  const safeWeight = clamp(safeNumber(weight, 1), 1, 100)
  return clamp(0.18 + safeWeight / 120, 0.18, 0.92)
}

function getChargeStrength(nodeCount: number): number {
  if (nodeCount <= 10) return -320
  if (nodeCount <= 30) return -240
  if (nodeCount <= 80) return -180
  return -140
}

function buildInitialPosition(
  index: number,
  total: number,
  width: number,
  height: number
): { x: number; y: number } {
  const centerX = width / 2
  const centerY = height / 2

  if (total <= 1) {
    return { x: centerX, y: centerY }
  }

  const angle = (index / total) * Math.PI * 2
  const radius = Math.min(width, height) * 0.28

  return {
    x: centerX + Math.cos(angle) * radius,
    y: centerY + Math.sin(angle) * radius
  }
}

export function buildForceGraph(
  rawNodes: Array<Pick<ForceNode, "id" | "score">>,
  rawEdges: ForceEdge[],
  width = 1200,
  height = 700
): ForceGraphResult {
  const safeWidth = Number.isFinite(width) && width > 0 ? width : 1200
  const safeHeight = Number.isFinite(height) && height > 0 ? height : 700

  const inputNodes = Array.isArray(rawNodes) ? rawNodes : []
  const inputEdges = Array.isArray(rawEdges) ? rawEdges : []

  const validIds: string[] = []
  const seenNodeIds = new Set<string>()

  for (const node of inputNodes) {
    const id = normalizeNodeId(node.id)

    if (!id || seenNodeIds.has(id)) continue

    seenNodeIds.add(id)
    validIds.push(id)
  }

  const uniqueNodes = new Map<string, ForceNode>()

  validIds.forEach((id, index) => {
    const rawNode = inputNodes.find((item) => normalizeNodeId(item.id) === id)

    const initial = buildInitialPosition(
      index,
      validIds.length,
      safeWidth,
      safeHeight
    )

    uniqueNodes.set(id, {
      id,
      score: safeNumber(rawNode?.score, 50),
      radius: getNodeRadius(rawNode?.score),
      x: initial.x,
      y: initial.y
    })
  })

  const seenEdgeKeys = new Set<string>()

  const edges = inputEdges
    .map((edge): ForceEdge | null => {
      const sourceId = getEdgeNodeId(edge.source)
      const targetId = getEdgeNodeId(edge.target)

      if (!sourceId || !targetId) return null
      if (sourceId === targetId) return null
      if (!uniqueNodes.has(sourceId) || !uniqueNodes.has(targetId)) return null

      const orderedPair =
        sourceId < targetId
          ? `${sourceId}__${targetId}`
          : `${targetId}__${sourceId}`

      const edgeKey = `${orderedPair}__${normalizeLabel(edge.label) ?? ""}__${safeNumber(
        edge.weight,
        1
      )}`

      if (seenEdgeKeys.has(edgeKey)) return null

      seenEdgeKeys.add(edgeKey)

      return {
        ...edge,
        source: sourceId,
        target: targetId,
        weight: clamp(safeNumber(edge.weight, 1), 1, 100),
        risk: normalizeRisk(edge.risk),
        label: normalizeLabel(edge.label)
      }
    })
    .filter((edge): edge is ForceEdge => edge !== null)

  const nodes = Array.from(uniqueNodes.values())

  const simulation = forceSimulation<ForceNode>(nodes)
    .velocityDecay(0.28)
    .force(
      "link",
      forceLink<ForceNode, ForceEdge>(edges)
        .id((node) => node.id)
        .distance((edge) => getLinkDistance(edge.weight))
        .strength((edge) => getLinkStrength(edge.weight))
    )
    .force("charge", forceManyBody<ForceNode>().strength(getChargeStrength(nodes.length)))
    .force(
      "collide",
      forceCollide<ForceNode>().radius((node) => {
        const radius =
          typeof node.radius === "number" && Number.isFinite(node.radius)
            ? node.radius
            : 12

        return radius + 16
      })
    )
    .force("center", forceCenter(safeWidth / 2, safeHeight / 2))

  return {
    simulation,
    nodes,
    edges
  }
}