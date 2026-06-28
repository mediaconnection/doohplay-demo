// app/api/webhooks/asaas/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getPool } from "@/lib/db"

export const dynamic = "force-dynamic"

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL!
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY!
const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE!

async function sendWhatsApp(phone: string, message: string) {
  try {
    await fetch(`${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "apikey": EVOLUTION_API_KEY },
      body: JSON.stringify({ number: `55${phone.replace(/\D/g, "")}`, text: message }),
    })
  } catch (err) {
    console.error("[webhook/asaas] WhatsApp error:", err)
  }
}

// GET — validação do webhook pelo Asaas
export async function GET() {
  return NextResponse.json({ ok: true, service: "doohplay-webhook-asaas" })
}

// POST — recebe eventos do Asaas
export async function POST(req: NextRequest) {
  // Validação de origem: Asaas envia o token configurado no painel
  // (Configurações > Integrações > Webhooks > Token de autenticação) no
  // header "asaas-access-token". Sem checar isso, qualquer pessoa que
  // descubra esta URL + um UUID de campanha poderia fingir um pagamento
  // confirmado e ativar uma campanha sem pagar nada de verdade.
  const incomingToken = req.headers.get("asaas-access-token")
  if (!process.env.ASAAS_WEBHOOK_TOKEN || incomingToken !== process.env.ASAAS_WEBHOOK_TOKEN) {
    console.warn("[webhook/asaas] token ausente ou inválido — requisição rejeitada")
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const pool = getPool()
  try {
    const body = await req.json()
    const { event, payment } = body

    console.log("[webhook/asaas] event:", event, "subscription:", payment?.subscription, "externalReference:", payment?.externalReference)

    // ── Pagamento de CAMPANHA de anunciante (cobrança única, sem subscription) ──
    // externalReference vem como "campaign:<uuid>", setado em createCampaignPayment().
    const ref: string | undefined = payment?.externalReference
    if (ref && ref.startsWith("campaign:")) {
      const campaignId = ref.slice("campaign:".length)

      if (event === "PAYMENT_RECEIVED" || event === "PAYMENT_CONFIRMED") {
        await pool.query(`UPDATE "Campaign" SET status = 'active' WHERE id = $1`, [campaignId])
        await pool.query(
          `UPDATE campaign_payments SET status = 'CONFIRMED', paid_at = NOW() WHERE asaas_payment_id = $1`,
          [payment.id]
        )
      } else if (event === "PAYMENT_OVERDUE") {
        await pool.query(`UPDATE "Campaign" SET status = 'overdue' WHERE id = $1`, [campaignId])
        await pool.query(
          `UPDATE campaign_payments SET status = 'OVERDUE' WHERE asaas_payment_id = $1`,
          [payment.id]
        )
      } else if (event === "PAYMENT_DELETED" || event === "PAYMENT_REFUNDED") {
        await pool.query(`UPDATE "Campaign" SET status = 'cancelled' WHERE id = $1`, [campaignId])
        await pool.query(
          `UPDATE campaign_payments SET status = 'CANCELLED' WHERE asaas_payment_id = $1`,
          [payment.id]
        )
      } else {
        console.log("[webhook/asaas] evento de campanha nao tratado:", event)
      }

      return NextResponse.json({ ok: true, event, campaign_id: campaignId })
    }

    if (!payment?.subscription) {
      return NextResponse.json({ ok: true, skipped: "sem subscription" })
    }

    // Busca cliente pela assinatura
    const { rows } = await pool.query(
      `SELECT fs.code, sc.name, sc.phone, fs.plan, fs.value, fs.status
       FROM financial_subscriptions fs
       JOIN studio_clients sc ON sc.code = fs.code
       WHERE fs.asaas_subscription_id = $1 LIMIT 1`,
      [payment.subscription]
    )

    if (!rows[0]) {
      console.log("[webhook/asaas] subscription not found:", payment.subscription)
      return NextResponse.json({ ok: true, skipped: "assinatura não encontrada" })
    }

    const client = rows[0]

    switch (event) {

      // ── Pagamento confirmado ──────────────────────────────────────────────
      case "PAYMENT_RECEIVED":
      case "PAYMENT_CONFIRMED": {
        await pool.query(
          `UPDATE financial_subscriptions SET status = 'ACTIVE' WHERE code = $1`,
          [client.code]
        )

        // Reativa a TV se estava bloqueada
        await pool.query(
          `UPDATE studio_clients SET active = true WHERE code = $1`,
          [client.code]
        )

        if (client.phone) {
          await sendWhatsApp(client.phone,
            `✅ *Pagamento confirmado — DOOHPLAY*\n\n` +
            `Olá ${client.name}! Seu pagamento de R$ ${Number(payment.value).toFixed(2).replace(".", ",")} foi confirmado.\n\n` +
            `Sua TV continua ativa e exibindo conteúdo normalmente. 📺\n\n` +
            `Acesse seu dashboard: doohplay.com.br/dashboard/local/${client.code}`
          )
        }
        break
      }

      // ── Pagamento vencido ─────────────────────────────────────────────────
      case "PAYMENT_OVERDUE": {
        const daysOverdue = payment.daysOverdue ?? 1

        // Aviso após 5 dias
        if (daysOverdue >= 5 && daysOverdue < 10) {
          await pool.query(
            `UPDATE financial_subscriptions SET status = 'OVERDUE' WHERE code = $1`,
            [client.code]
          )

          if (client.phone) {
            await sendWhatsApp(client.phone,
              `⚠️ *Pagamento em atraso — DOOHPLAY*\n\n` +
              `Olá ${client.name}! Sua fatura de R$ ${Number(payment.value).toFixed(2).replace(".", ",")} está em atraso há ${daysOverdue} dias.\n\n` +
              `Regularize para manter sua TV funcionando.\n\n` +
              `Pague pelo link: ${payment.bankSlipUrl ?? payment.invoiceUrl ?? "—"}`
            )
          }
        }

        // Bloqueia após 10 dias
        if (daysOverdue >= 10) {
          await pool.query(
            `UPDATE financial_subscriptions SET status = 'OVERDUE' WHERE code = $1`,
            [client.code]
          )
          await pool.query(
            `UPDATE studio_clients SET active = false WHERE code = $1`,
            [client.code]
          )

          if (client.phone) {
            await sendWhatsApp(client.phone,
              `🔴 *TV suspensa — DOOHPLAY*\n\n` +
              `Olá ${client.name}! Sua TV foi suspensa por falta de pagamento (${daysOverdue} dias em atraso).\n\n` +
              `Regularize agora para reativar:\n${payment.bankSlipUrl ?? payment.invoiceUrl ?? "—"}\n\n` +
              `Dúvidas? WhatsApp: (11) 9 9999-9999`
            )
          }
        }
        break
      }

      // ── Assinatura cancelada ──────────────────────────────────────────────
      case "SUBSCRIPTION_DELETED": {
        await pool.query(
          `UPDATE financial_subscriptions SET status = 'CANCELLED' WHERE code = $1`,
          [client.code]
        )
        break
      }

      default:
        console.log("[webhook/asaas] unhandled event:", event)
    }

    return NextResponse.json({ ok: true, event, code: client.code })

  } catch (err: any) {
    console.error("[webhook/asaas]", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
