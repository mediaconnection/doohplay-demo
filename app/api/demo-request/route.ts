// app/api/demo-request/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getPool } from "@/lib/db"

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL!
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY!
const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE!

const NOTIFY_PHONE = "5511962050987"

async function sendWhatsApp(phone: string, message: string) {
  try {
    await fetch(`${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": EVOLUTION_API_KEY,
      },
      body: JSON.stringify({
        number: phone,
        text: message,
      }),
    })
  } catch (err) {
    console.error("[demo-request] WhatsApp error:", err)
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, company, phone, segment } = await req.json()

    if (!name?.trim() || !phone?.trim()) {
      return NextResponse.json({ error: "Nome e telefone são obrigatórios." }, { status: 400 })
    }

    const pool = getPool()

    // Salva no banco
    await pool.query(
      `INSERT INTO demo_requests (name, company, phone, segment, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT DO NOTHING`,
      [name.trim(), company?.trim() || null, phone.trim(), segment?.trim() || null]
    )

    // Notifica via WhatsApp
    const msg = [
      `🚀 *Nova Solicitação de Demo — DOOHPLAY*`,
      ``,
      `👤 *Nome:* ${name}`,
      company ? `🏢 *Empresa:* ${company}` : null,
      `📱 *WhatsApp:* ${phone}`,
      segment ? `🏷 *Segmento:* ${segment}` : null,
      ``,
      `⏰ ${new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}`,
    ].filter(Boolean).join("\n")

    await sendWhatsApp(NOTIFY_PHONE, msg)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[demo-request] error:", err)
    return NextResponse.json({ error: "Erro interno." }, { status: 500 })
  }
}
