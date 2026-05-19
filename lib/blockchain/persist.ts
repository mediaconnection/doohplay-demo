import { pool } from "@/lib/db"

export async function saveAnchorResult({
  merkle_root,
  tx_hash,
  block_number,
  confirmations,
}: {
  merkle_root: string
  tx_hash: string
  block_number: number
  confirmations: number
}) {
  await pool.query(
    `
    update event_blocks
    set
      blockchain_tx = $1,
      anchored_at = now(),
      confirmations = $2
    where lower(merkle_root) = lower($3)
    `,
    [tx_hash, confirmations, merkle_root]
  )
}