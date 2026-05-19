import type { VerificationResult } from "./types"

type Props = {
  result: VerificationResult | null | undefined
  className?: string
}

type DomainStatus = "PASS" | "PARTIAL" | "FAIL" | "NOT_EVALUATED"
type FactorImpact = "positive" | "negative" | "neutral"

/* =========================
   HELPERS
========================= */

function statusClass(status?: string) {
  switch (status as DomainStatus) {
    case "PASS":
      return "border-emerald-200 bg-emerald-50 text-emerald-700"
    case "PARTIAL":
      return "border-amber-200 bg-amber-50 text-amber-700"
    case "FAIL":
      return "border-rose-200 bg-rose-50 text-rose-700"
    default:
      return "border-zinc-200 bg-zinc-50 text-zinc-600"
  }
}

function statusLabel(status?: string) {
  switch (status as DomainStatus) {
    case "PASS":
      return "Aprovado"
    case "PARTIAL":
      return "Parcial"
    case "FAIL":
      return "Reprovado"
    case "NOT_EVALUATED":
      return "Não avaliado"
    default:
      return status || "—"
  }
}

function impactClass(impact?: string) {
  return impact === "positive"
    ? "text-emerald-700"
    : impact === "negative"
      ? "text-rose-700"
      : "text-zinc-600"
}

function impactBulletClass(impact?: string) {
  return impact === "positive"
    ? "text-emerald-600"
    : impact === "negative"
      ? "text-rose-600"
      : "text-zinc-400"
}

function formatPoints(value?: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "0"
  return value > 0 ? `+${value}` : `${value}`
}

function formatTrustLevel(value?: string) {
  if (value === "HIGH") return "Alta confiança"
  if (value === "MEDIUM") return "Confiança moderada"
  if (value === "LOW") return "Baixa confiança"
  return value || "—"
}

function formatFactorValue(value: boolean | null | undefined) {
  if (value === true) return "sim"
  if (value === false) return "não"
  return "n/a"
}

function safeScore(value?: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) return 0
  return Math.max(0, Math.min(100, Math.round(value)))
}

function safePercent(score?: number, weight?: number) {
  if (
    typeof score !== "number" ||
    typeof weight !== "number" ||
    !Number.isFinite(score) ||
    !Number.isFinite(weight) ||
    weight <= 0
  ) {
    return 0
  }

  return Math.max(0, Math.min(100, Math.round((score / weight) * 100)))
}

function domainBarClass(status?: string) {
  switch (status as DomainStatus) {
    case "PASS":
      return "bg-emerald-500"
    case "PARTIAL":
      return "bg-amber-500"
    case "FAIL":
      return "bg-rose-500"
    default:
      return "bg-zinc-300"
  }
}

function safeStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return []

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function safeDomains(result: VerificationResult) {
  const domains = result.trust_score?.domains
  if (!Array.isArray(domains)) return []

  return domains.filter(
    (domain): domain is NonNullable<typeof domains[number]> =>
      isPlainObject(domain)
  )
}

/* =========================
   COMPONENT
========================= */

