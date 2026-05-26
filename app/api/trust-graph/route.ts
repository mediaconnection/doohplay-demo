export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

import { NextRequest, NextResponse } from "next/server"


export const runtime = "nodejs"

type NodeType = "event" | "device" | "campaign" | string
type NodeRisk = "SAFE" | "WATCH" | "HIGH_RISK" | string
type EdgeRisk = "LOW" | "MEDIUM" | "HIGH" | string
type EdgeType =
  | "event_previous"
  | "event_device"
  | "event_campaign"
  | "device_campaign"
  | string

type NodeRow = {
  id: string
  node_type: NodeType
  ref_id: string | null
  label: string | null
  score: number | string | null
  risk: NodeRisk | null
  metadata: Record<string, unknown> | null
}

type EdgeRow = {
  id: number | string
  source_id: string
  target_id: string
  edge_type: EdgeType
  weight: number | string | null
  risk: EdgeRisk | null
  metadata: Record<string, unknown> | null
}

function safeLimit(value: string | null, fallback: number, max: number): number {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return fallback

  return Math.max(1, Math.min(Math.trunc(parsed), max))
}

function safeNumber(value: unknown, fallback: number): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function safeMetadata(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

export async function GET(req: NextRequest) {
    const { pool } = await import("@/lib/db")

  try {
    const searchParams = req.nextUrl.searchParams

    const limitNodes = safeLimit(searchParams.get("limitNodes"), 1000, 3000)
    const limitEdges = safeLimit(searchParams.get("limitEdges"), 2000, 5000)

    const [nodesRes, edgesRes] = await Promise.all([
      pool.query(
        `
        SELECT
          id::text AS id,
          node_type,
          ref_id::text AS ref_id,
          label,
          score,
          risk,
          metadata
        FROM public.trust_graph_nodes
        ORDER BY updated_at DESC NULLS LAST, id ASC
        LIMIT $1
        `,
        [limitNodes]
      ),
      pool.query(
        `
        SELECT
          id,
          source_id::text AS source_id,
          target_id::text AS target_id,
          edge_type,
          weight,
          risk,
          metadata
        FROM public.trust_graph_edges
        ORDER BY id DESC
        LIMIT $1
        `,
        [limitEdges]
      )
    ])

    const nodeRows = nodesRes.rows as NodeRow[]
    const edgeRows = edgesRes.rows as EdgeRow[]

    return NextResponse.json(
      {
        success: true,
        nodes: nodeRows.map((row) => ({
          id: row.id,
          type: row.node_type,
          ref: row.ref_id,
          label: row.label ?? row.ref_id ?? row.id,
          score: safeNumber(row.score, 0),
          risk: row.risk ?? "SAFE",
          metadata: safeMetadata(row.metadata)
        })),
        edges: edgeRows.map((row) => ({
          id: String(row.id),
          source: row.source_id,
          target: row.target_id,
          type: row.edge_type,
          weight: safeNumber(row.weight, 1),
          risk: row.risk ?? "LOW",
          metadata: safeMetadata(row.metadata)
        })),
        meta: {
          limitNodes,
          limitEdges,
          generated_at: new Date().toISOString()
        }
      },
      {
        headers: {
          "Cache-Control": "no-store"
        }
      }
    )
  } catch (error) {
    console.error("TRUST_GRAPH_ROUTE_ERROR", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "internal_error"
      },
      { status: 500 }
    )
  }
}
