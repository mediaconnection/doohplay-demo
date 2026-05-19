import Link from "next/link"
import { headers } from "next/headers"
import { notFound } from "next/navigation"

import EnterpriseExplanation from "./components/EnterpriseExplanation"
import { VerificationMatrix } from "./components/VerificationMatrix"
import { LayerDetails } from "./components/LayerDetails"
import { ExecutionMetadata } from "./components/ExecutionMetadata"

import type {
  VerificationLayer,
  VerificationResult
} from "./components/types"

/* =========================
   CONFIG
========================= */

export const dynamic = "force-dynamic"
export const revalidate = 0

/* =========================
   TYPES
========================= */

type VerifyResponse = {
  hash?: string | null
  hash_0x?: string | null
  status?: "VERIFIED" | "WARNING" | "FAILED" | "PENDING"
  trust_level?: "HIGH" | "MEDIUM" | "LOW"
  trust?: "HIGH" | "MEDIUM" | "LOW"
  risk?: "LOW" | "MEDIUM" | "HIGH"
  risk_level?: "LOW" | "MEDIUM" | "HIGH"
  score?: number | null
  reasons?: string[]
  layers?: VerificationLayer[] | null

  explanation?: {
    summary?: string
    status?: "VERIFIED" | "WARNING" | "FAILED"
    score?: number
    trust_level?: "HIGH" | "MEDIUM" | "LOW"
    key_factors?: string[]
    risk_factors?: string[]
    recommendation?: string
    audit_flags?: string[]
    technical_details?: Record<string, unknown>
    audit?: {
      layers?: Array<{
        name?: string
        valid?: boolean
        weight?: number
        reasons?: string[]
      }>
    }
    compliance?: Record<string, unknown>
  } | null

  details?: {
    event_exists?: boolean | null
    event_hash_valid?: boolean | null

    chain?: {
      valid?: boolean | null
      previous_event_hash?: string | null
      previous_event_exists?: boolean | null
      is_chain_head?: boolean | null
    }

    merkle?: {
      included?: boolean | null
      merkle_root?: string | null
      proof_present?: boolean | null
      proof_length?: number
    }

    block?: {
      exists?: boolean | null
      block_id?: number | string | null
      block_hash?: string | null
      prev_block_hash?: string | null
    }

    blockchain?: {
      anchored?: boolean | null
      anchored_at?: string | null
      tx_hash?: string | null
      tx_hash_format_valid?: boolean | null
      network?: string | null
    }

    certificate?: {
      found?: boolean | null
      valid?: boolean | null
      cert_chain_valid?: boolean | null
      revoked?: boolean | null
      source_table?: string | null
    }

    timestamp?: {
      token_present?: boolean | null
    }

    execution?: {
      event_id?: string | null
      created_at?: string | null
      block_created_at?: string | null
    }
  } | null

  meta?: {
    hash?: string | null
    generated_at?: string
    duration_ms?: number
    schema_version?: string
    confidence?: number
    request_id?: string
    engine_version?: string
    mode?: string
    source?: string
    score?: number
    latency_ms?: number
    total_time_ms?: number
    cross_layer_valid?: boolean
    cross_layer_consistent?: boolean
    cross_layer_summary?: string
    cross_layer_issues?: Array<Record<string, unknown>>
    evidence_sources?: {
      event_chain?: boolean | null
      event_blocks?: boolean | null
      certificate_table?: string | null
    }
    [key: string]: unknown
  } | null

  ok?: boolean
  valid?: boolean | null
  pending?: boolean
  verified_at?: string
  summary?: string
  error?: string
  message?: string
  source?: string | null

  links?: {
    public_verify_url?: string
    explorer_event_url?: string | null
    explorer_block_url?: string | null
    polygon_url?: string | null
  }

  verification?: {
    event_exists?: boolean
    certificate_exists?: boolean
    event_hash_valid?: boolean
    merkle_valid?: boolean
    certificate_hash_valid?: boolean
    signature_valid?: boolean
    cert_chain_valid?: boolean
    revoked?: boolean
    integrity?: boolean
  }

  event?: {
    exists?: boolean
    event_id?: string | null
    event_type?: string | null
    source_table?: string | null
    source_id?: string | null
    campaign_id?: string | null
    device_id?: string | null
    occurred_at?: string | null
    created_at?: string | null
    payload_hash?: string | null
    event_hash?: string | null
    previous_event_hash?: string | null
    signature_present?: boolean
    is_chain_head?: boolean
    merkle_root?: string | null
    timestamp?: string | null
  }

  chain?: {
    valid?: boolean
    has_previous_link?: boolean
    previous_event_hash?: string | null
    depth?: number | null
    errors?: string[] | null
  }

  merkle?: {
    included?: boolean
    merkle_root?: string | null
    proof_present?: boolean
  }

  blockchain?: {
    anchored?: boolean
    tx_hash?: string | null
    block_height?: number | null
    tx_hash_format_valid?: boolean
    confirmed?: boolean | null
  }

  certificate?: {
    exists?: boolean
    entity_id?: string | null
    entity_type?: string | null
    content_hash?: string | null
    signature_present?: boolean
    certificate_present?: boolean
    valid?: boolean | null
    issuer?: string | null
    subject?: string | null
  }

  tsa?: {
    authority?: string | null
    timestamp?: string | null
    valid?: boolean | null
  }

  block?: {
    exists?: boolean
    block_hash?: string | null
    previous_hash?: string | null
    event_count?: number | null
    created_at?: string | null
    timestamp_token_present?: boolean
  }

  anchor?: {
    network?: string | null
    tx_hash?: string | number | null
    block?: string | number | null
    confirmed?: boolean | null
    anchored?: boolean | null
  }

  debug?: {
    latency_ms?: number
    errors?: string[]
  } | null
}

