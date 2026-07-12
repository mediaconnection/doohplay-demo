// app/api/client/auth/verify-otp/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getPool } from "@/lib/db"
import { verifyPassword } from "@/lib/password"
import { createClientSessionToken, CLIENT_SESSION_COOKIE, CLIENT_SESSION_MAX_AGE_SECONDS } from "@/lib/client-session"

export const dynamic = "force-dynamic"

const MAX_ATTEMPTS = 5

export async function POST(req: NextRequest) {
  const pool = getPool()
  try {
    const { code, otp } = await req.json()
    const clientCode = String(code || "").trim().toUpperCase()
    const otpInput = String(otp || "").trim()
    if (!clientCode || !otpInput) {
      return NextResponse.json({ error: "Código e OTP são obrigatórios" }, { status: 400 })
    }

    const row = await pool.query(
      `SELECT id, otp_hash, expires_at, used, attempts
       FROM client_login_codes
       WHERE client_code = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [clientCode]
    )
    const entry = row.rows[0]

    if (!entry || entry.used || new Date(entry.expires_at).getTime() < Date.now()) {
      return NextResponse.json({ error: "Código inválido ou expirado. Peça um novo." }, { status: 401 })
    }
    if (entry.attempts >= MAX_ATTEMPTS) {
      return NextResponse.json({ error: "Muitas tentativas erradas. Peça um novo código." }, { status: 401 })
    }

    if (!verifyPassword(otpInput, entry.otp_hash)) {
      await pool.query(`UPDATE client_login_codes SET attempts = attempts + 1 WHERE id = $1`, [entry.id])
      return NextResponse.json({ error: "Código incorreto." }, { status: 401 })
    }

    await pool.query(`UPDATE client_login_codes SET used = true WHERE id = $1`, [entry.id])

    const token = createClientSessionToken(clientCode)
    const res = NextResponse.json({ ok: true })
    res.cookies.set(CLIENT_SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: CLIENT_SESSION_MAX_AGE_SECONDS,
    })
    return res
  } catch (err) {
    console.error("[client/auth/verify-otp]", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
