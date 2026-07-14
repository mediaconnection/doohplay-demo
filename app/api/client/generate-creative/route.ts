// app/api/client/generate-creative/route.ts
// Geração de criativo DOOH em 3 etapas:
// 1. Claude gera o copy (texto persuasivo) a partir do briefing do cliente
// 2. Copy é injetado num template HTML por segmento (barbearia, padaria, etc)
// 3. Puppeteer renderiza o HTML como PNG e envia pro R2 + playlist
import { NextRequest, NextResponse } from "next/server"
import puppeteer from "puppeteer"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { getPool } from "@/lib/db"
import { syncDonoMediaToUnified } from "@/lib/unifiedSync"
import { PLAN_AI_GENERATION_LIMITS, DEFAULT_AI_GENERATION_LIMIT, PlanKey } from "@/lib/asaas"

export const dynamic     = "force-dynamic"
export const maxDuration = 60

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

// ── Templates HTML por segmento ───────────────────────────────────────────
// Cada template recebe: title, subtitle, price, cta, primaryColor, accentColor
function buildHtml(params: {
  title: string
  subtitle: string
  price?: string
  cta: string
  primaryColor: string
  accentColor: string
  businessName: string
  orientation: "landscape" | "portrait"
  photoUrl?: string
}) {
  const { title, subtitle, price, cta, primaryColor, accentColor, businessName, orientation, photoUrl } = params
  const w = orientation === "portrait" ? 1080 : 1920
  const h = orientation === "portrait" ? 1920 : 1080
  const titleSize  = orientation === "portrait" ? "72px" : "96px"
  const subSize    = orientation === "portrait" ? "42px" : "54px"
  const priceSize  = orientation === "portrait" ? "100px" : "130px"
  const ctaSize    = orientation === "portrait" ? "46px" : "58px"
  const nameSize   = orientation === "portrait" ? "36px" : "44px"

  // Com foto: layout dividido (foto ocupa metade, texto na outra metade)
  // Sem foto: layout centralizado com gradiente de cor
  const hasPhoto = !!photoUrl

  if (hasPhoto) {
    const isPortrait = orientation === "portrait"
    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: ${w}px; height: ${h}px; overflow: hidden;
    font-family: 'Arial Black', 'Arial Bold', sans-serif;
    display: flex; flex-direction: ${isPortrait ? "column" : "row"};
  }
  .photo {
    ${isPortrait ? `width: 100%; height: 55%;` : `width: 52%; height: 100%;`}
    background-image: url("${photoUrl}");
    background-size: cover; background-position: center;
    position: relative;
  }
  .photo::after {
    content: ""; position: absolute; inset: 0;
    background: linear-gradient(${isPortrait ? "to bottom" : "to right"}, transparent 60%, ${primaryColor}ee);
  }
  .text-panel {
    ${isPortrait ? `width: 100%; height: 45%;` : `width: 48%; height: 100%;`}
    background: linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%);
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; padding: 48px; text-align: center; gap: 24px;
  }
  .business { font-size: ${nameSize}; color: rgba(255,255,255,0.7); letter-spacing: 3px; text-transform: uppercase; font-weight: 400; }
  .title { font-size: ${titleSize}; color: #fff; font-weight: 900; line-height: 1.1; }
  .subtitle { font-size: ${subSize}; color: rgba(255,255,255,0.85); font-weight: 400; line-height: 1.3; }
  .price { font-size: ${priceSize}; color: #fff; font-weight: 900; background: rgba(255,255,255,0.15); border: 3px solid rgba(255,255,255,0.4); border-radius: 20px; padding: 12px 40px; }
  .cta { font-size: ${ctaSize}; color: ${primaryColor}; font-weight: 900; background: #fff; border-radius: 100px; padding: 18px 48px; text-transform: uppercase; }
</style>
</head>
<body>
  <div class="photo"></div>
  <div class="text-panel">
    <div class="business">${businessName}</div>
    <div class="title">${title}</div>
    <div class="subtitle">${subtitle}</div>
    ${price ? `<div class="price">${price}</div>` : ""}
    <div class="cta">${cta}</div>
  </div>
</body>
</html>`
  }

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: ${w}px; height: ${h}px; overflow: hidden;
    background: linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}cc 60%, ${accentColor} 100%);
    font-family: 'Arial Black', 'Arial Bold', sans-serif;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    position: relative;
  }
  .bg-circle {
    position: absolute; border-radius: 50%;
    background: rgba(255,255,255,0.06);
  }
  .circle1 { width: ${w * 0.7}px; height: ${w * 0.7}px; top: -${w * 0.2}px; right: -${w * 0.15}px; }
  .circle2 { width: ${w * 0.45}px; height: ${w * 0.45}px; bottom: -${w * 0.1}px; left: -${w * 0.1}px; }
  .content {
    position: relative; z-index: 1;
    text-align: center; padding: ${orientation === "portrait" ? "80px" : "60px"};
    display: flex; flex-direction: column; align-items: center; gap: ${orientation === "portrait" ? "48px" : "36px"};
  }
  .business { font-size: ${nameSize}; color: rgba(255,255,255,0.7); letter-spacing: 4px; text-transform: uppercase; font-weight: 400; }
  .title { font-size: ${titleSize}; color: #ffffff; font-weight: 900; line-height: 1.1; text-shadow: 0 4px 20px rgba(0,0,0,0.3); }
  .subtitle { font-size: ${subSize}; color: rgba(255,255,255,0.85); font-weight: 400; line-height: 1.4; max-width: ${w * 0.7}px; }
  .price {
    font-size: ${priceSize}; color: #ffffff; font-weight: 900;
    background: rgba(255,255,255,0.15);
    border: 3px solid rgba(255,255,255,0.4);
    border-radius: 24px; padding: 16px 48px;
    text-shadow: 0 2px 10px rgba(0,0,0,0.2);
  }
  .cta {
    font-size: ${ctaSize}; color: ${primaryColor}; font-weight: 900;
    background: #ffffff; border-radius: 100px;
    padding: ${orientation === "portrait" ? "28px 80px" : "22px 64px"};
    letter-spacing: 1px; text-transform: uppercase;
    box-shadow: 0 8px 32px rgba(0,0,0,0.25);
  }
</style>
</head>
<body>
  <div class="bg-circle circle1"></div>
  <div class="bg-circle circle2"></div>
  <div class="content">
    <div class="business">${businessName}</div>
    <div class="title">${title}</div>
    <div class="subtitle">${subtitle}</div>
    ${price ? `<div class="price">${price}</div>` : ""}
    <div class="cta">${cta}</div>
  </div>
</body>
</html>`
}

// Paleta de cores por segmento
const SEGMENT_COLORS: Record<string, { primary: string; accent: string }> = {
  barbearia:  { primary: "#1a1a2e", accent: "#c9a227" },
  padaria:    { primary: "#8B4513", accent: "#F4A460" },
  salao:      { primary: "#6B0F6B", accent: "#FF69B4" },
  academia:   { primary: "#0D1B2A", accent: "#E63946" },
  restaurante:{ primary: "#1B4332", accent: "#F4A261" },
  default:    { primary: "#0F3460", accent: "#E94560" },
}

export async function POST(req: NextRequest) {
  const pool = getPool()
  try {
    // Aceita tanto JSON (sem foto) quanto multipart/form-data (com foto)
    let code: string, product: string, price: string, detail: string
    let duration = 15, orientation = "landscape"
    let photoUrl: string | undefined

    const ct = req.headers.get("content-type") || ""
    if (ct.includes("multipart/form-data")) {
      const form = await req.formData()
      code        = String(form.get("code") || "")
      product     = String(form.get("product") || "")
      price       = String(form.get("price") || "")
      detail      = String(form.get("detail") || "")
      duration    = Number(form.get("duration") || 15)
      orientation = String(form.get("orientation") || "landscape")

      // Upload da foto pro R2, pra Puppeteer poder carregar via URL pública
      const photoFile = form.get("photo") as File | null
      if (photoFile && photoFile.size > 0) {
        const photoBuffer = Buffer.from(await photoFile.arrayBuffer())
        const ext = photoFile.type.split("/")[1]?.replace("jpeg", "jpg") || "jpg"
        const photoKey = `studio/${code.toUpperCase()}/creative_photo_${Date.now()}.${ext}`
        await r2.send(new PutObjectCommand({
          Bucket: BUCKET, Key: photoKey, Body: photoBuffer, ContentType: photoFile.type,
        }))
        photoUrl = `${PUBLIC_URL}/${photoKey}`
      }
    } else {
      const body = await req.json()
      code        = body.code || ""
      product     = body.product || ""
      price       = body.price || ""
      detail      = body.detail || ""
      duration    = body.duration ?? 15
      orientation = body.orientation ?? "landscape"
    }

    if (!code || !product) {
      return NextResponse.json({ error: "code e product são obrigatórios" }, { status: 400 })
    }

    // Fase 17 (13/07/2026): mesma cota de geração por IA da rota do
    // Studio (app/api/studio/ai-generate) — achado numa sessão de teste:
    // esse endpoint (usado pelo modal "Enviar conteúdo" do dashboard
    // normal) também chama a Anthropic e tinha ficado de fora da cota
    // na primeira leva, furando o controle de custo pelo caminho errado.
    const upperCodeForQuota = code.toUpperCase()
    let aiLimit = DEFAULT_AI_GENERATION_LIMIT
    try {
      const subRes = await pool.query(
        `SELECT plan FROM financial_subscriptions WHERE code = $1 AND status = 'ACTIVE' LIMIT 1`,
        [upperCodeForQuota]
      )
      const planKey = subRes.rows[0]?.plan?.toLowerCase() as PlanKey | undefined
      if (planKey && planKey in PLAN_AI_GENERATION_LIMITS) {
        aiLimit = PLAN_AI_GENERATION_LIMITS[planKey]
      }
    } catch (err) {
      console.warn("[generate-creative] Não foi possível buscar plano:", err)
    }
    if (aiLimit !== -1) {
      const usageRes = await pool.query(
        `SELECT COUNT(*)::int AS count FROM ai_generation_log
         WHERE client_code = $1 AND created_at >= date_trunc('month', NOW())`,
        [upperCodeForQuota]
      )
      const used = usageRes.rows[0]?.count ?? 0
      if (used >= aiLimit) {
        return NextResponse.json({
          error: `Limite de ${aiLimit} gerações de IA este mês atingido pro seu plano. Fala com o suporte pra fazer upgrade.`,
          quotaExceeded: true, limit: aiLimit, used,
        }, { status: 429 })
      }
    }

    // Buscar dados reais do cliente pra contextualizar o copy
    const clientRes = await pool.query(
      `SELECT name, business_type FROM studio_clients WHERE code = $1 LIMIT 1`,
      [code.toUpperCase()]
    )
    if (!clientRes.rows[0]) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 })
    }
    const { name: businessName, business_type } = clientRes.rows[0]
    const niche = (business_type || "default").toLowerCase()

    // ── Etapa 1: Gerar copy com Claude (fetch direto, sem SDK) ──────────
    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 300,
        messages: [{
          role: "user",
          content: `Você é um especialista em criativo para sinalização digital (DOOH) em estabelecimentos brasileiros.
Gere um criativo CURTO e IMPACTANTE para uma tela de ${businessName} (${business_type || "estabelecimento"}).
Produto/serviço: ${product}
${price ? `Preço: ${price}` : ""}
${detail ? `Detalhe: ${detail}` : ""}

Responda SOMENTE em JSON válido, sem markdown, exatamente neste formato:
{"title":"TÍTULO CURTO EM MAIÚSCULAS (máx 4 palavras)","subtitle":"Frase complementar persuasiva (máx 10 palavras)","cta":"CHAMADA PARA AÇÃO (máx 3 palavras)"}

Use linguagem direta, brasileira e impactante. O título deve prender atenção em menos de 1 segundo.`
        }]
      })
    })
    const claudeData = await claudeRes.json()

    let copy: { title: string; subtitle: string; cta: string }
    try {
      const raw = claudeData.content?.[0]?.text ?? ""
      copy = JSON.parse(raw.replace(/```json|```/g, "").trim())
    } catch {
      copy = { title: product.toUpperCase(), subtitle: detail || businessName, cta: "APROVEITE" }
    }

    // ── Etapa 2: Renderizar HTML como PNG ───────────────────────────────
    const colors = SEGMENT_COLORS[niche] || SEGMENT_COLORS.default
    const html = buildHtml({
      title:        copy.title,
      subtitle:     copy.subtitle,
      price:        price || "",
      cta:          copy.cta,
      primaryColor: colors.primary,
      accentColor:  colors.accent,
      businessName: businessName.toUpperCase(),
      orientation:  orientation === "portrait" ? "portrait" : "landscape",
      photoUrl,
    })

    const w = orientation === "portrait" ? 1080 : 1920
    const h = orientation === "portrait" ? 1920 : 1080

    // Garante que o Chrome está instalado — no Render o cache não persiste
    // entre deploys. Usa o mesmo comando que funciona manualmente.
    const { executablePath } = await import("puppeteer")
    const fs = await import("fs")
    const chromePath = (() => { try { return executablePath() } catch { return null } })()
    if (!chromePath || !fs.existsSync(chromePath)) {
      console.log("[generate-creative] Chrome não encontrado, instalando…")
      const { spawnSync } = await import("child_process")
      const result = spawnSync("npx", ["puppeteer", "browsers", "install", "chrome"], {
        stdio: "inherit",
        shell: true,
        cwd: "/opt/render/project/src",
      })
      if (result.status !== 0) throw new Error("Falha ao instalar Chrome: " + result.stderr)
      console.log("[generate-creative] Chrome instalado")
    }

    const browser = await puppeteer.launch({ args: ["--no-sandbox", "--disable-setuid-sandbox"] })
    const page    = await browser.newPage()
    await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 })
    await page.setContent(html, { waitUntil: "networkidle0" })
    const screenshot = await page.screenshot({ type: "png" })
    await browser.close()

    // ── Etapa 3: Upload pro R2 + inserir na playlist ──────────────────
    const key = `studio/${code.toUpperCase()}/generated_${Date.now()}.png`
    await r2.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: screenshot,
      ContentType: "image/png",
    }))
    const url = `${PUBLIC_URL}/${key}`

    // Insere como CampaignMedia normal — mesmo fluxo de qualquer mídia do dono
    // Busca a campanha ativa do cliente — usa advertiserCode (campo real do schema,
    // confirmado na rota de playlist). Não precisa de JOIN com Advertiser.
    const campaignRes = await pool.query(
      `SELECT id FROM "Campaign" WHERE "advertiserCode" = $1 AND status = 'active' LIMIT 1`,
      [code.toUpperCase()]
    )
    if (!campaignRes.rows[0]) {
      return NextResponse.json({ error: "Nenhuma campanha ativa encontrada pra este cliente" }, { status: 404 })
    }
    const campaignId = campaignRes.rows[0].id

    const mediaRes = await pool.query(
      `INSERT INTO "CampaignMedia"
         (id, "campaignId", name, type, url, status, "createdAt")
       VALUES (gen_random_uuid()::text, $1, $2, 'image', $3, 'pending', NOW())
       RETURNING id`,
      [campaignId, `${copy.title} (gerado por IA)`, url]
    )
    const mediaId = mediaRes.rows[0].id

    // Registra duração no playlist_schedule
    await pool.query(
      `INSERT INTO playlist_schedule (client_code, media_id, duration, active)
       VALUES ($1, $2, $3, true)
       ON CONFLICT (client_code, media_id) DO NOTHING`,
      [code.toUpperCase(), mediaId, duration]
    )

    // Sincroniza com a fundação unificada (Fase 1) — best-effort
    await syncDonoMediaToUnified(pool, {
      campaignId,
      ownerCode: code.toUpperCase(),
      mediaId,
      name: `${copy.title} (gerado por IA)`,
      url,
      type: "image",
      status: "pending",
      durationSeconds: duration,
    })

    // Fase 17: registra o uso na cota — só depois que deu tudo certo
    // (copy gerado, imagem renderizada, salvo na playlist).
    pool.query(`INSERT INTO ai_generation_log (client_code) VALUES ($1)`, [upperCodeForQuota])
      .catch((err: unknown) => console.warn("[generate-creative] Falha ao logar uso (não bloqueia a resposta):", err))

    return NextResponse.json({
      ok: true,
      mediaId,
      url,
      copy,
      message: `Criativo "${copy.title}" gerado e adicionado à playlist!`,
    })

  } catch (err: any) {
    console.error("[generate-creative]", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
