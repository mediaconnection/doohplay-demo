// app/api/client/auth/request-otp/route.ts
import { NextRequest, NextResponse } from "next/server"
import { randomInt } from "crypto"
import { getPool } from "@/lib/db"
import { hashPassword } from "@/lib/password"
import { sendWhatsApp } from "@/lib/whatsapp"

export const dynamic = "force-dynamic"

const OTP_TTL_MINUTES = 10
const RESEND_COOLDOWN_SECONDS = 60

// Resposta sempre genérica, exista ou não o código/telefone — evita que
// alguém use esta rota pra descobrir quais códigos de cliente são válidos
// ou têm telefone cadastrado (enumeration).
const GENERIC_OK = NextResponse.json({
  ok: true,
  message: "Se o código existir e tiver WhatsApp cadastrado, enviamos um código de acesso.",
})

export async function POST(req: NextRequest) {
  const pool = getPool()
  try {
    const { code } = await req.json()
    const clientCode = String(code || "").trim().toUpperCase()
    if (!clientCode) return NextResponse.json({ error: "Código é obrigatório" }, { status: 400 })

    const clientRes = await pool.query(
      `SELECT code, phone FROM studio_clients WHERE code = $1 AND active = true LIMIT 1`,
      [clientCode]
    )
    const client = clientRes.rows[0]
    if (!client?.phone) return GENERIC_OK

    // Cooldown: não manda outro código se já mandou um há menos de 60s —
    // evita spam de WhatsApp (custo + irritação) por clique repetido.
    const lastRes = await pool.query(
      `SELECT created_at FROM client_login_codes WHERE client_code = $1 ORDER BY created_at DESC LIMIT 1`,
      [clientCode]
    )
    const last = lastRes.rows[0]
    if (last && Date.now() - new Date(last.created_at).getTime() < RESEND_COOLDOWN_SECONDS * 1000) {
      return GENERIC_OK
    }

    const otp = randomInt(100000, 999999).toString()
    const otpHash = hashPassword(otp)
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60_000)

    await pool.query(
      `INSERT INTO client_login_codes (client_code, otp_hash, expires_at) VALUES ($1, $2, $3)`,
      [clientCode, otpHash, expiresAt]
    )

    await sendWhatsApp(client.phone,
      `🔐 *Código de acesso — DOOHPLAY*\n\n` +
      `Seu código: *${otp}*\n\n` +
      `Válido por ${OTP_TTL_MINUTES} minutos. Não compartilhe com ninguém.`
    )

    return GENERIC_OK
  } catch (err) {
    console.error("[client/auth/request-otp]", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
