/**
 * app/api/admin/resync-institutional/route.ts
 *
 * Fase 19 · passo 2 (14/07/2026): ferramenta pra reprocessar peças
 * institucionais tipo 'layout'/'youtube' criadas ANTES da correção do
 * sync (achado 14/07/2026: esses dois tipos gravavam em
 * institutional_media mas nunca chamavam syncInstitutionalToUnified —
 * ficavam configuradas no admin mas nunca tocavam na tela real).
 *
 * NÃO roda sozinha em lugar nenhum — precisa ser chamada manualmente
 * pelo admin. Mesmo padrão de /api/admin/migrate-extra-screens:
 *
 * GET  — simulação (dry-run). Lista o que SERIA sincronizado, sem
 *        gravar nada. Sempre rodar isso primeiro.
 * POST { confirm: true, ids?: string[] } — executa de verdade: chama
 *        syncInstitutionalToUnified pra cada item órfão encontrado
 *        (ou só os ids informados, se vier a lista).
 *
 * Critério de "órfão": existe em institutional_media mas não tem
 * nenhuma linha correspondente em placements_v2
 * (source_table='institutional_media' AND source_id = id::text).
 * Cobre tanto item nunca sincronizado quanto item cujo placement foi
 * apagado por algum motivo — reprocessar de novo não duplica (upsert
 * por source_table+source_id dentro de syncInstitutionalToUnified).
 */
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { getPool } from "@/lib/db"
import { syncInstitutionalToUnified } from "@/lib/unifiedSync"

export const dynamic = "force-dynamic"

async function checkAuth(req: NextRequest) {
  const session = await getServerSession()
  const secret = req.nextUrl.searchParams.get("secret")
  return !!session?.user || (secret && secret === process.env.ADMIN_SECRET)
}

async function findOrphans(pool: any, ids?: string[]) {
  const { rows } = await pool.query(
    `SELECT im.id, im.name, im.type, im.url, im.duration, im.position, im.active,
            im.start_date::text, im.end_date::text, im.start_time::text, im.end_time::text,
            im.days_of_week, im.display_format, im.layout_template_id, im.zone_content,
            im.sequence_group, im.segment_id, im.created_at
     FROM institutional_media im
     WHERE im.type IN ('layout', 'youtube')
       AND NOT EXISTS (
         SELECT 1 FROM placements_v2 p
         WHERE p.source_table = 'institutional_media' AND p.source_id = im.id::text
       )
       ${ids?.length ? "AND im.id::text = ANY($1::text[])" : ""}
     ORDER BY im.created_at ASC`,
    ids?.length ? [ids] : []
  )
  return rows
}

export async function GET(req: NextRequest) {
  if (!(await checkAuth(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const pool = getPool()
  try {
    const idsParam = req.nextUrl.searchParams.get("ids")
    const ids = idsParam ? idsParam.split(",").map(s => s.trim()).filter(Boolean) : undefined

    const orphans = await findOrphans(pool, ids)
    return NextResponse.json({
      dryRun: true,
      message: "Isso é uma simulação — nada foi alterado. Confira e chame com POST + confirm:true pra sincronizar de verdade.",
      count: orphans.length,
      items: orphans.map((o: any) => ({
        id: o.id,
        name: o.name,
        type: o.type,
        active: o.active,
        start_date: o.start_date,
        end_date: o.end_date,
        segment_id: o.segment_id,
        created_at: o.created_at,
      })),
    })
  } catch (err: any) {
    console.error("[admin/resync-institutional GET]", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!(await checkAuth(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const pool = getPool()
  try {
    const body = await req.json().catch(() => ({}))
    if (!body?.confirm) {
      return NextResponse.json({ error: "Chame com { confirm: true } pra executar de verdade. Use GET pra simular antes." }, { status: 400 })
    }
    const ids: string[] | undefined = Array.isArray(body.ids) && body.ids.length ? body.ids : undefined

    const orphans = await findOrphans(pool, ids)
    const results: { id: string; name: string; ok: boolean; error?: string }[] = []

    for (const o of orphans) {
      await syncInstitutionalToUnified(pool, {
        mediaId: o.id,
        name: o.name,
        url: o.url ?? "",
        type: o.type,
        durationSeconds: o.duration,
        position: o.position,
        active: o.active,
        startDate: o.start_date,
        endDate: o.end_date,
        startTime: o.start_time,
        endTime: o.end_time,
        daysOfWeek: o.days_of_week,
        displayFormat: o.display_format,
        segmentId: o.segment_id,
        layoutTemplateId: o.layout_template_id,
        zoneContent: o.zone_content,
        sequenceGroup: o.sequence_group,
      })

      // syncInstitutionalToUnified é "best-effort" — engole os próprios
      // erros e nunca lança exceção (por design, pra não derrubar upload).
      // Então só dá pra saber se funcionou de verdade conferindo se o
      // placement realmente existe agora, não com try/catch em volta dela.
      const check = await pool.query(
        `SELECT 1 FROM placements_v2 WHERE source_table = 'institutional_media' AND source_id = $1 LIMIT 1`,
        [o.id]
      )
      results.push({ id: o.id, name: o.name, ok: check.rows.length > 0 })
    }

    return NextResponse.json({
      ok: true,
      migrated: results.filter(r => r.ok).length,
      failed: results.filter(r => !r.ok).length,
      results,
    })
  } catch (err: any) {
    console.error("[admin/resync-institutional POST]", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
