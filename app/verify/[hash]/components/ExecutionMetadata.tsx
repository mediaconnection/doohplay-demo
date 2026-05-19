import type { VerificationResult } from "./types"

type Props = {
  result: VerificationResult | null | undefined
  className?: string
}

type Row = {
  label: string
  value: string
  mono?: boolean
  truncate?: boolean
  category: "Evidência" | "Execução" | "Certificação" | "Auditoria"
  priority?: number
}

type ExecutionLike = {
  event_id?: unknown
  created_at?: string | null
  block_created_at?: string | null
}

type EvidenceSourcesLike = {
  event_chain?: unknown
  event_blocks?: unknown
  certificate_table?: unknown
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function formatDateTime(value?: string | null): string {
  if (!value) return "—"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "medium",
    timeZone: "UTC"
  }).format(date)
}

function formatScore(value?: number): string {
  if (typeof value !== "number" || !Number.isFinite(value)) return "—"
  return `${Math.max(0, Math.min(100, Math.round(value)))}/100`
}

function formatConfidence(value?: number): string {
  if (typeof value !== "number" || !Number.isFinite(value)) return "—"

  const normalized =
    value <= 1 ? Math.round(value * 100) : Math.round(value)

  return `${Math.max(0, Math.min(100, normalized))}%`
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "—"
  if (typeof value === "boolean") return value ? "Sim" : "Não"
  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : "—"
  }

  if (typeof value === "string") {
    const normalized = value.trim()
    return normalized || "—"
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return "—"
    return value.map((item) => String(item)).join(", ")
  }

  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

function shortValue(value?: string | null, start = 14, end = 10): string {
  if (!value || typeof value !== "string") return "—"

  const normalized = value.trim()
  if (!normalized) return "—"
  if (normalized.length <= start + end + 3) return normalized

  return `${normalized.slice(0, start)}...${normalized.slice(-end)}`
}

function getStatusLabel(status?: string): string {
  const normalized = status?.trim()

  switch (normalized) {
    case "VERIFIED":
      return "Verificado"
    case "WARNING":
      return "Verificado com ressalvas"
    case "FAILED":
      return "Falha na verificação"
    case "PENDING":
      return "Verificação pendente"
    default:
      return normalized || "—"
  }
}

function getTrustLabel(level?: string): string {
  const normalized = level?.trim()

  switch (normalized) {
    case "HIGH":
      return "Alta confiança"
    case "MEDIUM":
      return "Confiança moderada"
    case "LOW":
      return "Baixa confiança"
    default:
      return normalized || "—"
  }
}

function getRiskLabel(level?: string): string {
  const normalized = level?.trim()

  switch (normalized) {
    case "LOW":
      return "Risco baixo"
    case "MEDIUM":
      return "Risco moderado"
    case "HIGH":
      return "Risco alto"
    default:
      return normalized || "—"
  }
}

function getCategoryClass(category: Row["category"]): string {
  switch (category) {
    case "Evidência":
      return "border-emerald-200 bg-emerald-50 text-emerald-700"
    case "Execução":
      return "border-sky-200 bg-sky-50 text-sky-700"
    case "Certificação":
      return "border-violet-200 bg-violet-50 text-violet-700"
    case "Auditoria":
      return "border-amber-200 bg-amber-50 text-amber-700"
    default:
      return "border-zinc-200 bg-zinc-50 text-zinc-700"
  }
}

