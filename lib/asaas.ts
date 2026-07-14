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
  starter: { name: "Starter",  value: 97,  description: "1 TV · Suporte básico",         maxScreens: 1 },
  pro:     { name: "Pro",      value: 197, description: "1 TV · Relatórios · Prioridade", maxScreens: 1 },
  business:{ name: "Business", value: 397, description: "Até 3 TVs · Suporte dedicado",   maxScreens: 3 },
} as const

export type PlanKey = keyof typeof PLANS

// Cota de gerações de IA (Studio) por mês, por plano. -1 = ilimitado.
// Fase 17 (13/07/2026): antes disso, geração de IA não tinha limite
// nenhum em plano nenhum — era a única feature com custo variável real
// (tokens da Anthropic) sem controle. Starter/Pro ganham cota mensal,
// Business continua ilimitado (parte do posicionamento premium do plano).
export const PLAN_AI_GENERATION_LIMITS: Record<PlanKey, number> = {
  starter: 10,
  pro: 40,
  business: -1,
}
export const DEFAULT_AI_GENERATION_LIMIT = 10 // fallback sem plano identificado

// Fase 18 (14/07/2026): preço da tela extra recorrente. Antes disso era
// cobrança ÚNICA de R$97 (ver createOneTimePayment mais abaixo, ainda
// usada por outros fluxos) — achado numa análise comercial: cobrança
// única deixava um cliente Starter (R$97/mês) + 2 telas extra muito mais
// barato no longo prazo que assinar Business (R$397/mês) pro mesmo
// número de telas, sem nenhum motivo racional pra escolher Business.
// Recorrente e calibrado pra não competir de forma boba com o Business.
export const EXTRA_SCREEN_MONTHLY_PRICE = Number(process.env.EXTRA_SCREEN_MONTHLY_PRICE_BRL || 150)

// Cria ou busca cliente no Asaas
export async function getOrCreateAsaasCustomer(params: {
  name: string
  email: string
  phone: string
  cpfCnpj?: string
}) {
  // Tenta buscar pelo email
  const search = await asaas(`/customers?email=${encodeURIComponent(params.email)}&limit=1`)
  if (search.data?.length > 0) {
    const existing = search.data[0]
    // Sempre reenvia o CPF/CNPJ se tivermos um — idempotente, sem risco de
    // reenviar o mesmo valor. Não confiamos no campo retornado pela busca
    // (a Asaas pode omitir/mascarar esse campo na listagem por privacidade,
    // mesmo que esteja salvo de verdade — então checar "já tem ou não" por
    // ali não é confiável).
    if (params.cpfCnpj) {
      return asaas(`/customers/${existing.id}`, "POST", {
        cpfCnpj: params.cpfCnpj.replace(/\D/g, ""),
      })
    }
    return existing
  }

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

// Fase 18 (14/07/2026): assinatura recorrente pra tela extra (substituiu
// a cobrança única — ver EXTRA_SCREEN_MONTHLY_PRICE acima pro motivo).
// Uma assinatura Asaas separada por tela extra, independente da
// assinatura do plano base — permite cancelar só essa tela sem mexer no
// plano principal, se o cliente desvincular ela depois.
export async function createExtraScreenSubscription(params: {
  customerId: string
  screenLabel: string
  externalReference: string
  nextDueDate?: string // YYYY-MM-DD
}) {
  const nextDue = params.nextDueDate ?? new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10)
  return asaas("/subscriptions", "POST", {
    customer: params.customerId,
    billingType: "UNDEFINED", // PIX + Boleto
    value: EXTRA_SCREEN_MONTHLY_PRICE,
    nextDueDate: nextDue,
    cycle: "MONTHLY",
    description: `DOOHPLAY - Tela extra (${params.screenLabel})`,
    externalReference: params.externalReference,
    maxPayments: undefined, // sem limite, até cancelar
  })
}

// A resposta de criar assinatura NÃO traz invoiceUrl (esse campo é do
// objeto Pagamento, não Assinatura) — a Asaas gera o primeiro pagamento
// da assinatura de forma síncrona, mas como um recurso separado. Busca
// ele pra ter o link de fatura pra mostrar ao cliente.
export async function getFirstPaymentForSubscription(subscriptionId: string) {
  const res = await asaas(`/payments?subscription=${subscriptionId}&limit=1`)
  return res.data?.[0] ?? null
}

// Cria cobrança ÚNICA (não recorrente) — usada para campanhas de anúncio
// de terceiro, que têm início/fim definidos, em vez de assinatura mensal.
export async function createCampaignPayment(params: {
  customerId: string
  value: number
  campaignId: string
  description: string
  cpfCnpj?: string
  dueDate?: string // YYYY-MM-DD
}) {
  const due = params.dueDate ?? new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10)
  return asaas("/payments", "POST", {
    customer: params.customerId,
    billingType: "UNDEFINED", // PIX + Boleto
    value: params.value,
    dueDate: due,
    description: params.description,
    externalReference: `campaign:${params.campaignId}`,
    cpfCnpj: params.cpfCnpj?.replace(/\D/g, "") || undefined,
  })
}

// Cria cobrança ÚNICA genérica, com externalReference livre — usada por
// qualquer fluxo futuro que não seja campanha de anunciante nem assinatura
// mensal (ex: tela extra self-service, Fase 11). externalReference decide
// o roteamento no webhook (prefixo "algo:<id>").
export async function createOneTimePayment(params: {
  customerId: string
  value: number
  externalReference: string
  description: string
  cpfCnpj?: string
  dueDate?: string
}) {
  const due = params.dueDate ?? new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10)
  return asaas("/payments", "POST", {
    customer: params.customerId,
    billingType: "UNDEFINED",
    value: params.value,
    dueDate: due,
    description: params.description,
    externalReference: params.externalReference,
    cpfCnpj: params.cpfCnpj?.replace(/\D/g, "") || undefined,
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
