"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

/* =========================
   TYPES
========================= */

type DataPoint = {
  date: string
  trust: number | null
  events: number
}

export default function ClientDetail({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: clientId } = use(params)

  const [data, setData] = useState<DataPoint[]>([])
  const [forecast, setForecast] = useState<number[]>([])
  const [alerts, setAlerts] = useState<string[]>([])
  const [trend, setTrend] = useState<string>("")

  useEffect(() => {
    fetch(`/api/analytics/trust/timeline/${clientId}`)
      .then(r => r.json())
      .then(res => {
        setData(res.timeline)
        setForecast(res.forecast || [])
        setAlerts(res.alerts || [])
        setTrend(res.trend)
      })
  }, [clientId])

  /* =========================
     MERGE FORECAST
  ========================= */

  const chartData = [
    ...data,
    ...forecast.map((f, i) => ({
      date: `+${i + 1}`,
      trust: null,
      forecast: f,
    })),
  ]

  return (
    <main style={{ padding: 24 }}>
      <Link href="/advertiser/clients">← Back</Link>

      <h1>Client {clientId}</h1>

      {/* =========================
          ALERTS 🚨
      ========================= */}

      {alerts.length > 0 && (
        <div style={{
          background: "#ffe6e6",
          padding: 12,
          borderRadius: 8,
          marginBottom: 20
        }}>
          <strong>🚨 Alerts</strong>

          <ul>
            {alerts.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </div>
      )}

      {/* =========================
          TREND
      ========================= */}

      <p>
        Trend: {
          trend === "improving" ? "📈 Improving" :
          trend === "declining" ? "📉 Declining" :
          "➖ Stable"
        }
      </p>

      {/* =========================
          CHART
      ========================= */}

      <h2>📊 Trust + Forecast</h2>

      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <LineChart data={chartData}>
            <XAxis dataKey="date" />
            <YAxis domain={[0, 100]} />
            <Tooltip />

            {/* REAL */}
            <Line
              type="monotone"
              dataKey="trust"
              strokeWidth={2}
            />

            {/* FORECAST */}
            <Line
              type="monotone"
              dataKey="forecast"
              strokeDasharray="5 5"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </main>
  )
}