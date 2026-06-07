import { NextRequest, NextResponse } from "next/server"
import { getPool } from "@/lib/db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const EVOLUTION_URL      = process.env.EVOLUTION_API_URL      || "http://2.25.180.53:32768"
const EVOLUTION_KEY      = process.env.EVOLUTION_API_KEY      || "q8nC1RGZczvlT7T5figPsLUJTsnsXjtI"
const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE     || "doohplay"
const LEAD_EMAIL         = process.env.LEAD_NOTIFICATION_EMAIL || "lead@doohplay.com.br"
const DOOHPLAY_PHONE     = process.env.DOOHPLAY_PHONE          || "5511962050987"

async function sendWhatsApp(phone: string, message: string) {
  try {
    await fetch(`${EVOLUTION_URL}/message/sendText/${EVOLUTION_INSTANCE}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: EVOLUTION_KEY },
      body: JSON.stringify({ number: phone, text: message }),
    })
  } catch (err) {
    console.error("[onboarding] whatsapp error:", err)
  }
}

function generateCode(name: string): string {
  const clean = name.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 5)
  const rand  = Math.floor(Math.random() * 900) + 100
  return `${clean}${rand}`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      business_name, business_type, address, city,
      plan, contact_name, email, phone, how_heard,
    } = body

    // Validação básica
    if (!business_name || !business_type || !address || !city) {
      return NextResponse.json({ error: "Dados do estabelecimento incompletos" }, { status: 400 })
    }
    if (!contact_name || !email || !phone) {
      return NextResponse.json({ error: "Dados de contato incompletos" }, { status: 400 })
    }
    if (!plan) {
      return NextResponse.json({ error: "Plano não selecionado" }, { status: 400 })
    }

    const pool = getPool()
    const code = generateCode(business_name)

    // Salva o lead no banco
    await pool.query(
      `INSERT INTO studio_clients
         (code, name, business_type, address, phone, active)
       VALUES ($1, $2, $3, $4, $5, false)
       ON CONFLICT (code) DO NOTHING`,
      [code, business_name, business_type, `${address}, ${city}`, phone.replace(/\D/g, "")]
    )

    // Salva lead completo na tabela de leads (se existir)
    try {
      await pool.query(
        `INSERT INTO leads
           (code, business_name, business_type, address, city, plan,
            contact_name, email, phone, how_heard, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10, NOW())`,
        [code, business_name, business_type, address, city, plan,
         contact_name, email, phone.replace(/\D/g, ""), how_heard || ""]
      )
    } catch {
      // Tabela leads pode não existir ainda — não quebra o fluxo
    }

    const planNames: Record<string, string> = {
      starter: "Starter — R$197/mês",
      pro:     "Pro — R$347/mês",
      multi:   "Multi — R$547/mês",
    }

    // WhatsApp para o cliente
    const clientMsg = [
      `🎉 *Olá, ${contact_name}!*`,
      ``,
      `Recebemos seu cadastro no *DOOHPLAY* com sucesso!`,
      ``,
      `📋 *Resumo do pedido:*`,
      `🏪 ${business_name}`,
      `📦 Plano ${planNames[plan] || plan}`,
      `📍 ${address}, ${city}`,
      ``,
      `Nossa equipe entrará em contato em até *24 horas* para agendar a instalação.`,
      ``,
      `Qualquer dúvida, responda aqui mesmo! 😊`,
      ``,
      `_DOOHPLAY — Trust Infrastructure for DOOH Advertising_`,
    ].join("\n")

    // WhatsApp de notificação interna
    const internalMsg = [
      `🔔 *Novo lead DOOHPLAY!*`,
      ``,
      `🏪 *${business_name}*`,
      `🍽 ${business_type}`,
      `📍 ${address}, ${city}`,
      `📦 Plano: ${planNames[plan] || plan}`,
      ``,
      `👤 *Contato:*`,
      `Nome: ${contact_name}`,
      `Email: ${email}`,
      `WhatsApp: ${phone}`,
      `Como conheceu: ${how_heard || "Não informado"}`,
      ``,
      `🔑 Código: ${code}`,
      ``,
      `Acesse o painel para ativar: https://doohplay-demo.onrender.com/admin`,
    ].join("\n")

    // Envia as mensagens em paralelo
    await Promise.allSettled([
      sendWhatsApp(phone.replace(/\D/g, ""), clientMsg),
      sendWhatsApp(DOOHPLAY_PHONE, internalMsg),
    ])

    return NextResponse.json({ ok: true, code })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error("[onboarding] error:", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
