import { Logo } from "./Logo";
import { LucideIcon } from "lucide-react";

interface NavItem {
  label: string;
  icon: LucideIcon;
  id: string;
  badge?: string | number;
}

interface SidebarProps {
  items: NavItem[];
  activeItem: string;
  onNavigate: (id: string) => void;
  tier: "local" | "business" | "enterprise";
  onBack: () => void;
}

const tierColors = {
  local: { accent: "#22C55E", label: "Local" },
  business: { accent: "#2563EB", label: "Business" },
  enterprise: { accent: "#00A3FF", label: "Enterprise" },
};

export function Sidebar({ items, activeItem, onNavigate, tier, onBack }: SidebarProps) {
  const { accent, label } = tierColors[tier];

  return (
    <aside className="w-60 bg-card border-r border-border flex flex-col h-full shrink-0">
      <div className="p-5 border-b border-border">
        <button onClick={onBack} className="w-full text-left">
          <Logo size="sm" />
        </button>
        <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: `${accent}20`, color: accent }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accent }} />
          {label}
        </div>
      </div>

      <nav className="flex-1 p-3 overflow-y-auto">
        <ul className="space-y-0.5">
          {items.map((item) => {
            const isActive = activeItem === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "text-white"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                  style={isActive ? { backgroundColor: accent } : {}}
                >
                  <item.icon size={16} />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full font-mono" style={{ backgroundColor: isActive ? "rgba(255,255,255,0.25)" : `${accent}20`, color: isActive ? "white" : accent }}>
                      {item.badge}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: accent }}>
            JM
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">João Mendes</p>
            <p className="text-xs text-muted-foreground truncate">joao@empresa.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
