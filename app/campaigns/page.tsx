export const dynamic = "force-dynamic"

import Link from "next/link"

import { pool } from "@/lib/db"

type CampaignListRow = {
  campaign_id: string
  campaign_name: string | null
  score: number | string | null
  risk: string | null
  total_events: number | string | null
  invalid_events: number | string | null
  players_count: number | string | null
  last_event_at: string | null
}

type CampaignDisplayRow = CampaignListRow & {
  displayName: string
  normalizedRisk: string
  normalizedScore: number
  totalEvents: number
  invalidEvents: number
  playersCount: number
}

type SortKey = "last_event" | "score" | "risk" | "events" | "players"

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
    dateStyle: "short",
    timeStyle: "short"
  }).format(date)
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

function riskPriority(risk: string) {
  if (risk === "HIGH_RISK") return 3
  if (risk === "WATCH") return 2
  return 1
}

function buildQueryString(params: {
  q?: string
  risk?: string
  sort?: string
  page?: number | string
}) {
  const search = new URLSearchParams()

  if (params.q) search.set("q", params.q)
  if (params.risk) search.set("risk", params.risk)
  if (params.sort) search.set("sort", params.sort)
  if (params.page) search.set("page", String(params.page))

  return search.toString()
}

function displayCampaignName(row: CampaignListRow) {
  return row.campaign_name?.trim() || row.campaign_id
}

