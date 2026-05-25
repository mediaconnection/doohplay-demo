// @ts-nocheck
import { pool } from "@/lib/db"
import { Alert } from "./types"

const WINDOW_MINUTES = 15

type RecentAlertRow = {
  type: string
}

export async function shouldSendAlerts(
  campaignId: string,
  alerts: Alert[]
): Promise<Alert[]> {
  if (!alerts.length) return []

  const types = alerts.map((alert) => alert.type)

  const res = await pool.query(
    `
    SELECT type
    FROM audit_alerts
    WHERE campaign_id = $1
      AND type = ANY($2)
      AND created_at >= NOW() - INTERVAL '${WINDOW_MINUTES} minutes'
    `,
    [campaignId, types]
  )

  const rows = res.rows as RecentAlertRow[]
  const recentTypes = new Set(rows.map((row) => row.type))

  return alerts.filter((alert) => !recentTypes.has(alert.type))
}
