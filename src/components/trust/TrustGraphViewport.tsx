// @ts-nocheck
"use client"

import React, { useId, useMemo } from "react"

/* =========================
   TYPES
========================= */

export type ViewportState = {
  scale: number
  x: number
  y: number
}

export type TooltipState = {
  visible: boolean
  x: number
  y: number
  nodeId: string | null
}

export type TooltipNode = {
  id: string
  label: string
  score: number
  risk: "SAFE" | "WATCH" | "HIGH_RISK"
  reasons: string[]
}

export type ViewportNode = {
  id: string
  label: string
  score: number
  risk: "SAFE" | "WATCH" | "HIGH_RISK"
  reasons: string[]
  color: string
  radius: number
  x?: number
  y?: number
}

export type ViewportLink = {
  source: string | ViewportNode
  target: string | ViewportNode
  weight?: number
  risk?: "LOW" | "MEDIUM" | "HIGH"
  label?: string
}

type TrustGraphViewportProps = {
  svgRef: React.Ref<SVGSVGElement>
  width: number
  height: number
  viewport: ViewportState
  isPanning: boolean
  simNodes: ViewportNode[]
  simLinks: ViewportLink[]
  activeClusterIndex: number | null
  activeClusterNodeIds: Set<string> | null
  tooltip: TooltipState
  tooltipNode: TooltipNode | null

  onWheelZoom: (event: React.WheelEvent<SVGSVGElement>) => void
  onBackgroundPointerDown: (event: React.PointerEvent<SVGSVGElement>) => void
  onPointerMove: (event: React.PointerEvent<SVGSVGElement>) => void
  onPointerUp: (event?: React.PointerEvent<SVGSVGElement>) => void
  onPointerCancel: (event?: React.PointerEvent<SVGSVGElement>) => void
  onPointerLeave: (event?: React.PointerEvent<SVGSVGElement>) => void
  onClearSelection: () => void

  onNodeMouseEnter: (
    nodeId: string,
    event: React.MouseEvent<SVGGElement>
  ) => void
  onNodeMouseMove: (
    nodeId: string,
    event: React.MouseEvent<SVGGElement>
  ) => void
  onNodeMouseLeave: (
    nodeId: string,
    event: React.MouseEvent<SVGGElement>
  ) => void
  onNodeClick: (nodeId: string) => void

  isNodeInActiveCluster: (nodeId: string) => boolean
  isNodeAdjacentToActiveCluster: (nodeId: string) => boolean
  isEdgeInActiveCluster: (link: ViewportLink) => boolean
}

/* =========================
   HELPERS
========================= */

function normalizeEdgeNodeId(node: string | ViewportNode): string {
  return typeof node === "string" ? node : node.id
}

function sanitizeSvgId(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, "-")
}

function getEdgeColor(risk?: "LOW" | "MEDIUM" | "HIGH") {
  switch (risk) {
    case "HIGH":
      return "#dc2626"
    case "MEDIUM":
      return "#f59e0b"
    case "LOW":
    default:
      return "#94a3b8"
  }
}

function getEdgeWidth(weight?: number, highlighted?: boolean) {
  const numericWeight =
    typeof weight === "number" && Number.isFinite(weight) ? weight : 1.5

  const normalizedBase = Math.max(1, Math.min(4, numericWeight))
  return highlighted ? normalizedBase + 1.5 : normalizedBase
}

function formatRiskLabel(label?: "SAFE" | "WATCH" | "HIGH_RISK") {
  switch (label) {
    case "HIGH_RISK":
      return "High Risk"
    case "WATCH":
      return "Watch"
    case "SAFE":
    default:
      return "Safe"
  }
}

