// app/api/auth/otp/verify/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getPool } from "@/lib/db"

export const dynamic = "force-dynamic"

const SESSION_COOKIE  = "doohplay_session"
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 dias

function stripPhone(phone: string): string {
  return (phone ?? "").replace(/\D/g, "")
}

export async function POST(req: NextRequest) {
  const pool = getPool()
  try {
    const { contact, otp, method, role } = await req.json()

    if (!contact || !otp || !role) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
    }

    let tokenRow: any = null

    if (method === "whatsapp") {
      const searchDigits = stripPhone(contact)
      // Busca tokens válidos pelo role e code, compara phone no Node
      const { rows } = await pool.query(
        `SELECT * FROM otp_tokens
         WHERE code       = $1
           AND role       = $2
           AND used       = false
           AND expires_at > NOW()
           AND phone IS NOT NULL
         ORDER BY created_at DESC
         LIMIT 20`,
        [otp, role]
      )
      tokenRow = rows.find(r =>
        stripPhone(r.phone ?? "") === searchDigits ||
        stripPhone(r.phone ?? "").endsWith(searchDigits) ||
        searchDigits.endsWith(stripPhone(r.phone ?? ""))
      ) ?? null
    } else {
      const searchEmail = contact.trim().toLowerCase()
      const { rows } = await pool.query(
        `SELECT * FROM otp_tokens
         WHERE LOWER(email) = $1
           AND code         = $2
           AND role         = $3
           AND used         = false
           AND expires_at   > NOW()
         ORDER BY created_at DESC
         LIMIT 1`,
        [searchEmail, otp, role]
      )
      tokenRow = rows[0] ?? null
    }

    if (!tokenRow) {
      return NextResponse.json(
        { error: "Código inválido ou expirado. Solicite um novo." },
        { status: 401 }
      )
    }

    // Marca como usado
    await pool.query("UPDATE otp_tokens SET used = true WHERE id = $1", [tokenRow.id])

    const userCode = tokenRow.user_code
    const redirect = role === "client"
      ? `/dashboard/local/${userCode}`
      : role === "agency"
      ? `/agencia/${userCode}`
      : `/anunciante/${userCode}`

    // Seta cookie de sessão
    const sessionData = JSON.stringify({ role, code: userCode, ts: Date.now() })
    const response = NextResponse.json({ ok: true, redirect, userCode, role })
    response.cookies.set(SESSION_COOKIE, sessionData, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge:   SESSION_MAX_AGE,
      path:     "/",
    })

    return response
  } catch (err) {
    console.error("[otp/verify]", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
