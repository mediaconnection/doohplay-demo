// lib/publishMedia.ts
// Extraído de app/api/client/generate-creative/route.ts (12/07/2026) pra
// ser reaproveitado por app/api/studio/publish/route.ts sem duplicar ~150
// linhas de template HTML. generate-creative/route.ts NÃO foi tocado nesta
// mudança de propósito — já está testado e funcionando em produção, risco
// desnecessário mexer nele agora só por causa dessa extração.
import puppeteer from "puppeteer"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { Pool } from "pg"
import { syncDonoMediaToUnified } from "@/lib/unifiedSync"

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

// Paleta de cores por segmento — mesmas chaves de generate-creative/route.ts
export const SEGMENT_COLORS: Record<string, { primary: string; accent: string }> = {
  barbearia:  { primary: "#1a1a2e", accent: "#c9a227" },
  padaria:    { primary: "#8B4513", accent: "#F4A460" },
  salao:      { primary: "#6B0F6B", accent: "#FF69B4" },
  academia:   { primary: "#0D1B2A", accent: "#E63946" },
  restaurante:{ primary: "#1B4332", accent: "#F4A261" },
  default:    { primary: "#0F3460", accent: "#E94560" },
}

// Normaliza business_type em português ("Barbearia", "Salão de Beleza"...)
// pra uma das chaves de SEGMENT_COLORS. Mesmo cuidado do bug corrigido em
// /api/studio/ai-generate — não presumir que a chave bate sem normalizar.
export function segmentKeyFor(businessType: string | null | undefined): string {
  const t = (businessType || "").trim().toLowerCase()
  if (t.includes("barbearia")) return "barbearia"
  if (t.includes("salão") || t.includes("salao")) return "salao"
  if (t.includes("padaria")) return "padaria"
  if (t.includes("academia")) return "academia"
  if (t.includes("restaurante") || t.includes("lanchonete")) return "restaurante"
  return "default"
}

export function buildHtml(params: {
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

// Renderiza o HTML via Puppeteer e sobe pro R2 — retorna a URL pública.
export async function renderImageAndUpload(params: {
  code: string
  html: string
  orientation: "landscape" | "portrait"
}): Promise<string> {
  const { code, html, orientation } = params
  const w = orientation === "portrait" ? 1080 : 1920
  const h = orientation === "portrait" ? 1920 : 1080

  // Garante que o Chrome está instalado — no Render o cache não persiste
  // entre deploys (mesma checagem de generate-creative/route.ts).
  const { executablePath } = await import("puppeteer")
  const fs = await import("fs")
  const chromePath = (() => { try { return executablePath() } catch { return null } })()
  if (!chromePath || !fs.existsSync(chromePath)) {
    const { spawnSync } = await import("child_process")
    const result = spawnSync("npx", ["puppeteer", "browsers", "install", "chrome"], {
      stdio: "inherit", shell: true, cwd: "/opt/render/project/src",
    })
    if (result.status !== 0) throw new Error("Falha ao instalar Chrome: " + result.stderr)
  }

  const browser = await puppeteer.launch({ args: ["--no-sandbox", "--disable-setuid-sandbox"] })
  const page = await browser.newPage()
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 })
  await page.setContent(html, { waitUntil: "networkidle0" })
  const screenshot = await page.screenshot({ type: "png" })
  await browser.close()

  const key = `studio/${code.toUpperCase()}/published_${Date.now()}.png`
  await r2.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: screenshot as Buffer, ContentType: "image/png" }))
  return `${PUBLIC_URL}/${key}`
}

// Publica de verdade no sistema real que o player lê (mesmo pipeline de
// generate-creative/route.ts): Campaign -> CampaignMedia -> playlist_schedule
// -> sync pra fundação unificada (campaigns_v2/creative_assets_v2/placements_v2).
export async function publishToRealPlaylist(pool: Pool, params: {
  code: string
  name: string
  url: string
  type: "image" | "video" | "youtube"
  duration: number
}): Promise<{ mediaId: string }> {
  const { code, name, url, type, duration } = params
  const upperCode = code.toUpperCase()

  const campaignRes = await pool.query(
    `SELECT id FROM "Campaign" WHERE "advertiserCode" = $1 AND status = 'active' LIMIT 1`,
    [upperCode]
  )
  if (!campaignRes.rows[0]) {
    throw new Error("Nenhuma campanha ativa encontrada pra este cliente")
  }
  const campaignId = campaignRes.rows[0].id

  const mediaRes = await pool.query(
    `INSERT INTO "CampaignMedia" (id, "campaignId", name, type, url, status, "createdAt")
     VALUES (gen_random_uuid()::text, $1, $2, $3, $4, 'pending', NOW())
     RETURNING id`,
    [campaignId, name, type, url]
  )
  const mediaId = mediaRes.rows[0].id

  await pool.query(
    `INSERT INTO playlist_schedule (client_code, media_id, duration, active)
     VALUES ($1, $2, $3, true)
     ON CONFLICT (client_code, media_id) DO NOTHING`,
    [upperCode, mediaId, duration]
  )

  await syncDonoMediaToUnified(pool, {
    campaignId, ownerCode: upperCode, mediaId, name, url, type,
    status: "pending", durationSeconds: duration,
  })

  return { mediaId }
}
