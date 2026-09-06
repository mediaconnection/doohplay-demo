import { NextRequest, NextResponse } from "next/server"

import { pool } from "@/lib/db"
import { buildMerkleProof } from "@proof-engine/domain/proof/merkleProof"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type EventRow = {
  event_id: string | number | null
  event_hash: string
  block_id: number | string | null
  merkle_root: string | null
}

type BlockEventRow = {
  event_hash: string | null
}

function normalizeHash(value: unknown): string | null {
  if (typeof value !== "string") return null

  const normalized = value.trim().toLowerCase().replace(/^0x/, "")
  return /^[a-f0-9]{64}$/.test(normalized) ? normalized : null
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
      return NextResponse.json({ error: "INVALID_HASH" }, { status: 400 })
    }

    const eventRes = await pool.query(
      `
      select
        e.event_id,
        e.event_hash,
        e.block_id,
        b.merkle_root
      from public.event_chain e
      left join public.event_blocks b on e.block_id = b.id
      where lower(replace(e.event_hash, '0x', '')) = $1
      limit 1
      `,
      [hash]
    )

    const eventRows = eventRes.rows as EventRow[]
    const event = eventRows[0]

    if (!event) {
      return NextResponse.json({ error: "EVENT_NOT_FOUND" }, { status: 404 })
    }

    const eventHash = normalizeHash(event.event_hash)
    const merkleRoot = normalizeHash(event.merkle_root)

    if (!event.block_id || !eventHash || !merkleRoot) {
      return NextResponse.json(
        { error: "EVENT_NOT_FINALIZED_IN_BLOCK" },
        { status: 409 }
      )
    }

    const blockRes = await pool.query(
      `
      select event_hash
      from public.event_chain
      where block_id = $1
        and event_hash is not null
      order by created_at asc nulls last, event_id asc
      `,
      [event.block_id]
    )

    const blockRows = blockRes.rows as BlockEventRow[]

    const blockHashes = blockRows
      .map((row) => normalizeHash(row.event_hash))
      .filter((value): value is string => Boolean(value))

    if (!blockHashes.length) {
      return NextResponse.json({ error: "EMPTY_BLOCK" }, { status: 500 })
    }

    if (!blockHashes.includes(eventHash)) {
      return NextResponse.json(
        { error: "EVENT_NOT_IN_BLOCK" },
        { status: 409 }
      )
    }

    const proof = buildMerkleProof(blockHashes, eventHash)

    if (!proof) {
      return NextResponse.json(
        { error: "MERKLE_PROOF_GENERATION_FAILED" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      event_id: event.event_id,
      event_hash: eventHash,
      merkle_root: merkleRoot,
      proof
    })
  } catch (error) {
    console.error("AUDIT_MERKLE_PROOF_ROUTE_ERROR", error)

    return NextResponse.json(
      {
        error: "INTERNAL_ERROR",
        detail: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}