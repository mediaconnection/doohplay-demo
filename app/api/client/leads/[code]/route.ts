/**
 * app/api/client/leads/[code]/route.ts
 *
 * Retorna os leads (clientes finais) capturados via QR code na TV
 * de um estabelecimento específico, para exibição no dashboard do dono.
 *
 * Uso: GET /api/client/leads/BARBE332
 *
 * FIX (12/07/2026 — achado crítico de segurança/LGPD): esta rota não
 * checava sessão nenhuma. Diferente das outras rotas de leitura deixadas
 * abertas de propósito (plan-usage, playlist — dado do próprio dono do
 * negócio), aqui o dado é PESSOAL DE TERCEIROS: nome e telefone reais dos
 * clientes finais que escanearam o QR code. Qualquer um sabendo o `code`
 * de um estabelecimento (não é segredo: aparece em URL, print, QR code)
 * conseguia baixar essa lista inteira. Confirmado com dado real em
 * produção antes da correção. Agora exige sessão da Fase 14.
 */

import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { verifyClientSessionToken, CLIENT_SESSION_COOKIE } from "@/lib/client-session";

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
  const upperCode = code.toUpperCase();

  const sessionCode = verifyClientSessionToken(req.cookies.get(CLIENT_SESSION_COOKIE)?.value);
  if (sessionCode !== upperCode) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const pool = getPool();

  try {
    const { rows } = await pool.query<ClientLeadRow>(
      `
      SELECT id, name, phone, status, created_at
      FROM client_leads
      WHERE client_code = $1
      ORDER BY created_at DESC
      `,
      [upperCode]
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
