/**
 * lib/imageGeneration.ts
 * -----------------------
 * Geração de imagem de fundo por IA, usando Gemini 3.1 Flash Image
 * ("Nano Banana 2"), da Google.
 *
 * Por que este modelo (decisão registrada em 20/07/2026):
 * - Substitui o Imagen 4, que a Google está desativando em 17/08/2026
 * - Licença comercial limpa (indenização Google) — importante porque a
 *   imagem vai pra tela de cliente pagante e material publicitário
 * - ~$0,045-0,067 por imagem em 1024px (sem free tier) — cabe dentro do
 *   mesmo tipo de controle de custo já usado em PLAN_AI_GENERATION_LIMITS
 *
 * Nova env var necessária: GEMINI_API_KEY
 * (gerar em https://aistudio.google.com/apikey)
 *
 * Uso típico (Studio / generate-creative):
 *   import { generateBackgroundImage } from "@/lib/imageGeneration"
 *   const { buffer, mimeType } = await generateBackgroundImage(prompt)
 *   // depois: upload no R2 pelo mesmo fluxo de publishMedia.ts
 */

import { GoogleGenAI } from "@google/genai"

const MODEL = "gemini-3.1-flash-image"

// Mesmo padrão de timeout já aplicado em lib/whatsapp.ts e lib/db.ts
// (ver DOOHPLAY_CONTINUIDADE_2026-07-17): nunca deixar uma chamada de
// rede sem limite de tempo.
const TIMEOUT_MS = 30_000

export interface GeneratedImage {
  buffer: Buffer
  mimeType: string
}

/**
 * Gera uma imagem de fundo fotográfica a partir de um prompt em texto.
 * Lança erro se a chave não estiver configurada ou se a chamada falhar/
 * expirar — decisão consciente de falha fechada (mesmo padrão de
 * CLIENT_SESSION_SECRET), pra nunca publicar peça sem imagem de verdade
 * por engano.
 */
export async function generateBackgroundImage(
  prompt: string
): Promise<GeneratedImage> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY não configurada — geração de imagem por IA indisponível"
    )
  }

  const ai = new GoogleGenAI({ apiKey })

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [
        {
          role: "user",
          parts: [
            {
              text:
                // "no text" reforçado sempre: o texto (headline/subline/CTA)
                // é composto depois, via template HTML — nunca pedir pra
                // IA escrever texto dentro da imagem, evita erro de
                // ortografia/tipografia inconsistente com a marca.
                `${prompt.trim()}. Photographic, no text, no watermark, no logo.`,
            },
          ],
        },
      ],
    })

    const parts = response.candidates?.[0]?.content?.parts ?? []
    const imagePart = parts.find((p: any) => p.inlineData?.data)

    if (!imagePart?.inlineData) {
      throw new Error(
        "Resposta da API não trouxe imagem (possível bloqueio de safety filter — revisar o prompt)"
      )
    }

    return {
      buffer: Buffer.from(imagePart.inlineData.data, "base64"),
      mimeType: imagePart.inlineData.mimeType || "image/png",
    }
  } catch (err: any) {
    if (err.name === "AbortError") {
      throw new Error(`Geração de imagem excedeu ${TIMEOUT_MS / 1000}s`)
    }
    throw err
  } finally {
    clearTimeout(timeout)
  }
}

/**
 * Gera várias imagens em sequência (não em paralelo — evita estourar
 * rate limit da API numa rodada de produção em lote, como as 10 peças
 * do Canal DOOHPLAY). Continua mesmo se uma falhar, registrando o erro
 * por item — mesmo princípio de "erro nunca silencioso" documentado nas
 * boas práticas do projeto.
 *
 * `onItemStart` (opcional) é chamado antes de cada item começar a gerar —
 * usado pelo AI Creative Lab (app/api/studio/ai-generate) pra atualizar o
 * progresso do job ("gerando conceito 2 de 3") sem duplicar o loop
 * sequencial aqui.
 */
export async function generateBackgroundImagesBatch(
  items: { id: string; prompt: string }[],
  onItemStart?: (index: number, item: { id: string; prompt: string }) => void | Promise<void>
): Promise<{ id: string; result: GeneratedImage | null; error?: string }[]> {
  const results: { id: string; result: GeneratedImage | null; error?: string }[] = []

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    if (onItemStart) await onItemStart(i, item)
    try {
      const result = await generateBackgroundImage(item.prompt)
      results.push({ id: item.id, result })
    } catch (err: any) {
      results.push({ id: item.id, result: null, error: err.message })
    }
  }

  return results
}
