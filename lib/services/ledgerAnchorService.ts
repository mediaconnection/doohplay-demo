// @ts-nocheck
import { pool, db } from "@/lib/db";

type LatestBlock = {
  block_height: number;
  block_hash: string;
};

export async function getLatestBlock(): Promise<LatestBlock | null> {

  const res = await db.query<LatestBlock>(
    `
    SELECT
      block_height,
      block_hash
    FROM ledger_blocks
    ORDER BY block_height DESC
    LIMIT 1
    `
  );

  return res.rows[0] ?? null;

}

export async function storeLedgerAnchor(
  block_height: number,
  block_hash: string,
  network: string,
  tx_hash?: string
) {

  await pool.query(
    `
    INSERT INTO ledger_anchors
    (
      block_height,
      block_hash,
      network,
      tx_hash
    )
    VALUES ($1,$2,$3,$4)
    `,
    [block_height, block_hash, network, tx_hash]
  );

}
