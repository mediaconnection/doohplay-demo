"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts"
import type {
  NameType,
  ValueType
} from "recharts/types/component/DefaultTooltipContent"

type ChartRow = {
  campaign_name: string
  executions_done: number
  gross_amount: number
}

function toNumber(value: unknown): number {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : 0
}

function formatCurrency(value: unknown): string {
  return toNumber(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  })
}

function formatTooltipCurrency(
  value: ValueType | undefined,
  name?: NameType
): [string, string] {
  return [formatCurrency(value), String(name ?? "Valor")]
}

export default function CampaignChart({ data }: { data: ChartRow[] }) {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="text-sm text-gray-500">
        Nenhum dado disponível para o período selecionado.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="rounded-lg border p-4">
        <h2 className="mb-2 font-medium">📊 Execuções por campanha</h2>

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

      <div className="rounded-lg border p-4">
        <h2 className="mb-2 font-medium">📈 Receita por campanha (R$)</h2>

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

            <YAxis tickFormatter={formatCurrency} />

            <Tooltip formatter={formatTooltipCurrency} />

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
  )
}