import { useState } from "react";
import { Plus, X, Megaphone, Tv, BarChart2, Upload, Users, DollarSign, Zap, FileText } from "lucide-react";
import { soundEngine } from "../utils/SoundEngine";

const T = {
  panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82",
  warning: "#FFAA00", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

interface Props { onNavigate: (view: string) => void; }

const ACTIONS = [
  { label: "Nova Campanha",     icon: Megaphone,  view: "campaign-creator",   color: T.primary, angle: -90 },
  { label: "Adicionar Tela",    icon: Tv,         view: "device-manager",     color: T.success, angle: -45 },
  { label: "Ver Analytics",     icon: BarChart2,  view: "analytics-dashboard",color: T.accent,  angle: 0   },
  { label: "Upload Criativo",   icon: Upload,     view: "creative-studio",    color: T.gold,    angle: 45  },
  { label: "Convidar Usuário",  icon: Users,      view: "user-management",    color: T.warning, angle: 90  },
  { label: "Billing",           icon: DollarSign, view: "billing-center",     color: "#00DC82", angle: 135 },
  { label: "Media Plan",        icon: FileText,   view: "media-plan",         color: T.primary, angle: 180 },
  { label: "AI Assistant",      icon: Zap,        view: "ai-assistant",       color: T.accent,  angle: -135},
];

const DEG2RAD = Math.PI / 180;
const RADIUS = 90;

export default function QuickActions({ onNavigate }: Props) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  const toggle = () => {
    soundEngine.play(open ? "click" : "toggle");
    setOpen(o => !o);
  };

  const go = (view: string, label: string) => {
    soundEngine.play("navigate");
    onNavigate(view);
    setOpen(false);
  };

  return (
    <div className="fixed bottom-14 left-6 z-40" style={{ width: 48, height: 48 }}>
      {/* Action items */}
      {ACTIONS.map((action, i) => {
        const rad = action.angle * DEG2RAD;
        const x = open ? Math.cos(rad) * RADIUS : 0;
        const y = open ? Math.sin(rad) * RADIUS : 0;
        const isHov = hovered === action.label;
        return (
          <div key={action.label}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
              transition: `transform 280ms cubic-bezier(0.34, 1.56, 0.64, 1) ${open ? i * 25 : (ACTIONS.length - i) * 15}ms, opacity 200ms ease ${open ? i * 20 : 0}ms`,
              opacity: open ? 1 : 0,
              pointerEvents: open ? "auto" : "none",
            }}>
            {/* Tooltip */}
            {isHov && (
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg text-xs font-black whitespace-nowrap pointer-events-none"
                style={{ background: T.card, border: `1px solid ${T.border}`, color: T.text }}>
                {action.label}
              </div>
            )}
            <button
              onClick={() => go(action.view, action.label)}
              onMouseEnter={() => setHovered(action.label)}
              onMouseLeave={() => setHovered(null)}
              className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110"
              style={{
                background: action.color + "25",
                border: `2px solid ${action.color}50`,
                boxShadow: isHov ? `0 0 16px ${action.color}50` : "none",
              }}>
              <action.icon size={15} style={{ color: action.color }} />
            </button>
          </div>
        );
      })}

      {/* Main FAB */}
      <button onClick={toggle}
        className="absolute inset-0 rounded-full flex items-center justify-center shadow-xl transition-all hover:scale-105"
        style={{
          background: open ? T.card : T.accent,
          border: `2px solid ${open ? T.border : T.accent + "60"}`,
          boxShadow: open ? "none" : `0 0 24px ${T.accent}50`,
          transform: open ? "rotate(45deg)" : "rotate(0deg)",
          transition: "all 250ms cubic-bezier(0.34, 1.56, 0.64, 1)",
          zIndex: 1,
        }}>
        {open
          ? <X size={18} style={{ color: T.text }} />
          : <Plus size={20} style={{ color: "#fff" }} />}
      </button>
    </div>
  );
}
