// app/api/client/network-media/[code]/route.ts
//
// Upload e listagem de mídia destinada ao Clube de Telas (rede de parceiros)
// — separada da mídia pessoal do dono (CampaignMedia), por decisão de produto
// já documentada: misturar os dois fluxos complicaria saber qual mídia vai
// pra qual rede.
import { NextRequest, NextResponse } from "next/server"
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { getPool } from "@/lib/db"
import { probeMp4 } from "@/lib/mp4-probe"
import { verifyClientSessionToken, CLIENT_SESSION_COOKIE } from "@/lib/client-session"

// FIX (12/07/2026 — nível médio da varredura de segurança): DELETE e POST
// aqui só checavam que o `id`/arquivo pertencia ao `code` da URL, mas o
// `code` sozinho não é segredo (aparece em URL, prints, QR code) — então
// qualquer um sabendo o code de um cliente conseguia apagar ou subir mídia
// no Clube de Telas dele. GET continua aberto de propósito, mesmo padrão
// já usado em plan-usage/playlist (Fase 14).

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

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const upperCode = code.toUpperCase()

  const sessionCode = verifyClientSessionToken(req.cookies.get(CLIENT_SESSION_COOKIE)?.value)
  if (sessionCode !== upperCode) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  const pool = getPool()
  try {
    const { searchParams } = req.nextUrl
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 })

    // Só permite excluir mídia que pertence ao próprio dono.
    const { rows } = await pool.query(
      `DELETE FROM network_media WHERE id = $1 AND owner_code = $2 RETURNING url`,
      [id, upperCode]
    )
    if (!rows[0]) {
      return NextResponse.json({ error: "Mídia não encontrada" }, { status: 404 })
    }

    // Remove também qualquer distribuição já feita dessa mídia pros parceiros.
    await pool.query(`DELETE FROM network_media_distribution WHERE network_media_id = $1`, [id])

    // Tenta remover o arquivo do R2 também — não bloqueia a resposta se falhar
    // (preferimos um registro órfão no storage a uma exclusão que trava).
    try {
      const key = rows[0].url.split("/dooh-media/")[1] ?? rows[0].url.split(".dev/")[1] ?? rows[0].url.split(".br/")[1]
      if (key) await r2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }))
    } catch (e) {
      console.warn("[network-media DELETE] falha ao remover do R2 (ignorado):", e)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[network-media DELETE]", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const upperCode = code.toUpperCase()

  const sessionCode = verifyClientSessionToken(req.cookies.get(CLIENT_SESSION_COOKIE)?.value)
  if (sessionCode !== upperCode) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

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
