// app/api/client/bank-account/route.ts
// Cadastro de chave Pix e dados bancários do dono da tela.
// GET ?code=BARBE332 — retorna dados cadastrados (ou null se não cadastrado)
// POST — cadastra/atualiza (upsert) os dados
import { NextRequest, NextResponse } from "next/server"
import { getPool } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code")?.toUpperCase()
  if (!code) return NextResponse.json({ error: "code obrigatório" }, { status: 400 })
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
      [code.toUpperCase(), pix_key_type, pix_key, bank_name ?? null, account_name]
    )
    return NextResponse.json({ ok: true, account: rows[0] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
