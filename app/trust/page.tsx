"use client"

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"

import TrustGraphCanvas, {
  type GraphEdge,
  type GraphNode,
  type TrustNetworkAnalysis
} from "@/components/trust/TrustGraphCanvas"

type GraphAlert = {
  severity: "LOW" | "MEDIUM" | "HIGH"
  type: string
  campaigns: string[]
  message: string
}

type TrustGraphApiResponse = {
  nodes: GraphNode[]
  edges: GraphEdge[]
  alerts: GraphAlert[]
  analysis: TrustNetworkAnalysis
  meta: {
    total_nodes: number
    total_edges: number
    total_alerts: number
    query_limit: number
    generated_at: string
  }
}

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string; snapshot?: TrustGraphApiResponse }
  | { status: "success"; data: TrustGraphApiResponse }

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value))
}

function toNumber(value: unknown, fallback = 0): number {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : fallback
}

function getSummaryNumber(
  summary: unknown,
  key: string,
  fallback = 0
): number {
  if (!isRecord(summary)) return fallback
  return toNumber(summary[key], fallback)
}

function isValidTrustGraphResponse(data: unknown): data is TrustGraphApiResponse {
  if (!isRecord(data)) return false

  const analysis = data.analysis
  const meta = data.meta

  if (!isRecord(analysis) || !isRecord(meta)) return false

  return (
    Array.isArray(data.nodes) &&
    Array.isArray(data.edges) &&
    Array.isArray(data.alerts) &&
    Array.isArray(analysis.nodes) &&
    Array.isArray(analysis.clusters) &&
    isRecord(analysis.summary) &&
    typeof meta.generated_at === "string"
  )
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Erro inesperado ao carregar o Trust Graph"
}

function formatDateTime(value: string): string {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(date)
}

async function fetchTrustGraph(signal?: AbortSignal): Promise<TrustGraphApiResponse> {
  const res = await fetch("/api/trust/graph", {
    method: "GET",
    cache: "no-store",
    signal
  })

  if (!res.ok) {
    let message = `Falha ao carregar o Trust Graph (${res.status})`

    try {
      const errorBody = (await res.json()) as {
        message?: string
        error?: string
      }

      message = errorBody.message || errorBody.error || message
    } catch {
      // mantém mensagem padrão
    }

    throw new Error(message)
  }

  const data = (await res.json()) as unknown

  if (!isValidTrustGraphResponse(data)) {
    throw new Error("A API retornou um formato inválido para o Trust Graph.")
  }

  return {
    nodes: data.nodes,
    edges: data.edges,
    alerts: data.alerts,
    analysis: data.analysis as TrustNetworkAnalysis,
    meta: {
      total_nodes: toNumber(data.meta.total_nodes),
      total_edges: toNumber(data.meta.total_edges),
      total_alerts: toNumber(data.meta.total_alerts),
      query_limit: toNumber(data.meta.query_limit),
      generated_at: data.meta.generated_at
    }
  }
}

