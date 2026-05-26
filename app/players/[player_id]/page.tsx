export const dynamic = "force-dynamic"

import Link from "next/link"
import { notFound } from "next/navigation"

import { pool } from "@/lib/db"

type PlayerRow = {
  id: string
  name: string | null
  player_code: string | null
  location: string | null
  device_type: string | null
  platform: string | null
  latitude: number | null
  longitude: number | null
  last_ping: string | null
}

type HeartbeatRow = {
  status: string | null
  last_seen_at: string | null
}

type GraphRow = {
  score: number | null
  risk: string | null
}

type EventStatsRow = {
  executions: number
  invalid_events: number
}

type RecentEventRow = {
  event_id: string
  event_hash: string | null
  event_type: string | null
  occurred_at: string | null
  created_at: string | null
  payload: Record<string, unknown> | null
}

function normalizeRisk(value: string | null | undefined) {
  if (value === "HIGH_RISK") return "HIGH_RISK"
  if (value === "WATCH") return "WATCH"

  return "SAFE"
}

function clampScore(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 0
  }

  return Math.max(0, Math.min(100, Math.round(value)))
}

function formatDate(value: string | null) {
  if (!value) return "—"

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "—"
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "medium"
  }).format(date)
}

function shortHash(value: string | null, size = 10) {
  if (!value) return "—"

  if (value.length <= size * 2) {
    return value
  }

  return `${value.slice(0, size)}...${value.slice(-size)}`
}

function riskBadgeClasses(risk: string) {
  if (risk === "HIGH_RISK") {
    return "border-red-200 bg-red-50 text-red-700"
  }

  if (risk === "WATCH") {
    return "border-amber-200 bg-amber-50 text-amber-700"
  }

  return "border-green-200 bg-green-50 text-green-700"
}

