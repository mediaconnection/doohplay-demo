// app/api/client/network-media/[code]/route.ts
//
// Upload e listagem de mídia destinada ao Clube de Telas (rede de parceiros)
// — separada da mídia pessoal do dono (CampaignMedia), por decisão de produto
// já documentada: misturar os dois fluxos complicaria saber qual mídia vai
// pra qual rede.
import { NextRequest, NextResponse } from "next/server"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { getPool } from "@/lib/db"
import { probeMp4 } from "@/lib/mp4-probe"

export const dynamic = "force-dynamic"

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

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"]
const MAX_IMAGE_SIZE = 10 * 1024 * 1024
const MAX_VIDEO_SIZE = 100 * 1024 * 1024

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const pool = getPool()
  try {
    const { rows } = await pool.query(
      `SELECT id, name, type, url, status, created_at
       FROM network_media
       WHERE owner_code = $1
       ORDER BY created_at DESC`,
      [code.toUpperCase()]
    )
    return NextResponse.json({ media: rows })
  } catch (err) {
    console.error("[network-media GET]", err)
    return NextResponse.json({ media: [], error: String(err) }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const upperCode = code.toUpperCase()
  const pool = getPool()

  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const name = (formData.get("name") as string)?.trim() || "Conteúdo do Clube de Telas"

    if (!file) {
      return NextResponse.json({ error: "Arquivo obrigatório" }, { status: 400 })
    }

    const clientRes = await pool.query(
      `SELECT id FROM studio_clients WHERE code = $1 AND active = true LIMIT 1`,
      [upperCode]
    )
    if (!clientRes.rows[0]) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 })
    }

    const isImage = IMAGE_TYPES.includes(file.type)
    const isVideo = VIDEO_TYPES.includes(file.type)
    if (!isImage && !isVideo) {
      return NextResponse.json({
        error: "Formato inválido. Aceitos: JPG, PNG, WebP, GIF · MP4, WebM, MOV",
      }, { status: 400 })
    }

    const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE
    if (file.size > maxSize) {
      return NextResponse.json({
        error: `Arquivo muito grande. Máximo ${maxSize / 1024 / 1024}MB.`,
      }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    // ── Mesma validação de resolução/bitrate do upload pessoal ──
    if (isVideo) {
      const info = probeMp4(buffer)
      if (info) {
        const maxDimension = Math.max(info.width, info.height)
        const avgBitrateMbps = info.durationSec > 0
          ? (buffer.length * 8) / 1_000_000 / info.durationSec
          : 0
        if (maxDimension > 1920 || avgBitrateMbps > 15) {
          return NextResponse.json({
            error: `Vídeo em resolução/qualidade alta demais para TVs (${info.width}x${info.height}, ~${avgBitrateMbps.toFixed(0)} Mbps). ` +
              `Recomprima para 1080p e até 8 Mbps antes de enviar.`,
            video_too_heavy: true,
          }, { status: 400 })
        }
      }
    }

    const category = isVideo ? "video" : "image"
    const ext = isVideo ? "mp4" : (file.type.split("/")[1]?.replace("jpeg", "jpg") || "jpg")
    const fileName = `network/${upperCode}/${category}_${Date.now()}.${ext}`

    await r2.send(new PutObjectCommand({
      Bucket:      BUCKET,
      Key:         fileName,
      Body:        buffer,
      ContentType: file.type,
    }))

    const publicUrl = `${PUBLIC_URL}/${fileName}`

    const { rows } = await pool.query(
      `INSERT INTO network_media (id, owner_code, url, type, name, status, created_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, 'pending_review', NOW())
       RETURNING id, name, type, url, status, created_at`,
      [upperCode, publicUrl, category, name]
    )

    return NextResponse.json({ ok: true, media: rows[0] })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error("[network-media POST]", message)
    return NextResponse.json({ error: "Erro interno: " + message }, { status: 500 })
  }
}
