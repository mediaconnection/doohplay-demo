// @ts-nocheck
"use client"

import React from "react"

export type RiskLevel =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "SAFE"
  | "WATCH"
  | "HIGH_RISK"
  | string

export type GraphNode = {
  id: string
  label?: string
  name?: string
  type?: string
  risk?: RiskLevel
  score?: number
  x?: number
  y?: number
  [key: string]: unknown
}

export type GraphEdge = {
  id?: string
  source: string | GraphNode
  target: string | GraphNode
  label?: string
  weight?: number
  risk?: RiskLevel
  [key: string]: unknown
}

export type TrustGraphNode = GraphNode
export type TrustGraphEdge = GraphEdge

export type TrustNetworkAnalysis = {
  nodes?: unknown[]
  clusters?: unknown[]
  summary?: Record<string, unknown>
}

export type TrustGraphCanvasProps = {
  nodes?: GraphNode[]
  edges?: GraphEdge[]
  links?: GraphEdge[]
  selectedNodeId?: string | null
  selectedNode?: GraphNode | null
  onNodeClick?: (node: GraphNode) => void
  onSelectNode?: (node: GraphNode) => void
  onEdgeClick?: (edge: GraphEdge) => void
  analysis?: TrustNetworkAnalysis | null
  width?: number | string
  height?: number | string
  className?: string
}

function getRiskLabel(risk?: RiskLevel): string {
  if (!risk) return "UNKNOWN"
  return String(risk).replace(/_/g, " ")
}

function getNodeColor(risk?: RiskLevel): string {
  switch (String(risk || "").toUpperCase()) {
    case "HIGH":
    case "HIGH_RISK":
      return "#dc2626"
    case "MEDIUM":
    case "WATCH":
      return "#f59e0b"
    case "LOW":
    case "SAFE":
      return "#16a34a"
    default:
      return "#64748b"
  }
}

function getNodeId(value: string | GraphNode): string {
  return typeof value === "string" ? value : value.id
}

export default function TrustGraphCanvas({
  nodes = [],
  edges = [],
  links,
  selectedNodeId = null,
  selectedNode = null,
  onNodeClick,
  onSelectNode,
  onEdgeClick,
  width = "100%",
  height = 420,
  className
}: TrustGraphCanvasProps) {
  const safeNodes = Array.isArray(nodes) ? nodes : []
  const safeEdges = Array.isArray(links) ? links : Array.isArray(edges) ? edges : []

  const activeNodeId = selectedNodeId ?? selectedNode?.id ?? null

  return (
    <section
      className={className}
      style={{
        width,
        height,
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 16,
        background: "#ffffff",
        overflow: "auto"
      }}
    >
      <header style={{ marginBottom: 16 }}>
        <strong>Trust Graph</strong>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>
          {safeNodes.length} nodes · {safeEdges.length} edges
        </p>
      </header>

      {safeNodes.length === 0 ? (
        <div style={{ color: "#64748b", fontSize: 14 }}>
          Nenhum nó disponível para exibir.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: 12
          }}
        >
          {safeNodes.map((node) => {
            const active = node.id === activeNodeId
            const color = getNodeColor(node.risk)

            return (
              <button
                key={node.id}
                type="button"
                onClick={() => {
                  onNodeClick?.(node)
                  onSelectNode?.(node)
                }}
                style={{
                  textAlign: "left",
                  padding: 12,
                  borderRadius: 10,
                  border: active ? `2px solid ${color}` : "1px solid #e5e7eb",
                  background: active ? "#f8fafc" : "#fff",
                  cursor: "pointer"
                }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 999,
                    background: color,
                    marginBottom: 8
                  }}
                />

                <div style={{ fontWeight: 700, fontSize: 14 }}>
                  {node.label || node.name || node.id}
                </div>

                <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                  {node.type || "node"} · {getRiskLabel(node.risk)}
                </div>

                {typeof node.score === "number" && (
                  <div style={{ fontSize: 12, marginTop: 6 }}>
                    Score: {Math.round(node.score)}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      )}

      {safeEdges.length > 0 && (
        <details style={{ marginTop: 16 }}>
          <summary style={{ cursor: "pointer", fontSize: 13 }}>
            Relações ({safeEdges.length})
          </summary>

          <div style={{ marginTop: 8, display: "grid", gap: 6 }}>
            {safeEdges.slice(0, 20).map((edge, index) => (
              <button
                key={edge.id || `${getNodeId(edge.source)}-${getNodeId(edge.target)}-${index}`}
                type="button"
                onClick={() => onEdgeClick?.(edge)}
                style={{
                  textAlign: "left",
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  background: "#fff",
                  padding: 8,
                  fontSize: 12,
                  cursor: "pointer"
                }}
              >
                {getNodeId(edge.source)} → {getNodeId(edge.target)}
                {edge.label ? ` · ${edge.label}` : ""}
              </button>
            ))}
          </div>
        </details>
      )}
    </section>
  )
}
