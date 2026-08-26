"use client";

import {
  Area,
  AreaChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Props = {
  data: Record<string, string | number>[];
  dataKey: string;
  targetKey?: string;
  xAxisKey: string;
  height?: number;
  color?: string;
  targetColor?: string;
};

export default function AreaChartWithTarget({
  data,
  dataKey,
  targetKey,
  xAxisKey,
  height = 200,
  color = "#22C55E",
  targetColor = "#6B7280",
}: Props) {
  const gradientId = `area-gradient-${dataKey}`;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.35} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>

        <XAxis
          dataKey={xAxisKey}
          stroke="#9CA3AF"
          tick={{ fontSize: 11, fill: "#9CA3AF" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          stroke="#9CA3AF"
          tick={{ fontSize: 11, fill: "#9CA3AF" }}
          axisLine={false}
          tickLine={false}
        />

        <Tooltip
          contentStyle={{
            backgroundColor: "#111827",
            border: "1px solid #374151",
            borderRadius: 8,
          }}
          labelStyle={{ color: "#E5E7EB" }}
          itemStyle={{ color: "#E5E7EB" }}
        />

        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2.5}
          fill={`url(#${gradientId})`}
          dot={false}
        />

        {targetKey && (
          <Line
            type="monotone"
            dataKey={targetKey}
            stroke={targetColor}
            strokeWidth={1.5}
            strokeDasharray="4 4"
            dot={false}
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
}
