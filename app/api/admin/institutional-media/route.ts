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
import { probeMp4 } from "@/lib/mp4-probe"

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

// Upload de um arquivo (imagem/vídeo) pro R2, com a mesma validação de
// resolução/bitrate usada em todo upload institucional — reutilizado tanto
// pelo upload principal quanto pelo upload por zona de um slide-layout
// (Fase 9c). Lança erro com mensagem amigável se o vídeo for pesado demais.
async function uploadMediaFile(file: File): Promise<{ url: string; type: "image" | "video" }> {
  const isVideo = file.type.startsWith("video/")
  const isImage = file.type.startsWith("image/")
  if (!isVideo && !isImage) throw new Error("tipo de arquivo não suportado: " + file.name)

  const buffer = Buffer.from(await file.arrayBuffer())

  if (isVideo) {
    const info = probeMp4(buffer)
    if (info) {
      const maxDimension = Math.max(info.width, info.height)
      const avgBitrateMbps = info.durationSec > 0
        ? (buffer.length * 8) / 1_000_000 / info.durationSec
        : 0
      const MAX_VIDEO_DIMENSION    = 1920
      const MAX_VIDEO_BITRATE_MBPS = 15
      if (maxDimension > MAX_VIDEO_DIMENSION || avgBitrateMbps > MAX_VIDEO_BITRATE_MBPS) {
        throw new Error(
          `Vídeo "${file.name}" em resolução/qualidade alta demais para TVs (${info.width}x${info.height}, ~${avgBitrateMbps.toFixed(0)} Mbps). ` +
          `Recomprima para 1080p e até 8 Mbps antes de enviar.`
        )
      }
    }
  }

  const ext = isVideo ? "mp4" : (file.type.split("/")[1] || "jpg").replace("jpeg", "jpg")
  const key = `institucional/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  await r2.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: buffer, ContentType: file.type }))

  return { url: `${PUBLIC_URL}/${key}`, type: isVideo ? "video" : "image" }
}

// GET — lista todo conteúdo institucional, ativo e inativo
export async function GET(req: NextRequest) {
  if (!(await checkAuth(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const pool = getPool()
  const { rows } = await pool.query(
    `SELECT id, name, type, url, duration, position, active, created_at, display_format,
            start_date, end_date, start_time, end_time, days_of_week,
            layout_template_id, sequence_group, zone_content, segment_id
     FROM institutional_media ORDER BY position ASC, created_at DESC`
  )
  return NextResponse.json({ count: rows.length, items: rows })
}

// POST multipart/form-data — campos: file, name, duration, position (opcionais)
// start_date/end_date são OBRIGATÓRIOS (agendamento forçado desde 01/07/2026).
// days_of_week (CSV: "mon,tue,wed") e start_time/end_time (HH:MM) são opcionais
// — vazio/ausente = sem restrição (todos os dias / dia inteiro).
//
// content_type (Fase 9): 'media' (padrão, exige file) | 'layout' (exige
// layout_template_id, sem upload) | 'youtube' (exige youtube_url, sem
// upload). sequence_group (opcional, qualquer tipo): itens com o mesmo
// valor tocam em bloco, um atrás do outro, quando a vez do institucional
// chegar na rotação — "canal DOOHPLAY".
export async function POST(req: NextRequest) {
  if (!(await checkAuth(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

  try {
    const form = await req.formData()
    const contentType = String(form.get("content_type") || "media")
    const name = String(form.get("name") || "Institucional DOOHPLAY")
    const duration = Number(form.get("duration") || 15)
    const position = Number(form.get("position") || 0)
    const startDate = String(form.get("start_date") || "")
    const endDate = String(form.get("end_date") || "")
    const startTime = String(form.get("start_time") || "") || null
    const endTime = String(form.get("end_time") || "") || null
    const daysOfWeekRaw = String(form.get("days_of_week") || "")
    const daysOfWeek = daysOfWeekRaw ? daysOfWeekRaw.split(",").filter(Boolean) : null
    const displayFormatRaw = String(form.get("display_format") || "fullscreen")
    const displayFormat = displayFormatRaw === "shrink_lateral" ? "shrink_lateral" : "fullscreen"
    const sequenceGroup = String(form.get("sequence_group") || "").trim() || null
    // Canal DOOHPLAY (12/07/2026): vazio/ausente = institucional genérico
    // (5% do tempo, todas as telas — comportamento de sempre). Com um
    // segment_id válido (de inventory_segments_v2) = conteúdo do canal
    // daquele segmento (20% do tempo, só telas com business_type que bate).
    const segmentId = String(form.get("segment_id") || "").trim() || null

    if (!startDate || !endDate) {
      return NextResponse.json({ error: "data de início e fim são obrigatórias" }, { status: 400 })
    }
    if (startDate > endDate) {
      return NextResponse.json({ error: "data de início não pode ser depois da data de fim" }, { status: 400 })
    }

    const pool = getPool()

    // ── Slide-layout (N-zonas) — sem upload, só referencia um layout já criado ──
    if (contentType === "layout") {
      const layoutTemplateId = String(form.get("layout_template_id") || "")
      if (!layoutTemplateId) {
        return NextResponse.json({ error: "layout_template_id é obrigatório pra esse tipo" }, { status: 400 })
      }

      // Fase 9c — upload de um arquivo por zona de conteúdo (main_rotation/
      // ad_only), campos vindos como "zone_file_<zoneId>". Fica só a zona
      // que o admin realmente escolheu preencher; zona sem arquivo cai no
      // sorteio automático de sempre (comportamento antigo, preservado).
      const zoneContent: Record<string, { type: string; url: string; name: string }> = {}
      for (const [key, value] of form.entries()) {
        if (!key.startsWith("zone_file_") || !(value instanceof File)) continue
        const zoneId = key.slice("zone_file_".length)
        try {
          const uploaded = await uploadMediaFile(value)
          zoneContent[zoneId] = { type: uploaded.type, url: uploaded.url, name: value.name }
        } catch (zoneErr: any) {
          return NextResponse.json({ error: zoneErr.message }, { status: 400 })
        }
      }

      const res = await pool.query(
        `INSERT INTO institutional_media
           (id, name, type, url, duration, position, active, created_at,
            start_date, end_date, start_time, end_time, days_of_week, display_format,
            layout_template_id, sequence_group, zone_content, segment_id)
         VALUES (gen_random_uuid(), $1, 'layout', '', $2, $3, true, NOW(), $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         RETURNING id`,
        [name, duration, position, startDate, endDate, startTime, endTime, daysOfWeek, displayFormat,
         layoutTemplateId, sequenceGroup, Object.keys(zoneContent).length ? JSON.stringify(zoneContent) : null,
         segmentId]
      )
      return NextResponse.json({ ok: true, id: res.rows[0].id })
    }

    // ── YouTube — sem upload, só a URL do vídeo ──
    if (contentType === "youtube") {
      const youtubeUrl = String(form.get("youtube_url") || "").trim()
      if (!youtubeUrl) {
        return NextResponse.json({ error: "youtube_url é obrigatório pra esse tipo" }, { status: 400 })
      }
      const res = await pool.query(
        `INSERT INTO institutional_media
           (id, name, type, url, duration, position, active, created_at,
            start_date, end_date, start_time, end_time, days_of_week, display_format, sequence_group, segment_id)
         VALUES (gen_random_uuid(), $1, 'youtube', $2, $3, $4, true, NOW(), $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING id`,
        [name, youtubeUrl, duration, position, startDate, endDate, startTime, endTime, daysOfWeek, displayFormat, sequenceGroup, segmentId]
      )
      return NextResponse.json({ ok: true, id: res.rows[0].id })
    }

    // ── Imagem/vídeo (padrão, comportamento de sempre) ──
    const file = form.get("file") as File | null
    if (!file) return NextResponse.json({ error: "campo 'file' obrigatório" }, { status: 400 })

    let uploaded: { url: string; type: "image" | "video" }
    try {
      uploaded = await uploadMediaFile(file)
    } catch (uploadErr: any) {
      return NextResponse.json({ error: uploadErr.message, video_too_heavy: true }, { status: 400 })
    }
    const { url, type: mediaType } = uploaded

    const res = await pool.query(
      `INSERT INTO institutional_media
         (id, name, type, url, duration, position, active, created_at,
          start_date, end_date, start_time, end_time, days_of_week, display_format, sequence_group, segment_id)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, true, NOW(), $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING id`,
      [name, mediaType, url, duration, position,
       startDate, endDate, startTime, endTime, daysOfWeek, displayFormat, sequenceGroup, segmentId]
    )

    // Sincroniza com a fundação unificada (Fase 1) — best-effort
    await syncInstitutionalToUnified(pool, {
      mediaId: res.rows[0].id,
      name,
      displayFormat,
      url,
      type: mediaType,
      durationSeconds: duration,
      position,
      active: true,
      startDate, endDate, startTime, endTime, daysOfWeek,
      segmentId,
    })

    return NextResponse.json({ ok: true, id: res.rows[0].id, url })
  } catch (err: any) {
    console.error("[admin/institutional-media POST]", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
