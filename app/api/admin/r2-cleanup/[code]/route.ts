// app/api/admin/r2-cleanup/[code]/route.ts
// Lista (GET) os arquivos do bucket R2 sob studio/<code>/, dizendo quais
// ainda estão referenciados por alguma tabela que serve playlist.
//
// 11/10/2026: o DELETE desta rota foi REMOVIDO. Ele apagava TODOS os
// arquivos de studio/<code>/ numa chamada, sem checar se ainda estavam em
// uso, protegido só por ?secret= na URL (Documento-Mestre 12.62/12.63).
// Não há mais apagamento em massa de arquivos pelo sistema. O motivo
// original da rota (limite de mídia contado no bucket) deixou de existir:
// o limite é contado no banco (app/api/studio/upload/route.ts).
import { NextRequest, NextResponse } from "next/server"
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3"
import { getPool } from "@/lib/db"
import { requireAdminSession } from "../../_lib/requireAdmin"

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

// Tabelas cujo campo de URL pode apontar pra um arquivo do bucket.
const URL_SOURCES = [
  `SELECT url FROM creative_assets_v2 WHERE url LIKE $1`,
  `SELECT url FROM "CampaignMedia" WHERE url LIKE $1`,
  `SELECT url FROM network_media WHERE url LIKE $1`,
  `SELECT url FROM institutional_media WHERE url LIKE $1`,
  `SELECT url FROM media_examples WHERE url LIKE $1`,
]

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const auth = await requireAdminSession("admin/r2-cleanup GET")
  if (auth.denied) return auth.denied

  const { code: rawCode } = await params
  const code = rawCode?.toUpperCase()
  if (!code || !/^[A-Z0-9_]+$/.test(code)) {
    return NextResponse.json({ error: "código obrigatório" }, { status: 400 })
  }

  try {
    const prefix = `studio/${code}/`
    const list = await r2.send(new ListObjectsV2Command({ Bucket: BUCKET, Prefix: prefix }))

    const pool = getPool()
    const results = await Promise.all(URL_SOURCES.map(sql => pool.query(sql, [`%/${prefix}%`])))
    const referenced = new Set<string>()
    for (const res of results) {
      for (const row of res.rows) {
        const idx = String(row.url).indexOf(prefix)
        if (idx >= 0) referenced.add(String(row.url).slice(idx))
      }
    }

    const files = (list.Contents || []).map(obj => ({
      key: obj.Key,
      size_kb: obj.Size ? Math.round(obj.Size / 1024) : 0,
      last_modified: obj.LastModified,
      referenced: !!obj.Key && referenced.has(obj.Key),
    }))
    return NextResponse.json({
      code,
      count: files.length,
      referenced: files.filter(f => f.referenced).length,
      orphans: files.filter(f => !f.referenced).length,
      files,
    })
  } catch (err: any) {
    console.error("[admin/r2-cleanup GET]", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
