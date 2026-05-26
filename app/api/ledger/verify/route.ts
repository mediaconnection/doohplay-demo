export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0


export async function GET() {
    const { pool } = await import("@/lib/db")
    const { verifyLedgerChain } = await import("@/lib/crypto/ledgerVerify")


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

