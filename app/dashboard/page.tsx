"use client";

import { useEffect, useState } from "react";

import PeriodFilter from "./components/PeriodFilter";
import Kpis from "./components/Kpis";
import ExecutionsChart from "./components/ExecutionsChart";
import CampaignsChart from "./components/CampaignsChart";
import PlayersChart from "./components/PlayersChart";
import WatchdogCard from "./components/WatchdogCard";
import SlaChart from "./components/SlaChart";
import ControlRoomGrid from "./components/ControlRoomGrid";

import { getPeriodRange } from "./utils/period";

/* =========================
   TYPES
========================= */

type Period = "today" | "7d" | "30d";
type PeriodRangeValue = { start: string; end: string };

/* =========================
   SAFE WRAPPER
========================= */

function SafeBlock({ children }: { children: React.ReactNode }) {
  try {
    return <>{children}</>;
  } catch (err) {
    console.error("BLOCK_ERROR:", err);
    return (
      <div className="p-4 bg-red-900/30 border border-red-500 rounded-xl text-sm">
        Erro ao carregar componente
      </div>
    );
  }
}

/* =========================
   PAGE
========================= */

export default function DashboardPage() {
  const [period, setPeriod] = useState<Period>("30d");

  /* =========================
     DERIVED STATE
     (new Date() só pode rodar no cliente, depois do mount — se
     calculado direto no corpo do componente, servidor e cliente
     produzem timestamps diferentes e quebram a hidratação. `range`
     começa em null nos dois lados, determinístico, e só é populado
     via useEffect.)
  ========================= */

  const [range, setRange] = useState<PeriodRangeValue | null>(null);

  useEffect(() => {
    try {
      setRange(getPeriodRange(period));
    } catch (err) {
      console.error("PERIOD_RANGE_ERROR:", err);
      setRange(null);
    }
  }, [period]);

  if (!range) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Carregando período...
      </div>
    );
  }

  const { start, end } = range;

  /* =========================
     SAFE URL
  ========================= */

  const reportUrl = `/api/reports/dashboard?start=${encodeURIComponent(
    start
  )}&end=${encodeURIComponent(end)}`;

  /* =========================
     UI
  ========================= */

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 space-y-10">

      {/* ===== HEADER ===== */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            DOOHPLAY Dashboard
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            {start} → {end}
          </p>
        </div>

        <div className="flex items-center gap-3">

          <PeriodFilter value={period} onChange={setPeriod} />

          <a
            href={reportUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm hover:bg-indigo-700 transition"
          >
            Exportar PDF
          </a>

        </div>
      </div>

      {/* ===== CENTRAL DE CONTROLE ===== */}
      <section className="space-y-6">

        <h2 className="text-lg font-semibold text-gray-400 uppercase tracking-wider">
          Central de Controle
        </h2>

        <SafeBlock>
          <ControlRoomGrid />
        </SafeBlock>

      </section>

      {/* ===== SEÇÃO OPERACIONAL ===== */}
      <section className="space-y-6">

        <h2 className="text-lg font-semibold text-gray-400 uppercase tracking-wider">
          Monitoramento Operacional
        </h2>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          <SafeBlock>
            <WatchdogCard />
          </SafeBlock>

          <SafeBlock>
            <SlaChart />
          </SafeBlock>

        </div>

      </section>

      {/* ===== SEÇÃO EXECUTIVA ===== */}
      <section className="space-y-6">

        <h2 className="text-lg font-semibold text-gray-400 uppercase tracking-wider">
          Performance de Campanhas
        </h2>

        <SafeBlock>
          <Kpis startDate={start} endDate={end} />
        </SafeBlock>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <div className="lg:col-span-2">
            <SafeBlock>
              <ExecutionsChart startDate={start} endDate={end} />
            </SafeBlock>
          </div>

          <SafeBlock>
            <CampaignsChart startDate={start} endDate={end} />
          </SafeBlock>

          <SafeBlock>
            <PlayersChart startDate={start} endDate={end} />
          </SafeBlock>

        </div>

      </section>

    </div>
  );
}