import { pool } from "@/src/lib/db";
import { emitCanonicalEvent } from "@/src/core/audit/emitCanonicalEvent";

/**
 * Watchdog de players offline
 * - Detecta players sem heartbeat recente
 * - Emite PLAYER_OFFLINE apenas uma vez por transição
 */
export async function runPlayerOfflineWatchdog() {
  console.log("🐶 WATCHDOG: scanning offline players...");

  // 1️⃣ Busca players ativos sem ping recente
  const res = await pool.query(`
    SELECT id
    FROM public.players
    WHERE
      is_active = true
      AND last_ping < now() - interval '2 minutes'
  `);

  if (res.rowCount === 0) {
    console.log("🐶 WATCHDOG: no offline players found");
    return;
  }

  for (const row of res.rows) {
    const playerId = row.id;

    try {
      // 2️⃣ Marca como inativo (offline)
      await pool.query(
        `
        UPDATE public.players
        SET is_active = false
        WHERE id = $1
        `,
        [playerId]
      );

      // 3️⃣ Emite evento canônico
      await emitCanonicalEvent({
        event_type: "PLAYER_OFFLINE",
        source_table: "players",
        source_id: playerId,
        device_id: playerId,
        payload: {
          reason: "heartbeat_timeout",
          timeout_minutes: 2
        }
      });

      console.log("🔴 PLAYER OFFLINE", playerId);
    } catch (err) {
      console.error("❌ WATCHDOG error for player", playerId, err);
    }
  }
}
