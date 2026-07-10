// app/api/finance/webhook/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getPool } from "@/lib/db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const EVOLUTION_URL      = process.env.EVOLUTION_API_URL  || "https://evo.doohplay.com.br"
const EVOLUTION_KEY      = process.env.EVOLUTION_API_KEY ?? ""
const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE || "doohplay"

// Token de segurança cadastrado no painel Asaas em Configurações → Webhooks
const WEBHOOK_TOKEN = process.env.ASAAS_WEBHOOK_TOKEN || ""

async function sendWhatsApp(phone: string, message: string) {
  try {
    await fetch(`${EVOLUTION_URL}/message/sendText/${EVOLUTION_INSTANCE}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: EVOLUTION_KEY },
      body: JSON.stringify({ number: phone, text: message }),
    })
  } catch {}
}

export async function POST(req: NextRequest) {
  try {
    // ── Verificação de segurança ──────────────────────────────────────────────
    // O Asaas envia o token no header "asaas-access-token"
    if (WEBHOOK_TOKEN) {
      const incomingToken = req.headers.get("asaas-access-token")
      if (incomingToken !== WEBHOOK_TOKEN) {
        console.warn("[finance/webhook] token inválido:", incomingToken)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
    }

    const event = await req.json()
    const pool = getPool()
    const { event: eventType, payment, subscription } = event

    if (!payment && !subscription) return NextResponse.json({ ok: true })

    // Identifica o código do cliente via externalReference do payment ou subscription
    const code = payment?.externalReference || subscription?.externalReference
    if (!code) return NextResponse.json({ ok: true })

    // Busca cliente
    const { rows } = await pool.query(
      `SELECT name, phone FROM studio_clients WHERE code = $1 LIMIT 1`,
      [code]
    )
    const client = rows[0]

    // ── PAYMENT_RECEIVED / PAYMENT_CONFIRMED ──────────────────────────────────
    if (eventType === "PAYMENT_RECEIVED" || eventType === "PAYMENT_CONFIRMED") {
      // Ativa cliente
      await pool.query(
        `UPDATE studio_clients SET active = true WHERE code = $1`,
        [code]
      )

      // Atualiza status da assinatura
      await pool.query(
        `UPDATE financial_subscriptions SET status = 'ACTIVE' WHERE code = $1`,
        [code]
      )

      // Salva pagamento — usa ON CONFLICT para evitar duplicatas
      await pool.query(
        `INSERT INTO financial_payments
           (code, asaas_payment_id, value, status, due_date, paid_at)
         VALUES ($1, $2, $3, 'CONFIRMED', COALESCE($4::date, NOW()::date), NOW())
         ON CONFLICT (asaas_payment_id) DO UPDATE
           SET status = 'CONFIRMED', paid_at = NOW()`,
        [code, payment.id, payment.value, payment.dueDate ?? null]
      )

      if (client?.phone) {
        await sendWhatsApp(client.phone, [
          `✅ *Pagamento confirmado!*`,
          ``,
          `Olá, *${client.name}*!`,
          `Recebemos seu pagamento de *R$${payment.value}* com sucesso.`,
          ``,
          `Sua tela DOOHPLAY está ativa e funcionando. 🎉`,
          ``,
          `_DOOHPLAY — Trust Infrastructure for DOOH Advertising_`,
        ].join("\n"))
      }
    }

    // ── PAYMENT_OVERDUE ───────────────────────────────────────────────────────
    if (eventType === "PAYMENT_OVERDUE") {
      // Suspende cliente após atraso
      await pool.query(
        `UPDATE studio_clients SET active = false WHERE code = $1`,
        [code]
      )

      await pool.query(
        `UPDATE financial_subscriptions SET status = 'OVERDUE' WHERE code = $1`,
        [code]
      )

      // Registra pagamento como overdue
      await pool.query(
        `INSERT INTO financial_payments
           (code, asaas_payment_id, value, status, due_date)
         VALUES ($1, $2, $3, 'OVERDUE', COALESCE($4::date, NOW()::date))
         ON CONFLICT (asaas_payment_id) DO UPDATE
           SET status = 'OVERDUE'`,
        [code, payment.id, payment.value, payment.dueDate ?? null]
      )

      if (client?.phone) {
        await sendWhatsApp(client.phone, [
          `⚠️ *Pagamento em atraso — DOOHPLAY*`,
          ``,
          `Olá, *${client.name}*!`,
          `Identificamos que seu pagamento de *R$${payment.value}* está em atraso.`,
          ``,
          `⚡ Sua tela foi suspensa temporariamente.`,
          `Regularize para reativar:`,
          `${payment.invoiceUrl || "https://doohplay.com.br"}`,
          ``,
          `Dúvidas? Responda aqui mesmo! 😊`,
        ].join("\n"))
      }
    }

    // ── PAYMENT_DELETED ───────────────────────────────────────────────────────
    if (eventType === "PAYMENT_DELETED") {
      await pool.query(
        `UPDATE financial_payments SET status = 'DELETED'
         WHERE asaas_payment_id = $1`,
        [payment.id]
      )
    }

    // ── SUBSCRIPTION_DELETED / CANCELLED ─────────────────────────────────────
    if (
      eventType === "SUBSCRIPTION_DELETED" ||
      eventType === "SUBSCRIPTION_CANCELLED"
    ) {
      await pool.query(
        `UPDATE studio_clients SET active = false WHERE code = $1`,
        [code]
      )

      await pool.query(
        `UPDATE financial_subscriptions SET status = 'CANCELLED' WHERE code = $1`,
        [code]
      )

      if (client?.phone) {
        await sendWhatsApp(client.phone, [
          `😔 *Assinatura cancelada — DOOHPLAY*`,
          ``,
          `Olá, *${client.name}*!`,
          `Sua assinatura foi cancelada e a tela foi desativada.`,
          ``,
          `Quer reativar? Acesse: https://doohplay.com.br/onboarding`,
          ``,
          `_DOOHPLAY — Trust Infrastructure for DOOH Advertising_`,
        ].join("\n"))
      }
    }

    // ── SUBSCRIPTION_CREATED (trial ativado) ──────────────────────────────────
    if (eventType === "SUBSCRIPTION_CREATED") {
      await pool.query(
        `UPDATE financial_subscriptions SET status = 'ACTIVE' WHERE code = $1`,
        [code]
      )
    }

    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error("[finance/webhook] error:", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
