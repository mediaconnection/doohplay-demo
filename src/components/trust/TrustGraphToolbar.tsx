// @ts-nocheck
"use client"

import React from "react"

export type TrustGraphRiskFilter = "ALL" | "SAFE" | "WATCH" | "HIGH_RISK"

export type TrustGraphQuickResult = {
  id: string
  label: string
  score: number
  risk: "SAFE" | "WATCH" | "HIGH_RISK"
}

type TrustGraphToolbarProps = {
  searchTerm: string
  riskFilter: TrustGraphRiskFilter
  quickResults: TrustGraphQuickResult[]
  activeClusterIndex: number | null
  showOnlyActiveCluster: boolean
  onSearchTermChange: (value: string) => void
  onRiskFilterChange: (value: TrustGraphRiskFilter) => void
  onToggleShowOnlyActiveCluster: () => void
  onResetView: () => void
  onClearSelection: () => void
  onQuickResultClick: (nodeId: string) => void
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

function truncate(value: string, max = 56) {
  const normalized = value.trim()
  if (normalized.length <= max) return normalized
  return `${normalized.slice(0, max - 1)}…`
}

function getButtonStyle(options?: {
  active?: boolean
  danger?: boolean
}): React.CSSProperties {
  const active = options?.active ?? false
  const danger = options?.danger ?? false

  return {
    border: "1px solid",
    borderColor: danger
      ? active
        ? "#fca5a5"
        : "#fecaca"
      : active
        ? "#93c5fd"
        : "#cbd5e1",
    background: danger
      ? active
        ? "#fee2e2"
        : "#fff"
      : active
        ? "#eff6ff"
        : "#fff",
    color: danger ? "#b91c1c" : "#0f172a",
    borderRadius: 10,
    padding: "8px 12px",
    fontSize: 13,
    cursor: "pointer",
    fontWeight: active ? 700 : 500
  }
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "1px solid #cbd5e1",
  background: "#fff",
  borderRadius: 10,
  padding: "10px 12px",
  fontSize: 13,
  outline: "none"
}

const resultButtonStyle: React.CSSProperties = {
  border: "1px solid #e2e8f0",
  background: "#fff",
  borderRadius: 12,
  padding: "10px 12px",
  textAlign: "left",
  cursor: "pointer"
}

export default function TrustGraphToolbar({
  searchTerm,
  riskFilter,
  quickResults,
  activeClusterIndex,
  showOnlyActiveCluster,
  onSearchTermChange,
  onRiskFilterChange,
  onToggleShowOnlyActiveCluster,
  onResetView,
  onClearSelection,
  onQuickResultClick
}: TrustGraphToolbarProps) {
  const hasSearch = searchTerm.trim().length > 0
  const hasQuickResults = quickResults.length > 0
  const hasActiveCluster = activeClusterIndex !== null

  return (
    <div
      style={{
        display: "grid",
        gap: 12,
        padding: "14px 16px",
        borderBottom: "1px solid #e2e8f0",
        background: "#f8fafc"
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap"
        }}
      >
        <div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>Trust Graph</div>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
            Hover faz preview, clique fixa, busca encontra nós e o cluster selecionado entra em foco.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            flexWrap: "wrap"
          }}
        >
          <button
            onClick={onResetView}
            style={getButtonStyle()}
            type="button"
            aria-label="Resetar posição e zoom do grafo"
            title="Resetar posição e zoom do grafo"
          >
            Resetar visão
          </button>

          {hasActiveCluster && (
            <button
              onClick={onToggleShowOnlyActiveCluster}
              style={getButtonStyle({ active: showOnlyActiveCluster })}
              type="button"
              aria-pressed={showOnlyActiveCluster}
              aria-label={
                showOnlyActiveCluster
                  ? "Mostrar todos os nós"
                  : "Mostrar apenas o cluster ativo"
              }
              title={
                showOnlyActiveCluster
                  ? "Mostrar todos os nós"
                  : "Mostrar apenas o cluster ativo"
              }
            >
              {showOnlyActiveCluster ? "Mostrar tudo" : "Só cluster ativo"}
            </button>
          )}

          {hasActiveCluster && (
            <button
              onClick={onClearSelection}
              style={getButtonStyle({ danger: true })}
              type="button"
              aria-label="Limpar seleção e highlight do cluster"
              title="Limpar seleção e highlight do cluster"
            >
              Limpar highlight
            </button>
          )}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 10
        }}
      >
        <input
          value={searchTerm}
          onChange={(event) => onSearchTermChange(event.target.value)}
          placeholder="Buscar por nó, label ou id..."
          aria-label="Buscar por nó, label ou id"
          autoComplete="off"
          spellCheck={false}
          style={inputStyle}
        />

        <select
          value={riskFilter}
          onChange={(event) => {
            const nextValue = event.target.value
            if (
              nextValue === "ALL" ||
              nextValue === "SAFE" ||
              nextValue === "WATCH" ||
              nextValue === "HIGH_RISK"
            ) {
              onRiskFilterChange(nextValue)
            }
          }}
          aria-label="Filtrar por risco"
          style={inputStyle}
        >
          <option value="ALL">Todos os riscos</option>
          <option value="HIGH_RISK">High Risk</option>
          <option value="WATCH">Watch</option>
          <option value="SAFE">Safe</option>
        </select>
      </div>

      {hasSearch && !hasQuickResults && (
        <div
          role="status"
          aria-live="polite"
          style={{
            border: "1px dashed #cbd5e1",
            borderRadius: 14,
            background: "#fff",
            padding: 12,
            fontSize: 13,
            color: "#64748b"
          }}
        >
          Nenhum nó encontrado com os filtros atuais.
        </div>
      )}

      {hasQuickResults && (
        <div
          style={{
            display: "grid",
            gap: 8,
            border: "1px solid #e2e8f0",
            borderRadius: 14,
            background: "#fff",
            padding: 10
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap"
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>
              Resultados da busca
            </div>
            <div style={{ fontSize: 12, color: "#64748b" }}>
              {quickResults.length} resultado(s)
            </div>
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            {quickResults.map((node) => (
              <button
                key={node.id}
                type="button"
                onClick={() => onQuickResultClick(node.id)}
                style={resultButtonStyle}
                aria-label={`Ir para ${node.label}, risco ${formatRiskLabel(node.risk)}, score ${node.score}`}
                title={node.id}
              >
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#0f172a"
                  }}
                >
                  {truncate(node.label, 52)}
                </div>

                <div
                  style={{
                    marginTop: 4,
                    fontSize: 12,
                    color: "#64748b",
                    wordBreak: "break-word"
                  }}
                >
                  {truncate(node.id, 72)} · {formatRiskLabel(node.risk)} · score {node.score}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
