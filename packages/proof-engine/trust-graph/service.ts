// @ts-nocheck
import {
  queryTrustGraphNodes,
  queryTrustGraphEdges
} from "./queries"

import type {
  NodeType,
  RiskLevel,
  TrustGraphEdge,
  TrustGraphFilters,
  TrustGraphNode,
  TrustGraphResponse
} from "./types"

/* =========================
   HELPERS
========================= */

function safeNumber(value: unknown, fallback = 0): number {
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

function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value))
}

function toSafeInt(value: unknown, fallback = 0): number {
  return Math.max(0, Math.trunc(safeNumber(value, fallback)))
}

function toIsoString(value: unknown): string | null {
  if (!value) return null

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString()
  }

  if (typeof value === "string") {
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString()
  }

  return null
}

function normalizeNodeType(value: unknown): NodeType {
  switch (value) {
    case "screen":
    case "player":
    case "campaign":
    case "advertiser":
    case "operator":
    case "event":
    case "device":
    case "wallet":
    case "block":
    case "certificate":
    case "source":
    case "source_table":
    case "event_type":
    case "display":
    case "anchor":
    case "anchored":
      return value
    default:
      return "unknown"
  }
}

function computeNodeScore(
  score: unknown,
  invalidEvents: number,
  executions: number
): number {
  const base = safeNumber(score, 50)

  if (executions <= 0) {
    return clamp(base)
  }

  const penaltyRatio = invalidEvents / executions
  const penalty = penaltyRatio * 40

  return clamp(base - penalty)
}

function computeNodeRisk(score: number): "SAFE" | "WATCH" | "HIGH_RISK" {
  if (score >= 70) return "SAFE"
  if (score >= 40) return "WATCH"
  return "HIGH_RISK"
}

function computeEdgeRisk(
  invalidEvents: number,
  executions: number
): RiskLevel {
  if (executions <= 0) return "LOW"

  const ratio = invalidEvents / executions

  if (ratio >= 0.5) return "HIGH"
  if (ratio >= 0.2) return "MEDIUM"
  return "LOW"
}

function sortNodes(nodes: TrustGraphNode[]): TrustGraphNode[] {
  return [...nodes].sort((a, b) => {
    if (b.executions !== a.executions) {
      return b.executions - a.executions
    }

    if (a.score !== b.score) {
      return a.score - b.score
    }

    return a.id.localeCompare(b.id)
  })
}

function sortEdges(edges: TrustGraphEdge[]): TrustGraphEdge[] {
  return [...edges].sort((a, b) => {
    if (b.weight !== a.weight) {
      return b.weight - a.weight
    }

    if (b.executions !== a.executions) {
      return b.executions - a.executions
    }

    if (a.source !== b.source) {
      return a.source.localeCompare(b.source)
    }

    if (a.target !== b.target) {
      return a.target.localeCompare(b.target)
    }

    return a.id.localeCompare(b.id)
  })
}

/* =========================
   MAIN SERVICE
========================= */

export async function getTrustGraph(
  filters: TrustGraphFilters
): Promise<TrustGraphResponse> {
  const [rawNodes, rawEdges] = await Promise.all([
    queryTrustGraphNodes(filters),
    queryTrustGraphEdges(filters)
  ])

  const nodeMap = new Map<string, TrustGraphNode>()

  for (const row of rawNodes) {
    if (!row?.node_id || typeof row.node_id !== "string") {
      continue
    }

    const executions = toSafeInt(row.executions, 0)
    const invalidEvents = toSafeInt(row.invalid_events, 0)
    const score = computeNodeScore(row.score, invalidEvents, executions)
    const risk = computeNodeRisk(score)

    nodeMap.set(row.node_id, {
      id: row.node_id,
      label:
        typeof row.label === "string" && row.label.trim().length > 0
          ? row.label.trim()
          : row.node_id,
      type: normalizeNodeType(row.node_type),
      score,
      risk,
      executions,
      invalidEvents,
      lastSeenAt: toIsoString(row.last_seen_at),
      metadata: {
        source: "event_chain"
      }
    })
  }

  const edgeMap = new Map<string, TrustGraphEdge>()

  for (const row of rawEdges) {
    if (
      !row?.edge_id ||
      typeof row.edge_id !== "string" ||
      !row.source ||
      !row.target
    ) {
      continue
    }

    if (!nodeMap.has(row.source) || !nodeMap.has(row.target)) {
      continue
    }

    const executions = toSafeInt(row.executions, 0)
    const invalidEvents = toSafeInt(row.invalid_events, 0)

    edgeMap.set(row.edge_id, {
      id: row.edge_id,
      source: row.source,
      target: row.target,
      relation:
        typeof row.relation === "string" && row.relation.trim().length > 0
          ? row.relation.trim()
          : "related",
      weight: clamp(toSafeInt(row.weight, 1), 1, 100),
      risk: computeEdgeRisk(invalidEvents, executions),
      executions,
      invalidEvents,
      lastSeenAt: toIsoString(row.last_seen_at),
      metadata: {
        source: "event_chain"
      }
    })
  }

  const nodes = sortNodes(Array.from(nodeMap.values()))
  const edges = sortEdges(Array.from(edgeMap.values()))

  let safeNodes = 0
  let watchNodes = 0
  let highRiskNodes = 0

  for (const node of nodes) {
    if (node.risk === "SAFE") {
      safeNodes += 1
    } else if (node.risk === "WATCH") {
      watchNodes += 1
    } else {
      highRiskNodes += 1
    }
  }

  const hours = toSafeInt(filters.hours, 24)

  return {
    nodes,
    edges,
    summary: {
      totalNodes: nodes.length,
      totalEdges: edges.length,
      safeNodes,
      watchNodes,
      highRiskNodes,
      periodHours: hours,
      generatedAt: new Date().toISOString()
    }
  }
}
