"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { select } from "d3-selection"
import { drag } from "d3-drag"
import { zoom } from "d3-zoom"
import type { D3DragEvent } from "d3-drag"
import type { D3ZoomEvent, ZoomBehavior } from "d3-zoom"
import type { SimulationNodeDatum } from "d3-force"
import {
  buildForceGraph,
  type ForceEdge,
  type ForceNode
} from "@/lib/trust-graph/buildForceGraph"
import type {
  NodeAnalysis,
  TrustNetworkAnalysis
} from "@/lib/trust-graph/analyzeTrustNetwork"

type TrustGraphProps = {
  analysis: TrustNetworkAnalysis
  edges: ForceEdge[]
  width?: number
  height?: number
}

type ClusterSeverity = "LOW" | "MEDIUM" | "HIGH"

type RichCluster = {
  id?: string
  severity?: ClusterSeverity
  nodeIds?: string[]
  edgeIds?: string[]
  highRiskEdges?: number
  avgWeight?: number
  mediumRiskEdges?: number
  repeatedConnections?: number
  density?: number
  recencyScore?: number
}

type SelectedNodePanelData = {
  node: NodeAnalysis
  neighbors: string[]
  connections: Array<{
    source: string
    target: string
    weight?: number
    otherNodeId: string
  }>
  cluster:
    | {
        id: string
        severity: ClusterSeverity
        nodeIds: string[]
        edgeIds: string[]
        highRiskEdges: number
        avgWeight: number
        mediumRiskEdges?: number
        repeatedConnections?: number
        density?: number
        recencyScore?: number
      }
    | null
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function safeNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback
}

function getNodeColor(score?: number): string {
  const safeScore =
    typeof score === "number" && Number.isFinite(score)
      ? clamp(score, 0, 100)
      : 0

  if (safeScore < 40) return "#dc2626"
  if (safeScore < 75) return "#f59e0b"
  return "#16a34a"
}

function getNodeStroke(score?: number): string {
  const safeScore =
    typeof score === "number" && Number.isFinite(score)
      ? clamp(score, 0, 100)
      : 0

  if (safeScore < 40) return "#7f1d1d"
  if (safeScore < 75) return "#92400e"
  return "#166534"
}

function getEdgeStrokeWidth(weight?: number): number {
  const safeWeight =
    typeof weight === "number" && Number.isFinite(weight)
      ? clamp(weight, 0, 100)
      : 1

  return 1 + safeWeight / 35
}

function getEdgeOpacity(weight?: number): number {
  const safeWeight =
    typeof weight === "number" && Number.isFinite(weight)
      ? clamp(weight, 0, 100)
      : 1

  return clamp(0.2 + safeWeight / 120, 0.2, 0.9)
}

function getEdgeColor(weight?: number): string {
  const safeWeight =
    typeof weight === "number" && Number.isFinite(weight)
      ? clamp(weight, 0, 100)
      : 1

  if (safeWeight >= 80) return "#dc2626"
  if (safeWeight >= 50) return "#f59e0b"
  return "#94a3b8"
}

function getNodeRadius(node: ForceNode): number {
  return typeof node.radius === "number" && Number.isFinite(node.radius)
    ? Math.max(8, node.radius)
    : 12
}

function getNodeId(value: string | ForceNode): string | null {
  if (typeof value === "string") {
    const normalized = value.trim()
    return normalized || null
  }

  if (value && typeof value === "object" && typeof value.id === "string") {
    const normalized = value.id.trim()
    return normalized || null
  }

  return null
}

function riskBadgeClass(label: "SAFE" | "WATCH" | "HIGH_RISK"): string {
  switch (label) {
    case "HIGH_RISK":
      return "border-red-200 bg-red-100 text-red-700"
    case "WATCH":
      return "border-amber-200 bg-amber-100 text-amber-700"
    default:
      return "border-emerald-200 bg-emerald-100 text-emerald-700"
  }
}

