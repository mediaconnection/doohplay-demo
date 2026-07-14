// app/api/admin/screens/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { getPool } from "@/lib/db"

export const dynamic = "force-dynamic"

async function checkAuth(req: NextRequest, body?: any) {
  const session = await getServerSession()
  const secret = req.nextUrl.searchParams.get("secret") ?? body?.secret
  return !!session?.user || (secret && secret === process.env.ADMIN_SECRET)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  if (!(await checkAuth(req, body))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const pool = getPool()
  try {
    const { rows } = await pool.query(
      `UPDATE client_screens
       SET label = COALESCE($1, label), same_content = COALESCE($2, same_content)
       WHERE id = $3
       RETURNING id, label, same_content`,
      [body.label ?? null, body.same_content ?? null, id]
    )
    if (!rows[0]) return NextResponse.json({ error: "Tela não encontrada" }, { status: 404 })
    return NextResponse.json({ ok: true, ...rows[0] })
  } catch (err) {
    console.error("[admin/screens/[id] PATCH]", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

// Desvincula a tela (decomissionada/trocada de cliente). Fase 23
// (14/07/2026) — achado em teste real: a versão anterior só apagava
// client_screens, mas NUNCA resetava players.paired/player_code nem
// studio_clients.player_id. Resultado prático: o aparelho continuava
// achando que já estava pareado (respondia paired:true no
// /api/player/activate), então (a) o conteúdo do cliente antigo
// provavelmente continuava sendo exibido de verdade, e (b) não tinha
// como vincular de novo pelo fluxo normal — nem "Vincular" no admin (some
// da lista de pendentes porque paired continuava true) nem "Adicionar
// tela nova" do próprio cliente (exige paired=false pra reconhecer o
// código de ativação, e ainda geraria uma cobrança nova indevida).
// Corrigido: agora reseta o aparelho de verdade, e ele reaparece sozinho
// em "Dispositivos aguardando pareamento" — igual um aparelho novo.
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  if (!(await checkAuth(req))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const pool = getPool()
  try {
    // Busca client_code/player_id ANTES de apagar — precisa existir a
    // linha ainda pra saber quem avisar depois.
    const existing = await pool.query(
      `SELECT client_code, label, player_id FROM client_screens WHERE id = $1`,
      [id]
    )
    if (!existing.rows[0]) return NextResponse.json({ error: "Tela não encontrada" }, { status: 404 })
    const { client_code: clientCode, label, player_id: playerId } = existing.rows[0]

    // Achado em teste real (14/07/2026), corrigido em duas rodadas:
    // 1) faltava limpar placements_v2.screen_id e screen_templates.screen_id
    //    (FKs pra client_screens que eu não tinha mapeado na primeira
    //    passada, além de playlist_schedule que já era tratado).
    // 2) o Postgres checa FK NA HORA do DELETE, não depois — então essas
    //    limpezas precisam rodar ANTES do DELETE de client_screens, não
    //    depois (erro que cometi na primeira correção: pus o DELETE antes
    //    das limpezas, e continuou falhando exatamente igual).
    // Nenhuma dessas limpezas apaga conteúdo — só solta a referência à
    // tela removida (mesmo padrão já usado pra playlist_schedule).
    // (fleet_group_members também referencia client_screens, mas já tem
    // ON DELETE CASCADE — não precisa de tratamento manual.)
    await pool.query(`UPDATE playlist_schedule SET screen_id = NULL WHERE screen_id = $1`, [id])
    await pool.query(`UPDATE placements_v2 SET screen_id = NULL WHERE screen_id = $1`, [id])
    await pool.query(`UPDATE screen_templates SET screen_id = NULL WHERE screen_id = $1`, [id])

    await pool.query(`DELETE FROM client_screens WHERE id = $1`, [id])

    // Reseta o aparelho de verdade — sem isso ele fica "preso" achando que
    // ainda está pareado, sem aparecer em nenhuma lista de gerenciamento.
    await pool.query(
      `UPDATE players SET paired = false, paired_at = NULL, player_code = NULL WHERE id = $1`,
      [playerId]
    )
    // Só limpa studio_clients.player_id se ele ainda apontar pra ESTE
    // player — evita zerar por engano o ponteiro de uma tela diferente
    // do mesmo cliente (studio_clients tem só 1 player_id "principal").
    await pool.query(
      `UPDATE studio_clients SET player_id = NULL WHERE code = $1 AND player_id = $2`,
      [clientCode, playerId]
    )

    return NextResponse.json({ ok: true, removed: { client_code: clientCode, label } })
  } catch (err) {
    console.error("[admin/screens/[id] DELETE]", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