function legendDot(background: string): React.CSSProperties {
  return {
    width: 10,
    height: 10,
    borderRadius: 999,
    background,
    display: "inline-block",
    flexShrink: 0
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function getSafeSize(value: number, fallback: number): number {
  return Number.isFinite(value) && value > 0 ? value : fallback
}

function truncateLabel(value: string, maxLength = 26): string {
  const trimmed = value.trim()
  if (trimmed.length <= maxLength) return trimmed
  return `${trimmed.slice(0, maxLength - 1)}…`
}

function resolveViewportLinkNode(
  node: string | ViewportNode
): ViewportNode | null {
  return typeof node === "string" ? null : node
}

/* =========================
   COMPONENT
========================= */

export default function TrustGraphViewport({
  svgRef,
  width,
  height,
  viewport,
  isPanning,
  simNodes,
  simLinks,
  activeClusterIndex,
  activeClusterNodeIds,
  tooltip,
  tooltipNode,
  onWheelZoom,
  onBackgroundPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onPointerLeave,
  onClearSelection,
  onNodeMouseEnter,
  onNodeMouseMove,
  onNodeMouseLeave,
  onNodeClick,
  isNodeInActiveCluster,
  isNodeAdjacentToActiveCluster,
  isEdgeInActiveCluster
}: TrustGraphViewportProps) {
  const rawShadowFilterId = useId()
  const shadowFilterId = useMemo(
    () => sanitizeSvgId(rawShadowFilterId),
    [rawShadowFilterId]
  )

  const safeWidth = getSafeSize(width, 1200)
  const safeHeight = getSafeSize(height, 720)

  const tooltipPosition = useMemo(() => {
    const boxWidth = 300
    const boxHeight = tooltipNode?.reasons?.length ? 120 : 92
    const margin = 12

    return {
      left: clamp(
        tooltip.x,
        margin,
        Math.max(margin, safeWidth - boxWidth - margin)
      ),
      top: clamp(
        tooltip.y,
        margin,
        Math.max(margin, safeHeight - boxHeight - margin)
      )
    }
  }, [tooltip.x, tooltip.y, tooltipNode?.reasons, safeWidth, safeHeight])

  return (
    <>
      <svg
        ref={svgRef}
        width="100%"
        height={safeHeight}
        viewBox={`0 0 ${safeWidth} ${safeHeight}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Trust graph viewport"
        focusable="false"
        style={{
          display: "block",
          background: "#ffffff",
          cursor: isPanning ? "grabbing" : "grab",
          touchAction: "none",
          userSelect: "none"
        }}
        onWheel={onWheelZoom}
        onPointerDown={onBackgroundPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onPointerLeave={onPointerLeave}
      >
        <rect
          x={0}
          y={0}
          width={safeWidth}
          height={safeHeight}
          fill="transparent"
          style={{ cursor: isPanning ? "grabbing" : "grab" }}
          onClick={onClearSelection}
        />

        <g
          transform={`translate(${viewport.x}, ${viewport.y}) scale(${viewport.scale})`}
          style={{ transition: isPanning ? "none" : "transform 140ms ease" }}
        >
          <g>
            {simLinks.map((link, index) => {
              const source = resolveViewportLinkNode(link.source)
              const target = resolveViewportLinkNode(link.target)

              if (!source || !target) return null

              const inCluster = isEdgeInActiveCluster(link)
              const dimmed = activeClusterNodeIds ? !inCluster : false

              return (
                <line
                  key={`${normalizeEdgeNodeId(link.source)}-${normalizeEdgeNodeId(link.target)}-${index}`}
                  x1={source.x ?? 0}
                  y1={source.y ?? 0}
                  x2={target.x ?? 0}
                  y2={target.y ?? 0}
                  stroke={inCluster ? "#dc2626" : getEdgeColor(link.risk)}
                  strokeWidth={getEdgeWidth(link.weight, inCluster)}
                  opacity={dimmed ? 0.08 : inCluster ? 0.9 : 0.45}
                  pointerEvents="none"
                  aria-hidden="true"
                  style={{
                    transition:
                      "opacity 160ms ease, stroke 160ms ease, stroke-width 160ms ease"
                  }}
                />
              )
            })}
          </g>

          <g>
            {simNodes.map((node) => {
              const inCluster = isNodeInActiveCluster(node.id)
              const adjacent = isNodeAdjacentToActiveCluster(node.id)

              const opacity = activeClusterNodeIds
                ? inCluster
                  ? 1
                  : adjacent
                    ? 0.35
                    : 0.12
                : 1

              const stroke = inCluster
                ? "#0f172a"
                : adjacent
                  ? "#475569"
                  : "#ffffff"

              const strokeWidth = inCluster ? 3 : adjacent ? 2 : 1.5
              const radius = Math.max(4, inCluster ? node.radius + 3 : node.radius)
              const textOpacity = activeClusterNodeIds
                ? inCluster
                  ? 1
                  : adjacent
                    ? 0.5
                    : 0.2
                : 1

              return (
                <g
                  key={node.id}
                  data-node="true"
                  transform={`translate(${node.x ?? 0}, ${node.y ?? 0})`}
                  style={{ cursor: "pointer", outline: "none" }}
                  role="button"
                  tabIndex={0}
                  aria-label={`${node.label}, risk ${formatRiskLabel(node.risk)}, trust score ${node.score}`}
                  onMouseEnter={(event) => {
                    event.stopPropagation()
                    onNodeMouseEnter(node.id, event)
                  }}
                  onMouseMove={(event) => {
                    event.stopPropagation()
                    onNodeMouseMove(node.id, event)
                  }}
                  onMouseLeave={(event) => {
                    event.stopPropagation()
                    onNodeMouseLeave(node.id, event)
                  }}
                  onClick={(event) => {
                    event.stopPropagation()
                    onNodeClick(node.id)
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault()
                      event.stopPropagation()
                      onNodeClick(node.id)
                    }
                  }}
                >
                  <title>{node.label}</title>

                  <circle
                    r={radius}
                    fill={node.color}
                    opacity={opacity}
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    filter={inCluster ? `url(#${shadowFilterId})` : undefined}
                    style={{
                      transition:
                        "r 160ms ease, opacity 160ms ease, stroke 160ms ease, stroke-width 160ms ease"
                    }}
                  />

                  <text
                    y={radius + 18}
                    textAnchor="middle"
                    fontSize={12}
                    fontWeight={inCluster ? 700 : 500}
                    fill="#0f172a"
                    opacity={textOpacity}
                    pointerEvents="none"
                    style={{ transition: "opacity 160ms ease" }}
                  >
                    {truncateLabel(node.label)}
                  </text>
                </g>
              )
            })}
          </g>
        </g>

        <defs>
          <filter
            id={shadowFilterId}
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feDropShadow
              dx="0"
              dy="2"
              stdDeviation="3"
              floodOpacity="0.25"
            />
          </filter>
        </defs>
      </svg>

      {tooltip.visible && tooltipNode && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: "absolute",
            left: tooltipPosition.left,
            top: tooltipPosition.top,
            zIndex: 10,
            pointerEvents: "none",
            background: "#0f172a",
            color: "#fff",
            borderRadius: 12,
            padding: "10px 12px",
            fontSize: 12,
            maxWidth: 300,
            boxShadow: "0 10px 30px rgba(15, 23, 42, 0.25)"
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 4 }}>
            {tooltipNode.label}
          </div>

          <div>ID: {tooltipNode.id}</div>
          <div>Risk: {formatRiskLabel(tooltipNode.risk)}</div>
          <div>Trust score: {tooltipNode.score}</div>

          {tooltipNode.reasons.length > 0 && (
            <div style={{ marginTop: 8, opacity: 0.9 }}>
              {tooltipNode.reasons.slice(0, 3).join(" • ")}
            </div>
          )}
        </div>
      )}

      <div
        style={{
          display: "flex",
          gap: 16,
          padding: "12px 16px",
          borderTop: "1px solid #e2e8f0",
          background: "#f8fafc",
          flexWrap: "wrap",
          fontSize: 12,
          color: "#334155"
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={legendDot("#22c55e")} />
          Safe
        </span>

        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={legendDot("#f59e0b")} />
          Watch
        </span>

        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={legendDot("#dc2626")} />
          High Risk
        </span>

        <span style={{ color: "#64748b" }}>
          Zoom: {viewport.scale.toFixed(2)}x
        </span>

        <span style={{ color: "#64748b" }}>
          Cluster ativo:{" "}
          {activeClusterIndex !== null
            ? `#${activeClusterIndex + 1}`
            : "nenhum"}
        </span>
      </div>
    </>
  )
}
