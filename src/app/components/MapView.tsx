import { useState, useEffect } from "react";
import { ArrowLeft, Monitor, Wifi, WifiOff, AlertTriangle, Eye, DollarSign, Zap, Filter, RefreshCw, MapPin, TrendingUp, CheckCircle, X } from "lucide-react";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

interface Props { onBack: () => void; onNavigate?: (v: string) => void; }

type Status = "online" | "warning" | "offline";

interface Screen {
  id: number; name: string; city: string; neighborhood: string;
  lat: number; lng: number; status: Status;
  viewers: number; revenue: number; content: string;
  cpu: number; signal: number; uptime: number;
  segment: string;
}

const SCREENS: Screen[] = [
  { id: 1,  name: "Bar & Grill - Pinheiros",   city: "Sao Paulo",       neighborhood: "Pinheiros",     lat: 72, lng: 40, status: "online",  viewers: 142, revenue: 4200, content: "Happy Hour",        cpu: 28, signal: 94, uptime: 720, segment: "Alimentacao" },
  { id: 2,  name: "Academia FitLife - Vila Madalena", city: "Sao Paulo", neighborhood: "Vila Madalena", lat: 71, lng: 39, status: "online",  viewers: 89,  revenue: 3100, content: "Verao 2026",         cpu: 31, signal: 88, uptime: 504, segment: "Fitness" },
  { id: 8,  name: "Academia Carioca - Ipanema",city: "Rio de Janeiro",  neighborhood: "Ipanema",       lat: 58, lng: 55, status: "online",  viewers: 203, revenue: 5100, content: "Praia e Saude",     cpu: 35, signal: 85, uptime: 480, segment: "Fitness" },
  { id: 16, name: "Restaurante Gaucho - Moinhos", city: "Porto Alegre",  neighborhood: "Moinhos",       lat: 84, lng: 41, status: "online",  viewers: 77,  revenue: 2300, content: "Churrasco Premium", cpu: 33, signal: 86, uptime: 510, segment: "Alimentacao" },
];

const statusColor = (s: Status) =>
  s === "online" ? T.success : s === "warning" ? T.warning : T.danger;

export default function MapView({ onBack, onNavigate }: Props) {
  const [selected, setSelected] = useState<Screen | null>(null);

  return (
    <div className="h-screen flex flex-col" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      <div className="flex-shrink-0 border-b px-6 py-4 flex items-center gap-4" style={{ background: T.panel, borderColor: T.border }}>
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5"><ArrowLeft size={18} style={{ color: T.textSub }} /></button>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.success + "20" }}>
            <MapPin size={18} style={{ color: T.success }} />
          </div>
          <div>
            <h1 className="font-black text-lg">Mapa da Rede ao Vivo</h1>
            <p className="text-xs" style={{ color: T.textSub }}>{SCREENS.filter(s => s.status === "online").length} online</p>
          </div>
        </div>
      </div>
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 relative overflow-hidden" style={{ background: "#020510" }}>
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
            {SCREENS.map(screen => {
              const color = statusColor(screen.status);
              const isSelected = selected?.id === screen.id;
              return (
                <g key={screen.id} onClick={() => setSelected(isSelected ? null : screen)} style={{ cursor: "pointer" }}>
                  <circle cx={screen.lng} cy={screen.lat} r={isSelected ? 2.2 : 1.6}
                    fill={color} stroke={isSelected ? "#fff" : color + "80"} strokeWidth={isSelected ? 0.5 : 0.2} />
                </g>
              );
            })}
          </svg>
        </div>
        <div className="w-80 flex-shrink-0 border-l" style={{ borderColor: T.border }}>
          {SCREENS.map(s => (
            <div key={s.id} onClick={() => setSelected(s)}
              className="px-4 py-3 border-b cursor-pointer flex items-center gap-3"
              style={{ borderColor: T.border }}>
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: statusColor(s.status) }} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{s.name}</div>
                <div className="text-xs truncate" style={{ color: T.textSub }}>{s.city}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
