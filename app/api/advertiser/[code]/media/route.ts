import { NextRequest } from "next/server"
import { getPool } from "@/lib/db"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { probeMp4 } from "@/lib/mp4-probe"

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

  // Orientação das telas selecionadas nesta campanha, pra avisar o
  // anunciante se o vídeo enviado não combina com a maioria das telas
  // (ex: vídeo vertical pra campanha majoritariamente em telas horizontais).
  const screensRes = await pool.query(
    `SELECT sc.screen_orientation
     FROM "CampaignScreen" cs
     JOIN studio_clients sc ON sc.code = cs."screenId"
     WHERE cs."campaignId" = $1`,
    [campaignId]
  ).catch(() => ({ rows: [] }))
  const orientations = screensRes.rows.map((r: any) => r.screen_orientation === "portrait" ? "portrait" : "landscape")
  const landscapeCount = orientations.filter((o: string) => o === "landscape").length
  const portraitCount = orientations.length - landscapeCount
  const dominantOrientation = portraitCount > landscapeCount ? "portrait" : "landscape"

  const uploaded = []
  const rejected: { name: string; reason: string }[] = []
  const warnings: { name: string; message: string }[] = []
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const isVideo = file.type.startsWith("video/")
    const isImage = file.type.startsWith("image/")
    if (!isVideo && !isImage) {
      rejected.push({ name: file.name, reason: "Formato não suportado" })
      continue
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer())

    // ── Valida resolução/bitrate de vídeo (mesma checagem do upload do dono) ──
    // Caso real: um vídeo de 4s em 4K a ~97 Mbps passou por aqui sem nenhuma
    // validação e travava o player em qualquer TV doméstica.
    if (isVideo) {
      const info = probeMp4(fileBuffer)
      if (info) {
        const maxDimension = Math.max(info.width, info.height)
        const avgBitrateMbps = info.durationSec > 0
          ? (fileBuffer.length * 8) / 1_000_000 / info.durationSec
          : 0
        if (maxDimension > 1920 || avgBitrateMbps > 15) {
          rejected.push({
            name: file.name,
            reason: `Resolução/qualidade alta demais para TVs (${info.width}x${info.height}, ~${avgBitrateMbps.toFixed(0)} Mbps). Recomprima para 1080p e até 8 Mbps.`,
          })
          continue
        }
        // Checagem de orientação — não bloqueia o upload, só avisa. Um
        // vídeo horizontal preenche mal uma tela vertical (e vice-versa),
        // mas isso é decisão do anunciante, não motivo pra rejeitar.
        if (orientations.length > 0) {
          const mediaOrientation = info.width >= info.height ? "landscape" : "portrait"
          if (mediaOrientation !== dominantOrientation) {
            warnings.push({
              name: file.name,
              message: `Este vídeo é ${mediaOrientation === "portrait" ? "vertical" : "horizontal"}, mas a maioria das telas selecionadas é ${dominantOrientation === "portrait" ? "vertical" : "horizontal"} — pode aparecer cortado ou com faixas pretas.`,
            })
          }
        }
      }
    }

    const ext = file.name.includes(".") ? (file.name.split(".").pop() ?? "jpg").toLowerCase() : "jpg"
    const fileType = isVideo ? "video" : "image"
    const key = "advertiser/" + code + "/" + fileType + "_" + Date.now() + "." + ext
    await s3.send(new PutObjectCommand({ Bucket: "dooh-media", Key: key, Body: fileBuffer, ContentType: file.type }))
    const url = (process.env.R2_PUBLIC_URL || "") + "/" + key
    const ins = await pool.query(`INSERT INTO "CampaignMedia" ("campaignId", name, type, url, status) VALUES ($1, $2, $3, $4, 'pending') RETURNING *`, [campaignId, file.name, fileType, url])
    uploaded.push(ins.rows[0])
  }
  return Response.json({ ok: true, uploaded, rejected, warnings }, { status: 201 })
}
