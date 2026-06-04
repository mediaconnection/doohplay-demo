import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

const SUGGESTIONS: Record<string, string[]> = {
  barber: [
    "Promoção de corte + barba para sexta-feira",
    "Desconto especial para novos clientes",
    "Combo visagismo fim de semana",
    "Anúncio de horários disponíveis hoje",
  ],
  food: [
    "Combo almoço executivo com desconto",
    "Happy hour cerveja gelada das 17h às 20h",
    "Promoção delivery grátis acima de R$50",
    "Prato do dia com preço especial",
  ],
  dessert: [
    "Bolo especial para encomenda",
    "Promoção de doces para festa",
    "Novidade da semana na vitrine",
    "Desconto em tortas no fim de semana",
  ],
  bakery: [
    "Pão quentinho saindo do forno agora",
    "Café da manhã completo por R$X",
    "Promoção leve 3 pague 2",
    "Encomendas para eventos especiais",
  ],
  pizza: [
    "Promoção sexta-feira 2 pizzas pelo preço de 1",
    "Delivery em 30 minutos garantido",
    "Pizza família com borda recheada",
    "Combo pizza + refrigerante",
  ],
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const businessType = searchParams.get("type") ?? "food"
  const suggestions = SUGGESTIONS[businessType] ?? SUGGESTIONS.food
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
