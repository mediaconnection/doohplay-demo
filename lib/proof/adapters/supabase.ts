// @ts-nocheck
import { pool } from "@/lib/db"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

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

type LedgerEventRow = {
  event_id: string
  event_hash: string
  block_id: string | number | null
  merkle_proof: unknown
  merkle_root: string | null
  tx_hash: string | null
  signature: string | null
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
    }

    const rawHash = record.hash ?? record.sibling ?? record.value
    const rawPosition = record.position ?? record.side ?? record.direction

    const hash = normalizeHash(rawHash)
    if (!hash || !isHex64(hash)) continue

    const position =
      rawPosition === "left" || rawPosition === "right"
        ? rawPosition
        : undefined

    normalized.push(position ? { hash, position } : { hash })
  }

  return normalized.length > 0 ? normalized : null
}

function isEntityType(value: unknown): value is EntityType {
  return value === "event" || value === "campaign" || value === "block"
}

function isCertificationRow(value: unknown): value is CertificationRow {
  return !!value && typeof value === "object" && !Array.isArray(value)
}

function mapCertification(row: CertificationRow): CertificationRecord | null {
  const contentHash = normalizeHash(row.content_hash)
  const entityId = normalizeString(row.entity_id)

  if (
    !contentHash ||
    !isHex64(contentHash) ||
    !entityId ||
    !isEntityType(row.entity_type)
  ) {
    return null
  }

  return {
    id: normalizeString(row.id) ?? undefined,
    content_hash: contentHash,
    entity_id: entityId,
    entity_type: row.entity_type,
    merkle_root: (() => {
      const root = normalizeHash(row.merkle_root)
      return root && isHex64(root) ? root : null
    })(),
    merkle_proof: normalizeProof(row.merkle_proof),
    blockchain_tx: normalizeTxHash(row.blockchain_tx),
    tx_hash: normalizeTxHash(row.tx_hash ?? row.blockchain_tx),
    signature: normalizeString(row.signature),
    certificate_url: normalizeString(row.certificate_url),
    created_at: normalizeString(row.created_at) ?? undefined,
    updated_at: normalizeString(row.updated_at) ?? undefined
  }
}

async function getLedgerEventCertification(
  hash: string,
  entityId?: string
): Promise<CertificationRecord | null> {
  const normalizedHash = normalizeHash(hash)
  if (!normalizedHash || !isHex64(normalizedHash)) return null

  const params: unknown[] = [normalizedHash]
  const entityFilter = entityId ? "and e.event_id::text = $2" : ""

  if (entityId) params.push(entityId)

  const result = await pool.query(
    `
    select
      e.event_id::text as event_id,
      e.event_hash,
      e.block_id,
      e.merkle_proof,
      e.signature,
      b.merkle_root,
      b.tx_hash
    from public.event_chain e
    left join public.event_blocks b on b.id = e.block_id
    where lower(replace(e.event_hash, '0x', '')) = $1
    ${entityFilter}
    limit 1
    `,
    params
  )

  const rows = result.rows as LedgerEventRow[]
  const row = rows[0]

  if (!row?.event_id) return null

  const merkleRoot = normalizeHash(row.merkle_root)

  return {
    content_hash: normalizedHash,
    entity_id: row.event_id,
    entity_type: "event",
    merkle_root: merkleRoot && isHex64(merkleRoot) ? merkleRoot : null,
    merkle_proof: normalizeProof(row.merkle_proof),
    blockchain_tx: normalizeTxHash(row.tx_hash),
    tx_hash: normalizeTxHash(row.tx_hash),
    signature: normalizeString(row.signature),
  }
}