export default function TrustPage() {
  const [state, setState] = useState<LoadState>({ status: "loading" })
  const [isRefreshing, setIsRefreshing] = useState(false)

  const lastSuccessDataRef = useRef<TrustGraphApiResponse | undefined>(undefined)

  const loadGraph = useCallback(
    async (options?: { signal?: AbortSignal; preserveData?: boolean }) => {
      const preserveData = options?.preserveData ?? false
      const currentSnapshot = lastSuccessDataRef.current

      try {
        if (preserveData && currentSnapshot) {
          setIsRefreshing(true)
        } else {
          setState({ status: "loading" })
        }

        const data = await fetchTrustGraph(options?.signal)

        lastSuccessDataRef.current = data

        setState({
          status: "success",
          data
        })
      } catch (error) {
        if (options?.signal?.aborted) return

        setState({
          status: "error",
          message: getErrorMessage(error),
          snapshot: currentSnapshot
        })
      } finally {
        setIsRefreshing(false)
      }
    },
    []
  )

  useEffect(() => {
    const controller = new AbortController()
    void loadGraph({ signal: controller.signal })

    return () => {
      controller.abort()
    }
  }, [loadGraph])

  const activeData =
    state.status === "success"
      ? state.data
      : state.status === "error"
        ? state.snapshot
        : undefined

  const summary = activeData?.analysis?.summary

  const totalNodes = getSummaryNumber(summary, "totalNodes")
  const totalEdges = getSummaryNumber(summary, "totalEdges")
  const highRiskNodes = getSummaryNumber(summary, "highRiskNodes")
  const suspiciousClusters = getSummaryNumber(summary, "suspiciousClusters")

  const isEmpty = useMemo(() => {
    return Boolean(activeData && activeData.meta.total_nodes === 0)
  }, [activeData])

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: 24
      }}
    >
      <div
        style={{
          maxWidth: 1500,
          margin: "0 auto",
          display: "grid",
          gap: 16
        }}
      >
        <header
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: 20,
            padding: 20
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 12,
              flexWrap: "wrap"
            }}
          >
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: 28,
                  lineHeight: 1.1,
                  color: "#0f172a"
                }}
              >
                Trust Graph DOOHPLAY
              </h1>

              <p
                style={{
                  marginTop: 10,
                  marginBottom: 0,
                  color: "#475569",
                  fontSize: 14
                }}
              >
                Visualização de relações suspeitas com highlight de cluster inteiro,
                preview por hover, busca, filtros e seleção fixa por clique.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void loadGraph({ preserveData: true })}
              disabled={isRefreshing}
              style={{
                ...buttonStyle,
                opacity: isRefreshing ? 0.7 : 1,
                cursor: isRefreshing ? "not-allowed" : "pointer"
              }}
              aria-busy={isRefreshing}
              aria-live="polite"
            >
              {isRefreshing ? "Atualizando..." : "Atualizar"}
            </button>
          </div>
        </header>

        {state.status === "loading" && !activeData && (
          <section style={panelStyle}>Carregando Trust Graph...</section>
        )}

        {state.status === "error" && (
          <section
            style={{
              ...panelStyle,
              border: "1px solid #fecaca"
            }}
          >
            <h2
              style={{
                marginTop: 0,
                marginBottom: 8,
                fontSize: 18,
                color: "#991b1b"
              }}
            >
              Erro ao carregar o grafo
            </h2>

            <p
              style={{
                margin: 0,
                color: "#7f1d1d",
                fontSize: 14
              }}
            >
              {state.message}
            </p>

            {activeData && (
              <p
                style={{
                  marginTop: 10,
                  marginBottom: 0,
                  color: "#92400e",
                  fontSize: 13
                }}
              >
                Exibindo o último snapshot carregado com sucesso.
              </p>
            )}

            <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => void loadGraph({ preserveData: Boolean(activeData) })}
                disabled={isRefreshing}
                style={{
                  ...buttonStyle,
                  opacity: isRefreshing ? 0.7 : 1,
                  cursor: isRefreshing ? "not-allowed" : "pointer"
                }}
              >
                {isRefreshing ? "Tentando..." : "Tentar novamente"}
              </button>
            </div>
          </section>
        )}

        {activeData && (
          <>
            <section
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 12
              }}
            >
              <MetricCard label="Campanhas" value={totalNodes} />
              <MetricCard label="Conexões" value={totalEdges} />
              <MetricCard label="High Risk" value={highRiskNodes} />
              <MetricCard label="Clusters suspeitos" value={suspiciousClusters} />
            </section>

            <section style={panelStyle}>
              <div
                style={{
                  display: "flex",
                  gap: 16,
                  flexWrap: "wrap",
                  fontSize: 13,
                  color: "#475569"
                }}
              >
                <span>
                  Gerado em:{" "}
                  <strong>{formatDateTime(activeData.meta.generated_at)}</strong>
                </span>

                <span>
                  Limite da consulta: <strong>{activeData.meta.query_limit}</strong>
                </span>

                <span>
                  Alertas: <strong>{activeData.meta.total_alerts}</strong>
                </span>
              </div>
            </section>

            {isEmpty ? (
              <section style={panelStyle}>
                Nenhum dado disponível para montar o Trust Graph no momento.
              </section>
            ) : (
              <>
                {activeData.alerts.length > 0 && (
                  <section style={panelStyle}>
                    <h2
                      style={{
                        marginTop: 0,
                        marginBottom: 12,
                        fontSize: 18,
                        color: "#0f172a"
                      }}
                    >
                      Alertas
                    </h2>

                    <div style={{ display: "grid", gap: 10 }}>
                      {activeData.alerts.map((alert: GraphAlert, index: number) => (
                        <div
                          key={`${alert.type}-${index}`}
                          style={{
                            border: "1px solid #e2e8f0",
                            borderRadius: 14,
                            padding: 12,
                            background:
                              alert.severity === "HIGH"
                                ? "#fef2f2"
                                : alert.severity === "MEDIUM"
                                  ? "#fffbeb"
                                  : "#f8fafc"
                          }}
                        >
                          <div
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              marginBottom: 6,
                              color:
                                alert.severity === "HIGH"
                                  ? "#991b1b"
                                  : alert.severity === "MEDIUM"
                                    ? "#92400e"
                                    : "#334155"
                            }}
                          >
                            {alert.severity} · {alert.type}
                          </div>

                          <div
                            style={{
                              fontSize: 14,
                              color: "#334155"
                            }}
                          >
                            {alert.message}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                <TrustGraphCanvas
                  nodes={activeData.nodes}
                  edges={activeData.edges}
                  analysis={activeData.analysis}
                  height={760}
                />
              </>
            )}
          </>
        )}
      </div>
    </main>
  )
}

function MetricCard({
  label,
  value
}: {
  label: string
  value: number
}) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: 16,
        padding: 16
      }}
    >
      <div
        style={{
          fontSize: 12,
          color: "#64748b"
        }}
      >
        {label}
      </div>

      <div
        style={{
          marginTop: 6,
          fontSize: 24,
          fontWeight: 700,
          color: "#0f172a"
        }}
      >
        {value}
      </div>
    </div>
  )
}

const panelStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: 20,
  padding: 20
}

const buttonStyle: React.CSSProperties = {
  border: "1px solid #cbd5e1",
  background: "#fff",
  borderRadius: 10,
  padding: "8px 12px",
  fontSize: 13,
  cursor: "pointer"
}