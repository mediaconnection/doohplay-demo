/**
 * app/api/client/ad-tag-preferences/[code]/route.ts
 *
 * Fase 16 (12/07/2026): dono escolhe quais tags de brand-safety NÃO quer
 * receber em anúncios pagos de terceiro (ex: bebida alcoólica). Taxonomia
 * fixa (mesma lista usada em app/admin/page.tsx, TabMidias) — não precisa
 * de tabela, é um enum pequeno e estável.
 *
 * Exclusão de CONCORRENTE DIRETO não aparece aqui de propósito — é regra
 * sempre ativa (Advertiser.segment vs business_type do dono), sem toggle.
 *
 * GET  /api/client/ad-tag-preferences/BARBE332
 *   → { availableTags: [{id, label}], excluded: [id, ...] }
 * PATCH com { excluded: [id, ...] }
 */

import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { verifyClientSessionToken, CLIENT_SESSION_COOKIE } from "@/lib/client-session";

export const dynamic = "force-dynamic";

const AD_TAGS = [
  { id: "bebida_alcoolica", label: "Bebida alcoólica" },
  { id: "tabaco", label: "Tabaco" },
  { id: "apostas", label: "Apostas / jogos de azar" },
  { id: "conteudo_adulto", label: "Conteúdo adulto/sensível" },
  { id: "politica", label: "Conteúdo político" },
];
const VALID_IDS = new Set(AD_TAGS.map(t => t.id));

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const upperCode = code.toUpperCase();
  const pool = getPool();

  try {
    const clientRes = await pool.query(
      `SELECT excluded_ad_tags FROM studio_clients WHERE UPPER(code) = $1 LIMIT 1`,
      [upperCode]
    );
    return NextResponse.json({
      availableTags: AD_TAGS,
      excluded: clientRes.rows[0]?.excluded_ad_tags ?? [],
    });
  } catch (err) {
    console.error("[ad-tag-preferences GET]", err);
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
    // Segurança: só aceita ids da taxonomia fixa conhecida.
    const validIds = excluded.filter((id: string) => VALID_IDS.has(id));

    await pool.query(
      `UPDATE studio_clients SET excluded_ad_tags = $1 WHERE UPPER(code) = $2`,
      [validIds.length ? validIds : null, upperCode]
    );

    return NextResponse.json({ ok: true, excluded: validIds });
  } catch (err) {
    console.error("[ad-tag-preferences PATCH]", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