export function ExecutionMetadata({ result, className }: Props) {
  if (!result) return null

  const metadata = result.metadata ?? {}
  const details = result.details ?? {}

  const execution: ExecutionLike = isPlainObject(details.execution)
    ? (details.execution as ExecutionLike)
    : {}

  const evidenceSources: EvidenceSourcesLike = isPlainObject(
    metadata.evidence_sources
  )
    ? (metadata.evidence_sources as EvidenceSourcesLike)
    : {}

  const rows: Row[] = [
    {
      label: "Hash do evento",
      value: formatValue(result.event_hash),
      mono: true,
      truncate: true,
      category: "Evidência",
      priority: 1
    },
    {
      label: "Event ID",
      value: formatValue(execution.event_id ?? details.event_id),
      mono: true,
      truncate: true,
      category: "Evidência",
      priority: 2
    },
    {
      label: "Status",
      value: getStatusLabel(result.status),
      category: "Execução",
      priority: 1
    },
    {
      label: "Confiança",
      value: getTrustLabel(result.trust_level),
      category: "Execução",
      priority: 1
    },
    {
      label: "Risco",
      value: getRiskLabel(result.risk_level),
      category: "Execução",
      priority: 1
    },
    {
      label: "Score",
      value: formatScore(
        result.score ?? result.trust_score?.final_score ?? metadata.score
      ),
      category: "Execução",
      priority: 1
    },
    {
      label: "Confiança numérica",
      value: formatConfidence(result.confidence ?? metadata.confidence),
      category: "Execução",
      priority: 2
    },
    {
      label: "Verificado em",
      value: formatDateTime(
        metadata.generated_at ??
          metadata.verified_at ??
          metadata.checked_at ??
          execution.created_at ??
          (typeof details.created_at === "string" ? details.created_at : null) ??
          result.timestamp
      ),
      category: "Execução",
      priority: 1
    },
    {
      label: "Evento criado em",
      value: formatDateTime(
        execution.created_at ??
          (typeof details.created_at === "string" ? details.created_at : null)
      ),
      category: "Execução",
      priority: 2
    },
    {
      label: "Bloco criado em",
      value: formatDateTime(execution.block_created_at),
      category: "Execução",
      priority: 3
    },
    {
      label: "Duração",
      value:
        typeof metadata.duration_ms === "number"
          ? `${Math.round(metadata.duration_ms)} ms`
          : typeof metadata.total_time_ms === "number"
            ? `${Math.round(metadata.total_time_ms)} ms`
            : typeof metadata.latency_ms === "number"
              ? `${Math.round(metadata.latency_ms)} ms`
              : "—",
      category: "Execução",
      priority: 2
    },
    {
      label: "Metodologia",
      value: formatValue(result.trust_score?.methodology),
      category: "Auditoria",
      priority: 1
    },
    {
      label: "Schema",
      value: formatValue(metadata.schema_version),
      category: "Auditoria",
      priority: 1
    },
    {
      label: "Origem",
      value: formatValue(metadata.source),
      category: "Execução",
      priority: 3
    },
    {
      label: "Engine",
      value: formatValue(metadata.engine_version),
      category: "Execução",
      priority: 3
    },
    {
      label: "Modo",
      value: formatValue(metadata.mode),
      category: "Execução",
      priority: 3
    },
    {
      label: "Request ID",
      value: formatValue(metadata.request_id),
      mono: true,
      truncate: true,
      category: "Auditoria",
      priority: 2
    },
    {
      label: "Cross-layer válido",
      value: formatValue(metadata.cross_layer_valid),
      category: "Auditoria",
      priority: 2
    },
    {
      label: "Cross-layer consistente",
      value: formatValue(metadata.cross_layer_consistent),
      category: "Auditoria",
      priority: 2
    },
    {
      label: "Resumo cross-layer",
      value: formatValue(metadata.cross_layer_summary),
      category: "Auditoria",
      priority: 2
    },
    {
      label: "Issues cross-layer",
      value:
        Array.isArray(metadata.cross_layer_issues) &&
        metadata.cross_layer_issues.length > 0
          ? String(metadata.cross_layer_issues.length)
          : "—",
      category: "Auditoria",
      priority: 3
    },
    {
      label: "Fonte event_chain",
      value: formatValue(evidenceSources.event_chain),
      category: "Auditoria",
      priority: 2
    },
    {
      label: "Fonte event_blocks",
      value: formatValue(evidenceSources.event_blocks),
      category: "Auditoria",
      priority: 2
    },
    {
      label: "Tabela de certificado",
      value: formatValue(evidenceSources.certificate_table),
      category: "Auditoria",
      priority: 3
    },
    {
      label: "TX âncora",
      value: formatValue(result.anchor_tx_hash ?? result.evidence?.tx_hash),
      mono: true,
      truncate: true,
      category: "Evidência",
      priority: 2
    },
    {
      label: "Evidência ledger",
      value: formatValue(result.evidence?.ledger),
      category: "Evidência",
      priority: 2
    },
    {
      label: "Evidência Merkle",
      value: formatValue(result.evidence?.merkle),
      category: "Evidência",
      priority: 2
    },
    {
      label: "Evidência assinatura",
      value: formatValue(result.evidence?.signature),
      category: "Evidência",
      priority: 2
    },
    {
      label: "Evidência ancoragem",
      value: formatValue(result.evidence?.anchoring),
      category: "Evidência",
      priority: 2
    },
    {
      label: "Timestamp token",
      value: formatValue(result.evidence?.timestamp_token),
      category: "Evidência",
      priority: 3
    },
    {
      label: "Forças mapeadas",
      value:
        Array.isArray(result.strengths) && result.strengths.length > 0
          ? String(result.strengths.length)
          : Array.isArray(result.trust_score?.strengths) &&
              result.trust_score.strengths.length > 0
            ? String(result.trust_score.strengths.length)
            : "—",
      category: "Auditoria",
      priority: 3
    },
    {
      label: "Penalidades mapeadas",
      value:
        Array.isArray(result.penalties) && result.penalties.length > 0
          ? String(result.penalties.length)
          : Array.isArray(result.trust_score?.penalties) &&
              result.trust_score.penalties.length > 0
            ? String(result.trust_score.penalties.length)
            : "—",
      category: "Auditoria",
      priority: 3
    },
    {
      label: "Emissor do certificado",
      value: formatValue(result.certificate_issuer),
      category: "Certificação",
      priority: 3
    },
    {
      label: "Titular do certificado",
      value: formatValue(result.certificate_subject),
      category: "Certificação",
      priority: 3
    }
  ]

  const visibleRows = rows
    .filter((row) => row.value !== "—")
    .sort(
      (a, b) =>
        (a.priority ?? 999) - (b.priority ?? 999) ||
        a.label.localeCompare(b.label)
    )

  if (visibleRows.length === 0) return null

  return (
    <section
      className={[
        "rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm",
        className ?? ""
      ].join(" ")}
    >
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-zinc-900">
          Metadados de execução
        </h2>
        <p className="mt-1 text-sm text-zinc-600">
          Informações técnicas, operacionais e de evidência produzidas durante a
          verificação, organizadas para leitura auditável de nível enterprise.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {visibleRows.map((row, index) => {
          const displayValue =
            row.truncate && row.value !== "—"
              ? shortValue(row.value)
              : row.value

          return (
            <div
              key={`${row.label}-${index}`}
              className="rounded-xl border border-zinc-200 bg-zinc-50 p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="text-[11px] uppercase tracking-wide text-zinc-500">
                  {row.label}
                </div>
                <span
                  className={[
                    "inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                    getCategoryClass(row.category)
                  ].join(" ")}
                >
                  {row.category}
                </span>
              </div>

              <div
                className={[
                  "mt-2 break-words text-sm text-zinc-900",
                  row.mono ? "font-mono" : "font-medium"
                ].join(" ")}
                title={row.value !== "—" ? row.value : undefined}
              >
                {displayValue}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}