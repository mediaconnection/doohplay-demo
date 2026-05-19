import type { VerificationLayer, VerificationResult } from "./types"

type Props = {
  result: VerificationResult | null | undefined
  className?: string
}

type LayerCategory =
  | "Certificação"
  | "Assinatura"
  | "Integridade"
  | "Blockchain"
  | "Temporal"
  | "Auditoria"

type LayerSeverity = "Crítico" | "Alto" | "Médio" | "Baixo"

type EntryRow = {
  id: string
  key: string
  value: unknown
  source: "meta" | "details"
}

function normalizeLayerName(name: unknown): string {
  return typeof name === "string" ? name.trim().toLowerCase() : ""
}

function getLayerTitle(name: unknown): string {
  const map: Record<string, string> = {
    input: "Validação de Entrada",
    lookup: "Consulta de Evidência",
    storage: "Camada de Armazenamento",
    event: "Camada de Evento",
    icp: "Camada ICP / Certificado",
    signature: "Camada de Assinatura",
    merkle: "Camada Merkle",
    block: "Camada de Bloco",
    blockchain: "Camada Blockchain",
    anchor: "Camada de Âncora",
    chain: "Camada de Cadeia Histórica",
    timestamp: "Camada de Timestamp",
    certificate: "Camada de Certificado"
  }

  const normalized = normalizeLayerName(name)

  return (
    map[normalized] ??
    (typeof name === "string" && name.trim()
      ? name.trim()
      : "Camada técnica")
  )
}

function getLayerDescription(name: unknown): string {
  const map: Record<string, string> = {
    input:
      "Valida formato, consistência mínima e segurança da entrada recebida.",
    lookup:
      "Consulta e localiza a evidência correspondente no ledger e fontes auxiliares.",
    storage:
      "Avalia disponibilidade estrutural das tabelas e persistência das evidências.",
    event:
      "Valida a existência do evento e a correspondência do hash consultado com a evidência encontrada.",
    icp:
      "Valida certificado, presença de assinatura e coerência criptográfica da certificação.",
    signature:
      "Confirma a validade ou presença da assinatura vinculada à evidência auditada.",
    merkle:
      "Verifica a inclusão do evento em uma prova Merkle íntegra e consistente.",
    block:
      "Analisa o bloco associado, sua integridade mínima e coerência com a prova do evento.",
    blockchain:
      "Confirma ancoragem, coerência transacional e consistência do registro em blockchain.",
    anchor:
      "Valida a evidência de ancoragem, incluindo tx hash e timestamp token quando disponíveis.",
    chain:
      "Valida o encadeamento histórico do evento e sua continuidade lógica.",
    timestamp:
      "Checa a coerência temporal do registro, incluindo TSA quando disponível.",
    certificate:
      "Analisa presença, consistência e validade do certificado associado."
  }

  const normalized = normalizeLayerName(name)
  return map[normalized] ?? "Camada técnica de verificação."
}

function getLayerCategory(name: unknown): LayerCategory {
  const normalized = normalizeLayerName(name)

  switch (normalized) {
    case "icp":
    case "certificate":
      return "Certificação"
    case "signature":
      return "Assinatura"
    case "event":
    case "merkle":
    case "chain":
    case "block":
    case "input":
    case "lookup":
    case "storage":
      return "Integridade"
    case "blockchain":
    case "anchor":
      return "Blockchain"
    case "timestamp":
      return "Temporal"
    default:
      return "Auditoria"
  }
}

function getLayerSeverity(name: unknown): LayerSeverity {
  const normalized = normalizeLayerName(name)

  switch (normalized) {
    case "input":
    case "event":
    case "chain":
    case "merkle":
    case "block":
    case "blockchain":
    case "anchor":
    case "signature":
      return "Crítico"
    case "icp":
    case "certificate":
    case "lookup":
    case "storage":
      return "Alto"
    case "timestamp":
      return "Médio"
    default:
      return "Baixo"
  }
}

