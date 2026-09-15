"use client";

import { useCallback, useEffect, useState } from "react";

import PeriodFilter from "../components/PeriodFilter";
import KpiCard from "../components/KpiCard";
import CampaignsChart from "../components/CampaignsChart";
import { useAutoRefresh } from "@/lib/hooks/useAutoRefresh";

import { getPeriodRange } from "../utils/period";

/* =========================
   TYPES
========================= */

type Period = "today" | "7d" | "30d";
type KpisData = { total_executions: number };

/* =========================
   PAGE
========================= */

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>("7d");
  const [kpis, setKpis] = useState<KpisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  let start = "";
  let end = "";

  try {
    const range = getPeriodRange(period);
    start = range.start;
    end = range.end;
  } catch (err) {
    console.error("PERIOD_RANGE_ERROR:", err);
  }

  // Reaproveita a mesma RPC/rota já usada em Kpis.tsx (dashboard_kpis via
  // /api/dashboard/kpis) -- só total_executions é exibido aqui, como
  // "Impressões" (mesmo conceito, nome diferente). Não fabrica delta/
  // tendência: dashboard_kpis não devolve período anterior, e KpiCard (ao
  // contrário de KpiCardTrend) não exige um.
  const fetchKpis = useCallback(async () => {
    if (!start || !end) return;
    try {
      setError(null);
      const res = await fetch(
        `/api/dashboard/kpis?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`,
        { cache: "no-store" }
      );
      if (!res.ok) throw new Error(`/api/dashboard/kpis failed with ${res.status}`);
      const data = await res.json();
      setKpis(Array.isArray(data) && data.length > 0 ? (data[0] as KpisData) : null);
    } catch (err) {
      console.error("Erro ao carregar KPIs:", err);
      setError("Erro ao carregar KPIs");
      setKpis(null);
    } finally {
      setLoading(false);
    }
  }, [start, end]);

  useEffect(() => {
    setLoading(true);
    fetchKpis();
  }, [fetchKpis]);

  // Mesmo intervalo de 30s do Kpis.tsx -- dashboard_kpis já foi o maior
  // consumidor de work_mem da instância (achado de 2026-09-02); refresh
  // mais agressivo reabriria esse problema.
  useAutoRefresh(fetchKpis, 30000);

  return (
    <div
      className="min-h-screen text-white p-6 space-y-8"
      style={{ background: "#05060E" }}
    >
      {/* ===== HEADER ===== */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Analytics</h1>
          <p className="text-sm text-gray-300 mt-1">
            Desempenho detalhado das suas telas
          </p>
        </div>

        <PeriodFilter value={period} onChange={setPeriod} />
      </div>

      {/* ===== KPIs =====
          Fase 1 do investimento em app/dashboard/analytics (ver
          STATUS_PROJETO.md): só "Impressões" tem dado real hoje.
          Receita/CPM médio/Fill rate ficam de fora até existir o
          primeiro anunciante ativo na rede -- ver nota abaixo. */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {loading ? (
          <div className="h-20 bg-gray-800 animate-pulse rounded-2xl" />
        ) : error ? (
          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5 text-sm text-red-400">{error}</div>
        ) : kpis ? (
          <KpiCard title="Impressões" value={kpis.total_executions.toLocaleString("pt-BR")} icon={<span style={{ fontSize: 14 }}>👁</span>} />
        ) : (
          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5 text-sm text-gray-400">Sem dados para o período</div>
        )}
      </div>

      {/* ===== VISÃO GERAL ===== */}
      <section className="space-y-6">
        <h2 className="text-lg font-semibold text-gray-400 uppercase tracking-wider">
          Visão Geral
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5 flex flex-col items-center justify-center text-center gap-2" style={{ minHeight: 220 }}>
            <span className="text-3xl">💰</span>
            <p className="text-sm text-gray-300 max-w-xs">
              Métricas de receita (Receita, CPM médio, Fill rate, Receita por
              anunciante) aparecem aqui assim que houver o primeiro anunciante
              ativo na rede.
            </p>
            <p className="text-xs text-gray-500">
              Hoje a rede tem 0 anunciantes com campanha ativa — nada pra
              calcular ainda, não é um bug.
            </p>
          </div>

          {start && end && <CampaignsChart startDate={start} endDate={end} />}
        </div>
      </section>
    </div>
  );
}
