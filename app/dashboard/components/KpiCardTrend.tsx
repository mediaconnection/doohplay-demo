import { ReactNode } from "react";

type Props = {
  title: string;
  value: string | number;
  delta: string;
  up: boolean;
  icon?: ReactNode;
  color?: string;
  deltaLabel?: string;
};

function TrendArrow({ up }: { up: boolean }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      style={{ transform: up ? undefined : "rotate(180deg)" }}
    >
      <path
        d="M5 0L10 6H6.5V10H3.5V6H0L5 0Z"
        fill={up ? "#22C55E" : "#EF4444"}
      />
    </svg>
  );
}

export default function KpiCardTrend({
  title,
  value,
  delta,
  up,
  icon,
  color = "#2563EB",
  deltaLabel = "vs. período anterior",
}: Props) {
  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs text-gray-400">{title}</span>
        {icon && (
          <div
            className="flex h-8 w-8 items-center justify-center rounded-xl"
            style={{ background: `${color}20` }}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="text-2xl font-black" style={{ color }}>
        {value}
      </div>

      <div className="mt-1 flex items-center gap-1 text-xs">
        <TrendArrow up={up} />
        <span style={{ color: up ? "#22C55E" : "#EF4444" }}>{delta}</span>
        <span className="text-gray-300">{deltaLabel}</span>
      </div>
    </div>
  );
}
