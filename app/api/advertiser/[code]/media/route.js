// app/api/advertiser/[code]/media/route.ts
import { NextRequest } from "next/server"
import { getPool } from "@/lib/db"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"

export const dynamic = "force-dynamic"

const R2_ENDPOINT          = process.env.R2_ENDPOINT          || ""
const R2_ACCESS_KEY_ID     = process.env.R2_ACCESS_KEY_ID     || ""
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || ""
const R2_PUBLIC_URL        = process.env.R2_PUBLIC_URL        || "https://pub-0ad4cd3201ce42198c5211fe201ff660.r2.dev"

const s3 = new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId:     R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
})

const MAX_IMAGE_MB = 10
const MAX_VIDEO_MB = 100

function getCodeFromUrl(url: string): string {
  const parts = url.split("/")
  const idx = parts.indexOf("advertiser")
  if (idx === -1 || idx + 1 >= parts.length) return ""
  return parts[idx + 1].toUpperCase()
}

export async function POST(req: NextRequest) {
  const code = getCodeFromUrl(req.nextUrl.pathname)
  const pool = getPool()

  try {
    const formData   = await req.formData()
    const campaignId = formData.get("campaignId") as string
    const files      = formData.getAll("files") as File[]

    if (!campaignId) {
      return Response.json({ error: "campaignId obrigatorio" }, { status: 400 })
    }
    if (!files || files.length === 0) {
      return Response.json({ error: "Nenhum arquivo enviado" }, { status: 400 })
    }

    const campRes = await pool.query(
      `SELECT id FROM "Campaign" WHERE id = $1 AND "advertiserCode" = $2 LIMIT 1`,
      [campaignId, code]
    )
    if (!campRes.rows[0]) {
      return Response.json({ error: "Campanha nao encontrada" }, { status: 404 })
    }

    const uploaded = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const isVideo = file.type.startsWith("video/")
      const isImage = file.type.startsWith("image/")
      if (!isVideo && !isImage) continue

      const maxMB = isVideo ? MAX_VIDEO_MB : MAX_IMAGE_MB
      if (file.size > maxMB * 1024 * 1024) {
        return Response.json({ error: "Arquivo excede " + maxMB + "MB" }, { status: 400 })
      }

      const nameParts = file.name.split(".")
      const ext       = nameParts.length > 1 ? nameParts[nameParts.length - 1].toLowerCase() : (isVideo ? "mp4" : "jpg")
      const fileType  = isVideo ? "video" : "image"
      const key       = "advertiser/" + code + "/" + fileType + "_" + Date.now() + "." + ext
      const buffer    = Buffer.from(await file.arrayBuffer())

      await s3.send(new PutObjectCommand({
        Bucket:      "dooh-media",
        Key:         key,
        Body:        buffer,
        ContentType: file.type,
      }))

      const url = R2_PUBLIC_URL + "/" + key

      const insRes = await pool.query(
        `INSERT INTO "CampaignMedia" ("campaignId", name, type, url, status)
         VALUES ($1, $2, $3, $4, 'pending')
         RETURNING *`,
        [campaignId, file.name, fileType, url]
      )
      uploaded.push(insRes.rows[0])
    }

    return Response.json({ ok: true, uploaded }, { status: 201 })
  } catch (err) {
    console.error("[advertiser/media POST]", err)
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
