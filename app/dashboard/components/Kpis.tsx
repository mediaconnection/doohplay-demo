"use client";

import { useEffect, useState, useCallback } from "react";
import KpiCard from "./KpiCard";
import { useAutoRefresh } from "@/lib/hooks/useAutoRefresh";

/* =========================
   TYPES
========================= */

type KpisData = {
  total_executions: number;
  active_players: number;
  total_seconds: number;
  active_campaigns: number;
};

type Props = {
  startDate: string;
  endDate: string;
};

/* =========================
   COMPONENT
========================= */

export default function Kpis({ startDate, endDate }: Props) {
  const [data, setData] = useState<KpisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* =========================
     FETCH (COM REFETCH)
  ========================= */

  const fetchKpis = useCallback(async () => {
    try {
      setError(null);

      const res = await fetch(
        `/api/dashboard/kpis?start=${encodeURIComponent(startDate)}&end=${encodeURIComponent(endDate)}`,
        { cache: "no-store" }
      );

      if (!res.ok) throw new Error(`/api/dashboard/kpis failed with ${res.status}`);

      const data = await res.json();

      if (Array.isArray(data) && data.length > 0) {
        setData(data[0] as KpisData);
      } else {
        setData(null);
      }

    } catch (err: any) {
      console.error("Erro ao carregar KPIs:", err);
      setError("Erro ao carregar KPIs");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  /* =========================
     INITIAL LOAD
  ========================= */

  useEffect(() => {
    setLoading(true);
    fetchKpis();
  }, [fetchKpis]);

  /* =========================
     AUTO REFRESH 🔥
  ========================= */

  // Achado 2026-09-02: dashboard_kpis() era o maior consumidor de work_mem
  // em disco (~3.1GB de temp files acumulados, instância com work_mem de
  // só ~2MB) -- COUNT(DISTINCT) sobre display_events estourando a cada
  // chamada. 10s era agressivo pra um resumo agregado; 30s reduz a
  // frequência em 3x sem mudança perceptível (KPIs "de relance").
  useAutoRefresh(fetchKpis, 30000);

  /* =========================
     UI STATES
  ========================= */

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-20 bg-gray-800 animate-pulse rounded-xl"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-500">
        {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-sm text-gray-400">
        Sem dados para o período
      </div>
    );
  }

  /* =========================
     UI
  ========================= */

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <KpiCard title="Execuções" value={data.total_executions} />

      <KpiCard title="Players Ativos" value={data.active_players} />

      <KpiCard
        title="Tempo Veiculado"
        value={`${Math.round(data.total_seconds / 60)} min`}
      />

      <KpiCard
        title="Campanhas Ativas"
        value={data.active_campaigns}
      />
    </div>
  );
}