// @ts-nocheck
import { pool } from "@/lib/db";

type UpsertPlayerParams = {
  id: string;
  uptime: number;
};

/**
 * Upsert de player (heartbeat)
 * Atualiza:
 * - last_ping
 * - is_active
 */
export async function upsertPlayer(
  params: UpsertPlayerParams
): Promise<void> {
  console.log("🧩 upsertPlayer START");

  const { id } = params;

  if (!id) {
    throw new Error("upsertPlayer: id is required");
  }

  await pool.query(
    `
    INSERT INTO public.players (
      id,
      last_ping,
      is_active
    )
    VALUES (
      $1,
      NOW(),
      true
    )
    ON CONFLICT (id)
    DO UPDATE SET
      last_ping = NOW(),
      is_active = true
    `,
    [id]
  );

  console.log("✅ upsertPlayer OK");
}
