// app/api/client/media/[id]/screen/route.ts
// Atribui uma mídia a uma tela física específica (client_screens.id), ou
// limpa a atribuição (volta a aparecer em todas as telas do cliente).
// Rota separada do PATCH genérico de playlist pra evitar ambiguidade entre
// "campo não enviado" e "campo enviado como null pra limpar".
import { NextRequest, NextResponse } from "next/server"
import { getPool } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const pool = getPool()
  try {
    const { client_code, screen_id } = await req.json()
    if (!client_code) {
      return NextResponse.json({ error: "client_code obrigatório" }, { status: 400 })
    }

    // screen_id null/ausente = volta a aparecer em todas as telas.
    if (screen_id) {
      const screenCheck = await pool.query(
        `SELECT id FROM client_screens WHERE id = $1 AND client_code = $2 LIMIT 1`,
        [screen_id, client_code.toUpperCase()]
      )
      if (!screenCheck.rows[0]) {
        return NextResponse.json({ error: "Tela não encontrada para este cliente" }, { status: 404 })
      }
    }

    await pool.query(
      `INSERT INTO playlist_schedule (client_code, media_id, screen_id)
       VALUES ($1, $2, $3)
       ON CONFLICT (client_code, media_id) DO UPDATE SET screen_id = EXCLUDED.screen_id`,
      [client_code.toUpperCase(), id, screen_id ?? null]
    )

    // Sincroniza com a fundação unificada (placements_v2) — best-effort,
    // mesmo padrão já usado em app/api/client/playlist/[code]/route.ts PATCH
    // (que sincroniza position/active/agendamento pro mesmo source_id, mas
    // nunca incluiu screen_id). Achado 2026-09-02: essa rota nunca
    // sincronizava screen_id pra placements_v2, então o player (que lê
    // SEMPRE de placements_v2, não de playlist_schedule) nunca via a
    // atribuição de tela — toda mídia aparecia em toda tela do cliente,
    // mesmo configurada como conteúdo de uma tela específica. Sem sintoma
    // visível até hoje porque BARBE332/LEMEL186 têm só 1 tela cada.
    await pool.query(
      `UPDATE placements_v2
       SET screen_id = $1
       WHERE source_table = 'playlist_schedule' AND source_id = $2`,
      [screen_id ?? null, `${client_code.toUpperCase()}:${id}`]
    ).catch((e: any) => console.error("[unifiedSync] screen assignment sync failed:", e))

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[client/media/screen PATCH]", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
