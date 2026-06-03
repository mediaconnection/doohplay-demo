"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

import TrustScoreBreakdown from "./components/TrustScoreBreakdown"
import EnterpriseExplanation from "./components/EnterpriseExplanation"
import { VerificationMatrix } from "./components/VerificationMatrix"
import { LayerDetails } from "./components/LayerDetails"
import { ExecutionMetadata } from "./components/ExecutionMetadata"

import type {
  TrustScoreBreakdown as TrustScoreBreakdownType,
  VerificationLayer,
  VerificationResult
} from "./components/types"

export const dynamic = "force-dynamic"

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
  strengths?: string[]
  penalties?: string[]
  domains?: TrustScoreBreakdownType["domains"]
  layers?: VerificationLayer[] | null
  evidence?: {
    ledger?: boolean | null
    merkle?: boolean | null
    signature?: boolean | null
    anchoring?: boolean | null
    tx_hash?: string | null
    timestamp_token?: boolean | null
    source?: string | null
  } | null
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
        valid?: boolean | null
        weight?: number | null
        reasons?: string[]
      }>
    }
    compliance?: Record<string, unknown>
  } | null
  details?: {
    event_exists?: boolean | null
    event_id?: string | null
    event_type?: string | null
    source_table?: string | null
    source_id?: string | null
    device_id?: string | null
    campaign_id?: string | null
    occurred_at?: string | null
    created_at?: string | null
    event_hash_valid?: boolean | null
    payload_hash_present?: boolean | null
    previous_event_hash_present?: boolean | null
    chain_head?: boolean | null
    chain_valid?: boolean | null
    signature_present?: boolean | null
    signature_valid?: boolean | null
    merkle_included?: boolean | null
    merkle_proof_present?: boolean | null
    block_exists?: boolean | null
    block_id?: number | string | null
    block_hash?: string | null
    block_merkle_root?: string | null
    block_merkle_matches?: boolean | null
    anchored?: boolean | null
    blockchain_tx?: string | null
    block_tx_hash?: string | null
    tx_valid?: boolean | null
    timestamp_token_present?: boolean | null
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
      fingerprint?: string | null
      subject?: string | null
      issuer?: string | null
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
    input_hash?: string | null
    resolved_hash?: string | null
    entity_id?: string | null
    entity_type?: string | null
    generated_at?: string
    started_at?: string
    finished_at?: string
    duration_ms?: number
    execution_ms?: number
    latency_ms?: number
    total_time_ms?: number
    schema_version?: string
    confidence?: number
    request_id?: string
    engine_version?: string
    mode?: string
    source?: string
    score?: number
    cache_hit?: boolean
    queued?: boolean
    certification_found?: boolean | null
    certification_id?: string | null
    layers_enabled?: number
    layers_executed?: number
    enabled_layers?: string[]
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
  trust_score?: TrustScoreBreakdownType | null
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

function normalizeHash(hash: string): string {
  return hash.trim().toLowerCase().replace(/^0x/, "")
}

function formatHash0x(hash: string): string {
  return `0x${normalizeHash(hash)}`
}

function isValidHash(hash: string): boolean {
  return /^[a-f0-9]{64}$/i.test(hash)
}

function statusClasses(status?: VerifyResponse["status"] | string): string {
  if (status === "VERIFIED") return "bg-emerald-600 text-white"
  if (status === "WARNING") return "bg-amber-500 text-white"
  if (status === "PENDING") return "bg-sky-600 text-white"
  return "bg-rose-600 text-white"
}

function trustClasses(level?: VerifyResponse["trust_level"] | string): string {
  if (level === "HIGH") return "border-emerald-200 bg-emerald-50 text-emerald-700"
  if (level === "MEDIUM") return "border-amber-200 bg-amber-50 text-amber-700"
  return "border-rose-200 bg-rose-50 text-rose-700"
}

function riskClasses(level?: VerifyResponse["risk"] | string): string {
  if (level === "LOW") return "border-emerald-200 bg-emerald-50 text-emerald-700"
  if (level === "MEDIUM") return "border-amber-200 bg-amber-50 text-amber-700"
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

function getBooleanRecordValue(
  record: Record<string, unknown> | null | undefined,
  key: string
): boolean | undefined {
  if (!record || typeof record !== "object") return undefined
  const value = record[key]
  return typeof value === "boolean" ? value : undefined
}

function normalizeTrustScore(
  trustScore: VerifyResponse["trust_score"]
): TrustScoreBreakdownType | undefined {
  if (!trustScore || typeof trustScore !== "object") return undefined
  return {
    final_score:
      typeof trustScore.final_score === "number" && Number.isFinite(trustScore.final_score)
        ? trustScore.final_score
        : 0,
    trust_level: typeof trustScore.trust_level === "string" ? trustScore.trust_level : "LOW",
    methodology: typeof trustScore.methodology === "string" ? trustScore.methodology : "verify-enterprise-v3",
    domains: Array.isArray(trustScore.domains) ? trustScore.domains : [],
    strengths: safeStringArray(trustScore.strengths),
    penalties: safeStringArray(trustScore.penalties),
    summary: typeof trustScore.summary === "string" ? trustScore.summary : "Sem resumo metodológico disponível."
  }
}

function normalizeUiResult(data: VerifyResponse): VerificationResult {
  const details = data.details
  const technicalDetails =
    data.explanation?.technical_details && typeof data.explanation.technical_details === "object"
      ? data.explanation.technical_details
      : undefined
  const chain = details?.chain ?? {
    valid: details?.chain_valid,
    previous_event_hash: details?.chain?.previous_event_hash ?? data.chain?.previous_event_hash ?? data.event?.previous_event_hash ?? null,
    previous_event_exists: details?.chain?.previous_event_exists ?? undefined,
    is_chain_head: details?.chain_head ?? details?.chain?.is_chain_head ?? data.event?.is_chain_head ?? undefined
  }
  const merkle = details?.merkle ?? {
    included: details?.merkle_included ?? data.merkle?.included ?? undefined,
    merkle_root: details?.merkle?.merkle_root ?? details?.block_merkle_root ?? data.merkle?.merkle_root ?? data.event?.merkle_root ?? null,
    proof_present: details?.merkle_proof_present ?? data.merkle?.proof_present ?? undefined,
    proof_length: details?.merkle?.proof_length
  }
  const block = details?.block ?? {
    exists: details?.block_exists ?? data.block?.exists ?? undefined,
    block_id: details?.block_id ?? null,
    block_hash: details?.block_hash ?? data.block?.block_hash ?? null,
    prev_block_hash: details?.block?.prev_block_hash ?? data.block?.previous_hash ?? null
  }
  const blockchain = details?.blockchain ?? {
    anchored: details?.anchored ?? data.blockchain?.anchored ?? data.anchor?.anchored ?? undefined,
    anchored_at: details?.blockchain?.anchored_at ?? null,
    tx_hash: details?.blockchain?.tx_hash ?? details?.blockchain_tx ?? details?.block_tx_hash ?? data.blockchain?.tx_hash ?? (typeof data.anchor?.tx_hash === "string" ? data.anchor.tx_hash : typeof data.anchor?.tx_hash === "number" ? String(data.anchor.tx_hash) : null),
    tx_hash_format_valid: details?.blockchain?.tx_hash_format_valid ?? details?.tx_valid ?? data.blockchain?.tx_hash_format_valid ?? undefined,
    network: details?.blockchain?.network ?? data.anchor?.network ?? null
  }
  const certificate = details?.certificate ?? {
    found: details?.certificate?.found ?? data.verification?.certificate_exists ?? data.certificate?.exists ?? data.certificate?.certificate_present ?? undefined,
    valid: details?.certificate?.valid ?? data.certificate?.valid ?? undefined,
    cert_chain_valid: details?.certificate?.cert_chain_valid ?? data.verification?.cert_chain_valid ?? undefined,
    revoked: details?.certificate?.revoked ?? data.verification?.revoked ?? undefined,
    source_table: details?.certificate?.source_table ?? null,
    fingerprint: details?.certificate?.fingerprint ?? null,
    subject: details?.certificate?.subject ?? data.certificate?.subject ?? null,
    issuer: details?.certificate?.issuer ?? data.certificate?.issuer ?? null
  }
  const timestamp = details?.timestamp ?? {
    token_present: details?.timestamp?.token_present ?? details?.timestamp_token_present ?? data.tsa?.valid ?? data.block?.timestamp_token_present ?? data.evidence?.timestamp_token ?? undefined
  }
  const execution = details?.execution ?? {
    event_id: details?.execution?.event_id ?? details?.event_id ?? data.event?.event_id ?? null,
    created_at: details?.execution?.created_at ?? details?.created_at ?? data.event?.created_at ?? null,
    block_created_at: details?.execution?.block_created_at ?? data.block?.created_at ?? null
  }
  const anchored = blockchain?.anchored ?? data.evidence?.anchoring ?? undefined
  const txHash = blockchain?.tx_hash ?? data.evidence?.tx_hash ?? null
  const txHashFormatValid = blockchain?.tx_hash_format_valid ?? undefined
  const certificateFound = certificate?.found
  const certificateValid = certificate?.valid
  const certChainValid = certificate?.cert_chain_valid
  const certificateRevoked = certificate?.revoked
  const merkleIncluded = merkle?.included ?? data.verification?.merkle_valid ?? data.evidence?.merkle ?? getBooleanRecordValue(technicalDetails, "merkle_included") ?? getBooleanRecordValue(technicalDetails, "merkle") ?? undefined
  const merkleProofValid = merkle?.proof_present ?? getBooleanRecordValue(technicalDetails, "merkle_proof_valid") ?? undefined
  const merkleRootValid = getBooleanRecordValue(technicalDetails, "merkle_root_valid") ?? (typeof merkle?.merkle_root === "string" ? merkle.merkle_root.trim().length > 0 : undefined)
  const chainValid = chain?.valid ?? getBooleanRecordValue(technicalDetails, "chain_valid") ?? undefined
  const chainHead = chain?.is_chain_head ?? getBooleanRecordValue(technicalDetails, "chain_head") ?? undefined
  const timestampValid = timestamp?.token_present ?? getBooleanRecordValue(technicalDetails, "timestamp_valid") ?? getBooleanRecordValue(technicalDetails, "timestamp_token_present") ?? undefined
  const signaturePresent = details?.signature_present ?? data.event?.signature_present ?? data.evidence?.signature ?? getBooleanRecordValue(technicalDetails, "signature_present") ?? undefined
  const signatureValid = details?.signature_valid ?? data.verification?.signature_valid ?? getBooleanRecordValue(technicalDetails, "signature_valid") ?? undefined
  const blockchainValid = getBooleanRecordValue(technicalDetails, "blockchain_valid") ?? getBooleanRecordValue(technicalDetails, "blockchain") ?? data.blockchain?.confirmed ?? data.blockchain?.anchored ?? data.anchor?.confirmed ?? data.anchor?.anchored ?? (anchored === true && txHashFormatValid === true ? true : anchored === false || txHashFormatValid === false ? false : anchored ?? undefined)
  const generatedAt = typeof data.meta?.generated_at === "string" ? data.meta.generated_at : data.verified_at
  const normalizedTrustScore = normalizeTrustScore(data.trust_score) ?? (typeof data.score === "number" ? {
    final_score: data.score,
    trust_level: data.trust_level ?? data.trust ?? "LOW",
    methodology: "verify-enterprise-v3",
    domains: Array.isArray(data.domains) ? data.domains : [],
    strengths: safeStringArray(data.strengths),
    penalties: safeStringArray(data.penalties),
    summary: data.meta?.cross_layer_summary ?? data.explanation?.summary ?? data.summary ?? (data.pending === true || data.status === "PENDING" ? "A validação foi enfileirada e ainda está em processamento." : "Sem resumo metodológico disponível.")
  } : undefined)
  const strengths = safeStringArray(data.strengths).length > 0 ? safeStringArray(data.strengths) : normalizedTrustScore?.strengths ?? []
  const penalties = safeStringArray(data.penalties).length > 0 ? safeStringArray(data.penalties) : normalizedTrustScore?.penalties ?? []
  const domains = Array.isArray(data.domains) && data.domains.length > 0 ? data.domains : normalizedTrustScore?.domains ?? []
  const normalizedEvidence = {
    ledger: data.evidence?.ledger ?? details?.block_exists ?? details?.block?.exists ?? getBooleanRecordValue(technicalDetails, "block_exists") ?? undefined,
    merkle: data.evidence?.merkle ?? details?.merkle_included ?? getBooleanRecordValue(technicalDetails, "merkle_included") ?? undefined,
    signature: data.evidence?.signature ?? signaturePresent ?? undefined,
    anchoring: data.evidence?.anchoring ?? details?.anchored ?? getBooleanRecordValue(technicalDetails, "anchored") ?? undefined,
    tx_hash: data.evidence?.tx_hash ?? txHash ?? null,
    timestamp_token: data.evidence?.timestamp_token ?? details?.timestamp_token_present ?? getBooleanRecordValue(technicalDetails, "timestamp_token_present") ?? undefined,
    source: data.evidence?.source ?? data.source ?? (typeof data.meta?.source === "string" ? data.meta.source : null)
  }
  const normalizedEventHash = data.hash_0x ?? (typeof data.meta?.resolved_hash === "string" ? formatHash0x(data.meta.resolved_hash) : null) ?? (typeof data.hash === "string" ? formatHash0x(data.hash) : null) ?? (typeof data.meta?.hash === "string" ? formatHash0x(data.meta.hash) : null) ?? (typeof data.meta?.input_hash === "string" ? formatHash0x(data.meta.input_hash) : null) ?? data.event?.event_hash ?? null
  return {
    status: data.status,
    trust_level: data.trust_level ?? data.trust,
    risk_level: data.risk_level ?? data.risk,
    score: typeof data.score === "number" ? data.score : typeof data.explanation?.score === "number" ? data.explanation.score : undefined,
    confidence: typeof data.meta?.confidence === "number" ? data.meta.confidence : undefined,
    reasons: safeStringArray(data.reasons),
    errors: safeStringArray(data.debug?.errors),
    summary: data.meta?.cross_layer_summary ?? data.explanation?.summary ?? normalizedTrustScore?.summary ?? data.summary ?? (data.pending === true || data.status === "PENDING" ? "A validação foi enfileirada e ainda está em processamento." : undefined),
    explanation: {
      summary: data.meta?.cross_layer_summary ?? data.explanation?.summary ?? normalizedTrustScore?.summary ?? data.summary ?? (data.pending === true || data.status === "PENDING" ? "A validação foi enfileirada e ainda está em processamento." : undefined),
      status: data.explanation?.status ?? data.status,
      score: typeof data.explanation?.score === "number" ? data.explanation.score : typeof data.score === "number" ? data.score : undefined,
      trust_level: data.explanation?.trust_level ?? data.trust_level ?? data.trust ?? undefined,
      key_factors: safeStringArray(data.explanation?.key_factors).length > 0 ? safeStringArray(data.explanation?.key_factors) : normalizedTrustScore?.strengths ?? [],
      risk_factors: safeStringArray(data.explanation?.risk_factors).length > 0 ? safeStringArray(data.explanation?.risk_factors) : normalizedTrustScore?.penalties ?? [],
      recommendation: data.explanation?.recommendation,
      audit_flags: safeStringArray(data.explanation?.audit_flags),
      technical_details: data.explanation?.technical_details,
      audit: data.explanation?.audit,
      compliance: data.explanation?.compliance
    },
    details: {
      event_exists: details?.event_exists ?? data.verification?.event_exists ?? data.event?.exists,
      hash_valid: details?.event_hash_valid ?? data.verification?.event_hash_valid,
      signature_valid: signatureValid,
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
      event_id: details?.event_id,
      event_type: details?.event_type,
      source_table: details?.source_table,
      source_id: details?.source_id,
      device_id: details?.device_id,
      campaign_id: details?.campaign_id,
      occurred_at: details?.occurred_at,
      created_at: details?.created_at,
      event_hash_valid: details?.event_hash_valid,
      payload_hash_present: details?.payload_hash_present,
      previous_event_hash_present: details?.previous_event_hash_present,
      signature_present: signaturePresent,
      merkle_included: details?.merkle_included ?? merkleIncluded,
      merkle_proof_present: details?.merkle_proof_present ?? merkleProofValid,
      block_exists: details?.block_exists,
      block_id: details?.block_id,
      block_hash: details?.block_hash,
      block_merkle_root: details?.block_merkle_root,
      block_merkle_matches: details?.block_merkle_matches,
      blockchain_tx: details?.blockchain_tx,
      block_tx_hash: details?.block_tx_hash,
      tx_valid: details?.tx_valid,
      timestamp_token_present: details?.timestamp_token_present,
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
      started_at: typeof data.meta?.started_at === "string" ? data.meta.started_at : undefined,
      finished_at: typeof data.meta?.finished_at === "string" ? data.meta.finished_at : undefined,
      duration_ms: typeof data.meta?.duration_ms === "number" ? data.meta.duration_ms : typeof data.meta?.execution_ms === "number" ? data.meta.execution_ms : undefined,
      execution_ms: typeof data.meta?.execution_ms === "number" ? data.meta.execution_ms : typeof data.meta?.duration_ms === "number" ? data.meta.duration_ms : undefined,
      latency_ms: data.debug?.latency_ms ?? (typeof data.meta?.duration_ms === "number" ? data.meta.duration_ms : typeof data.meta?.latency_ms === "number" ? data.meta.latency_ms : undefined),
      total_time_ms: (typeof data.meta?.duration_ms === "number" ? data.meta.duration_ms : typeof data.meta?.total_time_ms === "number" ? data.meta.total_time_ms : undefined) ?? data.debug?.latency_ms,
      request_id: typeof data.meta?.request_id === "string" ? data.meta.request_id : undefined,
      engine_version: typeof data.meta?.engine_version === "string" ? data.meta.engine_version : undefined,
      schema_version: typeof data.meta?.schema_version === "string" ? data.meta.schema_version : undefined,
      mode: typeof data.meta?.mode === "string" ? data.meta.mode : undefined,
      source: data.source ?? (typeof data.meta?.source === "string" ? data.meta.source : undefined),
      hash: typeof data.meta?.hash === "string" ? data.meta.hash : undefined,
      input_hash: typeof data.meta?.input_hash === "string" ? data.meta.input_hash : undefined,
      resolved_hash: typeof data.meta?.resolved_hash === "string" ? data.meta.resolved_hash : undefined,
      entity_id: typeof data.meta?.entity_id === "string" ? data.meta.entity_id : undefined,
      entity_type: typeof data.meta?.entity_type === "string" ? data.meta.entity_type : undefined,
      score: typeof data.score === "number" ? data.score : typeof data.meta?.score === "number" ? data.meta.score : typeof data.explanation?.score === "number" ? data.explanation.score : undefined,
      confidence: typeof data.meta?.confidence === "number" ? data.meta.confidence : undefined,
      cache_hit: typeof data.meta?.cache_hit === "boolean" ? data.meta.cache_hit : undefined,
      queued: typeof data.meta?.queued === "boolean" ? data.meta.queued : data.pending === true ? true : undefined,
      certification_found: typeof data.meta?.certification_found === "boolean" ? data.meta.certification_found : undefined,
      certification_id: typeof data.meta?.certification_id === "string" ? data.meta.certification_id : data.meta?.certification_id === null ? null : undefined,
      evidence_sources: typeof data.meta?.evidence_sources === "object" && data.meta?.evidence_sources ? data.meta.evidence_sources : undefined,
      layers_enabled: typeof data.meta?.layers_enabled === "number" ? data.meta.layers_enabled : undefined,
      layers_executed: typeof data.meta?.layers_executed === "number" ? data.meta.layers_executed : undefined,
      enabled_layers: Array.isArray(data.meta?.enabled_layers) ? data.meta.enabled_layers : undefined,
      cross_layer_valid: typeof data.meta?.cross_layer_valid === "boolean" ? data.meta.cross_layer_valid : undefined,
      cross_layer_consistent: typeof data.meta?.cross_layer_consistent === "boolean" ? data.meta.cross_layer_consistent : undefined,
      cross_layer_summary: typeof data.meta?.cross_layer_summary === "string" ? data.meta.cross_layer_summary : undefined,
      cross_layer_issues: Array.isArray(data.meta?.cross_layer_issues) ? data.meta.cross_layer_issues : undefined
    },
    trust_score: normalizedTrustScore,
    strengths,
    penalties,
    domains,
    evidence: normalizedEvidence,
    event_hash: normalizedEventHash,
    timestamp: execution?.created_at ?? data.event?.timestamp ?? data.event?.occurred_at ?? generatedAt,
    anchor_tx_hash: txHash,
    certificate_subject: certificate?.subject ?? data.certificate?.subject ?? null,
    certificate_issuer: certificate?.issuer ?? data.certificate?.issuer ?? null,
    source: data.source ?? (typeof data.meta?.source === "string" ? data.meta.source : null),
    request_id: typeof data.meta?.request_id === "string" ? data.meta.request_id : null
  }
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

export default function VerifyPage() {
  const [hash, setHash] = useState("")
  const [data, setData] = useState<VerifyResponse | null>(null)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [isNotFound, setIsNotFound] = useState(false)

  useEffect(() => {
    const parts = window.location.pathname.split("/")
    const rawHash = parts[parts.length - 1] ?? ""
    const h = normalizeHash(rawHash)

    if (!h || !isValidHash(h)) {
      setFetchError("Formato de hash inválido.")
      setLoading(false)
      return
    }

    setHash(h)
    let cancelled = false

    const doFetch = async () => {
      try {
        const res = await fetch(`/api/verify/${h}`, {
          cache: "no-store",
          headers: { Accept: "application/json" }
        })

        if (cancelled) return

        if (res.status === 404) {
          setIsNotFound(true)
          return
        }

        const json = (await res.json()) as VerifyResponse

        if (res.ok && typeof json.score === "number" && json.score > 0) {
          setData(json)
          return
        }

        const entityId = json.meta?.entity_id
        if (entityId) {
          try {
            const retryRes = await fetch(
              `/api/verify/${h}?entity_id=${entityId}&entity_type=event`,
              { cache: "no-store", headers: { Accept: "application/json" } }
            )
            if (!cancelled) {
              const retryJson = (await retryRes.json()) as VerifyResponse
              if (typeof retryJson.score === "number" && retryJson.score > 0) {
                setData(retryJson)
                return
              }
            }
          } catch {}
        }

        if (!res.ok || json.error === "PROOF_NOT_FOUND") {
          if (json.error === "PROOF_NOT_FOUND") {
            setIsNotFound(true)
            return
          }
          setFetchError(json.message || json.error || "Erro ao consultar a verificação.")
          return
        }

        setData(json)
      } catch {
        if (!cancelled) setFetchError("Erro ao consultar a verificação.")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    doFetch()
    return () => { cancelled = true }
  }, [])

  if (isNotFound) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <p className="font-semibold text-amber-800">Prova não encontrada</p>
          <p className="mt-2 text-sm text-amber-700">
            Nenhum registro foi localizado no ledger público para este hash.
          </p>
          <Link
            href="/verify"
            className="mt-4 inline-block text-sm text-amber-800 underline hover:text-amber-900"
          >
            ← Voltar para verificação
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-sm text-slate-500">A verificar...</p>
      </main>
    )
  }

  if (fetchError) return renderErrorCard(fetchError)

  if (!data) return renderErrorCard("Sem dados de verificação disponíveis.")

  const normalized = normalizeUiResult(data)

  const status = normalized.status ?? "FAILED"
  const trustLevel = normalized.trust_level ?? "LOW"
  const riskLevel = normalized.risk_level
  const verifiedHash = normalized.event_hash ?? formatHash0x(hash)
  const summary = normalized.summary ?? "Nenhum resumo disponível."

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
              <span className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${statusClasses(status)}`}>
                {status}
              </span>
              <span className={`inline-flex rounded-full border px-4 py-2 text-sm font-semibold ${trustClasses(trustLevel)}`}>
                Trust {trustLevel}
              </span>
              <span className={`inline-flex rounded-full border px-4 py-2 text-sm font-semibold ${riskClasses(riskLevel)}`}>
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
              <a href={data.links.explorer_event_url} target="_blank" rel="noreferrer" className="rounded-xl border border-slate-200 px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-50">
                Abrir Explorer do Evento
              </a>
            ) : null}
            {data.links?.explorer_block_url ? (
              <a href={data.links.explorer_block_url} target="_blank" rel="noreferrer" className="rounded-xl border border-slate-200 px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-50">
                Abrir Explorer do Bloco
              </a>
            ) : null}
            {data.links?.polygon_url ? (
              <a href={data.links.polygon_url} target="_blank" rel="noreferrer" className="rounded-xl border border-slate-200 px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-50">
                Ver na Polygon
              </a>
            ) : null}
          </div>
        </section>

        <div className="mt-6 space-y-6">
          <TrustScoreBreakdown result={normalized} />
          <EnterpriseExplanation result={normalized} />
          <VerificationMatrix result={normalized} />
          <LayerDetails result={normalized} />
          <ExecutionMetadata result={normalized} />
        </div>
      </div>
    </main>
  )
}
