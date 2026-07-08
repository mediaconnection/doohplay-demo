import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { getPool } from "@/lib/db"
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

async function checkAuth(req: NextRequest) {
  const session = await getServerSession()
  const secret = req.nextUrl.searchParams.get("secret")
  return !!session?.user || (secret && secret === process.env.ADMIN_SECRET)
}

// GET — audita os 4 prefixos conhecidos do bucket (studio/, network/,
// examples/, institucional/) contra as tabelas que deveriam referenciá-los,
// e lista qualquer arquivo real no R2 sem nenhum registro no banco
// apontando pra ele. SÓ LEITURA — não apaga nada sozinho. Existe porque a
// exclusão de mídia não limpava o R2 até a correção desta sessão, então
// pode haver arquivos órfãos acumulados de antes dessa correção.
export async function GET(req: NextRequest) {
  if (!(await checkAuth(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const pool = getPool()

  const PREFIX_TABLE_MAP: Array<{ prefix: string; table: string; urlCol: string }> = [
    { prefix: "studio/",       table: '"CampaignMedia"',   urlCol: "url" },
    { prefix: "network/",      table: "network_media",     urlCol: "url" },
    { prefix: "examples/",     table: "media_examples",    urlCol: "url" },
    { prefix: "institucional/", table: "institutional_media", urlCol: "url" },
  ]

  const orphans: any[] = []
  let totalScanned = 0
  let totalOrphanBytes = 0

  try {
    for (const { prefix, table, urlCol } of PREFIX_TABLE_MAP) {
      // Lista todos os arquivos reais no R2 sob esse prefixo (com paginação)
      const keys: { key: string; size: number; lastModified?: Date }[] = []
      let continuationToken: string | undefined
      do {
        const list = await r2.send(new ListObjectsV2Command({
          Bucket: BUCKET, Prefix: prefix, ContinuationToken: continuationToken,
        }))
        for (const obj of list.Contents || []) {
          if (obj.Key && obj.Key !== prefix) {
            keys.push({ key: obj.Key, size: obj.Size ?? 0, lastModified: obj.LastModified })
          }
        }
        continuationToken = list.IsTruncated ? list.NextContinuationToken : undefined
      } while (continuationToken)

      totalScanned += keys.length

      // URLs reais referenciadas no banco pra esse tipo de mídia
      const { rows } = await pool.query(`SELECT ${urlCol} AS url FROM ${table} WHERE ${urlCol} IS NOT NULL`)
      const referencedKeys = new Set(
        rows.map((r: any) => {
          const url = r.url as string
          const idx = url.indexOf(prefix)
          return idx >= 0 ? url.slice(idx) : null
        }).filter(Boolean)
      )

      for (const item of keys) {
        if (!referencedKeys.has(item.key)) {
          orphans.push({
            key: item.key,
            url: `${PUBLIC_URL}/${item.key}`,
            size_mb: +(item.size / 1024 / 1024).toFixed(2),
            last_modified: item.lastModified,
            prefix,
          })
          totalOrphanBytes += item.size
        }
      }
    }

    return NextResponse.json({
      total_scanned: totalScanned,
      total_orphans: orphans.length,
      total_orphan_mb: +(totalOrphanBytes / 1024 / 1024).toFixed(2),
      orphans: orphans.sort((a, b) => (b.last_modified || "").localeCompare(a.last_modified || "")),
      note: "Só leitura — nada foi apagado. Confira cada item antes de decidir excluir manualmente.",
    })
  } catch (err: any) {
    console.error("[admin/media-audit GET]", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