function clusterBadgeClass(severity: ClusterSeverity): string {
  switch (severity) {
    case "HIGH":
      return "border-red-200 bg-red-100 text-red-700"
    case "MEDIUM":
      return "border-amber-200 bg-amber-100 text-amber-700"
    default:
      return "border-slate-200 bg-slate-100 text-slate-700"
  }
}

function formatMetric(value: number | undefined): string {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "—"
  }

  return value.toFixed(2)
}

function truncateLabel(value: string, max = 28): string {
  const trimmed = value.trim()
  if (trimmed.length <= max) return trimmed
  return `${trimmed.slice(0, max - 1)}…`
}

function getDisplayLabel(node: NodeAnalysis): string {
  return typeof node.displayLabel === "string" && node.displayLabel.trim().length > 0
    ? node.displayLabel.trim()
    : node.id
}

function getNodeTypeLabel(node: NodeAnalysis): string | null {
  return typeof node.type === "string" && node.type.trim().length > 0
    ? node.type
    : null
}

function getNodeTrust(node: NodeAnalysis): number | null {
  return typeof node.trust === "number" && Number.isFinite(node.trust)
    ? node.trust
    : null
}

function toRichCluster(
  cluster: unknown,
  fallbackId: string
): SelectedNodePanelData["cluster"] {
  if (!cluster || typeof cluster !== "object") {
    return null
  }

  const rich = cluster as RichCluster
  const nodeIds = Array.isArray(rich.nodeIds)
    ? rich.nodeIds.filter((item): item is string => typeof item === "string")
    : []

  const edgeIds = Array.isArray(rich.edgeIds)
    ? rich.edgeIds.filter((item): item is string => typeof item === "string")
    : []

  const severity: ClusterSeverity =
    rich.severity === "HIGH" || rich.severity === "MEDIUM" || rich.severity === "LOW"
      ? rich.severity
      : "MEDIUM"

  return {
    id: typeof rich.id === "string" && rich.id.trim() ? rich.id : fallbackId,
    severity,
    nodeIds,
    edgeIds,
    highRiskEdges: safeNumber(rich.highRiskEdges, 0),
    avgWeight: safeNumber(rich.avgWeight, 0),
    mediumRiskEdges:
      typeof rich.mediumRiskEdges === "number" && Number.isFinite(rich.mediumRiskEdges)
        ? rich.mediumRiskEdges
        : undefined,
    repeatedConnections:
      typeof rich.repeatedConnections === "number" &&
      Number.isFinite(rich.repeatedConnections)
        ? rich.repeatedConnections
        : undefined,
    density:
      typeof rich.density === "number" && Number.isFinite(rich.density)
        ? rich.density
        : undefined,
    recencyScore:
      typeof rich.recencyScore === "number" && Number.isFinite(rich.recencyScore)
        ? rich.recencyScore
        : undefined
  }
}

function findClusterForNode(
  selectedNodeId: string,
  analysis: TrustNetworkAnalysis
): SelectedNodePanelData["cluster"] {
  const clusters = Array.isArray(analysis.clusters) ? analysis.clusters : []

  for (let index = 0; index < clusters.length; index++) {
    const cluster = clusters[index]

    if (
      cluster &&
      typeof cluster === "object" &&
      Array.isArray((cluster as RichCluster).nodeIds) &&
      (cluster as RichCluster).nodeIds?.includes(selectedNodeId)
    ) {
      return toRichCluster(cluster, `cluster-${index + 1}`)
    }
  }

  return null
}

