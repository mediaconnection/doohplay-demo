"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts"

type CampaignStats = {
  total_plays?: number
  screens?: number
  impressions?: number
  failures?: number
}

type CampaignPlayer = {
  id: string
  name?: string | null
  hostname?: string | null
  screen_name?: string | null
  status?: string | null
  last_seen?: string | null
  plays?: number
  impressions?: number
  failures?: number
}

type PlaysByHour = {
  hour: string
  plays: number
}

type PlaysByScreen = {
  name: string
  plays: number
}

type TimelineEvent = {
  event_id: string
  event_type: string
  occurred_at: string
  screen_name?: string | null
}

type CampaignData = {
  stats?: CampaignStats
  players?: CampaignPlayer[]
  plays_by_hour?: PlaysByHour[]
  plays_by_screen?: PlaysByScreen[]
  timeline?: TimelineEvent[]
  error?: string
}

function safeString(value: unknown): string | null {
  if (typeof value !== "string") return null

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function getCampaignId(params: ReturnType<typeof useParams>): string | null {
  if (!params) return null

  const value = params.campaign_id

  if (Array.isArray(value)) {
    return safeString(value[0])
  }

  return safeString(value)
}

function getDefaultPeriod() {
  const end = new Date()
  const start = new Date(end)

  start.setDate(end.getDate() - 30)

  return {
    start: start.toISOString(),
    end: end.toISOString()
  }
}

function displayPlayerName(player: CampaignPlayer): string {
  return (
    player.name ||
    player.hostname ||
    player.screen_name ||
    player.id ||
    "Unknown Player"
  )
}

export default function CampaignPage() {
  const params = useParams()
  const campaignId = getCampaignId(params)

  const [data, setData] = useState<CampaignData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const resolvedCampaignId = safeString(campaignId)

    if (!resolvedCampaignId) {
      setError("Campaign ID inválido")
      setLoading(false)
      return
    }

    const campaignIdForRequest: string = resolvedCampaignId
    const controller = new AbortController()
    const { start, end } = getDefaultPeriod()

    async function load() {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch(
          `/api/audit/campaign/${encodeURIComponent(
            campaignIdForRequest
          )}?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`,
          {
            cache: "no-store",
            signal: controller.signal
          }
        )

        const json = (await res.json().catch(() => null)) as CampaignData | null

        if (!res.ok) {
          throw new Error(json?.error || `CAMPAIGN_FETCH_FAILED_${res.status}`)
        }

        setData(json)
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return

        setError(err instanceof Error ? err.message : "Erro ao carregar campanha")
      } finally {
        setLoading(false)
      }
    }

    void load()

    return () => controller.abort()
  }, [campaignId])

  const resolvedCampaignId = safeString(campaignId)

  if (!resolvedCampaignId) {
    return <div style={{ padding: 40 }}>Campaign ID inválido.</div>
  }

  if (loading) {
    return <div style={{ padding: 40 }}>Loading campaign...</div>
  }

  if (error) {
    return <div style={{ padding: 40, color: "crimson" }}>{error}</div>
  }

  const players: CampaignPlayer[] = data?.players ?? []
  const playsByHour: PlaysByHour[] = data?.plays_by_hour ?? []
  const playsByScreen: PlaysByScreen[] = data?.plays_by_screen ?? []
  const timeline: TimelineEvent[] = data?.timeline ?? []

  return (
    <div
      style={{
        padding: 40,
        fontFamily: "Arial",
        maxWidth: 1100,
        margin: "0 auto"
      }}
    >
      <h1>Campaign Delivery Report</h1>

      <p>
        Campaign ID: <b>{resolvedCampaignId}</b>
      </p>

      <hr />

      <h2>Statistics</h2>

      <p>Total Plays: {data?.stats?.total_plays ?? 0}</p>
      <p>Screens: {data?.stats?.screens ?? players.length}</p>
      <p>Impressions: {data?.stats?.impressions ?? 0}</p>
      <p>Failures: {data?.stats?.failures ?? 0}</p>

      <hr />

      <h2>Players</h2>

      {players.length > 0 ? (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: 24
          }}
        >
          <thead>
            <tr>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>
                Player
              </th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>
                Status
              </th>
              <th style={{ textAlign: "right", borderBottom: "1px solid #ddd", padding: 8 }}>
                Plays
              </th>
              <th style={{ textAlign: "right", borderBottom: "1px solid #ddd", padding: 8 }}>
                Impressions
              </th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>
                Last Seen
              </th>
            </tr>
          </thead>

          <tbody>
            {players.map((player: CampaignPlayer) => {
              const playerName = displayPlayerName(player)

              return (
                <tr key={player.id}>
                  <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                    {playerName}
                  </td>
                  <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                    {player.status ?? "unknown"}
                  </td>
                  <td style={{ borderBottom: "1px solid #eee", padding: 8, textAlign: "right" }}>
                    {player.plays ?? 0}
                  </td>
                  <td style={{ borderBottom: "1px solid #eee", padding: 8, textAlign: "right" }}>
                    {player.impressions ?? 0}
                  </td>
                  <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                    {player.last_seen
                      ? new Date(player.last_seen).toLocaleString()
                      : "—"}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      ) : (
        <p>Nenhum player encontrado.</p>
      )}

      <hr />

      <h2>Plays by Hour</h2>

      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <LineChart data={playsByHour}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis
              dataKey="hour"
              tickFormatter={(value: string) => `${new Date(value).getHours()}:00`}
            />

            <YAxis />

            <Tooltip
              labelFormatter={(value) => new Date(String(value)).toLocaleString()}
            />

            <Line type="monotone" dataKey="plays" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <hr />

      <h2>Plays by Screen</h2>

      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={playsByScreen}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="name" />

            <YAxis />

            <Tooltip />

            <Bar dataKey="plays" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <hr />

      <h2>Playback Timeline</h2>

      {timeline.length > 0 ? (
        timeline.map((event: TimelineEvent) => (
          <div
            key={event.event_id}
            style={{
              borderBottom: "1px solid #ddd",
              padding: 10
            }}
          >
            <b>{event.event_type}</b>

            <div style={{ fontSize: 13 }}>
              {new Date(event.occurred_at).toLocaleString()}
            </div>

            <div style={{ fontSize: 13 }}>
              Screen: {event.screen_name ?? "—"}
            </div>
          </div>
        ))
      ) : (
        <p>Nenhum evento encontrado.</p>
      )}
    </div>
  )
}