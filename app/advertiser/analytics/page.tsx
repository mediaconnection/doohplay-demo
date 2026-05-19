"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

/* =========================
   TYPES
========================= */

type DailyImpression = {
  date: string
  count: number
}

type Campaign = {
  id: string
  name: string
  impressions: number
  verified: number
  trust_score: number // 0–100
}

type Event = {
  id: string
  campaign: string
  status: "verified" | "pending" | "invalid"
}

type AnalyticsResponse = {
  success: boolean
  total_impressions: number
  verified_impressions: number
  anchored_impressions: number
  avg_trust_score: number
  daily_impressions: DailyImpression[]
  campaigns: Campaign[]
  recent_events: Event[]
}

/* =========================
   PAGE
========================= */

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [period, setPeriod] = useState("7d")
  const [campaignFilter, setCampaignFilter] = useState("all")

  useEffect(() => {
    fetchData()
  }, [period])

  async function fetchData() {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch(
        `/api/advertiser/analytics?period=${period}`
      )

      const json = await res.json()

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to load")
      }

      setData(json)

    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-10">Loading analytics...</div>
  }

  if (error) {
    return (
      <div className="p-10 text-red-600">
        ❌ {error}
      </div>
    )
  }

  if (!data) {
    return <div className="p-10">No data</div>
  }

  /* =========================
     FILTERED CAMPAIGNS
  ========================= */

  const campaigns =
    campaignFilter === "all"
      ? data.campaigns
      : data.campaigns.filter(c => c.id === campaignFilter)

  return (
    <div className="p-10 max-w-7xl mx-auto">

      <h1 className="text-3xl font-bold mb-8">
        Campaign Analytics
      </h1>

      {/* =========================
          FILTERS
      ========================= */}

      <div className="flex gap-4 mb-8">

        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
        </select>

        <select
          value={campaignFilter}
          onChange={(e) => setCampaignFilter(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="all">All Campaigns</option>

          {data.campaigns.map(c => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}

        </select>

      </div>

      {/* =========================
          STATS
      ========================= */}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">

        <Stat label="Total" value={format(data.total_impressions)} />
        <Stat label="Verified" value={format(data.verified_impressions)} />
        <Stat label="Anchored" value={format(data.anchored_impressions)} />
        <Stat label="Trust" value={`${data.avg_trust_score.toFixed(1)}%`} />

      </div>

      {/* =========================
          CHART
      ========================= */}

      <section className="mb-12">

        <h2 className="text-xl font-semibold mb-4">
          Impressions Trend
        </h2>

        <div className="border rounded p-6 h-80">

          {data.daily_impressions?.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.daily_impressions}>
                <XAxis dataKey="date" />
                <Tooltip />
                <Bar dataKey="count" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-gray-500">
              No data available
            </div>
          )}

        </div>

      </section>

      {/* =========================
          CAMPAIGNS
      ========================= */}

      <section className="mb-12">

        <h2 className="text-xl font-semibold mb-4">
          Campaign Performance
        </h2>

        <table className="w-full border rounded overflow-hidden">

          <thead className="bg-gray-100 text-sm">
            <tr>
              <th className="p-3 text-left">Campaign</th>
              <th className="p-3 text-left">Impressions</th>
              <th className="p-3 text-left">Verified</th>
              <th className="p-3 text-left">Trust Score</th>
            </tr>
          </thead>

          <tbody>

            {campaigns.map((c) => (
              <tr key={c.id} className="border-t text-sm">

                <td className="p-3">{c.name}</td>

                <td className="p-3">{format(c.impressions)}</td>

                <td className="p-3">{format(c.verified)}</td>

                <td className="p-3">
                  <TrustBar value={c.trust_score} />
                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </section>

      {/* =========================
          RECENT EVENTS
      ========================= */}

      <section>

        <h2 className="text-xl font-semibold mb-4">
          Recent Events
        </h2>

        <table className="w-full border rounded">

          <thead className="bg-gray-100 text-sm">
            <tr>
              <th className="p-3 text-left">Event</th>
              <th className="p-3 text-left">Campaign</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Proof</th>
            </tr>
          </thead>

          <tbody>

            {(data.recent_events || []).map((e) => (
              <tr key={e.id} className="border-t text-sm">

                <td className="p-3">{e.id}</td>

                <td className="p-3">{e.campaign}</td>

                <td className="p-3">
                  <StatusBadge status={e.status} />
                </td>

                <td className="p-3">
                  <Link
                    href={`/verify/${e.id}`}
                    className="text-blue-600 underline"
                  >
                    View Proof
                  </Link>
                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </section>

    </div>
  )
}

/* =========================
   COMPONENTS
========================= */

function Stat({ label, value }: any) {
  return (
    <div className="border rounded p-5">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors = {
    verified: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    invalid: "bg-red-100 text-red-700",
  }

  return (
    <span className={`px-2 py-1 rounded text-xs ${colors[status as keyof typeof colors]}`}>
      {status}
    </span>
  )
}

function TrustBar({ value }: { value: number }) {
  const percent = Math.min(Math.max(value, 0), 100)

  const color =
    percent >= 90
      ? "bg-green-500"
      : percent >= 70
      ? "bg-yellow-500"
      : "bg-red-500"

  return (
    <div className="w-32 bg-gray-200 h-3 rounded">
      <div
        className={`h-3 rounded ${color}`}
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}

/* =========================
   UTILS
========================= */

function format(value: number) {
  return new Intl.NumberFormat("en-US").format(value || 0)
}