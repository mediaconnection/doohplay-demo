/**
 * app/api/client/notices/[code]/route.ts
 *
 * Fase 46 (27/09/2026): Avisos — recados curtos em texto intercalados na
 * playlist da tela. Regras e limites em lib/notices.ts.
 *
 * GET  /api/client/notices/BARBE332  → { notices: [...] } (todos, com status)
 * POST com { title, message, template, icon, starts_at, ends_at } → cria
 *
 * As duas exigem sessão do próprio cliente — diferente da playlist
 * pública, aqui aparecem avisos pausados/agendados que ainda não estão
 * na tela.
 */
import { NextRequest, NextResponse } from "next/server"
import { getPool } from "@/lib/db"
import { verifyClientSessionToken, CLIENT_SESSION_COOKIE } from "@/lib/client-session"
import { validateNoticeInput, NOTICE_DASHBOARD_COLUMNS, NOTICE_MAX_PER_CLIENT } from "@/lib/notices"

export const dynamic = "force-dynamic"

function isOwner(req: NextRequest, upperCode: string) {
  return verifyClientSessionToken(req.cookies.get(CLIENT_SESSION_COOKIE)?.value) === upperCode
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const upperCode = code.toUpperCase()
  if (!isOwner(req, upperCode)) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  const pool = getPool()
  try {
    const { rows } = await pool.query(
      `SELECT ${NOTICE_DASHBOARD_COLUMNS}
       FROM client_notices
       WHERE client_code = $1
       ORDER BY created_at DESC`,
      [upperCode]
    )
    return NextResponse.json({ notices: rows })
  } catch (err) {
    console.error("[notices GET]", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const upperCode = code.toUpperCase()
  if (!isOwner(req, upperCode)) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  const parsed = validateNoticeInput(await req.json().catch(() => null))
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 })
  }
  const n = parsed.value

  const pool = getPool()
  try {
    const countRes = await pool.query(
      `SELECT COUNT(*)::int AS total FROM client_notices WHERE client_code = $1`,
      [upperCode]
    )
    if (countRes.rows[0].total >= NOTICE_MAX_PER_CLIENT) {
      return NextResponse.json(
        { error: `Limite de ${NOTICE_MAX_PER_CLIENT} avisos atingido — apague algum antigo antes de criar outro` },
        { status: 400 }
      )
    }

    const { rows } = await pool.query(
      `INSERT INTO client_notices (client_code, title, message, template, icon, starts_at, ends_at)
       VALUES ($1, $2, $3, $4, $5,
               $6::timestamp AT TIME ZONE 'America/Sao_Paulo',
               $7::timestamp AT TIME ZONE 'America/Sao_Paulo')
       RETURNING ${NOTICE_DASHBOARD_COLUMNS}`,
      [upperCode, n.title, n.message, n.template, n.icon, n.starts_at, n.ends_at]
    )
    return NextResponse.json({ ok: true, notice: rows[0] })
  } catch (err) {
    console.error("[notices POST]", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
