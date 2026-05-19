import Link from "next/link"
import { notFound } from "next/navigation"

import { pool } from "@/lib/db"

type CampaignRow = {
  campaign_id: string
  campaign_name: string | null
  created_at: string | null
}

type CampaignGraphRow = {
  score: number | string | null
  risk: string | null
}

type CampaignStatsRow = {
  total_events: number | string | null
  invalid_events: number | string | null
  players_count: number | string | null
  last_event_at: string | null
}

type CampaignPlayerRow = {
  player_id: string
  player_name: string | null
  player_code: string | null
  total_events: number | string | null
  invalid_events: number | string | null
  last_event_at: string | null
}

type CampaignEventRow = {
  event_id: string
  event_hash: string | null
  event_type: string | null
  device_id: string | null
  occurred_at: string | null
  created_at: string | null
}

function normalizeRisk(value: string | null | undefined) {
  if (value === "HIGH_RISK") return "HIGH_RISK"
  if (value === "WATCH") return "WATCH"
  return "SAFE"
}

function toSafeNumber(value: number | string | null | undefined) {
  const numeric =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : NaN

  return Number.isFinite(numeric) ? numeric : 0
}

function toSafeInteger(value: number | string | null | undefined) {
  return Math.max(0, Math.trunc(toSafeNumber(value)))
}

function clampScore(value: number | string | null | undefined) {
  return Math.max(0, Math.min(100, Math.round(toSafeNumber(value))))
}

function formatDate(value: string | null) {
  if (!value) return "—"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "medium"
  }).format(date)
}

