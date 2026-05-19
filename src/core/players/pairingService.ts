import { randomBytes } from "crypto";
import { pool } from "@/core/audit/eventChainRepository";

export async function createPairingToken(player_id: string) {
  const token = randomBytes(16).toString("hex"); // curto, escaneável
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min

  await pool.query(
    `
    INSERT INTO public.player_pairing_tokens (
      token, player_id, expires_at
    ) VALUES ($1, $2, $3)
    `,
    [token, player_id, expiresAt]
  );

  return { token, expires_at: expiresAt };
}
