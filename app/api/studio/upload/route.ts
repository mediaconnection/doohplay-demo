// app/api/studio/upload/route.ts
import { NextRequest, NextResponse } from "next/server"
import { S3Client, PutObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3"
import { getPool } from "@/lib/db"
import { probeMp4 } from "@/lib/mp4-probe"
import { syncDonoMediaToUnified } from "@/lib/unifiedSync"

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
async function ensureCampaign(pool: any, code: string, clientName: string, clientPhone: string = "", clientEmail: string = ""): Promise<string> {
  await pool.query(
    `INSERT INTO "Advertiser" (id, code, name, email, phone, "createdAt")
     VALUES (gen_random_uuid()::text, $1, $2, $3, $4, NOW())
     ON CONFLICT (code) DO UPDATE SET
       phone = COALESCE(NULLIF("Advertiser".phone, ''), EXCLUDED.phone),
       email = COALESCE(NULLIF("Advertiser".email, ''), EXCLUDED.email)`,
    [code, clientName, clientEmail, clientPhone]
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
      `SELECT id, name, phone, email FROM studio_clients WHERE code = $1 AND active = true LIMIT 1`,
      [code]
    )
    if (!clientRes.rows[0]) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 })
    }
    const clientName: string = clientRes.rows[0].name
    const clientPhone: string = clientRes.rows[0].phone || ""
    const clientEmail: string = clientRes.rows[0].email || ""

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

    // ── Buffer do arquivo (necessário aqui já pra checar o vídeo antes de subir) ──
    const buffer = Buffer.from(await file.arrayBuffer())

    // ── Valida resolução/bitrate de vídeo ─────────────────────────────────────
    // Caso real: um cliente enviou um vídeo de 4 segundos em 3840x2160 (4K)
    // a ~97 Mbps — passava fácil no limite de 100MB de tamanho, mas nenhuma
    // TV doméstica decodifica isso em tempo real, travando o player.
    // MAX_VIDEO_DIMENSION e MAX_VIDEO_BITRATE_MBPS dão uma margem generosa
    // acima do recomendado pra sinalização digital (1080p, ~6-8 Mbps), sem
    // bloquear vídeos legítimos de boa qualidade.
    if (category === "video") {
      const info = probeMp4(buffer)
      if (info) {
        const maxDimension = Math.max(info.width, info.height)
        const avgBitrateMbps = info.durationSec > 0
          ? (buffer.length * 8) / 1_000_000 / info.durationSec
          : 0
        const MAX_VIDEO_DIMENSION    = 1920 // 1080p
        const MAX_VIDEO_BITRATE_MBPS = 15

        if (maxDimension > MAX_VIDEO_DIMENSION || avgBitrateMbps > MAX_VIDEO_BITRATE_MBPS) {
          return NextResponse.json({
            error: `Vídeo em resolução/qualidade alta demais para TVs (${info.width}x${info.height}, ~${avgBitrateMbps.toFixed(0)} Mbps). ` +
              `Recomprima para 1080p e até 8 Mbps antes de enviar — qualquer editor de vídeo ou conversor online faz isso facilmente.`,
            video_too_heavy: true,
            detected: { width: info.width, height: info.height, bitrate_mbps: Math.round(avgBitrateMbps) },
          }, { status: 400 })
        }
      }
      // Se não conseguimos ler os metadados (formato fora do esperado), deixa
      // passar — preferimos não bloquear um upload legítimo por engano.
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

    await r2.send(new PutObjectCommand({
      Bucket:      BUCKET,
      Key:         fileName,
      Body:        buffer,
      ContentType: file.type,
    }))

    const publicUrl = `${PUBLIC_URL}/${fileName}`

    // ── Salva no banco ────────────────────────────────────────────────────────
    try {
      const campaignId = await ensureCampaign(pool, code, clientName, clientPhone, clientEmail)

      const inserted = await pool.query(
        `INSERT INTO "CampaignMedia" (id, "campaignId", name, type, url, status, "createdAt")
         VALUES (gen_random_uuid()::text, $1, $2, $3, $4, 'pending', NOW())
         RETURNING id`,
        [campaignId, name, category, publicUrl]
      )

      // Sincroniza com a fundação unificada (Fase 1) — best-effort, não bloqueia o upload
      await syncDonoMediaToUnified(pool, {
        campaignId,
        ownerCode: code,
        mediaId: inserted.rows[0].id,
        name,
        url: publicUrl,
        type: category,
        status: "pending",
        durationSeconds: duration,
      })
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
