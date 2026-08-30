export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"

export const runtime = "nodejs"

type OfflinePlayer = {
  id: string | number
  name: string | null
  last_seen: string | Date | null
  platform: string | null
  device_type: string | null
}

function formatOfflineTime(lastSeen: string | Date | null, now: number) {
  if (!lastSeen) {
    return {
      secondsOffline: 0,
      offlineFormatted: "—"
    }
  }

  const lastSeenTime = new Date(lastSeen).getTime()

  if (Number.isNaN(lastSeenTime)) {
    return {
      secondsOffline: 0,
      offlineFormatted: "—"
    }
  }

  const secondsOffline = Math.max(0, Math.floor((now - lastSeenTime) / 1000))
  const minutes = Math.floor(secondsOffline / 60)
  const seconds = secondsOffline % 60

  return {
    secondsOffline,
    offlineFormatted: minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`
  }
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const { pool } = await import("@/lib/db")

  try {
    const result = await pool.query(
      `
      SELECT
        id,
        name,
        last_ping AS last_seen,
        platform,
        device_type
      FROM public.players
      WHERE last_ping IS NULL OR last_ping <= NOW() - INTERVAL '5 minutes'
      ORDER BY last_ping ASC NULLS FIRST
      `
    )

    const rows = result.rows as OfflinePlayer[]
    const now = Date.now()

    const players = rows.map((player) => {
      const offline = formatOfflineTime(player.last_seen, now)

      return {
        id: player.id,
        name: player.name ?? undefined,
        ip_address: undefined,
        version: player.platform ?? player.device_type ?? undefined,
        last_seen: player.last_seen,
        secondsOffline: offline.secondsOffline,
        offlineFormatted: offline.offlineFormatted
      }
    })

    return NextResponse.json({
      success: true,
      totalOffline: players.length,
      generatedAt: new Date().toISOString(),
      players
    })
  } catch (error) {
    console.error("PLAYERS_OFFLINE_ROUTE_ERROR", error)

    return NextResponse.json(
      {
        success: false,
        error: "Erro ao buscar offline",
        detail: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
