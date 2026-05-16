"use client"

import React, { useEffect, useMemo, useState } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Badge from "@/components/ui/Badge"
import { Progress } from "@/components/ui/progress"

import { buildForceGraph } from "@/lib/trust-graph/layout"
import { detectFraudClusters } from "@/lib/trust-graph/fraud"
import { fraudScore } from "@/lib/trust-graph/metrics"

type RiskLevel = "LOW" | "MEDIUM" | "HIGH"
type Severity = "LOW" | "MEDIUM" | "HIGH"

type GraphNode = {
  id: string
  label: string
  type: "campaign"
  advertiser_id: string | null
  advertiser_name: string | null
  trust_score_avg: number
  risk_level: RiskLevel
  total_events: number
  failed_events: number
  warning_events: number
}

type GraphEdge = {
  source: string
  target: string
  weight: number
  reasons: string[]
  risk: RiskLevel
}

type GraphAlert = {
  severity: Severity
  type: string
  campaigns: string[]
  message: string
}

type GraphResponse = {
  nodes: GraphNode[]
  edges: GraphEdge[]
  alerts: GraphAlert[]
  meta?: {
    total_nodes?: number
    total_edges?: number
    total_alerts?: number
  }
}

type NodePosition = {
  x: number
  y: number
}

const fallbackData: GraphResponse = {
  nodes: [
    {
      id: "cmp_1001",
      label: "Campaign cmp_1001",
      type: "campaign",
      advertiser_id: "adv_1",
      advertiser_name: "Nike",
      trust_score_avg: 61,
      risk_level: "MEDIUM",
      total_events: 42,
      failed_events: 8,
      warning_events: 10
    },
    {
      id: "cmp_1002",
      label: "Campaign cmp_1002",
      type: "campaign",
      advertiser_id: "adv_2",
      advertiser_name: "Coca-Cola",
      trust_score_avg: 31,
      risk_level: "HIGH",
      total_events: 29,
      failed_events: 12,
      warning_events: 7
    },
    {
      id: "cmp_1003",
      label: "Campaign cmp_1003",
      type: "campaign",
      advertiser_id: "adv_3",
      advertiser_name: "Samsung",
      trust_score_avg: 89,
      risk_level: "LOW",
      total_events: 58,
      failed_events: 1,
      warning_events: 4
    },
    {
      id: "cmp_1004",
      label: "Campaign cmp_1004",
      type: "campaign",
      advertiser_id: "adv_4",
      advertiser_name: "Magazine Luiza",
      trust_score_avg: 27,
      risk_level: "HIGH",
      total_events: 36,
      failed_events: 15,
      warning_events: 5
    },
    {
      id: "cmp_1005",
      label: "Campaign cmp_1005",
      type: "campaign",
      advertiser_id: "adv_1",
      advertiser_name: "Nike",
      trust_score_avg: 57,
      risk_level: "MEDIUM",
      total_events: 33,
      failed_events: 7,
      warning_events: 9
    }
  ],
  edges: [
    {
      source: "cmp_1001",
      target: "cmp_1002",
      weight: 75,
      reasons: ["SHARED_MERKLE_ROOT", "SHARED_BLOCKCHAIN_TX"],
      risk: "HIGH"
    },
    {
      source: "cmp_1001",
      target: "cmp_1005",
      weight: 45,
      reasons: ["SAME_ADVERTISER", "SCORE_PATTERN_SIMILARITY"],
      risk: "MEDIUM"
    },
    {
      source: "cmp_1002",
      target: "cmp_1004",
      weight: 68,
      reasons: ["CORRELATED_FAILURE_PATTERN", "SHARED_CONTRACT"],
      risk: "HIGH"
    },
    {
      source: "cmp_1003",
      target: "cmp_1005",
      weight: 18,
      reasons: ["SCORE_PATTERN_SIMILARITY"],
      risk: "LOW"
    }
  ],
  alerts: [
    {
      severity: "HIGH",
      type: "SUSPICIOUS_CAMPAIGN_LINK",
      campaigns: ["cmp_1001", "cmp_1002"],
      message:
        "Campaigns cmp_1001 and cmp_1002 share suspicious proof patterns."
    },
    {
      severity: "HIGH",
      type: "SUSPICIOUS_CAMPAIGN_LINK",
      campaigns: ["cmp_1002", "cmp_1004"],
      message:
        "Campaigns cmp_1002 and cmp_1004 show correlated failure behavior."
    }
  ],
  meta: {
    total_nodes: 5,
    total_edges: 4,
    total_alerts: 2
  }
}

