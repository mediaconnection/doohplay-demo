export const dynamic = "force-dynamic"

import { notFound } from "next/navigation"
import { Suspense } from "react"
import { getPool } from "@/lib/db"
import DashboardClient from "./dashboard-client"

// ─── Types ────────────────────────────────────────────────────────────────────

export type ClientData = {
  id: string
  code: string
  name: string
  business_type: string | null
  address: string | null
  player_id: string | null
  active: boolean
}

export type PlayerData = {
  id: string
  last_seen: string | null
  sla_30d: number | null
  trust_score: number | null
  online: boolean
}

export type StatsData = {
  total_plays: number
  plays_today: number
  plays_week: number
  plays_month: number
  total_seconds: number
  last_play: string | null
  revenue_month: number
  revenue_today: number
}

export type PlaylistItem = {
  id: string
  asset_url: string | null
  type: string
  duration: number | null
  position: number
  campaign_id: string | null
}

export type Payment = {
  id: string
  value: number
  status: string
  paid_at: string | null
  created_at: string
}

// ─── Data fetching ────────────────────────────────────────────────────────────

async function fetchClient(code: string): Promise<ClientData | null> {
  const pool = getPool()
  try {
    const r = await Promise.race([
      pool.query(
        `SELECT id::text, code, name, business_type, address, player_id::text, active
         FROM studio_clients WHERE code = $1 LIMIT 1`,
        [code.toUpperCase()]
      ),
      new Promise<never>((_, j) => setTimeout(() => j(new Error("timeout")), 5000)),
    ]) as any
    return r.rows?.[0] ?? null
  } catch { return null }
}

async function fetchPlayer(playerId: string): Promise<PlayerData | null> {
  const pool = getPool()
  try {
    const r = await Promise.race([
      pool.query(
        `SELECT id::text, last_seen::text, sla_30d, trust_score FROM players WHERE id = $1 LIMIT 1`,
        [playerId]
      ),
      new Promise<never>((_, j) => setTimeout(() => j(new Error("timeout")), 4000)),
    ]) as any
    const row = r.rows?.[0]
    if (!row) return null
    const online = row.last_seen
      ? (Date.now() - new Date(row.last_seen).getTime()) < 3 * 60 * 1000
      : false
    return { ...row, online }
  } catch { return null }
}

async function fetchStats(playerId: string): Promise<StatsData> {
  const pool = getPool()
  const empty: StatsData = { total_plays: 0, plays_today: 0, plays_week: 0, plays_month: 0, total_seconds: 0, last_play: null, revenue_month: 0, revenue_today: 0 }
  try {
    const r = await Promise.race([
      pool.query(
        `SELECT
           COUNT(*)::int AS total_plays,
           COUNT(*) FILTER (WHERE played_at >= CURRENT_DATE)::int AS plays_today,
           COUNT(*) FILTER (WHERE played_at >= CURRENT_DATE - INTERVAL '7 days')::int AS plays_week,
           COUNT(*) FILTER (WHERE played_at >= DATE_TRUNC('month', CURRENT_DATE))::int AS plays_month,
           COALESCE(SUM(duration), 0)::int AS total_seconds,
           MAX(played_at)::text AS last_play,
           0::float AS revenue_month,
           0::float AS revenue_today
         FROM display_events WHERE player_id = $1`,
        [playerId]
      ),
      new Promise<never>((_, j) => setTimeout(() => j(new Error("timeout")), 4000)),
    ]) as any
    return r.rows?.[0] ?? empty
  } catch { return empty }
}

async function fetchPlaylist(code: string): Promise<PlaylistItem[]> {
  const pool = getPool()
  try {
    const r = await Promise.race([
      pool.query(
        `SELECT pi.id::text, pi.asset_url, pi.type, pi.duration, pi.position, pi.campaign_id::text
         FROM playlist_items pi
         JOIN studio_clients sc ON sc.playlist_id = pi.playlist_id
         WHERE sc.code = $1
         ORDER BY pi.position ASC LIMIT 20`,
        [code.toUpperCase()]
      ),
      new Promise<never>((_, j) => setTimeout(() => j(new Error("timeout")), 4000)),
    ]) as any
    return r.rows ?? []
  } catch { return [] }
}

async function fetchPayments(code: string): Promise<Payment[]> {
  const pool = getPool()
  try {
    const r = await Promise.race([
      pool.query(
        `SELECT id::text, value::float, status, paid_at::text, created_at::text
         FROM financial_payments
         WHERE code = $1
         ORDER BY created_at DESC LIMIT 6`,
        [code.toUpperCase()]
      ),
      new Promise<never>((_, j) => setTimeout(() => j(new Error("timeout")), 4000)),
    ]) as any
    return r.rows ?? []
  } catch { return [] }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardLocalPage({ params }: { params: { code: string } }) {
  const code = params.code.toUpperCase()
  let client = null
  try { client = await fetchClient(code) } catch {}
  if (!client) notFound()

  const [player, stats, playlist, payments] = await Promise.all([
    client.player_id ? fetchPlayer(client.player_id) : Promise.resolve(null),
    client.player_id ? fetchStats(client.player_id) : Promise.resolve({ total_plays: 0, plays_today: 0, plays_week: 0, plays_month: 0, total_seconds: 0, last_play: null, revenue_month: 0, revenue_today: 0 }),
    fetchPlaylist(code),
    fetchPayments(code),
  ])

  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#2563EB", fontSize: 14 }}>Carregando dashboard...</div>
      </div>
    }>
      <DashboardClient
        client={client}
        player={player}
        stats={stats}
        playlist={playlist}
        payments={payments}
      />
    </Suspense>
  )
}
