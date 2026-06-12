// app/api/auth/otp/send/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getPool } from "@/lib/db"

export const dynamic = "force-dynamic"

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL!
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY!
const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE!

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "")
  if (digits.startsWith("55")) return digits
  return `55${digits}`
}

async function sendWhatsApp(phone: string, code: string) {
  const msg = `🔐 *DOOHPLAY* — Seu código de acesso:\n\n*${code}*\n\nVálido por 10 minutos. Não compartilhe com ninguém.`
  await fetch(`${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "apikey": EVOLUTION_API_KEY },
    body: JSON.stringify({ number: phone, text: msg }),
  })
}

export async function POST(req: NextRequest) {
  const pool = getPool()
  try {
    const { contact, method, role } = await req.json()

    if (!contact?.trim()) return NextResponse.json({ error: "Contato obrigatório" }, { status: 400 })
    if (!role || !["client", "advertiser"].includes(role)) return NextResponse.json({ error: "Role inválido" }, { status: 400 })

    const table = role === "client" ? "studio_clients" : "advertisers"
    const field = method === "email" ? "email" : "phone"

    // Normaliza telefone para busca
    const searchContact = method === "whatsapp"
      ? contact.replace(/\D/g, "")
      : contact.trim().toLowerCase()

    // Busca usuário — tenta com e sem prefixo 55
    let userRow: any = null
    if (method === "whatsapp") {
      const { rows } = await pool.query(
        `SELECT code, name, phone, email FROM ${table}
         WHERE REGEXP_REPLACE(phone, '\\D', '', 'g') LIKE $1
            OR REGEXP_REPLACE(phone, '\\D', '', 'g') = $2
         LIMIT 1`,
        [`%${searchContact}`, searchContact]
      )
      userRow = rows[0] ?? null
    } else {
      const { rows } = await pool.query(
        `SELECT code, name, phone, email FROM ${table} WHERE LOWER(email) = $1 LIMIT 1`,
        [searchContact]
      )
      userRow = rows[0] ?? null
    }

    if (!userRow) {
      return NextResponse.json(
        { error: method === "whatsapp" ? "WhatsApp não encontrado. Verifique o número." : "Email não encontrado." },
        { status: 404 }
      )
    }

    // Gera OTP e salva no banco (expira em 10 min)
    const code    = generateOtp()
    const expires = new Date(Date.now() + 10 * 60 * 1000)

    await pool.query(
      `INSERT INTO otp_tokens (phone, email, code, role, user_code, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        userRow.phone ?? null,
        userRow.email ?? null,
        code,
        role,
        userRow.code,
        expires,
      ]
    )

    // Envia OTP
    if (method === "whatsapp" && userRow.phone) {
      await sendWhatsApp(normalizePhone(userRow.phone), code)
    } else if (method === "email" && userRow.email) {
      // Email: por ora loga no console — integrar SMTP depois
      console.log(`[OTP EMAIL] Para: ${userRow.email} | Código: ${code}`)
    }

    return NextResponse.json({ ok: true, name: userRow.name })
  } catch (err) {
    console.error("[otp/send]", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
