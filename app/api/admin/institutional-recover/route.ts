// app/api/admin/institutional-recover/route.ts
// Somente leitura. Criada em 01/07/2026 após institutional_media ter sido
// esvaziada no banco (sem explicação confirmada, plano Free sem backup).
// Os arquivos em si sobrevivem no R2 mesmo com a linha do banco apagada —
// esta rota lista o que ainda existe sob o prefixo institucional/ pra
// permitir recriar as linhas manualmente. IMPORTANTE: o nome original de
// cada peça (ex: "Coca Cola") NÃO é recuperável — o upload salva o arquivo
// como institucional/<timestamp>.<ext>, sem preservar o nome digitado no
// admin. É preciso abrir a `url` de cada item e reconhecer visualmente.
import { NextRequest, NextResponse } from "next/server"
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3"

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

function checkAuth(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret")
  return secret && secret === process.env.ADMIN_SECRET
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

  try {
    const list = await r2.send(new ListObjectsV2Command({
      Bucket: BUCKET,
      Prefix: "institucional/",
    }))

    const files = (list.Contents || [])
      .filter(obj => obj.Key && obj.Key !== "institucional/")
      .map(obj => {
        const key = obj.Key as string
        const ext = key.split(".").pop()?.toLowerCase() || ""
        const isVideo = ["mp4", "mov", "webm"].includes(ext)
        // O timestamp usado como nome do arquivo é o momento exato do upload —
        // ajuda a saber a ordem em que as peças foram cadastradas.
        const tsMatch = key.match(/institucional\/(\d+)\./)
        const uploadedAt = tsMatch ? new Date(Number(tsMatch[1])).toISOString() : null

        return {
          key,
          url: `${PUBLIC_URL}/${key}`,
          type: isVideo ? "video" : "image",
          size_kb: obj.Size ? Math.round(obj.Size / 1024) : 0,
          uploaded_at: uploadedAt,
          last_modified_r2: obj.LastModified,
        }
      })
      .sort((a, b) => (a.uploaded_at || "").localeCompare(b.uploaded_at || ""))

    return NextResponse.json({
      count: files.length,
      files,
      note: "Abra cada 'url' pra reconhecer visualmente a peça — o nome original não sobrevive no arquivo.",
    })
  } catch (err: any) {
    console.error("[admin/institutional-recover GET]", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
