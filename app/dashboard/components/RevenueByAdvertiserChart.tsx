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
  advertiser: string;
  revenue: string | number;
};

type ChartPoint = {
  advertiser: string;
  receita: number;
};

type Props = {
  startDate: string;
  endDate: string;
};

function formatBRL(value: number) {
  return `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function RevenueByAdvertiserChart({ startDate, endDate }: Props) {
  const [data, setData] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    async function load() {
      try {
        const res = await fetch(
          `/api/dashboard/revenue-by-advertiser?start=${encodeURIComponent(startDate)}&end=${encodeURIComponent(endDate)}`,
          { cache: "no-store" }
        );

        if (!res.ok) throw new Error(`/api/dashboard/revenue-by-advertiser failed with ${res.status}`);

        const rows = await res.json();

        if (!mounted) return;

        setData(
          Array.isArray(rows)
            ? (rows as Row[]).map((r) => ({ advertiser: r.advertiser, receita: Number(r.revenue || 0) }))
            : []
        );
      } catch (error) {
        if (!mounted) return;
        console.error("Erro ao carregar receita por anunciante:", error);
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
        Carregando receita por anunciante…
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="h-80 bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center justify-center text-center text-sm text-gray-400 px-8">
        Ainda não há receita registrada por anunciante — aparece aqui assim que a primeira campanha for paga.
      </div>
    );
  }

  return (
    <div className="h-80 bg-gray-900 border border-gray-800 rounded-xl p-4">
      <h2 className="font-semibold mb-4 text-gray-300">
        Receita por Anunciante
      </h2>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical">
          <XAxis type="number" stroke="#9CA3AF" tickFormatter={(v) => formatBRL(Number(v))} />
          <YAxis type="category" dataKey="advertiser" stroke="#9CA3AF" width={120} />
          <Tooltip formatter={(v) => formatBRL(Number(v))} contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151" }} />
          <Bar dataKey="receita" fill="#7C5CFC" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
