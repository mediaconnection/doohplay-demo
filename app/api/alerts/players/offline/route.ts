import { NextResponse } from "next/server"

import { ALERT_POLICIES } from "@/lib/alerts/alertPolicy"
import { openOrUpdateAlert } from "@/lib/alerts/openOrUpdateAlert"
import { pool } from "@/lib/db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type OfflinePlayerRow = {
  id: string
  last_seen: string | Date | null
  offline_seconds: number | string | null
}

function toNumber(value: unknown): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

export async function POST() {
  try {
    const policy = ALERT_POLICIES.PLAYER_OFFLINE

    const result = await pool.query(
      `
      SELECT
        id::text AS id,
        last_seen,
        EXTRACT(EPOCH FROM (now() - last_seen))::int AS offline_seconds
      FROM public.players
      WHERE last_seen IS NOT NULL
        AND last_seen < now() - interval '5 minutes'
      ORDER BY last_seen ASC
      LIMIT 500
      `
    )

    const offlinePlayers = result.rows as OfflinePlayerRow[]
    const alerts = []

    for (const player of offlinePlayers) {
      const offlineSeconds = toNumber(player.offline_seconds)

      if (offlineSeconds < (policy.threshold_seconds ?? 0)) {
        continue
      }

      const alert = await openOrUpdateAlert({
        type: policy.type,
        severity: policy.severity,
        sourceId: player.id,
        metadata: {
          player_id: player.id,
          last_seen: player.last_seen,
          offline_seconds: offlineSeconds
        }
      })

      alerts.push(alert)
    }

    return NextResponse.json({
      success: true,
      checked: offlinePlayers.length,
      alerts_created_or_updated: alerts.length,
      alerts
    })
  } catch (error) {
    console.error("OFFLINE_PLAYERS_ALERT_ROUTE_ERROR", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "INTERNAL_ERROR"
      },
      { status: 500 }
    )
  }
}