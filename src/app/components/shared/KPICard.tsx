import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "up" | "down" | "neutral";
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  suffix?: string;
}

export function KPICard({ title, value, change, changeType = "up", icon: Icon, iconColor = "#2563EB", iconBg = "#EFF6FF", suffix }: KPICardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground font-medium">{title}</span>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: iconBg }}>
          <Icon size={18} style={{ color: iconColor }} />
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Inter Tight', sans-serif" }}>{value}</span>
            {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
          </div>
          {change && (
            <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${changeType === "up" ? "text-[#22C55E]" : changeType === "down" ? "text-[#EF4444]" : "text-muted-foreground"}`}>
              {changeType === "up" && <TrendingUp size={12} />}
              {changeType === "down" && <TrendingDown size={12} />}
              <span>{change}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
