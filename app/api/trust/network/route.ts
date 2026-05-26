export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

import { NextRequest, NextResponse } from "next/server"

import type {
  GraphEdge,
  GraphNode,
  GraphNodeRef,
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
  return Number.isFinite(n) ? n : fallback
}

function safeString(value: unknown): string | null {
  if (typeof value !== "string") return null

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function normalizeRisk(value: unknown): RiskLevel | undefined {
  const v = safeString(value)?.toUpperCase()

  if (v === "HIGH" || v === "MEDIUM" || v === "LOW") {
    return v as RiskLevel
  }

  return undefined
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

function nodeRefToString(value: GraphNodeRef): string {
  if (typeof value === "string") return value
  return value.id
}

function buildEdgeKey(edge: GraphEdge): string {
  const source = nodeRefToString(edge.source)
  const target = nodeRefToString(edge.target)

  return edge.id ?? `${source}->${target}:${edge.relation ?? "link"}`
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
  const uniqueIds = new Set<string>()

  for (const row of rows) {
    const from = safeString(row.from_node)
    const to = safeString(row.to_node)

    if (from) uniqueIds.add(from)
    if (to) uniqueIds.add(to)
  }

  return [...uniqueIds].map((id): GraphNode => ({
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
      relation: safeString(row.relation) ?? undefined,
      weight: safeNumber(row.weight, 0),
      risk: normalizeRisk(row.risk),
      createdAt: row.occurred_at ?? row.created_at ?? undefined,
      metadata: {
        evidence: row.evidence ?? null,
        occurred_at: row.occurred_at ?? null,
        created_at: row.created_at ?? null,
        from_type: normalizeNodeType(row.from_type),
        to_type: normalizeNodeType(row.to_type)
      }
    })
  }

  return edges
}

export async function GET(req: NextRequest) {
    const { pool } = await import("@/lib/db")
    const { analyzeTrustNetwork } = await import("@/lib/trust-graph/analyzeTrustNetwork")

  try {
    const { searchParams } = new URL(req.url)

    const risk = normalizeRisk(searchParams.get("risk"))
    const relation = safeString(searchParams.get("relation"))
    const nodeTypeParam = safeString(searchParams.get("nodeType"))
    const nodeType = nodeTypeParam ? normalizeNodeType(nodeTypeParam) : null
    const nodeId = safeString(searchParams.get("nodeId"))
    const minWeightRaw = safeString(searchParams.get("minWeight"))
    const limitRaw = safeString(searchParams.get("limit"))
    const dateFrom = safeString(searchParams.get("dateFrom"))
    const dateTo = safeString(searchParams.get("dateTo"))
    const lastHoursRaw = safeString(searchParams.get("lastHours"))

    const minWeight =
      minWeightRaw !== null ? clamp(safeNumber(minWeightRaw, 0), 0, 100) : null

    const limit =
      limitRaw !== null ? clamp(safeNumber(limitRaw, 200), 1, 1000) : 200

    const lastHours =
      lastHoursRaw !== null
        ? clamp(safeNumber(lastHoursRaw, 24), 1, 24 * 365)
        : null

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

    if (minWeight !== null) {
      params.push(minWeight)
      where.push(`coalesce(e.weight, 0) >= $${params.length}`)
    }

    if (nodeId) {
      params.push(nodeId)
      where.push(
        `(e.from_node = $${params.length} OR e.to_node = $${params.length})`
      )
    }

    if (nodeType) {
      params.push(nodeType)
      where.push(
        `(coalesce(fn.node_type, 'unknown') = $${params.length} OR coalesce(tn.node_type, 'unknown') = $${params.length})`
      )
    }

    if (dateFrom) {
      params.push(dateFrom)
      where.push(
        `coalesce(e.occurred_at, e.created_at) >= $${params.length}::timestamptz`
      )
    }

    if (dateTo) {
      params.push(dateTo)
      where.push(
        `coalesce(e.occurred_at, e.created_at) < ($${params.length}::date + interval '1 day')`
      )
    }

    if (lastHours !== null) {
      params.push(lastHours)
      where.push(
        `coalesce(e.occurred_at, e.created_at) >= (now() - ($${params.length}::text || ' hours')::interval)`
      )
    }

    params.push(limit)

    const whereClause = where.length ? `where ${where.join(" and ")}` : ""

    const query = `
      select
        e.edge_id,
        e.from_node,
        e.to_node,
        e.relation,
        e.weight,
        e.risk,
        e.evidence,
        e.occurred_at,
        e.created_at,
        fn.node_type as from_type,
        tn.node_type as to_type
      from public.proof_edges e
      left join public.proof_nodes fn on fn.node_id = e.from_node
      left join public.proof_nodes tn on tn.node_id = e.to_node
      ${whereClause}
      order by
        coalesce(e.occurred_at, e.created_at) desc nulls last,
        e.created_at desc nulls last
      limit $${params.length}
    `

    const result = await pool.query(query, params)
    const rows = result.rows as EdgeRow[]

    const nodes = buildGraphNodes(rows)
    const edges = buildGraphEdges(rows)
    const analysis = analyzeTrustNetwork(nodes, edges)

    return NextResponse.json(
      {
        success: true,
        nodes: analysis.nodes,
        edges: edges.map((edge) => ({
          ...edge,
          id: buildEdgeKey(edge)
        })),
        clusters: analysis.clusters,
        summary: analysis.summary,
        filters: {
          risk: risk ?? null,
          relation,
          nodeType,
          nodeId,
          minWeight,
          limit,
          dateFrom,
          dateTo,
          lastHours
        },
        meta: {
          generated_at: new Date().toISOString(),
          total_raw_nodes: nodes.length,
          total_raw_edges: rows.length,
          total_filtered_nodes: analysis.nodes.length,
          total_filtered_edges: edges.length
        }
      },
      {
        headers: {
          "Cache-Control": "no-store"
        }
      }
    )
  } catch (error) {
    console.error("TRUST_NETWORK_ROUTE_FAILED", error)

    return NextResponse.json(
      {
        success: false,
        message: "Falha ao carregar trust network",
        detail: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
