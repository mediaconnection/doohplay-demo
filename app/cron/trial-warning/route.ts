// app/api/cron/trial-warning/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getPool } from "@/lib/db"

export const dynamic = "force-dynamic"

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL!
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY!
const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE!
const RESEND_API_KEY = process.env.RESEND_API_KEY!
const CRON_SECRET = process.env.CRON_SECRET!

async function sendWhatsApp(phone: string, message: string) {
  try {
    const clean = phone.replace(/\D/g, "")
    const number = clean.startsWith("55") ? clean : `55${clean}`
    const res = await fetch(`${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "apikey": EVOLUTION_API_KEY },
      body: JSON.stringify({ number, text: message }),
    })
    return res.ok
  } catch (err) {
    console.error("[trial-warning] WhatsApp error:", err)
    return false
  }
}

async function sendEmail(to: string, name: string, code: string, daysLeft: number, value: number) {
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({
        from: "DOOHPLAY <noreply@doohplay.com.br>",
        to,
        subject: daysLeft === 2
          ? `⏰ Seu período grátis termina em 2 dias — DOOHPLAY`
          : `⚠️ Último dia do seu período grátis — DOOHPLAY`,
        html: `
          <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;background:#0F172A;color:#F1F5F9;border-radius:16px;overflow:hidden;">
            <div style="background:#1E293B;padding:28px;text-align:center;border-bottom:1px solid #334155;">
              <div style="font-size:24px;font-weight:900;">DOOH<span style="color:#3B82F6">PLAY</span></div>
            </div>
            <div style="padding:28px;">
              <p style="font-size:16px;margin-bottom:16px;">Olá <strong>${name}</strong>! 👋</p>
              <div style="background:${daysLeft === 1 ? '#450a0a' : '#431407'};border:1px solid ${daysLeft === 1 ? '#ef4444' : '#f59e0b'}33;border-radius:12px;padding:16px;margin-bottom:20px;text-align:center;">
                <div style="font-size:32px;margin-bottom:8px;">${daysLeft === 1 ? '⚠️' : '⏰'}</div>
                <div style="font-size:18px;font-weight:700;color:${daysLeft === 1 ? '#EF4444' : '#F59E0B'};">
                  ${daysLeft === 1 ? 'Último dia do seu período grátis!' : `Seu período grátis termina em ${daysLeft} dias`}
                </div>
              </div>
              <p style="font-size:14px;color:#94A3B8;margin-bottom:20px;line-height:1.6;">
                Sua TV continuará funcionando normalmente. A partir de amanhã, começará a cobrança de 
                <strong style="color:#F1F5F9;">R$ ${value.toFixed(2).replace('.', ',')}/mês</strong> 
                via PIX ou boleto.
              </p>
              <div style="background:#1E293B;border-radius:12px;padding:16px;margin-bottom:20px;">
                <div style="font-size:12px;color:#64748B;margin-bottom:8px;">O que continua igual:</div>
                <div style="font-size:13px;color:#CBD5E1;line-height:2;">
                  ✅ TV exibindo seu conteúdo<br>
                  ✅ Anunciantes gerando renda<br>
                  ✅ Dashboard e suporte ativos<br>
                  ✅ Cancelamento quando quiser
                </div>
              </div>
              <a href="https://doohplay.com.br/dashboard/local/${code}" 
                style="display:block;background:linear-gradient(135deg,#3B82F6,#6366F1);color:white;text-decoration:none;text-align:center;padding:14px;border-radius:12px;font-size:15px;font-weight:700;margin-bottom:12px;">
                Acessar meu dashboard
              </a>
              <p style="font-size:12px;color:#475569;text-align:center;">
                Quer cancelar? Responda este email ou chame no WhatsApp.
              </p>
            </div>
          </div>
        `
      })
    })
  } catch (err) {
    console.error("[trial-warning] Email error:", err)
  }
}

export async function POST(req: NextRequest) {
  // Verifica secret
  const secret = req.headers.get("x-cron-secret")
  if (secret !== CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const pool = getPool()
  const results: any[] = []

  try {
    // Busca assinaturas criadas há 5 dias (aviso 2 dias antes do trial acabar)
    // e há 6 dias (aviso 1 dia antes)
    const { rows } = await pool.query(`
      SELECT 
        fs.code,
        fs.value,
        fs.plan,
        fs.created_at,
        sc.name,
        sc.phone,
        sc.email,
        sc.notif_whatsapp,
        sc.notif_email,
        EXTRACT(DAY FROM (NOW() - fs.created_at)) as days_since_created
      FROM financial_subscriptions fs
      JOIN studio_clients sc ON sc.code = fs.code
      WHERE fs.status = 'ACTIVE'
        AND EXTRACT(DAY FROM (NOW() - fs.created_at)) IN (5, 6)
        AND sc.active = true
    `)

    console.log(`[trial-warning] Found ${rows.length} clients to notify`)

    for (const client of rows) {
      const daysLeft = client.days_since_created >= 6 ? 1 : 2
      const sent: string[] = []

      // WhatsApp
      if (client.notif_whatsapp && client.phone) {
        const msg = daysLeft === 1
          ? `⚠️ *DOOHPLAY — Último dia grátis!*\n\n` +
            `Olá ${client.name}! Hoje é o último dia do seu período de teste.\n\n` +
            `A partir de amanhã, sua assinatura de *R$ ${Number(client.value).toFixed(2).replace('.', ',')}\/mês* será cobrada automaticamente via PIX ou boleto.\n\n` +
            `Sua TV continua funcionando normalmente! 📺\n\n` +
            `Quer cancelar? É só responder aqui.\n` +
            `Quer continuar? Não precisa fazer nada 😊\n\n` +
            `Dashboard: doohplay.com.br/dashboard/local/${client.code}`
          : `⏰ *DOOHPLAY — Período grátis termina em 2 dias*\n\n` +
            `Olá ${client.name}! Seu período de teste gratuito termina em *2 dias*.\n\n` +
            `Após isso, a cobrança de *R$ ${Number(client.value).toFixed(2).replace('.', ',')}\/mês* começa automaticamente.\n\n` +
            `Sua TV está funcionando bem e já está gerando exibições! 📺\n\n` +
            `Quer cancelar antes? É só responder aqui.\n` +
            `Quer continuar? Não precisa fazer nada 😊`

        const ok = await sendWhatsApp(client.phone, msg)
        if (ok) sent.push("whatsapp")
      }

      // Email
      if (client.notif_email && client.email) {
        await sendEmail(client.email, client.name, client.code, daysLeft, Number(client.value))
        sent.push("email")
      }

      results.push({
        code: client.code,
        name: client.name,
        days_left: daysLeft,
        sent,
      })

      console.log(`[trial-warning] Notified ${client.code} (${daysLeft} days left) via ${sent.join(", ")}`)
    }

    return NextResponse.json({
      ok: true,
      notified: results.length,
      results,
      ts: new Date().toISOString(),
    })

  } catch (err: any) {
    console.error("[trial-warning]", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
