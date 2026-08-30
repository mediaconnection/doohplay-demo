export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"

export const runtime = "nodejs"

const HEARTBEAT_TIMEOUT_SECONDS = 90

type PlayerRow = {
  id: string
}

type HeartbeatRow = {
  created_at: string | Date
}

type PlayerSlaResult = {
  player_id: string
  sla: number
  onlineSeconds: number
}

function toDate(value: string | Date): Date | null {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function calculateOnlineSeconds(
  heartbeats: HeartbeatRow[],
  now: Date
): number {
  let onlineSeconds = 0

  for (let index = 0; index < heartbeats.length; index++) {
    const current = toDate(heartbeats[index].created_at)
    if (!current) continue

    const nextRow = heartbeats[index + 1]
    const next = nextRow ? toDate(nextRow.created_at) : null

    const end = next ?? now
    const diffSeconds = Math.max(
      0,
      (end.getTime() - current.getTime()) / 1000
    )

    onlineSeconds += Math.min(diffSeconds, HEARTBEAT_TIMEOUT_SECONDS)
  }

  return Math.round(onlineSeconds)
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const { pool } = await import("@/lib/db")

  try {
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)

    const now = new Date()

    const totalDaySeconds = Math.max(
      0,
      (now.getTime() - startOfDay.getTime()) / 1000
    )

    const playersRes = await pool.query(
      `
      SELECT id::text AS id
      FROM public.players
      ORDER BY id::text ASC
      `
    )

    const players = playersRes.rows as PlayerRow[]
    const results: PlayerSlaResult[] = []

    for (const player of players) {
      const heartbeatRes = await pool.query(
        `
        SELECT created_at
        FROM public.event_chain
        WHERE device_id::text = $1
          AND event_type = 'PLAYER_HEARTBEAT'
          AND created_at >= $2
        ORDER BY created_at ASC
        `,
        [player.id, startOfDay]
      )

      const heartbeats = heartbeatRes.rows as HeartbeatRow[]
      const onlineSeconds = calculateOnlineSeconds(heartbeats, now)

      const sla =
        totalDaySeconds > 0
          ? Number(((onlineSeconds / totalDaySeconds) * 100).toFixed(2))
          : 0

      results.push({
        player_id: player.id,
        sla,
        onlineSeconds
      })
    }

    results.sort(
      (a, b) => b.sla - a.sla || a.player_id.localeCompare(b.player_id)
    )

    return NextResponse.json(
      {
        players: results,
        summary: {
          totalPlayers: results.length,
          averageSla:
            results.length > 0
              ? Number(
                  (
                    results.reduce((sum, item) => sum + item.sla, 0) /
                    results.length
                  ).toFixed(2)
                )
              : 0
        },
        generatedAt: new Date().toISOString()
      },
      {
        headers: {
          "Cache-Control": "no-store"
        }
      }
    )
  } catch (error) {
    console.error("PLAYER_SLA_ROUTE_ERROR", error)

    return NextResponse.json(
      {
        error: "Erro ao calcular SLA por player",
        detail: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
