import { pool } from "@/lib/db"
import { Alert } from "./types"

export async function saveAlerts(
  campaignId: string,
  alerts: Alert[]
) {
  if (!alerts.length) return

  const values = alerts.map(a => [
    campaignId,
    a.type,
    a.severity,
    a.message,
    JSON.stringify(a.metadata || {})
  ])

  const flat = values.flat()

  const placeholders = values
    .map((_, i) => {
      const idx = i * 5
      return `($${idx + 1}, $${idx + 2}, $${idx + 3}, $${idx + 4}, $${idx + 5})`
    })
    .join(",")

  await pool.query(
    `
    INSERT INTO audit_alerts (
      campaign_id,
      type,
      severity,
      message,
      metadata
    )
    VALUES ${placeholders}
    `,
    flat
  )
}