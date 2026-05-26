export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

import { pool } from "@/lib/db";


export async function GET() {

  try {

    // Últimos eventos do ledger
    const latestEvents = await pool.query(
      `
      SELECT
        event_id,
        event_type,
        occurred_at,
        COALESCE(payload, '{}'::jsonb) AS payload
      FROM event_chain
      ORDER BY occurred_at DESC
      LIMIT 20
      `
    );

    // Estatísticas gerais
    const stats = await pool.query(
      `
      SELECT
        COUNT(*)::int AS total_events
      FROM event_chain
      `
    );

    // Top campanhas (extraído do JSON)
    const campaigns = await pool.query(
      `
      SELECT
        payload->>'campaign_id' AS campaign_id,
        COUNT(*)::int AS plays
      FROM event_chain
      WHERE payload IS NOT NULL
        AND payload->>'campaign_id' IS NOT NULL
      GROUP BY payload->>'campaign_id'
      ORDER BY plays DESC
      LIMIT 5
      `
    );

    return Response.json({
      stats: stats.rows[0] ?? { total_events: 0 },
      latest_events: latestEvents.rows ?? [],
      top_campaigns: campaigns.rows ?? []
    });

  } catch (err: any) {

    console.error("EXPLORER ERROR", err);

    return Response.json(
      { error: err.message ?? "internal error" },
      { status: 500 }
    );

  }

}
