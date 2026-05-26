export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0



export async function GET() {
    const { pool } = await import("@/lib/db")


  try {

    const totalScreens = await pool.query(`
      SELECT COUNT(*)::int AS total
      FROM screens
    `);

    const totalEvents = await pool.query(`
      SELECT COUNT(*)::int AS total
      FROM event_chain
    `);

    const totalAdPlays = await pool.query(`
      SELECT COUNT(*)::int AS total
      FROM event_chain
      WHERE event_type='AD_PLAY_END'
    `);

    const campaigns = await pool.query(`
      SELECT COUNT(DISTINCT payload->>'campaign_id')::int AS total
      FROM event_chain
      WHERE payload ? 'campaign_id'
    `);

    const activeScreens = await pool.query(`
      SELECT COUNT(DISTINCT device_id)::int AS total
      FROM event_chain
      WHERE occurred_at > NOW() - INTERVAL '5 minutes'
    `);

    return Response.json({

      total_screens: totalScreens.rows[0].total,
      active_screens: activeScreens.rows[0].total,
      total_events: totalEvents.rows[0].total,
      total_ad_plays: totalAdPlays.rows[0].total,
      campaigns: campaigns.rows[0].total

    });

  } catch (err: any) {

    console.error("TRANSPARENCY ERROR", err);

    return Response.json(
      { error: err.message },
      { status: 500 }
    );

  }

}
