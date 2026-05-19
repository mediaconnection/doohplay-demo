"use client"

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties
} from "react"

import TrustGraphCanvas, {
  type TrustGraphEdge,
  type TrustGraphNode
} from "@/components/trust/TrustGraphCanvas"

type RiskLevel = "LOW" | "MEDIUM" | "HIGH"

type NodeType =
  | "screen"
  | "player"
  | "campaign"
  | "advertiser"
  | "operator"
  | "event"
  | "unknown"

type GraphNode = {
  id: string
  score: number
  label: "SAFE" | "WATCH" | "HIGH_RISK"
  reasons: string[]
  breakdown: {
    connectivity: number
    riskExposure: number
    suspiciousWeight: number
    recurrence: number
    final: number
    reasons: string[]
  }
}

type FraudCluster = {
  id: string
  nodeIds: string[]
  edgeIds: string[]
  highRiskEdges: number
  avgWeight: number
  severity: RiskLevel
}

type GraphEdge = {
  id?: string
  source: string
  target: string
  relation?: string
  weight?: number
  risk?: RiskLevel
  createdAt?: string
  metadata?: Record<string, unknown>
}

type TrustResponse = {
  nodes: GraphNode[]
  clusters: FraudCluster[]
  edges: GraphEdge[]
  summary: {
    totalNodes: number
    totalEdges: number
    highRiskNodes: number
    watchNodes: number
    suspiciousClusters: number
  }
  filters?: {
    risk: RiskLevel | null
    relation: string | null
    nodeType: NodeType | null
    nodeId: string | null
    minWeight: number | null
    limit: number | null
    dateFrom: string | null
    dateTo: string | null
    lastHours: number | null
  }
  meta?: {
    generated_at: string
    total_raw_nodes: number
    total_raw_edges: number
    total_filtered_nodes: number
    total_filtered_edges: number
  }
}

type FilterState = {
  risk: string
  relation: string
  nodeType: string
  nodeId: string
  minWeight: string
  limit: string
  dateFrom: string
  dateTo: string
  lastHours: string
}

type SelectedGraphItem =
  | {
      kind: "node"
      data: TrustGraphNode
    }
  | {
      kind: "edge"
      data: TrustGraphEdge
    }
  | null

const DEFAULT_FILTERS: FilterState = {
  risk: "",
  relation: "",
  nodeType: "",
  nodeId: "",
  minWeight: "",
  limit: "200",
  dateFrom: "",
  dateTo: "",
  lastHours: ""
}

function riskBadgeColor(risk: string) {
  switch (risk) {
    case "HIGH":
    case "HIGH_RISK":
      return "#b91c1c"

    case "MEDIUM":
    case "WATCH":
      return "#b45309"

    case "LOW":
    case "SAFE":
    default:
      return "#166534"
  }
}

function cardStyle(): CSSProperties {
  return {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    padding: 16,
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)"
  }
}

function inputStyle(): CSSProperties {
  return {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #d1d5db",
    fontSize: 14,
    background: "#fff"
  }
}

function thStyle(): CSSProperties {
  return {
    textAlign: "left",
    fontSize: 12,
    color: "#6b7280",
    padding: "10px 8px",
    borderBottom: "1px solid #e5e7eb"
  }
}

function tdStyle(): CSSProperties {
  return {
    fontSize: 14,
    padding: "12px 8px",
    borderBottom: "1px solid #f3f4f6",
    verticalAlign: "top"
  }
}

function clickableRowStyle(active = false): CSSProperties {
  return {
    cursor: "pointer",
    background: active ? "#fff7f7" : "#fff"
  }
}

function truncate(value: string, max = 24) {
  if (value.length <= max) return value

  return `${value.slice(0, max)}...`
}

