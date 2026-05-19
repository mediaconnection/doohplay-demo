"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import TrustGraphCanvas from "@/components/trust/TrustGraphCanvas"
import TrustNetworkSummary from "@/components/network/TrustNetworkSummary"
import { analyzeTrustNetwork } from "@/lib/trust-graph/analyzeTrustNetwork"

import type {
  GraphEdge,
  GraphNode,
  TrustGraphResponse
} from "@/lib/trust-graph/types"

type RouteSuccessResponse = { ok: true } & TrustGraphResponse

type RouteErrorResponse = {
  ok: false
  error: string
  message?: string
}

type RouteResponse = RouteSuccessResponse | RouteErrorResponse

const DEFAULT_HOURS = 720
const DEFAULT_LIMIT_NODES = 200
const DEFAULT_LIMIT_EDGES = 400

const TRUST_GRAPH_URL = `/api/trust/graph?hours=${DEFAULT_HOURS}&limitNodes=${DEFAULT_LIMIT_NODES}&limitEdges=${DEFAULT_LIMIT_EDGES}`

function isSuccessResponse(data: unknown): data is RouteSuccessResponse {
  if (!data || typeof data !== "object") return false

  const candidate = data as Partial<RouteSuccessResponse>

  return (
    candidate.ok === true &&
    Array.isArray(candidate.nodes) &&
    Array.isArray(candidate.edges) &&
    !!candidate.summary &&
    typeof candidate.summary === "object"
  )
}

function toGraphNodes(nodes: TrustGraphResponse["nodes"]): GraphNode[] {
  return nodes.map((node) => ({
    id: node.id,
    type: node.type,
    label: node.label,
    score: node.score,
    trust: typeof node.score === "number" ? node.score : undefined,
    metadata: node.metadata
  }))
}

function toGraphEdges(edges: TrustGraphResponse["edges"]): GraphEdge[] {
  return edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    relation: edge.relation,
    weight: edge.weight,
    risk: edge.risk,
    createdAt: edge.lastSeenAt ?? undefined,
    metadata: edge.metadata
  }))
}

function getErrorMessage(data: RouteResponse | null, fallback: string): string {
  if (
    data &&
    typeof data === "object" &&
    "message" in data &&
    typeof data.message === "string" &&
    data.message.trim().length > 0
  ) {
    return data.message
  }

  return fallback
}

export default function NetworkMapPage() {
  const [nodes, setNodes] = useState<GraphNode[]>([])
  const [edges, setEdges] = useState<GraphEdge[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadGraph = useCallback(async (signal?: AbortSignal) => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(TRUST_GRAPH_URL, {
        cache: "no-store",
        signal
      })

      let data: RouteResponse | null = null

      try {
        data = (await res.json()) as RouteResponse
      } catch {
        data = null
      }

      if (!res.ok) {
        throw new Error(getErrorMessage(data, "Falha ao carregar Trust Graph"))
      }

      if (!isSuccessResponse(data)) {
        throw new Error("Resposta inválida da API do Trust Graph")
      }

      setNodes(toGraphNodes(data.nodes))
      setEdges(toGraphEdges(data.edges))
    } catch (err) {
      if (signal?.aborted) return

      setError(err instanceof Error ? err.message : "Erro desconhecido")
      setNodes([])
      setEdges([])
    } finally {
      if (!signal?.aborted) {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    void loadGraph(controller.signal)

    return () => controller.abort()
  }, [loadGraph])

  const analysis = useMemo(() => {
    return analyzeTrustNetwork(nodes, edges)
  }, [nodes, edges])

  if (loading) {
    return (
      <main className="space-y-6 p-6">
        <h1 className="text-2xl font-semibold text-slate-900">
          Trust Network
        </h1>
        <p className="text-sm text-slate-500">
          Carregando dados reais do grafo...
        </p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="space-y-6 p-6">
        <h1 className="text-2xl font-semibold text-slate-900">
          Trust Network
        </h1>

        <p className="text-sm text-red-600">
          Erro ao carregar o grafo: {error}
        </p>

        <button
          type="button"
          onClick={() => void loadGraph()}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Tentar novamente
        </button>
      </main>
    )
  }

  return (
    <main className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Trust Network
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Visualização investigativa da rede de confiança com clusters, score e conexões.
        </p>
      </div>

      <TrustNetworkSummary analysis={analysis} />

      {nodes.length === 0 || edges.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
          Não há dados suficientes para montar o grafo no período selecionado.
        </div>
      ) : (
        <TrustGraphCanvas
          nodes={nodes}
          edges={edges}
          analysis={analysis}
          width={1200}
          height={720}
        />
      )}
    </main>
  )
}