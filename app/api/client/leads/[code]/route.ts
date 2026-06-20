/**
 * app/api/client/leads/[code]/route.ts
 *
 * Retorna os leads (clientes finais) capturados via QR code na TV
 * de um estabelecimento específico, para exibição no dashboard do dono.
 *
 * Uso: GET /api/client/leads/BARBE332
 */

import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export const dynamic = "force-dynamic";

interface ClientLeadRow {
  id: string;
  name: string;
  phone: string;
  status: string;
  created_at: string;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const pool = getPool();

  try {
    const { rows } = await pool.query<ClientLeadRow>(
      `
      SELECT id, name, phone, status, created_at
      FROM client_leads
      WHERE client_code = $1
      ORDER BY created_at DESC
      `,
      [code.toUpperCase()]
    );

    const active = rows.filter((r: ClientLeadRow) => r.status === "active");

    return NextResponse.json({
      total: rows.length,
      active_count: active.length,
      leads: rows,
    });
  } catch (err) {
    console.error("[client/leads GET]", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
