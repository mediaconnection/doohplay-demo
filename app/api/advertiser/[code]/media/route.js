import { NextRequest } from "next/server"
import { getPool } from "@/lib/db"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"

export const dynamic = "force-dynamic"

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT || "",
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
})

export async function POST(req: NextRequest) {
  const pool = getPool()
  const parts = req.nextUrl.pathname.split("/")
  const idx = parts.indexOf("advertiser")
  const code = idx >= 0 ? parts[idx + 1].toUpperCase() : ""
  const formData = await req.formData()
  const campaignId = formData.get("campaignId") as string
  const files = formData.getAll("files") as File[]
  if (!campaignId) return Response.json({ error: "campaignId obrigatorio" }, { status: 400 })
  if (!files.length) return Response.json({ error: "Nenhum arquivo" }, { status: 400 })
  const camp = await pool.query(`SELECT id FROM "Campaign" WHERE id = $1 AND "advertiserCode" = $2 LIMIT 1`, [campaignId, code])
  if (!camp.rows[0]) return Response.json({ error: "Campanha nao encontrada" }, { status: 404 })
  const uploaded = []
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const isVideo = file.type.startsWith("video/")
    const isImage = file.type.startsWith("image/")
    if (!isVideo && !isImage) continue
    const ext = file.name.includes(".") ? file.name.split(".").pop().toLowerCase() : "jpg"
    const fileType = isVideo ? "video" : "image"
    const key = "advertiser/" + code + "/" + fileType + "_" + Date.now() + "." + ext
    await s3.send(new PutObjectCommand({ Bucket: "dooh-media", Key: key, Body: Buffer.from(await file.arrayBuffer()), ContentType: file.type }))
    const url = (process.env.R2_PUBLIC_URL || "") + "/" + key
    const ins = await pool.query(`INSERT INTO "CampaignMedia" ("campaignId", name, type, url, status) VALUES ($1, $2, $3, $4, 'pending') RETURNING *`, [campaignId, file.name, fileType, url])
    uploaded.push(ins.rows[0])
  }
  return Response.json({ ok: true, uploaded }, { status: 201 })
}
