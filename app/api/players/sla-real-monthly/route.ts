export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

import { NextResponse } from "next/server"

import { pool } from "@/lib/db"

export const runtime = "nodejs"

const HEARTBEAT_TIMEOUT_SECONDS = 90

type PlayerRow = {
  id: string
}

type HeartbeatRow = {
  created_at: string | Date
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
  try {
    const now = new Date()

    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
      0,
      0,
      0,
      0
    )

    const totalMonthSeconds = Math.max(
      0,
      (now.getTime() - startOfMonth.getTime()) / 1000
    )

    const playersRes = await pool.query(
      `
      SELECT id::text AS id
      FROM public.players
      ORDER BY id::text ASC
      `
    )

    const players = playersRes.rows as PlayerRow[]
    let totalOnlineSeconds = 0

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
        [player.id, startOfMonth]
      )

      const heartbeats = heartbeatRes.rows as HeartbeatRow[]
      totalOnlineSeconds += calculateOnlineSeconds(heartbeats, now)
    }

    const totalPlayers = players.length
    const totalPossibleSeconds = totalMonthSeconds * totalPlayers

    const slaPercentage =
      totalPossibleSeconds > 0
        ? Number(((totalOnlineSeconds / totalPossibleSeconds) * 100).toFixed(2))
        : 0

    return NextResponse.json(
      {
        month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
          2,
          "0"
        )}`,
        slaPercentage,
        totalPlayers,
        totalOnlineSeconds,
        totalPossibleSeconds: Math.round(totalPossibleSeconds),
        generatedAt: new Date().toISOString()
      },
      {
        headers: {
          "Cache-Control": "no-store"
        }
      }
    )
  } catch (error) {
    console.error("MONTHLY_SLA_ROUTE_ERROR", error)

    return NextResponse.json(
      {
        error: "Erro ao calcular SLA mensal",
        detail: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
