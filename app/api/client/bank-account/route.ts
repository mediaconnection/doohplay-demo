// app/api/client/bank-account/route.ts
// Cadastro de chave Pix e dados bancários do dono da tela.
// GET ?code=BARBE332 — retorna dados cadastrados (ou null se não cadastrado)
// POST — cadastra/atualiza (upsert) os dados
//
// FIX (12/07/2026 — achado crítico de segurança): antes desta correção,
// GET e POST não checavam sessão nenhuma — qualquer um que soubesse o
// `code` de um cliente (não é segredo: aparece em URL, prints, QR code)
// conseguia ler a chave Pix dele e, pior, SOBRESCREVER pra própria conta.
// Combinado com o mesmo buraco em /api/client/payouts, dava pra desviar
// repasse de um cliente pra outra pessoa. Agora exige sessão da Fase 14
// (mesmo padrão de settings/[code]/route.ts) e o `code` autenticado tem
// que bater com o `code` da requisição.
import { NextRequest, NextResponse } from "next/server"
import { getPool } from "@/lib/db"
import { verifyClientSessionToken, CLIENT_SESSION_COOKIE } from "@/lib/client-session"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code")?.toUpperCase()
  if (!code) return NextResponse.json({ error: "code obrigatório" }, { status: 400 })

  const sessionCode = verifyClientSessionToken(req.cookies.get(CLIENT_SESSION_COOKIE)?.value)
  if (sessionCode !== code) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  const pool = getPool()
  try {
    const { rows } = await pool.query(
      `SELECT pix_key_type, pix_key, bank_name, account_name, updated_at
       FROM client_bank_accounts WHERE client_code = $1 LIMIT 1`,
      [code]
    )
    return NextResponse.json({ account: rows[0] ?? null })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const pool = getPool()
  try {
    const { code, pix_key_type, pix_key, bank_name, account_name } = await req.json()
    if (!code || !pix_key_type || !pix_key || !account_name) {
      return NextResponse.json({ error: "code, pix_key_type, pix_key e account_name são obrigatórios" }, { status: 400 })
    }
    const upperCode = code.toUpperCase()

    const sessionCode = verifyClientSessionToken(req.cookies.get(CLIENT_SESSION_COOKIE)?.value)
    if (sessionCode !== upperCode) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const { rows } = await pool.query(
      `INSERT INTO client_bank_accounts (client_code, pix_key_type, pix_key, bank_name, account_name)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (client_code) DO UPDATE SET
         pix_key_type = EXCLUDED.pix_key_type,
         pix_key      = EXCLUDED.pix_key,
         bank_name    = EXCLUDED.bank_name,
         account_name = EXCLUDED.account_name,
         updated_at   = NOW()
       RETURNING pix_key_type, pix_key, bank_name, account_name`,
      [upperCode, pix_key_type, pix_key, bank_name ?? null, account_name]
    )
    return NextResponse.json({ ok: true, account: rows[0] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
