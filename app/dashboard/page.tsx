"use client";

import { useEffect, useState } from "react";
import PeriodFilter from "./components/PeriodFilter";
import Kpis from "./components/Kpis";
import ExecutionsChart from "./components/ExecutionsChart";
import CampaignsChart from "./components/CampaignsChart";
import PlayersChart from "./components/PlayersChart";
import { getPeriodRange } from "./utils/period";

type Period = "today" | "7d" | "30d";

export default function DashboardPage() {
  const [period, setPeriod] = useState<Period>("30d");

  // 🔹 Datas só existem no CLIENT
  const [range, setRange] = useState<{
    start: string;
    end: string;
  } | null>(null);

  useEffect(() => {
    setRange(getPeriodRange(period));
  }, [period]);

  // 🔹 Evita hidratação inconsistente
  if (!range) {
    return null;
  }

  const { start, end } = range;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold">
          Dashboard de Campanhas
        </h1>

        <div className="flex items-center gap-3">
          <PeriodFilter
            value={period}
            onChange={setPeriod}
          />

          {/* Export PDF */}
          <a
            href={`/api/reports/dashboard?start=${start}&end=${end}`}
            target="_blank"
            className="px-4 py-2 rounded-xl bg-black text-white text-sm hover:bg-gray-800 transition"
          >
            Exportar PDF
          </a>
        </div>
      </div>

      {/* KPIs */}
      <Kpis startDate={start} endDate={end} />

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-2">
          <ExecutionsChart startDate={start} endDate={end} />
        </div>

        <CampaignsChart startDate={start} endDate={end} />
        <PlayersChart startDate={start} endDate={end} />
      </div>
    </div>
  );
}
