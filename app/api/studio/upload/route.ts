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

// ── Limites por plano ─────────────────────────────────────────────────────────
const LIMITS = {
  image: {
    maxSize:  10 * 1024 * 1024,  // 10MB
    maxCount: 20,
    types:    ["image/jpeg", "image/png", "image/webp", "image/gif"],
    ext:      (mime: string) => mime.split("/")[1]?.replace("jpeg", "jpg") || "jpg",
  },
  video: {
    maxSize:  100 * 1024 * 1024, // 100MB
    maxCount: 5,
    types:    ["video/mp4", "video/webm", "video/quicktime"],
    ext:      (_mime: string) => "mp4",
  },
}

function getFileCategory(mime: string): "image" | "video" | null {
  if (LIMITS.image.types.includes(mime)) return "image"
  if (LIMITS.video.types.includes(mime)) return "video"
  return null
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

    // ── Valida tipo ───────────────────────────────────────────────────────────
    const category = getFileCategory(file.type)
    if (!category) {
      return NextResponse.json({
        error: "Formato inválido. Aceitos: JPG, PNG, WebP, GIF · MP4, WebM, MOV",
      }, { status: 400 })
    }

    const limit = LIMITS[category]

    // ── Valida tamanho ────────────────────────────────────────────────────────
    if (file.size > limit.maxSize) {
      const maxMB = limit.maxSize / 1024 / 1024
      return NextResponse.json({
        error: `Arquivo muito grande. Máximo ${maxMB}MB para ${category === "image" ? "imagens" : "vídeos"}.`,
      }, { status: 400 })
    }

    // ── Valida quantidade ─────────────────────────────────────────────────────
    try {
      const list = await r2.send(new ListObjectsV2Command({
        Bucket: BUCKET,
        Prefix: `studio/${code}/`,
      }))
      const existing = (list.Contents || []).filter(obj => {
        const key = obj.Key?.toLowerCase() || ""
        if (category === "image") return /\.(jpg|jpeg|png|webp|gif)$/i.test(key)
        if (category === "video") return /\.(mp4|webm|mov)$/i.test(key)
        return false
      })
      if (existing.length >= limit.maxCount) {
        return NextResponse.json({
          error: `Limite de ${limit.maxCount} ${category === "image" ? "imagens" : "vídeos"} atingido.`,
        }, { status: 400 })
      }
    } catch (listErr) {
      console.warn("[upload] Não foi possível verificar quantidade:", listErr)
    }

    // ── Upload para R2 ────────────────────────────────────────────────────────
    const ext      = limit.ext(file.type)
    const fileName = `studio/${code}/${category}_${Date.now()}.${ext}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer      = Buffer.from(arrayBuffer)

    await r2.send(new PutObjectCommand({
      Bucket:      BUCKET,
      Key:         fileName,
      Body:        buffer,
      ContentType: file.type,
    }))

    const publicUrl = `${PUBLIC_URL}/${fileName}`

    // ── Salva no banco como CampaignMedia pendente ────────────────────────────
    try {
      const campRes = await pool.query(
        `SELECT id FROM "Campaign" WHERE "advertiserCode" = $1 AND name = 'Promoções da Loja' LIMIT 1`,
        [code]
      )

      let campaignId: string
      if (campRes.rows.length > 0) {
        campaignId = campRes.rows[0].id
      } else {
        const newCamp = await pool.query(
          `INSERT INTO "Campaign" (id, "advertiserCode", name, status, "startDate", "endDate", budget, impressions, "createdAt")
           VALUES (gen_random_uuid()::text, $1, 'Promoções da Loja', 'active', NOW(), NOW() + INTERVAL '1 year', 0, 0, NOW())
           RETURNING id`,
          [code]
        )
        campaignId = newCamp.rows[0].id
      }

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

// ── GET — lista arquivos do cliente ──────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const code = new URL(request.url).searchParams.get("code")?.toUpperCase()
    if (!code) return NextResponse.json({ error: "code obrigatório" }, { status: 400 })

    const list = await r2.send(new ListObjectsV2Command({
      Bucket: BUCKET,
      Prefix: `studio/${code}/`,
    }))

    const files  = list.Contents || []
    const images = files.filter(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f.Key || ""))
    const videos = files.filter(f => /\.(mp4|webm|mov)$/i.test(f.Key || ""))

    return NextResponse.json({
      images: { count: images.length, max: LIMITS.image.maxCount },
      videos: { count: videos.length, max: LIMITS.video.maxCount },
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
