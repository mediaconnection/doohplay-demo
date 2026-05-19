import { pool } from "@/lib/db"
import { buildMerkleTree } from "@/lib/crypto/merkle"
import { sha256 } from "@/lib/crypto/hash"

type EventRow = {
  id: number | string
  event_hash: string | null
}

type LastBlockRow = {
  block_height: number | string | null
  block_hash: string | null
}

function normalizeHash(value: unknown): string | null {
  if (typeof value !== "string") return null

  const normalized = value.trim().toLowerCase().replace(/^0x/, "")
  return /^[a-f0-9]{64}$/i.test(normalized) ? normalized : null
}

function safeNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export async function createBlock() {
  const client = await pool.connect()

  try {
    await client.query("BEGIN")

    const eventsRes = await client.query(
      `
      SELECT id, event_hash
      FROM public.event_chain
      WHERE block_height IS NULL
        AND event_hash IS NOT NULL
      ORDER BY occurred_at ASC NULLS LAST, created_at ASC NULLS LAST, id ASC
      LIMIT 100
      FOR UPDATE SKIP LOCKED
      `
    )

    const events = eventsRes.rows as EventRow[]

    const leaves = events
      .map((event) => normalizeHash(event.event_hash))
      .filter((hash): hash is string => Boolean(hash))

    if (!leaves.length) {
      await client.query("COMMIT")
      return null
    }

    const { root } = buildMerkleTree(leaves)

    const merkleRoot = normalizeHash(root)

    if (!merkleRoot) {
      throw new Error("INVALID_MERKLE_ROOT")
    }

    const lastBlockRes = await client.query(
      `
      SELECT block_height, block_hash
      FROM public.ledger_blocks
      ORDER BY block_height DESC
      LIMIT 1
      `
    )

    const lastRows = lastBlockRes.rows as LastBlockRow[]
    const lastBlock = lastRows[0]

    const height = safeNumber(lastBlock?.block_height, 0) + 1
    const previous = normalizeHash(lastBlock?.block_hash)

    const blockHash = sha256(
      JSON.stringify({
        height,
        previous,
        merkle: merkleRoot
      })
    )

    await client.query(
      `
      INSERT INTO public.ledger_blocks (
        block_height,
        block_hash,
        previous_hash,
        merkle_root,
        event_count
      )
      VALUES ($1, $2, $3, $4, $5)
      `,
      [height, blockHash, previous, merkleRoot, leaves.length]
    )

    await client.query(
      `
      UPDATE public.event_chain
      SET block_height = $1
      WHERE id = ANY($2::bigint[])
      `,
      [height, events.map((event) => event.id)]
    )

    await client.query("COMMIT")

    return {
      height,
      blockHash,
      root: merkleRoot
    }
  } catch (error) {
    await client.query("ROLLBACK")
    throw error
  } finally {
    client.release()
  }
}

export default createBlock