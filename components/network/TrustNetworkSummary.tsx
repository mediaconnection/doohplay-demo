type TrustNetworkSummaryData = {
  totalNodes: number
  totalEdges: number
  highRiskNodes: number
  watchNodes: number
  suspiciousClusters: number
  highSeverityClusters?: number
  mediumSeverityClusters?: number
}

type TrustNetworkSummaryProps = {
  analysis: {
    summary: TrustNetworkSummaryData
  }
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

function StatCard({
  label,
  value,
  tone = "slate"
}: {
  label: string
  value: number
  tone?: "slate" | "red" | "amber" | "emerald"
}) {
  return (
    <div className={`rounded-2xl border p-4 ${statTone(tone)}`}>
      <div className="text-xs font-medium uppercase tracking-wide opacity-80">
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold">
        {safeCount(value)}
      </div>
    </div>
  )
}

export default function TrustNetworkSummary({
  analysis
}: TrustNetworkSummaryProps) {
  const summary = analysis?.summary

  return (
    <section
      aria-label="Resumo da Trust Network"
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-7"
    >
      <StatCard
        label="Nós"
        value={safeCount(summary?.totalNodes)}
        tone="slate"
      />
      <StatCard
        label="Arestas"
        value={safeCount(summary?.totalEdges)}
        tone="slate"
      />
      <StatCard
        label="High Risk"
        value={safeCount(summary?.highRiskNodes)}
        tone="red"
      />
      <StatCard
        label="Watch"
        value={safeCount(summary?.watchNodes)}
        tone="amber"
      />
      <StatCard
        label="Clusters suspeitos"
        value={safeCount(summary?.suspiciousClusters)}
        tone="emerald"
      />
      <StatCard
        label="Clusters HIGH"
        value={safeCount(summary?.highSeverityClusters)}
        tone="red"
      />
      <StatCard
        label="Clusters MEDIUM"
        value={safeCount(summary?.mediumSeverityClusters)}
        tone="amber"
      />
    </section>
  )
}