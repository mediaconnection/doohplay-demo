export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0


export async function GET() {
    const { pool } = await import("@/lib/db")


  const res = await pool.query(`
    SELECT
      event_id,
      event_hash,
      previous_hash,
      event_type,
      occurred_at
    FROM event_chain
    ORDER BY occurred_at ASC
  `);

  return Response.json(res.rows);

}

