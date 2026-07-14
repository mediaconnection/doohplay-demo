/**
 * app/api/admin/migrate-extra-screens/route.ts
 *
 * Fase 18 (14/07/2026): ferramenta pra migrar telas que já existem "acima
 * do limite do plano" (ex: BARBE332 com 2 telas num Starter que só cobre
 * 1) pra assinatura recorrente de tela extra — mesmo tratamento que toda
 * tela nova já recebe via /api/client/screens/purchase desde essa fase.
 *
 * NÃO roda sozinha em lugar nenhum — precisa ser chamada manualmente pelo
 * admin. Dois modos:
 *
 * GET  — simulação (dry-run). Mostra o que SERIA migrado, sem cobrar nada
 *        nem mudar nada no banco. Sempre rodar isso primeiro.
 * POST { confirm: true, client_codes?: string[] } — executa de verdade:
 *        cria a assinatura recorrente na Asaas e marca a(s) tela(s) como
 *        extra. Se client_codes for informado, migra só esses clientes;
 *        senão, migra todos os elegíveis.
 *
 * Critério de "qual tela vira extra": dentro de cada cliente, as telas
 * mais ANTIGAS (por created_at) contam como as incluídas no plano; as
 * mais NOVAS, além do limite do plano, é que viram extra. Já ignora
 * telas que já são is_extra = true (não migra de novo).
 */
import { NextRequest, NextResponse } from "next/server"
import { getPool } from "@/lib/db"
import { PLANS, PlanKey, getOrCreateAsaasCustomer, createExtraScreenSubscription, getFirstPaymentForSubscription } from "@/lib/asaas"

export const dynamic = "force-dynamic"

async function findEligibleClients(pool: any, clientCodes?: string[]) {
  const { rows: clients } = await pool.query(
    `SELECT sc.code, sc.name, sc.email, sc.phone, sc.cpf_cnpj, fs.plan
     FROM studio_clients sc
     JOIN financial_subscriptions fs ON fs.code = sc.code AND fs.status = 'ACTIVE'
     WHERE fs.plan IN ('starter', 'pro', 'business')
     ${clientCodes?.length ? "AND sc.code = ANY($1::text[])" : ""}`,
    clientCodes?.length ? [clientCodes.map(c => c.toUpperCase())] : []
  )

  const results = []
  for (const c of clients) {
    const plan = PLANS[c.plan as PlanKey]
    const { rows: screens } = await pool.query(
      `SELECT id, label, created_at, is_extra FROM client_screens
       WHERE client_code = $1 ORDER BY created_at ASC`,
      [c.code]
    )
    const notYetExtra = screens.filter((s: any) => !s.is_extra)
    const excessCount = notYetExtra.length - plan.maxScreens
    if (excessCount <= 0) continue // dentro do limite, nada a migrar

    const toMigrate = notYetExtra.slice(plan.maxScreens) // as mais novas, além do limite
    results.push({
      code: c.code,
      name: c.name,
      plan: c.plan,
      maxScreens: plan.maxScreens,
      totalScreens: screens.length,
      screensToMigrate: toMigrate.map((s: any) => ({ id: s.id, label: s.label, created_at: s.created_at })),
      blocked: !c.email || !c.cpf_cnpj
        ? `Falta ${!c.email ? "email" : ""}${!c.email && !c.cpf_cnpj ? " e " : ""}${!c.cpf_cnpj ? "CPF/CNPJ" : ""} cadastrado — não dá pra gerar cobrança na Asaas sem isso`
        : null,
      clientData: c, // usado internamente no POST, não precisa aparecer na resposta do GET
    })
  }
  return results
}

export async function GET(req: NextRequest) {
  const pool = getPool()
  try {
    const { searchParams } = req.nextUrl
    const codesParam = searchParams.get("codes")
    const clientCodes = codesParam ? codesParam.split(",").map(c => c.trim()) : undefined

    const eligible = await findEligibleClients(pool, clientCodes)
    return NextResponse.json({
      dryRun: true,
      message: "Isso é uma simulação — nada foi cobrado nem alterado. Confira e chame com POST + confirm:true pra executar de verdade.",
      pricePerScreen: Number(process.env.EXTRA_SCREEN_MONTHLY_PRICE_BRL || 150),
      clients: eligible.map(({ clientData, ...rest }) => rest),
    })
  } catch (err: any) {
    console.error("[admin/migrate-extra-screens GET]", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const pool = getPool()
  try {
    const body = await req.json()
    if (body.confirm !== true) {
      return NextResponse.json({ error: "Precisa mandar confirm: true pra executar de verdade" }, { status: 400 })
    }
    const clientCodes: string[] | undefined = Array.isArray(body.client_codes) ? body.client_codes : undefined

    const eligible = await findEligibleClients(pool, clientCodes)
    const executed = []
    const skipped = []

    for (const item of eligible) {
      if (item.blocked) {
        skipped.push({ code: item.code, reason: item.blocked })
        continue
      }
      const c = item.clientData
      try {
        const customer = await getOrCreateAsaasCustomer({ name: c.name, email: c.email, phone: c.phone || "", cpfCnpj: c.cpf_cnpj })
        for (const screen of item.screensToMigrate) {
          const subscription = await createExtraScreenSubscription({
            customerId: customer.id,
            screenLabel: screen.label,
            externalReference: `extra_screen_migration:${screen.id}`,
          })
          const firstPayment = await getFirstPaymentForSubscription(subscription.id).catch(() => null)
          await pool.query(
            `UPDATE client_screens SET is_extra = true, extra_subscription_id = $1 WHERE id = $2`,
            [subscription.id, screen.id]
          )
          executed.push({
            code: item.code, screen_id: screen.id, screen_label: screen.label,
            subscription_id: subscription.id, invoice_url: firstPayment?.invoiceUrl ?? null,
          })
        }
      } catch (err: any) {
        console.error(`[admin/migrate-extra-screens] falhou pra ${item.code}:`, err)
        skipped.push({ code: item.code, reason: err.message })
      }
    }

    return NextResponse.json({ ok: true, executed, skipped })
  } catch (err: any) {
    console.error("[admin/migrate-extra-screens POST]", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
