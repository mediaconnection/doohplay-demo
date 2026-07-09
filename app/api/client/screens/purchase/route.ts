import { NextRequest, NextResponse } from "next/server"
import { getPool } from "@/lib/db"
import { getOrCreateAsaasCustomer, createOneTimePayment } from "@/lib/asaas"

export const dynamic = "force-dynamic"

// Preço da tela extra — configurável via env, com padrão sensato.
// Cobrança única (não recorrente) no momento em que a tela é adicionada.
const EXTRA_SCREEN_PRICE = Number(process.env.EXTRA_SCREEN_PRICE_BRL || 97)

function activationCodeFromId(id: string) {
  // Mesmo algoritmo de app/api/player/activate/route.ts — precisa bater
  // exatamente pra reconhecer o código que o aparelho está mostrando.
  return `DHP-${id.replace(/-/g, "").slice(0, 6).toUpperCase()}`
}

// POST — cliente informa o código de ativação (mostrado no aparelho novo)
// + nome da tela. Gera cobrança única; a tela só é criada de fato quando o
// pagamento é confirmado (webhook), nunca antes.
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

    // Acha o dispositivo cujo código de ativação bate — só entre os ainda
    // não pareados (uma tela já vinculada não pode ser "readicionada").
    const unpaired = await pool.query(
      `SELECT id FROM players WHERE (paired = false OR paired IS NULL) AND device_fingerprint IS NOT NULL`
    )
    const match = unpaired.rows.find((p: any) => activationCodeFromId(p.id) === activationCode)
    if (!match) {
      return NextResponse.json({ error: "Código de ativação não encontrado. Confira se o aparelho está com o app aberto mostrando esse código." }, { status: 404 })
    }

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

    const customer = c.asaas_customer_id
      ? { id: c.asaas_customer_id }
      : await getOrCreateAsaasCustomer({ name: c.name, email: c.email, phone: c.phone || "", cpfCnpj: c.cpf_cnpj })

    // Cria o pedido primeiro (pending) pra já ter um id de referência
    const pending = await pool.query(
      `INSERT INTO screen_purchase_requests (client_code, player_id, label, value, status)
       VALUES ($1, $2, $3, $4, 'pending') RETURNING id`,
      [clientCode, match.id, screenLabel, EXTRA_SCREEN_PRICE]
    )
    const requestId = pending.rows[0].id

    const payment = await createOneTimePayment({
      customerId: customer.id,
      value: EXTRA_SCREEN_PRICE,
      externalReference: `extra_screen:${requestId}`,
      description: `DOOHPLAY — Tela extra "${screenLabel}" (${clientCode})`,
      cpfCnpj: c.cpf_cnpj,
    })

    await pool.query(
      `UPDATE screen_purchase_requests SET asaas_payment_id = $1, invoice_url = $2 WHERE id = $3`,
      [payment.id, payment.invoiceUrl ?? null, requestId]
    )

    return NextResponse.json({
      ok: true,
      request_id: requestId,
      invoice_url: payment.invoiceUrl,
      value: EXTRA_SCREEN_PRICE,
    })
  } catch (err: any) {
    console.error("[client/screens/purchase POST]", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
