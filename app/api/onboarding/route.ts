import { NextRequest, NextResponse } from "next/server"
import { getPool } from "@/lib/db"
import { PLANS, PlanKey } from "@/lib/asaas"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const EVOLUTION_URL      = process.env.EVOLUTION_API_URL  || "https://evo.doohplay.com.br"
const EVOLUTION_KEY      = process.env.EVOLUTION_API_KEY ?? ""
const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE || "doohplay"
const DOOHPLAY_PHONE     = process.env.DOOHPLAY_PHONE     || "5511962050987"

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

function trialEndDate(): string {
  const d = new Date()
  d.setDate(d.getDate() + 7)
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })
}

async function createAsaasSubscription(code: string, plan: string, cpf_cnpj: string) {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL || "https://doohplay.com.br"}/api/finance/asaas?secret=${encodeURIComponent(process.env.ADMIN_SECRET || "")}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, plan, cpf_cnpj }),
    })
    const data = await res.json()
    if (!res.ok) {
      console.error("[onboarding] asaas error:", data)
      return null
    }
    return data
  } catch (err) {
    console.error("[onboarding] asaas fetch error:", err)
    return null
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      business_name, business_type, address, city,
      plan, contact_name, email, phone, how_heard, cpf_cnpj,
    } = body

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
    const trialEnd = trialEndDate()

    // Salva cliente no banco
    await pool.query(
      `INSERT INTO studio_clients
         (code, name, business_type, address, phone, active, cpf_cnpj)
       VALUES ($1, $2, $3, $4, $5, false, $6)
       ON CONFLICT (code) DO NOTHING`,
      [code, business_name, business_type, `${address}, ${city}`,
       phone.replace(/\D/g, ""), cpf_cnpj ? cpf_cnpj.replace(/\D/g, "") : null]
    )

    // Salva lead
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
      // Tabela leads pode não existir
    }

    // Achado em produção (15/07/2026): esse texto tinha valores de plano
    // hardcoded e desatualizados ("Starter — R$197/mês", quando o Starter
    // real é R$97), com nomes de plano ("multi") que nem existem mais em
    // PLANS. Corrigido pra derivar sempre da mesma fonte única.
    const planNames: Record<string, string> = Object.fromEntries(
      Object.entries(PLANS).map(([key, p]) => [key, `${p.name} — R$${p.value}/mês`])
    )

    // Cria assinatura no Asaas (só se tiver CPF/CNPJ)
    let asaasResult = null
    if (cpf_cnpj) {
      asaasResult = await createAsaasSubscription(code, plan, cpf_cnpj)
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
      `🎁 *Você tem 7 dias grátis!*`,
      `A primeira cobrança será apenas no dia *${trialEnd}*.`,
      ``,
      asaasResult?.payment_link
        ? `💳 Link de pagamento: ${asaasResult.payment_link}`
        : `Nossa equipe entrará em contato em até *24 horas* para finalizar a ativação.`,
      ``,
      `Qualquer dúvida, responda aqui mesmo! 😊`,
      ``,
      `_DOOHPLAY — Trust Infrastructure for DOOH Advertising_`,
    ].join("\n")

    // WhatsApp interno
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
      `CPF/CNPJ: ${cpf_cnpj || "Não informado"}`,
      `Como conheceu: ${how_heard || "Não informado"}`,
      ``,
      `🔑 Código: ${code}`,
      `💳 Asaas: ${asaasResult ? `✅ ${asaasResult.subscription_id}` : "⚠️ Sem CPF — ativar manualmente"}`,
      ``,
      `Acesse o painel para ativar: https://doohplay.com.br/admin`,
    ].join("\n")

    await Promise.allSettled([
      sendWhatsApp(phone.replace(/\D/g, ""), clientMsg),
      sendWhatsApp(DOOHPLAY_PHONE, internalMsg),
    ])

    return NextResponse.json({
      ok: true,
      code,
      trial_end: trialEnd,
      asaas: asaasResult ? { ok: true, subscription_id: asaasResult.subscription_id } : null,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error("[onboarding] error:", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
