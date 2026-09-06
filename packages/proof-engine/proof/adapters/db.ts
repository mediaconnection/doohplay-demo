// @ts-nocheck
import { pool } from "@/lib/db"
import type { CertificationRecord, EntityType } from "../types"
import { normalizeHex } from "../helpers/hash"

type CertificationRow = {
  id?: string
  content_hash: string
  entity_id: string
  entity_type: EntityType
  merkle_root?: string | null
  merkle_proof?: unknown
  blockchain_tx?: string | null
  signature?: string | null
  certificate_url?: string | null
  created_at?: string
}

function normalizeProof(input: unknown): string[] | null {
  if (!input) return null

  if (Array.isArray(input)) {
    return input.map((value) => String(value))
  }

  if (typeof input === "string") {
    try {
      const parsed = JSON.parse(input)

      if (Array.isArray(parsed)) {
        return parsed.map((value) => String(value))
      }
    } catch {
      return null
    }
  }

  return null
}

export async function findCertificationByEntity(
  entityId: string,
  entityType: EntityType
): Promise<CertificationRecord | null> {
  const res = await pool.query(
    `
    select
      id,
      content_hash,
      entity_id,
      entity_type,
      merkle_root,
      merkle_proof,
      blockchain_tx,
      signature,
      certificate_url,
      created_at
    from public.digital_certifications
    where entity_id = $1
      and entity_type = $2
    order by created_at desc nulls last
    limit 1
    `,
    [entityId, entityType]
  )

  const rows = res.rows as CertificationRow[]
  const row = rows[0]

  if (!row) return null

  return {
    id: row.id,
    content_hash: normalizeHex(row.content_hash),
    entity_id: row.entity_id,
    entity_type: row.entity_type,
    merkle_root: row.merkle_root ? normalizeHex(row.merkle_root) : null,
    merkle_proof: normalizeProof(row.merkle_proof),
    blockchain_tx: row.blockchain_tx ?? null,
    signature: row.signature ?? null,
    certificate_url: row.certificate_url ?? null,
    created_at: row.created_at
  }
}
