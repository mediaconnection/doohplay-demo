export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

import { NextRequest, NextResponse } from "next/server"
import { pool } from "@/lib/db"
import { analyzeTrustNetwork } from "@/lib/trust-graph/analyzeTrustNetwork"
import type {
  GraphEdge,
  GraphNode,
  NodeType,
  RiskLevel
} from "@/lib/trust-graph/types"

export const runtime = "nodejs"

type EdgeRow = {
  edge_id: string | null
  from_node: string | null
  to_node: string | null
  relation: string | null
  weight: number | string | null
  risk: RiskLevel | string | null
  evidence: Record<string, unknown> | null
  occurred_at: string | null
  created_at: string | null
  from_type: string | null
  to_type: string | null
}

function safeNumber(value: unknown, fallback = 0): number {
  const n = Number(value)
  if (!Number.isFinite(n)) return fallback
  return Math.max(0, n)
}

function safeString(value: unknown): string {
  if (typeof value !== "string") return ""
  return value.trim()
}

function normalizeRisk(value: unknown): RiskLevel {
  const v = safeString(value).toUpperCase()

  if (v === "HIGH") return "HIGH"
  if (v === "MEDIUM") return "MEDIUM"
  if (v === "LOW") return "LOW"

  return "LOW"
}

function normalizeNodeType(value: unknown): NodeType {
  const v = safeString(value)

  const allowed: NodeType[] = [
    "screen",
    "player",
    "campaign",
    "advertiser",
    "operator",
    "event",
    "unknown"
  ]

  return allowed.includes(v as NodeType) ? (v as NodeType) : "unknown"
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function buildEdgeKey(edge: GraphEdge): string {
  return (
    edge.id ??
    `${edge.source}->${edge.target}:${edge.relation ?? "link"}`
  )
}

function buildNodeTypeMap(rows: EdgeRow[]): Map<string, NodeType> {
  const map = new Map<string, NodeType>()

  for (const row of rows) {
    const from = safeString(row.from_node)
    const to = safeString(row.to_node)

    if (from) map.set(from, normalizeNodeType(row.from_type))
    if (to) map.set(to, normalizeNodeType(row.to_type))
  }

  return map
}

function buildGraphNodes(rows: EdgeRow[]): GraphNode[] {
  const typeMap = buildNodeTypeMap(rows)
  const ids = new Set<string>()

  for (const row of rows) {
    const from = safeString(row.from_node)
    const to = safeString(row.to_node)

    if (from) ids.add(from)
    if (to) ids.add(to)
  }

  return [...ids].map((id): GraphNode => ({
    id,
    type: typeMap.get(id) ?? "unknown",
    label: id
  }))
}

function buildGraphEdges(rows: EdgeRow[]): GraphEdge[] {
  const edges: GraphEdge[] = []

  for (const row of rows) {
    const source = safeString(row.from_node)
    const target = safeString(row.to_node)

    if (!source || !target || source === target) continue

    edges.push({
      id: row.edge_id ?? undefined,
      source,
      target,
      relation: safeString(row.relation) || undefined,
      weight: safeNumber(row.weight),
      risk: normalizeRisk(row.risk),
      createdAt: row.occurred_at ?? row.created_at ?? undefined,
      metadata: {
        evidence: row.evidence ?? null,
        from_type: normalizeNodeType(row.from_type),
        to_type: normalizeNodeType(row.to_type)
      }
    })
  }

  return edges
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    const riskParam = searchParams.get("risk")
    const risk = riskParam ? normalizeRisk(riskParam) : null
    const relation = safeString(searchParams.get("relation"))
    const nodeId = safeString(searchParams.get("nodeId"))
    const limit = clamp(Number(searchParams.get("limit") ?? 200), 1, 1000)

    const where: string[] = []
    const params: Array<string | number> = []

    if (risk) {
      params.push(risk)
      where.push(`e.risk = $${params.length}`)
    }

    if (relation) {
      params.push(relation)
      where.push(`e.relation = $${params.length}`)
    }

    if (nodeId) {
      params.push(nodeId)
      where.push(
        `(e.from_node = $${params.length} OR e.to_node = $${params.length})`
      )
    }

    params.push(limit)

    const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : ""

    const query = `
      SELECT
        e.edge_id,
        e.from_node,
        e.to_node,
        e.relation,
        e.weight,
        e.risk,
        e.evidence,
        e.occurred_at,
        e.created_at,
        fn.node_type AS from_type,
        tn.node_type AS to_type
      FROM public.proof_edges e
      LEFT JOIN public.proof_nodes fn ON fn.node_id = e.from_node
      LEFT JOIN public.proof_nodes tn ON tn.node_id = e.to_node
      ${whereClause}
      ORDER BY e.created_at DESC
      LIMIT $${params.length}
    `

    const result = await pool.query(query, params)
    const rows = result.rows as EdgeRow[]

    const nodes = buildGraphNodes(rows)
    const edges = buildGraphEdges(rows)

    const analysis = analyzeTrustNetwork(nodes, edges)

    return NextResponse.json({
      success: true,
      nodes: analysis.nodes,
      edges: edges.map((edge) => ({
        ...edge,
        id: buildEdgeKey(edge)
      })),
      clusters: analysis.clusters,
      summary: analysis.summary,
      meta: {
        total_nodes: nodes.length,
        total_edges: edges.length,
        generated_at: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error("TRUST_NETWORK_ROUTE_FAILED", error)

    return NextResponse.json(
      {
        success: false,
        error: "INTERNAL_ERROR"
      },
      { status: 500 }
    )
  }
}