function getLayers(
  result: VerificationResult | null | undefined
): VerificationLayer[] {
  return Array.isArray(result?.layers) ? result.layers : []
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function shouldKeepEntry(key: string, value: unknown): boolean {
  const normalized = key.trim().toLowerCase()

  if (value === undefined || value === null) return false
  if (typeof value === "string" && value.trim().length === 0) return false
  if (isPlainObject(value) && Object.keys(value).length === 0) return false
  if (Array.isArray(value) && value.length === 0) return false

  return !["weight", "duration_ms", "category", "severity"].includes(normalized)
}

function entryPriority(key: string): number {
  const normalized = key.trim().toLowerCase()

  const priorities = [
    "valid",
    "event_hash",
    "event_id",
    "block_id",
    "block_hash",
    "tx_hash",
    "block_tx_hash",
    "blockchain_tx",
    "merkle_root",
    "computed_root",
    "block_merkle_root",
    "payload_hash",
    "previous_event_hash",
    "previous_hash",
    "signature",
    "anchored",
    "tx_hash_format_valid",
    "timestamp_token_present",
    "cross_layer_consistent",
    "cross_layer_summary",
    "cross_layer_issues"
  ]

  const index = priorities.indexOf(normalized)
  return index === -1 ? 999 : index
}

function safeEntries(
  source: "meta" | "details",
  value: Record<string, unknown> | null | undefined
): EntryRow[] {
  if (!value || typeof value !== "object") return []

  return Object.entries(value)
    .filter(([key, entryValue]) => shouldKeepEntry(key, entryValue))
    .map(([key, entryValue]) => ({
      id: `${source}:${key}`,
      key,
      value: entryValue,
      source
    }))
    .sort((a, b) => {
      const diff = entryPriority(a.key) - entryPriority(b.key)
      if (diff !== 0) return diff
      return a.key.localeCompare(b.key)
    })
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "—"
  if (typeof value === "boolean") return value ? "Sim" : "Não"
  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : "—"
  }
  if (typeof value === "string") {
    return value.trim() || "—"
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return "—"

    const serialized = value
      .map((item) => {
        if (typeof item === "string") return item.trim()
        try {
          return JSON.stringify(item)
        } catch {
          return String(item)
        }
      })
      .filter(Boolean)
      .join(", ")

    return serialized || "—"
  }

  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

function shorten(value: string, start = 16, end = 12): string {
  if (value === "—") return value
  if (value.length <= start + end + 3) return value
  return `${value.slice(0, start)}...${value.slice(-end)}`
}

function shouldTruncate(key: string): boolean {
  const normalized = key.trim().toLowerCase()

  return [
    "merkle_root",
    "merkleroot",
    "computed_root",
    "computedroot",
    "tx_hash",
    "transaction_hash",
    "transactionhash",
    "previous_hash",
    "previoushash",
    "prev_block_hash",
    "prevblockhash",
    "block_hash",
    "blockhash",
    "block_tx_hash",
    "blockchain_tx",
    "event_hash",
    "eventhash",
    "payload_hash",
    "payloadhash",
    "previous_event_hash",
    "previouseventhash",
    "root",
    "hash",
    "signature"
  ].includes(normalized)
}

function isStructuredValue(value: unknown): boolean {
  return typeof value === "object" && value !== null
}

function getStatusClass(valid: boolean | null | undefined): string {
  if (valid === true) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700"
  }

  if (valid === false) {
    return "border-rose-200 bg-rose-50 text-rose-700"
  }

  return "border-zinc-200 bg-white text-zinc-500"
}

function getStatusLabel(valid: boolean | null | undefined): string {
  if (valid === true) return "Aprovado"
  if (valid === false) return "Reprovado"
  return "Não disponível"
}

function getSeverityClass(severity: LayerSeverity): string {
  switch (severity) {
    case "Crítico":
      return "border-rose-200 bg-rose-50 text-rose-700"
    case "Alto":
      return "border-amber-200 bg-amber-50 text-amber-700"
    case "Médio":
      return "border-sky-200 bg-sky-50 text-sky-700"
    default:
      return "border-zinc-200 bg-zinc-50 text-zinc-700"
  }
}

function getCategoryClass(category: LayerCategory): string {
  switch (category) {
    case "Certificação":
      return "border-violet-200 bg-violet-50 text-violet-700"
    case "Assinatura":
      return "border-indigo-200 bg-indigo-50 text-indigo-700"
    case "Integridade":
      return "border-emerald-200 bg-emerald-50 text-emerald-700"
    case "Blockchain":
      return "border-orange-200 bg-orange-50 text-orange-700"
    case "Temporal":
      return "border-cyan-200 bg-cyan-50 text-cyan-700"
    default:
      return "border-zinc-200 bg-zinc-50 text-zinc-700"
  }
}

function normalizeReasons(value: unknown): string[] {
  if (!Array.isArray(value)) return []

  return Array.from(
    new Set(
      value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
    )
  )
}