/* =========================
   HELPERS
========================= */

function isValidHash(hash: string): boolean {
  return /^[a-f0-9]{64}$/i.test(hash)
}

function normalizeHash(hash: string): string {
  return hash.trim().toLowerCase().replace(/^0x/, "")
}

function statusClasses(status?: VerifyResponse["status"] | string): string {
  if (status === "VERIFIED") return "bg-emerald-600 text-white"
  if (status === "WARNING") return "bg-amber-500 text-white"
  if (status === "PENDING") return "bg-sky-600 text-white"
  return "bg-rose-600 text-white"
}

function trustClasses(level?: VerifyResponse["trust_level"] | string): string {
  if (level === "HIGH") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700"
  }

  if (level === "MEDIUM") {
    return "border-amber-200 bg-amber-50 text-amber-700"
  }

  return "border-rose-200 bg-rose-50 text-rose-700"
}

function riskClasses(level?: VerifyResponse["risk"] | string): string {
  if (level === "LOW") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700"
  }

  if (level === "MEDIUM") {
    return "border-amber-200 bg-amber-50 text-amber-700"
  }

  return "border-rose-200 bg-rose-50 text-rose-700"
}

function formatScore(value?: number | null): string {
  if (typeof value !== "number" || !Number.isFinite(value)) return "—"
  return `${Math.max(0, Math.min(100, Math.round(value)))}/100`
}

function formatDate(date?: string | null): string {
  if (!date) return "—"

  try {
    const parsed = new Date(date)
    if (Number.isNaN(parsed.getTime())) return date

    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "medium",
      timeStyle: "medium",
      timeZone: "UTC"
    }).format(parsed)
  } catch {
    return "—"
  }
}

function safeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
}

