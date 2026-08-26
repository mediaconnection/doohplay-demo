"use client";

import { Cell, Pie, PieChart, Tooltip } from "recharts";

type Slice = {
  name: string;
  value: number;
  color?: string;
};

type Props = {
  data: Slice[];
  size?: number;
  centerLabel?: string;
  centerValue?: string;
  showLegend?: boolean;
};

const DEFAULT_COLORS = ["#2563EB", "#00A8FF", "#22C55E", "#F59E0B", "#8B5CF6", "#EF4444"];

export default function DonutChart({
  data,
  size = 160,
  centerLabel,
  centerValue,
  showLegend = true,
}: Props) {
  const colored = data.map((d, i) => ({
    ...d,
    color: d.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length],
  }));

  return (
    <div className="flex items-center gap-6">
      <div className="relative" style={{ width: size, height: size }}>
        <PieChart width={size} height={size}>
          <Pie
            data={colored}
            cx={size / 2}
            cy={size / 2}
            innerRadius={size * 0.31}
            outerRadius={size * 0.5}
            dataKey="value"
            paddingAngle={3}
            strokeWidth={0}
          >
            {colored.map((d, i) => (
              <Cell key={i} fill={d.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "#0F1120",
              border: "1px solid #1A1D35",
              borderRadius: 8,
            }}
            labelStyle={{ color: "#E5E7EB" }}
            itemStyle={{ color: "#E5E7EB" }}
            formatter={(value: number) => [`${value}%`, ""]}
          />
        </PieChart>

        {(centerLabel || centerValue) && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              {centerValue && (
                <p className="text-lg font-extrabold text-white">{centerValue}</p>
              )}
              {centerLabel && (
                <p className="text-[10px] text-gray-400">{centerLabel}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {showLegend && (
        <div className="flex-1 space-y-2">
          {colored.map((d, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <div
                className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                style={{ background: d.color }}
              />
              <span className="flex-1 text-gray-400">{d.name}</span>
              <span className="font-bold text-white">{d.value}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
