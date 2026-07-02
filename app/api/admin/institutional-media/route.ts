// app/api/admin/institutional-media/route.ts
// Conteúdo do próprio DOOHPLAY, exibido automaticamente em TODAS as telas
// da rede (categoria 'institucional' no sorteio ponderado, 10% do tempo —
// ver app/api/client/playlist/[code]/route.ts). Infraestrutura de leitura
// já existia (institutional_media), só faltava como gerenciar.
import { NextRequest, NextResponse } from "next/server"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { getServerSession } from "next-auth"
import { getPool } from "@/lib/db"
import { syncInstitutionalToUnified } from "@/lib/unifiedSync"

export const dynamic     = "force-dynamic"
export const maxDuration = 60

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

// GET — lista todo conteúdo institucional, ativo e inativo
export async function GET(req: NextRequest) {
  if (!(await checkAuth(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const pool = getPool()
  const { rows } = await pool.query(
    `SELECT id, name, type, url, duration, position, active, created_at,
            start_date, end_date, start_time, end_time, days_of_week
     FROM institutional_media ORDER BY position ASC, created_at DESC`
  )
  return NextResponse.json({ count: rows.length, items: rows })
}

// POST multipart/form-data — campos: file, name, duration, position (opcionais)
// start_date/end_date são OBRIGATÓRIOS (agendamento forçado desde 01/07/2026).
// days_of_week (CSV: "mon,tue,wed") e start_time/end_time (HH:MM) são opcionais
// — vazio/ausente = sem restrição (todos os dias / dia inteiro).
export async function POST(req: NextRequest) {
  if (!(await checkAuth(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

  try {
    const form = await req.formData()
    const file = form.get("file") as File | null
    const name = String(form.get("name") || "Institucional DOOHPLAY")
    const duration = Number(form.get("duration") || 15)
    const position = Number(form.get("position") || 0)
    const startDate = String(form.get("start_date") || "")
    const endDate = String(form.get("end_date") || "")
    const startTime = String(form.get("start_time") || "") || null
    const endTime = String(form.get("end_time") || "") || null
    const daysOfWeekRaw = String(form.get("days_of_week") || "")
    const daysOfWeek = daysOfWeekRaw ? daysOfWeekRaw.split(",").filter(Boolean) : null

    if (!file) return NextResponse.json({ error: "campo 'file' obrigatório" }, { status: 400 })
    if (!startDate || !endDate) {
      return NextResponse.json({ error: "data de início e fim são obrigatórias" }, { status: 400 })
    }
    if (startDate > endDate) {
      return NextResponse.json({ error: "data de início não pode ser depois da data de fim" }, { status: 400 })
    }

    const isVideo = file.type.startsWith("video/")
    const isImage = file.type.startsWith("image/")
    if (!isVideo && !isImage) {
      return NextResponse.json({ error: "tipo de arquivo não suportado" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const ext = isVideo ? "mp4" : (file.type.split("/")[1] || "jpg").replace("jpeg", "jpg")
    const key = `institucional/${Date.now()}.${ext}`

    await r2.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    }))

    const url = `${PUBLIC_URL}/${key}`

    const pool = getPool()
    const res = await pool.query(
      `INSERT INTO institutional_media
         (id, name, type, url, duration, position, active, created_at,
          start_date, end_date, start_time, end_time, days_of_week)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, true, NOW(), $6, $7, $8, $9, $10)
       RETURNING id`,
      [name, isVideo ? "video" : "image", url, duration, position,
       startDate, endDate, startTime, endTime, daysOfWeek]
    )

    // Sincroniza com a fundação unificada (Fase 1) — best-effort
    await syncInstitutionalToUnified(pool, {
      mediaId: res.rows[0].id,
      name,
      url,
      type: isVideo ? "video" : "image",
      durationSeconds: duration,
      position,
      active: true,
      startDate, endDate, startTime, endTime, daysOfWeek,
    })

    return NextResponse.json({ ok: true, id: res.rows[0].id, url })
  } catch (err: any) {
    console.error("[admin/institutional-media POST]", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
