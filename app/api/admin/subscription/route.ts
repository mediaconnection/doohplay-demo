// app/api/admin/subscription/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getPool } from "@/lib/db"
import {
  getOrCreateAsaasCustomer,
  createSubscription,
  cancelSubscription,
  PLANS,
  PlanKey,
} from "@/lib/asaas"

export const dynamic = "force-dynamic"

// POST — cria assinatura para um cliente
export async function POST(req: NextRequest) {
  const pool = getPool()
  try {
    const { code, plan, next_due_date } = await req.json()

    if (!code || !plan) {
      return NextResponse.json({ error: "code e plan são obrigatórios" }, { status: 400 })
    }

    if (!PLANS[plan as PlanKey]) {
      return NextResponse.json({ error: `Plano inválido. Use: ${Object.keys(PLANS).join(", ")}` }, { status: 400 })
    }

    // Busca cliente no banco
    const { rows } = await pool.query(
      `SELECT code, name, email, phone, cpf_cnpj FROM studio_clients WHERE UPPER(code) = UPPER($1) AND active = true LIMIT 1`,
      [code]
    )

    if (!rows[0]) return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 })
    const client = rows[0]

    if (!client.email) return NextResponse.json({ error: "Cliente sem email cadastrado" }, { status: 400 })

    // Verifica se já tem assinatura ativa
    const { rows: existing } = await pool.query(
      `SELECT id, asaas_subscription_id, status FROM financial_subscriptions WHERE code = $1 LIMIT 1`,
      [code.toUpperCase()]
    )

    if (existing[0]?.status === "ACTIVE") {
      return NextResponse.json({ error: "Cliente já tem assinatura ativa" }, { status: 409 })
    }

    // Cria ou busca cliente no Asaas
    const customer = await getOrCreateAsaasCustomer({
      name: client.name,
      email: client.email,
      phone: client.phone,
      cpfCnpj: client.cpf_cnpj,
    })

    // Cria assinatura no Asaas
    const subscription = await createSubscription({
      customerId: customer.id,
      plan: plan as PlanKey,
      nextDueDate: next_due_date,
    })

    // Salva no banco
    if (existing[0]) {
      // Atualiza existente
      await pool.query(
        `UPDATE financial_subscriptions SET
          asaas_customer_id = $1,
          asaas_subscription_id = $2,
          plan = $3,
          value = $4,
          status = 'ACTIVE',
          created_at = NOW()
         WHERE code = $5`,
        [customer.id, subscription.id, plan, PLANS[plan as PlanKey].value, code.toUpperCase()]
      )
    } else {
      // Insere novo
      await pool.query(
        `INSERT INTO financial_subscriptions (code, asaas_customer_id, asaas_subscription_id, plan, value, status, created_at)
         VALUES ($1, $2, $3, $4, $5, 'ACTIVE', NOW())`,
        [code.toUpperCase(), customer.id, subscription.id, plan, PLANS[plan as PlanKey].value]
      )
    }

    return NextResponse.json({
      ok: true,
      customer_id: customer.id,
      subscription_id: subscription.id,
      plan,
      value: PLANS[plan as PlanKey].value,
      next_due_date: subscription.nextDueDate,
    })

  } catch (err: any) {
    console.error("[admin/subscription]", err)
    return NextResponse.json({ error: err.message ?? "Erro interno" }, { status: 500 })
  }
}

// DELETE — cancela assinatura
export async function DELETE(req: NextRequest) {
  const pool = getPool()
  try {
    const { code } = await req.json()
    if (!code) return NextResponse.json({ error: "code obrigatório" }, { status: 400 })

    const { rows } = await pool.query(
      `SELECT asaas_subscription_id FROM financial_subscriptions WHERE code = $1 LIMIT 1`,
      [code.toUpperCase()]
    )

    if (!rows[0]) return NextResponse.json({ error: "Assinatura não encontrada" }, { status: 404 })

    if (rows[0].asaas_subscription_id) {
      await cancelSubscription(rows[0].asaas_subscription_id)
    }

    await pool.query(
      `UPDATE financial_subscriptions SET status = 'CANCELLED' WHERE code = $1`,
      [code.toUpperCase()]
    )

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error("[admin/subscription/delete]", err)
    return NextResponse.json({ error: err.message ?? "Erro interno" }, { status: 500 })
  }
}

// GET — busca status da assinatura
export async function GET(req: NextRequest) {
  const pool = getPool()
  try {
    const code = req.nextUrl.searchParams.get("code")
    if (!code) return NextResponse.json({ error: "code obrigatório" }, { status: 400 })

    const { rows } = await pool.query(
      `SELECT * FROM financial_subscriptions WHERE code = $1 LIMIT 1`,
      [code.toUpperCase()]
    )

    if (!rows[0]) return NextResponse.json({ active: false, subscription: null })

    return NextResponse.json({ active: rows[0].status === "ACTIVE", subscription: rows[0] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
