import type { VerificationResult } from "./types"

type Props = {
  result: VerificationResult | null | undefined
  className?: string
}

function badgeClass(value?: string | null) {
  if (value === "VERIFIED" || value === "HIGH") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700"
  }

  if (value === "WARNING" || value === "MEDIUM") {
    return "border-amber-200 bg-amber-50 text-amber-700"
  }

  if (value === "FAILED" || value === "HIGH_RISK" || value === "HIGH") {
    return "border-rose-200 bg-rose-50 text-rose-700"
  }

  if (value === "PENDING") {
    return "border-sky-200 bg-sky-50 text-sky-700"
  }

  return "border-zinc-200 bg-zinc-50 text-zinc-600"
}

function formatBool(value: boolean | null | undefined) {
  if (value === true) return "Sim"
  if (value === false) return "Não"
  return "N/A"
}

function safeList(value: unknown): string[] {
  if (!Array.isArray(value)) return []

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
}

function humanizeReason(value: string) {
  return value.replace(/_/g, " ").toLowerCase()
}

function getTechnicalBool(
  result: VerificationResult,
  key: string
): boolean | null | undefined {
  const technical = result.explanation?.technical_details

  if (!technical || typeof technical !== "object") {
    return undefined
  }

  const value = technical[key]
  return typeof value === "boolean" ? value : undefined
}

function getComplianceBool(
  result: VerificationResult,
  key: string
): boolean | null | undefined {
  const compliance = result.explanation?.compliance

  if (!compliance || typeof compliance !== "object") {
    return undefined
  }

  const value = compliance[key]
  return typeof value === "boolean" ? value : undefined
}

function getCrossLayerSummary(result: VerificationResult): string | undefined {
  const summary = result.metadata?.cross_layer_summary
  return typeof summary === "string" && summary.trim() ? summary.trim() : undefined
}

function getCrossLayerIssues(result: VerificationResult): string[] {
  const issues = result.metadata?.cross_layer_issues
  if (!Array.isArray(issues)) return []

  return issues
    .map((issue) => {
      if (!issue || typeof issue !== "object") return null

      const message =
        "message" in issue && typeof issue.message === "string"
          ? issue.message.trim()
          : null

      const code =
        "code" in issue && typeof issue.code === "string"
          ? issue.code.trim()
          : null

      return message || code
    })
    .filter((item): item is string => Boolean(item))
}

function getKeyFactors(result: VerificationResult): string[] {
  const explicit = safeList(result.explanation?.key_factors)
  if (explicit.length > 0) return explicit

  const trustStrengths = safeList(result.trust_score?.strengths)
  if (trustStrengths.length > 0) return trustStrengths

  const topLevelStrengths = safeList(result.strengths)
  if (topLevelStrengths.length > 0) return topLevelStrengths

  const details = result.details
  const factors: string[] = []

  if (details?.event_exists === true) factors.push("Evento localizado")
  if ((details?.event_hash_valid ?? details?.hash_valid) === true) {
    factors.push("Hash consistente")
  }
  if ((details?.chain_valid ?? details?.chain?.valid) === true) {
    factors.push("Encadeamento preservado")
  }
  if ((details?.merkle_included ?? details?.merkle_valid) === true) {
    factors.push("Merkle root presente")
  }
  if ((details?.merkle_proof_present ?? details?.merkle_proof_valid) === true) {
    factors.push("Prova Merkle disponível")
  }
  if ((details?.block_exists ?? details?.block?.exists) === true) {
    factors.push("Bloco associado localizado")
  }
  if (
    (details?.signature_present ?? details?.signature_valid) === true ||
    getTechnicalBool(result, "signature_valid") === true
  ) {
    factors.push("Assinatura presente")
  }
  if ((details?.anchored ?? result.evidence?.anchoring) === true) {
    factors.push("Âncora blockchain disponível")
  }
  if ((details?.timestamp_token_present ?? details?.timestamp_valid) === true) {
    factors.push("Timestamp confiável presente")
  }
  if (getComplianceBool(result, "icp_brasil") === true) {
    factors.push("Conformidade ICP preservada")
  }

  return factors
}

function getRiskFactors(result: VerificationResult): string[] {
  const explicit = safeList(result.explanation?.risk_factors)
  if (explicit.length > 0) return explicit

  const crossLayerIssues = getCrossLayerIssues(result)
  if (crossLayerIssues.length > 0) return crossLayerIssues

  const trustPenalties = safeList(result.trust_score?.penalties)
  if (trustPenalties.length > 0) return trustPenalties

  const topLevelPenalties = safeList(result.penalties)
  if (topLevelPenalties.length > 0) return topLevelPenalties

  return safeList(result.reasons).map(humanizeReason)
}

