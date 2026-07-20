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

// Fase 27 (15/07/2026): planos passam a incluir mais telas conforme o
// tier, em vez de todos cobrirem só 1 (decisão de produto — Pro e
// Business precisavam de argumento próprio pra upgrade além de
// "Relatórios/Prioridade/Suporte dedicado", que hoje não têm gate
// técnico real). Preço por tela calibrado pra nunca ficar mais barato
// que ficar no plano de baixo comprando telas extra a R$150/mês
// (EXTRA_SCREEN_MONTHLY_PRICE_BRL) — ver conferência feita com o
// fundador antes de aplicar: Pro 3 telas por R$290 (R$96,67/tela, quase
// igual ao Starter) e Business 5 telas por R$620 (sempre mais barato
// que Pro + 2 extras = R$590+150=740... na verdade Pro+2 extras = R$290
// + R$300 = R$590, e Business a R$620 fica ligeiramente ACIMA disso —
// isso é intencional: ver nota abaixo).
// Nota: Business (R$620) ficar R$30 acima de "Pro + 2 extras" (R$590) é
// consciente — o fundador decidiu manter uma pequena margem positiva em
// vez de empate exato, pra sempre sobrar alguma vantagem de preço (além
// do suporte dedicado) em migrar pro tier de cima.
export const PLANS = {
  starter: { name: "Starter",  value: 97,  description: "1 TV · Suporte básico",         maxScreens: 1 },
  pro:     { name: "Pro",      value: 290, description: "3 TVs · Relatórios · Prioridade", maxScreens: 3 },
  business:{ name: "Business", value: 620, description: "5 TVs · Suporte dedicado",   maxScreens: 5 },
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

// Limite de QUANTIDADE total de mídias (imagens + vídeos somados) por
// plano. -1 = ilimitado. Consolidado aqui em 20/07/2026 — antes vivia
// só dentro de app/api/studio/upload/route.ts, desorganizado (pendência
// já registrada anteriormente). Valores dobrados na mesma sessão
// (Starter 10→20, Pro 25→50), motivado por feedback direto de cliente
// prospectado pedindo mais espaço pra vídeo — custo de storage no R2 é
// irrelevante nessa escala (~$0,12/mês mesmo a 100 telas, ver análise de
// custo real de 16/07), o limite antigo não tinha lastro de custo.
export const PLAN_MEDIA_LIMITS: Record<PlanKey, number> = {
  starter: 20,
  pro: 50,
  business: -1,
}
export const DEFAULT_MEDIA_LIMIT = 10 // fallback sem plano identificado

// Fase 18 (14/07/2026): preço da tela extra recorrente. Antes disso era
// cobrança ÚNICA de R$97 (ver createOneTimePayment mais abaixo, ainda
// usada por outros fluxos) — achado numa análise comercial: cobrança
// única deixava um cliente Starter (R$97/mês) + 2 telas extra muito mais
// barato no longo prazo que assinar Business (R$397/mês) pro mesmo
// número de telas, sem nenhum motivo racional pra escolher Business.
// Recorrente e calibrado pra não competir de forma boba com o Business.
export const EXTRA_SCREEN_MONTHLY_PRICE = Number(process.env.EXTRA_SCREEN_MONTHLY_PRICE_BRL || 150)

// Cria ou busca cliente no Asaas
// Busca ou cria cliente no Asaas
//
// Achado em produção (16/07/2026): existia uma SEGUNDA implementação dessa
// função, definida localmente dentro de app/api/finance/asaas/route.ts —
// com um encadeamento de busca mais robusto (ID salvo no banco → CPF/CNPJ
// → email → cria) do que esta versão compartilhada (só buscava por
// email). Ou seja, dependendo de qual dos 3 caminhos de cadastro/cobrança
// era usado, o risco de criar um cliente DUPLICADO no Asaas pra mesma
// pessoa era diferente — mesma classe de bug do createSubscription
// duplicado. Consolidado aqui: a lib de pagamento não depende do banco
// (mantém a separação de responsabilidade), então quem já tiver um
// asaas_customer_id salvo passa via `existingCustomerId`; o encadeamento
// CPF/CNPJ → email → criar fica sempre dentro desta função única.
export async function getOrCreateAsaasCustomer(params: {
  name: string
  email: string
  phone: string
  cpfCnpj?: string
  existingCustomerId?: string
  externalReference?: string
}) {
  const cleanCpfCnpj = params.cpfCnpj?.replace(/\D/g, "")

  // 0. Se quem chamou já sabe o ID salvo (ex: financial_subscriptions),
  // confirma que ainda existe no Asaas antes de ir pra busca por atributo.
  if (params.existingCustomerId) {
    const existing = await asaas(`/customers/${params.existingCustomerId}`)
    if (!existing.errors) {
      if (cleanCpfCnpj) {
        return asaas(`/customers/${existing.id}`, "POST", { cpfCnpj: cleanCpfCnpj })
      }
      return existing
    }
  }

  // 1. Busca por CPF/CNPJ — mais preciso que email (evita duplicar
  // cliente quando o mesmo documento já existe com email diferente/antigo)
  if (cleanCpfCnpj) {
    const byDoc = await asaas(`/customers?cpfCnpj=${cleanCpfCnpj}`)
    if (byDoc.data?.length > 0) return byDoc.data[0]
  }

  // 2. Busca por email
  const search = await asaas(`/customers?email=${encodeURIComponent(params.email)}&limit=1`)
  if (search.data?.length > 0) {
    const existing = search.data[0]
    // Sempre reenvia o CPF/CNPJ se tivermos um — idempotente, sem risco de
    // reenviar o mesmo valor. Não confiamos no campo retornado pela busca
    // (a Asaas pode omitir/mascarar esse campo na listagem por privacidade,
    // mesmo que esteja salvo de verdade — então checar "já tem ou não" por
    // ali não é confiável).
    if (cleanCpfCnpj) {
      return asaas(`/customers/${existing.id}`, "POST", { cpfCnpj: cleanCpfCnpj })
    }
    return existing
  }

  // 3. Cria novo cliente
  return asaas("/customers", "POST", {
    name: params.name,
    email: params.email,
    mobilePhone: params.phone.replace(/\D/g, ""),
    cpfCnpj: cleanCpfCnpj || undefined,
    personType: cleanCpfCnpj ? (cleanCpfCnpj.length === 14 ? "JURIDICA" : "FISICA") : undefined,
    ...(params.externalReference ? { externalReference: params.externalReference } : {}),
    notificationDisabled: false,
  })
}

// Cria assinatura recorrente mensal
//
// Achado em produção (16/07/2026): existia uma SEGUNDA implementação dessa
// mesma função, definida localmente dentro de app/api/finance/asaas/route.ts
// — com `fine`/`interest`/`externalReference` que ESSA (a versão
// compartilhada, usada por /api/cadastro e /api/admin/subscription) não
// tinha. Ou seja, dependendo de qual dos 3 caminhos criava a assinatura, a
// política de atraso (multa/juros) e a rastreabilidade no Asaas
// (externalReference) eram diferentes, sem ninguém ter decidido isso de
// propósito — mesma classe de bug já vista antes (dois caminhos paralelos
// fazendo a mesma coisa de jeitos diferentes). Consolidado numa função só;
// a rota duplicada agora chama esta.
export async function createSubscription(params: {
  customerId: string
  plan: PlanKey
  nextDueDate?: string // YYYY-MM-DD
  externalReference?: string
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
    ...(params.externalReference ? { externalReference: params.externalReference } : {}),
    fine: { value: 2 },
    interest: { value: 1 },
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
