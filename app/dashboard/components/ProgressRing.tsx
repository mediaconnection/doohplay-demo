type Props = {
  percent: number;
  label: string;
  sublabel?: string;
  size?: number;
  color?: string;
};

export default function ProgressRing({
  percent,
  label,
  sublabel,
  size = 64,
  color = "#2563EB",
}: Props) {
  const clamped = Math.max(0, Math.min(100, percent));
  const strokeWidth = Math.max(3, Math.round(size / 12));
  const radius = size / 2 - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);

  return (
    <div className="text-center">
      <div className="relative mx-auto mb-2" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-extrabold" style={{ color }}>
            {clamped}%
          </span>
        </div>
      </div>
      <p className="text-xs font-semibold text-white">{label}</p>
      {sublabel && <p className="text-[10px] text-gray-400">{sublabel}</p>}
    </div>
  );
}
