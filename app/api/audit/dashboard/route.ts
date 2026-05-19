import { pool } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {

  try {

    const totalEvents = await pool.query(`
      SELECT COUNT(*)::int AS total
      FROM event_chain
    `);

    const eventsToday = await pool.query(`
      SELECT COUNT(*)::int AS total
      FROM event_chain
      WHERE occurred_at >= CURRENT_DATE
    `);

    const eventsByType = await pool.query(`
      SELECT event_type, COUNT(*)::int AS total
      FROM event_chain
      GROUP BY event_type
      ORDER BY total DESC
    `);

    const lastEvent = await pool.query(`
      SELECT
        event_id,
        event_type,
        occurred_at
      FROM event_chain
      ORDER BY occurred_at DESC
      LIMIT 1
    `);

    return Response.json({
      total_events: totalEvents.rows[0].total,
      events_today: eventsToday.rows[0].total,
      events_by_type: eventsByType.rows,
      last_event: lastEvent.rows[0] ?? null
    });

  } catch (err: any) {

    console.error("DASHBOARD ERROR", err);

    return Response.json(
      { error: err.message },
      { status: 500 }
    );

  }

}