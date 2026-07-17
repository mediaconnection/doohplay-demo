// app/api/auth/otp/send/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getPool } from "@/lib/db"

export const dynamic = "force-dynamic"

const EVOLUTION_API_URL  = process.env.EVOLUTION_API_URL!
const EVOLUTION_API_KEY  = process.env.EVOLUTION_API_KEY!
const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE!
const RESEND_API_KEY     = process.env.RESEND_API_KEY!

// Achado em produção (17/07/2026, mesma classe de bug já corrigida em
// lib/whatsapp.ts): nem o envio de WhatsApp nem o de e-mail aqui tinham
// timeout. Se a Evolution API ou a Resend ficassem lentas, o fetch ficava
// pendurado até o Render encerrar a conexão sozinho, devolvendo uma página
// de erro em vez de JSON — o que aparecia pro usuário como "Erro de
// conexão" na tela de /login, sem nenhum log nosso. Com timeout, o próprio
// código desiste primeiro, de forma controlada, e sempre devolve um JSON
// de erro reconhecível.
const SEND_TIMEOUT_MS = 8000

async function fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), SEND_TIMEOUT_MS)
  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } finally {
    clearTimeout(timeout)
  }
}

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "")
  if (digits.startsWith("55")) return digits
  return `55${digits}`
}

function stripPhone(phone: string): string {
  return (phone ?? "").replace(/\D/g, "")
}

async function sendWhatsApp(phone: string, code: string) {
  const msg = `🔐 *DOOHPLAY* — Seu código de acesso:\n\n*${code}*\n\nVálido por 10 minutos. Não compartilhe com ninguém.`
  const res = await fetchWithTimeout(`${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "apikey": EVOLUTION_API_KEY },
    body: JSON.stringify({ number: phone, text: msg }),
  })
  if (!res.ok) {
    const body = await res.text()
    console.error("[otp/send] WhatsApp error:", res.status, body)
    throw new Error("Falha ao enviar WhatsApp")
  }
}

async function sendEmail(email: string, code: string, name: string) {
  const res = await fetchWithTimeout("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "DOOHPLAY <noreply@doohplay.com.br>",
      to:   [email],
      subject: `${code} — Seu código de acesso DOOHPLAY`,
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #0B1020; color: #F9FAFB; border-radius: 16px;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 28px;">
            <div style="width: 36px; height: 36px; background: linear-gradient(135deg, #3B82F6, #6366F1); border-radius: 8px; display: flex; align-items: center; justify-content: center;">
              <span style="color: white; font-size: 18px;">📺</span>
            </div>
            <span style="font-size: 18px; font-weight: 800; color: #F9FAFB;">DOOH<span style="color: #3B82F6;">PLAY</span></span>
          </div>
          <h2 style="font-size: 20px; font-weight: 700; margin: 0 0 8px; color: #F9FAFB;">Seu código de acesso</h2>
          <p style="font-size: 14px; color: #9CA3AF; margin: 0 0 28px;">Olá${name ? ` ${name}` : ""}! Use o código abaixo para acessar sua conta.</p>
          <div style="background: #111827; border: 1px solid #1F2937; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <div style="font-size: 40px; font-weight: 900; letter-spacing: 12px; color: #3B82F6; font-family: monospace;">${code}</div>
            <div style="font-size: 12px; color: #6B7280; margin-top: 10px;">Válido por 10 minutos</div>
          </div>
          <p style="font-size: 12px; color: #4B5563; margin: 0;">Se você não solicitou este código, ignore este email. Nunca compartilhe seu código com ninguém.</p>
          <hr style="border: none; border-top: 1px solid #1F2937; margin: 24px 0;" />
          <p style="font-size: 11px; color: #374151; margin: 0; text-align: center;">© 2026 DOOHPLAY · doohplay.com.br</p>
        </div>
      `,
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    console.error("[otp/send] Resend error:", res.status, body)
    throw new Error("Falha ao enviar email")
  }
}

export async function POST(req: NextRequest) {
  const pool = getPool()
  try {
    const { contact, method, role, intended_code } = await req.json()

    if (!contact?.trim()) return NextResponse.json({ error: "Contato obrigatório" }, { status: 400 })
    if (!role || !["client", "advertiser", "agency"].includes(role)) {
      return NextResponse.json({ error: "Role inválido" }, { status: 400 })
    }

    const table = role === "client" ? "studio_clients"
                 : role === "agency"     ? "agencies"
                 : '"Advertiser"'

    let userRow: any = null

    if (method === "whatsapp") {
      const searchDigits = stripPhone(contact)
      const { rows } = await pool.query(
        `SELECT code, name, phone, email FROM ${table} WHERE phone IS NOT NULL`
      )
      userRow = rows.find(r =>
        stripPhone(r.phone ?? "") === searchDigits ||
        stripPhone(r.phone ?? "").endsWith(searchDigits) ||
        searchDigits.endsWith(stripPhone(r.phone ?? ""))
      ) ?? null
    } else {
      const searchEmail = contact.trim().toLowerCase()
      const { rows } = await pool.query(
        `SELECT code, name, phone, email FROM ${table} WHERE LOWER(email) = $1 LIMIT 1`,
        [searchEmail]
      )
      userRow = rows[0] ?? null
    }

    if (!userRow) {
      return NextResponse.json(
        { error: method === "whatsapp"
            ? "WhatsApp não encontrado. Verifique o número ou fale com o suporte."
            : "Email não encontrado. Verifique o endereço informado." },
        { status: 404 }
      )
    }

    // Achado em produção (16/07/2026): antes disto, qualquer contato válido
    // logava a pessoa na PRÓPRIA conta dela, mesmo que ela estivesse tentando
    // acessar uma conta específica diferente (ex: veio de um link/redirect
    // pra AGENC787, mas digitou — ou o navegador autofilled — um contato que
    // pertence à BARBE332). O destino pretendido era descartado sem aviso.
    // Agora, se um destino específico foi informado, recusamos explicitamente
    // quando o contato não pertence a ele, em vez de silenciosamente trocar
    // de conta.
    if (intended_code && String(userRow.code).toUpperCase() !== String(intended_code).toUpperCase()) {
      return NextResponse.json(
        { error: `Esse contato pertence à conta ${userRow.code}, não a ${intended_code}. Confirme o contato certo para essa conta específica.` },
        { status: 403 }
      )
    }

    // Gera OTP e salva (expira em 10 min)
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

    // Envia OTP pelo método escolhido
    if (method === "whatsapp" && userRow.phone) {
      await sendWhatsApp(normalizePhone(userRow.phone), code)
    } else if (method === "email" && userRow.email) {
      await sendEmail(userRow.email, code, userRow.name ?? "")
    } else {
      return NextResponse.json(
        { error: method === "email" ? "Email não cadastrado para este usuário." : "WhatsApp não cadastrado." },
        { status: 400 }
      )
    }

    return NextResponse.json({ ok: true, name: userRow.name })
  } catch (err: any) {
    console.error("[otp/send]", err)
    return NextResponse.json(
      { error: err.message?.includes("Falha") ? err.message : "Erro interno" },
      { status: 500 }
    )
  }
}
