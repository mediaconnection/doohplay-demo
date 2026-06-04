export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const screenParam = searchParams.get("screen")?.trim()
    const codeParam = searchParams.get("code")?.trim().toUpperCase()

    // Timestamp do cliente (permite fuso correto no player)
    const nowParam = searchParams.get("now")
    const now = nowParam ? new Date(nowParam).toISOString() : new Date().toISOString()

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    let playlistId: string | null = null

    // --- Resolução via screen UUID ou player_code ---
    if (screenParam) {
      const isUUID = /^[0-9a-f-]{36}$/i.test(screenParam)

      if (isUUID) {
        const { data: screen, error } = await supabase
          .from("screens")
          .select("playlist_id")
          .eq("id", screenParam)
          .maybeSingle()

        if (error) throw new Error(error.message)
        playlistId = screen?.playlist_id ?? null

      } else {
        // player_code no param screen
        const { data: player, error } = await supabase
          .from("players")
          .select("id")
          .eq("player_code", screenParam)
          .maybeSingle()

        if (error) throw new Error(error.message)

        if (player) {
          const { data: screen, error: se } = await supabase
            .from("screens")
            .select("playlist_id")
            .eq("player_id", player.id)
            .maybeSingle()

          if (se) throw new Error(se.message)
          playlistId = screen?.playlist_id ?? null
        }
      }
    }

    if (!playlistId && codeParam) {
      const { data: player, error } = await supabase
        .from("players")
        .select("id")
        .eq("player_code", codeParam)
        .maybeSingle()

      if (error) throw new Error(error.message)

      if (player) {
        const { data: screen, error: se } = await supabase
          .from("screens")
          .select("playlist_id")
          .eq("player_id", player.id)
          .maybeSingle()

        if (se) throw new Error(se.message)
        playlistId = screen?.playlist_id ?? null
      }
    }

    if (!playlistId) {
      return NextResponse.json({ items: [], scheduled: false })
    }

    // --- Buscar itens respeitando o scheduler ---
    // Usa a função SQL get_active_playlist_items que filtra
    // por horário e dia da semana automaticamente
    const { data: items, error: itemsError } = await supabase
      .rpc("get_active_playlist_items", {
        p_playlist_id: playlistId,
        p_now: now
      })

    if (itemsError) {
      // Fallback: se a função ainda não existir, retorna todos os itens
      console.warn("schedule_rpc_fallback:", itemsError.message)

      const { data: fallbackItems, error: fallbackError } = await supabase
        .from("playlist_items")
        .select("*")
        .eq("playlist_id", playlistId)
        .order("position", { ascending: true })

      if (fallbackError) throw new Error(fallbackError.message)

      return NextResponse.json({
        items: fallbackItems ?? [],
        scheduled: false,
        fallback: true
      })
    }

    // --- Buscar regras de agendamento ativas para metadata ---
    const itemIds = (items ?? []).map((i: any) => i.id)
    let scheduleMetadata: Record<string, any> = {}

    if (itemIds.length > 0) {
      const { data: rules } = await supabase
        .from("schedule_rules")
        .select("playlist_item_id, days_of_week, time_start, time_end, priority")
        .in("playlist_item_id", itemIds)
        .eq("is_active", true)

      if (rules) {
        for (const rule of rules) {
          scheduleMetadata[rule.playlist_item_id] = {
            days_of_week: rule.days_of_week,
            time_start: rule.time_start,
            time_end: rule.time_end,
            priority: rule.priority
          }
        }
      }
    }

    // --- Enriquecer items com info de agendamento ---
    const enrichedItems = (items ?? []).map((item: any) => ({
      ...item,
      schedule: scheduleMetadata[item.id] ?? null
    }))

    return NextResponse.json({
      items: enrichedItems,
      scheduled: true,
      evaluated_at: now,
      total_active: enrichedItems.length
    })

  } catch (err: any) {
    console.error("PLAYER PLAYLIST ERROR:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