export default async function CampaignsPage({
  searchParams
}: {
  searchParams: Promise<{
    q?: string
    risk?: string
    sort?: string
    page?: string
  }>
}) {
  const params = await searchParams

  const q = (params.q ?? "").trim()
  const riskFilter = (params.risk ?? "").trim().toUpperCase()
  const sort = ((params.sort ?? "last_event").trim() || "last_event") as SortKey

  const currentPage = Math.max(1, Number(params.page ?? "1") || 1)
  const pageSize = 20

  const result = await pool.query(`
    WITH campaign_stats AS (
      SELECT
        ec.campaign_id,
        COUNT(*)::int AS total_events,
        COALESCE(
          SUM(
            CASE
              WHEN lower(coalesce(ec.payload->>'invalid', 'false')) = 'true' THEN 1
              ELSE 0
            END
          ),
          0
        )::int AS invalid_events,
        COUNT(DISTINCT ec.device_id)::int AS players_count,
        MAX(ec.occurred_at)::text AS last_event_at
      FROM public.event_chain ec
      WHERE ec.campaign_id IS NOT NULL
      GROUP BY ec.campaign_id
    ),
    campaign_graph AS (
      SELECT
        tgn.ref_id AS campaign_id,
        tgn.score,
        tgn.risk
      FROM public.trust_graph_nodes tgn
      WHERE tgn.node_type = 'campaign'
    )
    SELECT
      cs.campaign_id,
      NULL::text AS campaign_name,
      cg.score,
      cg.risk,
      cs.total_events,
      cs.invalid_events,
      cs.players_count,
      cs.last_event_at
    FROM campaign_stats cs
    LEFT JOIN campaign_graph cg
      ON cg.campaign_id = cs.campaign_id
  `)

  const resultRows = result.rows as CampaignListRow[]

  const filteredRows: CampaignDisplayRow[] = resultRows
    .map((row): CampaignDisplayRow => {
      const displayName = displayCampaignName(row)
      const normalizedRisk = normalizeRisk(row.risk)
      const normalizedScore = clampScore(row.score)
      const totalEvents = toSafeInteger(row.total_events)
      const invalidEvents = toSafeInteger(row.invalid_events)
      const playersCount = toSafeInteger(row.players_count)

      return {
        ...row,
        displayName,
        normalizedRisk,
        normalizedScore,
        totalEvents,
        invalidEvents,
        playersCount
      }
    })
    .filter((row) => {
      const query = q.toLowerCase()

      const matchesQuery =
        q.length === 0 ||
        row.displayName.toLowerCase().includes(query) ||
        row.campaign_id.toLowerCase().includes(query)

      const matchesRisk =
        riskFilter.length === 0 || row.normalizedRisk === riskFilter

      return matchesQuery && matchesRisk
    })
    .sort((a, b) => {
      switch (sort) {
        case "score":
          return b.normalizedScore - a.normalizedScore

        case "risk":
          return riskPriority(b.normalizedRisk) - riskPriority(a.normalizedRisk)

        case "events":
          return b.totalEvents - a.totalEvents

        case "players":
          return b.playersCount - a.playersCount

        case "last_event":
        default: {
          const aTime = a.last_event_at ? new Date(a.last_event_at).getTime() : 0
          const bTime = b.last_event_at ? new Date(b.last_event_at).getTime() : 0
          return bTime - aTime
        }
      }
    })

  const totalRows = filteredRows.length
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const start = (safePage - 1) * pageSize
  const end = start + pageSize
  const rows: CampaignDisplayRow[] = filteredRows.slice(start, end)

  const summary = {
    total: filteredRows.length,
    watch: filteredRows.filter((row) => row.normalizedRisk === "WATCH").length,
    highRisk: filteredRows.filter((row) => row.normalizedRisk === "HIGH_RISK")
      .length,
    totalEvents: filteredRows.reduce((acc, row) => acc + row.totalEvents, 0),
    totalPlayersTouched: filteredRows.reduce(
      (acc, row) => acc + row.playersCount,
      0
    )
  }

  const prevHref =
    safePage > 1
      ? `/campaigns?${buildQueryString({
          q,
          risk: riskFilter,
          sort,
          page: safePage - 1
        })}`
      : null

  const nextHref =
    safePage < totalPages
      ? `/campaigns?${buildQueryString({
          q,
          risk: riskFilter,
          sort,
          page: safePage + 1
        })}`
      : null

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Campanhas</h1>
          <p className="text-sm text-gray-500">
            Visão operacional e de risco das campanhas observadas na event_chain.
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
            href="/network/map"
            className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
          >
            Ver mapa
          </Link>
        </div>
      </div>

      <form className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_180px_220px_auto]">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Buscar por campaign ID"
            className="rounded-lg border px-3 py-2 text-sm outline-none"
          />

          <select
            name="risk"
            defaultValue={riskFilter}
            className="rounded-lg border px-3 py-2 text-sm outline-none"
          >
            <option value="">Todos riscos</option>
            <option value="SAFE">SAFE</option>
            <option value="WATCH">WATCH</option>
            <option value="HIGH_RISK">HIGH_RISK</option>
          </select>

          <select
            name="sort"
            defaultValue={sort}
            className="rounded-lg border px-3 py-2 text-sm outline-none"
          >
            <option value="last_event">Ordenar por último evento</option>
            <option value="score">Ordenar por score</option>
            <option value="risk">Ordenar por risk</option>
            <option value="events">Ordenar por eventos</option>
            <option value="players">Ordenar por players</option>
          </select>

          <button
            type="submit"
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Filtrar
          </button>
        </div>
      </form>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Metric title="Campanhas" value={summary.total} />
        <Metric title="Watch" value={summary.watch} />
        <Metric title="High Risk" value={summary.highRisk} />
        <Metric title="Eventos totais" value={summary.totalEvents} />
      </div>

      <section className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Lista de campanhas</h2>
            <p className="text-sm text-gray-500">
              Página {safePage} de {totalPages} · {totalRows} resultado(s)
            </p>
          </div>

          <div className="text-sm text-gray-500">
            Players impactados somados: {summary.totalPlayersTouched}
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="rounded-xl border border-dashed p-4 text-sm text-gray-500">
            Nenhuma campanha encontrada com os filtros atuais.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-2">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-3 py-2">Campaign</th>
                  <th className="px-3 py-2">Risk</th>
                  <th className="px-3 py-2">Score</th>
                  <th className="px-3 py-2">Eventos</th>
                  <th className="px-3 py-2">Inválidos</th>
                  <th className="px-3 py-2">Players</th>
                  <th className="px-3 py-2">Último evento</th>
                  <th className="px-3 py-2">Ações</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((row) => (
                  <tr key={row.campaign_id} className="bg-gray-50 text-sm">
                    <td className="rounded-l-xl px-3 py-3 align-top">
                      <div className="font-medium">{row.displayName}</div>
                      <div className="mt-1 text-xs text-gray-500">
                        {row.campaign_id}
                      </div>
                    </td>

                    <td className="px-3 py-3 align-top">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${riskBadgeClasses(
                          row.normalizedRisk
                        )}`}
                      >
                        {row.normalizedRisk}
                      </span>
                    </td>

                    <td className="px-3 py-3 align-top">{row.normalizedScore}</td>
                    <td className="px-3 py-3 align-top">{row.totalEvents}</td>
                    <td className="px-3 py-3 align-top">{row.invalidEvents}</td>
                    <td className="px-3 py-3 align-top">{row.playersCount}</td>
                    <td className="px-3 py-3 align-top">
                      {formatDate(row.last_event_at)}
                    </td>

                    <td className="rounded-r-xl px-3 py-3 align-top">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/campaigns/${encodeURIComponent(row.campaign_id)}`}
                          className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-white"
                        >
                          Detalhes
                        </Link>

                        <Link
                          href={`/proof?campaign_id=${encodeURIComponent(row.campaign_id)}`}
                          className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-white"
                        >
                          Explorer
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Mostrando {rows.length} item(ns) nesta página.
          </div>

          <div className="flex gap-2">
            {prevHref ? (
              <Link
                href={prevHref}
                className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
              >
                Anterior
              </Link>
            ) : (
              <span className="rounded-lg border px-4 py-2 text-sm text-gray-300">
                Anterior
              </span>
            )}

            {nextHref ? (
              <Link
                href={nextHref}
                className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
              >
                Próxima
              </Link>
            ) : (
              <span className="rounded-lg border px-4 py-2 text-sm text-gray-300">
                Próxima
              </span>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

function Metric({
  title,
  value
}: {
  title: string
  value: number
}) {
  return (
    <div className="rounded-2xl border bg-white px-4 py-3 shadow-sm">
      <div className="text-xs text-gray-500">{title}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  )
}