function sanitizeFilters(filters: FilterState): FilterState {
  const safeLimit =
    filters.limit.trim() === ""
      ? "200"
      : String(Math.max(1, Math.min(1000, Number(filters.limit) || 200)))

  const safeMinWeight =
    filters.minWeight.trim() === ""
      ? ""
      : String(Math.max(0, Math.min(100, Number(filters.minWeight) || 0)))

  const safeLastHours =
    filters.lastHours.trim() === ""
      ? ""
      : String(Math.max(1, Math.min(24 * 365, Number(filters.lastHours) || 24)))

  let safeDateFrom = filters.dateFrom
  let safeDateTo = filters.dateTo

  if (safeDateFrom && safeDateTo && safeDateFrom > safeDateTo) {
    ;[safeDateFrom, safeDateTo] = [safeDateTo, safeDateFrom]
  }

  return {
    ...filters,
    relation: filters.relation.trim(),
    nodeId: filters.nodeId.trim(),
    limit: safeLimit,
    minWeight: safeMinWeight,
    lastHours: safeLastHours,
    dateFrom: safeDateFrom,
    dateTo: safeDateTo
  }
}

function buildQueryString(filters: FilterState) {
  const params = new URLSearchParams()

  if (filters.risk) params.set("risk", filters.risk)
  if (filters.relation) params.set("relation", filters.relation)
  if (filters.nodeType) params.set("nodeType", filters.nodeType)
  if (filters.nodeId) params.set("nodeId", filters.nodeId)
  if (filters.minWeight) params.set("minWeight", filters.minWeight)
  if (filters.limit) params.set("limit", filters.limit)
  if (filters.dateFrom) params.set("dateFrom", filters.dateFrom)
  if (filters.dateTo) params.set("dateTo", filters.dateTo)
  if (filters.lastHours) params.set("lastHours", filters.lastHours)

  return params.toString()
}

function buildEdgeKey(edge: GraphEdge | TrustGraphEdge) {
  const sourceId =
    typeof edge.source === "string"
      ? edge.source
      : edge.source.id

  const targetId =
    typeof edge.target === "string"
      ? edge.target
      : edge.target.id

  return edge.id ?? `${sourceId}->${targetId}:${edge.relation ?? "link"}`
}

