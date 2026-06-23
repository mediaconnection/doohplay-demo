// app/api/admin/r2-cleanup/[code]/route.ts
// Lista (GET) e apaga (DELETE) arquivos no bucket R2 sob studio/<code>/.
// Criada porque o limite de mídias do plano é verificado direto no bucket
// (ver app/api/studio/upload/route.ts), não na tabela CampaignMedia — apagar
// linhas do banco NUNCA remove os arquivos físicos do R2, então é fácil ficar
// com "Conteúdo vazio" no dashboard mas o limite do plano continuar atingido.
import { NextRequest, NextResponse } from "next/server"
import { S3Client, ListObjectsV2Command, DeleteObjectsCommand } from "@aws-sdk/client-s3"

export const dynamic = "force-dynamic"

const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId:     process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

const BUCKET = "dooh-media"

function checkAuth(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret")
  return secret && secret === process.env.ADMIN_SECRET
}

function getCode(req: NextRequest) {
  const parts = req.nextUrl.pathname.split("/")
  const idx = parts.indexOf("r2-cleanup")
  return idx >= 0 ? parts[idx + 1].toUpperCase() : ""
}

// GET — lista os arquivos atuais no prefixo studio/<code>/, sem apagar nada.
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const code = getCode(req)
  if (!code) return NextResponse.json({ error: "código obrigatório" }, { status: 400 })

  try {
    const list = await r2.send(new ListObjectsV2Command({
      Bucket: BUCKET,
      Prefix: `studio/${code}/`,
    }))
    const files = (list.Contents || []).map(obj => ({
      key: obj.Key,
      size_kb: obj.Size ? Math.round(obj.Size / 1024) : 0,
      last_modified: obj.LastModified,
    }))
    return NextResponse.json({ code, count: files.length, files })
  } catch (err: any) {
    console.error("[admin/r2-cleanup GET]", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// DELETE — apaga TODOS os arquivos no prefixo studio/<code>/.
// Use com cautela: isso não verifica se o arquivo ainda está referenciado
// em CampaignMedia — rode a limpeza no banco primeiro (ou confirme que já
// está vazia) antes de chamar isso, para não apagar mídia que ainda está
// em uso. Exige ?confirm=APAGAR para evitar chamada acidental.
export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const code = getCode(req)
  if (!code) return NextResponse.json({ error: "código obrigatório" }, { status: 400 })

  const confirm = req.nextUrl.searchParams.get("confirm")
  if (confirm !== "APAGAR") {
    return NextResponse.json({
      error: "Confirmação necessária. Adicione &confirm=APAGAR na URL para executar a exclusão.",
    }, { status: 400 })
  }

  try {
    const list = await r2.send(new ListObjectsV2Command({
      Bucket: BUCKET,
      Prefix: `studio/${code}/`,
    }))
    const keys = (list.Contents || []).map(obj => obj.Key).filter(Boolean) as string[]

    if (keys.length === 0) {
      return NextResponse.json({ ok: true, deleted: 0, message: "Nenhum arquivo encontrado" })
    }

    await r2.send(new DeleteObjectsCommand({
      Bucket: BUCKET,
      Delete: { Objects: keys.map(k => ({ Key: k })) },
    }))

    return NextResponse.json({ ok: true, deleted: keys.length, keys })
  } catch (err: any) {
    console.error("[admin/r2-cleanup DELETE]", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
