"use client"

import { useCallback, useEffect, useState } from "react"
import KpiCard from "./KpiCard"
import { useAutoRefresh } from "@/lib/hooks/useAutoRefresh"

type ScreenRow = {
  player_id: string
  label: string
  client_code: string | null
  online: boolean
  last_ping: string | null
  impressions_today: number
  estimated_revenue_today: number
  cpm: number
}

type Totals = {
  impressions_today: number
  estimated_revenue_today: number
  avg_cpm: number
  proofs_registered_today: number
  proofs_last_updated_at: string | null
}

type ControlRoomData = {
  screens: ScreenRow[]
  totals: Totals
  generated_at: string
}

const STALE_THRESHOLD_MS = 24 * 60 * 60 * 1000 // 24h

function formatCurrency(value: number): string {
  return `R$ ${value.toFixed(2).replace(".", ",")}`
}

function formatDateTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })
}

export default function ControlRoomGrid() {
  const [data, setData] = useState<ControlRoomData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true)
      setError(null)

      const res = await fetch("/api/dashboard/control-room", { cache: "no-store" })
      if (!res.ok) throw new Error(`/api/dashboard/control-room failed with ${res.status}`)

      const json = await res.json()
      setData(json as ControlRoomData)
    } catch (err) {
      console.error("CONTROL_ROOM_LOAD_ERROR", err)
      setError("Erro ao carregar central de controle")
    } finally {
      if (!silent) setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  useAutoRefresh(() => {
    void fetchData(true)
  }, 15000)

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-800 animate-pulse rounded-xl" />
        ))}
      </div>
    )
  }

  if (error) {
    return <div className="text-sm text-red-500">{error}</div>
  }

  if (!data) {
    return <div className="text-sm text-gray-400">Sem dados</div>
  }

  const { screens, totals } = data

  const proofsStale =
    totals.proofs_last_updated_at != null &&
    Date.now() - new Date(totals.proofs_last_updated_at).getTime() > STALE_THRESHOLD_MS

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard title="Impressões Hoje" value={totals.impressions_today} />
        <KpiCard title="Receita Estimada Hoje" value={formatCurrency(totals.estimated_revenue_today)} />
        <KpiCard title="CPM Médio" value={formatCurrency(totals.avg_cpm)} />
        <KpiCard
          title="Proofs Registrados Hoje"
          value={totals.proofs_registered_today.toLocaleString("pt-BR")}
          warning={
            proofsStale && totals.proofs_last_updated_at
              ? `Dado desde ${formatDateTime(totals.proofs_last_updated_at)} — pipeline de prova pode estar parado`
              : undefined
          }
        />
      </div>

      {screens.length === 0 ? (
        <div className="text-sm text-gray-400">Nenhuma tela pareada</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {screens.map((screen) => (
            <div key={screen.player_id} className="rounded-2xl bg-gray-900 p-4 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-white truncate">{screen.label}</span>
                <span
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${screen.online ? "bg-green-500" : "bg-red-500"}`}
                  title={screen.online ? "Online" : "Offline"}
                />
              </div>
              {screen.client_code && <p className="text-xs text-gray-500 mb-3">{screen.client_code}</p>}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-gray-500">Impressões hoje</p>
                  <p className="text-white font-semibold">{screen.impressions_today}</p>
                </div>
                <div>
                  <p className="text-gray-500">Receita estimada</p>
                  <p className="text-white font-semibold">{formatCurrency(screen.estimated_revenue_today)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
