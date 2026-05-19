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

    const adPlaysToday = await pool.query(`
      SELECT COUNT(*)::int AS total
      FROM event_chain
      WHERE event_type = 'AD_PLAY_END'
      AND occurred_at >= CURRENT_DATE
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

    const eventsPerHour = await pool.query(`
      SELECT
        date_trunc('hour', occurred_at) AS hour,
        COUNT(*)::int AS total
      FROM event_chain
      WHERE occurred_at >= NOW() - INTERVAL '24 hours'
      GROUP BY hour
      ORDER BY hour
    `);

    const eventsByType = await pool.query(`
      SELECT
        event_type,
        COUNT(*)::int AS total
      FROM event_chain
      GROUP BY event_type
      ORDER BY total DESC
    `);

    return Response.json({
      total_events: totalEvents.rows[0].total,
      events_today: eventsToday.rows[0].total,
      ad_plays_today: adPlaysToday.rows[0].total,
      last_event: lastEvent.rows[0] ?? null,
      events_per_hour: eventsPerHour.rows,
      events_by_type: eventsByType.rows
    });

  } catch (err: any) {

    console.error("AUDIT STATS ERROR", err);

    return Response.json(
      { error: err.message },
      { status: 500 }
    );

  }

}