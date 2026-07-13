/**
 * app/api/client/channel-preferences/[code]/route.ts
 *
 * Canal DOOHPLAY (12/07/2026, passo 5): permite ao dono desligar canais
 * de ENTRETENIMENTO GERAL (Turismo, Diversão — não pertencem a nenhum
 * segmento de negócio, aparecem em toda tela por padrão). Canais de
 * segmento (Beleza, Saúde, etc) NÃO aparecem aqui de propósito — ficam
 * sempre automáticos, decisão de produto pra garantir alcance real pra
 * futuro patrocinador de canal.
 *
 * GET  /api/client/channel-preferences/BARBE332
 *   → { generalChannels: [{id, name}], excluded: [id, id, ...] }
 * PATCH com { excluded: [id, ...] }
 *   → salva a lista de canais gerais que esse cliente NÃO quer receber
 */

import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { verifyClientSessionToken, CLIENT_SESSION_COOKIE } from "@/lib/client-session";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const upperCode = code.toUpperCase();
  const pool = getPool();

  try {
    const [segRes, clientRes] = await Promise.all([
      pool.query(`SELECT id, name FROM inventory_segments_v2 WHERE is_general = true ORDER BY name ASC`),
      pool.query(`SELECT excluded_general_channels FROM studio_clients WHERE UPPER(code) = $1 LIMIT 1`, [upperCode]),
    ]);

    return NextResponse.json({
      generalChannels: segRes.rows,
      excluded: clientRes.rows[0]?.excluded_general_channels ?? [],
    });
  } catch (err) {
    console.error("[channel-preferences GET]", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function PATCH(
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
    const { excluded } = await req.json();
    if (!Array.isArray(excluded)) {
      return NextResponse.json({ error: "excluded precisa ser uma lista de ids" }, { status: 400 });
    }

    // Segurança: só deixa excluir canais que são de fato "gerais" — um
    // cliente não pode, via API, se auto-excluir do próprio canal de
    // segmento (isso teria que passar por decisão de produto, não toggle
    // livre do dono).
    const validRes = await pool.query(
      `SELECT id FROM inventory_segments_v2 WHERE is_general = true AND id = ANY($1::uuid[])`,
      [excluded]
    );
    const validIds = validRes.rows.map((r: any) => r.id);

    await pool.query(
      `UPDATE studio_clients SET excluded_general_channels = $1 WHERE UPPER(code) = $2`,
      [validIds.length ? validIds : null, upperCode]
    );

    return NextResponse.json({ ok: true, excluded: validIds });
  } catch (err) {
    console.error("[channel-preferences PATCH]", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
