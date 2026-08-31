// @ts-nocheck
"use client"
/**
 * @deprecated Este componente é inalcançável em runtime.
 *
 * next.config.ts define alias de webpack explícito:
 *   "@/components/trust": path.resolve(__dirname, "components/trust")
 * Ou seja, @/components/trust/... sempre resolve para components/trust/
 * (raiz), nunca para este arquivo em src/components/trust/, mesmo tendo
 * o mesmo nome — inclusive imports internos desta própria pasta (ex:
 * TrustGraphContainer.tsx importa "@/components/trust/TrustGraph", que
 * também cai na versão da raiz, não no irmão local). Achado do
 * levantamento de 2026-08-30 pra Etapa 2 do
 * DOOHPLAY_Plano_Separacao_Fronts.docx.
 *
 * Não editar nem estender aqui. Se precisar mexer no Trust Graph de
 * verdade, é em components/trust/ (raiz).
 */

export type TrustGraphVisibleSummary = {
  totalNodes: number
  totalEdges: number
  highRiskNodes: number
  watchNodes: number
}

export type TrustGraphClusterNodeView = {
  id: string
  label: string
  risk: "SAFE" | "WATCH" | "HIGH_RISK"
  score: number
  reasons: string[]
}

type TrustGraphSidebarProps = {
  visibleSummary: TrustGraphVisibleSummary
  analysisSummary: {
    totalNodes: number
    totalEdges: number
    highRiskNodes: number
    watchNodes: number
    suspiciousClusters: number
    highSeverityClusters?: number
    mediumSeverityClusters?: number
  }
  searchTerm: string
  riskFilter: "ALL" | "SAFE" | "WATCH" | "HIGH_RISK"
  showOnlyActiveCluster: boolean
  filteredNodesCount: number
  activeClusterIndex: number | null
  selectedClusterNodes: TrustGraphClusterNodeView[]
  onNodeClick: (nodeId: string) => void
}

function safeCount(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0
}

function statTone(
  tone: "slate" | "red" | "amber" | "emerald"
): string {
  switch (tone) {
    case "red":
      return "border-red-200 bg-red-50 text-red-700"
    case "amber":
      return "border-amber-200 bg-amber-50 text-amber-700"
    case "emerald":
      return "border-emerald-200 bg-emerald-50 text-emerald-700"
    default:
      return "border-slate-200 bg-slate-50 text-slate-700"
  }
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

function truncate(value: string, max = 40): string {
  const trimmed = value.trim()
  if (trimmed.length <= max) return trimmed
  return `${trimmed.slice(0, max - 1)}…`
}

function StatCard({
  label,
  value,
  tone
}: {
  label: string
  value: number
  tone: "slate" | "red" | "amber" | "emerald"
}) {
  return (
    <div className={`rounded-2xl border p-3 ${statTone(tone)}`}>
      <div className="text-[11px] font-medium uppercase tracking-wide opacity-80">
        {label}
      </div>
      <div className="mt-1 text-xl font-semibold">{safeCount(value)}</div>
    </div>
  )
}

function SummaryRow({
  label,
  value
}: {
  label: string
  value: string | number
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-slate-700">{label}</span>
      <span className="max-w-[55%] break-words text-right font-medium text-slate-900">
        {value}
      </span>
    </div>
  )
}

export default function TrustGraphSidebar({
  visibleSummary,
  analysisSummary,
  searchTerm,
  riskFilter,
  showOnlyActiveCluster,
  filteredNodesCount,
  activeClusterIndex,
  selectedClusterNodes,
  onNodeClick
}: TrustGraphSidebarProps) {
  return (
    <aside className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div>
        <h3 className="text-sm font-semibold text-slate-900">
          Resumo do grafo
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          Visão consolidada do filtro atual e do dataset completo.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <StatCard
          label="Nós visíveis"
          value={visibleSummary.totalNodes}
          tone="slate"
        />
        <StatCard
          label="Arestas visíveis"
          value={visibleSummary.totalEdges}
          tone="slate"
        />
        <StatCard
          label="High Risk"
          value={visibleSummary.highRiskNodes}
          tone="red"
        />
        <StatCard
          label="Watch"
          value={visibleSummary.watchNodes}
          tone="amber"
        />
      </div>

      <div className="rounded-2xl border border-slate-200 p-4">
        <div className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">
          Dataset completo
        </div>

        <div className="grid gap-2 text-sm text-slate-700">
          <SummaryRow label="Total de nós" value={safeCount(analysisSummary.totalNodes)} />
          <SummaryRow label="Total de arestas" value={safeCount(analysisSummary.totalEdges)} />
          <SummaryRow label="High risk nodes" value={safeCount(analysisSummary.highRiskNodes)} />
          <SummaryRow label="Watch nodes" value={safeCount(analysisSummary.watchNodes)} />
          <SummaryRow label="Clusters suspeitos" value={safeCount(analysisSummary.suspiciousClusters)} />
          <SummaryRow label="Clusters HIGH" value={safeCount(analysisSummary.highSeverityClusters)} />
          <SummaryRow label="Clusters MEDIUM" value={safeCount(analysisSummary.mediumSeverityClusters)} />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 p-4">
        <div className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">
          Estado dos filtros
        </div>

        <div className="grid gap-2 text-sm text-slate-700">
          <SummaryRow label="Busca" value={searchTerm.trim() || "—"} />
          <SummaryRow label="Risco" value={riskFilter} />
          <SummaryRow
            label="Somente cluster ativo"
            value={showOnlyActiveCluster ? "Sim" : "Não"}
          />
          <SummaryRow label="Nós filtrados" value={safeCount(filteredNodesCount)} />
        </div>
      </div>

      <div
        className="rounded-2xl border border-slate-200 p-4"
        aria-live="polite"
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Cluster ativo
          </div>
          <div className="text-xs text-slate-500">
            {activeClusterIndex !== null ? `#${activeClusterIndex + 1}` : "nenhum"}
          </div>
        </div>

        {selectedClusterNodes.length === 0 ? (
          <div className="text-sm text-slate-500">
            Nenhum cluster ativo selecionado.
          </div>
        ) : (
          <div className="max-h-[420px] space-y-2 overflow-auto pr-1">
            {selectedClusterNodes.map((node) => (
              <button
                key={node.id}
                type="button"
                onClick={() => onNodeClick(node.id)}
                className="block w-full rounded-xl border border-slate-200 p-3 text-left transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300"
                aria-label={`Ir para nó ${node.label}, risco ${node.risk}, score ${node.score}`}
                title={node.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-slate-900">
                      {truncate(node.label, 44)}
                    </div>
                    <div className="mt-1 truncate text-xs text-slate-500">
                      {node.id}
                    </div>
                  </div>

                  <span
                    className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${riskBadgeClass(node.risk)}`}
                  >
                    {node.risk}
                  </span>
                </div>

                <div className="mt-2 text-xs text-slate-600">
                  Score: <span className="font-medium">{safeCount(node.score)}</span>
                </div>

                {node.reasons.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {node.reasons.slice(0, 3).map((reason) => (
                      <span
                        key={reason}
                        className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700"
                      >
                        {truncate(reason, 28)}
                      </span>
                    ))}
                  </div>
                ) : null}
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  )
}
