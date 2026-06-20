/**
 * app/api/leads/[code]/route.ts
 *
 * Recebe leads capturados via QR code exibido na TV de um cliente.
 * Rota pública (sem auth) — qualquer pessoa que escaneia o QR e preenche
 * o formulário chama esta rota diretamente do navegador do celular.
 *
 * Uso: POST /api/leads/BARBE332
 * Body: { "name": "João Silva", "phone": "11999998888", "consent_accepted": true }
 */

import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export const dynamic = "force-dynamic";

const CONSENT_TEXT_VERSION = "v1";

function normalizePhone(raw: string): string {
  return raw.replace(/\D/g, "");
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const body = await req.json().catch(() => null);

  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const rawPhone = typeof body?.phone === "string" ? body.phone : "";
  const phone = normalizePhone(rawPhone);
  const consentAccepted = body?.consent_accepted === true;

  if (!name) {
    return NextResponse.json({ error: "Informe seu nome." }, { status: 400 });
  }
  if (phone.length < 10 || phone.length > 13) {
    return NextResponse.json({ error: "Informe um WhatsApp válido com DDD." }, { status: 400 });
  }
  if (!consentAccepted) {
    return NextResponse.json(
      { error: "É necessário aceitar os termos para continuar." },
      { status: 400 }
    );
  }

  const pool = getPool();

  try {
    // Confirma que o cliente (estabelecimento) existe e está ativo antes de salvar o lead
    const { rows: clientRows } = await pool.query<{ code: string; name: string }>(
      `SELECT code, name FROM studio_clients WHERE code = $1 AND active = true`,
      [code.toUpperCase()]
    );

    if (!clientRows[0]) {
      return NextResponse.json(
        { error: "Estabelecimento não encontrado." },
        { status: 404 }
      );
    }

    await pool.query(
      `
      INSERT INTO client_leads (client_code, name, phone, consent_accepted, consent_accepted_at, consent_text_version, source)
      VALUES ($1, $2, $3, true, now(), $4, 'qr_tv')
      ON CONFLICT (client_code, phone) DO UPDATE
        SET name = EXCLUDED.name,
            consent_accepted = true,
            consent_accepted_at = now(),
            consent_text_version = EXCLUDED.consent_text_version,
            status = 'active'
      `,
      [code.toUpperCase(), name, phone, CONSENT_TEXT_VERSION]
    );

    return NextResponse.json({
      message: "Cadastro realizado com sucesso!",
      business_name: clientRows[0].name,
    });
  } catch (err) {
    console.error("[leads POST] Erro:", err);
    return NextResponse.json(
      { error: "Erro ao processar seu cadastro. Tente novamente." },
      { status: 500 }
    );
  }
}
