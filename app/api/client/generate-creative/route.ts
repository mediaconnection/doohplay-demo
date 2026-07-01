// app/api/client/generate-creative/route.ts
// Geração de criativo DOOH em 3 etapas:
// 1. Claude gera o copy (texto persuasivo) a partir do briefing do cliente
// 2. Copy é injetado num template HTML por segmento (barbearia, padaria, etc)
// 3. Puppeteer renderiza o HTML como PNG e envia pro R2 + playlist
import { NextRequest, NextResponse } from "next/server"
import puppeteer from "puppeteer"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { getPool } from "@/lib/db"

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
}) {
  const { title, subtitle, price, cta, primaryColor, accentColor, businessName, orientation } = params
  const w = orientation === "portrait" ? 1080 : 1920
  const h = orientation === "portrait" ? 1920 : 1080
  const titleSize  = orientation === "portrait" ? "72px" : "96px"
  const subSize    = orientation === "portrait" ? "42px" : "54px"
  const priceSize  = orientation === "portrait" ? "100px" : "130px"
  const ctaSize    = orientation === "portrait" ? "46px" : "58px"
  const nameSize   = orientation === "portrait" ? "36px" : "44px"

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
    const {
      code,
      product,    // ex: "Corte + Barba"
      price,      // ex: "R$ 45"
      detail,     // ex: "Válido essa semana"
      duration = 15,
      orientation = "landscape",
    } = await req.json()

    if (!code || !product) {
      return NextResponse.json({ error: "code e product são obrigatórios" }, { status: 400 })
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
    })

    const w = orientation === "portrait" ? 1080 : 1920
    const h = orientation === "portrait" ? 1920 : 1080

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
    const campaignRes = await pool.query(
      `SELECT c.id FROM "Campaign" c
       JOIN "Advertiser" a ON a.id = c."advertiserId"
       WHERE a.code = $1 AND c.status = 'active' LIMIT 1`,
      [code.toUpperCase()]
    )
    if (!campaignRes.rows[0]) {
      return NextResponse.json({ error: "Nenhuma campanha ativa encontrada pra este cliente" }, { status: 404 })
    }
    const campaignId = campaignRes.rows[0].id

    const mediaRes = await pool.query(
      `INSERT INTO "CampaignMedia"
         (id, "campaignId", name, type, url, status, "contentSource", "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), $1, $2, 'image', $3, 'pending', 'dono', NOW(), NOW())
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
