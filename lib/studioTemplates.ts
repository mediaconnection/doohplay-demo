// lib/studioTemplates.ts
// Extraído de app/studio/[code]/page.tsx (Fase 44, 21/08/2026) — fonte
// única dos 3 templates visuais por segmento, compartilhada entre o
// editor (preview no navegador) e a rota de publicação (imagem real
// renderizada por Puppeteer).
//
// Por que isso existia só no frontend antes: os 3 templates (bg/accent/
// emoji distintos por template) SEMPRE existiram como dado — o
// AdPreview no editor já os usava corretamente pra mostrar a prévia. O
// bug era só o caminho de publicação: handlePublish nunca mandava qual
// template foi escolhido, e app/api/studio/publish/route.ts nunca tinha
// como usar isso mesmo se recebesse — sempre montava a imagem final com
// uma cor fixa por business_type (SEGMENT_COLORS), igual pra qualquer um
// dos 3. Resultado: os 3 templates só existiam de verdade dentro do
// navegador, nunca na tela real do cliente. Corrigido nesta fase.

export type StudioTemplate = {
  id: string
  name: string
  emoji: string
  bg: string
  accent: string
  headline: string
  subline: string
  cta: string
}

export const STUDIO_TEMPLATES: Record<string, StudioTemplate[]> = {
  barber: [
    { id: "barber1", name: "Classico Premium", emoji: "✂", bg: "#0a0a0a", accent: "#C9A84C", headline: "Corte + Barba", subline: "Voce em alto estilo", cta: "Agende agora" },
    { id: "barber2", name: "Moderno Bold", emoji: "🪒", bg: "#1a1a2e", accent: "#e94560", headline: "Novo Visual", subline: "Transforme seu estilo", cta: "Reserve ja" },
    { id: "barber3", name: "Minimalista", emoji: "💈", bg: "#f8f4f0", accent: "#2d2d2d", headline: "Arte em cada corte", subline: "Excelencia e tradicao", cta: "Venha nos conhecer" },
  ],
  food: [
    { id: "food1", name: "Combo Almoco", emoji: "🍽", bg: "#1a0a00", accent: "#f59e0b", headline: "Combo do Dia", subline: "Prato + bebida + sobremesa", cta: "Peca agora" },
    { id: "food2", name: "Promocao Destaque", emoji: "⚡", bg: "#0f1f0f", accent: "#22c55e", headline: "Oferta Especial", subline: "So hoje!", cta: "Aproveite!" },
    { id: "food3", name: "Delivery", emoji: "🛵", bg: "#1a0020", accent: "#a855f7", headline: "Delivery Rapido", subline: "Entregamos em 30 min", cta: "Faca seu pedido" },
  ],
  dessert: [
    { id: "dessert1", name: "Bolo Especial", emoji: "🎂", bg: "#1a0010", accent: "#f472b6", headline: "Bolos Artesanais", subline: "Feitos com amor", cta: "Encomende ja" },
    { id: "dessert2", name: "Doces do Dia", emoji: "🍰", bg: "#fff8f0", accent: "#ea580c", headline: "Doces Fresquinhos", subline: "Todo dia uma surpresa", cta: "Venha provar" },
    { id: "dessert3", name: "Elegante", emoji: "🍫", bg: "#0a0505", accent: "#d4a574", headline: "Alta Confeitaria", subline: "Experiencias unicas", cta: "Descubra" },
  ],
  bakery: [
    { id: "bakery1", name: "Pao Fresquinho", emoji: "🍞", bg: "#1a0d00", accent: "#f97316", headline: "Pao Quentinho", subline: "Direto do forno", cta: "Venha buscar" },
    { id: "bakery2", name: "Cafe da Manha", emoji: "☕", bg: "#f5f0e8", accent: "#78350f", headline: "Cafe da Manha", subline: "O melhor comeco de dia", cta: "Passe aqui" },
    { id: "bakery3", name: "Promocao", emoji: "🥐", bg: "#0f0f1a", accent: "#fbbf24", headline: "Promocao do Dia", subline: "Leve 3, pague 2", cta: "Aproveite!" },
  ],
  pizza: [
    { id: "pizza1", name: "Promocao Sexta", emoji: "🍕", bg: "#1a0000", accent: "#ef4444", headline: "Sexta de Pizza", subline: "2 pizzas pelo preco de 1", cta: "Peca ja" },
    { id: "pizza2", name: "Delivery Noturno", emoji: "🌙", bg: "#020617", accent: "#6366f1", headline: "Delivery ate meia-noite", subline: "Pizza quente na porta", cta: "Faca seu pedido" },
    { id: "pizza3", name: "Familia", emoji: "👨‍👩‍👧", bg: "#0a1a00", accent: "#84cc16", headline: "Pizza em Familia", subline: "Momentos que ficam", cta: "Reserve sua mesa" },
  ],
  fashion: [
    { id: "fashion1", name: "Nova Colecao", emoji: "👗", bg: "#0a0014", accent: "#d946ef", headline: "Nova Colecao", subline: "Tendencias que chegaram", cta: "Confira agora" },
    { id: "fashion2", name: "Liquidacao", emoji: "🏷", bg: "#1a0000", accent: "#f97316", headline: "Ate 70% OFF", subline: "So enquanto durar o estoque", cta: "Aproveite ja" },
    { id: "fashion3", name: "Estilo Minimalista", emoji: "🧥", bg: "#f5f5f0", accent: "#1c1c1c", headline: "Vista-se bem", subline: "Moda com elegancia", cta: "Explore a vitrine" },
  ],
  supermarket: [
    { id: "super1", name: "Oferta do Dia", emoji: "🛒", bg: "#003300", accent: "#22c55e", headline: "Oferta do Dia", subline: "Precos que fazem diferenca", cta: "Venha conferir" },
    { id: "super2", name: "Fim de Semana", emoji: "🥩", bg: "#1a0500", accent: "#ef4444", headline: "Churrasco em Familia", subline: "Carnes selecionadas com desconto", cta: "Aproveite" },
    { id: "super3", name: "Hortifruti", emoji: "🥦", bg: "#f0fff0", accent: "#15803d", headline: "Fresquinho Todo Dia", subline: "Direto do produtor para voce", cta: "Compre agora" },
  ],
  perfumery: [
    { id: "perf1", name: "Lancamento", emoji: "💐", bg: "#0a0010", accent: "#c084fc", headline: "Novo Lancamento", subline: "A fragrancia que te define", cta: "Experimente" },
    { id: "perf2", name: "Presente Especial", emoji: "🎁", bg: "#1a0a05", accent: "#f59e0b", headline: "Presente Perfeito", subline: "Para quem voce ama", cta: "Escolha o seu" },
    { id: "perf3", name: "Promocao Kit", emoji: "✨", bg: "#f8f0ff", accent: "#7c3aed", headline: "Kit Especial", subline: "Perfume + hidratante", cta: "Garanta o seu" },
  ],
}

