import { pool } from "@/lib/db"

type HashRow = {
  event_hash: string | null
}

function normalizeHash(value: unknown): string | null {
  if (typeof value !== "string") return null

  const normalized = value.trim().toLowerCase()

  return normalized.length > 0 ? normalized : null
}

export async function getHashes(
  campaignId: string,
  start: string,
  end: string
): Promise<string[]> {
  const res = await pool.query(
    `
    SELECT event_hash
    FROM event_chain
    WHERE campaign_id = $1
      AND created_at BETWEEN $2 AND $3
    LIMIT 10000
    `,
    [campaignId, start, end]
  )

  const rows = res.rows as HashRow[]

  return rows
    .map((row: HashRow) => normalizeHash(row.event_hash))
    .filter((hash: string | null): hash is string => hash !== null)
}