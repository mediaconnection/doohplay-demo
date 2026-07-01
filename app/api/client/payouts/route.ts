// app/api/client/payouts/route.ts
// GET ?code=BARBE332 — lista histórico de repasses + total pendente
// POST — solicita repasse manual (cria registro 'pending', admin processa via Asaas)
import { NextRequest, NextResponse } from "next/server"
import { getPool } from "@/lib/db"

export const dynamic = "force-dynamic"

export const PAYOUT_RATE = 0.40 // 40% pro dono da tela

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code")?.toUpperCase()
  if (!code) return NextResponse.json({ error: "code obrigatório" }, { status: 400 })
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
    const net_amount = Math.round(Number(gross_amount) * PAYOUT_RATE * 100) / 100
    const { rows } = await pool.query(
      `INSERT INTO client_payouts (client_code, campaign_id, gross_amount, payout_rate, net_amount, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, net_amount, status`,
      [code.toUpperCase(), campaign_id ?? null, gross_amount, PAYOUT_RATE, net_amount, notes ?? null]
    )
    return NextResponse.json({ ok: true, payout: rows[0] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
