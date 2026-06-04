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

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    let playlistId: string | null = null

    // --- Resolução via screen UUID ---
    if (screenParam) {
      const isUUID = /^[0-9a-f-]{36}$/i.test(screenParam)

      if (isUUID) {
        // screen_id direto
        const { data: screen, error } = await supabase
          .from("screens")
          .select("playlist_id")
          .eq("id", screenParam)
          .maybeSingle()

        if (error) throw new Error(error.message)
        playlistId = screen?.playlist_id ?? null

      } else {
        // player_code passado no param screen (bug do Fire Stick)
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

    // --- Resolução via code (player_code) ---
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
      return NextResponse.json({ items: [] })
    }

    // --- Buscar itens da playlist ---
    const { data: items, error: itemsError } = await supabase
      .from("playlist_items")
      .select("*")
      .eq("playlist_id", playlistId)
      .order("position", { ascending: true })

    if (itemsError) throw new Error(itemsError.message)

    return NextResponse.json({ items: items ?? [] })

  } catch (err: any) {
    console.error("PLAYER PLAYLIST ERROR:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
