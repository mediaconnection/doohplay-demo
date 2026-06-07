// app/api/finance/asaas/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getPool } from "@/lib/db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const ASAAS_KEY = process.env.ASAAS_API_KEY!
const ASAAS_URL = "https://api.asaas.com/v3"

// ── Helpers ──────────────────────────────────────────────────────────────────
async function asaas(path: string, method = "GET", body?: object) {
  const res = await fetch(`${ASAAS_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "access_token": ASAAS_KEY,
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  return res.json()
}

// Cria ou busca cliente no Asaas
async function getOrCreateAsaasCustomer(client: any) {
  // Busca por CPF/CNPJ ou email
  const search = await asaas(`/customers?email=${encodeURIComponent(client.email)}`)
  if (search.data?.length > 0) return search.data[0]

  return asaas("/customers", "POST", {
    name: client.contact_name || client.name,
    email: client.email,
    mobilePhone: client.phone,
    externalReference: client.code,
  })
}

// Cria cobrança recorrente
async function createSubscription(customerId: string, client: any, plan: string) {
  const prices: Record<string, number> = {
    starter: 197,
    pro: 347,
    multi: 547,
  }
  const value = prices[plan] || 197

  return asaas("/subscriptions", "POST", {
    customer: customerId,
    billingType: "UNDEFINED", // cliente escolhe PIX, boleto ou cartão
    value,
    nextDueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 7 dias
    cycle: "MONTHLY",
    description: `DOOHPLAY — Plano ${plan.charAt(0).toUpperCase() + plan.slice(1)} · ${client.name}`,
    externalReference: client.code,
    fine: { value: 2 },
    interest: { value: 1 },
  })
}

// ── POST /api/finance/asaas — ativa cobrança para um cliente ─────────────────
export async function POST(req: NextRequest) {
  try {
    const { code, plan } = await req.json()

    if (!code || !plan) {
      return NextResponse.json({ error: "code e plan obrigatórios" }, { status: 400 })
    }

    const pool = getPool()

    // Busca cliente no banco
    const { rows } = await pool.query(
      `SELECT sc.*, l.email, l.contact_name, l.plan
         FROM studio_clients sc
         LEFT JOIN leads l ON l.code = sc.code
        WHERE sc.code = $1 LIMIT 1`,
      [code.toUpperCase()]
    )

    const client = rows[0]
    if (!client) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 })
    }

    // Cria cliente no Asaas
    const customer = await getOrCreateAsaasCustomer(client)
    if (customer.errors) {
      return NextResponse.json({ error: "Erro ao criar cliente no Asaas", details: customer.errors }, { status: 400 })
    }

    // Cria assinatura recorrente
    const subscription = await createSubscription(customer.id, client, plan || client.plan || "starter")
    if (subscription.errors) {
      return NextResponse.json({ error: "Erro ao criar assinatura", details: subscription.errors }, { status: 400 })
    }

    // Salva IDs no banco
    await pool.query(
      `UPDATE studio_clients
          SET active = true
        WHERE code = $1`,
      [code.toUpperCase()]
    )

    // Salva referência financeira
    try {
      await pool.query(
        `INSERT INTO financial_subscriptions
           (code, asaas_customer_id, asaas_subscription_id, plan, value, status, created_at)
         VALUES ($1, $2, $3, $4, $5, 'ACTIVE', NOW())
         ON CONFLICT (code) DO UPDATE
           SET asaas_subscription_id = $3, status = 'ACTIVE'`,
        [code, customer.id, subscription.id, plan, subscription.value]
      )
    } catch {
      // Tabela pode não existir ainda
    }

    return NextResponse.json({
      ok: true,
      customer_id: customer.id,
      subscription_id: subscription.id,
      value: subscription.value,
      next_due_date: subscription.nextDueDate,
      payment_link: subscription.invoiceUrl,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error("[finance/asaas] error:", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// ── GET /api/finance/asaas?code=ZIMERM — status financeiro do cliente ─────────
export async function GET(req: NextRequest) {
  try {
    const code = new URL(req.url).searchParams.get("code")
    if (!code) return NextResponse.json({ error: "code obrigatório" }, { status: 400 })

    const pool = getPool()
    const { rows } = await pool.query(
      `SELECT * FROM financial_subscriptions WHERE code = $1 LIMIT 1`,
      [code.toUpperCase()]
    )

    if (!rows[0]) {
      return NextResponse.json({ error: "Sem assinatura ativa" }, { status: 404 })
    }

    // Busca status atualizado no Asaas
    const subscription = await asaas(`/subscriptions/${rows[0].asaas_subscription_id}`)

    return NextResponse.json({
      code,
      status: subscription.status,
      value: subscription.value,
      next_due_date: subscription.nextDueDate,
      cycle: subscription.cycle,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
