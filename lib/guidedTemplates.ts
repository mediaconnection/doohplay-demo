// lib/guidedTemplates.ts
// Fase 46 (03/09/2026) — Etapa 1 do plano de "templates guiados" do Studio.
// Pedido de negócio mais antigo do backlog: geração livre por texto é
// difícil demais pra dono de loja não-familiarizado com IA. Aqui só os
// dados: os 6 objetivos, seus campos curtos (obrigatório/opcional), e a
// montagem do prompt estruturado — a integração com a UI (Etapa 2), a
// prévia grátis (Etapa 3) e a geração real via IA (Etapa 4) vêm depois,
// cada uma com sua própria aprovação.
//
// Por que só 2-4 campos curtos por objetivo: o público-alvo é o dono de
// loja que já achava difícil escrever um prompt livre — decisão consciente
// de simplicidade sobre flexibilidade. Campos opcionais nunca bloqueiam o
// preview/geração; só enriquecem o prompt quando preenchidos.

export type GuidedTemplateFieldOption = { value: string; label: string }

export type GuidedTemplateField = {
  id: string
  label: string
  type: "text" | "select"
  required: boolean
  // "text": placeholder + limite de caracteres
  placeholder?: string
  maxLength?: number
  // "select": opções fixas
  options?: GuidedTemplateFieldOption[]
  // Obrigatoriedade condicional — só usado pelo campo "Detalhe do horário"
  // do template Horário/Feriado (spec 2.3): obrigatório apenas quando o
  // campo `fieldId` tiver exatamente o valor `equals`. Quando presente,
  // manda mais que `required` (que fica false pra esse campo — a UI não
  // deve marcar asterisco fixo nele).
  requiredIf?: { fieldId: string; equals: string }
}

export type GuidedTemplateId =
  | "promocao"
  | "produto_novo"
  | "horario"
  | "evento"
  | "depoimento"
  | "institucional"

export type GuidedTemplateDef = {
  id: GuidedTemplateId
  name: string
  emoji: string
  description: string
  fields: GuidedTemplateField[]
}

export const GUIDED_TEMPLATES: GuidedTemplateDef[] = [
  {
    id: "promocao",
    name: "Promoção / Desconto",
    emoji: "🏷️",
    description: "Anuncie um desconto ou oferta por tempo limitado",
    fields: [
      { id: "produto",  label: "Produto ou serviço em promoção", type: "text", placeholder: "Ex: Corte + Barba",              required: true,  maxLength: 60 },
      { id: "desconto", label: "Desconto ou oferta",             type: "text", placeholder: "Ex: 20% OFF ou Leve 2 pague 1",  required: true,  maxLength: 40 },
      { id: "validade", label: "Válido até (opcional)",          type: "text", placeholder: "Ex: só nesta sexta-feira",       required: false, maxLength: 40 },
      { id: "condicao", label: "Condição (opcional)",            type: "text", placeholder: "Ex: só no PIX",                  required: false, maxLength: 40 },
    ],
  },
  {
    id: "produto_novo",
    name: "Produto / Serviço Novo",
    emoji: "✨",
    description: "Apresente uma novidade do seu negócio",
    fields: [
      { id: "nome",      label: "Nome do produto ou serviço novo", type: "text", placeholder: "Ex: Sobrancelha Design",              required: true,  maxLength: 60 },
      { id: "beneficio", label: "Principal benefício",             type: "text", placeholder: "Ex: acabamento perfeito em 15 min",   required: true,  maxLength: 60 },
      { id: "preco",     label: "Preço (opcional)",                type: "text", placeholder: "Ex: a partir de R$30",                required: false, maxLength: 30 },
    ],
  },
  {
    id: "horario",
    name: "Horário / Feriado",
    emoji: "🕒",
    description: "Avise sobre mudança de horário ou funcionamento em data especial",
    // Spec 2.3 — único dos 6 templates com seleção fixa e campo condicional.
    fields: [
      {
        id: "tipo_aviso", label: "Tipo de aviso", type: "select", required: true,
        options: [
          { value: "normal",   label: "Funcionamento normal" },
          { value: "fechado",  label: "Fechado" },
          { value: "especial", label: "Horário especial" },
        ],
      },
      { id: "periodo", label: "Data ou período", type: "text", placeholder: "Ex: 25 de dezembro", required: true, maxLength: 40 },
      {
        id: "detalhe", label: "Detalhe do horário", type: "text", placeholder: "Ex: abrimos às 14h",
        required: false, maxLength: 60,
        requiredIf: { fieldId: "tipo_aviso", equals: "especial" },
      },
    ],
  },
  {
    id: "evento",
    name: "Evento / Data Comemorativa",
    emoji: "🎉",
    description: "Divulgue uma ação especial pra uma data comemorativa",
    fields: [
      { id: "evento", label: "Nome do evento ou data", type: "text", placeholder: "Ex: Dia dos Namorados",            required: true,  maxLength: 60 },
      { id: "data",   label: "Data",                   type: "text", placeholder: "Ex: 12 de junho",                  required: true,  maxLength: 30 },
      { id: "acao",   label: "O que vai rolar (opcional)", type: "text", placeholder: "Ex: kit especial de presente",  required: false, maxLength: 60 },
    ],
  },
  {
    id: "depoimento",
    name: "Depoimento / Prova Social",
    emoji: "💬",
    description: "Mostre a satisfação de um cliente real",
    fields: [
      { id: "depoimento", label: "Depoimento do cliente",       type: "text", placeholder: "Ex: Melhor barbearia da região!",   required: true,  maxLength: 100 },
      { id: "autor",      label: "Quem disse (opcional)",       type: "text", placeholder: "Ex: João, cliente há 3 anos",       required: false, maxLength: 40 },
      { id: "destaque",   label: "Número de destaque (opcional)", type: "text", placeholder: "Ex: +500 clientes atendidos",     required: false, maxLength: 40 },
    ],
  },
  {
    id: "institucional",
    name: "Institucional Simples",
    emoji: "🏪",
    description: "Reforce a marca do seu negócio, sem promoção específica",
    fields: [
      { id: "mensagem",  label: "Mensagem principal",       type: "text", placeholder: "Ex: Tradição e qualidade há 10 anos", required: true,  maxLength: 60 },
      { id: "subtitulo", label: "Complemento (opcional)",   type: "text", placeholder: "Ex: Venha nos conhecer",              required: false, maxLength: 60 },
    ],
  },
]

