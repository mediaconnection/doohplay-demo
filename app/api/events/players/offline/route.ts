export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

import { db } from "@/lib/db";

export async function GET() {
  try {
    const { rows } = await db.query(`
      WITH last_status AS (
        SELECT DISTINCT ON (player_id)
          player_id,
          event_type,
          metadata->>'heartbeat_at' AS heartbeat_at,
          timestamp
        FROM log_events
        WHERE event_type IN ('PLAYER_ONLINE', 'PLAYER_OFFLINE')
        ORDER BY player_id, timestamp DESC
      )
      SELECT
        player_id,
        heartbeat_at,
        timestamp,
        NOW() - timestamp AS offline_duration
      FROM last_status
      WHERE event_type = 'PLAYER_OFFLINE'
        AND NOW() - timestamp > INTERVAL '5 minutes';
    `);

    return Response.json(rows);
  } catch (error) {
    console.error("Erro ao detectar players offline:", error);
    return Response.json(
      { error: "Erro ao detectar alertas" },
      { status: 500 }
    );
  }
}


