// app/api/admin/institutional-media/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { getPool } from "@/lib/db"
import { removeInstitutionalFromUnified } from "@/lib/unifiedSync"
import { probeMp4 } from "@/lib/mp4-probe"

export const dynamic = "force-dynamic"

const MAX_VIDEO_DIMENSION    = 1920 // 1080p
const MAX_VIDEO_BITRATE_MBPS = 15

// Reativar um vídeo já existente (toggle ou edição) não passa pelo upload,
// então não passava pela checagem de resolução/bitrate — foi assim que o
// vídeo "Visagismo com Ale Zimermam" (4K, ~96MB/3min) voltou a circular em
// 02/07/2026 depois de já ter travado o T600 uma vez. Busca o arquivo do R2
// pela URL já salva e roda a mesma checagem antes de permitir active=true.
async function rejectIfVideoTooHeavy(id: string): Promise<NextResponse | null> {
  const pool = getPool()
  const { rows } = await pool.query(
    `SELECT type, url FROM institutional_media WHERE id = $1 LIMIT 1`,
    [id]
  )
  const row = rows[0]
  if (!row || row.type !== "video") return null

  try {
    const res = await fetch(row.url)
    if (!res.ok) return null // não conseguiu buscar — não bloqueia por engano
    const buffer = Buffer.from(await res.arrayBuffer())
    const info = probeMp4(buffer)
    if (!info) return null

    const maxDimension = Math.max(info.width, info.height)
    const avgBitrateMbps = info.durationSec > 0
      ? (buffer.length * 8) / 1_000_000 / info.durationSec
      : 0

    if (maxDimension > MAX_VIDEO_DIMENSION || avgBitrateMbps > MAX_VIDEO_BITRATE_MBPS) {
      return NextResponse.json({
        error: `Este vídeo está fora do padrão pra TVs (${info.width}x${info.height}, ~${avgBitrateMbps.toFixed(0)} Mbps) ` +
          `e não pode ser reativado sem recomprimir primeiro. Máximo: 1080p, 8 Mbps. Já causou travamento em 02/07/2026.`,
        video_too_heavy: true,
        detected: { width: info.width, height: info.height, bitrate_mbps: Math.round(avgBitrateMbps) },
      }, { status: 400 })
    }
    return null
  } catch (err) {
    console.error("[institutional-media PATCH] falha ao validar vídeo existente:", err)
    return null // erro na checagem não deve travar a operação
  }
}

async function checkAuth(req: NextRequest) {
  const session = await getServerSession()
  const secret = req.nextUrl.searchParams.get("secret")
  return !!session?.user || (secret && secret === process.env.ADMIN_SECRET)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAuth(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const { id } = await params
  const pool = getPool()
  try {
    const body = await req.json()

    // Toggle simples de ativo/inativo (uso existente, sem tocar no agendamento)
    if (Object.keys(body).length === 1 && "active" in body) {
      if (body.active) {
        const rejection = await rejectIfVideoTooHeavy(id)
        if (rejection) return rejection
      }

      const { rows } = await pool.query(
        `UPDATE institutional_media SET active = $1 WHERE id = $2 RETURNING id, active`,
        [!!body.active, id]
      )
      if (!rows[0]) return NextResponse.json({ error: "Item não encontrado" }, { status: 404 })

      // Sincroniza com a fundação unificada (Fase 1) — best-effort
      pool.query(
        `UPDATE placements_v2 SET active = $1
         WHERE source_table = 'institutional_media' AND source_id = $2`,
        [!!body.active, id]
      ).catch((e: any) => console.error("[unifiedSync] toggle active failed:", e))

      return NextResponse.json({ ok: true, ...rows[0] })
    }

    // Edição completa, incluindo agendamento — start_date/end_date continuam obrigatórios
    const { active, start_date, end_date, start_time, end_time, days_of_week } = body
    if (!start_date || !end_date) {
      return NextResponse.json({ error: "data de início e fim são obrigatórias" }, { status: 400 })
    }
    if (active) {
      const rejection = await rejectIfVideoTooHeavy(id)
      if (rejection) return rejection
    }
    const { rows } = await pool.query(
      `UPDATE institutional_media
       SET active = $1, start_date = $2, end_date = $3,
           start_time = $4, end_time = $5, days_of_week = $6
       WHERE id = $7
       RETURNING id, active, start_date, end_date, start_time, end_time, days_of_week`,
      [active ?? true, start_date, end_date, start_time || null, end_time || null,
       days_of_week && days_of_week.length ? days_of_week : null, id]
    )
    if (!rows[0]) return NextResponse.json({ error: "Item não encontrado" }, { status: 404 })

    // Sincroniza com a fundação unificada (Fase 1) — best-effort
    pool.query(
      `UPDATE placements_v2
       SET active = $1, start_date = $2, end_date = $3,
           start_time = $4, end_time = $5, days_of_week = $6
       WHERE source_table = 'institutional_media' AND source_id = $7`,
      [active ?? true, start_date, end_date, start_time || null, end_time || null,
       days_of_week && days_of_week.length ? days_of_week : null, id]
    ).catch((e: any) => console.error("[unifiedSync] edit schedule failed:", e))

    return NextResponse.json({ ok: true, ...rows[0] })
  } catch (err: any) {
    console.error("[admin/institutional-media/[id] PATCH]", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAuth(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const { id } = await params
  const pool = getPool()
  try {
    const { rows } = await pool.query(
      `DELETE FROM institutional_media WHERE id = $1 RETURNING id`,
      [id]
    )
    if (!rows[0]) return NextResponse.json({ error: "Item não encontrado" }, { status: 404 })

    // Sincroniza com a fundação unificada (Fase 1) — best-effort
    await removeInstitutionalFromUnified(pool, id)

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error("[admin/institutional-media/[id] DELETE]", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