async function getLedgerBlockCertification(
  hash: string,
  entityId?: string
): Promise<CertificationRecord | null> {
  const normalizedHash = normalizeHash(hash)
  if (!normalizedHash || !isHex64(normalizedHash)) return null

  const params: unknown[] = [normalizedHash]
  const entityFilter = entityId ? "and id::text = $2" : ""

  if (entityId) params.push(entityId)

  const result = await pool.query(
    `
    select
      id::text as id,
      block_hash,
      merkle_root,
      tx_hash
    from public.event_blocks
    where (
      lower(replace(block_hash, '0x', '')) = $1
      or lower(replace(merkle_root, '0x', '')) = $1
      or lower(replace(coalesce(tx_hash, ''), '0x', '')) = $1
    )
    ${entityFilter}
    limit 1
    `,
    params
  )

  const rows = result.rows as LedgerBlockRow[]
  const row = rows[0]

  if (!row?.id) return null

  const contentHash =
    normalizeHash(row.block_hash) ??
    normalizeHash(row.merkle_root) ??
    normalizedHash

  const merkleRoot = normalizeHash(row.merkle_root)

  return {
    content_hash: contentHash,
    entity_id: row.id,
    entity_type: "block",
    merkle_root: merkleRoot && isHex64(merkleRoot) ? merkleRoot : null,
    merkle_proof: null,
    blockchain_tx: normalizeTxHash(row.tx_hash),
    tx_hash: normalizeTxHash(row.tx_hash)
  }
}

async function getCertificationByHashFromSupabase(
  hash: string,
  options?: PublicLookupOptions
): Promise<CertificationRecord | null> {
  const normalizedHash = normalizeHash(hash)
  if (!normalizedHash || !isHex64(normalizedHash)) return null

  try {
    const query = supabaseAdmin
      .from("certifications")
      .select(`
        id,
        content_hash,
        entity_id,
        entity_type,
        merkle_root,
        merkle_proof,
        blockchain_tx,
        tx_hash,
        signature,
        certificate_url,
        created_at,
        updated_at
      `)
      .eq("content_hash", normalizedHash)

    const constrainedQuery =
      options?.entity_type && isEntityType(options.entity_type)
        ? query.eq("entity_type", options.entity_type)
        : query.in("entity_type", [...ENTITY_TYPES])

    const { data, error } = await constrainedQuery
      .order("created_at", { ascending: false })
      .limit(20)

    if (error || !Array.isArray(data) || data.length === 0) return null

    for (const row of data) {
      if (!isCertificationRow(row)) continue

      const mapped = mapCertification(row)
      if (mapped) return mapped
    }

    return null
  } catch {
    return null
  }
}

export async function getCertification(
  input: ProofInput
): Promise<CertificationRecord | null> {
  const normalizedHash = normalizeHash(input.hash)
  const normalizedEntityId = normalizeString(input.entity_id)

  if (
    !normalizedHash ||
    !isHex64(normalizedHash) ||
    !normalizedEntityId ||
    !isEntityType(input.entity_type)
  ) {
    return null
  }

  if (input.entity_type === "event") {
    const ledger = await getLedgerEventCertification(
      normalizedHash,
      normalizedEntityId
    )

    if (ledger) return ledger
  }

  if (input.entity_type === "block") {
    const ledger = await getLedgerBlockCertification(
      normalizedHash,
      normalizedEntityId
    )

    if (ledger) return ledger
  }

  const fallback = await getCertificationByHashFromSupabase(normalizedHash, {
    entity_type: input.entity_type
  })

  if (
    fallback &&
    fallback.entity_id === normalizedEntityId &&
    fallback.entity_type === input.entity_type
  ) {
    return fallback
  }

  return null
}

export async function getCertificationByHash(
  hash: string,
  options?: PublicLookupOptions
): Promise<CertificationRecord | null> {
  const normalizedHash = normalizeHash(hash)

  if (!normalizedHash || !isHex64(normalizedHash)) return null

  if (!options?.entity_type || options.entity_type === "event") {
    const ledgerEvent = await getLedgerEventCertification(normalizedHash)
    if (ledgerEvent) return ledgerEvent
  }

  if (!options?.entity_type || options.entity_type === "block") {
    const ledgerBlock = await getLedgerBlockCertification(normalizedHash)
    if (ledgerBlock) return ledgerBlock
  }

  return getCertificationByHashFromSupabase(normalizedHash, options)
}

export async function resolveProofInputByHash(
  hash: string,
  options?: PublicLookupOptions
): Promise<ProofInput | null> {
  const certification = await getCertificationByHash(hash, options)

  if (!certification) return null

  return {
    hash: certification.content_hash,
    entity_id: certification.entity_id,
    entity_type: certification.entity_type
  }
}
