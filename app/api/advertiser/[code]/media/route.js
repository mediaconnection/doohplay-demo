// app/api/advertiser/[code]/media/route.ts
import { NextRequest } from "next/server"
import { getPool } from "@/lib/db"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"

export const dynamic = "force-dynamic"

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId:     process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || "https://pub-0ad4cd3201ce42198c5211fe201ff660.r2.dev"
const MAX_IMAGE_MB  = 10
const MAX_VIDEO_MB  = 100

// POST — upload de mídia para campanha do anunciante
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const pool = getPool()

  try {
    const formData   = await req.formData()
    const campaignId = formData.get("campaignId") as string
    const files      = formData.getAll("files") as File[]

    if (!campaignId) return Response.json({ error: "campaignId obrigatório" }, { status: 400 })
    if (!files || files.length === 0) return Response.json({ error: "Nenhum arquivo enviado" }, { status: 400 })

    // Verifica que a campanha pertence ao anunciante
    const { rows: camp } = await pool.query(
      `SELECT id FROM "Campaign" WHERE id = $1 AND "advertiserCode" = $2 LIMIT 1`,
      [campaignId, code.toUpperCase()]
    )
    if (!camp[0]) return Response.json({ error: "Campanha não encontrada" }, { status: 404 })

    const uploaded: any[] = []

    for (const file of files) {
      const isVideo = file.type.startsWith("video/")
      const isImage = file.type.startsWith("image/")
      if (!isVideo && !isImage) continue

      const maxMB = isVideo ? MAX_VIDEO_MB : MAX_IMAGE_MB
      if (file.size > maxMB * 1024 * 1024) {
        return Response.json({ error: `Arquivo ${file.name} excede ${maxMB}MB` }, { status: 400 })
      }

      const ext       = file.name.split(".").pop()?.toLowerCase() || (isVideo ? "mp4" : "jpg")
      const timestamp = Date.now()
      const key       = `advertiser/${code.toUpperCase()}/${isVideo ? "video" : "image"}_${timestamp}.${ext}`

      const buffer = Buffer.from(await file.arrayBuffer())
      await s3.send(new PutObjectCommand({
        Bucket:      "dooh-media",
        Key:         key,
        Body:        buffer,
        ContentType: file.type,
      }))

      const url = `${R2_PUBLIC_URL}/${key}`

      // Salva no banco como pending (aguarda aprovação admin)
      const { rows } = await pool.query(
        `INSERT INTO "CampaignMedia" ("campaignId", name, type, url, status)
         VALUES ($1, $2, $3, $4, 'pending')
         RETURNING *`,
        [campaignId, file.name, isVideo ? "video" : "image", url]
      )
      uploaded.push(rows[0])
    }

    return Response.json({ ok: true, uploaded }, { status: 201 })
  } catch (err) {
    console.error("[advertiser/media POST]", err)
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
