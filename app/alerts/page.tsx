import Link from "next/link"

import { pool } from "@/lib/db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type SearchParams = Promise<{
  severity?: string
  status?: string
  type?: string
  page?: string
}>

type AlertRow = {
  id: number | string
  type: string
  severity: string | null
  status: string | null
  source_id: string | null
  risk_score: number | string | null
  trust_score: number | string | null
  occurrences: number | string | null
  created_at: string | Date
  last_seen_at: string | Date | null
  resolved_at: string | Date | null
  policy: string | null
}

type AlertFilters = {
  severity: string | null
  status: string | null
  type: string | null
}

type LoadAlertsResult = {
  alerts: AlertRow[]
  page: number
  limit: number
  total: number
  filters: AlertFilters
}

function safeString(value: unknown): string | null {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  return trimmed.length ? trimmed : null
}

function safePage(value: unknown): number {
  const page = Number(value)
  return Number.isInteger(page) && page > 0 ? page : 1
}

function fmtDate(value: string | Date | null): string {
  if (!value) return "—"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"

  return date.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  })
}

function num(value: unknown): number | null {
  if (value === null || value === undefined) return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function severityClass(severity: string | null): string {
  switch (severity) {
    case "CRITICAL":
      return "bg-red-100 text-red-800 border-red-200"
    case "HIGH":
      return "bg-orange-100 text-orange-800 border-orange-200"
    case "MEDIUM":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    default:
      return "bg-slate-100 text-slate-700 border-slate-200"
  }
}

function statusClass(status: string | null, resolvedAt: string | Date | null): string {
  if (resolvedAt || status === "RESOLVED") {
    return "bg-emerald-100 text-emerald-800 border-emerald-200"
  }

  if (status === "ESCALATED") {
    return "bg-red-100 text-red-800 border-red-200"
  }

  return "bg-blue-100 text-blue-800 border-blue-200"
}

function riskClass(score: number | null): string {
  if (score === null) return "text-slate-500"
  if (score >= 90) return "text-red-700"
  if (score >= 70) return "text-orange-700"
  if (score >= 40) return "text-yellow-700"
  return "text-emerald-700"
}

function buildQuery(params: Record<string, string | number | null | undefined>): string {
  const sp = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined && String(value).trim()) {
      sp.set(key, String(value))
    }
  }

  const query = sp.toString()
  return query ? `?${query}` : ""
}

