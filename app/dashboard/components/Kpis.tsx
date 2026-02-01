"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import KpiCard from "./KpiCard";

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

export default function Kpis({ startDate, endDate }: Props) {
  const [data, setData] = useState<KpisData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    async function load() {
      const { data, error } = await supabase.rpc("dashboard_kpis", {
        start_date: startDate,
        end_date: endDate,
      });

      if (!mounted) return;

      if (error) {
        console.error("Erro ao carregar KPIs:", error);
        setData(null);
      } else if (Array.isArray(data) && data.length > 0) {
        setData(data[0] as KpisData);
      } else {
        setData(null);
      }

      setLoading(false);
    }

    load();

    return () => {
      mounted = false;
    };
  }, [startDate, endDate]);

  if (loading) {
    return <div className="text-sm text-gray-400">Carregando KPIs…</div>;
  }

  if (!data) {
    return <div className="text-sm text-red-500">Sem dados para o período</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <KpiCard title="Execuções" value={data.total_executions} />
      <KpiCard title="Players Ativos" value={data.active_players} />
      <KpiCard
        title="Tempo Veiculado"
        value={`${Math.round(data.total_seconds / 60)} min`}
      />
      <KpiCard title="Campanhas Ativas" value={data.active_campaigns} />
    </div>
  );
}
