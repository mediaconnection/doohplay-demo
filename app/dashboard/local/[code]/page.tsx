// app/dashboard/local/[code]/page.tsx
export const dynamic = "force-dynamic"

import { notFound } from "next/navigation"
import { getPool } from "@/lib/db"
import DashboardClient from "./dashboard-client"

export type ClientData = {
  id: string
  code: string
  name: string
  business_type: string | null
  address: string | null
  city: string | null
  phone: string | null
  email: string | null
  cpf_cnpj: string | null
  player_id: string | null
  logo_url: string | null
  primary_color: string | null
}

export type PlayerData = {
  id: string
  name: string | null
  location: string | null
  device_type: string | null
  platform: string | null
  last_ping: string | null
  online: boolean
  sla_30d: number
}

export type StatsData = {
  plays_today: number
  plays_month: number
  revenue_today: number
  revenue_month: number
}

export type PlaylistItem = {
  id: string
  type: string
  duration: number
  position: number
  asset_url: string | null
  name?: string
}

export type Payment = {
  id: string
  value: number
  status: string
  paid_at: string | null
  created_at: string
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = await params
  const pool = getPool()

  // 1. Busca cliente
  const clientRes = await pool.query(
    `SELECT id::text, code, name, business_type, address, city,
            phone, email, cpf_cnpj, player_id::text,
            logo_url, primary_color
     FROM studio_clients
     WHERE UPPER(code) = UPPER($1)
     LIMIT 1`,
    [code]
  )

  if (!clientRes.rows[0]) return notFound()
  const client: ClientData = clientRes.rows[0]

  // 2. Busca player (se tiver player_id)
  let player: PlayerData | null = null
  if (client.player_id) {
    try {
      const playerRes = await pool.query(
        `SELECT
           p.id::text,
           p.name,
           p.location,
           p.device_type,
           p.platform,
           p.last_ping::text,
           CASE
             WHEN p.last_ping IS NOT NULL
               AND (NOW() - p.last_ping) < INTERVAL '3 minutes'
             THEN true
             ELSE false
           END AS online,
           COALESCE(
             (SELECT COUNT(*)::float / 30 * 100
              FROM player_heartbeats ph
              WHERE ph.player_id = p.id
                AND ph.last_seen_at > NOW() - INTERVAL '30 days'
                AND ph.status = 'online'),
             99.8
           ) AS sla_30d
         FROM players p
         WHERE p.id = $1::uuid
         LIMIT 1`,
        [client.player_id]
      )
      if (playerRes.rows[0]) player = playerRes.rows[0]
    } catch {}
  }

  // 3. Stats
  let stats: StatsData = { plays_today: 0, plays_month: 0, revenue_today: 0, revenue_month: 0 }
  if (client.player_id) {
    try {
      const statsRes = await pool.query(
        `SELECT
           COUNT(*) FILTER (WHERE played_at::date = CURRENT_DATE)::int        AS plays_today,
           COUNT(*) FILTER (WHERE played_at >= date_trunc('month', NOW()))::int AS plays_month
         FROM display_events
         WHERE player_id = $1::uuid`,
        [client.player_id]
      )
      if (statsRes.rows[0]) {
        stats.plays_today  = statsRes.rows[0].plays_today  ?? 0
        stats.plays_month  = statsRes.rows[0].plays_month  ?? 0
      }
    } catch {}

    // Revenue via subscriptions
    try {
      const revRes = await pool.query(
        `SELECT value::float AS revenue_month
         FROM client_subscriptions
         WHERE code = $1 AND status = 'ACTIVE'
         LIMIT 1`,
        [code]
      )
      if (revRes.rows[0]) {
        stats.revenue_month = revRes.rows[0].revenue_month ?? 0
        stats.revenue_today = Math.round((stats.revenue_month / 30) * 100) / 100
      }
    } catch {}
  }

  // 4. Playlist — lê de CampaignMedia (onde o upload realmente salva)
  let playlist: PlaylistItem[] = []
  try {
    const plRes = await pool.query(
      `SELECT
         cm.id::text,
         cm.type,
         15                AS duration,
         ROW_NUMBER() OVER (ORDER BY cm."createdAt" ASC)::int AS position,
         cm.url            AS asset_url,
         cm.name
       FROM "CampaignMedia" cm
       JOIN "Campaign" c ON c.id = cm."campaignId"
       WHERE c."advertiserCode" = $1
       ORDER BY cm."createdAt" ASC
       LIMIT 20`,
      [code]
    )
    playlist = plRes.rows
  } catch {}

  // 5. Payments
  let payments: Payment[] = []
  try {
    const payRes = await pool.query(
      `SELECT id::text, value::float, status,
              paid_at::text, created_at::text
       FROM client_payments
       WHERE code = $1
       ORDER BY created_at DESC
       LIMIT 10`,
      [code]
    )
    payments = payRes.rows
  } catch {}

  return (
    <DashboardClient
      client={client}
      player={player}
      stats={stats}
      playlist={playlist}
      payments={payments}
    />
  )
}
