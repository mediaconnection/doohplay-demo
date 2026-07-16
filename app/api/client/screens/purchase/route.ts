import { NextRequest, NextResponse } from "next/server"
import { getPool } from "@/lib/db"
import { getOrCreateAsaasCustomer, createExtraScreenSubscription, getFirstPaymentForSubscription, PLANS, PlanKey } from "@/lib/asaas"
import { verifyClientSessionToken, CLIENT_SESSION_COOKIE } from "@/lib/client-session"

export const dynamic = "force-dynamic"

// Preço da tela extra — Fase 18 (14/07/2026): virou assinatura MENSAL
// RECORRENTE (era cobrança única de R$97). Achado numa análise comercial
// dos planos: cobrança única deixava Starter (R$97/mês) + telas extras
// muito mais barato no longo prazo que assinar o plano de cima pro
// mesmo número de telas — sem nenhum limite de plano sendo checado em
// lugar nenhum do fluxo. Ver EXTRA_SCREEN_MONTHLY_PRICE em lib/asaas.ts.
// Fase 27 (15/07/2026): Pro e Business passaram a incluir 3 e 5 telas
// respectivamente (antes, todo plano cobria só 1) — valor de R$150/tela
// extra recalibrado junto pra continuar sempre mais caro que migrar de
// tier (ver nota em lib/asaas.ts sobre a conferência de preço).
const EXTRA_SCREEN_PRICE = Number(process.env.EXTRA_SCREEN_MONTHLY_PRICE_BRL || 150)

function activationCodeFromId(id: string) {
  // Mesmo algoritmo de app/api/player/activate/route.ts — precisa bater
  // exatamente pra reconhecer o código que o aparelho está mostrando.
  return `DHP-${id.replace(/-/g, "").slice(0, 6).toUpperCase()}`
}

