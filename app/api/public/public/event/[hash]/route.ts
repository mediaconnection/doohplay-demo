import { NextRequest, NextResponse } from "next/server"

import { generateMerkleProof } from "@/lib/crypto/generateMerkleProof"
import { pool } from "@/lib/db"
import { verifyMerkleProof } from "@/lib/proof/merkle/verifyMerkleProof"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type EventRow = {
  event_hash: string | null
  block_id: number | string | null
  merkle_root: string | null
  tx_hash: string | null
}

type BlockEventRow = {
  event_hash: string | null
}

type MerkleProofPosition = "left" | "right"

type MerkleProofItem = {
  position: MerkleProofPosition
  hash: string
}

type RawMerkleProofItem =
  | string
  | {
      position?: unknown
      side?: unknown
      direction?: unknown
      hash?: unknown
      sibling?: unknown
      value?: unknown
    }

type GeneratedMerkleProof = {
  merkle_root?: string | null
  root?: string | null
  proof?: RawMerkleProofItem[] | null
}

function normalizeHash(value: unknown): string | null {
  if (typeof value !== "string") return null

  const normalized = value.trim().toLowerCase().replace(/^0x/, "")
  return /^[a-f0-9]{64}$/.test(normalized) ? normalized : null
}

function normalizeTxHash(value: unknown): string | null {
  if (typeof value !== "string") return null

  const normalized = value.trim().toLowerCase()

  if (/^0x[a-f0-9]{64}$/.test(normalized)) return normalized
  if (/^[a-f0-9]{64}$/.test(normalized)) return `0x${normalized}`

  return null
}

function normalizePosition(value: unknown): MerkleProofPosition | null {
  if (typeof value !== "string") return null

  const normalized = value.trim().toLowerCase()

  return normalized === "left" || normalized === "right"
    ? normalized
    : null
}

function normalizeProofItem(item: unknown): MerkleProofItem | null {
  if (typeof item === "string") {
    const hash = normalizeHash(item)

    return hash
      ? {
          position: "right",
          hash
        }
      : null
  }

  if (!item || typeof item !== "object" || Array.isArray(item)) {
    return null
  }

  const record = item as Record<string, unknown>

  const hash =
    normalizeHash(record.hash) ??
    normalizeHash(record.sibling) ??
    normalizeHash(record.value)

  if (!hash) {
    return null
  }

  const position =
    normalizePosition(record.position) ??
    normalizePosition(record.side) ??
    normalizePosition(record.direction) ??
    "right"

  return {
    position,
    hash
  }
}

function normalizeProof(proof: unknown): MerkleProofItem[] {
  if (!Array.isArray(proof)) return []

  return proof
    .map((item) => normalizeProofItem(item))
    .filter((item): item is MerkleProofItem => item !== null)
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ hash: string }> }
) {
  void req

  try {
    const { hash: rawHash } = await context.params

    const hash = normalizeHash(rawHash)

    if (!hash) {
      return NextResponse.json(
        {
          error: "INVALID_HASH"
        },
        { status: 400 }
      )
    }

    const eventRes = await pool.query(
      `
      SELECT
        e.event_hash,
        e.block_id,
        b.merkle_root,
        b.tx_hash
      FROM public.event_chain e
      LEFT JOIN public.event_blocks b
        ON e.block_id = b.id
      WHERE lower(replace(e.event_hash, '0x', '')) = $1
      LIMIT 1
      `,
      [hash]
    )

    const eventRows = eventRes.rows as EventRow[]
    const event = eventRows[0]

    if (!event) {
      return NextResponse.json(
        {
          error: "EVENT_NOT_FOUND"
        },
        { status: 404 }
      )
    }

    if (!event.block_id) {
      return NextResponse.json(
        {
          error: "EVENT_NOT_ANCHORED_YET"
        },
        { status: 409 }
      )
    }

    const blockRes = await pool.query(
      `
      SELECT event_hash
      FROM public.event_chain
      WHERE block_id = $1
      ORDER BY created_at ASC NULLS LAST, event_id ASC
      `,
      [event.block_id]
    )

    const blockRows = blockRes.rows as BlockEventRow[]

    const leaves = blockRows
      .map((row) => normalizeHash(row.event_hash))
      .filter((item): item is string => item !== null)

    if (!leaves.length) {
      return NextResponse.json(
        {
          error: "EMPTY_BLOCK"
        },
        { status: 500 }
      )
    }

    if (!leaves.includes(hash)) {
      return NextResponse.json(
        {
          error: "EVENT_NOT_IN_BLOCK"
        },
        { status: 409 }
      )
    }

    const generated = generateMerkleProof(
      leaves,
      hash
    ) as GeneratedMerkleProof

    const proof = normalizeProof(generated.proof)

    const merkleRoot = normalizeHash(
      generated.merkle_root ?? generated.root
    )

    const storedRoot = normalizeHash(event.merkle_root)
    const txHash = normalizeTxHash(event.tx_hash)

    const merkleValid =
      Boolean(storedRoot && proof.length > 0) &&
      verifyMerkleProof(hash, proof, storedRoot as string)

    return NextResponse.json(
      {
        success: true,
        event_hash: hash,
        merkle_root: merkleRoot,
        stored_merkle_root: storedRoot,
        proof,
        blockchain: {
          tx_hash: txHash,
          explorer: txHash
            ? `https://polygonscan.com/tx/${txHash}`
            : null
        },
        verification: {
          merkle_valid: merkleValid,
          merkle_root_matches:
            storedRoot && merkleRoot
              ? storedRoot === merkleRoot
              : null
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
    console.error("PUBLIC_EVENT_PROOF_ROUTE_ERROR", error)

    return NextResponse.json(
      {
        error: "INTERNAL_ERROR",
        detail:
          error instanceof Error
            ? error.message
            : String(error)
      },
      { status: 500 }
    )
  }
}