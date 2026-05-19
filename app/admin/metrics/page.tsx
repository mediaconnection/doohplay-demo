"use client"

import { useEffect, useState } from "react"

type Metrics = {
  counters: Record<string, number>
  histograms: Record<string, any>
  timestamp: string
}

export default function MetricsDashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)

  async function fetchMetrics() {
    const res = await fetch("/api/metrics")
    const data = await res.json()
    setMetrics(data)
  }

  useEffect(() => {
    fetchMetrics()

    const interval = setInterval(fetchMetrics, 3000) // 🔄 real-time
    return () => clearInterval(interval)
  }, [])

  if (!metrics) return <div>Loading metrics...</div>

  const { counters, histograms } = metrics

  return (
    <div style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>📊 DOOHPLAY Metrics Dashboard</h1>

      {/* =========================
         COUNTERS
      ========================= */}

      <h2>📈 Counters</h2>

      <div style={{ display: "flex", gap: 20 }}>

        <Card title="Events Received" value={counters.events_received || 0} />
        <Card title="Clients Blocked" value={counters.clients_blocked || 0} />
        <Card title="Jobs Processed" value={counters.jobs_processed || 0} />

      </div>

      {/* =========================
         HISTOGRAMS
      ========================= */}

      <h2 style={{ marginTop: 40 }}>⏱️ Performance</h2>

      {Object.entries(histograms).map(([key, h]) => (
        <div key={key} style={{ marginBottom: 20 }}>
          <h3>{key}</h3>
          <p>avg: {h.avg.toFixed(2)} ms</p>
          <p>min: {h.min} ms</p>
          <p>max: {h.max} ms</p>
          <p>count: {h.count}</p>
        </div>
      ))}

      {/* =========================
         TIMESTAMP
      ========================= */}

      <p style={{ marginTop: 40, color: "#666" }}>
        Last update: {metrics.timestamp}
      </p>
    </div>
  )
}

/* =========================
   COMPONENT
========================= */

function Card({ title, value }: { title: string; value: number }) {
  return (
    <div
      style={{
        padding: 20,
        border: "1px solid #ccc",
        borderRadius: 10,
        minWidth: 200
      }}
    >
      <h3>{title}</h3>
      <p style={{ fontSize: 28 }}>{value}</p>
    </div>
  )
}