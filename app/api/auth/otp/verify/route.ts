// app/api/auth/otp/verify/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getPool } from "@/lib/db"

export const dynamic = "force-dynamic"

const SESSION_COOKIE = "doohplay_session"
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 dias

export async function POST(req: NextRequest) {
  const pool = getPool()
  try {
    const { contact, otp, method, role } = await req.json()

    if (!contact || !otp || !role) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
    }

    const searchContact = method === "whatsapp"
      ? contact.replace(/\D/g, "")
      : contact.trim().toLowerCase()

    // Busca token válido
    let tokenRow: any = null

    if (method === "whatsapp") {
      const { rows } = await pool.query(
        `SELECT t.* FROM otp_tokens t
         WHERE REGEXP_REPLACE(t.phone, '\\D', '', 'g') LIKE $1
           AND t.code      = $2
           AND t.role      = $3
           AND t.used      = false
           AND t.expires_at > NOW()
         ORDER BY t.created_at DESC
         LIMIT 1`,
        [`%${searchContact}`, otp, role]
      )
      tokenRow = rows[0] ?? null
    } else {
      const { rows } = await pool.query(
        `SELECT t.* FROM otp_tokens t
         WHERE LOWER(t.email) = $1
           AND t.code         = $2
           AND t.role         = $3
           AND t.used         = false
           AND t.expires_at   > NOW()
         ORDER BY t.created_at DESC
         LIMIT 1`,
        [searchContact, otp, role]
      )
      tokenRow = rows[0] ?? null
    }

    if (!tokenRow) {
      return NextResponse.json(
        { error: "Código inválido ou expirado. Solicite um novo." },
        { status: 401 }
      )
    }

    // Marca token como usado
    await pool.query("UPDATE otp_tokens SET used = true WHERE id = $1", [tokenRow.id])

    const userCode = tokenRow.user_code
    const redirect = role === "client"
      ? `/dashboard/local/${userCode}`
      : `/anunciante/${userCode}`

    // Cria sessão e seta cookie
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
