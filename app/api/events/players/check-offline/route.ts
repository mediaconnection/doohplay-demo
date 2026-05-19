import { NextResponse } from "next/server"

import { pool } from "@/lib/db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type OfflineCandidateRow = {
  id: string | number
}

export async function POST() {
  try {
    const threshold = new Date(Date.now() - 90 * 1000)

    const offlinePlayersRes = await pool.query(
      `
      SELECT id
      FROM public.players
      WHERE status = 'online'
        AND last_seen < $1
      `,
      [threshold]
    )

    const offlinePlayers = offlinePlayersRes.rows as OfflineCandidateRow[]
    const candidates = offlinePlayers.length

    if (candidates === 0) {
      return NextResponse.json({
        updated: 0,
        candidates: 0,
        message: "Nenhum player ficou offline."
      })
    }

    const updateRes = await pool.query(
      `
      UPDATE public.players
      SET status = 'offline'
      WHERE status = 'online'
        AND last_seen < $1
      `,
      [threshold]
    )

    return NextResponse.json({
      updated: updateRes.rowCount ?? candidates,
      candidates,
      message: "Players marcados como offline."
    })
  } catch (error) {
    console.error("CHECK_PLAYERS_OFFLINE_ROUTE_ERROR", error)

    return NextResponse.json(
      {
        error: "Erro ao verificar offline",
        detail: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}