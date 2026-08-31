// @ts-nocheck
"use client"
/**
 * @deprecated Este componente é inalcançável em runtime.
 *
 * next.config.ts define alias de webpack explícito:
 *   "@/components/trust": path.resolve(__dirname, "components/trust")
 * Ou seja, @/components/trust/... sempre resolve para components/trust/
 * (raiz), nunca para este arquivo em src/components/trust/, mesmo tendo
 * o mesmo nome — inclusive o import abaixo, "@/components/trust/TrustGraph",
 * que também cai na versão da raiz, não no irmão local nesta pasta. Achado
 * do levantamento de 2026-08-30 pra Etapa 2 do
 * DOOHPLAY_Plano_Separacao_Fronts.docx.
 *
 * Não editar nem estender aqui. Se precisar mexer no Trust Graph de
 * verdade, é em components/trust/ (raiz).
 */

import { useMemo } from "react"
import TrustGraph from "@/components/trust/TrustGraph"
import { analyzeTrustNetwork } from "@/lib/trust-graph/analyzeTrustNetwork"
import type { GraphEdge, GraphNode } from "@/lib/trust-graph/types"
import type { ForceEdge } from "@/lib/trust-graph/buildForceGraph"

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