function buildPanelData(
  selectedNodeId: string,
  analysis: TrustNetworkAnalysis,
  graphEdges: ForceEdge[]
): SelectedNodePanelData | null {
  const node = analysis.nodes.find((item) => item.id === selectedNodeId)
  if (!node) return null

  const connections = graphEdges
    .map((edge) => {
      const source = getNodeId(edge.source)
      const target = getNodeId(edge.target)

      if (!source || !target) return null
      if (source !== selectedNodeId && target !== selectedNodeId) return null

      const otherNodeId = source === selectedNodeId ? target : source

      return {
        source,
        target,
        weight: edge.weight,
        otherNodeId
      }
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => {
      const weightA =
        typeof a.weight === "number" && Number.isFinite(a.weight) ? a.weight : 0
      const weightB =
        typeof b.weight === "number" && Number.isFinite(b.weight) ? b.weight : 0

      if (weightB !== weightA) return weightB - weightA
      return a.otherNodeId.localeCompare(b.otherNodeId)
    })

  const neighbors = Array.from(
    new Set(connections.map((connection) => connection.otherNodeId))
  ).sort((a, b) => a.localeCompare(b))

  const cluster = findClusterForNode(selectedNodeId, analysis)

  return {
    node,
    neighbors,
    connections,
    cluster
  }
}

export default function TrustGraph({
  analysis,
  edges,
  width = 1200,
  height = 700
}: TrustGraphProps) {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

  const safeWidth = Number.isFinite(width) && width > 0 ? width : 1200
  const safeHeight = Number.isFinite(height) && height > 0 ? height : 700

  const analysisNodeMap = useMemo(() => {
    return new Map(analysis.nodes.map((node) => [node.id, node]))
  }, [analysis.nodes])

  const graphNodes = useMemo<ForceNode[]>(() => {
    return analysis.nodes.map((node) => ({
      id: node.id,
      score: node.score
    }))
  }, [analysis.nodes])

  const graphData = useMemo(() => {
    return buildForceGraph(graphNodes, edges, safeWidth, safeHeight)
  }, [graphNodes, edges, safeWidth, safeHeight])

  const panelData = useMemo(() => {
    if (!selectedNodeId) return null
    return buildPanelData(selectedNodeId, analysis, graphData.edges)
  }, [selectedNodeId, analysis, graphData.edges])

  useEffect(() => {
    if (!selectedNodeId) return

    if (!analysisNodeMap.has(selectedNodeId)) {
      setSelectedNodeId(null)
    }
  }, [analysisNodeMap, selectedNodeId])

  useEffect(() => {
    if (!svgRef.current) return

    const { simulation, nodes: simulationNodes, edges: simulationEdges } = graphData

    const svg = select(svgRef.current)
    svg.selectAll("*").remove()

    svg
      .attr("viewBox", `0 0 ${safeWidth} ${safeHeight}`)
      .attr("width", safeWidth)
      .attr("height", safeHeight)
      .attr("role", "img")
      .attr("aria-label", "Trust graph interativo")
      .style("overflow", "hidden")

    const root = svg.append("g")
    const edgeLayer = root.append("g").attr("data-layer", "edges")
    const nodeLayer = root.append("g").attr("data-layer", "nodes")
    const labelLayer = root.append("g").attr("data-layer", "labels")

    const edgeSelection = edgeLayer
      .selectAll<SVGLineElement, ForceEdge>("line")
      .data(simulationEdges)
      .enter()
      .append("line")
      .attr("stroke", (d: ForceEdge) => getEdgeColor(d.weight))
      .attr("stroke-opacity", (d: ForceEdge) => getEdgeOpacity(d.weight))
      .attr("stroke-width", (d: ForceEdge) => getEdgeStrokeWidth(d.weight))

    const nodeSelection = nodeLayer
      .selectAll<SVGCircleElement, ForceNode>("circle")
      .data(simulationNodes)
      .enter()
      .append("circle")
      .attr("r", (d: ForceNode) => getNodeRadius(d))
      .attr("fill", (d: ForceNode) => getNodeColor(d.score))
      .attr("stroke", (d: ForceNode) => getNodeStroke(d.score))
      .attr("stroke-width", 2)
      .attr("tabindex", 0)
      .attr("role", "button")
      .style("cursor", "grab")
      .on("click", (_, d) => {
        setSelectedNodeId((current) => (current === d.id ? null : d.id))
      })
      .on("keydown", (event, d) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          setSelectedNodeId((current) => (current === d.id ? null : d.id))
        }
      })

    nodeSelection.append("title").text((d) => {
      const matchedNode = analysisNodeMap.get(d.id)
      const label = matchedNode ? getDisplayLabel(matchedNode) : d.id
      const score =
        typeof d.score === "number" && Number.isFinite(d.score)
          ? d.score.toFixed(0)
          : "0"

      return `${label} • score ${score}`
    })

    const labelSelection = labelLayer
      .selectAll<SVGTextElement, ForceNode>("text")
      .data(simulationNodes)
      .enter()
      .append("text")
      .text((d) => {
        const matchedNode = analysisNodeMap.get(d.id)
        return truncateLabel(matchedNode ? getDisplayLabel(matchedNode) : d.id)
      })
      .attr("font-size", 12)
      .attr("font-family", "Arial, sans-serif")
      .attr("fill", "#0f172a")
      .attr("text-anchor", "middle")
      .attr("pointer-events", "none")
      .attr("dy", (d: ForceNode) => -(getNodeRadius(d) + 8))

    const zoomBehavior: ZoomBehavior<SVGSVGElement, unknown> = zoom<
      SVGSVGElement,
      unknown
    >()
      .scaleExtent([0.4, 3])
      .on("zoom", (event: D3ZoomEvent<SVGSVGElement, unknown>) => {
        root.attr("transform", event.transform.toString())
      })

    svg.call(zoomBehavior)
    svg.on("dblclick.zoom", null)

    const dragBehavior = drag<SVGCircleElement, ForceNode>()
      .on("start", (event: D3DragEvent<SVGCircleElement, ForceNode, ForceNode>, d) => {
        if (!event.active) simulation.alphaTarget(0.2).restart()
        d.fx = d.x
        d.fy = d.y
        select(event.sourceEvent?.target as SVGCircleElement | null).style(
          "cursor",
          "grabbing"
        )
      })
      .on("drag", (event: D3DragEvent<SVGCircleElement, ForceNode, ForceNode>, d) => {
        d.fx = event.x
        d.fy = event.y
      })
      .on("end", (event: D3DragEvent<SVGCircleElement, ForceNode, ForceNode>, d) => {
        if (!event.active) simulation.alphaTarget(0)
        d.fx = null
        d.fy = null
        select(event.sourceEvent?.target as SVGCircleElement | null).style(
          "cursor",
          "grab"
        )
      })

    nodeSelection.call(dragBehavior)

    simulation.stop()
    for (let i = 0; i < 140; i++) {
      simulation.tick()
    }

    const applySelectionStyles = () => {
      if (!selectedNodeId) {
        nodeSelection
          .attr("opacity", 1)
          .attr("stroke-width", 2)
          .attr("r", (d: ForceNode) => getNodeRadius(d))

        edgeSelection
          .attr("opacity", (d) => getEdgeOpacity(d.weight))
          .attr("stroke-width", (d: ForceEdge) => getEdgeStrokeWidth(d.weight))

        labelSelection.attr("opacity", 1)
        return
      }

      const neighborIds = new Set<string>()
      const connectedEdgeKeys = new Set<string>()

      for (const edge of simulationEdges) {
        const source = getNodeId(edge.source)
        const target = getNodeId(edge.target)
        if (!source || !target) continue

        const isConnected = source === selectedNodeId || target === selectedNodeId
        if (!isConnected) continue

        neighborIds.add(source)
        neighborIds.add(target)
        connectedEdgeKeys.add(`${source}__${target}__${edge.weight ?? 0}`)
        connectedEdgeKeys.add(`${target}__${source}__${edge.weight ?? 0}`)
      }

      nodeSelection
        .attr("opacity", (d) => (neighborIds.has(d.id) ? 1 : 0.16))
        .attr("stroke-width", (d) => (d.id === selectedNodeId ? 4 : 2))
        .attr("r", (d) => {
          const base = getNodeRadius(d)
          return d.id === selectedNodeId ? base + 4 : base
        })

      edgeSelection
        .attr("opacity", (d) => {
          const source = getNodeId(d.source)
          const target = getNodeId(d.target)
          const key = `${source ?? ""}__${target ?? ""}__${d.weight ?? 0}`

          return connectedEdgeKeys.has(key) ? 0.95 : 0.08
        })
        .attr("stroke-width", (d) => {
          const source = getNodeId(d.source)
          const target = getNodeId(d.target)
          const isConnected = source === selectedNodeId || target === selectedNodeId

          return isConnected
            ? getEdgeStrokeWidth(d.weight) + 1.5
            : getEdgeStrokeWidth(d.weight)
        })

      labelSelection.attr("opacity", (d) => (neighborIds.has(d.id) ? 1 : 0.2))
    }

    const ticked = () => {
      edgeSelection
        .attr("x1", (d) => {
          const source = d.source as SimulationNodeDatum
          return typeof source.x === "number" ? source.x : safeWidth / 2
        })
        .attr("y1", (d) => {
          const source = d.source as SimulationNodeDatum
          return typeof source.y === "number" ? source.y : safeHeight / 2
        })
        .attr("x2", (d) => {
          const target = d.target as SimulationNodeDatum
          return typeof target.x === "number" ? target.x : safeWidth / 2
        })
        .attr("y2", (d) => {
          const target = d.target as SimulationNodeDatum
          return typeof target.y === "number" ? target.y : safeHeight / 2
        })

      nodeSelection
        .attr("cx", (d) => (typeof d.x === "number" ? d.x : safeWidth / 2))
        .attr("cy", (d) => (typeof d.y === "number" ? d.y : safeHeight / 2))

      labelSelection
        .attr("x", (d) => (typeof d.x === "number" ? d.x : safeWidth / 2))
        .attr("y", (d) => {
          const y = typeof d.y === "number" ? d.y : safeHeight / 2
          return y - getNodeRadius(d) - 8
        })

      applySelectionStyles()
    }

    ticked()
    simulation.on("tick", ticked)
    simulation.alpha(0.35).restart()

    return () => {
      simulation.on("tick", null)
      simulation.stop()
      svg.on(".zoom", null)
    }
  }, [analysisNodeMap, graphData, safeWidth, safeHeight, selectedNodeId])

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Trust Graph Interativo
            </h2>
            <p className="text-xs text-slate-500">
              Clique em um nó para destacar conexões e abrir o painel investigativo.
            </p>
          </div>

          {selectedNodeId ? (
            <button
              type="button"
              onClick={() => setSelectedNodeId(null)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Limpar seleção
            </button>
          ) : null}
        </div>

        <svg ref={svgRef} className="block h-auto w-full" />
      </div>

      <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">
          Painel investigativo
        </h3>

        {!panelData ? (
          <div className="mt-4 text-sm text-slate-500">
            Selecione um nó para ver score, breakdown, razões, conexões e cluster.
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Nó
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-900">
                {getDisplayLabel(panelData.node)}
              </div>
              <div className="mt-1 break-all text-xs text-slate-500">
                {panelData.node.id}
                {getNodeTypeLabel(panelData.node)
                  ? ` • ${getNodeTypeLabel(panelData.node)}`
                  : ""}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${riskBadgeClass(panelData.node.label)}`}
              >
                {panelData.node.label}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 p-3">
                <div className="text-xs text-slate-500">Score</div>
                <div className="mt-1 text-lg font-semibold text-slate-900">
                  {panelData.node.score}
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-3">
                <div className="text-xs text-slate-500">Trust</div>
                <div className="mt-1 text-lg font-semibold text-slate-900">
                  {getNodeTrust(panelData.node) ?? "—"}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-3">
              <div className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                Breakdown
              </div>

              <div className="grid gap-2 text-sm text-slate-700">
                <div className="flex items-center justify-between">
                  <span>Connectivity</span>
                  <span className="font-medium">
                    {formatMetric(panelData.node.breakdown.connectivity)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Risk exposure</span>
                  <span className="font-medium">
                    {formatMetric(panelData.node.breakdown.riskExposure)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Suspicious weight</span>
                  <span className="font-medium">
                    {formatMetric(panelData.node.breakdown.suspiciousWeight)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Recurrence</span>
                  <span className="font-medium">
                    {formatMetric(panelData.node.breakdown.recurrence)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Final</span>
                  <span className="font-medium">
                    {formatMetric(panelData.node.breakdown.final)}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <div className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                Razões
              </div>

              {panelData.node.reasons.length === 0 ? (
                <div className="text-sm text-slate-500">
                  Nenhuma razão relevante encontrada.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {panelData.node.reasons.map((reason) => (
                    <span
                      key={reason}
                      className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700"
                    >
                      {reason}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                Nós conectados
              </div>

              {panelData.neighbors.length === 0 ? (
                <div className="text-sm text-slate-500">
                  Nenhum vizinho encontrado.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {panelData.neighbors.map((neighbor) => (
                    <button
                      key={neighbor}
                      type="button"
                      onClick={() => setSelectedNodeId(neighbor)}
                      className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700 hover:bg-slate-200"
                    >
                      {truncateLabel(neighbor, 32)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                Conexões
              </div>

              {panelData.connections.length === 0 ? (
                <div className="text-sm text-slate-500">
                  Sem arestas relacionadas.
                </div>
              ) : (
                <div className="max-h-[240px] space-y-2 overflow-auto pr-1">
                  {panelData.connections.map((connection, index) => (
                    <button
                      key={`${connection.source}-${connection.target}-${index}`}
                      type="button"
                      onClick={() => setSelectedNodeId(connection.otherNodeId)}
                      className="block w-full rounded-xl border border-slate-200 p-3 text-left hover:bg-slate-50"
                    >
                      <div className="text-sm font-medium text-slate-900">
                        {truncateLabel(connection.otherNodeId, 44)}
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        Peso:{" "}
                        {typeof connection.weight === "number"
                          ? connection.weight
                          : "—"}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 p-3">
              <div className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                Cluster relacionado
              </div>

              {!panelData.cluster ? (
                <div className="text-sm text-slate-500">
                  Este nó não está em cluster suspeito.
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-medium text-slate-900">
                      {panelData.cluster.id}
                    </div>
                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${clusterBadgeClass(panelData.cluster.severity)}`}
                    >
                      {panelData.cluster.severity}
                    </span>
                  </div>

                  <div className="grid gap-2 text-sm text-slate-700">
                    <div className="flex items-center justify-between">
                      <span>Nós</span>
                      <span className="font-medium">
                        {panelData.cluster.nodeIds.length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Arestas</span>
                      <span className="font-medium">
                        {panelData.cluster.edgeIds.length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>High risk edges</span>
                      <span className="font-medium">
                        {panelData.cluster.highRiskEdges}
                      </span>
                    </div>
                    {typeof panelData.cluster.mediumRiskEdges === "number" ? (
                      <div className="flex items-center justify-between">
                        <span>Medium risk edges</span>
                        <span className="font-medium">
                          {panelData.cluster.mediumRiskEdges}
                        </span>
                      </div>
                    ) : null}
                    {typeof panelData.cluster.repeatedConnections === "number" ? (
                      <div className="flex items-center justify-between">
                        <span>Repetições</span>
                        <span className="font-medium">
                          {panelData.cluster.repeatedConnections}
                        </span>
                      </div>
                    ) : null}
                    <div className="flex items-center justify-between">
                      <span>Peso médio</span>
                      <span className="font-medium">
                        {formatMetric(panelData.cluster.avgWeight)}
                      </span>
                    </div>
                    {typeof panelData.cluster.density === "number" ? (
                      <div className="flex items-center justify-between">
                        <span>Densidade</span>
                        <span className="font-medium">
                          {formatMetric(panelData.cluster.density)}
                        </span>
                      </div>
                    ) : null}
                    {typeof panelData.cluster.recencyScore === "number" ? (
                      <div className="flex items-center justify-between">
                        <span>Recência</span>
                        <span className="font-medium">
                          {formatMetric(panelData.cluster.recencyScore)}
                        </span>
                      </div>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </aside>
    </div>
  )
}
