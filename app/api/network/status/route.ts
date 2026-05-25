export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {

  try {

    const screens = await pool.query(
      `
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE status = 'online')::int AS online,
        COUNT(*) FILTER (WHERE status = 'offline')::int AS offline
      FROM screens
      `
    );

    const players = await pool.query(
      `
      SELECT COUNT(*)::int AS total
      FROM players
      `
    );

    const eventsLastHour = await pool.query(
      `
      SELECT COUNT(*)::int AS count
      FROM event_chain
      WHERE occurred_at > NOW() - INTERVAL '1 hour'
      `
    );

    const adPlaysLastHour = await pool.query(
      `
      SELECT COUNT(*)::int AS count
      FROM event_chain
      WHERE event_type = 'AD_PLAY_START'
      AND occurred_at > NOW() - INTERVAL '1 hour'
      `
    );

    return NextResponse.json({

      screens: screens.rows[0],
      players: players.rows[0],
      events_last_hour: eventsLastHour.rows[0].count,
      ad_plays_last_hour: adPlaysLastHour.rows[0].count

    });

  } catch (err: any) {

    console.error("NETWORK STATUS ERROR", err);

    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );

  }

}