function normalizeUiResult(data: VerifyResponse): VerificationResult {
  const chain = data.details?.chain
  const merkle = data.details?.merkle
  const block = data.details?.block
  const blockchain = data.details?.blockchain
  const certificate = data.details?.certificate
  const timestamp = data.details?.timestamp
  const execution = data.details?.execution

  const anchored =
    blockchain?.anchored ??
    data.blockchain?.anchored ??
    data.anchor?.anchored ??
    undefined

  const txHash =
    blockchain?.tx_hash ??
    data.blockchain?.tx_hash ??
    (typeof data.anchor?.tx_hash === "string"
      ? data.anchor.tx_hash
      : typeof data.anchor?.tx_hash === "number"
        ? String(data.anchor.tx_hash)
        : null)

  const txHashFormatValid =
    blockchain?.tx_hash_format_valid ??
    data.blockchain?.tx_hash_format_valid ??
    undefined

  const certificateFound =
    certificate?.found ??
    data.verification?.certificate_exists ??
    data.certificate?.exists ??
    data.certificate?.certificate_present ??
    undefined

  const certificateValid =
    certificate?.valid ??
    data.certificate?.valid ??
    undefined

  const certChainValid =
    certificate?.cert_chain_valid ??
    data.verification?.cert_chain_valid ??
    undefined

  const certificateRevoked =
    certificate?.revoked ??
    data.verification?.revoked ??
    undefined

  const merkleIncluded =
    merkle?.included ??
    data.verification?.merkle_valid ??
    data.merkle?.included ??
    undefined

  const merkleProofValid =
    merkle?.proof_present ??
    data.merkle?.proof_present ??
    undefined

  const merkleRootValid =
    typeof merkle?.merkle_root === "string"
      ? merkle.merkle_root.trim().length > 0
      : typeof data.merkle?.merkle_root === "string"
        ? data.merkle.merkle_root.trim().length > 0
        : undefined

  const chainValid =
    chain?.valid ??
    data.chain?.valid ??
    undefined

  const chainHead =
    chain?.is_chain_head ??
    data.event?.is_chain_head ??
    undefined

  const timestampValid =
    timestamp?.token_present ??
    data.tsa?.valid ??
    data.block?.timestamp_token_present ??
    undefined

  const blockchainValid =
    anchored === true && txHashFormatValid === true
      ? true
      : anchored === false || txHashFormatValid === false
        ? false
        : anchored ?? undefined

  const generatedAt =
    typeof data.meta?.generated_at === "string"
      ? data.meta.generated_at
      : data.verified_at

  return {
    status: data.status,
    trust_level:
      data.trust_level ??
      data.trust,
    risk_level:
      data.risk_level ??
      data.risk,
    score:
      typeof data.score === "number"
        ? data.score
        : typeof data.explanation?.score === "number"
          ? data.explanation.score
          : undefined,
    confidence:
      typeof data.meta?.confidence === "number"
        ? data.meta.confidence
        : undefined,
    reasons: safeStringArray(data.reasons),
    errors: safeStringArray(data.debug?.errors),
    summary:
      data.meta?.cross_layer_summary ??
      data.explanation?.summary ??
      data.summary ??
      undefined,
    explanation: {
      summary:
        data.meta?.cross_layer_summary ??
        data.explanation?.summary ??
        data.summary ??
        undefined,
      key_factors: safeStringArray(data.explanation?.key_factors),
      risk_factors: safeStringArray(data.explanation?.risk_factors),
      recommendation: data.explanation?.recommendation,
      audit_flags: safeStringArray(data.explanation?.audit_flags),
      technical_details: data.explanation?.technical_details
    },
    details: {
      event_exists:
        data.details?.event_exists ??
        data.verification?.event_exists ??
        data.event?.exists,
      hash_valid:
        data.details?.event_hash_valid ??
        data.verification?.event_hash_valid,
      signature_valid:
        data.verification?.signature_valid ??
        data.event?.signature_present,
      certificate_found: certificateFound,
      certificate_valid: certificateValid,
      cert_chain_valid: certChainValid,
      certificate_revoked: certificateRevoked,
      certificate_hash_valid: data.verification?.certificate_hash_valid,
      merkle_valid: merkleIncluded,
      merkle_proof_valid: merkleProofValid,
      merkle_root_valid: merkleRootValid,
      anchored,
      blockchain_valid: blockchainValid,
      tx_hash_format_valid: txHashFormatValid,
      chain_valid: chainValid,
      chain_head: chainHead,
      timestamp_valid: timestampValid,
      integrity: data.verification?.integrity,
      chain,
      merkle,
      block,
      blockchain,
      certificate,
      timestamp,
      execution
    },
    layers: Array.isArray(data.layers) ? data.layers : [],
    metadata: {
      verified_at: generatedAt,
      generated_at: generatedAt,
      checked_at: generatedAt,
      duration_ms:
        typeof data.meta?.duration_ms === "number"
          ? data.meta.duration_ms
          : undefined,
      latency_ms:
        data.debug?.latency_ms ??
        (typeof data.meta?.duration_ms === "number"
          ? data.meta.duration_ms
          : typeof data.meta?.latency_ms === "number"
            ? data.meta.latency_ms
            : undefined),
      total_time_ms:
        (typeof data.meta?.duration_ms === "number"
          ? data.meta.duration_ms
          : typeof data.meta?.total_time_ms === "number"
            ? data.meta.total_time_ms
            : undefined) ?? data.debug?.latency_ms,
      request_id:
        typeof data.meta?.request_id === "string"
          ? data.meta.request_id
          : undefined,
      engine_version:
        typeof data.meta?.engine_version === "string"
          ? data.meta.engine_version
          : undefined,
      schema_version:
        typeof data.meta?.schema_version === "string"
          ? data.meta.schema_version
          : undefined,
      mode:
        typeof data.meta?.mode === "string"
          ? data.meta.mode
          : undefined,
      source:
        data.source ??
        (typeof data.meta?.source === "string"
          ? data.meta.source
          : undefined),
      score:
        typeof data.score === "number"
          ? data.score
          : typeof data.meta?.score === "number"
            ? data.meta.score
            : typeof data.explanation?.score === "number"
              ? data.explanation.score
              : undefined,
      confidence:
        typeof data.meta?.confidence === "number"
          ? data.meta.confidence
          : undefined,
      evidence_sources:
        typeof data.meta?.evidence_sources === "object" &&
        data.meta?.evidence_sources
          ? data.meta.evidence_sources
          : undefined
    },
    event_hash:
      data.hash ??
      data.meta?.hash ??
      data.event?.event_hash ??
      null,
    timestamp:
      execution?.created_at ??
      data.event?.timestamp ??
      data.event?.occurred_at ??
      generatedAt,
    anchor_tx_hash: txHash,
    certificate_subject: data.certificate?.subject ?? null,
    certificate_issuer: data.certificate?.issuer ?? null
  }
}

