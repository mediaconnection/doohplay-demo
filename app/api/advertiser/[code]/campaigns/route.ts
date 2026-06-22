import { NextRequest } from "next/server"
import { getPool } from "@/lib/db"
import { getOrCreateAsaasCustomer, createCampaignPayment } from "@/lib/asaas"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  const pool = getPool()
  const parts = req.nextUrl.pathname.split("/")
  const idx = parts.indexOf("advertiser")
  const code = idx >= 0 ? parts[idx + 1].toUpperCase() : ""
  const body = await req.json()
  const name = body.name
  const startDate = body.startDate
  const endDate = body.endDate
  const budget = body.budget
  const screens = body.screens
  if (!name || !startDate || !endDate) {
    return Response.json({ error: "name, startDate e endDate sao obrigatorios" }, { status: 400 })
  }
  const value = budget ? Number(budget) : 0
  if (!value || value <= 0) {
    return Response.json({ error: "budget deve ser maior que zero para gerar cobranca" }, { status: 400 })
  }
  const adv = await pool.query(
    `SELECT id, name, email, phone FROM "Advertiser" WHERE code = $1 LIMIT 1`,
    [code]
  )
  if (!adv.rows[0]) return Response.json({ error: "Anunciante nao encontrado" }, { status: 404 })
  const advertiser = adv.rows[0]

  // Campanha nasce como 'pending_payment' — só passa a 'active' (e portanto
  // só entra na playlist real, que filtra Campaign.status = 'active') quando
  // o webhook do Asaas confirmar o pagamento.
  const res = await pool.query(
    `INSERT INTO "Campaign" ("advertiserCode", name, status, "startDate", "endDate", budget, impressions) VALUES ($1, $2, 'pending_payment', $3::date, $4::date, $5, 0) RETURNING *`,
    [code, name.trim(), startDate, endDate, value]
  )
  const campaign = res.rows[0]
  if (Array.isArray(screens) && screens.length > 0) {
    // Valida contra telas REAIS (studio_clients ativos) — antes isso usava
    // uma lista fixa de shoppings fictícios, sem nenhuma ligação com telas
    // de clientes de verdade.
    const realScreens = await pool.query(
      `SELECT code, name, city FROM studio_clients WHERE code = ANY($1) AND active = true`,
      [screens.map((s: string) => String(s).toUpperCase())]
    )
    for (const sc of realScreens.rows) {
      await pool.query(
        `INSERT INTO "CampaignScreen" ("campaignId", city, "screenId", "screenName") VALUES ($1, $2, $3, $4)`,
        [campaign.id, sc.city, sc.code, sc.name]
      )
    }
  }

  // Gera a cobrança no Asaas. Se isso falhar, a campanha já foi criada como
  // 'pending_payment' — não entra no ar, mas não trava o cadastro; o erro
  // é reportado pra UI tentar de novo.
  let payment: any = null
  let paymentError: string | null = null
  try {
    if (!advertiser.email) {
      throw new Error("Anunciante sem email cadastrado — necessario para gerar cobranca no Asaas")
    }
    const customer = await getOrCreateAsaasCustomer({
      name: advertiser.name,
      email: advertiser.email,
      phone: advertiser.phone || "",
    })
    payment = await createCampaignPayment({
      customerId: customer.id,
      value,
      campaignId: campaign.id,
      description: `DOOHPLAY — Campanha "${name.trim()}" (${code})`,
    })
    await pool.query(
      `INSERT INTO campaign_payments (campaign_id, asaas_payment_id, value, status, due_date, invoice_url)
       VALUES ($1, $2, $3, 'PENDING', $4::date, $5)`,
      [campaign.id, payment.id, value, payment.dueDate ?? null, payment.invoiceUrl ?? null]
    )
  } catch (err: any) {
    console.error("[advertiser/campaigns] erro ao gerar cobranca:", err.message)
    paymentError = err.message
  }

  return Response.json({
    ok: true,
    campaign,
    payment_link: payment?.invoiceUrl ?? null,
    payment_error: paymentError,
  }, { status: 201 })
}