// Fase 46 (03/09/2026): normaliza o business_type real (cadastrado em PT,
// mesmas opções do dropdown de /cadastro) pra uma chave de STUDIO_TEMPLATES
// (definidas em inglês). Sem isso, STUDIO_TEMPLATES[businessType] nunca
// batia pra nenhum cliente real -- achado em produção em 03/09/2026:
// Barbearia e Lanchonete, os 2 únicos clientes ativos, caíam sempre no
// fallback .barber por acidente de idioma, não por decisão. Mesmo bug já
// corrigido uma vez em app/api/studio/ai-generate (12/07/2026, ver
// SUGGESTIONS) e não replicado aqui até agora.
//
// Cobertura: STUDIO_TEMPLATES tem 8 segmentos, o dropdown de /cadastro tem
// 10 — não bate 1:1. Categorias sem template dedicado (Farmácia, Clínica,
// Academia, Petshop, Salão de Beleza, Outro) caem em "barber" de propósito,
// documentado aqui — mesmo resultado visual de hoje, mas agora é decisão
// explícita e testável, não bug por acidente de idioma.
const BUSINESS_TYPE_TO_SEGMENT: Record<string, string> = {
  "barbearia":  "barber",
  "lanchonete": "food",
  "restaurante":"food",
  "mercado":    "supermarket",
}

export function mapBusinessTypeToTemplateSegment(businessType: string | null | undefined): string {
  const normalized = (businessType || "").trim().toLowerCase()
  return BUSINESS_TYPE_TO_SEGMENT[normalized] ?? "barber"
}

// Mesma regra de fallback que já existia no editor (TEMPLATES[businessType]
// ?? TEMPLATES.barber) — extraída aqui pra backend e frontend nunca
// divergirem sobre qual lista vale pra cada business_type.
export function getTemplatesForBusinessType(businessType: string | null | undefined): StudioTemplate[] {
  return STUDIO_TEMPLATES[mapBusinessTypeToTemplateSegment(businessType)] ?? STUDIO_TEMPLATES.barber
}

// Usado pela rota de publicação: dado o business_type do cliente e o id
// do template escolhido no editor, devolve o template real (bg/accent/
// emoji) — NUNCA confia em bg/accent vindos direto do corpo da requisição
// (evita injeção de CSS arbitrário no HTML renderizado por Puppeteer).
// Se o id não vier ou não bater com nenhum template real (ex: frontend
// antigo em cache, ainda sem essa mudança), cai no primeiro template da
// lista do segmento — nunca quebra a publicação por causa disso.
export function findStudioTemplate(businessType: string | null | undefined, templateId?: string | null): StudioTemplate {
  const list = getTemplatesForBusinessType(businessType)
  return list.find(t => t.id === templateId) ?? list[0]
}
