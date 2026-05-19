import { NextRequest, NextResponse } from "next/server"

import { buildAuditProof } from "@/lib/audit/proof"
import { pool } from "@/lib/db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type EventRow = {
  event_id: string | number | null
  event_hash: string
  prev_hash: string | null
  payload: Record<string, unknown> | null
  block_id: number | string | null
  created_at: string | Date | null
  block_hash: string | null
  prev_block_hash: string | null
  merkle_root: string | null
  signature: string | null
  timestamp_token: string | null
  tx_hash: string | null
  network: string | null
}

type BlockEventRow = {
  event_hash: string | null
}

function normalizeHash(value: unknown): string | null {
  if (typeof value !== "string") return null

  const normalized = value.trim().toLowerCase().replace(/^0x/, "")
  return /^[a-f0-9]{64}$/.test(normalized) ? normalized : null
}

function normalizeDate(value: unknown): string | null {
  if (!value) return null

  const date = new Date(String(value))
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
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
        e.previous_event_hash as prev_hash,
        e.payload,
        e.block_id,
        e.created_at,
        b.block_hash,
        b.prev_block_hash,
        b.merkle_root,
        b.signature,
        b.timestamp_token,
        b.tx_hash,
        b.network
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
    const blockHash = normalizeHash(event.block_hash)
    const prevBlockHash = normalizeHash(event.prev_block_hash)
    const merkleRoot = normalizeHash(event.merkle_root)

    let blockHashes: string[] = []

    if (event.block_id) {
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

      blockHashes = blockRows
        .map((row) => normalizeHash(row.event_hash))
        .filter((value): value is string => Boolean(value))
    }

    const finalized =
      Boolean(event.block_id) &&
      Boolean(eventHash) &&
      Boolean(blockHash) &&
      Boolean(merkleRoot) &&
      blockHashes.length > 0

    const proof =
      finalized && eventHash && blockHash && merkleRoot
        ? buildAuditProof({
            eventHash,
            blockHashes,
            blockHash,
            prevBlockHash,
            merkleRoot,
            signature: event.signature,
            timestamp: event.timestamp_token
          })
        : null

    return NextResponse.json({
      ok: true,
      event: {
        id: event.event_id,
        hash: event.event_hash,
        normalized_hash: eventHash,
        prev_hash: event.prev_hash,
        payload: event.payload,
        created_at: normalizeDate(event.created_at)
      },
      block: event.block_id
        ? {
            id: event.block_id,
            hash: event.block_hash,
            normalized_hash: blockHash,
            prev_hash: event.prev_block_hash,
            normalized_prev_hash: prevBlockHash,
            merkle_root: event.merkle_root,
            normalized_merkle_root: merkleRoot,
            signature: event.signature,
            timestamp_token: event.timestamp_token
          }
        : null,
      blockchain: event.tx_hash
        ? {
            tx_hash: event.tx_hash,
            network: event.network
          }
        : null,
      export: {
        finalized,
        block_event_count: blockHashes.length,
        event_in_block: eventHash ? blockHashes.includes(eventHash) : false,
        proof
      }
    })
  } catch (error) {
    console.error("AUDIT_EXPORT_ROUTE_ERROR", error)

    return NextResponse.json(
      {
        error: "INTERNAL_ERROR",
        detail: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}