// app/api/client/media-examples/activate/route.ts
// Cliente escolhe exemplos de mídia da biblioteca (vistos via GET
// /api/media-examples) e eles entram na playlist dele como mídia normal,
// marcada como content_source = 'exemplo' — distinguível de conteúdo
// enviado de verdade pelo dono, mas mapeada para a MESMA categoria de
// sorteio que 'dono' na query de playlist (ver
// app/api/client/playlist/[code]/route.ts), já que é conteúdo de
// preenchimento até o cliente subir o próprio.
import { NextRequest, NextResponse } from "next/server"
import { getPool } from "@/lib/db"
import { syncDonoMediaToUnified } from "@/lib/unifiedSync"

export const dynamic = "force-dynamic"

async function ensureCampaign(pool: any, code: string, clientName: string): Promise<string> {
  await pool.query(
    `INSERT INTO "Advertiser" (id, code, name, email, phone, "createdAt")
     VALUES (gen_random_uuid()::text, $1, $2, '', '', NOW())
     ON CONFLICT (code) DO NOTHING`,
    [code, clientName]
  )

  const { rows } = await pool.query(
    `SELECT id FROM "Campaign"
     WHERE "advertiserCode" = $1 AND name = 'Promoções da Loja'
     LIMIT 1`,
    [code]
  )
  if (rows.length > 0) return rows[0].id

  const { rows: newRows } = await pool.query(
    `INSERT INTO "Campaign"
       (id, "advertiserCode", name, status, "startDate", "endDate", budget, impressions, "createdAt")
     VALUES (gen_random_uuid()::text, $1, 'Promoções da Loja', 'active',
             NOW(), NOW() + INTERVAL '1 year', 0, 0, NOW())
     RETURNING id`,
    [code]
  )
  return newRows[0].id
}

export async function POST(req: NextRequest) {
  const pool = getPool()
  const body = await req.json()
  const code = String(body.code || "").toUpperCase()
  const exampleIds = Array.isArray(body.exampleIds) ? body.exampleIds : []

  if (!code) return NextResponse.json({ error: "code obrigatório" }, { status: 400 })
  if (exampleIds.length === 0) {
    return NextResponse.json({ error: "exampleIds obrigatório (array não vazio)" }, { status: 400 })
  }

  try {
    const client = await pool.query(
      `SELECT name FROM studio_clients WHERE code = $1 LIMIT 1`,
      [code]
    )
    if (!client.rows[0]) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 })
    }

    const examples = await pool.query(
      `SELECT id, name, type, url, duration FROM media_examples
       WHERE id = ANY($1) AND active = true`,
      [exampleIds]
    )
    if (examples.rows.length === 0) {
      return NextResponse.json({ error: "Nenhum exemplo de mídia válido encontrado" }, { status: 404 })
    }

    const campaignId = await ensureCampaign(pool, code, client.rows[0].name)

    const inserted: string[] = []
    for (const ex of examples.rows) {
      const res = await pool.query(
        `INSERT INTO "CampaignMedia"
           (id, "campaignId", name, type, url, status, content_source, "createdAt")
         VALUES (gen_random_uuid()::text, $1, $2, $3, $4, 'approved', 'exemplo', NOW())
         RETURNING id`,
        [campaignId, ex.name, ex.type, ex.url]
      )
      inserted.push(res.rows[0].id)

      // Sincroniza com a fundação unificada (Fase 1) — best-effort
      await syncDonoMediaToUnified(pool, {
        campaignId,
        ownerCode: code,
        mediaId: res.rows[0].id,
        name: ex.name,
        url: ex.url,
        type: ex.type,
        status: "approved",
        durationSeconds: ex.duration ?? 15,
      })
    }

    return NextResponse.json({ ok: true, activated: inserted.length, ids: inserted })
  } catch (err: any) {
    console.error("[client/media-examples/activate POST]", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
