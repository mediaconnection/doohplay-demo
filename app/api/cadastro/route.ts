// app/api/cadastro/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getPool } from "@/lib/db"
import { getOrCreateAsaasCustomer, createSubscription, PLANS, PlanKey } from "@/lib/asaas"

export const dynamic = "force-dynamic"

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL!
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY!
const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE!
const RESEND_API_KEY = process.env.RESEND_API_KEY!

function generateCode(businessType: string): string {
  const prefix = businessType
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z]/g, "")
    .slice(0, 5)
  const num = Math.floor(100 + Math.random() * 900)
  return `${prefix}${num}`
}

async function sendWhatsApp(phone: string, message: string) {
  try {
    const clean = phone.replace(/\D/g, "")
    const number = clean.startsWith("55") ? clean : `55${clean}`
    await fetch(`${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "apikey": EVOLUTION_API_KEY },
      body: JSON.stringify({ number, text: message }),
    })
  } catch (err) {
    console.error("[cadastro] WhatsApp error:", err)
  }
}

async function sendEmail(to: string, name: string, code: string, plan: string) {
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({
        from: "DOOHPLAY <noreply@doohplay.com.br>",
        to,
        subject: "Bem-vindo ao DOOHPLAY! Seu código de tela 📺",
        html: `
          <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;background:#0F172A;color:#F1F5F9;border-radius:16px;overflow:hidden;">
            <div style="background:linear-gradient(135deg,#1E293B,#0F172A);padding:32px;text-align:center;border-bottom:1px solid #334155;">
              <div style="font-size:28px;font-weight:900;margin-bottom:8px;">DOOH<span style="color:#3B82F6">PLAY</span></div>
              <div style="font-size:16px;color:#94A3B8;">Bem-vindo à rede!</div>
            </div>
            <div style="padding:32px;">
              <p style="font-size:16px;color:#CBD5E1;margin-bottom:20px;">Olá <strong style="color:#F1F5F9">${name}</strong>! 🎉</p>
              <p style="font-size:14px;color:#94A3B8;margin-bottom:24px;line-height:1.6;">Sua conta foi criada com sucesso. Aqui estão seus dados de acesso:</p>
              <div style="background:#0F172A;border:2px solid #3B82F6;border-radius:14px;padding:20px;text-align:center;margin-bottom:24px;">
                <div style="font-size:12px;color:#64748B;margin-bottom:8px;">SEU CÓDIGO DE TELA</div>
                <div style="font-size:36px;font-weight:900;color:#3B82F6;letter-spacing:6px;">${code}</div>
              </div>
              <div style="background:#1E293B;border-radius:12px;padding:16px;margin-bottom:24px;">
                <div style="font-size:12px;color:#64748B;margin-bottom:12px;">SEUS LINKS</div>
                <div style="font-size:13px;color:#CBD5E1;line-height:2;">
                  📱 Dashboard: <a href="https://doohplay.com.br/dashboard/local/${code}" style="color:#3B82F6;">doohplay.com.br/dashboard/local/${code}</a><br>
                  📲 Instalar TV: <a href="https://doohplay.com.br/instalar/${code}" style="color:#3B82F6;">doohplay.com.br/instalar/${code}</a><br>
                  📖 Guia de uso: <a href="https://doohplay.com.br/guia-uso" style="color:#3B82F6;">doohplay.com.br/guia-uso</a>
                </div>
              </div>
              <div style="background:#052e16;border:1px solid #166534;border-radius:12px;padding:16px;margin-bottom:24px;">
                <div style="font-size:14px;color:#4ade80;">🎁 <strong>7 dias grátis</strong> — sem nenhuma cobrança agora</div>
                <div style="font-size:12px;color:#86efac;margin-top:4px;">Após o período de teste, cobramos R$ ${PLANS[plan as PlanKey]?.value ?? 97}/mês via PIX ou boleto.</div>
              </div>
              <a href="https://doohplay.com.br/instalar/${code}" style="display:block;background:linear-gradient(135deg,#3B82F6,#6366F1);color:white;text-decoration:none;text-align:center;padding:14px;border-radius:12px;font-size:15px;font-weight:700;">
                📱 Instalar app na TV agora
              </a>
            </div>
            <div style="padding:20px 32px;text-align:center;border-top:1px solid #1E293B;">
              <div style="font-size:12px;color:#475569;">Dúvidas? Responda este email ou acesse doohplay.com.br</div>
            </div>
          </div>
        `
      })
    })
  } catch (err) {
    console.error("[cadastro] Email error:", err)
  }
}

export async function POST(req: NextRequest) {
  const pool = getPool()
  try {
    const { name, business_type, city, phone, email, cpf, plan } = await req.json()

    // Validações
    if (!name?.trim()) return NextResponse.json({ error: "Nome obrigatório" }, { status: 400 })
    if (!phone?.trim()) return NextResponse.json({ error: "Telefone obrigatório" }, { status: 400 })
    if (!email?.trim()) return NextResponse.json({ error: "Email obrigatório" }, { status: 400 })
    if (!cpf?.replace(/\D/g,"") || cpf.replace(/\D/g,"").length !== 11) {
      return NextResponse.json({ error: "CPF inválido" }, { status: 400 })
    }
    if (!PLANS[plan as PlanKey]) {
      return NextResponse.json({ error: "Plano inválido" }, { status: 400 })
    }

    // Verifica se email já existe
    const { rows: existing } = await pool.query(
      `SELECT code FROM studio_clients WHERE email = $1 LIMIT 1`,
      [email.toLowerCase().trim()]
    )
    if (existing[0]) {
      return NextResponse.json({ error: "Este email já possui uma conta. Acesse doohplay.com.br/login" }, { status: 409 })
    }

    // Gera código único
    let code = generateCode(business_type || name)
    let attempts = 0
    while (attempts < 10) {
      const { rows } = await pool.query(`SELECT code FROM studio_clients WHERE code = $1`, [code])
      if (!rows[0]) break
      code = generateCode(business_type || name)
      attempts++
    }

    // Cria cliente no banco
    await pool.query(
      `INSERT INTO studio_clients (code, name, business_type, city, phone, email, cpf_cnpj, active, notif_whatsapp, notif_email, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true, true, true, NOW())`,
      [code, name.trim(), business_type, city.trim(), phone.replace(/\D/g,""), email.toLowerCase().trim(), cpf.replace(/\D/g,"")]
    )

    // Cria cliente e assinatura no Asaas (7 dias grátis)
    try {
      const customer = await getOrCreateAsaasCustomer({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.replace(/\D/g,""),
        cpfCnpj: cpf.replace(/\D/g,""),
      })

      const nextDueDate = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)

      const subscription = await createSubscription({
        customerId: customer.id,
        plan: plan as PlanKey,
        nextDueDate,
      })

      await pool.query(
        `INSERT INTO financial_subscriptions (code, asaas_customer_id, asaas_subscription_id, plan, value, status, created_at)
         VALUES ($1, $2, $3, $4, $5, 'ACTIVE', NOW())`,
        [code, customer.id, subscription.id, plan, PLANS[plan as PlanKey].value]
      )
    } catch (asaasErr: any) {
      console.error("[cadastro] Asaas error (non-fatal):", asaasErr.message)
      // Não bloqueia o cadastro se o Asaas falhar
    }

    // Envia WhatsApp
    await sendWhatsApp(phone, 
      `🎉 *Bem-vindo ao DOOHPLAY, ${name}!*\n\n` +
      `Sua conta foi criada com sucesso!\n\n` +
      `🔑 *Seu código de tela:* ${code}\n\n` +
      `📱 *Instale o app na sua TV:*\n` +
      `doohplay.com.br/instalar/${code}\n\n` +
      `📊 *Seu dashboard:*\n` +
      `doohplay.com.br/dashboard/local/${code}\n\n` +
      `🎁 *7 dias grátis* — sem nenhuma cobrança agora!\n\n` +
      `Qualquer dúvida, é só responder aqui. 🚀`
    )

    // Envia email
    await sendEmail(email, name, code, plan)

    return NextResponse.json({ ok: true, code })

  } catch (err: any) {
    console.error("[cadastro]", err)
    return NextResponse.json({ error: err.message ?? "Erro interno" }, { status: 500 })
  }
}
