"use client";

import { useState } from "react";
import Link from "next/link";

import KpiCardTrend from "../components/KpiCardTrend";
import AreaChartWithTarget from "../components/AreaChartWithTarget";
import DonutChart from "../components/DonutChart";
import ProgressRing from "../components/ProgressRing";

/* =========================
   TYPES
========================= */

type Period = "7d" | "30d" | "90d";

/* =========================
   MOCK DATA
   TODO: substituir pelos dados reais via RPC Supabase / API interna.
   Valores abaixo servem só pra validar layout e composição dos componentes.
========================= */

const KPIS = [
  { title: "Receita Nacional", value: "R$ 8.4M", delta: "+21%", up: true, color: "#22C55E", icon: "💰" },
  { title: "Telas Ativas", value: "12.847", delta: "58 offline", up: true, color: "#2563EB", icon: "📺" },
  { title: "Campanhas", value: "124", delta: "18 agências", up: true, color: "#F59E0B", icon: "📣" },
  { title: "Trust Score", value: "97.3", delta: "Excelente", up: true, color: "#22C55E", icon: "🛡️" },
  { title: "Proofs hoje", value: "4.8M", delta: "em tempo real", up: true, color: "#8B5CF6", icon: "#️⃣" },
  { title: "SLA da rede", value: "99.9%", delta: "+0.3pp", up: true, color: "#2563EB", icon: "📶" },
];

const REVENUE_DATA = [
  { mes: "Jan", receita: 6.1, meta: 6.0 },
  { mes: "Fev", receita: 6.8, meta: 6.5 },
  { mes: "Mar", receita: 7.2, meta: 7.0 },
  { mes: "Abr", receita: 7.8, meta: 7.5 },
  { mes: "Mai", receita: 8.1, meta: 8.0 },
  { mes: "Jun", receita: 8.4, meta: 8.2 },
];

const REGION_REVENUE = [
  { name: "São Paulo", value: 38, color: "#2563EB" },
  { name: "Rio de Janeiro", value: 21, color: "#00A8FF" },
  { name: "Minas Gerais", value: 18, color: "#22C55E" },
  { name: "Sul", value: 14, color: "#F59E0B" },
  { name: "Outros", value: 9, color: "#8B5CF6" },
];

const TOP_CITIES = [
  { rank: 1, city: "São Paulo", screens: "412/430", revenue: "R$ 3.2M", trust: 98.1, sla: "99.2%", trend: "+12%" },
  { rank: 2, city: "Rio de Janeiro", screens: "218/224", revenue: "R$ 1.8M", trust: 97.4, sla: "98.7%", trend: "+8%" },
  { rank: 3, city: "Belo Horizonte", screens: "184/196", revenue: "R$ 1.1M", trust: 96.9, sla: "97.8%", trend: "+15%" },
  { rank: 4, city: "Curitiba", screens: "142/148", revenue: "R$ 820K", trust: 97.2, sla: "98.1%", trend: "+6%" },
  { rank: 5, city: "Porto Alegre", screens: "98/108", revenue: "R$ 640K", trust: 96.5, sla: "96.9%", trend: "+9%" },
];

const TOP_ADVERTISERS = [
  { name: "Banco Itaú", spend: "R$ 1.24M", campaigns: 8, reach: "12.4M", trust: 99 },
  { name: "iFood", spend: "R$ 980K", campaigns: 6, reach: "9.8M", trust: 98 },
  { name: "Bradesco", spend: "R$ 820K", campaigns: 5, reach: "8.2M", trust: 97 },
  { name: "Natura", spend: "R$ 640K", campaigns: 4, reach: "6.4M", trust: 99 },
  { name: "Nescafé", spend: "R$ 480K", campaigns: 3, reach: "4.8M", trust: 96 },
];

const NETWORK_HEALTH = [
  { region: "São Paulo", pct: 98.7, screens: "412/430", color: "#22C55E" },
  { region: "Rio de Janeiro", pct: 97.9, screens: "218/224", color: "#22C55E" },
  { region: "Minas Gerais", pct: 95.1, screens: "184/196", color: "#F59E0B" },
  { region: "Paraná", pct: 96.8, screens: "142/148", color: "#22C55E" },
  { region: "Bahia", pct: 90.4, screens: "98/108", color: "#F59E0B" },
  { region: "Outras", pct: 95.7, screens: "135/141", color: "#22C55E" },
];

/* =========================
   PAGE
========================= */

