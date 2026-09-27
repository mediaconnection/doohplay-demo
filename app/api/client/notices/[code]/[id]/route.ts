/**
 * app/api/client/notices/[code]/[id]/route.ts
 *
 * Fase 46 (27/09/2026): edita, pausa/retoma ou apaga um aviso.
 *
 * PATCH com { active: boolean }                    → só pausa/retoma
 * PATCH com { title, message, template, icon, starts_at, ends_at } → edita tudo
 * DELETE                                           → apaga
 *
 * Toda query filtra por client_code além do id — um cliente nunca
 * consegue mexer em aviso de outro, mesmo sabendo o id.
 */
import { NextRequest, NextResponse } from "next/server"
import { getPool } from "@/lib/db"
import { verifyClientSessionToken, CLIENT_SESSION_COOKIE } from "@/lib/client-session"
import { validateNoticeInput, NOTICE_DASHBOARD_COLUMNS } from "@/lib/notices"

export const dynamic = "force-dynamic"

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

type Params = { params: Promise<{ code: string; id: string }> }

async function authorize(req: NextRequest, params: Params["params"]) {
  const { code, id } = await params
  const upperCode = code.toUpperCase()
  if (verifyClientSessionToken(req.cookies.get(CLIENT_SESSION_COOKIE)?.value) !== upperCode) {
    return { error: NextResponse.json({ error: "Não autenticado" }, { status: 401 }) }
  }
  if (!UUID.test(id)) {
    return { error: NextResponse.json({ error: "Aviso não encontrado" }, { status: 404 }) }
  }
  return { upperCode, id }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const auth = await authorize(req, params)
  if ("error" in auth) return auth.error
  const { upperCode, id } = auth

  const body = await req.json().catch(() => null)
  const pool = getPool()
  try {
    let rows: Record<string, unknown>[]
    if (body && Object.keys(body).length === 1 && typeof body.active === "boolean") {
      ({ rows } = await pool.query(
        `UPDATE client_notices SET active = $1, updated_at = NOW()
         WHERE id = $2 AND client_code = $3
         RETURNING ${NOTICE_DASHBOARD_COLUMNS}`,
        [body.active, id, upperCode]
      ))
    } else {
      const parsed = validateNoticeInput(body)
      if (!parsed.ok) {
        return NextResponse.json({ error: parsed.error }, { status: 400 })
      }
      const n = parsed.value
      ;({ rows } = await pool.query(
        `UPDATE client_notices
         SET title = $1, message = $2, template = $3, icon = $4,
             starts_at = $5::timestamp AT TIME ZONE 'America/Sao_Paulo',
             ends_at   = $6::timestamp AT TIME ZONE 'America/Sao_Paulo',
             updated_at = NOW()
         WHERE id = $7 AND client_code = $8
         RETURNING ${NOTICE_DASHBOARD_COLUMNS}`,
        [n.title, n.message, n.template, n.icon, n.starts_at, n.ends_at, id, upperCode]
      ))
    }
    if (!rows[0]) {
      return NextResponse.json({ error: "Aviso não encontrado" }, { status: 404 })
    }
    return NextResponse.json({ ok: true, notice: rows[0] })
  } catch (err) {
    console.error("[notices PATCH]", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const auth = await authorize(req, params)
  if ("error" in auth) return auth.error
  const { upperCode, id } = auth

  const pool = getPool()
  try {
    const { rowCount } = await pool.query(
      `DELETE FROM client_notices WHERE id = $1 AND client_code = $2`,
      [id, upperCode]
    )
    if (!rowCount) {
      return NextResponse.json({ error: "Aviso não encontrado" }, { status: 404 })
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[notices DELETE]", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
