// @ts-nocheck
import { pool } from "@/lib/db"
import { generateMerkleProof } from "@/lib/crypto/generateMerkleProof"

type EventLookupRow = {
  block_id: number | string | null
  event_hash: string | null
}

type BlockEventRow = {
  event_hash: string | null
}

function normalizeHash(value: unknown): string | null {
  if (typeof value !== "string") return null

  const normalized = value.trim().toLowerCase().replace(/^0x/, "")
  return /^[a-f0-9]{64}$/.test(normalized) ? normalized : null
}

export async function getMerkleProof(eventHash: string) {
  const normalizedEventHash = normalizeHash(eventHash)

  if (!normalizedEventHash) {
    throw new Error("Invalid event hash")
  }

  const eventRes = await pool.query(
    `
    SELECT
      block_id,
      event_hash
    FROM public.event_chain
    WHERE lower(replace(event_hash, '0x', '')) = $1
    LIMIT 1
    `,
    [normalizedEventHash]
  )

  const eventRows = eventRes.rows as EventLookupRow[]
  const event = eventRows[0]

  if (!event) {
    throw new Error("Event not found")
  }

  if (!event.block_id) {
    throw new Error("Event is not finalized in a block")
  }

  const blockRes = await pool.query(
    `
    SELECT event_hash
    FROM public.event_chain
    WHERE block_id = $1
      AND event_hash IS NOT NULL
    ORDER BY created_at ASC NULLS LAST, event_id ASC
    `,
    [event.block_id]
  )

  const blockRows = blockRes.rows as BlockEventRow[]

  const leaves = blockRows
    .map((row) => normalizeHash(row.event_hash))
    .filter((value): value is string => Boolean(value))

  if (!leaves.length) {
    throw new Error("Empty block")
  }

  if (!leaves.includes(normalizedEventHash)) {
    throw new Error("Event not in block")
  }

  const generated = generateMerkleProof(leaves, normalizedEventHash)

  return {
    proof: generated.proof,
    merkle_root: generated.merkle_root,
    root: generated.root
  }
}

