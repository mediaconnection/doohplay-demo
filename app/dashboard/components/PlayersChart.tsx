"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Row = {
  player: string;
  executions: number;
};

type Props = {
  startDate: string;
  endDate: string;
};

export default function PlayersChart({ startDate, endDate }: Props) {
  const [data, setData] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    async function load() {
      try {
        const res = await fetch(
          `/api/dashboard/executions-by-player?start=${encodeURIComponent(startDate)}&end=${encodeURIComponent(endDate)}`,
          { cache: "no-store" }
        );

        if (!res.ok) throw new Error(`/api/dashboard/executions-by-player failed with ${res.status}`);

        const data = await res.json();

        if (!mounted) return;

        setData(Array.isArray(data) ? (data as Row[]) : []);
      } catch (error) {
        if (!mounted) return;
        console.error("Erro ao carregar players:", error);
        setData([]);
      }

      setLoading(false);
    }

    load();
    return () => {
      mounted = false;
    };
  }, [startDate, endDate]);

  if (loading) {
    return (
      <div className="h-80 bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center justify-center text-sm text-gray-400">
        Carregando players…
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="h-80 bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center justify-center text-sm text-gray-400">
        Sem dados no período
      </div>
    );
  }

  return (
    <div className="h-80 bg-gray-900 border border-gray-800 rounded-xl p-4">
      <h2 className="font-semibold mb-4 text-gray-300">
        Execuções por Player
      </h2>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="player" stroke="#9CA3AF" />
          <YAxis allowDecimals={false} stroke="#9CA3AF" />
          <Tooltip contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151" }} />
          <Bar dataKey="executions" fill="#6366F1" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
