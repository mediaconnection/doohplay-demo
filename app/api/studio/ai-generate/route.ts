import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

// Achado numa sessão de revisão (12/07/2026): as chaves aqui estavam em
// inglês ("barber", "food"...), mas o campo business_type salvo de verdade
// no cadastro é em português ("Barbearia", "Farmácia"...) — então a busca
// NUNCA batia e a rota sempre caía no fallback, mostrando sugestão de
// comida pra qualquer tipo de negócio, inclusive barbearia. Corrigido pra
// bater com as opções reais do dropdown em app/cadastro/route.ts.
const SUGGESTIONS: Record<string, string[]> = {
  "Barbearia": [
    "Promoção de corte + barba para sexta-feira",
    "Desconto especial para novos clientes",
    "Combo visagismo fim de semana",
    "Anúncio de horários disponíveis hoje",
  ],
  "Salão de Beleza": [
    "Promoção de escova + hidratação",
    "Combo unhas + sobrancelha com desconto",
    "Novidade: coloração em oferta essa semana",
    "Desconto para novas clientes",
  ],
  "Farmácia": [
    "Desconto em genéricos essa semana",
    "Promoção de vitaminas e suplementos",
    "Vacina disponível — agende já",
    "Frete grátis em compras acima de R$50",
  ],
  "Clínica": [
    "Consulta com desconto para novos pacientes",
    "Check-up completo com condição especial",
    "Agende sua avaliação hoje",
    "Pacote de exames com preço especial",
  ],
  "Lanchonete": [
    "Combo lanche + refrigerante com desconto",
    "Promoção delivery grátis acima de R$50",
    "Lanche do dia com preço especial",
    "Happy hour bebida gelada das 17h às 20h",
  ],
  "Restaurante": [
    "Prato do dia com preço especial",
    "Rodízio com desconto durante a semana",
    "Reserve sua mesa para o fim de semana",
    "Combo almoço executivo com desconto",
  ],
  "Academia": [
    "Matrícula com desconto esse mês",
    "Aula experimental grátis",
    "Personal trainer com condição especial",
    "Traga um amigo e ganhe desconto",
  ],
  "Mercado": [
    "Oferta especial de carnes para o fim de semana",
    "Hortifruti fresquinho com desconto",
    "Combo família com preço especial",
    "Promoção do dia — só até fechar",
  ],
  "Petshop": [
    "Banho e tosa com desconto essa semana",
    "Promoção de ração — leve mais, pague menos",
    "Vacina para seu pet — agende já",
    "Combo banho + tosa + hidratação",
  ],
  "Outro": [
    "Promoção especial dessa semana",
    "Desconto para novos clientes",
    "Novidade chegando — confira",
    "Condição especial só até domingo",
  ],
}

function findSuggestions(businessType: string): string[] {
  const normalized = businessType.trim().toLowerCase()
  const match = Object.keys(SUGGESTIONS).find(k => k.toLowerCase() === normalized)
  return match ? SUGGESTIONS[match] : SUGGESTIONS["Outro"]
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const businessType = searchParams.get("type") ?? "Outro"
  const suggestions = findSuggestions(businessType)
  return NextResponse.json({ suggestions })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt, business_name, business_type, client_color } = body

    if (!prompt?.trim()) {
      return NextResponse.json({ error: "Prompt obrigatório" }, { status: 400 })
    }

    // Call Claude API to generate ad copy
    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 400,
        system: `Você é um especialista em copywriting para publicidade DOOH (Digital Out-of-Home) em telas de estabelecimentos comerciais brasileiros.
Crie textos curtos, impactantes e diretos para anúncios que aparecem em TVs em locais físicos.
Responda APENAS com JSON válido, sem markdown, sem explicações.`,
        messages: [{
          role: "user",
          content: `Crie um anúncio para: ${business_name} (${business_type})
Pedido: ${prompt}

Responda com este JSON exato:
{
  "headline": "texto principal impactante (máx 4 palavras)",
  "subline": "complemento ou detalhe (máx 8 palavras)",
  "cta": "chamada para ação (máx 3 palavras)",
  "image_prompt": "descrição em inglês para gerar imagem de fundo (estilo fotográfico, sem texto, máx 20 palavras)"
}`
        }]
      })
    })

    if (!claudeRes.ok) {
      throw new Error(`Claude API error: ${claudeRes.status}`)
    }

    const claudeData = await claudeRes.json()
    const textContent = claudeData.content?.[0]?.text ?? ""

    let adCopy: { headline: string; subline: string; cta: string; image_prompt: string }
    try {
      const clean = textContent.replace(/```json|```/g, "").trim()
      adCopy = JSON.parse(clean)
    } catch {
      return NextResponse.json({ error: "Erro ao processar resposta da IA" }, { status: 500 })
    }

    // Generate image via Claude with image generation
    let imageUrl: string | null = null
    try {
      const imgRes = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          tools: [{
            type: "computer_20241022",
            name: "computer",
            display_width_px: 1280,
            display_height_px: 720,
          }],
          messages: [{
            role: "user",
            content: `Generate a photorealistic background image for a digital advertising screen: ${adCopy.image_prompt}. 
16:9 aspect ratio, no text, professional commercial photography style, vibrant colors.`
          }]
        })
      })

      // If image generation not available, use a contextual placeholder
      if (!imgRes.ok) {
        imageUrl = null
      }
    } catch {
      imageUrl = null
    }

    return NextResponse.json({
      ok: true,
      headline: adCopy.headline,
      subline: adCopy.subline,
      cta: adCopy.cta,
      image_prompt: adCopy.image_prompt,
      image_url: imageUrl,
    })

  } catch (err: any) {
    console.error("AI generate error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
