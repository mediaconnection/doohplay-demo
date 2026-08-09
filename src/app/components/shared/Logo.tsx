export function Logo({ size = "md", variant = "light" }: { size?: "sm" | "md" | "lg"; variant?: "light" | "dark" }) {
  const sizes = { sm: "text-lg", md: "text-xl", lg: "text-2xl" };
  const iconSizes = { sm: 20, md: 24, lg: 32 };
  const s = iconSizes[size];
  const textColor = variant === "dark" ? "text-white" : "text-[#020617]";

  return (
    <div className={`flex items-center gap-2 ${sizes[size]} font-bold ${textColor}`} style={{ fontFamily: "'Inter Tight', sans-serif" }}>
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#2563EB" />
        <rect x="6" y="8" width="8" height="16" rx="2" fill="white" />
        <rect x="18" y="8" width="8" height="10" rx="2" fill="#00A3FF" />
        <rect x="18" y="22" width="8" height="2" rx="1" fill="#22C55E" />
      </svg>
      <span>DOOHPLAY</span>
    </div>
  );
}
