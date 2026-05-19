"use client"

import { useEffect, useState } from "react"

type Alert = {
  id: number
  campaign_id: string
  type: string
  severity: "low" | "medium" | "high"
  message: string
  created_at: string
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/audit/alerts")
      .then(res => res.json())
      .then(data => setAlerts(data.alerts || []))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ padding: 40 }}>Loading alerts...</div>

  return (
    <div style={{ padding: 40 }}>
      <h1>🚨 Alert Dashboard</h1>

      {alerts.length === 0 && (
        <div>✅ No alerts</div>
      )}

      {alerts.map(alert => (
        <div
          key={alert.id}
          style={{
            padding: 15,
            marginBottom: 10,
            borderRadius: 8,
            background:
              alert.severity === "high"
                ? "#ffe6e6"
                : alert.severity === "medium"
                ? "#fff4e6"
                : "#f5f5f5"
          }}
        >
          <div>
            <strong>{alert.type}</strong>
          </div>

          <div>{alert.message}</div>

          <div style={{ fontSize: 12 }}>
            Campaign: {alert.campaign_id}
          </div>

          <div style={{ fontSize: 12 }}>
            {new Date(alert.created_at).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  )
}