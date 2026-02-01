"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

/* ---------- Tipos ---------- */

type ChartRow = {
  campaign_name: string;
  executions_done: number;
  gross_amount: number;
};

/* ---------- Formatadores ---------- */

const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

/* ---------- Componente ---------- */

export default function CampaignChart({ data }: { data: ChartRow[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="text-sm text-gray-500">
        Nenhum dado disponível para o período selecionado.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Execuções */}
      <div className="border rounded-lg p-4">
        <h2 className="font-medium mb-2">📊 Execuções por campanha</h2>

        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="campaign_name"
              tick={{ fontSize: 12 }}
              interval={0}
              angle={-20}
              textAnchor="end"
            />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="executions_done" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Receita */}
      <div className="border rounded-lg p-4">
        <h2 className="font-medium mb-2">📈 Receita por campanha (R$)</h2>

        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="campaign_name"
              tick={{ fontSize: 12 }}
              interval={0}
              angle={-20}
              textAnchor="end"
            />
            <YAxis tickFormatter={(v) => formatCurrency(v)} />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
            />
            <Line
              type="monotone"
              dataKey="gross_amount"
              stroke="#16a34a"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