function buildExecutiveSummary(result: VerificationResult) {
  const crossLayerSummary = getCrossLayerSummary(result)
  if (crossLayerSummary) return crossLayerSummary

  const trustSummary = result.trust_score?.summary?.trim()
  if (trustSummary) return trustSummary

  const explanationSummary = result.explanation?.summary?.trim()
  if (explanationSummary) return explanationSummary

  const status = result.status ?? "FAILED"
  const trustLevel = result.trust_level ?? "LOW"
  const riskLevel = result.risk_level ?? "UNKNOWN"

  const score =
    typeof result.score === "number"
      ? Math.max(0, Math.min(100, Math.round(result.score)))
      : typeof result.trust_score?.final_score === "number"
        ? Math.max(0, Math.min(100, Math.round(result.trust_score.final_score)))
        : null

  if (status === "VERIFIED") {
    return `Evento validado com confiança ${trustLevel} e risco ${riskLevel}${
      score !== null ? ` (score ${score}/100)` : ""
    }.`
  }

  if (status === "WARNING") {
    return `Evento válido com ressalvas, confiança ${trustLevel} e risco ${riskLevel}${
      score !== null ? ` (score ${score}/100)` : ""
    }.`
  }

  if (status === "PENDING") {
    return `Evento em processamento, com confiança ${trustLevel} e risco ${riskLevel}${
      score !== null ? ` (score ${score}/100)` : ""
    }.`
  }

  return `Evento não confiável, risco ${riskLevel}${
    score !== null ? ` (score ${score}/100)` : ""
  }.`
}