async function loadAlerts(
  searchParams: Awaited<SearchParams>
): Promise<LoadAlertsResult> {
  const severity = safeString(searchParams.severity)
  const status = safeString(searchParams.status)
  const type = safeString(searchParams.type)
  const page = safePage(searchParams.page)
  const limit = 50
  const offset = (page - 1) * limit

  const where: string[] = []
  const params: unknown[] = []

  if (severity) {
    params.push(severity)
    where.push(`severity = $${params.length}`)
  }

  if (type) {
    params.push(type)
    where.push(`type = $${params.length}`)
  }

  if (status) {
    if (status === "RESOLVED") {
      where.push("resolved_at IS NOT NULL")
    } else {
      params.push(status)
      where.push(`COALESCE(status, 'OPEN') = $${params.length}`)
      where.push("resolved_at IS NULL")
    }
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : ""

  const totalRes = await pool.query(
    `
    SELECT count(*)::text AS total
    FROM alerts
    ${whereSql}
    `,
    params
  )

  const queryParams = [...params, limit, offset]

  const alertsRes = await pool.query(
    `
    SELECT
      id,
      type,
      severity,
      status,
      source_id,
      risk_score,
      trust_score,
      occurrences,
      created_at,
      last_seen_at,
      resolved_at,
      policy
    FROM alerts
    ${whereSql}
    ORDER BY
      CASE COALESCE(status, 'OPEN')
        WHEN 'ESCALATED' THEN 1
        WHEN 'OPEN' THEN 2
        WHEN 'RESOLVED' THEN 3
        ELSE 4
      END,
      COALESCE(risk_score, 0) DESC,
      last_seen_at DESC NULLS LAST,
      created_at DESC
    LIMIT $${queryParams.length - 1}
    OFFSET $${queryParams.length}
    `,
    queryParams
  )

  const totalRows = totalRes.rows as Array<{ total: string }>
  const alertRows = alertsRes.rows as AlertRow[]

  return {
    alerts: alertRows,
    page,
    limit,
    total: Number(totalRows[0]?.total ?? 0),
    filters: {
      severity,
      status,
      type
    }
  }
}

export default async function AlertsPage({
  searchParams
}: {
  searchParams: SearchParams
}) {
  const params = await searchParams
  const { alerts, page, limit, total, filters } = await loadAlerts(params)

  const totalPages = Math.max(1, Math.ceil(total / limit))

  const openCount = alerts.filter(
    (alert: AlertRow) =>
      !alert.resolved_at && (alert.status ?? "OPEN") === "OPEN"
  ).length

  const escalatedCount = alerts.filter(
    (alert: AlertRow) =>
      !alert.resolved_at && alert.status === "ESCALATED"
  ).length

  const criticalCount = alerts.filter(
    (alert: AlertRow) => alert.severity === "CRITICAL"
  ).length

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-8 text-slate-950">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
                DOOHPLAY Enterprise
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight">
                Alert Dashboard
              </h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-600">
                Monitoramento auditável de alertas, risco operacional,
                integridade criptográfica, Trust Graph e evidências em cadeia.
              </p>
            </div>

            <div className="text-sm text-slate-500">
              Total:{" "}
              <span className="font-semibold text-slate-900">{total}</span>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          <Metric label="Alertas nesta página" value={alerts.length} />
          <Metric label="Abertos" value={openCount} className="text-blue-700" />
          <Metric label="Escalados" value={escalatedCount} className="text-red-700" />
          <Metric label="Críticos" value={criticalCount} className="text-red-800" />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap gap-2">
            <Link
              href="/alerts"
              className="rounded-full border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50"
            >
              Todos
            </Link>

            {["OPEN", "ESCALATED", "RESOLVED"].map((status: string) => (
              <Link
                key={status}
                href={`/alerts${buildQuery({ ...filters, status, page: 1 })}`}
                className={`rounded-full border px-4 py-2 text-sm ${
                  filters.status === status
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                {status}
              </Link>
            ))}

            {["CRITICAL", "HIGH", "MEDIUM", "LOW"].map((severity: string) => (
              <Link
                key={severity}
                href={`/alerts${buildQuery({ ...filters, severity, page: 1 })}`}
                className={`rounded-full border px-4 py-2 text-sm ${
                  filters.severity === severity
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                {severity}
              </Link>
            ))}
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-lg font-semibold">Alertas</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] border-collapse text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">ID</th>
                  <th className="px-5 py-3">Tipo</th>
                  <th className="px-5 py-3">Severidade</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Risk</th>
                  <th className="px-5 py-3">Trust</th>
                  <th className="px-5 py-3">Ocorrências</th>
                  <th className="px-5 py-3">Source</th>
                  <th className="px-5 py-3">Última ocorrência</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {alerts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-5 py-10 text-center text-slate-500"
                    >
                      Nenhum alerta encontrado.
                    </td>
                  </tr>
                ) : (
                  alerts.map((alert: AlertRow) => {
                    const risk = num(alert.risk_score)
                    const trust = num(alert.trust_score)
                    const status =
                      alert.resolved_at || alert.status === "RESOLVED"
                        ? "RESOLVED"
                        : alert.status ?? "OPEN"

                    return (
                      <tr key={String(alert.id)} className="hover:bg-slate-50">
                        <td className="px-5 py-4 font-mono text-xs">
                          <Link
                            href={`/api/alerts/${alert.id}`}
                            className="text-blue-700 hover:underline"
                          >
                            {String(alert.id)}
                          </Link>
                        </td>

                        <td className="px-5 py-4">
                          <div className="font-medium">{alert.type}</div>
                          <div className="text-xs text-slate-500">
                            {alert.policy ?? "—"}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${severityClass(
                              alert.severity
                            )}`}
                          >
                            {alert.severity ?? "MEDIUM"}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${statusClass(
                              alert.status,
                              alert.resolved_at
                            )}`}
                          >
                            {status}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span className={`text-lg font-bold ${riskClass(risk)}`}>
                            {risk ?? "—"}
                          </span>
                        </td>

                        <td className="px-5 py-4">{trust ?? "—"}</td>

                        <td className="px-5 py-4">
                          {Number(alert.occurrences ?? 0)}
                        </td>

                        <td className="max-w-[220px] truncate px-5 py-4 font-mono text-xs text-slate-600">
                          {alert.source_id ?? "—"}
                        </td>

                        <td className="px-5 py-4 text-slate-600">
                          {fmtDate(alert.last_seen_at ?? alert.created_at)}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        <footer className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm">
          <Link
            href={`/alerts${buildQuery({
              ...filters,
              page: Math.max(1, page - 1)
            })}`}
            className={`rounded-lg border px-4 py-2 ${
              page <= 1 ? "pointer-events-none opacity-40" : "hover:bg-slate-50"
            }`}
          >
            Anterior
          </Link>

          <span className="text-slate-600">
            Página {page} de {totalPages}
          </span>

          <Link
            href={`/alerts${buildQuery({
              ...filters,
              page: Math.min(totalPages, page + 1)
            })}`}
            className={`rounded-lg border px-4 py-2 ${
              page >= totalPages
                ? "pointer-events-none opacity-40"
                : "hover:bg-slate-50"
            }`}
          >
            Próxima
          </Link>
        </footer>
      </div>
    </main>
  )
}

function Metric({
  label,
  value,
  className = ""
}: {
  label: string
  value: number
  className?: string
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${className}`}>{value}</p>
    </div>
  )
}