// @ts-nocheck
import { pool, db } from "@/lib/db";
import { sha256 } from "@/lib/crypto/hash";

import {
  LedgerBlock,
  LedgerEvent
} from "@/types/ledger";

/* ======================================================
   Load single block
====================================================== */

export async function getLedgerBlock(
  block_height: number
): Promise<LedgerBlock | null> {

  if (!block_height && block_height !== 0) {
    throw new Error("Invalid block_height");
  }

  try {

    const res = await db.query<LedgerBlock>(
      `
      SELECT
        block_height,
        block_hash,
        previous_hash,
        merkle_root,
        event_count,
        created_at
      FROM ledger_blocks
      WHERE block_height = $1
      LIMIT 1
      `,
      [block_height]
    );

    return res.rows[0] ?? null;

  } catch (error) {

    console.error("blockService:getLedgerBlock", {
      block_height,
      error
    });

    throw new Error("Failed to load block");

  }

}

/* ======================================================
   Load block events
====================================================== */

export async function getBlockEvents(
  block_height: number
): Promise<LedgerEvent[]> {

  try {

    const res = await db.query<LedgerEvent>(
      `
      SELECT
        event_id,
        event_type,
        payload,
        event_hash,
        previous_hash,
        merkle_root,
        signature,
        block_height,
        occurred_at
      FROM event_chain
      WHERE block_height = $1
      ORDER BY occurred_at ASC
      `,
      [block_height]
    );

    return res.rows;

  } catch (error) {

    console.error("blockService:getBlockEvents", {
      block_height,
      error
    });

    throw new Error("Failed to load block events");

  }

}

/* ======================================================
   Load recent blocks
====================================================== */

export async function getLedgerBlocks(
  limit = 50
): Promise<LedgerBlock[]> {

  const res = await db.query<LedgerBlock>(
    `
    SELECT
      block_height,
      block_hash,
      previous_hash,
      merkle_root,
      event_count,
      created_at
    FROM ledger_blocks
    ORDER BY block_height DESC
    LIMIT $1
    `,
    [limit]
  );

  return res.rows;

}

/* ======================================================
   Verify block integrity
====================================================== */

export function verifyLedgerBlock(
  block: LedgerBlock
): boolean {

  if (!block) return false;

  const calculated = sha256(
    JSON.stringify({
      block_height: block.block_height,
      previous_hash: block.previous_hash,
      merkle_root: block.merkle_root
    })
  );

  return calculated === block.block_hash;

}