export default function EnterpriseExplanation({
  result,
  className
}: Props) {
  if (!result) return null

  const explanation = result.explanation
  const details = result.details
  const evidence = result.evidence

  const summary = buildExecutiveSummary(result)
  const keyFactors = getKeyFactors(result)
  const riskFactors = getRiskFactors(result)
  const auditFlags = safeList(explanation?.audit_flags)

  const eventExists = details?.event_exists
  const hashValid = details?.event_hash_valid ?? details?.hash_valid
  const chainValid =
    details?.chain_valid ??
    details?.chain?.valid ??
    getTechnicalBool(result, "chain_valid")
  const merkleIncluded =
    details?.merkle_included ??
    details?.merkle_valid ??
    evidence?.merkle ??
    getTechnicalBool(result, "merkle")
  const merkleProofPresent =
    details?.merkle_proof_present ??
    details?.merkle_proof_valid ??
    getTechnicalBool(result, "merkle_proof_valid")
  const blockExists =
    details?.block_exists ??
    details?.block?.exists ??
    evidence?.ledger ??
    getTechnicalBool(result, "block_exists")
  const signaturePresent =
    details?.signature_present ??
    details?.signature_valid ??
    evidence?.signature ??
    getTechnicalBool(result, "signature_present") ??
    getTechnicalBool(result, "signature_valid")
  const anchored =
    details?.anchored ??
    evidence?.anchoring ??
    getTechnicalBool(result, "anchored")
  const txValid =
    details?.tx_valid ??
    details?.tx_hash_format_valid ??
    getTechnicalBool(result, "tx_hash_format_valid")
  const timestampPresent =
    details?.timestamp_token_present ??
    details?.timestamp_valid ??
    evidence?.timestamp_token ??
    getTechnicalBool(result, "timestamp_token_present") ??
    getTechnicalBool(result, "timestamp_valid")

  const complianceIcp = getComplianceBool(result, "icp_brasil")
  const complianceBlockchain = getComplianceBool(result, "blockchain_anchor")
  const complianceMerkle = getComplianceBool(result, "merkle_proof")
  const complianceSignature = getComplianceBool(result, "signature_valid")
  const complianceCertificate = getComplianceBool(result, "certificate_valid")

  return (
    <section
      className={[
        "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm",
        className ?? ""
      ].join(" ")}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Explicação executiva
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Leitura consolidada da verificação com foco executivo, técnico e auditável.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span
            className={[
              "inline-flex rounded-full border px-3 py-1 text-xs font-semibold",
              badgeClass(result.status)
            ].join(" ")}
          >
            {result.status ?? "—"}
          </span>

          <span
            className={[
              "inline-flex rounded-full border px-3 py-1 text-xs font-semibold",
              badgeClass(result.trust_level)
            ].join(" ")}
          >
            Trust {result.trust_level ?? "—"}
          </span>

          <span
            className={[
              "inline-flex rounded-full border px-3 py-1 text-xs font-semibold",
              badgeClass(result.risk_level)
            ].join(" ")}
          >
            Risk {result.risk_level ?? "—"}
          </span>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="text-sm font-semibold text-slate-900">
          Resumo executivo
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-700">{summary}</p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <MetricCard label="Evento" value={formatBool(eventExists)} />
        <MetricCard label="Hash" value={formatBool(hashValid)} />
        <MetricCard label="Chain" value={formatBool(chainValid)} />
        <MetricCard label="Merkle" value={formatBool(merkleIncluded)} />
        <MetricCard label="Bloco" value={formatBool(blockExists)} />
        <MetricCard label="Âncora" value={formatBool(anchored)} />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <ListCard
          title="Fatores-chave"
          items={keyFactors}
          emptyText="Nenhum fator-chave informado."
          bulletClass="text-emerald-600"
          textClass="text-slate-700"
        />

        <ListCard
          title="Fatores de risco"
          items={riskFactors}
          emptyText="Nenhum fator de risco material informado."
          bulletClass="text-rose-600"
          textClass="text-rose-700"
        />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-slate-900">
            Leitura técnica consolidada
          </h3>

          <div className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
            <TechnicalRow
              label="Assinatura presente"
              value={formatBool(signaturePresent)}
            />
            <TechnicalRow
              label="Merkle incluído"
              value={formatBool(merkleIncluded)}
            />
            <TechnicalRow
              label="Merkle proof presente"
              value={formatBool(merkleProofPresent)}
            />
            <TechnicalRow
              label="Bloco localizado"
              value={formatBool(blockExists)}
            />
            <TechnicalRow
              label="Merkle do bloco confere"
              value={formatBool(details?.block_merkle_matches)}
            />
            <TechnicalRow
              label="TX hash válido"
              value={formatBool(txValid)}
            />
            <TechnicalRow
              label="Timestamp token presente"
              value={formatBool(timestampPresent)}
            />
            <TechnicalRow
              label="Certificado encontrado"
              value={formatBool(details?.certificate_found)}
            />
            <TechnicalRow
              label="Certificado válido"
              value={formatBool(details?.certificate_valid)}
            />
            <TechnicalRow
              label="Cadeia do certificado"
              value={formatBool(details?.cert_chain_valid)}
            />
            <TechnicalRow
              label="Certificado revogado"
              value={formatBool(details?.certificate_revoked)}
            />
            <TechnicalRow
              label="Integridade"
              value={formatBool(details?.integrity)}
            />
          </div>
        </div>

        <ListCard
          title="Flags de auditoria"
          items={auditFlags}
          emptyText="Nenhuma flag de auditoria foi informada."
          bulletClass="text-amber-600"
          textClass="text-slate-700"
        />
      </div>

      <div className="mt-5 rounded-2xl border border-slate-200 p-4">
        <h3 className="text-sm font-semibold text-slate-900">
          Compliance e consistência estrutural
        </h3>

        <div className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-2 lg:grid-cols-3">
          <TechnicalRow
            label="ICP Brasil"
            value={formatBool(complianceIcp)}
          />
          <TechnicalRow
            label="Âncora blockchain"
            value={formatBool(complianceBlockchain)}
          />
          <TechnicalRow
            label="Prova Merkle"
            value={formatBool(complianceMerkle)}
          />
          <TechnicalRow
            label="Assinatura válida"
            value={formatBool(complianceSignature)}
          />
          <TechnicalRow
            label="Certificado válido"
            value={formatBool(complianceCertificate)}
          />
          <TechnicalRow
            label="Cross-layer consistente"
            value={formatBool(result.metadata?.cross_layer_consistent)}
          />
        </div>

        {getCrossLayerSummary(result) ? (
          <p className="mt-3 text-sm leading-6 text-slate-700">
            {getCrossLayerSummary(result)}
          </p>
        ) : null}
      </div>

      {explanation?.recommendation ? (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="text-sm font-semibold text-slate-900">
            Recomendação
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            {explanation.recommendation}
          </p>
        </div>
      ) : null}
    </section>
  )
}

function MetricCard({
  label,
  value
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
      <div className="text-xs uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-slate-900">
        {value}
      </div>
    </div>
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
    <div className="rounded-2xl border border-slate-200 p-4">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>

      {items.length > 0 ? (
        <ul className={["mt-3 space-y-2 text-sm", textClass].join(" ")}>
          {items.map((item, index) => (
            <li key={`${item}-${index}`} className="flex gap-2">
              <span className={["mt-0.5", bulletClass].join(" ")}>●</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-slate-500">{emptyText}</p>
      )}
    </div>
  )
}

function TechnicalRow({
  label,
  value
}: {
  label: string
  value: string
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
      <span className="text-slate-600">{label}</span>
      <span className="font-medium text-slate-900">{value}</span>
    </div>
  )
}