import { pool } from "@/lib/db"
import { buildMerkleTree } from "@/lib/merkle"

type EventHashRow = {
  event_hash: string | null
}

function normalizeHash(value: unknown): string | null {
  if (typeof value !== "string") return null

  const normalized = value.trim().toLowerCase().replace(/^0x/, "")
  return /^[a-f0-9]{64}$/i.test(normalized) ? normalized : null
}

export async function buildDailyMerkle(day: string): Promise<string | null> {
  const res = await pool.query(
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

  const rows = res.rows as EventHashRow[]

  const hashes = rows
    .map((row) => normalizeHash(row.event_hash))
    .filter((hash): hash is string => Boolean(hash))

  if (hashes.length === 0) return null

  const tree = buildMerkleTree(hashes)
  const root = normalizeHash(tree.root)

  if (!root) {
    throw new Error("INVALID_DAILY_MERKLE_ROOT")
  }

  await pool.query(
    `
    INSERT INTO public.daily_merkle_roots (
      day,
      merkle_root,
      event_count
    )
    VALUES ($1, $2, $3)
    ON CONFLICT (day)
    DO UPDATE SET
      merkle_root = EXCLUDED.merkle_root,
      event_count = EXCLUDED.event_count
    `,
    [day, root, hashes.length]
  )

  return root
}

export default buildDailyMerkle