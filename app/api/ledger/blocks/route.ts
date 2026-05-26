export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

import { pool } from "@/lib/db";

export async function GET() {

  const res = await pool.query(`
    SELECT
      block_height,
      block_hash,
      previous_hash,
      created_at
    FROM ledger_blocks
    ORDER BY block_height DESC
    LIMIT 50
  `);

  return Response.json(res.rows);

}

