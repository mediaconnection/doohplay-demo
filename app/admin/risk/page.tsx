"use client"

import { useEffect, useState } from "react"

type Client = {
  id: number
  name: string
  blocked_reason: string
  blocked_at: string
  risk_snapshot: any
}

export default function RiskDashboard() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchData() {
    const res = await fetch("/api/risk/blocked")
    const data = await res.json()
    setClients(data.data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  async function review(clientId: number, decision: "approved" | "rejected") {
    await fetch("/api/risk/review", {
      method: "POST",
      body: JSON.stringify({
        clientId,
        decision,
        reviewedBy: "admin@doohplay.com"
      })
    })

    fetchData()
  }

  if (loading) return <div>Loading...</div>

  return (
    <div style={{ padding: 40 }}>
      <h1>🚨 Risk Review Dashboard</h1>

      {clients.map((c) => {
        const risk = c.risk_snapshot

        return (
          <div
            key={c.id}
            style={{
              border: "1px solid #ccc",
              padding: 20,
              marginBottom: 20,
              borderRadius: 10
            }}
          >
            <h2>{c.name} (ID: {c.id})</h2>

            <p><b>Reason:</b> {c.blocked_reason}</p>
            <p><b>Blocked at:</b> {c.blocked_at}</p>

            <hr />

            <h3>📊 Risk</h3>
            <pre>{JSON.stringify(risk, null, 2)}</pre>

            <div style={{ marginTop: 10 }}>
              <button
                onClick={() => review(c.id, "approved")}
                style={{ marginRight: 10 }}
              >
                ✅ Approve (Unblock)
              </button>

              <button
                onClick={() => review(c.id, "rejected")}
              >
                ❌ Keep Blocked
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}