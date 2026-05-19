import { NextResponse } from "next/server";
import { pool } from "@/core/audit/eventChainRepository";
import { emitCanonicalEvent } from "@/core/audit/emitCanonicalEvent";

export async function POST(req: Request) {
  const { token, tenant_id } = await req.json();

  const res = await pool.query(
    `
    SELECT *
    FROM public.player_pairing_tokens
    WHERE token = $1
      AND used_at IS NULL
      AND expires_at > now()
    `,
    [token]
  );

  if (res.rowCount !== 1) {
    return NextResponse.json(
      { error: "invalid or expired token" },
      { status: 400 }
    );
  }

  const { player_id } = res.rows[0];

  // 🔒 Marca token como usado
  await pool.query(
    `
    UPDATE public.player_pairing_tokens
    SET used_at = now()
    WHERE token = $1
    `,
    [token]
  );

  // 🔗 Vincula player ao tenant
  await pool.query(
    `
    UPDATE public.players
    SET tenant_id = $1
    WHERE id = $2
    `,
    [tenant_id, player_id]
  );

  // 🧱 Evento canônico
  await emitCanonicalEvent({
    event_type: "PLAYER_PAIRED",
    source_table: "players",
    source_id: player_id,
    device_id: player_id,
    payload: {
      tenant_id,
      pairing_token: token
    }
  });

  return NextResponse.json({ ok: true });
}
