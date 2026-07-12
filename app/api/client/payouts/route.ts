// app/api/client/payouts/route.ts
// GET ?code=BARBE332 — lista histórico de repasses + total pendente
// POST — solicita repasse manual (cria registro 'pending', admin processa via Asaas)
//
// FIX (12/07/2026 — achado crítico de segurança, junto com bank-account):
// GET e POST não checavam sessão — qualquer um sabendo o `code` conseguia
// ver o histórico financeiro de um cliente e, pior, criar um registro de
// repasse 'pending' com valor arbitrário pra qualquer código. Combinado
// com o mesmo buraco em bank-account (Pix sequestrável), dava pra desviar
// dinheiro real. Agora exige sessão da Fase 14, mesmo padrão de
// settings/[code]/route.ts.
import { NextRequest, NextResponse } from "next/server"
import { getPool } from "@/lib/db"
import { verifyClientSessionToken, CLIENT_SESSION_COOKIE } from "@/lib/client-session"

export const dynamic = "force-dynamic"

export const PAYOUT_RATE = 0.40 // 40% pro dono da tela

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
      `SELECT
         id, gross_amount, payout_rate, net_amount,
         status, reference_month, paid_at, notes, created_at
       FROM client_payouts
       WHERE client_code = $1
       ORDER BY created_at DESC
       LIMIT 24`,
      [code]
    )
    const pending = rows
      .filter((r: any) => r.status === "pending" || r.status === "processing")
      .reduce((sum: number, r: any) => sum + Number(r.net_amount), 0)
    const paid = rows
      .filter((r: any) => r.status === "paid")
      .reduce((sum: number, r: any) => sum + Number(r.net_amount), 0)

    return NextResponse.json({ payouts: rows, pending, paid })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const pool = getPool()
  try {
    const { code, gross_amount, campaign_id, notes } = await req.json()
    if (!code || !gross_amount) {
      return NextResponse.json({ error: "code e gross_amount obrigatórios" }, { status: 400 })
    }
    const upperCode = code.toUpperCase()

    const sessionCode = verifyClientSessionToken(req.cookies.get(CLIENT_SESSION_COOKIE)?.value)
    if (sessionCode !== upperCode) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const net_amount = Math.round(Number(gross_amount) * PAYOUT_RATE * 100) / 100
    const { rows } = await pool.query(
      `INSERT INTO client_payouts (client_code, campaign_id, gross_amount, payout_rate, net_amount, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, net_amount, status`,
      [upperCode, campaign_id ?? null, gross_amount, PAYOUT_RATE, net_amount, notes ?? null]
    )
    return NextResponse.json({ ok: true, payout: rows[0] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
