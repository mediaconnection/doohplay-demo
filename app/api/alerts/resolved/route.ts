export const dynamic = 'force-dynamic';
import { db } from "@/lib/db";

export async function GET() {
  const result = await db.query(`
    SELECT
      id,
      type,
      entity_type,
      entity_id,
      first_detected_at,
      resolved_at,
      metadata
    FROM alerts
    WHERE status = 'resolved'
    ORDER BY resolved_at DESC
    LIMIT 20
  `);

  return Response.json(result.rows);
}

