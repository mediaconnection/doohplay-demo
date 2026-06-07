// app/api/finance/webhook/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getPool } from "@/lib/db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const EVOLUTION_URL      = process.env.EVOLUTION_API_URL  || "http://2.25.180.53:32768"
const EVOLUTION_KEY      = process.env.EVOLUTION_API_KEY  || "q8nC1RGZczvlT7T5figPsLUJTsnsXjtI"
const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE || "doohplay"

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
    const event = await req.json()
    const pool = getPool()

    const { event: eventType, payment } = event
    if (!payment) return NextResponse.json({ ok: true })

    const code = payment.externalReference
    if (!code) return NextResponse.json({ ok: true })

    // Busca cliente
    const { rows } = await pool.query(
      `SELECT sc.name, sc.phone FROM studio_clients sc WHERE sc.code = $1 LIMIT 1`,
      [code]
    )
    const client = rows[0]

    // ── Pagamento confirmado ──────────────────────────────────────────────────
    if (eventType === "PAYMENT_RECEIVED" || eventType === "PAYMENT_CONFIRMED") {
      await pool.query(
        `UPDATE studio_clients SET active = true WHERE code = $1`,
        [code]
      )

      try {
        await pool.query(
          `INSERT INTO financial_payments
             (code, asaas_payment_id, value, status, paid_at)
           VALUES ($1, $2, $3, 'CONFIRMED', NOW())`,
          [code, payment.id, payment.value]
        )
      } catch {}

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

    // ── Pagamento atrasado ────────────────────────────────────────────────────
    if (eventType === "PAYMENT_OVERDUE") {
      if (client?.phone) {
        await sendWhatsApp(client.phone, [
          `⚠️ *Pagamento em atraso — DOOHPLAY*`,
          ``,
          `Olá, *${client.name}*!`,
          `Identificamos que seu pagamento de *R$${payment.value}* está em atraso.`,
          ``,
          `Regularize para manter sua tela ativa:`,
          `${payment.invoiceUrl}`,
          ``,
          `Dúvidas? Responda aqui mesmo! 😊`,
        ].join("\n"))
      }
    }

    // ── Assinatura cancelada ──────────────────────────────────────────────────
    if (eventType === "SUBSCRIPTION_DELETED" || eventType === "PAYMENT_DELETED") {
      await pool.query(
        `UPDATE studio_clients SET active = false WHERE code = $1`,
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
