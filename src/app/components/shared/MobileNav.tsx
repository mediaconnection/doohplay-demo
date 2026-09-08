import { LucideIcon } from "lucide-react";

interface MobileNavProps {
  items: { label: string; icon: LucideIcon; id: string; badge?: string | number }[];
  activeItem: string;
  onNavigate: (id: string) => void;
  accentColor: string;
}

export function MobileNav({ items, activeItem, onNavigate, accentColor }: MobileNavProps) {
  const visible = items.slice(0, 5);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 pb-safe">
      <div className="flex items-stretch">
        {visible.map((item) => {
          const isActive = activeItem === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="flex-1 flex flex-col items-center justify-center py-2.5 gap-1 relative transition-colors"
              style={{ color: isActive ? accentColor : "#94A3B8" }}
            >
              <div className="relative">
                <item.icon size={20} />
                {item.badge && (
                  <span
                    className="absolute -top-1 -right-1.5 min-w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center px-0.5"
                    style={{ backgroundColor: accentColor }}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
              {isActive && (
                <span
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                  style={{ backgroundColor: accentColor }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
