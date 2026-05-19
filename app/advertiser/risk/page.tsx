"use client"

import { useEffect, useState } from "react"

export default function RiskDashboard() {
  const [clients, setClients] = useState<any[]>([])

  useEffect(() => {
    fetch("/api/analytics/risk/clients")
      .then(r => r.json())
      .then(d => setClients(d.clients))
  }, [])

  return (
    <div style={{ padding: 40 }}>
      <h1>📊 Risk Dashboard</h1>

      <table style={{ width: "100%", marginTop: 20 }}>
        <thead>
          <tr>
            <th>Client</th>
            <th>Trust</th>
            <th>Risk</th>
            <th>Events</th>
          </tr>
        </thead>

        <tbody>
          {clients.map(c => (
            <tr key={c.id}>
              <td>{c.name}</td>

              <td>{c.trust_score}</td>

              <td style={{
                color:
                  c.risk === "HIGH"
                    ? "red"
                    : c.risk === "MEDIUM"
                    ? "orange"
                    : "green"
              }}>
                {c.risk}
              </td>

              <td>{c.total_events}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}