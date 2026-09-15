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
  period: string;
  revenue: string | number;
};

type ChartPoint = {
  dia: string;
  receita: number;
};

type Props = {
  startDate: string;
  endDate: string;
};

function formatBRL(value: number) {
  return `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function RevenueByPeriodChart({ startDate, endDate }: Props) {
  const [data, setData] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    async function load() {
      try {
        const res = await fetch(
          `/api/dashboard/revenue-by-period?start=${encodeURIComponent(startDate)}&end=${encodeURIComponent(endDate)}`,
          { cache: "no-store" }
        );

        if (!res.ok) throw new Error(`/api/dashboard/revenue-by-period failed with ${res.status}`);

        const rows = await res.json();

        if (!mounted) return;

        setData(
          Array.isArray(rows)
            ? (rows as Row[]).map((r) => ({
                dia: new Date(r.period).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
                receita: Number(r.revenue || 0),
              }))
            : []
        );
      } catch (error) {
        if (!mounted) return;
        console.error("Erro ao carregar receita por período:", error);
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
        Carregando receita…
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="h-80 bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center justify-center text-center text-sm text-gray-400 px-8">
        Ainda não há receita registrada no período — aparece aqui assim que a primeira campanha for paga.
      </div>
    );
  }

  return (
    <div className="h-80 bg-gray-900 border border-gray-800 rounded-xl p-4">
      <h2 className="font-semibold mb-4 text-gray-300">
        Receita por Período
      </h2>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="dia" stroke="#9CA3AF" />
          <YAxis stroke="#9CA3AF" width={90} tickFormatter={(v) => formatBRL(Number(v))} />
          <Tooltip formatter={(v) => formatBRL(Number(v))} contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151" }} />
          <Bar dataKey="receita" fill="#22C55E" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
