export const dynamic = 'force-dynamic';
import { pool } from "@/lib/db";

export async function GET() {

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
