import { NextRequest, NextResponse } from "next/server"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { getPool } from "@/lib/db"
import { PLAN_AI_GENERATION_LIMITS, DEFAULT_AI_GENERATION_LIMIT, PlanKey } from "@/lib/asaas"
import { generateBackgroundImagesBatch } from "@/lib/imageGeneration"
import { setJobStatus, type AiCreativeConcept } from "@/lib/aiCreativeJobs"
import crypto from "crypto"

export const dynamic = "force-dynamic"

// Quantos conceitos o AI Creative Lab gera por clique. Fixo em 3 (headline+
// subhead+cta+imagem cada) — ver plano de evolução registrado em
// 30/08/2026: cada conceito consome 1 linha de ai_generation_log, então a
// cota (PLAN_AI_GENERATION_LIMITS) continua valendo o mesmo teto de custo
// em $ de antes, só que expresso em "conceitos" em vez de "cliques".
const CONCEPTS_PER_GENERATION = 3

const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId:     process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})
const BUCKET     = "dooh-media"
const PUBLIC_URL = process.env.R2_PUBLIC_URL || ""

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

// Fase 45 (30/08/2026): evolução de "1 geração por vez" pra "3 conceitos
// simultâneos" (headline+subline+cta+imagem cada, estilos bold/minimal/
// vibrant, inspirado no AI Creative Lab do Figma Make). Decisões
// registradas no plano aprovado com o fundador em 30/08/2026:
//
// - 1 imagem por conceito (não por formato) — os 3 formatos (16:9/9:16/1:1)
//   são só crop/aspect-ratio do mesmo preview no frontend, igual ao próprio
//   Figma faz (trocar de formato lá não gera nada novo). Isso mantém o
//   custo em ~3x o de antes, não 9x.
// - Cota: cada conceito consome 1 linha de ai_generation_log (3 por
//   clique) — PLAN_AI_GENERATION_LIMITS (10/40/-1) fica igual, só passa a
//   valer em "conceitos" em vez de "cliques", preservando o teto de custo
//   em $ que já existia.
// - Clique inteiro é negado se sobrar menos de CONCEPTS_PER_GENERATION na
//   cota do mês — não faz geração parcial (2 de 3), pra não confundir o
//   dono da loja com um resultado incompleto.
// - Geração de imagem é sequencial (generateBackgroundImagesBatch já fazia
//   isso, pra não estourar rate limit do Gemini) e pode levar até ~90s no
//   pior caso — por isso essa rota não espera a geração terminar: só
//   valida a cota, dispara o job em background (fire-and-forget, processo
//   Node do Render continua rodando depois da resposta) e devolve um
//   jobId. O frontend faz polling em GET .../ai-generate/status?jobId=...
//   pra mostrar "gerando conceito 2 de 3" em vez de uma barra de progresso
//   falsa (que é o que o protótipo do Figma fazia).
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, prompt, business_name, business_type } = body

    if (!prompt?.trim()) {
      return NextResponse.json({ error: "Prompt obrigatório" }, { status: 400 })
    }

    // Fase 17 (13/07/2026): cota de geração por IA, por plano. Antes disso
    // não tinha limite nenhum — era a única feature com custo variável
    // real (tokens da Anthropic) sem controle nenhum de plano.
    const pool = getPool()
    const upperCode = String(code ?? "").toUpperCase()
    let aiLimit = DEFAULT_AI_GENERATION_LIMIT
    let used = 0
    if (upperCode) {
      try {
        const subRes = await pool.query(
          `SELECT plan FROM financial_subscriptions WHERE code = $1 AND status = 'ACTIVE' LIMIT 1`,
          [upperCode]
        )
        const planKey = subRes.rows[0]?.plan?.toLowerCase() as PlanKey | undefined
        if (planKey && planKey in PLAN_AI_GENERATION_LIMITS) {
          aiLimit = PLAN_AI_GENERATION_LIMITS[planKey]
        }
      } catch (err) {
        console.warn("[ai-generate] Não foi possível buscar plano:", err)
      }

      if (aiLimit !== -1) {
        const usageRes = await pool.query(
          `SELECT COUNT(*)::int AS count FROM ai_generation_log
           WHERE client_code = $1 AND feature = 'creative' AND created_at >= date_trunc('month', NOW())`,
          [upperCode]
        )
        used = usageRes.rows[0]?.count ?? 0
        if (aiLimit - used < CONCEPTS_PER_GENERATION) {
          return NextResponse.json({
            error: `Restam ${Math.max(aiLimit - used, 0)} gerações na sua cota mensal — cada clique gera ${CONCEPTS_PER_GENERATION} conceitos. Fala com o suporte pra fazer upgrade.`,
            quotaExceeded: true,
            limit: aiLimit,
            used,
            needed: CONCEPTS_PER_GENERATION,
          }, { status: 429 })
        }
      }
    }

    const jobId = crypto.randomUUID()
    // Escrito e aguardado antes de devolver o jobId — evita corrida onde o
    // frontend já dá poll no status antes da chave existir no Redis.
    await setJobStatus(jobId, { status: "generating_copy" })

    runConceptGeneration({ jobId, pool, upperCode, prompt, business_name, business_type })
      .catch((err: any) => {
        console.error("[ai-generate] job de geração falhou:", err)
        setJobStatus(jobId, { status: "error", error: err.message ?? "Erro desconhecido" })
          .catch(() => {})
      })

    return NextResponse.json({ ok: true, jobId })

  } catch (err: any) {
    console.error("AI generate error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

type RawConcept = {
  style: "bold" | "minimal" | "vibrant"
  headline: string
  subline: string
  cta: string
  image_prompt: string
}

async function runConceptGeneration(params: {
  jobId: string
  pool: ReturnType<typeof getPool>
  upperCode: string
  prompt: string
  business_name: string
  business_type: string
}) {
  const { jobId, pool, upperCode, prompt, business_name, business_type } = params

  // ── Etapa 1: Claude gera os 3 conceitos numa única chamada ──────────
  // Uma chamada só (não 3) — o custo de texto é irrelevante frente ao de
  // imagem, então não faz sentido triplicar também as chamadas de copy.
  const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-5",
      max_tokens: 1200,
      // Mesmo motivo do fix de 12/07/2026: thinking conta dentro do
      // max_tokens no Sonnet 5, e essa rota só gera JSON curto — não
      // precisa de raciocínio estendido.
      thinking: { type: "disabled" },
      system: `Você é um especialista em copywriting para publicidade DOOH (Digital Out-of-Home) em telas de estabelecimentos comerciais brasileiros.
Crie textos curtos, impactantes e diretos para anúncios que aparecem em TVs em locais físicos.
Responda APENAS com JSON válido, sem markdown, sem explicações.`,
      messages: [{
        role: "user",
        content: `Crie EXATAMENTE 3 conceitos DIFERENTES de anúncio para: ${business_name} (${business_type})
Pedido: ${prompt}

Cada conceito deve ter um estilo visual e tom distinto:
- "bold": impactante, contraste alto, urgência
- "minimal": sofisticado, clean, poucas palavras
- "vibrant": colorido, energético, divertido

Responda com este JSON exato (array com exatamente 3 itens, um por estilo):
[
  {
    "style": "bold",
    "headline": "texto principal impactante (máx 4 palavras)",
    "subline": "complemento ou detalhe (máx 8 palavras)",
    "cta": "chamada para ação (máx 3 palavras)",
    "image_prompt": "descrição em inglês para gerar imagem de fundo (estilo fotográfico, sem texto, dramático/alto contraste, máx 20 palavras)"
  },
  {
    "style": "minimal",
    "headline": "...",
    "subline": "...",
    "cta": "...",
    "image_prompt": "descrição em inglês, estilo fotográfico clean e minimalista, sem texto, máx 20 palavras"
  },
  {
    "style": "vibrant",
    "headline": "...",
    "subline": "...",
    "cta": "...",
    "image_prompt": "descrição em inglês, estilo fotográfico colorido e vibrante, sem texto, máx 20 palavras"
  }
]`
      }]
    })
  })

  if (!claudeRes.ok) {
    const errText = await claudeRes.text().catch(() => "")
    console.error("Claude API error:", claudeRes.status, errText)
    throw new Error(`Erro ao gerar anúncio (Claude API ${claudeRes.status})`)
  }

  const claudeData = await claudeRes.json()
  const textContent = claudeData.content?.[0]?.text ?? ""

  let rawConcepts: RawConcept[]
  try {
    const clean = textContent.replace(/```json|```/g, "").trim()
    const parsed = JSON.parse(clean)
    if (!Array.isArray(parsed) || parsed.length !== CONCEPTS_PER_GENERATION) {
      throw new Error(`Esperado array de ${CONCEPTS_PER_GENERATION} conceitos, recebido: ${Array.isArray(parsed) ? parsed.length : typeof parsed}`)
    }
    rawConcepts = parsed
  } catch (err: any) {
    console.error("Falha ao parsear resposta da IA:", textContent)
    throw new Error("Erro ao processar resposta da IA")
  }

  // Fase 17/45: registra o uso assim que o copy dos 3 conceitos é válido —
  // mesma filosofia de sempre (nunca perder a cota de um copy bom por causa
  // de uma imagem que falhar depois). A checagem de cota (aiLimit - used <
  // CONCEPTS_PER_GENERATION) já garantiu que cabem os 3 antes de chegar aqui.
  if (upperCode) {
    pool.query(
      `INSERT INTO ai_generation_log (client_code, feature)
       SELECT $1, 'creative' FROM generate_series(1, $2)`,
      [upperCode, CONCEPTS_PER_GENERATION]
    ).catch((err: unknown) => console.warn("[ai-generate] Falha ao logar uso (não bloqueia o job):", err))
  }

  // ── Etapa 2: gera as 3 imagens em sequência, atualizando o progresso ──
  const imageResults = await generateBackgroundImagesBatch(
    rawConcepts.map((c, i) => ({ id: `concept-${i + 1}`, prompt: c.image_prompt })),
    async (index) => {
      await setJobStatus(jobId, { status: "generating_image", step: index + 1, total: CONCEPTS_PER_GENERATION })
    }
  )

  const concepts: AiCreativeConcept[] = await Promise.all(
    rawConcepts.map(async (raw, i) => {
      const imgResult = imageResults[i]
      let image_url: string | null = null
      let image_error: string | undefined

      if (imgResult?.result) {
        try {
          const { buffer, mimeType } = imgResult.result
          const ext = mimeType.split("/")[1] || "png"
          const key = `studio/${upperCode || "sem-codigo"}/ai_bg_${Date.now()}_${i + 1}.${ext}`
          await r2.send(new PutObjectCommand({
            Bucket: BUCKET, Key: key, Body: buffer, ContentType: mimeType,
          }))
          image_url = `${PUBLIC_URL}/${key}`
        } catch (uploadErr: any) {
          console.warn(`[ai-generate] Falha ao subir imagem do conceito ${i + 1} pro R2:`, uploadErr.message)
          image_error = uploadErr.message
        }
      } else if (imgResult?.error) {
        console.warn(`[ai-generate] Falha ao gerar imagem do conceito ${i + 1} (seguindo só com o copy):`, imgResult.error)
        image_error = imgResult.error
      }

      return {
        id: `concept-${i + 1}`,
        style: raw.style,
        headline: raw.headline,
        subline: raw.subline,
        cta: raw.cta,
        image_url,
        ...(image_error ? { image_error } : {}),
      }
    })
  )

  await setJobStatus(jobId, { status: "done", concepts })
}