function riskBadgeVariant(risk: RiskLevel | Severity) {
  if (risk === "LOW") return "green"
  if (risk === "MEDIUM") return "yellow"
  return "red"
}

function nodeClasses(risk: RiskLevel, selected: boolean) {
  const base = "rounded-2xl border p-3 shadow-sm transition-all"
  const selectedRing = selected ? " ring-2 ring-slate-900" : ""

  if (risk === "LOW") {
    return `${base} bg-emerald-50 border-emerald-200 ${selectedRing}`
  }

  if (risk === "MEDIUM") {
    return `${base} bg-amber-50 border-amber-200 ${selectedRing}`
  }

  return `${base} bg-rose-50 border-rose-200 ${selectedRing}`
}

function edgeColor(risk: RiskLevel) {
  if (risk === "LOW") return "#94a3b8"
  if (risk === "MEDIUM") return "#f59e0b"
  return "#ef4444"
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function isRiskLevel(value: unknown): value is RiskLevel {
  return value === "LOW" || value === "MEDIUM" || value === "HIGH"
}

function isSeverity(value: unknown): value is Severity {
  return value === "LOW" || value === "MEDIUM" || value === "HIGH"
}

function isGraphNode(value: unknown): value is GraphNode {
  if (!value || typeof value !== "object") return false
  const node = value as GraphNode

  return (
    typeof node.id === "string" &&
    typeof node.label === "string" &&
    node.type === "campaign" &&
    typeof node.trust_score_avg === "number" &&
    isRiskLevel(node.risk_level) &&
    typeof node.total_events === "number" &&
    typeof node.failed_events === "number" &&
    typeof node.warning_events === "number"
  )
}

function isGraphEdge(value: unknown): value is GraphEdge {
  if (!value || typeof value !== "object") return false
  const edge = value as GraphEdge

  return (
    typeof edge.source === "string" &&
    typeof edge.target === "string" &&
    typeof edge.weight === "number" &&
    Array.isArray(edge.reasons) &&
    isRiskLevel(edge.risk)
  )
}

function isGraphAlert(value: unknown): value is GraphAlert {
  if (!value || typeof value !== "object") return false
  const alert = value as GraphAlert

  return (
    isSeverity(alert.severity) &&
    typeof alert.type === "string" &&
    Array.isArray(alert.campaigns) &&
    typeof alert.message === "string"
  )
}

function normalizeGraphResponse(json: unknown): GraphResponse {
  if (!json || typeof json !== "object") {
    return fallbackData
  }

  const data = json as Partial<GraphResponse>

  return {
    nodes: Array.isArray(data.nodes)
      ? data.nodes.filter(isGraphNode)
      : fallbackData.nodes,
    edges: Array.isArray(data.edges)
      ? data.edges.filter(isGraphEdge)
      : fallbackData.edges,
    alerts: Array.isArray(data.alerts)
      ? data.alerts.filter(isGraphAlert)
      : fallbackData.alerts,
    meta:
      data.meta && typeof data.meta === "object"
        ? data.meta
        : fallbackData.meta
  }
}

function prettifyReason(reason: string) {
  return reason.replaceAll("_", " ").toLowerCase()
}

export default function TrustGraphPage() {
  const [data, setData] = useState<GraphResponse>(fallbackData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [riskFilter, setRiskFilter] = useState<"all" | RiskLevel>("all")
  const [search, setSearch] = useState("")
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

  async function loadGraph(signal?: AbortSignal) {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/trust/graph", {
        cache: "no-store",
        signal
      })

      if (!res.ok) {
        throw new Error(`Trust graph API error: ${res.status}`)
      }

      const json = await res.json()
      setData(normalizeGraphResponse(json))
    } catch (err) {
      if (signal?.aborted) return

      setData(fallbackData)
      setError(
        err instanceof Error ? err.message : "Falha ao carregar o grafo real"
      )
    } finally {
      if (!signal?.aborted) {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    void loadGraph(controller.signal)

    return () => controller.abort()
  }, [])

  const filteredNodes = useMemo(() => {
    return data.nodes.filter((node) => {
      const matchesRisk =
        riskFilter === "all" || node.risk_level === riskFilter

      const matchesSearch = [node.id, node.label, node.advertiser_name ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())

      return matchesRisk && matchesSearch
    })
  }, [data.nodes, riskFilter, search])

  const visibleNodeIds = useMemo(
    () => new Set(filteredNodes.map((node) => node.id)),
    [filteredNodes]
  )

  const filteredEdges = useMemo(() => {
    return data.edges.filter(
      (edge) =>
        visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)
    )
  }, [data.edges, visibleNodeIds])

  useEffect(() => {
    if (selectedNodeId && !visibleNodeIds.has(selectedNodeId)) {
      setSelectedNodeId(null)
    }
  }, [selectedNodeId, visibleNodeIds])

  const positions = useMemo<Record<string, NodePosition>>(() => {
    if (filteredNodes.length === 0) return {}

    return buildForceGraph(filteredNodes, filteredEdges) as Record<
      string,
      NodePosition
    >
  }, [filteredNodes, filteredEdges])

  const fraudClusters = useMemo(() => {
    return detectFraudClusters(filteredNodes, filteredEdges)
  }, [filteredNodes, filteredEdges])

  const selectedNode = useMemo(
    () => filteredNodes.find((node) => node.id === selectedNodeId) ?? null,
    [filteredNodes, selectedNodeId]
  )

  const relatedEdges = useMemo(() => {
    if (!selectedNodeId) return []

    return filteredEdges.filter(
      (edge) =>
        edge.source === selectedNodeId || edge.target === selectedNodeId
    )
  }, [filteredEdges, selectedNodeId])

  const graphStats = useMemo(() => {
    const highRiskNodes = filteredNodes.filter(
      (node) => node.risk_level === "HIGH"
    ).length

    const mediumRiskNodes = filteredNodes.filter(
      (node) => node.risk_level === "MEDIUM"
    ).length

    const highRiskEdges = filteredEdges.filter(
      (edge) => edge.risk === "HIGH"
    ).length

    return {
      totalNodes: filteredNodes.length,
      totalEdges: filteredEdges.length,
      highRiskNodes,
      mediumRiskNodes,
      highRiskEdges
    }
  }, [filteredNodes, filteredEdges])

  const selectedFraudScore = useMemo(() => {
    if (!selectedNode) return 0
    return fraudScore(selectedNode, filteredEdges)
  }, [selectedNode, filteredEdges])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl p-6 md:p-8">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-xs text-slate-600 shadow-sm">
              Trust Graph · Fraud Detection
            </div>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              Trust Graph entre campanhas
            </h1>

            <p className="mt-2 max-w-3xl text-sm text-slate-600 md:text-base">
              Visualize relações suspeitas entre campanhas com base em Merkle
              roots compartilhadas, contratos repetidos, transações coincidentes
              e padrões correlacionados de falha.
            </p>
          </div>

          <Button
            className="rounded-2xl border bg-white px-4 py-2"
            onClick={() => void loadGraph()}
            disabled={loading}
          >
            {loading ? "Atualizando..." : "Atualizar grafo"}
          </Button>
        </div>

        {error ? (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Não foi possível carregar dados reais. Exibindo modelo de
            demonstração. Motivo: {error}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-5">
              <p className="text-sm text-slate-500">Campanhas visíveis</p>
              <h3 className="mt-2 text-3xl font-semibold tracking-tight">
                {graphStats.totalNodes}
              </h3>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-5">
              <p className="text-sm text-slate-500">Conexões suspeitas</p>
              <h3 className="mt-2 text-3xl font-semibold tracking-tight">
                {graphStats.totalEdges}
              </h3>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-5">
              <p className="text-sm text-slate-500">Nós de alto risco</p>
              <h3 className="mt-2 text-3xl font-semibold tracking-tight">
                {graphStats.highRiskNodes}
              </h3>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-5">
              <p className="text-sm text-slate-500">Arestas críticas</p>
              <h3 className="mt-2 text-3xl font-semibold tracking-tight">
                {graphStats.highRiskEdges}
              </h3>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.7fr_1fr]">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                Mapa de relações
              </CardTitle>
            </CardHeader>

            <CardContent className="p-4">
              <div className="mb-4 grid gap-3 md:grid-cols-3">
                <div className="relative md:col-span-2">
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar campanha ou anunciante"
                    className="rounded-2xl pl-4"
                  />
                </div>

                <select
                  value={riskFilter}
                  onChange={(e) =>
                    setRiskFilter(e.target.value as "all" | RiskLevel)
                  }
                  className="rounded-2xl border px-3 py-2"
                >
                  <option value="all">Todos os riscos</option>
                  <option value="LOW">Baixo</option>
                  <option value="MEDIUM">Médio</option>
                  <option value="HIGH">Alto</option>
                </select>
              </div>

              <div className="overflow-hidden rounded-2xl border bg-white p-2">
                {filteredNodes.length === 0 ? (
                  <div className="flex h-[520px] items-center justify-center text-sm text-slate-500">
                    Nenhuma campanha encontrada com os filtros atuais.
                  </div>
                ) : (
                  <svg viewBox="0 0 880 520" className="h-[520px] w-full">
                    {filteredEdges.map((edge, index) => {
                      const source = positions[edge.source]
                      const target = positions[edge.target]

                      if (!source || !target) return null

                      const isHighlighted =
                        !selectedNodeId ||
                        edge.source === selectedNodeId ||
                        edge.target === selectedNodeId

                      return (
                        <g
                          key={`${edge.source}-${edge.target}-${index}`}
                          opacity={isHighlighted ? 1 : 0.18}
                        >
                          <line
                            x1={source.x}
                            y1={source.y}
                            x2={target.x}
                            y2={target.y}
                            stroke={edgeColor(edge.risk)}
                            strokeWidth={clamp(
                              Math.log(edge.weight + 1) * 2,
                              1.5,
                              8
                            )}
                            strokeOpacity={edge.risk === "HIGH" ? 1 : 0.45}
                          />
                          <text
                            x={(source.x + target.x) / 2}
                            y={(source.y + target.y) / 2 - 6}
                            fontSize="10"
                            textAnchor="middle"
                            fill="#475569"
                          >
                            {edge.weight}
                          </text>
                        </g>
                      )
                    })}

                    {filteredNodes.map((node) => {
                      const point = positions[node.id]
                      if (!point) return null

                      const selected = selectedNodeId === node.id
                      const radius =
                        node.risk_level === "HIGH"
                          ? 32
                          : node.risk_level === "MEDIUM"
                            ? 28
                            : 24

                      const isFraudClusterNode = fraudClusters.some((cluster) =>
                        cluster.nodeIds.includes(node.id)
                      )

                      return (
                        <g
                          key={node.id}
                          onClick={() => setSelectedNodeId(node.id)}
                          className="cursor-pointer"
                        >
                          <circle
                            cx={point.x}
                            cy={point.y}
                            r={radius}
                            fill={
                              node.risk_level === "HIGH"
                                ? "#fee2e2"
                                : node.risk_level === "MEDIUM"
                                  ? "#fef3c7"
                                  : "#dcfce7"
                            }
                            stroke={
                              isFraudClusterNode || selected
                                ? "#0f172a"
                                : "#cbd5e1"
                            }
                            strokeWidth={
                              isFraudClusterNode ? 4 : selected ? 3 : 1.5
                            }
                          />
                          <text
                            x={point.x}
                            y={point.y + 4}
                            fontSize="11"
                            textAnchor="middle"
                            fill="#0f172a"
                            fontWeight="600"
                          >
                            {node.id.replace("cmp_", "")}
                          </text>
                        </g>
                      )
                    })}
                  </svg>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="rounded-2xl shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">
                  Campanha selecionada
                </CardTitle>
              </CardHeader>

              <CardContent className="p-5">
                {selectedNode ? (
                  <div className="space-y-4">
                    <div className={nodeClasses(selectedNode.risk_level, true)}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold">{selectedNode.label}</h3>
                          <p className="text-sm text-slate-600">
                            {selectedNode.advertiser_name ?? "Advertiser"}
                          </p>
                        </div>

                        <Badge variant={riskBadgeVariant(selectedNode.risk_level)}>
                          {selectedNode.risk_level}
                        </Badge>
                      </div>

                      <div className="mt-4 space-y-3">
                        <div>
                          <div className="mb-1 flex items-center justify-between text-sm">
                            <span>Trust score</span>
                            <span className="font-medium">
                              {selectedNode.trust_score_avg}
                            </span>
                          </div>
                          <Progress value={selectedNode.trust_score_avg} />
                        </div>

                        <div>
                          <div className="mb-1 flex items-center justify-between text-sm">
                            <span>Fraud score</span>
                            <span className="font-medium">
                              {selectedFraudScore}
                            </span>
                          </div>
                          <Progress value={selectedFraudScore} />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-center text-sm">
                      <div className="rounded-2xl border bg-white p-3">
                        <div className="text-slate-500">Eventos</div>
                        <div className="mt-1 text-xl font-semibold">
                          {selectedNode.total_events}
                        </div>
                      </div>

                      <div className="rounded-2xl border bg-white p-3">
                        <div className="text-slate-500">Falhas</div>
                        <div className="mt-1 text-xl font-semibold">
                          {selectedNode.failed_events}
                        </div>
                      </div>

                      <div className="rounded-2xl border bg-white p-3">
                        <div className="text-slate-500">Warnings</div>
                        <div className="mt-1 text-xl font-semibold">
                          {selectedNode.warning_events}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="mb-2 text-sm font-semibold">
                        Conexões relacionadas
                      </h4>

                      <div className="space-y-2">
                        {relatedEdges.length > 0 ? (
                          relatedEdges.map((edge, index) => {
                            const otherId =
                              edge.source === selectedNode.id
                                ? edge.target
                                : edge.source

                            return (
                              <div
                                key={`${otherId}-${index}`}
                                className="rounded-2xl border p-3 text-sm"
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <span className="font-medium">{otherId}</span>
                                  <Badge variant={riskBadgeVariant(edge.risk)}>
                                    {edge.risk}
                                  </Badge>
                                </div>

                                <div className="mt-2 text-slate-600">
                                  Peso: {edge.weight}
                                </div>

                                <div className="mt-1 text-xs text-slate-500">
                                  {edge.reasons.map(prettifyReason).join(" · ")}
                                </div>
                              </div>
                            )
                          })
                        ) : (
                          <div className="rounded-2xl border p-3 text-sm text-slate-500">
                            Nenhuma relação visível com os filtros atuais.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed p-6 text-sm text-slate-500">
                    Selecione um nó no grafo para ver detalhes da campanha e
                    suas conexões suspeitas.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">
                  Alertas do sistema
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3 p-5">
                {data.alerts.length > 0 ? (
                  data.alerts.slice(0, 6).map((alert, index) => (
                    <div
                      key={`${alert.type}-${index}`}
                      className="rounded-2xl border p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="font-medium text-slate-900">
                          {alert.type}
                        </div>

                        <Badge variant={riskBadgeVariant(alert.severity)}>
                          {alert.severity}
                        </Badge>
                      </div>

                      <p className="mt-2 text-sm text-slate-600">
                        {alert.message}
                      </p>

                      <p className="mt-2 text-xs text-slate-500">
                        {alert.campaigns.join(" · ")}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border p-4 text-sm text-slate-500">
                    Nenhum alerta disponível.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}