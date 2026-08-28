// app/api/studio/schedule-rule/route.ts
// Cria/atualiza ou remove uma regra de agendamento (schedule_rules) de um
// item de playlist do Studio. Antes disso, o SchedulerEditor.tsx escrevia
// direto no Supabase com a chave anônima, sem nenhuma checagem — qualquer
// um com a chave publica podia editar a playlist de qualquer cliente.
//
// Checagem de posse: mesmo padrão fraco (só o `code`) que /api/studio/auth
// já usa hoje — não é autenticação de verdade (não existe sessão real no
// fluxo Studio ainda, achado registrado em STATUS_PROJETO.md), mas fecha a
// porta de escrever direto no Supabase sem passar por aqui, e confirma que
// o item pertence ao playlist_id do cliente antes de mexer em qualquer coisa.
import { NextRequest, NextResponse } from "next/server"
import { getPool } from "@/lib/db"
import { supabaseServer } from "@/lib/supabase"

export const dynamic = "force-dynamic"

async function resolveClientPlaylistId(code: string): Promise<string | null> {
  const pool = getPool()
  const res = await pool.query(
    `SELECT playlist_id FROM studio_clients WHERE code = $1 AND active = true LIMIT 1`,
    [code.toUpperCase()]
  )
  return res.rows[0]?.playlist_id ?? null
}

async function assertItemBelongsToClient(playlistItemId: string, clientPlaylistId: string) {
  const { data, error } = await supabaseServer
    .from("playlist_items")
    .select("id, playlist_id")
    .eq("id", playlistItemId)
    .single()
  return !error && !!data && data.playlist_id === clientPlaylistId
}

export async function POST(req: NextRequest) {
  try {
    const { code, playlist_item_id, rule_id, days_of_week, time_start, time_end, priority } = await req.json()

    if (!code || !playlist_item_id) {
      return NextResponse.json({ error: "code e playlist_item_id obrigatórios" }, { status: 400 })
    }

    const clientPlaylistId = await resolveClientPlaylistId(code)
    if (!clientPlaylistId) return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 })

    if (!(await assertItemBelongsToClient(playlist_item_id, clientPlaylistId))) {
      return NextResponse.json({ error: "Item não pertence a este cliente" }, { status: 403 })
    }

    const { error: upsertError } = await supabaseServer
      .from("schedule_rules")
      .upsert({
        ...(rule_id ? { id: rule_id } : {}),
        playlist_item_id,
        days_of_week,
        time_start: `${time_start}:00`,
        time_end: `${time_end}:00`,
        priority: priority ?? 1,
        is_active: true,
        updated_at: new Date().toISOString(),
      }, { onConflict: "playlist_item_id" })

    if (upsertError) return NextResponse.json({ error: upsertError.message }, { status: 500 })

    await supabaseServer.from("playlist_items").update({ schedule_type: "scheduled" }).eq("id", playlist_item_id)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[studio/schedule-rule POST]", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { code, playlist_item_id, rule_id } = await req.json()

    if (!code || !playlist_item_id || !rule_id) {
      return NextResponse.json({ error: "code, playlist_item_id e rule_id obrigatórios" }, { status: 400 })
    }

    const clientPlaylistId = await resolveClientPlaylistId(code)
    if (!clientPlaylistId) return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 })

    if (!(await assertItemBelongsToClient(playlist_item_id, clientPlaylistId))) {
      return NextResponse.json({ error: "Item não pertence a este cliente" }, { status: 403 })
    }

    await supabaseServer.from("schedule_rules").delete().eq("id", rule_id)
    await supabaseServer.from("playlist_items").update({ schedule_type: "always" }).eq("id", playlist_item_id)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[studio/schedule-rule DELETE]", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
