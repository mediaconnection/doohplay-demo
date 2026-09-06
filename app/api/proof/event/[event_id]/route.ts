import { NextRequest, NextResponse } from "next/server"

import { pool } from "@/lib/db"
import { verifyEventHash } from "@/lib/crypto/ledgerVerify"
import { verifyMerkleProof } from "@proof-engine/proof/merkle/verifyMerkleProof"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type ProofRow = {
  event_id: string
  event_hash: string | null
  merkle_root: string | null
  signature: string | null
  block_height: number | string | null
  occurred_at: string | Date | null
  block_hash: string | null
  merkle_proof: unknown | null
  payload: unknown | null
}

type MerkleProofItem =
  | string
  | {
      position?: "left" | "right"
      hash: string
    }

function safeString(value: unknown): string | null {
  if (typeof value !== "string") return null

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function normalizeHash(value: unknown): string | null {
  if (typeof value !== "string") return null

  const normalized = value.trim().toLowerCase().replace(/^0x/, "")
  return /^[a-f0-9]{64}$/.test(normalized) ? normalized : null
}

function safeNumber(value: unknown): number | null {
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function toIsoOrNull(value: string | Date | null): string | null {
  if (!value) return null

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

function normalizePosition(value: unknown): "left" | "right" | undefined {
  if (typeof value !== "string") return undefined

  const normalized = value.trim().toLowerCase()
  return normalized === "left" || normalized === "right" ? normalized : undefined
}

function parseMerkleProofItem(item: unknown): MerkleProofItem | null {
  if (typeof item === "string") {
    return normalizeHash(item)
  }

  if (!item || typeof item !== "object" || Array.isArray(item)) {
    return null
  }

  const record = item as Record<string, unknown>

  const hash =
    normalizeHash(record.hash) ??
    normalizeHash(record.sibling) ??
    normalizeHash(record.value)

  if (!hash) return null

  const position =
    normalizePosition(record.position) ??
    normalizePosition(record.side) ??
    normalizePosition(record.direction)

  return position ? { position, hash } : { hash }
}

function parseMerkleProof(value: unknown): MerkleProofItem[] {
  if (!value) return []

  let parsed: unknown = value

  if (typeof value === "string") {
    try {
      parsed = JSON.parse(value)
    } catch {
      const hash = normalizeHash(value)
      return hash ? [hash] : []
    }
  }

  if (!Array.isArray(parsed)) return []

  return parsed
    .map((item) => parseMerkleProofItem(item))
    .filter((item): item is MerkleProofItem => item !== null)
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ event_id: string }> }
) {
  void req

  try {
    const { event_id } = await context.params
    const eventId = safeString(event_id)

    if (!eventId) {
      return NextResponse.json(
        { success: false, error: "EVENT_ID_REQUIRED" },
        { status: 400 }
      )
    }

    const result = await pool.query(
      `
      SELECT
        e.event_id::text AS event_id,
        e.event_hash,
        e.merkle_root,
        e.signature,
        e.block_height,
        e.occurred_at,
        e.merkle_proof,
        e.payload,
        b.block_hash
      FROM public.event_chain e
      LEFT JOIN public.ledger_blocks b
        ON e.block_height = b.block_height
      WHERE e.event_id::text = $1
      LIMIT 1
      `,
      [eventId]
    )

    const rows = result.rows as ProofRow[]
    const event = rows[0]

    if (!event) {
      return NextResponse.json(
        { success: false, error: "EVENT_NOT_FOUND" },
        { status: 404 }
      )
    }

    const eventHash = normalizeHash(event.event_hash)
    const merkleRoot = normalizeHash(event.merkle_root)
    const merkleProof = parseMerkleProof(event.merkle_proof)

    let eventHashValid = false

    if (eventHash && event.payload) {
      try {
        eventHashValid = verifyEventHash({
          payload: event.payload,
          event_hash: eventHash
        })
      } catch {
        eventHashValid = false
      }
    }

    let merkleValid = false

    if (eventHash && merkleRoot && merkleProof.length > 0) {
      try {
        const _mvr = verifyMerkleProof({
          leaf: eventHash,
          proof: merkleProof,
          root: merkleRoot
        })
        merkleValid = typeof _mvr === "boolean" ? _mvr : _mvr.valid
      } catch {
        merkleValid = false
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          proof: {
            event_id: event.event_id,
            event_hash: eventHash,
            block_height: safeNumber(event.block_height),
            block_hash: normalizeHash(event.block_hash),
            merkle_root: merkleRoot,
            signature: event.signature,
            timestamp: toIsoOrNull(event.occurred_at)
          },
          merkle_proof: merkleProof,
          verification: {
            event_hash_valid: eventHashValid,
            merkle_valid: merkleValid
          }
        },
        meta: {
          generated_at: new Date().toISOString()
        }
      },
      {
        headers: {
          "Cache-Control": "no-store"
        }
      }
    )
  } catch (error) {
    console.error("PROOF_EVENT_ROUTE_ERROR", error)

    return NextResponse.json(
      {
        success: false,
        error: "INTERNAL_SERVER_ERROR",
        detail: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}