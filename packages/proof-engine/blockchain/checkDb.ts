// @ts-nocheck
import { pool } from "@/lib/db"

export async function isAnchoredInDb(root: string) {
  const res = await pool.query(
    `
    select blockchain_tx
    from event_blocks
    where lower(merkle_root) = lower($1)
    limit 1
    `,
    [root]
  )

  return !!res.rows[0]?.blockchain_tx
}
