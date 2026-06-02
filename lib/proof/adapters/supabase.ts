// @ts-nocheck
// build-trigger: 2026-06-01T21:00:00Z
import { pool } from "@/lib/db"
import { createClient as _sbCreate } from "@supabase/supabase-js"

const supabaseAdmin = _sbCreate(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }
)

import type {
  CertificationRecord,
  EntityType,
  MerkleProofNode,
  ProofInput
} from "../types"

type CertificationRow = {
  id?: string | null
  content_hash?: string | null
  entity_id?: string | null
  entity_type?: EntityType | null
  merkle_root?: string | null
  merkle_proof?: unknown
  blockchain_tx?: string | null
  tx_hash?: string | null
  signature?: string | null
  certificate_url?: string | null
  created_at?: string | null
  updated_at?: string | null
}

type DigitalCertificationRow = {
  id?: string | null
  content_hash?: string | null
  signed_hash?: string | null
  certificate_serial?: string | null
  certificate_authority?: string | null
  timestamp_token?: string | null
  issued_at?: string | null
  expires_at?: string | null
  proof_url?: string | null
  immutable?: boolean | null
  is_public?: boolean | null
  event?: {
    event_id?: string | null
    event_type?: string | null
    occurred_at?: string | null
    payload?: unknown
    actor?: unknown
    context?: unknown
    schema_version?: string | null
  } | null
}

type LedgerEventRow = {
  event_id: string
  event_hash: string
  block_id: string | number | null
  merkle_proof: unknown
  merkle_root: string | null
  tx_hash: string | null
  signature: string | null
  tsa_token: string | null
  tsa_timestamp: string | null
}

type LedgerBlockRow = {
  id: string
  block_hash: string | null
  merkle_root: string | null
  tx_hash: string | null
}

type PublicLookupOptions = {
  entity_type?: EntityType
}

const ENTITY_TYPES: readonly EntityType[] = ["event", "campaign", "block"]

function normalizeString(value: unknown): string | null {
  if (typeof value !== "string") return null
  const normalized = value.trim()
  return normalized || null
}

function normalizeHash(value: unknown): string | null {
  if (typeof value !== "string") return null
  const normalized = value.trim().toLowerCase().replace(/^0x/, "")
  return normalized || null
}

function isHex64(value: string | null | undefined): boolean {
  return typeof value === "string" && /^[a-f0-9]{64}$/i.test(value)
}

function normalizeTxHash(value: unknown): string | null {
  const normalized = normalizeHash(value)
  return isHex64(normalized) ? `0x${normalized}` : null
}

function normalizeProof(proof: unknown): MerkleProofNode[] | null {
  if (!Array.isArray(proof)) return null

  const normalized: MerkleProofNode[] = []

  for (const item of proof) {
    if (typeof item === "string") {
      const hash = normalizeHash(item)
      if (hash && isHex64(hash)) normalized.push(hash)
      continue
    }

    if (!item || typeof item !== "object" || Array.isArray(item)) continue

    const record = item as {
      hash?: unknown
      sibling?: unknown
      value?: unknown
      position?: unknown
      side?: unknown
      direction?: unknown
