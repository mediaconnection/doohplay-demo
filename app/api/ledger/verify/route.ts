export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

import { pool } from "@/lib/db";
import { verifyLedgerChain } from "@/lib/crypto/ledgerVerify";

export async function GET() {

  const res = await pool.query(`
    SELECT *
    FROM event_chain
    ORDER BY occurred_at ASC
  `);

  const events = res.rows;

  const result = verifyLedgerChain(events);

  return Response.json({
    events: events.length,
    verification: result
  });

}