export function getGuidedTemplate(id: string | null | undefined): GuidedTemplateDef | undefined {
  return GUIDED_TEMPLATES.find(t => t.id === id)
}

// Valida os campos obrigatórios de um template guiado. Devolve a lista de
// ids que faltam preencher — vazia significa que pode prosseguir (prévia
// ou geração real). Campos com `requiredIf` só entram na checagem quando a
// condição bate (ex: "Detalhe do horário" só é obrigatório se "Tipo de
// aviso" === "especial" — spec 2.3).
export function validateGuidedValues(templateId: string, values: Record<string, string>): string[] {
  const tpl = getGuidedTemplate(templateId)
  if (!tpl) return ["template"]
  return tpl.fields
    .filter(f => {
      const isRequired = f.requiredIf
        ? values[f.requiredIf.fieldId]?.trim() === f.requiredIf.equals
        : f.required
      return isRequired && !values[f.id]?.trim()
    })
    .map(f => f.id)
}

// Monta o prompt em português a partir dos campos preenchidos — mesmo
// formato que o campo `prompt` livre já aceita hoje em
// app/api/studio/ai-generate/route.ts (que já recebe business_name e
// business_type à parte e já injeta o enquadramento DOOH no system prompt
// do Claude — não precisa repetir isso aqui). Só monta o que o dono da loja
// preencheria manualmente se estivesse escrevendo texto livre.
export function buildGuidedPrompt(templateId: string, values: Record<string, string>): string {
  const v = (id: string) => values[id]?.trim() || ""

  switch (templateId as GuidedTemplateId) {
    case "promocao": {
      let p = `Promoção de ${v("produto")}: ${v("desconto")}.`
      if (v("validade")) p += ` Válido até ${v("validade")}.`
      if (v("condicao")) p += ` Condição: ${v("condicao")}.`
      return p
    }
    case "produto_novo": {
      let p = `Novidade: ${v("nome")}. ${v("beneficio")}.`
      if (v("preco")) p += ` Preço: ${v("preco")}.`
      return p
    }
    case "horario": {
      const tipo = v("tipo_aviso")
      const tipoLabel = getGuidedTemplate("horario")?.fields
        .find(f => f.id === "tipo_aviso")?.options
        ?.find(o => o.value === tipo)?.label ?? tipo
      let p = `Aviso de horário para ${v("periodo")}: ${tipoLabel}.`
      if (tipo === "especial" && v("detalhe")) p += ` ${v("detalhe")}.`
      return p
    }
    case "evento": {
      let p = `Ação especial para ${v("evento")} (${v("data")}).`
      if (v("acao")) p += ` ${v("acao")}.`
      return p
    }
    case "depoimento": {
      let p = `Depoimento de cliente: "${v("depoimento")}"`
      if (v("autor")) p += ` — ${v("autor")}`
      if (v("destaque")) p += `. Destaque: ${v("destaque")}`
      return p + "."
    }
    case "institucional": {
      let p = `Mensagem institucional da marca: ${v("mensagem")}.`
      if (v("subtitulo")) p += ` ${v("subtitulo")}.`
      return p
    }
    default:
      return ""
  }
}
