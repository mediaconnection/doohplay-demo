"use client"

import { useMemo } from "react"
import TrustGraph from "@/components/trust/TrustGraph"
import { analyzeTrustNetwork } from "@proof-engine/trust-graph/analyzeTrustNetwork"
import type { GraphEdge, GraphNode } from "@proof-engine/trust-graph/types"
import type { ForceEdge } from "@proof-engine/trust-graph/buildForceGraph"

type TrustGraphContainerProps = {
  nodes: GraphNode[]
  edges: GraphEdge[]
  width?: number
  height?: number
}

function toForceEdges(edges: GraphEdge[]): ForceEdge[] {
  return edges.map((edge) => ({
    source: edge.source,
    target: edge.target,
    weight: edge.weight,
    label: edge.relation
  }))
}

export default function TrustGraphContainer({
  nodes,
  edges,
  width = 1200,
  height = 700
}: TrustGraphContainerProps) {
  const safeNodes = useMemo(() => {
    return Array.isArray(nodes) ? nodes : []
  }, [nodes])

  const safeEdges = useMemo(() => {
    return Array.isArray(edges) ? edges : []
  }, [edges])

  const analysis = useMemo(() => {
    return analyzeTrustNetwork(safeNodes, safeEdges)
  }, [safeNodes, safeEdges])

  const forceEdges = useMemo(() => {
    return toForceEdges(safeEdges)
  }, [safeEdges])

  return (
    <TrustGraph
      analysis={analysis}
      edges={forceEdges}
      width={width}
      height={height}
    />
  )
}