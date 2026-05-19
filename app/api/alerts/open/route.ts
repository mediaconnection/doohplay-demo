import { db } from "@/lib/db";

export async function GET() {
  const result = await db.query(`
    SELECT
      id,
      type,
      entity_type,
      entity_id,
      first_detected_at,
      last_detected_at,
      metadata
    FROM alerts
    WHERE status = 'open'
    ORDER BY first_detected_at ASC
  `);

  return Response.json(result.rows);
}
