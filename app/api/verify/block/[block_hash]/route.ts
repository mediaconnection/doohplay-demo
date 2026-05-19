import { createHash } from "crypto"
import { NextRequest, NextResponse } from "next/server"

import { pool } from "@/lib/db"
import { verifySignature } from "@/lib/crypto/signature"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type EventBlockRow = {
  id: number | string
  block_hash: string | null
  merkle_root: string | null
  prev_block_hash: string | null
  signature: string | null
  total_events: number | string | null
  tx_hash: string | null
  created_at: string | Date | null
  block_timestamp: string | Date | null
}

type EventHashRow = {
  event_hash: string | null
}

type PreviousBlockRow = {
  id: number | string
}

function sha256(data: string): string {
  return createHash("sha256").update(data, "utf8").digest("hex")
}

function normalizeHash(value: unknown): string | null {
  if (typeof value !== "string") return null

  const normalized = value.trim().toLowerCase().replace(/^0x/, "")
  return /^[a-f0-9]{64}$/.test(normalized) ? normalized : null
}

function safeNumber(value: unknown, fallback = 0): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function toIsoOrNull(value: string | Date | null): string | null {
  if (!value) return null

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

function buildMerkleRoot(hashes: string[]): string {
  if (!hashes.length) throw new Error("EMPTY_MERKLE_TREE")

  let level = [...hashes]

  while (level.length > 1) {
    const next: string[] = []

    for (let index = 0; index < level.length; index += 2) {
      const left = level[index]
      const right = level[index + 1] ?? left

      next.push(sha256(left + right))
    }

    level = next
  }

  return level[0]
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ block_hash: string }> }
) {
  void req

  try {
    const { block_hash: rawBlockHash } = await context.params
    const blockHash = normalizeHash(rawBlockHash)

    if (!blockHash) {
      return NextResponse.json(
        { valid: false, error: "INVALID_BLOCK_HASH" },
        { status: 400 }
      )
    }

    const blockRes = await pool.query(
      `
      SELECT
        id,
        block_hash,
        merkle_root,
        prev_block_hash,
        signature,
        total_events,
        tx_hash,
        created_at,
        block_timestamp
      FROM public.event_blocks
      WHERE lower(replace(block_hash, '0x', '')) = $1
      LIMIT 1
      `,
      [blockHash]
    )

    const blockRows = blockRes.rows as EventBlockRow[]
    const block = blockRows[0]

    if (!block) {
      return NextResponse.json(
        { valid: false, error: "BLOCK_NOT_FOUND" },
        { status: 404 }
      )
    }

    const eventsRes = await pool.query(
      `
      SELECT event_hash
      FROM public.event_chain
      WHERE block_id = $1
      ORDER BY created_at ASC NULLS LAST, event_id ASC
      `,
      [block.id]
    )

    const eventRows = eventsRes.rows as EventHashRow[]

    const eventHashes = eventRows
      .map((event) => normalizeHash(event.event_hash))
      .filter((hash): hash is string => hash !== null)

    const expectedTotal = safeNumber(block.total_events, eventHashes.length)

    const eventsCountValid = eventHashes.length === expectedTotal
    const hashesValid = eventHashes.length > 0

    let recomputedMerkle: string | null = null
    let merkleValid = false

    try {
      recomputedMerkle = buildMerkleRoot(eventHashes)
      const storedMerkleRoot = normalizeHash(block.merkle_root)
      merkleValid = Boolean(
        storedMerkleRoot && recomputedMerkle === storedMerkleRoot
      )
    } catch {
      merkleValid = false
    }

    const prevBlockHash = normalizeHash(block.prev_block_hash) ?? ""
    const merkleRoot = normalizeHash(block.merkle_root) ?? ""
    const timestamp = String(block.block_timestamp ?? block.created_at ?? "")
    const totalEvents = String(expectedTotal)

    const recomputedBlockHash = sha256(
      prevBlockHash + merkleRoot + timestamp + totalEvents
    )

    const storedBlockHash = normalizeHash(block.block_hash)
    const hashValid = Boolean(
      storedBlockHash && recomputedBlockHash === storedBlockHash
    )

    let signatureValid = false

    try {
      signatureValid =
        Boolean(block.signature && storedBlockHash) &&
        verifySignature(storedBlockHash as string, block.signature as string)
    } catch {
      signatureValid = false
    }

    let chainValid = true

    if (prevBlockHash) {
      const prevRes = await pool.query(
        `
        SELECT id
        FROM public.event_blocks
        WHERE lower(replace(block_hash, '0x', '')) = $1
        LIMIT 1
        `,
        [prevBlockHash]
      )

      const prevRows = prevRes.rows as PreviousBlockRow[]
      chainValid = prevRows.length > 0
    }

    const anchored = Boolean(block.tx_hash)

    const valid =
      eventsCountValid &&
      hashesValid &&
      merkleValid &&
      hashValid &&
      signatureValid &&
      chainValid

    return NextResponse.json(
      {
        valid,
        checks: {
          block_exists: true,
          events_count_valid: eventsCountValid,
          hashes_valid: hashesValid,
          merkle_valid: merkleValid,
          hash_valid: hashValid,
          signature_valid: signatureValid,
          chain_valid: chainValid,
          anchored
        },
        computed: {
          merkle_root: recomputedMerkle,
          block_hash: recomputedBlockHash
        },
        block: {
          id: block.id,
          block_hash: block.block_hash,
          merkle_root: block.merkle_root,
          total_events: expectedTotal,
          tx_hash: block.tx_hash,
          created_at: toIsoOrNull(block.created_at),
          block_timestamp: toIsoOrNull(block.block_timestamp)
        }
      },
      {
        headers: {
          "Cache-Control": "no-store"
        }
      }
    )
  } catch (error) {
    console.error("VERIFY_BLOCK_ROUTE_ERROR", error)

    return NextResponse.json(
      {
        valid: false,
        error: "INTERNAL_ERROR",
        detail: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}