function reasonLabel(reason: string): string {
  const map: Record<string, string> = {
    INVALID_HASH: "Hash inválido",
    EVENT_NOT_FOUND: "Evento não encontrado",
    EVENT_HASH_MISMATCH: "Hash do evento divergente",
    SIGNATURE_MISSING: "Assinatura ausente",
    INVALID_SIGNATURE: "Assinatura inválida",
    SIGNATURE_INVALID: "Assinatura inválida",
    SIGNATURE_NOT_EVALUATED: "Assinatura não avaliada",
    CERT_REVOKED: "Certificado revogado",
    CERT_EXPIRED: "Certificado expirado",
    CERTIFICATE_NOT_FOUND: "Certificado não encontrado",
    CERTIFICATE_INVALID: "Certificado inválido",
    CERT_CHAIN_INVALID: "Cadeia do certificado inválida",
    CHAIN_INVALID: "Encadeamento inválido",
    CHAIN_INDEX_MISSING: "Índice da cadeia ausente",
    MERKLE_FAIL: "Falha na prova Merkle",
    MERKLE_ROOT_MISSING: "Merkle root ausente",
    MERKLE_PROOF_MISSING: "Merkle proof ausente",
    BLOCK_MERKLE_MISMATCH: "Merkle do evento diverge do bloco",
    BLOCKCHAIN_FAIL: "Falha na ancoragem blockchain",
    BLOCKCHAIN_NOT_ANCHORED: "Âncora blockchain ausente",
    ANCHOR_EVIDENCE_MISSING: "Evidência de ancoragem ausente",
    BLOCK_NOT_FOUND: "Bloco não encontrado",
    INVALID_BLOCKCHAIN_TX: "Transação blockchain inválida",
    TX_HASH_INVALID: "TX hash inválido",
    HASH_MISMATCH: "Hash divergente",
    PROOF_NOT_FOUND: "Prova não encontrada",
    TIMESTAMP_INVALID: "Carimbo do tempo inválido",
    TSA_TIMESTAMP_MISSING: "Carimbo TSA ausente",
    EVENT_CHAIN_TABLE_NOT_FOUND: "Tabela event_chain não encontrada",
    INTERNAL_ERROR: "Erro interno de processamento"
  }

  return map[reason] ?? reason.replace(/_/g, " ").toLowerCase()
}

export function LayerDetails({ result, className }: Props) {
  const layers = getLayers(result)

  if (layers.length === 0) return null

  return (
    <section
      className={[
        "rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm",
        className ?? ""
      ].join(" ")}
    >
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-zinc-900">
          Detalhes por camada
        </h2>
        <p className="mt-1 text-sm text-zinc-600">
          Resultado técnico do motor de prova por módulo de validação, organizado
          para leitura auditável de nível enterprise.
        </p>
      </div>

      <div className="space-y-4">
        {layers.map((layer, index) => {
          const entries = [
            ...safeEntries(
              "meta",
              layer.meta as Record<string, unknown> | null | undefined
            ),
            ...safeEntries(
              "details",
              layer.details as Record<string, unknown> | null | undefined
            )
          ]

          const reasons = normalizeReasons(layer.reasons)
          const category = layer.category ?? getLayerCategory(layer.name)
          const severity = layer.severity ?? getLayerSeverity(layer.name)
          const layerTitle = getLayerTitle(layer.name)
          const layerDescription =
            layer.message?.trim() || getLayerDescription(layer.name)

          return (
            <article
              key={`${String(layer.name)}-${index}`}
              className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={[
                        "inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
                        getCategoryClass(category)
                      ].join(" ")}
                    >
                      {category}
                    </span>
                    <span
                      className={[
                        "inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
                        getSeverityClass(severity)
                      ].join(" ")}
                    >
                      {severity}
                    </span>
                  </div>

                  <h3 className="mt-3 text-base font-semibold text-zinc-900">
                    {layerTitle}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-zinc-600">
                    {layerDescription}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={[
                      "inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold",
                      getStatusClass(layer.valid)
                    ].join(" ")}
                  >
                    {getStatusLabel(layer.valid)}
                  </span>

                  {typeof layer.weight === "number" &&
                  Number.isFinite(layer.weight) ? (
                    <span className="inline-flex rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-600">
                      Peso {layer.weight}
                    </span>
                  ) : null}

                  {typeof layer.duration_ms === "number" &&
                  Number.isFinite(layer.duration_ms) ? (
                    <span className="inline-flex rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-600">
                      {layer.duration_ms} ms
                    </span>
                  ) : null}
                </div>
              </div>

              {layer.error ? (
                <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                  <strong>Erro técnico:</strong> {layer.error}
                </div>
              ) : null}

              {reasons.length > 0 ? (
                <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-3">
                  <div className="text-[11px] uppercase tracking-wide text-zinc-500">
                    Motivos técnicos
                  </div>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-800">
                    {reasons.map((reason, reasonIndex) => (
                      <li key={`${reason}-${reasonIndex}`}>
                        {reasonLabel(reason)}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {entries.length > 0 ? (
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {entries.map((entry) => {
                    const formattedValue = formatValue(entry.value)
                    const shouldMono =
                      shouldTruncate(entry.key) || isStructuredValue(entry.value)
                    const displayValue = shouldTruncate(entry.key)
                      ? shorten(formattedValue)
                      : formattedValue

                    return (
                      <div
                        key={`${String(layer.name)}-${entry.id}`}
                        className="rounded-xl border border-zinc-200 bg-white p-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-[11px] uppercase tracking-wide text-zinc-500">
                            {entry.key}
                          </div>
                          <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[10px] uppercase tracking-wide text-zinc-500">
                            {entry.source}
                          </span>
                        </div>

                        <div
                          className={[
                            "mt-1 break-words text-sm text-zinc-800",
                            shouldMono ? "whitespace-pre-wrap font-mono text-xs" : ""
                          ].join(" ")}
                          title={formattedValue !== "—" ? formattedValue : undefined}
                        >
                          {displayValue}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="mt-4 text-sm text-zinc-500">
                  Nenhum detalhe adicional disponível para esta camada.
                </p>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}