"use client"

import { useEffect, useState } from "react"
import {
  PieChart, Pie, Cell,
  LineChart, Line,
  BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts"

function Card({ title, children }: any) {
  return (
    <div style={card}>
      <h3>{title}</h3>
      {children}
    </div>
  )
}

const COLORS = ["#22c55e", "#f59e0b", "#ef4444"]

export default function TrustDashboard() {

  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {

    let interval: any

    async function fetchData() {
      try {
        const res = await fetch("/api/trust/summary")

        if (!res.ok) throw new Error("API error")

        const json = await res.json()

        setData(json)
        setError(null)

      } catch (err: any) {
        console.error(err)
        setError("Failed to load data")
      }
    }

    // 🔥 primeira carga
    fetchData()

    // 🔥 polling real-time
    interval = setInterval(fetchData, 10000)

    return () => clearInterval(interval)

  }, [])

  if (error) return <div style={{ padding: 40 }}>{error}</div>
  if (!data) return <div style={{ padding: 40 }}>Loading...</div>

  // 🔒 fallback seguro
  const distribution = data.distribution || { high: 0, medium: 0, low: 0 }

  const pieData = [
    { name: "High", value: distribution.high },
    { name: "Medium", value: distribution.medium },
    { name: "Low", value: distribution.low }
  ]

  const lineData = data.timeline || []

  const barData = [
    { name: "Valid", value: data.valid_ratio || 0 },
    { name: "Anchor", value: data.anchor_ratio || 0 },
    { name: "Chain", value: data.chain_ratio || 0 }
  ]

  return (
    <div style={page}>
      <div style={container}>

        <h1>📊 Trust Dashboard</h1>

        {/* 🔥 LIVE STATUS */}
        <p style={liveText}>
          🔄 Live updating every 10s
        </p>

        {data.updated_at && (
          <p style={timeText}>
            Last update: {new Date(data.updated_at).toLocaleTimeString()}
          </p>
        )}

        {/* 📊 PIE */}
        <Card title="Confidence Distribution">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name">
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* 📈 LINE */}
        <Card title="Trust Score Over Time">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={lineData}>
              <XAxis dataKey="day" />
              <YAxis domain={[0, 1]} />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#3b82f6" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* 📉 BAR */}
        <Card title="System Health">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <XAxis dataKey="name" />
              <YAxis domain={[0, 1]} />
              <Tooltip />
              <Bar dataKey="value" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* 🔗 BLOCKCHAIN STATUS */}
        <Card title="Blockchain Status">
          <p>Anchor Ratio: {(data.anchor_ratio * 100).toFixed(1)}%</p>
          <p>Global Score: {(data.global_score * 100).toFixed(1)}%</p>
        </Card>

      </div>
    </div>
  )
}

/* styles */

const page = {
  padding: 40,
  background: "#f6f8fb",
  minHeight: "100vh"
}

const container = {
  maxWidth: 1100,
  margin: "0 auto"
}

const card = {
  background: "#fff",
  borderRadius: 12,
  padding: 20,
  marginBottom: 20,
  boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
}

const liveText = {
  fontSize: 12,
  opacity: 0.7,
  marginBottom: 4
}

const timeText = {
  fontSize: 12,
  opacity: 0.5,
  marginBottom: 20
}