// app/api/finance/asaas/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getPool } from "@/lib/db"
import { requireSuperAdmin } from "@/lib/require-super-admin"
import { verifyClientSessionToken, CLIENT_SESSION_COOKIE } from "@/lib/client-session"
import { PLANS, PlanKey, createSubscription, getOrCreateAsaasCustomer } from "@/lib/asaas"

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

function cleanDocument(doc: string) {
  return doc.replace(/\D/g, "")
}

// ── POST /api/finance/asaas — ativa cobrança para um cliente ─────────────────
export async function POST(req: NextRequest) {
  if (!(await requireSuperAdmin(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  try {
    const { code, plan, cpf_cnpj } = await req.json()

    if (!code || !plan) {
      return NextResponse.json({ error: "code e plan obrigatórios" }, { status: 400 })
    }

    const pool = getPool()

    // Busca cliente + lead (para email)
    const { rows } = await pool.query(
      `SELECT sc.code, sc.name, sc.phone, sc.active,
              COALESCE(l.email, '') AS email,
              COALESCE(l.contact_name, sc.name) AS contact_name,
              COALESCE(l.plan, $2) AS plan,
              COALESCE(sc.cpf_cnpj, l.cpf_cnpj, $3) AS cpf_cnpj
         FROM studio_clients sc
         LEFT JOIN leads l ON l.code = sc.code
        WHERE sc.code = $1 LIMIT 1`,
      [code.toUpperCase(), plan, cpf_cnpj || ""]
    )

    const client = rows[0]
    if (!client) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 })
    }

    // Salva CPF/CNPJ se fornecido
    if (cpf_cnpj) {
      try {
        await pool.query(
          `UPDATE studio_clients SET cpf_cnpj = $1 WHERE code = $2`,
          [cleanDocument(cpf_cnpj), code.toUpperCase()]
        )
        client.cpf_cnpj = cleanDocument(cpf_cnpj)
      } catch {
        // Coluna pode não existir ainda — continua
      }
    }

    // Cria/busca cliente no Asaas — busca primeiro se já existe um
    // asaas_customer_id salvo (evita duplicar cliente no Asaas)
    let existingCustomerId: string | undefined
    try {
      const r = await pool.query(
        `SELECT asaas_customer_id FROM financial_subscriptions WHERE code = $1 LIMIT 1`,
        [code.toUpperCase()]
      )
      existingCustomerId = r.rows[0]?.asaas_customer_id || undefined
    } catch { /* tabela pode não existir ainda */ }

    const customer = await getOrCreateAsaasCustomer({
      name: client.contact_name || client.name,
      email: client.email,
      phone: client.phone,
      cpfCnpj: client.cpf_cnpj,
      existingCustomerId,
      externalReference: code.toUpperCase(),
    })
    if (customer.errors) {
      return NextResponse.json({ error: "Erro ao criar cliente no Asaas", details: customer.errors }, { status: 400 })
    }

    // Cria assinatura recorrente
    const chosenPlan = (plan || client.plan || "starter") as PlanKey
    if (!PLANS[chosenPlan]) {
      return NextResponse.json({ error: `Plano inválido. Use: ${Object.keys(PLANS).join(", ")}` }, { status: 400 })
    }
    const subscription = await createSubscription({
      customerId: customer.id,
      plan: chosenPlan,
      nextDueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      externalReference: client.code,
    })
    if (subscription.errors) {
      return NextResponse.json({ error: "Erro ao criar assinatura", details: subscription.errors }, { status: 400 })
    }

    // Ativa cliente e salva referência
    await pool.query(`UPDATE studio_clients SET active = true WHERE code = $1`, [code.toUpperCase()])

    try {
      await pool.query(
        `INSERT INTO financial_subscriptions
           (code, asaas_customer_id, asaas_subscription_id, plan, value, status, created_at)
         VALUES ($1, $2, $3, $4, $5, 'ACTIVE', NOW())
         ON CONFLICT (code) DO UPDATE
           SET asaas_customer_id = $2, asaas_subscription_id = $3,
               plan = $4, value = $5, status = 'ACTIVE'`,
        [code, customer.id, subscription.id, chosenPlan, subscription.value]
      )
    } catch { /* tabela pode não existir */ }

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

// ── GET /api/finance/asaas?code=ZIMERM — status financeiro ───────────────────
export async function GET(req: NextRequest) {
  if (!(await requireSuperAdmin(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  try {
    const code = new URL(req.url).searchParams.get("code")
    if (!code) return NextResponse.json({ error: "code obrigatório" }, { status: 400 })

    const pool = getPool()
    const { rows } = await pool.query(
      `SELECT * FROM financial_subscriptions WHERE code = $1 LIMIT 1`,
      [code.toUpperCase()]
    )

    if (!rows[0]) return NextResponse.json({ error: "Sem assinatura ativa" }, { status: 404 })

    const subscription = await asaas(`/subscriptions/${rows[0].asaas_subscription_id}`)

    return NextResponse.json({
      code,
      status: subscription.status,
      value: subscription.value,
      next_due_date: subscription.nextDueDate,
      cycle: subscription.cycle,
      customer_id: rows[0].asaas_customer_id,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// ── PATCH /api/finance/asaas — atualiza CPF/CNPJ do cliente ──────────────────
// Usado pelo próprio dashboard do cliente (cpf-form.tsx) — NÃO protegido
// por requireSuperAdmin de propósito, já que é uma ação do próprio cliente,
// não do admin. Lacuna conhecida: ainda não existe autenticação de cliente
// de verdade aqui (qualquer um que soubesse o code poderia editar o CPF de
// outro cliente) — depende de um sistema de login de cliente, que é um
// problema maior e separado de "usuários e permissões do admin" (Fase 13).
export async function PATCH(req: NextRequest) {
  try {
    const { code, cpf_cnpj, email, phone } = await req.json()
    if (!code || !cpf_cnpj) {
      return NextResponse.json({ error: "code e cpf_cnpj obrigatórios" }, { status: 400 })
    }

    // Fase 14 — esta era a lacuna documentada desde o início ("qualquer um
    // que soubesse o code poderia editar"). Agora exige sessão do próprio
    // cliente. Mantém possível uso administrativo futuro se necessário,
    // mas por ora é estritamente "o cliente edita os próprios dados".
    const sessionCode = verifyClientSessionToken(req.cookies.get(CLIENT_SESSION_COOKIE)?.value)
    if (sessionCode !== String(code).toUpperCase()) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const pool = getPool()
    const doc = cleanDocument(cpf_cnpj)

    // Valida formato
    if (doc.length !== 11 && doc.length !== 14) {
      return NextResponse.json({ error: "CPF deve ter 11 dígitos, CNPJ 14 dígitos" }, { status: 400 })
    }

    // Atualiza no banco (tenta — coluna pode não existir)
    try {
      await pool.query(
        `ALTER TABLE studio_clients ADD COLUMN IF NOT EXISTS cpf_cnpj VARCHAR(20)`,
        []
      )
      await pool.query(
        `UPDATE studio_clients SET cpf_cnpj = $1 WHERE code = $2`,
        [doc, code.toUpperCase()]
      )
    } catch (e) {
      console.error("[finance/asaas PATCH] DB error:", e)
    }

    // Atualiza ou cria cliente no Asaas
    const { rows } = await pool.query(
      `SELECT sc.name, sc.phone, COALESCE(l.email, $3) AS email, COALESCE(l.contact_name, sc.name) AS contact_name,
              fs.asaas_customer_id
         FROM studio_clients sc
         LEFT JOIN leads l ON l.code = sc.code
         LEFT JOIN financial_subscriptions fs ON fs.code = sc.code
        WHERE sc.code = $1 LIMIT 1`,
      [code.toUpperCase(), code.toUpperCase(), email || ""]
    )

    if (!rows[0]) return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 })

    const client = rows[0]

    // Se já tem customer no Asaas, atualiza documento
    if (client.asaas_customer_id) {
      const updated = await asaas(`/customers/${client.asaas_customer_id}`, "PUT", {
        cpfCnpj: doc,
        personType: doc.length === 14 ? "JURIDICA" : "FISICA",
        ...(phone && { mobilePhone: cleanDocument(phone) }),
        ...(email && { email }),
      })
      if (updated.errors) {
        return NextResponse.json({ error: "Erro ao atualizar no Asaas", details: updated.errors }, { status: 400 })
      }
      return NextResponse.json({ ok: true, asaas_id: client.asaas_customer_id, cpf_cnpj: doc })
    }

    // Cria cliente novo no Asaas com documento
    const newCustomer = await getOrCreateAsaasCustomer({
      name: client.contact_name || client.name,
      email: email || client.email,
      phone: phone || client.phone,
      cpfCnpj: doc,
      externalReference: code.toUpperCase(),
    })

    if (newCustomer.errors) {
      return NextResponse.json({ error: "Erro ao criar no Asaas", details: newCustomer.errors }, { status: 400 })
    }

    // Salva customer_id na tabela de subscriptions (para referência futura)
    try {
      await pool.query(
        `INSERT INTO financial_subscriptions (code, asaas_customer_id, plan, value, status, created_at)
         VALUES ($1, $2, 'pending', 0, 'PENDING', NOW())
         ON CONFLICT (code) DO UPDATE SET asaas_customer_id = $2`,
        [code.toUpperCase(), newCustomer.id]
      )
    } catch {}

    return NextResponse.json({ ok: true, asaas_id: newCustomer.id, cpf_cnpj: doc })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error("[finance/asaas PATCH] error:", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
