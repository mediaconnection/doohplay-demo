// lib/asaas.ts
const ASAAS_URL = process.env.ASAAS_ENV === "production"
  ? "https://api.asaas.com/v3"
  : "https://sandbox.asaas.com/api/v3"

const ASAAS_KEY = process.env.ASAAS_API_KEY!

async function asaas(path: string, method = "GET", body?: object) {
  const res = await fetch(`${ASAAS_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "access_token": ASAAS_KEY,
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.errors?.[0]?.description ?? `Asaas error ${res.status}`)
  return data
}

export const PLANS = {
  starter: { name: "Starter",  value: 97,  description: "1 TV · Suporte básico" },
  pro:     { name: "Pro",      value: 197, description: "1 TV · Relatórios · Prioridade" },
  business:{ name: "Business", value: 397, description: "Até 3 TVs · Suporte dedicado" },
} as const

export type PlanKey = keyof typeof PLANS

// Cria ou busca cliente no Asaas
export async function getOrCreateAsaasCustomer(params: {
  name: string
  email: string
  phone: string
  cpfCnpj?: string
}) {
  // Tenta buscar pelo email
  const search = await asaas(`/customers?email=${encodeURIComponent(params.email)}&limit=1`)
  if (search.data?.length > 0) return search.data[0]

  // Cria novo cliente
  return asaas("/customers", "POST", {
    name: params.name,
    email: params.email,
    mobilePhone: params.phone.replace(/\D/g, ""),
    cpfCnpj: params.cpfCnpj?.replace(/\D/g, "") || undefined,
    notificationDisabled: false,
  })
}

// Cria assinatura recorrente mensal
export async function createSubscription(params: {
  customerId: string
  plan: PlanKey
  nextDueDate?: string // YYYY-MM-DD
}) {
  const plan = PLANS[params.plan]
  const nextDue = params.nextDueDate ?? new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10)

  return asaas("/subscriptions", "POST", {
    customer: params.customerId,
    billingType: "UNDEFINED", // PIX + Boleto
    value: plan.value,
    nextDueDate: nextDue,
    cycle: "MONTHLY",
    description: `DOOHPLAY ${plan.name} - ${plan.description}`,
    maxPayments: undefined, // sem limite
  })
}

// Cancela assinatura
export async function cancelSubscription(subscriptionId: string) {
  return asaas(`/subscriptions/${subscriptionId}`, "DELETE")
}

// Busca status da assinatura
export async function getSubscription(subscriptionId: string) {
  return asaas(`/subscriptions/${subscriptionId}`)
}