export default function ExecutiveDashboardPage() {
  const [period, setPeriod] = useState<Period>("30d");

  return (
    <div className="min-h-screen text-white" style={{ background: "#020817" }}>
      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-gray-800 px-6 py-4 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
          >
            ← Voltar
          </Link>
          <div className="h-5 w-px bg-gray-800" />
          <div>
            <p className="text-xs text-gray-400">DOOHPLAY</p>
            <h1 className="font-bold text-white">Executive Dashboard</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-full border border-green-600/30 bg-green-600/10 px-3 py-1.5 text-xs font-semibold text-green-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
            LIVE NETWORK
          </div>

          <button className="flex items-center gap-2 rounded-xl border border-gray-800 bg-gray-900 px-3 py-2 text-xs font-medium text-gray-300">
            ⬇ Exportar PDF
          </button>

          <div className="flex gap-1 rounded-xl border border-gray-800 bg-gray-900 p-1">
            {(["7d", "30d", "90d"] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                  period === p ? "bg-blue-600 text-white" : "text-gray-400"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-screen-2xl space-y-6 px-6 py-6">
        {/* ===== KPIs ===== */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {KPIS.map((k) => (
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

        {/* ===== RECEITA + REGIAO ===== */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5 lg:col-span-2">
            <h2 className="font-bold text-white">Receita Nacional</h2>
            <p className="mt-0.5 text-xs text-gray-400">
              Receita realizada vs meta — últimos 6 meses
            </p>
            <div className="mt-4">
              <AreaChartWithTarget
                data={REVENUE_DATA}
                dataKey="receita"
                targetKey="meta"
                xAxisKey="mes"
                height={200}
                color="#22C55E"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
            <h2 className="font-bold text-white">Receita por região</h2>
            <p className="mb-4 text-xs text-gray-400">Distribuição nacional</p>
            <DonutChart data={REGION_REVENUE} centerValue="R$8.4M" centerLabel="Total" />
          </div>
        </div>

        {/* ===== TOP CIDADES + TOP ANUNCIANTES ===== */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-800 px-5 py-4">
              <div>
                <h2 className="font-bold text-white">Top Cidades</h2>
                <p className="text-xs text-gray-400">Por receita gerada</p>
              </div>
              <span>🌐</span>
            </div>
            <div className="divide-y divide-gray-800">
              {TOP_CITIES.map((c) => (
                <div key={c.rank} className="flex items-center gap-4 px-5 py-3.5">
                  <div
                    className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-xl"
                    style={{
                      background:
                        c.rank === 1 ? "#F59E0B20" : c.rank === 2 ? "#94A3B820" : "#2563EB15",
                    }}
                  >
                    <span
                      className="text-xs font-extrabold"
                      style={{
                        color: c.rank === 1 ? "#F59E0B" : c.rank === 2 ? "#94A3B8" : "#2563EB",
                      }}
                    >
                      #{c.rank}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-white">{c.city}</p>
                      <span className="rounded-full bg-green-600/15 px-1.5 py-0.5 text-[10px] font-medium text-green-400">
                        {c.trend}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500">
                      {c.screens} telas · SLA {c.sla}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-400">{c.revenue}</p>
                    <p className="text-[10px] text-gray-400">Trust {c.trust}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-800 px-5 py-4">
              <div>
                <h2 className="font-bold text-white">Top Anunciantes</h2>
                <p className="text-xs text-gray-400">Por investimento em mídia</p>
              </div>
              <span>🏢</span>
            </div>
            <div className="divide-y divide-gray-800">
              {TOP_ADVERTISERS.map((a) => (
                <div key={a.name} className="flex items-center gap-4 px-5 py-3.5">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-blue-600/20 text-xs font-bold text-blue-400">
                    {a.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">{a.name}</p>
                    <p className="text-[11px] text-gray-500">
                      {a.campaigns} campanhas · Reach {a.reach}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-yellow-400">{a.spend}</p>
                    <p className="text-[10px] text-green-400">✓ Trust {a.trust}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ===== SAUDE DA REDE ===== */}
        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-white">Saúde da Rede Nacional</h2>
              <p className="text-xs text-gray-400">Status operacional por região</p>
            </div>
            <span className="text-xs text-green-400">↻ Atualizado há 30s</span>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {NETWORK_HEALTH.map((r) => (
              <ProgressRing
                key={r.region}
                percent={r.pct}
                label={r.region}
                sublabel={r.screens}
                color={r.color}
                size={64}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