export default async function PlayerDetailsPage({
  params
}: {
  params: Promise<{ player_id: string }>
}) {
  const { player_id } = await params

  const [
    playerRes,
    heartbeatRes,
    graphRes,
    statsRes,
    recentEventsRes
  ] = await Promise.all([
    pool.query(
      `
      select
        p.id,
        p.name,
        p.player_code,
        p.location,
        p.device_type,
        p.platform,
        p.latitude,
        p.longitude,
        p.last_ping
      from players p
      where p.id = $1
      limit 1
      `,
      [player_id]
    ),

    pool.query(
      `
      select
        ph.status,
        ph.last_seen_at
      from player_heartbeats ph
      where ph.player_id = $1
      order by ph.last_seen_at desc nulls last
      limit 1
      `,
      [player_id]
    ),

    pool.query(
      `
      select
        tgn.score,
        tgn.risk
      from trust_graph_nodes tgn
      where tgn.ref_id = $1
        and tgn.node_type in ('device', 'player')
      limit 1
      `,
      [player_id]
    ),

    pool.query(
      `
      select
        count(*)::int as executions,
        coalesce(
          sum(
            case
              when lower(coalesce(ec.payload->>'invalid', 'false')) = 'true'
                then 1
              else 0
            end
          ),
          0
        )::int as invalid_events
      from event_chain ec
      where ec.device_id = $1
      `,
      [player_id]
    ),

    pool.query(
      `
      select
        ec.event_id,
        ec.event_hash,
        ec.event_type,
        ec.occurred_at,
        ec.created_at,
        ec.payload
      from event_chain ec
      where ec.device_id = $1
      order by ec.occurred_at desc nulls last,
               ec.created_at desc nulls last
      limit 20
      `,
      [player_id]
    )
  ])

  const playerRows = playerRes.rows as PlayerRow[]
  const heartbeatRows = heartbeatRes.rows as HeartbeatRow[]
  const graphRows = graphRes.rows as GraphRow[]
  const statsRows = statsRes.rows as EventStatsRow[]
  const recentEvents = recentEventsRes.rows as RecentEventRow[]

  const player = playerRows[0]

  if (!player) {
    notFound()
  }

  const heartbeat = heartbeatRows[0] ?? null
  const graph = graphRows[0] ?? null

  const stats = statsRows[0] ?? {
    executions: 0,
    invalid_events: 0
  }

  const name =
    player.name?.trim() ||
    player.player_code?.trim() ||
    `Player ${player.id}`

  const risk = normalizeRisk(graph?.risk)
  const score = clampScore(graph?.score)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{name}</h1>

          <p className="text-sm text-gray-500">
            Visão operacional + Trust Graph do player
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/network/map"
            className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
          >
            Voltar ao mapa
          </Link>

          <Link
            href={`/proof?player_id=${encodeURIComponent(player.id)}`}
            className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
          >
            Explorer
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Metric title="Score" value={score} />
        <Metric title="Risk" value={risk} />
        <Metric title="Execuções" value={stats.executions} />
        <Metric title="Eventos inválidos" value={stats.invalid_events} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section className="rounded-2xl border bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold">Dados do Player</h2>

          <div className="mt-4 space-y-3">
            <Row label="ID" value={player.id} />
            <Row label="Nome" value={player.name ?? "—"} />
            <Row label="Player code" value={player.player_code ?? "—"} />
            <Row label="Local" value={player.location ?? "—"} />
            <Row label="Device type" value={player.device_type ?? "—"} />
            <Row label="Platform" value={player.platform ?? "—"} />

            <Row
              label="Coordenadas"
              value={
                typeof player.latitude === "number" &&
                typeof player.longitude === "number"
                  ? `${player.latitude}, ${player.longitude}`
                  : "Sem coordenadas"
              }
            />

            <Row label="Last ping" value={formatDate(player.last_ping)} />
          </div>
        </section>

        <aside className="rounded-2xl border bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold">Status operacional</h2>

          <div className="mt-4 space-y-3">
            <Row label="Heartbeat" value={heartbeat?.status ?? "—"} />
            <Row
              label="Last seen"
              value={formatDate(heartbeat?.last_seen_at ?? null)}
            />
            <Row label="Risk" value={risk} />
            <Row label="Score" value={String(score)} />
          </div>

          <div className="mt-4">
            <span
              className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${riskBadgeClasses(
                risk
              )}`}
            >
              {risk}
            </span>
          </div>
        </aside>
      </div>

      <section className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Últimos eventos</h2>

            <p className="text-sm text-gray-500">
              Eventos recentes vinculados a este player na event_chain.
            </p>
          </div>
        </div>

        {recentEvents.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed p-4 text-sm text-gray-500">
            Nenhum evento encontrado para este player.
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-2">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-3 py-2">Event ID</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Hash</th>
                  <th className="px-3 py-2">Occurred at</th>
                  <th className="px-3 py-2">Ações</th>
                </tr>
              </thead>

              <tbody>
                {recentEvents.map((event) => (
                  <tr
                    key={event.event_id}
                    className="rounded-xl border bg-gray-50 text-sm"
                  >
                    <td className="px-3 py-3 align-top">
                      <div className="font-medium">{event.event_id}</div>
                    </td>

                    <td className="px-3 py-3 align-top">
                      {event.event_type ?? "—"}
                    </td>

                    <td className="px-3 py-3 align-top font-mono text-xs">
                      {shortHash(event.event_hash)}
                    </td>

                    <td className="px-3 py-3 align-top">
                      {formatDate(event.occurred_at ?? event.created_at)}
                    </td>

                    <td className="px-3 py-3 align-top">
                      <div className="flex flex-wrap gap-2">
                        {event.event_hash ? (
                          <>
                            <Link
                              href={`/verify/${encodeURIComponent(
                                event.event_hash
                              )}`}
                              className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-white"
                            >
                              Verificar
                            </Link>

                            <Link
                              href={`/proof/${encodeURIComponent(
                                event.event_hash
                              )}`}
                              className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-white"
                            >
                              Proof
                            </Link>
                          </>
                        ) : (
                          <span className="text-xs text-gray-400">Sem hash</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

function Metric({
  title,
  value
}: {
  title: string
  value: number | string
}) {
  return (
    <div className="rounded-2xl border bg-white px-4 py-3 shadow-sm">
      <div className="text-xs text-gray-500">{title}</div>

      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  )
}

function Row({
  label,
  value
}: {
  label: string
  value: string
}) {
  return (
    <div className="border-b pb-2 last:border-b-0">
      <div className="text-xs uppercase text-gray-500">{label}</div>

      <div className="mt-1 break-all text-sm">{value}</div>
    </div>
  )
}