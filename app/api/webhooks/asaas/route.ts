// app/api/webhooks/asaas/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getPool } from "@/lib/db"
import { sendWhatsApp } from "@/lib/whatsapp"

export const dynamic = "force-dynamic"

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

    // ── Pagamento de TELA EXTRA (self-service, Fase 11) — cobrança única ──
    // externalReference vem como "extra_screen:<uuid>", setado em
    // client/screens/purchase. A tela só é criada de fato (client_screens)
    // na confirmação — nunca antes, mesmo padrão da campanha de anunciante.
    if (ref && ref.startsWith("extra_screen:")) {
      const requestId = ref.slice("extra_screen:".length)

      if (event === "PAYMENT_RECEIVED" || event === "PAYMENT_CONFIRMED") {
        const reqRow = await pool.query(
          `SELECT spr.client_code, spr.player_id, spr.label, spr.status, spr.asaas_subscription_id,
                  sc.name AS client_name, sc.phone AS client_phone
           FROM screen_purchase_requests spr
           JOIN studio_clients sc ON sc.code = spr.client_code
           WHERE spr.id = $1`,
          [requestId]
        )
        if (reqRow.rows[0] && reqRow.rows[0].status !== "paid") {
          const { client_code, player_id, label, client_name, client_phone } = reqRow.rows[0]

          // Achado numa revisão de código (11/07/2026): estas 3 escritas
          // não estavam numa transação — se a segunda ou terceira falhasse
          // depois da primeira ter sucesso, ficava um estado inconsistente
          // (ex: tela criada mas player nunca marcado como pareado). Usa
          // um client dedicado do pool pra BEGIN/COMMIT/ROLLBACK de verdade.
          const txClient = await pool.connect()
          try {
            await txClient.query("BEGIN")
            await txClient.query(
              `INSERT INTO client_screens (client_code, player_id, label, same_content, is_extra, extra_subscription_id)
               VALUES ($1, $2, $3, true, true, $4)`,
              [client_code, player_id, label, reqRow.rows[0].asaas_subscription_id ?? null]
            )
            await txClient.query(
              `UPDATE players SET paired = true, paired_at = NOW(), player_code = $1 WHERE id = $2`,
              [client_code, player_id]
            )
            await txClient.query(
              `UPDATE screen_purchase_requests SET status = 'paid', paid_at = NOW() WHERE id = $1`,
              [requestId]
            )
            await txClient.query("COMMIT")
          } catch (txErr) {
            await txClient.query("ROLLBACK")
            console.error("[webhook/asaas] rollback extra_screen:", txErr)
            throw txErr
          } finally {
            txClient.release()
          }

          // Achado na revisão do teste de Pix (11/07/2026): esse fluxo nunca
          // avisava o cliente que a tela nova ficou pronta — ele só descobria
          // voltando no dashboard sozinho. Mesmo padrão de mensagem usado na
          // confirmação de assinatura, abaixo. Fica fora da transação de
          // propósito — WhatsApp falhar não deve desfazer a tela já paga.
          if (client_phone) {
            await sendWhatsApp(client_phone,
              `✅ *Tela extra ativada — DOOHPLAY*\n\n` +
              `Olá ${client_name}! Seu pagamento de R$ ${Number(payment.value).toFixed(2).replace(".", ",")} foi confirmado e a tela "${label}" já está pronta pra exibir conteúdo. 📺\n\n` +
              `Acesse seu dashboard: doohplay.com.br/dashboard/local/${client_code}`
            )
          }
        }
      } else if (event === "PAYMENT_OVERDUE") {
        await pool.query(`UPDATE screen_purchase_requests SET status = 'cancelled' WHERE id = $1 AND status = 'pending'`, [requestId])
      } else if (event === "PAYMENT_DELETED" || event === "PAYMENT_REFUNDED") {
        await pool.query(`UPDATE screen_purchase_requests SET status = 'cancelled' WHERE id = $1`, [requestId])
      } else {
        console.log("[webhook/asaas] evento de tela extra nao tratado:", event)
      }

      return NextResponse.json({ ok: true, event, screen_purchase_request_id: requestId })
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
              `Dúvidas? WhatsApp: (11) 9 6205-0987`
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
