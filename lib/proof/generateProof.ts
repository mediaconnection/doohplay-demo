// @ts-nocheck
import { pool } from "@/lib/db"
import { getMerkleProof } from "@/lib/merkle"

type EventRow = {
  event_hash: string
  created_at: string | Date
}

type EventHashRow = {
  event_hash: string | null
}

type DailyMerkleRootRow = {
  merkle_root: string | null
}

function normalizeHash(value: unknown): string | null {
  if (typeof value !== "string") return null

  const normalized = value.trim().toLowerCase().replace(/^0x/, "")
  return /^[a-f0-9]{64}$/i.test(normalized) ? normalized : null
}

export async function generateProof(eventHash: string) {
  const normalizedEventHash = normalizeHash(eventHash)

  if (!normalizedEventHash) {
    throw new Error("invalid event hash")
  }

  const eventRes = await pool.query(
    `
    SELECT event_hash, created_at
    FROM public.event_chain
    WHERE lower(replace(event_hash, '0x', '')) = $1
    LIMIT 1
    `,
    [normalizedEventHash]
  )

  const eventRows = eventRes.rows as EventRow[]
  const event = eventRows[0]

  if (!event) {
    throw new Error("event not found")
  }

  const createdAt = new Date(event.created_at)

  if (Number.isNaN(createdAt.getTime())) {
    throw new Error("invalid event created_at")
  }

  const day = createdAt.toISOString().slice(0, 10)

  const eventsRes = await pool.query(
    `
    SELECT event_hash
    FROM public.event_chain
    WHERE created_at >= $1::date
      AND created_at < ($1::date + interval '1 day')
      AND event_hash IS NOT NULL
    ORDER BY chain_index ASC NULLS LAST, created_at ASC NULLS LAST
    `,
    [day]
  )

  const eventHashRows = eventsRes.rows as EventHashRow[]

  const hashes = eventHashRows
    .map((row) => normalizeHash(row.event_hash))
    .filter((hash): hash is string => Boolean(hash))

  if (!hashes.includes(normalizedEventHash)) {
    throw new Error("event not found in merkle set")
  }

  const proof = getMerkleProof(hashes, normalizedEventHash)

  const rootRes = await pool.query(
    `
    SELECT merkle_root
    FROM public.daily_merkle_roots
    WHERE day = $1
    LIMIT 1
    `,
    [day]
  )

  const rootRows = rootRes.rows as DailyMerkleRootRow[]
  const merkleRoot = normalizeHash(rootRows[0]?.merkle_root)

  if (!merkleRoot) {
    throw new Error("merkle root not generated yet")
  }

  return {
    event_hash: normalizedEventHash,
    merkle_proof: proof,
    merkle_root: merkleRoot,
    day
  }
}

export default generateProof
