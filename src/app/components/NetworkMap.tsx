import { useState } from "react";
import { ArrowLeft, Activity, Wifi, WifiOff, AlertTriangle, CheckCircle2, XCircle, Monitor, Bell, ExternalLink } from "lucide-react";

const dark = { bg: "#020617", card: "#071225", border: "#13233E", sub: "#94A3B8" };

type ScreenStatus = "online" | "offline" | "warning" | "verified" | "critical";

interface CityNode {
  id: string;
  name: string;
  x: number; // percentage left
  y: number; // percentage top
  status: ScreenStatus;
  screens: { online: number; total: number };
  health: number;
  heartbeat: string;
  campaigns: number;
  revenue: string;
}

const cities: CityNode[] = [
  { id: "sp", name: "São Paulo", x: 42, y: 68, status: "online", screens: { online: 412, total: 430 }, health: 98, heartbeat: "2s atrás", campaigns: 47, revenue: "R$ 320K" },
  { id: "rj", name: "Rio de Janeiro", x: 54, y: 65, status: "online", screens: { online: 218, total: 224 }, health: 97, heartbeat: "4s atrás", campaigns: 28, revenue: "R$ 184K" },
  { id: "bh", name: "Belo Horizonte", x: 50, y: 58, status: "warning", screens: { online: 142, total: 156 }, health: 91, heartbeat: "12s atrás", campaigns: 19, revenue: "R$ 98K" },
  { id: "cwb", name: "Curitiba", x: 42, y: 76, status: "online", screens: { online: 98, total: 102 }, health: 96, heartbeat: "3s atrás", campaigns: 11, revenue: "R$ 71K" },
  { id: "poa", name: "Porto Alegre", x: 39, y: 84, status: "verified", screens: { online: 76, total: 78 }, health: 99, heartbeat: "1s atrás", campaigns: 9, revenue: "R$ 58K" },
  { id: "rec", name: "Recife", x: 70, y: 38, status: "warning", screens: { online: 54, total: 64 }, health: 84, heartbeat: "28s atrás", campaigns: 6, revenue: "R$ 41K" },
  { id: "ssa", name: "Salvador", x: 60, y: 48, status: "online", screens: { online: 88, total: 94 }, health: 94, heartbeat: "6s atrás", campaigns: 10, revenue: "R$ 62K" },
  { id: "for", name: "Fortaleza", x: 65, y: 30, status: "critical", screens: { online: 12, total: 48 }, health: 25, heartbeat: "5min atrás", campaigns: 2, revenue: "R$ 8K" },
  { id: "man", name: "Manaus", x: 27, y: 22, status: "offline", screens: { online: 0, total: 24 }, health: 0, heartbeat: "Sem sinal", campaigns: 0, revenue: "R$ 0" },
  { id: "bsb", name: "Brasília", x: 48, y: 48, status: "online", screens: { online: 89, total: 92 }, health: 97, heartbeat: "2s atrás", campaigns: 14, revenue: "R$ 104K" },
];

const statusConfig: Record<ScreenStatus, { color: string; label: string; icon: typeof Wifi }> = {
  online: { color: "#00A3FF", label: "Online", icon: Wifi },
  verified: { color: "#22C55E", label: "Verified", icon: CheckCircle2 },
  warning: { color: "#FACC15", label: "Warning", icon: AlertTriangle },
  offline: { color: "#64748B", label: "Offline", icon: WifiOff },
  critical: { color: "#EF4444", label: "Critical", icon: XCircle },
};

const connections = [
  { from: "sp", to: "rj" }, { from: "sp", to: "bh" }, { from: "sp", to: "cwb" },
  { from: "cwb", to: "poa" }, { from: "bh", to: "ssa" }, { from: "ssa", to: "rec" },
  { from: "bsb", to: "sp" }, { from: "bsb", to: "bh" }, { from: "bsb", to: "for" },
];

const filterOptions: { id: ScreenStatus | "all"; label: string; color: string }[] = [
  { id: "all", label: "Todos", color: "#64748B" },
  { id: "online", label: "Online", color: "#00A3FF" },
  { id: "verified", label: "Verified", color: "#22C55E" },
  { id: "warning", label: "Warning", color: "#FACC15" },
  { id: "offline", label: "Offline", color: "#64748B" },
  { id: "critical", label: "Critical", color: "#EF4444" },
];

interface NetworkMapProps {
  onBack: () => void;
}

