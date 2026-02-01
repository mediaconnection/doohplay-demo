"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Row = {
  period: string; // ISO timestamp
  executions: number;
};

// 🔹 Formatadores pt-BR
const formatTick = (value: string) =>
  new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

const formatTooltipLabel = (value: string) =>
  new Date(value).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });

export default function ExecutionsChart() {
  const [data, setData] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      const { data, error } = await supabase.rpc(
        "dashboard_executions_over_time",
        {
          start_date: "2024-01-01T00:00:00Z",
          end_date: "2030-12-31T23:59:59Z",
        }
      );

      if (!mounted) return;

      if (error) {
        console.error("Erro ao carregar execuções:", error);
        setData([]);
      } else if (Array.isArray(data)) {
        setData(data as Row[]);
      }

      setLoading(false);
    }

    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="h-80 bg-white rounded-xl p-4 shadow flex items-center justify-center text-sm text-gray-400">
        Carregando gráfico…
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="h-80 bg-white rounded-xl p-4 shadow flex items-center justify-center text-sm text-gray-400">
        Sem dados no período
      </div>
    );
  }

  return (
    <div className="h-80 bg-white rounded-xl p-4 shadow">
      <h2 className="font-semibold mb-4">
        Execuções ao longo do tempo
      </h2>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis
            dataKey="period"
            tickFormatter={formatTick}
            minTickGap={20}
          />
          <YAxis allowDecimals={false} />
          <Tooltip labelFormatter={formatTooltipLabel} />
          <Line type="monotone" dataKey="executions" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
