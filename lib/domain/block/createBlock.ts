// @ts-nocheck
import crypto from "crypto"

import { anchorMerkleRoot } from "@/lib/blockchain/anchor"
import { pool } from "@/lib/db"

type EventRow = {
  id: number
  event_hash: string
}

type PreviousBlockRow = {
  block_hash: string | null
}

type BlockRow = {
  id: number
  block_hash: string
  merkle_root: string
}

type AnchorLikeResult = {
  ok: boolean
  tx_hash?: unknown
}

type CreateBlockResult = {
  ok: boolean
  block_id: number | null
  block_hash: string | null
  merkle_root: string | null
  event_count: number
  anchored: boolean
  tx_hash: string | null
  error?: string
}

function normalizeHash(value: unknown): string | null {
  if (typeof value !== "string") return null

  const normalized = value.trim().toLowerCase().replace(/^0x/, "")
  return /^[a-f0-9]{64}$/.test(normalized) ? normalized : null
}

function sha256(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex")
}

function buildMerkleRoot(hashes: string[]): string {
  let level = hashes
    .map((hash) => normalizeHash(hash))
    .filter((hash): hash is string => Boolean(hash))

  if (!level.length) {
    throw new Error("EMPTY_MERKLE_TREE")
  }

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

function buildBlockHash(input: {
  previousBlockHash: string | null
  merkleRoot: string
  eventCount: number
  createdAt: string
}): string {
  return sha256(
    JSON.stringify({
      previous_block_hash: input.previousBlockHash ?? null,
      merkle_root: input.merkleRoot,
      event_count: input.eventCount,
      created_at: input.createdAt
    })
  )
}

function getAnchorTxHash(anchor: unknown): string | null {
  if (!anchor || typeof anchor !== "object") return null

  const value = anchor as AnchorLikeResult

  return value.ok === true && typeof value.tx_hash === "string"
    ? value.tx_hash
    : null
}

export async function createBlock(limit = 100): Promise<CreateBlockResult> {
  const client = await pool.connect()
  let committed = false

  try {
    await client.query("BEGIN")

    const eventsRes = await client.query(
      `
      SELECT
        id,
        event_hash
      FROM public.event_chain
      WHERE block_id IS NULL
        AND event_hash IS NOT NULL
      ORDER BY created_at ASC NULLS LAST, id ASC
      LIMIT $1
      FOR UPDATE SKIP LOCKED
      `,
      [limit]
    )

    const events = eventsRes.rows as EventRow[]

    if (!events.length) {
      await client.query("COMMIT")
      committed = true

      return {
        ok: true,
        block_id: null,
        block_hash: null,
        merkle_root: null,
        event_count: 0,
        anchored: false,
        tx_hash: null
      }
    }

    const hashes = events
      .map((event) => normalizeHash(event.event_hash))
      .filter((hash): hash is string => Boolean(hash))

    if (!hashes.length) {
      throw new Error("NO_VALID_EVENT_HASHES")
    }

    const previousRes = await client.query(
      `
      SELECT block_hash
      FROM public.event_blocks
      ORDER BY id DESC
      LIMIT 1
      `
    )

    const previousRows = previousRes.rows as PreviousBlockRow[]
    const previousBlockHash =
      normalizeHash(previousRows[0]?.block_hash) ?? null

    const merkleRoot = buildMerkleRoot(hashes)
    const createdAt = new Date().toISOString()

    const blockHash = buildBlockHash({
      previousBlockHash,
      merkleRoot,
      eventCount: hashes.length,
      createdAt
    })

    const blockRes = await client.query(
      `
      INSERT INTO public.event_blocks (
        block_hash,
        prev_block_hash,
        merkle_root,
        created_at,
        block_timestamp
      )
      VALUES ($1, $2, $3, $4::timestamptz, $4::timestamptz)
      RETURNING id, block_hash, merkle_root
      `,
      [blockHash, previousBlockHash, merkleRoot, createdAt]
    )

    const blockRows = blockRes.rows as BlockRow[]
    const block = blockRows[0]

    if (!block) {
      throw new Error("BLOCK_INSERT_FAILED")
    }

    await client.query(
      `
      UPDATE public.event_chain
      SET
        block_id = $1,
        block_height = $1
      WHERE id = ANY($2::bigint[])
      `,
      [block.id, events.map((event) => event.id)]
    )

    await client.query("COMMIT")
    committed = true

    let txHash: string | null = null

    try {
      const anchor = await anchorMerkleRoot(merkleRoot)
      txHash = getAnchorTxHash(anchor)

      if (txHash) {
        await pool.query(
          `
          UPDATE public.event_blocks
          SET
            tx_hash = $1,
            anchored_at = now()
          WHERE id = $2
          `,
          [txHash, block.id]
        )
      }
    } catch (anchorError) {
      console.warn("CREATE_BLOCK_ANCHOR_FAILED", anchorError)
    }

    return {
      ok: true,
      block_id: block.id,
      block_hash: block.block_hash,
      merkle_root: block.merkle_root,
      event_count: hashes.length,
      anchored: Boolean(txHash),
      tx_hash: txHash
    }
  } catch (error) {
    if (!committed) {
      await client.query("ROLLBACK")
    }

    return {
      ok: false,
      block_id: null,
      block_hash: null,
      merkle_root: null,
      event_count: 0,
      anchored: false,
      tx_hash: null,
      error: error instanceof Error ? error.message : String(error)
    }
  } finally {
    client.release()
  }
}

export default createBlock