function shortHash(value: string | null, size = 10) {
  if (!value) return "—"
  if (value.length <= size * 2) return value
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

function displayCampaignName(campaign: CampaignRow) {
  return campaign.campaign_name?.trim() || campaign.campaign_id
}

function displayPlayerName(player: CampaignPlayerRow) {
  return (
    player.player_name?.trim() ||
    player.player_code?.trim() ||
    `Player ${player.player_id}`
  )
}

export default async function CampaignDetailsPage({
  params
}: {
  params: Promise<{ campaign_id: string }>
}) {
  const { campaign_id } = await params

  const [campaignRes, graphRes, statsRes, playersRes, eventsRes] =
    await Promise.all([
      pool.query(
        `
        SELECT
          ec.campaign_id,
          NULL::text AS campaign_name,
          MIN(ec.created_at)::text AS created_at
        FROM public.event_chain ec
        WHERE ec.campaign_id = $1
        GROUP BY ec.campaign_id
        LIMIT 1
        `,
        [campaign_id]
      ),

      pool.query(
        `
        SELECT
          tgn.score,
          tgn.risk
        FROM public.trust_graph_nodes tgn
        WHERE tgn.node_type = 'campaign'
          AND tgn.ref_id = $1
        LIMIT 1
        `,
        [campaign_id]
      ),

      pool.query(
        `
        SELECT
          COUNT(*)::int AS total_events,
          COALESCE(
            SUM(
              CASE
                WHEN lower(coalesce(ec.payload->>'invalid', 'false')) = 'true'
                  THEN 1
                ELSE 0
              END
            ),
            0
          )::int AS invalid_events,
          COUNT(DISTINCT ec.device_id)::int AS players_count,
          MAX(ec.occurred_at)::text AS last_event_at
        FROM public.event_chain ec
        WHERE ec.campaign_id = $1
        `,
        [campaign_id]
      ),

      pool.query(
        `
        SELECT
          ec.device_id AS player_id,
          p.name AS player_name,
          p.player_code,
          COUNT(*)::int AS total_events,
          COALESCE(
            SUM(
              CASE
                WHEN lower(coalesce(ec.payload->>'invalid', 'false')) = 'true'
                  THEN 1
                ELSE 0
              END
            ),
            0
          )::int AS invalid_events,
          MAX(ec.occurred_at)::text AS last_event_at
        FROM public.event_chain ec
        LEFT JOIN public.players p
          ON p.id::text = ec.device_id::text
        WHERE ec.campaign_id = $1
          AND ec.device_id IS NOT NULL
        GROUP BY ec.device_id, p.name, p.player_code
        ORDER BY MAX(ec.occurred_at) DESC NULLS LAST, COUNT(*) DESC
        LIMIT 20
        `,
        [campaign_id]
      ),

      pool.query(
        `
        SELECT
          ec.event_id::text AS event_id,
          ec.event_hash,
          ec.event_type,
          ec.device_id,
          ec.occurred_at::text AS occurred_at,
          ec.created_at::text AS created_at
        FROM public.event_chain ec
        WHERE ec.campaign_id = $1
        ORDER BY ec.occurred_at DESC NULLS LAST, ec.created_at DESC NULLS LAST
        LIMIT 20
        `,
        [campaign_id]
      )
    ])

  const campaignRows = campaignRes.rows as CampaignRow[]
  const graphRows = graphRes.rows as CampaignGraphRow[]
  const statsRows = statsRes.rows as CampaignStatsRow[]
  const players = playersRes.rows as CampaignPlayerRow[]
  const events = eventsRes.rows as CampaignEventRow[]

  const campaign = campaignRows[0]

  if (!campaign) {
    notFound()
  }

  const graph = graphRows[0] ?? null
  const rawStats = statsRows[0] ?? null

  const stats = {
    total_events: toSafeInteger(rawStats?.total_events),
    invalid_events: toSafeInteger(rawStats?.invalid_events),
    players_count: toSafeInteger(rawStats?.players_count),
    last_event_at: rawStats?.last_event_at ?? null
  }

  const risk = normalizeRisk(graph?.risk)
  const score = clampScore(graph?.score)
  const campaignName = displayCampaignName(campaign)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{campaignName}</h1>
          <p className="text-sm text-gray-500">
            Visão operacional e de risco da campanha.
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/players"
            className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
          >
            Ver players
          </Link>

          <Link
            href={`/proof?campaign_id=${encodeURIComponent(campaign.campaign_id)}`}
            className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
          >
            Explorer
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Metric title="Score" value={score} />
        <Metric title="Risk" value={risk} />
        <Metric title="Eventos" value={stats.total_events} />
        <Metric title="Players" value={stats.players_count} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section className="rounded-2xl border bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold">Dados da campanha</h2>

          <div className="mt-4 space-y-3">
            <Row label="Campaign ID" value={campaign.campaign_id} />
            <Row label="Nome" value={campaign.campaign_name ?? "—"} />
            <Row label="Criada em" value={formatDate(campaign.created_at)} />
            <Row label="Último evento" value={formatDate(stats.last_event_at)} />
            <Row label="Eventos inválidos" value={String(stats.invalid_events)} />
          </div>
        </section>

        <aside className="rounded-2xl border bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold">Risk profile</h2>

          <div className="mt-4 space-y-3">
            <Row label="Risk" value={risk} />
            <Row label="Score" value={String(score)} />
            <Row label="Players impactados" value={String(stats.players_count)} />
            <Row label="Eventos" value={String(stats.total_events)} />
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
        <div>
          <h2 className="text-lg font-semibold">Players vinculados</h2>
          <p className="text-sm text-gray-500">
            Players com eventos associados a esta campanha.
          </p>
        </div>

        {players.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed p-4 text-sm text-gray-500">
            Nenhum player encontrado para esta campanha.
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-2">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-3 py-2">Player</th>
                  <th className="px-3 py-2">Eventos</th>
                  <th className="px-3 py-2">Inválidos</th>
                  <th className="px-3 py-2">Último evento</th>
                  <th className="px-3 py-2">Ações</th>
                </tr>
              </thead>

              <tbody>
                {players.map((player) => {
                  const playerName = displayPlayerName(player)

                  return (
                    <tr key={player.player_id} className="bg-gray-50 text-sm">
                      <td className="rounded-l-xl px-3 py-3 align-top">
                        <div className="font-medium">{playerName}</div>
                        <div className="mt-1 text-xs text-gray-500">
                          {player.player_id}
                        </div>

                        {player.player_code ? (
                          <div className="mt-1 text-xs text-gray-500">
                            Code: {player.player_code}
                          </div>
                        ) : null}
                      </td>

                      <td className="px-3 py-3 align-top">
                        {toSafeInteger(player.total_events)}
                      </td>

                      <td className="px-3 py-3 align-top">
                        {toSafeInteger(player.invalid_events)}
                      </td>

                      <td className="px-3 py-3 align-top">
                        {formatDate(player.last_event_at)}
                      </td>

                      <td className="rounded-r-xl px-3 py-3 align-top">
                        <Link
                          href={`/players/${encodeURIComponent(player.player_id)}`}
                          className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-white"
                        >
                          Ver player
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-2xl border bg-white p-4 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold">Últimos eventos</h2>
          <p className="text-sm text-gray-500">
            Eventos recentes da campanha na event_chain.
          </p>
        </div>

        {events.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed p-4 text-sm text-gray-500">
            Nenhum evento encontrado para esta campanha.
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-2">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-3 py-2">Event ID</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Hash</th>
                  <th className="px-3 py-2">Player</th>
                  <th className="px-3 py-2">Occurred at</th>
                  <th className="px-3 py-2">Ações</th>
                </tr>
              </thead>

              <tbody>
                {events.map((event) => (
                  <tr key={event.event_id} className="bg-gray-50 text-sm">
                    <td className="rounded-l-xl px-3 py-3 align-top">
                      <div className="font-medium">{event.event_id}</div>
                    </td>

                    <td className="px-3 py-3 align-top">
                      {event.event_type ?? "—"}
                    </td>

                    <td className="px-3 py-3 align-top font-mono text-xs">
                      {shortHash(event.event_hash)}
                    </td>

                    <td className="px-3 py-3 align-top">
                      {event.device_id ? (
                        <Link
                          href={`/players/${encodeURIComponent(event.device_id)}`}
                          className="hover:underline"
                        >
                          {event.device_id}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>

                    <td className="px-3 py-3 align-top">
                      {formatDate(event.occurred_at ?? event.created_at)}
                    </td>

                    <td className="rounded-r-xl px-3 py-3 align-top">
                      <div className="flex flex-wrap gap-2">
                        {event.event_hash ? (
                          <>
                            <Link
                              href={`/verify/${encodeURIComponent(event.event_hash)}`}
                              className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-white"
                            >
                              Verificar
                            </Link>

                            <Link
                              href={`/proof/${encodeURIComponent(event.event_hash)}`}
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