// POST — cliente informa o código de ativação (mostrado no aparelho novo)
// + nome da tela.
//
// Fase 25 (14/07/2026) — unificado com a ativação da PRIMEIRA tela.
// Antes, só existia esse fluxo self-service pra tela EXTRA (paga,
// R$150/mês); a primeira tela (já inclusa na mensalidade do plano, cobrada
// no cadastro) só podia ser ativada manualmente por um admin clicando
// "Vincular" — sem nenhum caminho pro próprio cliente fazer sozinho.
// Acertado com o fundador: mesma tela de ativação por código, mas
// qualquer tela ainda DENTRO do limite do plano do cliente é ativada na
// hora, de graça — sem gerar cobrança nenhuma, já que o plano já cobre.
// Só a partir da tela que EXCEDE o limite do plano é que continua indo
// pro fluxo de assinatura extra de R$150/mês, exatamente como antes.
// Fase 27 (15/07/2026): corrigido pra comparar contra PLANS[plan].maxScreens
// de verdade (Pro/Business agora cobrem 3/5 telas, não só 1 — a versão
// original só checava "é a primeira tela de todas", o que cobraria
// errado a partir da 2ª tela de um cliente Pro/Business).
export async function POST(req: NextRequest) {
  const pool = getPool()
  try {
    const { code, activation_code, label } = await req.json()
    const clientCode = String(code || "").toUpperCase()
    const activationCode = String(activation_code || "").trim().toUpperCase()
    const screenLabel = String(label || "").trim()

    if (!clientCode || !activationCode || !screenLabel) {
      return NextResponse.json({ error: "code, activation_code e label são obrigatórios" }, { status: 400 })
    }

    // Fase 14 — sem isso, qualquer um que soubesse o código do cliente
    // conseguia gerar cobrança real em nome dele (achado numa sessão de
    // teste de Pix anterior, documentado como lacuna conhecida até aqui).
    const sessionCode = verifyClientSessionToken(req.cookies.get(CLIENT_SESSION_COOKIE)?.value)
    if (sessionCode !== clientCode) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    // Acha o dispositivo cujo código de ativação bate — só entre os ainda
    // não pareados (uma tela já vinculada não pode ser "readicionada").
    const unpaired = await pool.query(
      `SELECT id FROM players WHERE (paired = false OR paired IS NULL) AND device_fingerprint IS NOT NULL`
    )
    const match = unpaired.rows.find((p: any) => activationCodeFromId(p.id) === activationCode)
    if (!match) {
      return NextResponse.json({ error: "Código de ativação não encontrado. Confira se o aparelho está com o app aberto mostrando esse código." }, { status: 404 })
    }

    // Fase 25 (14/07/2026) — ramo de tela GRÁTIS (já incluída no plano).
    // Fase 27 (15/07/2026) — achado ao mudar Pro/Business pra cobrir mais
    // de 1 tela: a checagem original só via se era "a primeira tela de
    // todas" (count === 0), sem saber quantas telas o PLANO do cliente
    // cobre. Isso cobrava R$150 errado a partir da 2ª tela de um cliente
    // Pro/Business, mesmo ele tendo direito a mais telas grátis. Agora
    // compara a contagem atual contra PLANS[plan].maxScreens de verdade.
    const planRes = await pool.query(
      `SELECT plan FROM financial_subscriptions WHERE code = $1 LIMIT 1`,
      [clientCode]
    )
    const planKey = (planRes.rows[0]?.plan ?? "starter") as PlanKey
    const maxScreens = PLANS[planKey]?.maxScreens ?? 1

    const existingScreens = await pool.query(
      `SELECT COUNT(*)::int AS count FROM client_screens WHERE client_code = $1`,
      [clientCode]
    )
    if (existingScreens.rows[0].count < maxScreens) {
      await pool.query(
        `UPDATE players SET paired = true, paired_at = NOW(), player_code = $1 WHERE id = $2`,
        [clientCode, match.id]
      )
      // Só define studio_clients.player_id se ainda estiver vazio — não
      // sobrescreve por engano se por algum motivo já apontar pra outro
      // aparelho (não deveria acontecer numa primeira tela, mas seguro).
      await pool.query(
        `UPDATE studio_clients SET player_id = COALESCE(player_id, $1) WHERE code = $2`,
        [match.id, clientCode]
      )
      const created = await pool.query(
        `INSERT INTO client_screens (client_code, player_id, label, same_content)
         VALUES ($1, $2, $3, true)
         RETURNING id`,
        [clientCode, match.id, screenLabel]
      )
      return NextResponse.json({
        ok: true,
        free: true,
        screen_id: created.rows[0].id,
        message: `Tela ativada — já incluída no seu plano (${existingScreens.rows[0].count + 1} de ${maxScreens}), sem cobrança adicional.`,
      })
    }

    // A partir daqui, é tela EXTRA (2ª em diante) — fluxo de cobrança
    // recorrente de sempre, sem nenhuma mudança.

    // Cliente precisa ter email + CPF/CNPJ cadastrados (mesma exigência do
    // fluxo de campanha de anunciante) pra gerar cobrança no Asaas.
    const client = await pool.query(
      `SELECT sc.name, sc.email, sc.phone, sc.cpf_cnpj, fs.asaas_customer_id
       FROM studio_clients sc
       LEFT JOIN financial_subscriptions fs ON fs.code = sc.code
       WHERE sc.code = $1 LIMIT 1`,
      [clientCode]
    )
    if (!client.rows[0]) return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 })
    const c = client.rows[0]
    if (!c.email) return NextResponse.json({ error: "Cadastre um email antes de adicionar uma tela nova" }, { status: 400 })
    if (!c.cpf_cnpj) return NextResponse.json({ error: "Cadastre CPF/CNPJ antes de adicionar uma tela nova" }, { status: 400 })

    // Sempre busca/cria via email (idempotente) em vez de confiar cegamente
    // no asaas_customer_id salvo — esse id pode apontar pra um cliente que
    // foi removido do lado do Asaas (ex: limpeza de teste), e nesse caso a
    // cobrança falha com "cliente removido" sem essa checagem.
    const customer = await getOrCreateAsaasCustomer({ name: c.name, email: c.email, phone: c.phone || "", cpfCnpj: c.cpf_cnpj })

    // Cria o pedido primeiro (pending) pra já ter um id de referência
    const pending = await pool.query(
      `INSERT INTO screen_purchase_requests (client_code, player_id, label, value, status)
       VALUES ($1, $2, $3, $4, 'pending') RETURNING id`,
      [clientCode, match.id, screenLabel, EXTRA_SCREEN_PRICE]
    )
    const requestId = pending.rows[0].id

    const subscription = await createExtraScreenSubscription({
      customerId: customer.id,
      screenLabel: screenLabel,
      externalReference: `extra_screen:${requestId}`,
    })

    // A assinatura em si não traz invoiceUrl (é campo do pagamento, não
    // da assinatura) — busca o primeiro pagamento que ela já gerou.
    const firstPayment = await getFirstPaymentForSubscription(subscription.id).catch(() => null)

    await pool.query(
      `UPDATE screen_purchase_requests SET asaas_subscription_id = $1, invoice_url = $2 WHERE id = $3`,
      [subscription.id, firstPayment?.invoiceUrl ?? null, requestId]
    )

    return NextResponse.json({
      ok: true,
      request_id: requestId,
      invoice_url: firstPayment?.invoiceUrl ?? null,
      value: EXTRA_SCREEN_PRICE,
      recurring: true,
    })
  } catch (err: any) {
    console.error("[client/screens/purchase POST]", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