async function getBaseUrl(): Promise<string> {
  const h = await headers()

  const proto =
    h.get("x-forwarded-proto")?.split(",")[0]?.trim() ||
    (process.env.NODE_ENV === "production" ? "https" : "http")

  const host =
    h.get("x-forwarded-host")?.split(",")[0]?.trim() ||
    h.get("host")?.trim() ||
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/^https?:\/\//, "") ||
    "localhost:3000"

  return `${proto}://${host}`
}

function renderErrorCard(message: string) {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
        {message}
      </div>
    </div>
  )
}

/* =========================
   PAGE
========================= */

export default async function VerifyPage({
  params
}: {
  params: Promise<{ hash: string }>
}) {
  const { hash: rawHash } = await params
  const hash = normalizeHash(rawHash ?? "")

  if (!hash || !isValidHash(hash)) {
    return renderErrorCard("Formato de hash inválido.")
  }

  const baseUrl = await getBaseUrl()

  let res: Response

  try {
    res = await fetch(`${baseUrl}/api/verify/${hash}`, {
      cache: "no-store",
      headers: {
        Accept: "application/json"
      }
    })
  } catch (err) {
    console.error("VERIFY_FETCH_ERROR", err)
    return renderErrorCard("Erro ao consultar a verificação.")
  }

  if (res.status === 404) {
    notFound()
  }

  let data: VerifyResponse

  try {
    data = (await res.json()) as VerifyResponse
  } catch (err) {
    console.error("VERIFY_JSON_ERROR", err)
    return renderErrorCard("Erro ao interpretar a resposta da verificação.")
  }

  if (!res.ok) {
    console.error("VERIFY_API_ERROR", {
      status: res.status,
      data
    })

    if (data.error === "PROOF_NOT_FOUND") {
      notFound()
    }

    return renderErrorCard(
      data.message || data.error || "Erro ao consultar a verificação."
    )
  }

  if (data.ok === false && data.error === "PROOF_NOT_FOUND") {
    notFound()
  }

  const normalized = normalizeUiResult(data)

  const status = normalized.status ?? "FAILED"
  const trustLevel = normalized.trust_level ?? "LOW"
  const riskLevel = normalized.risk_level
  const verifiedHash = normalized.event_hash ?? hash
  const summary =
    normalized.summary ??
    "Nenhum resumo disponível."

  const verifiedAt =
    normalized.metadata?.generated_at ??
    normalized.metadata?.verified_at ??
    normalized.details?.execution?.created_at ??
    normalized.timestamp ??
    null

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-4">
          <Link
            href="/verify"
            className="text-sm text-slate-500 transition hover:text-slate-900 hover:underline"
          >
            ← Voltar para verificação
          </Link>
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                🔐 Verificação de Evento
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Camada pública de verificação criptográfica do DOOHPLAY.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${statusClasses(
                  status
                )}`}
              >
                {status}
              </span>

              <span
                className={`inline-flex rounded-full border px-4 py-2 text-sm font-semibold ${trustClasses(
                  trustLevel
                )}`}
              >
                Trust {trustLevel}
              </span>

              <span
                className={`inline-flex rounded-full border px-4 py-2 text-sm font-semibold ${riskClasses(
                  riskLevel
                )}`}
              >
                Risk {riskLevel ?? "—"}
              </span>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-[1fr_auto]">
            <div className="rounded-2xl bg-slate-950 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Hash verificado
              </div>
              <code className="mt-2 block break-all text-sm text-slate-100">
                {verifiedHash}
              </code>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Score
              </div>
              <div className="mt-1 text-2xl font-bold text-slate-900">
                {formatScore(normalized.score ?? normalized.metadata?.score)}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                Verificado em {formatDate(verifiedAt)}
              </div>
            </div>
          </div>

          <div className="mt-5 text-sm leading-6 text-slate-700">
            {summary}
          </div>

          <div className="mt-5 flex flex-wrap gap-3 text-sm">
            <a
              href={`/api/verify/${hash}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-slate-200 px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-50"
            >
              🔍 Ver JSON completo
            </a>

            {data.links?.explorer_event_url ? (
              <a
                href={data.links.explorer_event_url}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-slate-200 px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Abrir Explorer do Evento
              </a>
            ) : null}

            {data.links?.explorer_block_url ? (
              <a
                href={data.links.explorer_block_url}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-slate-200 px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Abrir Explorer do Bloco
              </a>
            ) : null}

            {data.links?.polygon_url ? (
              <a
                href={data.links.polygon_url}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-slate-200 px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Ver na Polygon
              </a>
            ) : null}
          </div>
        </section>

        <div className="mt-6 space-y-6">
          <EnterpriseExplanation result={normalized} />
          <VerificationMatrix result={normalized} />
          <LayerDetails result={normalized} />
          <ExecutionMetadata result={normalized} />
        </div>
      </div>
    </main>
  )
}