export default function TrustScoreBreakdown({
  result,
  className
}: Props) {
  const trustScore = result?.trust_score

  if (!trustScore && typeof result?.score !== "number") return null

  const finalScore = safeScore(trustScore?.final_score ?? result?.score)
  const trustLevel = trustScore?.trust_level ?? result?.trust_level ?? "LOW"
  const methodology = trustScore?.methodology ?? "verify-enterprise-v3"

  const summary =
    trustScore?.summary ??
    result?.summary ??
    "Sem resumo metodológico disponível."

  const domains = safeDomains(result ?? {})
  const strengths = safeStringList(trustScore?.strengths ?? result?.strengths)
  const penalties = safeStringList(trustScore?.penalties ?? result?.penalties)

  const evaluatedDomains = domains.filter(
    (d) => d?.status !== "NOT_EVALUATED"
  )

  const nonEvaluatedDomains = domains.filter(
    (d) => d?.status === "NOT_EVALUATED"
  )

  return (
    <section
      className={[
        "rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm",
        className ?? ""
      ].join(" ")}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900">
            Trust Score explicável
          </h2>
          <p className="mt-1 text-sm text-zinc-600">
            Breakdown auditável do score de confiança.
          </p>
        </div>

        <div className="rounded-2xl border bg-zinc-50 px-5 py-4">
          <div className="text-xs uppercase text-zinc-500">
            Score final
          </div>
          <div className="text-2xl font-bold text-zinc-900">
            {finalScore}/100
          </div>
          <div className="text-sm text-zinc-600">
            {formatTrustLevel(trustLevel)}
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border bg-zinc-50 p-4">
        <div className="text-sm font-semibold text-zinc-900">Resumo</div>
        <p className="mt-2 text-sm text-zinc-700">{summary}</p>
        <div className="mt-2 text-xs text-zinc-500">
          Methodology: {methodology}
        </div>
      </div>

      <div className="mt-5">
        {evaluatedDomains.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {evaluatedDomains.map((domain, idx) => {
              const percent = safePercent(domain.score, domain.weight)

              return (
                <article
                  key={`${domain.key}-${idx}`}
                  className="rounded-2xl border bg-zinc-50 p-4"
                >
                  <div className="flex justify-between gap-3">
                    <div>
                      <div className="font-semibold text-zinc-900">
                        {domain.label || domain.key}
                      </div>
                      <div className="text-xs text-zinc-500">
                        Peso {domain.weight ?? "—"}
                      </div>
                    </div>

                    <span
                      className={`rounded-full border px-2 py-1 text-xs ${statusClass(
                        domain.status
                      )}`}
                    >
                      {statusLabel(domain.status)}
                    </span>
                  </div>

                  <div className="mt-3 flex justify-between">
                    <div className="text-xl font-bold text-zinc-900">
                      {domain.score ?? 0}/{domain.weight ?? 0}
                    </div>
                    <div className="text-sm text-zinc-600">{percent}%</div>
                  </div>

                  <div className="mt-2 h-2 rounded-full bg-zinc-200">
                    <div
                      className={`h-full rounded-full ${domainBarClass(
                        domain.status
                      )}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <ul className="mt-3 space-y-2 text-sm">
                    {Array.isArray(domain.factors) &&
                      domain.factors.map((factor, i) => (
                        <li key={`${factor.code}-${i}`} className="flex gap-2">
                          <span className={impactBulletClass(factor.impact)}>
                            •
                          </span>
                          <div>
                            <div className={impactClass(factor.impact)}>
                              {factor.label}
                            </div>
                            <div className="text-xs text-zinc-500">
                              {formatFactorValue(factor.value)} ·{" "}
                              {formatPoints(factor.points)}
                            </div>
                          </div>
                        </li>
                      ))}
                  </ul>
                </article>
              )
            })}
          </div>
        ) : (
          <div className="text-sm text-zinc-500">
            Nenhum domínio disponível.
          </div>
        )}
      </div>

      {nonEvaluatedDomains.length > 0 ? (
        <div className="mt-5 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
          <div className="text-sm font-semibold text-zinc-900">
            Domínios não avaliados
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {nonEvaluatedDomains.map((domain, idx) => (
              <span
                key={`${domain.key}-${idx}`}
                className={`rounded-full border px-2.5 py-1 text-xs ${statusClass(
                  domain.status
                )}`}
              >
                {domain.label || domain.key}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <ListCard
          title="Forças identificadas"
          items={strengths}
          emptyText="Nenhuma força relevante foi mapeada."
          bulletClass="text-emerald-600"
          textClass="text-zinc-700"
        />

        <ListCard
          title="Penalidades identificadas"
          items={penalties}
          emptyText="Nenhuma penalidade relevante foi mapeada."
          bulletClass="text-rose-600"
          textClass="text-zinc-700"
        />
      </div>
    </section>
  )
}

function ListCard({
  title,
  items,
  emptyText,
  bulletClass,
  textClass
}: {
  title: string
  items: string[]
  emptyText: string
  bulletClass: string
  textClass: string
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 p-4">
      <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>

      {items.length > 0 ? (
        <ul className={["mt-3 space-y-2 text-sm", textClass].join(" ")}>
          {items.map((item, index) => (
            <li key={`${item}-${index}`} className="flex gap-2">
              <span className={bulletClass}>●</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-zinc-500">{emptyText}</p>
      )}
    </div>
  )
}