export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0


export async function GET() {
    const { db } = await import("@/lib/db")

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


