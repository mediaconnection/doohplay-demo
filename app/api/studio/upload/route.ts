// app/api/studio/upload/route.ts
import { NextRequest, NextResponse } from "next/server"
import { S3Client, PutObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3"
import { getPool } from "@/lib/db"

export const dynamic     = "force-dynamic"
export const maxDuration = 60

// ── R2 Client ─────────────────────────────────────────────────────────────────
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

// ── Limites por tipo (tamanho de arquivo — não muda por plano) ────────────────
const SIZE_LIMITS = {
  image: {
    maxSize: 10 * 1024 * 1024,
    types:   ["image/jpeg", "image/png", "image/webp", "image/gif"],
    ext:     (mime: string) => mime.split("/")[1]?.replace("jpeg", "jpg") || "jpg",
  },
  video: {
    maxSize: 100 * 1024 * 1024,
    types:   ["video/mp4", "video/webm", "video/quicktime"],
    ext:     (_mime: string) => "mp4",
  },
}

// ── Limite de QUANTIDADE total de mídias (imagens + vídeos somados) por plano ──
// -1 significa ilimitado
const PLAN_MEDIA_LIMITS: Record<string, number> = {
  starter:  10,
  pro:      25,
  business: -1,
}
const DEFAULT_MEDIA_LIMIT = 10 // fallback se o cliente não tiver assinatura/plano identificado

function getFileCategory(mime: string): "image" | "video" | null {
  if (SIZE_LIMITS.image.types.includes(mime)) return "image"
  if (SIZE_LIMITS.video.types.includes(mime)) return "video"
  return null
}

async function getMediaLimit(pool: any, code: string): Promise<{ limit: number; plan: string | null }> {
  try {
    const { rows } = await pool.query(
      `SELECT plan FROM financial_subscriptions WHERE code = $1 AND status = 'ACTIVE' LIMIT 1`,
      [code]
    )
    const plan = rows[0]?.plan?.toLowerCase() ?? null
    const limit = plan && plan in PLAN_MEDIA_LIMITS ? PLAN_MEDIA_LIMITS[plan] : DEFAULT_MEDIA_LIMIT
    return { limit, plan }
  } catch (err) {
    console.warn("[upload] Não foi possível buscar plano:", err)
    return { limit: DEFAULT_MEDIA_LIMIT, plan: null }
  }
}

// ── Garante que existe Advertiser + Campaign padrão para o cliente ─────────────
async function ensureCampaign(pool: any, code: string, clientName: string): Promise<string> {
  await pool.query(
    `INSERT INTO "Advertiser" (id, code, name, email, phone, "createdAt")
     VALUES (gen_random_uuid()::text, $1, $2, '', '', NOW())
     ON CONFLICT (code) DO NOTHING`,
    [code, clientName]
  )

  const { rows } = await pool.query(
    `SELECT id FROM "Campaign"
     WHERE "advertiserCode" = $1 AND name = 'Promoções da Loja'
     LIMIT 1`,
    [code]
  )
  if (rows.length > 0) return rows[0].id

  const { rows: newRows } = await pool.query(
    `INSERT INTO "Campaign"
       (id, "advertiserCode", name, status, "startDate", "endDate", budget, impressions, "createdAt")
     VALUES (gen_random_uuid()::text, $1, 'Promoções da Loja', 'active',
             NOW(), NOW() + INTERVAL '1 year', 0, 0, NOW())
     RETURNING id`,
    [code]
  )
  return newRows[0].id
}

// ── POST — upload de arquivo ──────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file     = formData.get("file") as File | null
    const code     = (formData.get("code") as string)?.trim().toUpperCase()
    const name     = (formData.get("name") as string)?.trim() || "Promoção"
    const duration = parseInt((formData.get("duration") as string) || "15", 10)

    if (!file || !code) {
      return NextResponse.json({ error: "file e code obrigatórios" }, { status: 400 })
    }

    // ── Valida cliente ────────────────────────────────────────────────────────
    const pool = getPool()
    const clientRes = await pool.query(
      `SELECT id, name FROM studio_clients WHERE code = $1 AND active = true LIMIT 1`,
      [code]
    )
    if (!clientRes.rows[0]) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 })
    }
    const clientName: string = clientRes.rows[0].name

    // ── Valida tipo ───────────────────────────────────────────────────────────
    const category = getFileCategory(file.type)
    if (!category) {
      return NextResponse.json({
        error: "Formato inválido. Aceitos: JPG, PNG, WebP, GIF · MP4, WebM, MOV",
      }, { status: 400 })
    }

    const sizeLimit = SIZE_LIMITS[category]

    // ── Valida tamanho ────────────────────────────────────────────────────────
    if (file.size > sizeLimit.maxSize) {
      const maxMB = sizeLimit.maxSize / 1024 / 1024
      return NextResponse.json({
        error: `Arquivo muito grande. Máximo ${maxMB}MB para ${category === "image" ? "imagens" : "vídeos"}.`,
      }, { status: 400 })
    }

    // ── Valida quantidade TOTAL (imagens + vídeos) baseado no plano ───────────
    const { limit: mediaLimit, plan } = await getMediaLimit(pool, code)

    if (mediaLimit !== -1) {
      try {
        const list = await r2.send(new ListObjectsV2Command({
          Bucket: BUCKET,
          Prefix: `studio/${code}/`,
        }))
        const existingTotal = (list.Contents || []).filter(obj => {
          const key = obj.Key?.toLowerCase() || ""
          return /\.(jpg|jpeg|png|webp|gif|mp4|webm|mov)$/i.test(key)
        })
        if (existingTotal.length >= mediaLimit) {
          const planLabel = plan ? plan.charAt(0).toUpperCase() + plan.slice(1) : "atual"
          return NextResponse.json({
            error: `Limite de ${mediaLimit} mídias do plano ${planLabel} atingido.`,
            limit_reached: true,
            current_plan: plan,
            current_count: existingTotal.length,
            max_count: mediaLimit,
          }, { status: 400 })
        }
      } catch (listErr) {
        console.warn("[upload] Não foi possível verificar quantidade:", listErr)
      }
    }

    // ── Upload para R2 ────────────────────────────────────────────────────────
    const ext      = sizeLimit.ext(file.type)
    const fileName = `studio/${code}/${category}_${Date.now()}.${ext}`
    const buffer   = Buffer.from(await file.arrayBuffer())

    await r2.send(new PutObjectCommand({
      Bucket:      BUCKET,
      Key:         fileName,
      Body:        buffer,
      ContentType: file.type,
    }))

    const publicUrl = `${PUBLIC_URL}/${fileName}`

    // ── Salva no banco ────────────────────────────────────────────────────────
    try {
      const campaignId = await ensureCampaign(pool, code, clientName)

      await pool.query(
        `INSERT INTO "CampaignMedia" (id, "campaignId", name, type, url, status, "createdAt")
         VALUES (gen_random_uuid()::text, $1, $2, $3, $4, 'pending', NOW())`,
        [campaignId, name, category, publicUrl]
      )
    } catch (dbErr) {
      console.error("[upload] db error:", dbErr)
    }

    return NextResponse.json({
      ok:       true,
      url:      publicUrl,
      path:     fileName,
      category,
      size_mb:  +(file.size / 1024 / 1024).toFixed(2),
      warning:  category === "video" && file.size > 30 * 1024 * 1024
        ? "Vídeo grande — pode demorar para carregar na TV. Considere comprimir para menos de 30MB."
        : undefined,
    })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error("[upload] error:", message)
    return NextResponse.json({ error: "Erro interno: " + message }, { status: 500 })
  }
}

// ── GET — lista arquivos do cliente + limite do plano ────────────────────────
export async function GET(request: NextRequest) {
  try {
    const code = new URL(request.url).searchParams.get("code")?.toUpperCase()
    if (!code) return NextResponse.json({ error: "code obrigatório" }, { status: 400 })

    const pool = getPool()
    const { limit: mediaLimit, plan } = await getMediaLimit(pool, code)

    const list = await r2.send(new ListObjectsV2Command({
      Bucket: BUCKET,
      Prefix: `studio/${code}/`,
    }))

    const files  = list.Contents || []
    const images = files.filter(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f.Key || ""))
    const videos = files.filter(f => /\.(mp4|webm|mov)$/i.test(f.Key || ""))
    const total  = images.length + videos.length

    return NextResponse.json({
      plan,
      total: { count: total, max: mediaLimit === -1 ? null : mediaLimit, unlimited: mediaLimit === -1 },
      images: { count: images.length },
      videos: { count: videos.length },
      files:  files.map(f => ({
        name: f.Key?.split("/").pop(),
        size: f.Size,
        url:  `${PUBLIC_URL}/${f.Key}`,
      })),
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
