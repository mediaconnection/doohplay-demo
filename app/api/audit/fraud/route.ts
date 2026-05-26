export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0



export async function GET() {
    const { pool } = await import("@/lib/db")


  try {

    // loops suspeitos
    const loopEvents = await pool.query(`
      SELECT
        device_id,
        COUNT(*)::int AS plays
      FROM event_chain
      WHERE event_type='AD_PLAY_END'
      AND occurred_at > NOW() - INTERVAL '10 minutes'
      GROUP BY device_id
      HAVING COUNT(*) > 50
    `);

    // telas sem atividade
    const offlineScreens = await pool.query(`
      SELECT
        device_id,
        MAX(occurred_at) AS last_seen
      FROM event_chain
      GROUP BY device_id
      HAVING MAX(occurred_at) < NOW() - INTERVAL '10 minutes'
    `);

    // campanhas com volume anormal
    const campaignAnomalies = await pool.query(`
      SELECT
        payload->>'campaign_id' AS campaign_id,
        COUNT(*)::int AS plays
      FROM event_chain
      WHERE event_type='AD_PLAY_END'
      AND occurred_at > NOW() - INTERVAL '1 hour'
      GROUP BY campaign_id
      HAVING COUNT(*) > 1000
    `);

    return Response.json({
      suspicious_loops: loopEvents.rows,
      offline_screens: offlineScreens.rows,
      campaign_anomalies: campaignAnomalies.rows
    });

  } catch (err: any) {

    console.error("FRAUD DETECTION ERROR", err);

    return Response.json(
      { error: err.message },
      { status: 500 }
    );

  }

}
