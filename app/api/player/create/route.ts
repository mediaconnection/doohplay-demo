export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { createPairingToken } = await import("@/core/players/pairingService")

  const { player_id } = await req.json();

  if (!player_id) {
    return NextResponse.json({ error: "player_id required" }, { status: 400 });
  }

  const pairing = await createPairingToken(player_id);

  return NextResponse.json({
    pairing_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pair/${pairing.token}`,
    expires_at: pairing.expires_at
  });
}