export default function TrustNetworkPage() {
  const [draftFilters, setDraftFilters] =
    useState<FilterState>(DEFAULT_FILTERS)

  const [appliedFilters, setAppliedFilters] =
    useState<FilterState>(DEFAULT_FILTERS)

  const [data, setData] = useState<TrustResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [selected, setSelected] =
    useState<SelectedGraphItem>(null)

  const [focusedClusterId, setFocusedClusterId] =
    useState<string | null>(null)

  const [highlightedNodeId, setHighlightedNodeId] =
    useState<string | null>(null)

  const [highlightedEdgeId, setHighlightedEdgeId] =
    useState<string | null>(null)

  const nodeRowRefs =
    useRef<Record<string, HTMLTableRowElement | null>>({})

  const edgeRowRefs =
    useRef<Record<string, HTMLTableRowElement | null>>({})

  const queryString = useMemo(
    () => buildQueryString(appliedFilters),
    [appliedFilters]
  )

  const loadData = useCallback(
    async (signal?: AbortSignal) => {
      try {
        setLoading(true)
        setError("")

        const url = queryString
          ? `/api/trust/network?${queryString}`
          : "/api/trust/network"

        const res = await fetch(url, {
          cache: "no-store",
          signal
        })

        const json = (await res.json()) as TrustResponse

        if (!res.ok) {
          throw new Error("Falha ao carregar trust network")
        }

        setData(json)
      } catch (err) {
        if (signal?.aborted) return

        setError(
          err instanceof Error
            ? err.message
            : "Erro inesperado"
        )
      } finally {
        if (!signal?.aborted) {
          setLoading(false)
        }
      }
    },
    [queryString]
  )

  useEffect(() => {
    const controller = new AbortController()

    void loadData(controller.signal)

    return () => controller.abort()
  }, [loadData])

  useEffect(() => {
    setFocusedClusterId(null)
    setSelected(null)
    setHighlightedNodeId(null)
    setHighlightedEdgeId(null)
  }, [data])

  const topNodes = useMemo(() => {
    return [...(data?.nodes ?? [])]
      .sort((a, b) => b.score - a.score)
      .slice(0, 15)
  }, [data])

  const topClusters = useMemo(() => {
    return [...(data?.clusters ?? [])]
      .sort((a, b) => {
        if (b.highRiskEdges !== a.highRiskEdges) {
          return b.highRiskEdges - a.highRiskEdges
        }

        return b.avgWeight - a.avgWeight
      })
      .slice(0, 10)
  }, [data])

  const suspiciousEdges = useMemo(() => {
    return [...(data?.edges ?? [])]
      .filter(
        (edge) =>
          edge.risk === "HIGH" ||
          (edge.weight ?? 0) >= 70
      )
      .sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0))
      .slice(0, 20)
  }, [data])

  const focusedCluster = useMemo(() => {
    if (!focusedClusterId || !data) return null

    return (
      data.clusters.find(
        (cluster) => cluster.id === focusedClusterId
      ) ?? null
    )
  }, [focusedClusterId, data])

  const visibleNodes = useMemo(() => {
    if (!data) return []

    if (!focusedCluster) {
      return data.nodes
    }

    const nodeIds = new Set(focusedCluster.nodeIds)

    return data.nodes.filter((node) =>
      nodeIds.has(node.id)
    )
  }, [data, focusedCluster])

  const visibleEdges = useMemo(() => {
    if (!data) return []

    if (!focusedCluster) {
      return data.edges
    }

    const nodeIds = new Set(focusedCluster.nodeIds)
    const edgeIds = new Set(focusedCluster.edgeIds)

    return data.edges.filter((edge) => {
      const edgeId = buildEdgeKey(edge)

      return (
        edgeIds.has(edgeId) ||
        (nodeIds.has(edge.source) &&
          nodeIds.has(edge.target))
      )
    })
  }, [data, focusedCluster])

  const graphNodes: TrustGraphNode[] = useMemo(() => {
    return visibleNodes.map((node) => {
      const isHighlighted =
        highlightedNodeId === node.id

      return {
        id: node.id,
        label: truncate(node.id, 18),
        score: node.score,
        status: isHighlighted
          ? "HIGH_RISK"
          : node.label,
        reasons: node.reasons,
        metadata: {
          ...node.breakdown,
          full_id: node.id,
          focused_cluster_id:
            focusedCluster?.id ?? null,
          highlighted_from_table: isHighlighted
        }
      }
    })
  }, [
    visibleNodes,
    focusedCluster,
    highlightedNodeId
  ])

  const graphEdges: TrustGraphEdge[] = useMemo(() => {
    return visibleEdges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      relation: edge.relation,
      weight: edge.weight,
      risk: edge.risk,
      createdAt: edge.createdAt,
      metadata: edge.metadata
    }))
  }, [visibleEdges])

  function resetSelectionContext() {
    setFocusedClusterId(null)
    setHighlightedNodeId(null)
    setHighlightedEdgeId(null)
    setSelected(null)
  }

  function findClusterByNodeId(nodeId: string) {
    if (!data) return null

    return (
      data.clusters.find((cluster) =>
        cluster.nodeIds.includes(nodeId)
      ) ?? null
    )
  }

  function findClusterByEdgeId(edgeId: string) {
    if (!data) return null

    return (
      data.clusters.find((cluster) =>
        cluster.edgeIds.includes(edgeId)
      ) ?? null
    )
  }

  function updateDraft<K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) {
    setDraftFilters((prev) => ({
      ...prev,
      [key]: value
    }))
  }

  function focusCluster(clusterId: string) {
    setFocusedClusterId(clusterId)
    setHighlightedNodeId(null)
    setHighlightedEdgeId(null)
    setSelected(null)
  }

  function clearClusterFocus() {
    resetSelectionContext()
  }

  function highlightNode(nodeId: string) {
    setHighlightedNodeId(nodeId)
    setHighlightedEdgeId(null)

    const cluster = findClusterByNodeId(nodeId)

    setFocusedClusterId(cluster?.id ?? null)

    setSelected({
      kind: "node",
      data:
        graphNodes.find(
          (node) => node.id === nodeId
        ) ??
        ({
          id: nodeId,
          label: nodeId
        } as TrustGraphNode)
    })
  }

  function clearNodeHighlight() {
    resetSelectionContext()
  }

  function highlightEdge(edgeId: string) {
    setHighlightedEdgeId(edgeId)
    setHighlightedNodeId(null)

    const cluster = findClusterByEdgeId(edgeId)

    setFocusedClusterId(cluster?.id ?? null)

    const edge =
      graphEdges.find(
        (item) => buildEdgeKey(item) === edgeId
      ) ?? null

    if (edge) {
      setSelected({
        kind: "edge",
        data: edge
      })
    } else {
      setSelected(null)
    }
  }

  function clearEdgeHighlight() {
    resetSelectionContext()
  }

  function applyFilters() {
    resetSelectionContext()

    setAppliedFilters(
      sanitizeFilters(draftFilters)
    )
  }

  function clearFilters() {
    resetSelectionContext()

    setDraftFilters(DEFAULT_FILTERS)
    setAppliedFilters(DEFAULT_FILTERS)
  }

  function applyCritical24hPreset() {
    const next = sanitizeFilters({
      ...draftFilters,
      risk: "HIGH",
      lastHours: "24"
    })

    resetSelectionContext()

    setDraftFilters(next)
    setAppliedFilters(next)
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f9fafb",
        padding: 24
      }}
    >
      <div
        style={{
          maxWidth: 1440,
          margin: "0 auto",
          display: "grid",
          gap: 20
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 32,
              fontWeight: 700
            }}
          >
            Trust Graph & Fraud Intelligence
          </h1>

          <p
            style={{
              marginTop: 8,
              color: "#6b7280",
              fontSize: 15
            }}
          >
            Monitoramento de risco,
            clusters suspeitos e score
            avançado da rede DOOHPLAY.
          </p>
        </div>

        <div
          style={{
            ...cardStyle(),
            display: "grid",
            gap: 12
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 12
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: 6,
                  fontSize: 12,
                  color: "#6b7280"
                }}
              >
                Risk
              </label>

              <select
                value={draftFilters.risk}
                onChange={(e) =>
                  updateDraft(
                    "risk",
                    e.target.value
                  )
                }
                style={inputStyle()}
              >
                <option value="">Todos</option>
                <option value="HIGH">
                  HIGH
                </option>
                <option value="MEDIUM">
                  MEDIUM
                </option>
                <option value="LOW">
                  LOW
                </option>
              </select>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap"
            }}
          >
            <button
              onClick={applyFilters}
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                border: "none",
                background: "#111827",
                color: "#fff",
                cursor: "pointer",
                fontWeight: 600
              }}
            >
              Aplicar filtros
            </button>

            <button
              onClick={clearFilters}
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                border: "1px solid #d1d5db",
                background: "#fff",
                cursor: "pointer",
                fontWeight: 600
              }}
            >
              Limpar
            </button>

            <button
              onClick={applyCritical24hPreset}
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                border: "1px solid #d1d5db",
                background: "#fff",
                cursor: "pointer",
                fontWeight: 600
              }}
            >
              Últimas 24h críticas
            </button>

            {focusedCluster && (
              <button
                onClick={clearClusterFocus}
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1px solid #fecaca",
                  background: "#fff7f7",
                  color: "#b91c1c",
                  cursor: "pointer",
                  fontWeight: 600
                }}
              >
                Sair do foco do cluster
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div style={cardStyle()}>
            Carregando trust network...
          </div>
        ) : error ? (
          <div
            style={{
              ...cardStyle(),
              borderColor: "#fecaca",
              color: "#b91c1c"
            }}
          >
            {error}
          </div>
        ) : !data ? (
          <div style={cardStyle()}>
            Nenhum dado encontrado.
          </div>
        ) : (
          <>
            <TrustGraphCanvas
              nodes={graphNodes}
              edges={graphEdges}
              height={760}
            />
          </>
        )}
      </div>
    </div>
  )
}