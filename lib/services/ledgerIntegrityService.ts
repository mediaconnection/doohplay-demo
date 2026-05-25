// @ts-nocheck
import { pool } from "@/lib/db";
import { verifyLedgerChain } from "@/lib/crypto/verifyLedgerChain";

export async function checkLedgerIntegrity() {

  const res = await pool.query(
    `
    SELECT
      block_height,
      block_hash,
      previous_hash,
      merkle_root
    FROM ledger_blocks
    ORDER BY block_height ASC
    `
  );

  const blocks = res.rows;

  return verifyLedgerChain(blocks);

}