export default function NetworkMap({ onBack }: NetworkMapProps) {
  const [activeFilter, setActiveFilter] = useState<ScreenStatus | "all">("all");
  const [selectedCity, setSelectedCity] = useState<CityNode | null>(null);

  const visibleCities = activeFilter === "all" ? cities : cities.filter(c => c.status === activeFilter);

  const getCityPos = (id: string) => cities.find(c => c.id === id);

  return (
    <div className="h-screen flex flex-col" style={{ background: dark.bg }}>
      {/* Header */}
      <header className="border-b px-6 py-4 flex items-center justify-between shrink-0" style={{ background: dark.card, borderColor: dark.border }}>
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5" style={{ color: dark.sub }}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="font-bold text-white" style={{ fontFamily: "'Inter Tight', sans-serif" }}>Network Map</h1>
            <p className="text-xs" style={{ color: dark.sub }}>1.247 telas · 10 cidades · Tempo real</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono" style={{ backgroundColor: "#22C55E20", color: "#22C55E" }}>
            <Activity size={11} className="animate-pulse" /> LIVE
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs border" style={{ color: "#EF4444", borderColor: "#EF444430", backgroundColor: "#EF444410" }}>
            <XCircle size={12} /> 1 crítico
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Map area */}
        <div className="flex-1 relative overflow-hidden">
          {/* Grid pattern overlay */}
          <div className="absolute inset-0" style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "32px 32px"
          }} />

          {/* Brazil SVG outline */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" style={{ opacity: 0.07 }}>
            <path
              d="M 25 15 L 32 12 L 40 10 L 50 12 L 58 10 L 66 14 L 72 20 L 74 28 L 72 34 L 68 38 L 70 44 L 66 50 L 62 56 L 58 60 L 56 66 L 52 72 L 48 78 L 44 82 L 42 86 L 40 88 L 38 85 L 36 82 L 38 78 L 36 74 L 32 78 L 28 82 L 26 78 L 28 74 L 24 70 L 22 66 L 24 62 L 20 58 L 18 54 L 20 50 L 16 46 L 18 40 L 22 34 L 20 28 L 22 22 L 25 15 Z"
              fill="white" stroke="white" strokeWidth="0.5"
            />
          </svg>

          {/* SVG connection lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {connections.map((conn, i) => {
              const from = getCityPos(conn.from);
              const to = getCityPos(conn.to);
              if (!from || !to) return null;
              return (
                <line
                  key={i}
                  x1={`${from.x}%`} y1={`${from.y}%`}
                  x2={`${to.x}%`} y2={`${to.y}%`}
                  stroke="#1E2D4A" strokeWidth="1" strokeDasharray="4 4"
                />
              );
            })}
          </svg>

          {/* City nodes */}
          {visibleCities.map((city) => {
            const cfg = statusConfig[city.status];
            const isSelected = selectedCity?.id === city.id;
            return (
              <div
                key={city.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                style={{ left: `${city.x}%`, top: `${city.y}%` }}
                onClick={() => setSelectedCity(isSelected ? null : city)}
              >
                {/* Pulse ring */}
                <div
                  className="absolute inset-0 rounded-full animate-ping opacity-30"
                  style={{ backgroundColor: cfg.color, width: 28, height: 28, transform: "translate(-6px,-6px)" }}
                />
                {/* Dot */}
                <div
                  className="relative w-4 h-4 rounded-full border-2 border-white/20 shadow-lg transition-transform group-hover:scale-125"
                  style={{ backgroundColor: cfg.color, boxShadow: `0 0 12px ${cfg.color}60`, transform: isSelected ? "scale(1.3)" : undefined }}
                />
                {/* Screen count badge */}
                <div
                  className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap"
                  style={{ backgroundColor: `${cfg.color}20`, color: cfg.color, border: `1px solid ${cfg.color}40` }}
                >
                  {city.screens.online}
                </div>
                {/* City label */}
                <div className="absolute top-5 left-1/2 -translate-x-1/2 text-[10px] font-medium text-white/70 whitespace-nowrap text-center">
                  {city.name}
                </div>
                {/* Hover tooltip */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  <div className="rounded-lg p-2.5 text-xs shadow-xl whitespace-nowrap" style={{ background: dark.card, border: `1px solid ${dark.border}` }}>
                    <p className="font-bold text-white">{city.name}</p>
                    <p style={{ color: cfg.color }}>{city.screens.online}/{city.screens.total} telas</p>
                    <p style={{ color: dark.sub }}>{city.revenue}</p>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Filter buttons */}
          <div className="absolute bottom-6 left-6 flex flex-wrap gap-2">
            {filterOptions.map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id as ScreenStatus | "all")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={activeFilter === f.id
                  ? { backgroundColor: `${f.color}25`, color: f.color, border: `1px solid ${f.color}50` }
                  : { backgroundColor: dark.card, color: dark.sub, border: `1px solid ${dark.border}` }
                }
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: f.color }} />
                {f.label}
              </button>
            ))}
          </div>

          {/* Summary strip top-left */}
          <div className="absolute top-4 left-4 flex gap-2">
            {[
              { status: "online" as ScreenStatus, count: cities.filter(c => c.status === "online").length },
              { status: "verified" as ScreenStatus, count: cities.filter(c => c.status === "verified").length },
              { status: "warning" as ScreenStatus, count: cities.filter(c => c.status === "warning").length },
              { status: "critical" as ScreenStatus, count: cities.filter(c => c.status === "critical").length },
              { status: "offline" as ScreenStatus, count: cities.filter(c => c.status === "offline").length },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs" style={{ background: dark.card, border: `1px solid ${dark.border}` }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: statusConfig[s.status].color }} />
                <span className="font-mono font-bold text-white">{s.count}</span>
                <span style={{ color: dark.sub }}>{statusConfig[s.status].label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div className="w-80 border-l flex flex-col overflow-hidden" style={{ background: dark.card, borderColor: dark.border }}>
          {selectedCity ? (
            <>
              <div className="p-5 border-b" style={{ borderColor: dark.border }}>
                <div className="flex items-center justify-between mb-1">
                  <h2 className="font-bold text-white" style={{ fontFamily: "'Inter Tight', sans-serif" }}>{selectedCity.name}</h2>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${statusConfig[selectedCity.status].color}20`, color: statusConfig[selectedCity.status].color }}>
                    {statusConfig[selectedCity.status].label}
                  </span>
                </div>
                <p className="text-xs" style={{ color: dark.sub }}>Último heartbeat: {selectedCity.heartbeat}</p>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {/* Health Score */}
                <div className="rounded-xl p-4" style={{ background: dark.bg }}>
                  <p className="text-xs mb-2" style={{ color: dark.sub }}>Health Score</p>
                  <div className="flex items-end gap-2 mb-2">
                    <span className="text-3xl font-extrabold" style={{ color: statusConfig[selectedCity.status].color, fontFamily: "'Inter Tight', sans-serif" }}>{selectedCity.health}</span>
                    <span className="text-sm mb-1" style={{ color: dark.sub }}>/100</span>
                  </div>
                  <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: dark.border }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${selectedCity.health}%`, backgroundColor: statusConfig[selectedCity.status].color }} />
                  </div>
                </div>

                {/* Screen breakdown */}
                <div className="space-y-2">
                  {[
                    { label: "Telas online", value: selectedCity.screens.online, color: "#00A3FF" },
                    { label: "Telas total", value: selectedCity.screens.total, color: dark.sub },
                    { label: "Campanhas ativas", value: selectedCity.campaigns, color: "#2563EB" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg" style={{ background: dark.bg }}>
                      <div className="flex items-center gap-2">
                        <Monitor size={13} style={{ color: item.color }} />
                        <span className="text-xs" style={{ color: dark.sub }}>{item.label}</span>
                      </div>
                      <span className="text-sm font-bold font-mono text-white">{item.value}</span>
                    </div>
                  ))}
                </div>

                {/* Revenue */}
                <div className="rounded-xl p-4 border" style={{ borderColor: "#22C55E30", backgroundColor: "#22C55E08" }}>
                  <p className="text-xs mb-1" style={{ color: dark.sub }}>Receita mensal</p>
                  <p className="text-xl font-bold" style={{ color: "#22C55E", fontFamily: "'Inter Tight', sans-serif" }}>{selectedCity.revenue}</p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <button className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-[#00A3FF] hover:opacity-90 flex items-center justify-center gap-2">
                    <ExternalLink size={14} /> Ver telas
                  </button>
                  {(selectedCity.status === "warning" || selectedCity.status === "critical" || selectedCity.status === "offline") && (
                    <button className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2" style={{ backgroundColor: "#EF444415", color: "#EF4444", border: "1px solid #EF444430" }}>
                      <Bell size={14} /> Abrir alerta
                    </button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="p-5 border-b" style={{ borderColor: dark.border }}>
                <h2 className="font-bold text-white" style={{ fontFamily: "'Inter Tight', sans-serif" }}>Todas as cidades</h2>
                <p className="text-xs mt-0.5" style={{ color: dark.sub }}>Clique em um ponto para detalhes</p>
              </div>
              <div className="flex-1 overflow-y-auto divide-y" style={{ borderColor: dark.border }}>
                {cities.map((city) => {
                  const cfg = statusConfig[city.status];
                  return (
                    <button
                      key={city.id}
                      onClick={() => setSelectedCity(city)}
                      className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-white/[0.02] transition-colors text-left"
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${cfg.color}15` }}>
                        <cfg.icon size={14} style={{ color: cfg.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white">{city.name}</p>
                        <p className="text-xs" style={{ color: dark.sub }}>{city.screens.online}/{city.screens.total} telas · {city.campaigns} campanhas</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-bold" style={{ color: cfg.color }}>{cfg.label}</p>
                        <p className="text-xs font-mono" style={{ color: dark.sub }}>{city.health}%</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
