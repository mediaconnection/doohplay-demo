import { pool } from "@/lib/db"
import { verifyEventChain } from "@/lib/domain/ledger/verifyChain"
import { buildMerkleRoot } from "@proof-engine/domain/proof/buildMerkleRoot"

type EventRow = {
  event_id: string | number | null
  event_hash: string | null
  previous_event_hash: string | null
  occurred_at: string | Date | null
}

type ChainResult = {
  valid?: boolean
  depth?: number
  [key: string]: unknown
}

function normalizeHash(value: unknown): string | null {
  if (typeof value !== "string") return null

  const normalized = value.trim().toLowerCase().replace(/^0x/, "")
  return /^[a-f0-9]{64}$/.test(normalized) ? normalized : null
}

export async function generateProof() {
  const res = await pool.query(
    `
    SELECT
      event_id,
      event_hash,
      previous_event_hash,
      occurred_at
    FROM public.event_chain
    WHERE event_hash IS NOT NULL
    ORDER BY occurred_at ASC NULLS LAST, event_id ASC
    `
  )

  const events = res.rows as EventRow[]

  const hashes = events
    .map((event) => normalizeHash(event.event_hash))
    .filter((hash): hash is string => Boolean(hash))

  let chain: ChainResult | null = null

  if (hashes.length > 0) {
    chain = (await verifyEventChain(hashes[0])) as ChainResult
  }

  const merkle_root = hashes.length > 0 ? buildMerkleRoot(hashes) : null

  return {
    generated_at: new Date().toISOString(),
    events: events.length,
    valid_hashes: hashes.length,
    chain_valid: chain?.valid === true,
    chain_depth: Number(chain?.depth ?? 0),
    merkle_root,
    events_hashes: hashes
  }
}