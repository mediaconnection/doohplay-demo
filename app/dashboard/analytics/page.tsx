"use client";

import { useState } from "react";

import PeriodFilter from "../components/PeriodFilter";
import KpiCardTrend from "../components/KpiCardTrend";
import AreaChartWithTarget from "../components/AreaChartWithTarget";
import DonutChart from "../components/DonutChart";
import CampaignsChart from "../components/CampaignsChart";

import { getPeriodRange } from "../utils/period";

/* =========================
   TYPES
========================= */

type Period = "today" | "7d" | "30d";

/* =========================
   MOCK DATA
   TODO: substituir pelos dados reais via RPC Supabase, no mesmo padrão
   usado em Kpis.tsx (ex.: dashboard_kpis, dashboard_revenue_by_period,
   dashboard_revenue_by_advertiser). Os valores abaixo são só para
   validar o layout antes de plugar a fonte real.
========================= */

const MOCK_KPIS = [
  { title: "Impressões", value: "9.632", delta: "+8,4%", up: true, color: "#4F6EF7", icon: "👁" },
  { title: "Receita", value: "R$378,01", delta: "+12,1%", up: true, color: "#22C55E", icon: "💰" },
  { title: "CPM médio", value: "R$39,25", delta: "+3,2%", up: true, color: "#7C5CFC", icon: "📊" },
  { title: "Fill rate", value: "71%", delta: "-2,0%", up: false, color: "#F59E0B", icon: "🎯" },
];

const MOCK_REVENUE = [
  { dia: "Seg", receita: 48.79, meta: 45 },
  { dia: "Ter", receita: 45.52, meta: 45 },
  { dia: "Qua", receita: 53.96, meta: 50 },
  { dia: "Qui", receita: 52.44, meta: 50 },
  { dia: "Sex", receita: 62.70, meta: 55 },
  { dia: "Sáb", receita: 37.24, meta: 35 },
  { dia: "Dom", receita: 27.36, meta: 30 },
];

const MOCK_ADVERTISERS_REVENUE = [
  { name: "Auto Finance", value: 28 },
  { name: "Varejo Brasil", value: 22 },
  { name: "Banco Delta", value: 18 },
  { name: "Food Express", value: 16 },
  { name: "Canal DOOHPLAY", value: 16 },
];

/* =========================
   PAGE
========================= */

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>("7d");

  let start = "";
  let end = "";

  try {
    const range = getPeriodRange(period);
    start = range.start;
    end = range.end;
  } catch (err) {
    console.error("PERIOD_RANGE_ERROR:", err);
  }

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

      {/* ===== KPIs ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {MOCK_KPIS.map((k) => (
          <KpiCardTrend
            key={k.title}
            title={k.title}
            value={k.value}
            delta={k.delta}
            up={k.up}
            color={k.color}
            icon={<span style={{ fontSize: 14 }}>{k.icon}</span>}
          />
        ))}
      </div>

      {/* ===== VISÃO GERAL ===== */}
      <section className="space-y-6">
        <h2 className="text-lg font-semibold text-gray-400 uppercase tracking-wider">
          Visão Geral
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
            <h3 className="font-bold mb-4 text-sm text-gray-300">
              Receita ({period})
            </h3>
            <AreaChartWithTarget
              data={MOCK_REVENUE}
              dataKey="receita"
              targetKey="meta"
              xAxisKey="dia"
              height={220}
            />
          </div>

          {start && end && <CampaignsChart startDate={start} endDate={end} />}
        </div>

        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
          <h3 className="font-bold mb-4 text-sm text-gray-300">
            Receita por anunciante
          </h3>
          <DonutChart data={MOCK_ADVERTISERS_REVENUE} />
        </div>
      </section>
    </div>
  );
}
