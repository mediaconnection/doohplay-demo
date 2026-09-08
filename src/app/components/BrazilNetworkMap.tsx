import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Wifi, WifiOff, TrendingUp, Eye, DollarSign, Filter, RefreshCw, ZoomIn, ZoomOut, Radio } from "lucide-react";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

interface ScreenPin {
  id: string;
  name: string;
  city: string;
  state: string;
  x: number;
  y: number;
  status: "online" | "offline" | "warning";
  impressions: number;
  revenue: number;
  screens: number;
}

const PINS: ScreenPin[] = [
  { id: "p1",  name: "São Paulo Hub",       city: "São Paulo",       state: "SP", x: 58, y: 72, status: "online",  impressions: 48200, revenue: 12400, screens: 124 },
  { id: "p2",  name: "Rio de Janeiro Hub",  city: "Rio de Janeiro",  state: "RJ", x: 63, y: 69, status: "online",  impressions: 31600, revenue: 8900,  screens: 87  },
  { id: "p3",  name: "Belo Horizonte",      city: "Belo Horizonte",  state: "MG", x: 60, y: 64, status: "online",  impressions: 18400, revenue: 5200,  screens: 52  },
  { id: "p4",  name: "Curitiba Hub",        city: "Curitiba",        state: "PR", x: 57, y: 78, status: "online",  impressions: 14100, revenue: 3800,  screens: 41  },
  { id: "p5",  name: "Porto Alegre",        city: "Porto Alegre",    state: "RS", x: 54, y: 86, status: "online",  impressions: 11300, revenue: 3100,  screens: 33  },
  { id: "p6",  name: "Salvador",            city: "Salvador",        state: "BA", x: 68, y: 50, status: "online",  impressions: 9800,  revenue: 2600,  screens: 28  },
  { id: "p7",  name: "Fortaleza",           city: "Fortaleza",       state: "CE", x: 70, y: 32, status: "warning", impressions: 7200,  revenue: 1900,  screens: 19  },
  { id: "p8",  name: "Recife",              city: "Recife",          state: "PE", x: 74, y: 42, status: "online",  impressions: 8400,  revenue: 2200,  screens: 24  },
  { id: "p9",  name: "Manaus",              city: "Manaus",          state: "AM", x: 30, y: 30, status: "warning", impressions: 3100,  revenue: 820,   screens: 8   },
  { id: "p10", name: "Belém",               city: "Belém",           state: "PA", x: 52, y: 26, status: "offline", impressions: 0,     revenue: 0,     screens: 5   },
  { id: "p11", name: "Brasília",            city: "Brasília",        state: "DF", x: 57, y: 56, status: "online",  impressions: 12800, revenue: 3400,  screens: 36  },
  { id: "p12", name: "Goiânia",             city: "Goiânia",         state: "GO", x: 54, y: 60, status: "online",  impressions: 7600,  revenue: 2000,  screens: 21  },
  { id: "p13", name: "Florianópolis",       city: "Florianópolis",   state: "SC", x: 56, y: 81, status: "online",  impressions: 6900,  revenue: 1850,  screens: 18  },
  { id: "p14", name: "Campo Grande",        city: "Campo Grande",    state: "MS", x: 47, y: 68, status: "online",  impressions: 4200,  revenue: 1100,  screens: 12  },
  { id: "p15", name: "Campinas",            city: "Campinas",        state: "SP", x: 57, y: 70, status: "online",  impressions: 8900,  revenue: 2400,  screens: 24  },
];

const STATUS_CFG = {
  online:  { color: T.success, label: "Online",    pulse: true  },
  warning: { color: T.warning, label: "Alerta",    pulse: false },
  offline: { color: T.danger,  label: "Offline",   pulse: false },
};

const BRAZIL_PATH = `
  M 285 30 L 310 25 L 340 28 L 365 22 L 390 30 L 410 25 L 435 35
  L 450 30 L 465 40 L 475 55 L 480 70 L 485 90 L 490 110
  L 495 130 L 490 150 L 495 165 L 500 180 L 510 195 L 520 205
  L 530 210 L 540 220 L 550 235 L 555 250 L 550 260 L 545 275
  L 540 285 L 535 300 L 520 310 L 510 325 L 500 335 L 490 345
  L 480 355 L 475 370 L 470 385 L 460 395 L 450 400 L 440 405
  L 430 400 L 420 390 L 410 380 L 400 375 L 385 380 L 375 390
  L 365 400 L 355 405 L 340 400 L 330 390 L 320 380 L 310 375
  L 295 380 L 285 390 L 275 400 L 265 410 L 255 415 L 245 410
  L 240 395 L 238 380 L 240 365 L 245 350 L 250 335 L 248 320
  L 245 305 L 240 290 L 235 275 L 230 260 L 225 245 L 220 230
  L 215 215 L 210 200 L 205 185 L 200 170 L 195 155 L 190 140
  L 185 125 L 180 110 L 175 95 L 170 80 L 165 65 L 160 50
  L 165 40 L 175 32 L 190 28 L 205 25 L 220 22 L 240 20
  L 260 22 L 275 28 Z
`;

interface Props {
  onBack: () => void;
  onNavigate?: (view: string) => void;
}

export default function BrazilNetworkMap({ onBack, onNavigate }: Props) {
  const [selected, setSelected] = useState<ScreenPin | null>(null);
  const [filter, setFilter] = useState<"all" | "online" | "warning" | "offline">("all");
  const [zoom, setZoom] = useState(1);
  const [liveCount, setLiveCount] = useState(Math.round(PINS.filter(p => p.status === "online").reduce((a, p) => a + p.screens, 0) * 0.92));

  useEffect(() => {
    const iv = setInterval(() => setLiveCount(c => c + Math.floor(Math.random() * 3) - 1), 3000);
    return () => clearInterval(iv);
  }, []);

  const filtered = PINS.filter(p => filter === "all" || p.status === filter);

  const totalScreens  = PINS.reduce((a, p) => a + p.screens, 0);
  const totalImpress  = PINS.reduce((a, p) => a + p.impressions, 0);
  const totalRevenue  = PINS.reduce((a, p) => a + p.revenue, 0);
  const onlineCount   = PINS.filter(p => p.status === "online").reduce((a, p) => a + p.screens, 0);

  const SVG_W = 680, SVG_H = 500;

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5"><ArrowLeft size={18} style={{ color: T.textSub }} /></button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.primary + "20" }}>
              <MapPin size={18} style={{ color: T.primary }} />
            </div>
            <div>
              <h1 className="font-black text-lg">Mapa da Rede DOOHPLAY</h1>
              <p className="text-xs" style={{ color: T.textSub }}>Brasil · {totalScreens} telas · {PINS.length} cidades</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
            style={{ background: T.success + "15", color: T.success }}>
            <Radio size={10} className="animate-pulse" /> {liveCount} ao vivo
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6 space-y-5">
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Total de telas",    value: totalScreens.toString(),                    icon: Eye,        color: T.primary },
            { label: "Online agora",      value: `${Math.round(onlineCount * 0.92)}`,        icon: Wifi,       color: T.success },
            { label: "Impressões/dia",    value: `${(totalImpress / 1000).toFixed(0)}K`,    icon: TrendingUp, color: T.accent },
            { label: "Receita mensal",    value: `R$${(totalRevenue / 1000).toFixed(0)}K`,  icon: DollarSign, color: T.gold   },
          ].map((k, i) => (
            <div key={i} className="rounded-xl border p-4" style={{ background: T.card, borderColor: T.border }}>
              <k.icon size={14} style={{ color: k.color }} className="mb-2" />
              <div className="font-black text-xl" style={{ color: k.color }}>{k.value}</div>
              <div className="text-xs mt-0.5" style={{ color: T.textSub }}>{k.label}</div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            {(["all", "online", "warning", "offline"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize"
                style={{
                  background: filter === f ? (f === "all" ? T.primary : STATUS_CFG[f]?.color ?? T.primary) : T.card,
                  color: filter === f ? "#fff" : T.textSub,
                  border: `1px solid ${filter === f ? "transparent" : T.border}`,
                }}>
                {f === "all" ? "Todas" : f === "online" ? "Online" : f === "warning" ? "Alerta" : "Offline"}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-1">
            <button onClick={() => setZoom(z => Math.min(z + 0.2, 1.8))}
              className="p-2 rounded-lg hover:bg-white/5"><ZoomIn size={15} style={{ color: T.textSub }} /></button>
            <button onClick={() => setZoom(z => Math.max(z - 0.2, 0.6))}
              className="p-2 rounded-lg hover:bg-white/5"><ZoomOut size={15} style={{ color: T.textSub }} /></button>
          </div>
        </div>

        <div className="rounded-2xl border overflow-hidden relative" style={{ background: T.card, borderColor: T.border }}>
          <div className="overflow-hidden" style={{ transform: `scale(${zoom})`, transformOrigin: "center center", transition: "transform 0.3s" }}>
            <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full" style={{ maxHeight: 480 }}>
              <defs>
                <radialGradient id="bnm-bg" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor={T.primary} stopOpacity={0.04} />
                  <stop offset="100%" stopColor={T.bg} stopOpacity={0} />
                </radialGradient>
                {PINS.map(p => (
                  <radialGradient key={`bnm-grad-${p.id}`} id={`bnm-glow-${p.id}`} cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor={STATUS_CFG[p.status].color} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={STATUS_CFG[p.status].color} stopOpacity={0} />
                  </radialGradient>
                ))}
              </defs>

              {[...Array(8)].map((_, i) => (
                <line key={`bnm-h-${i}`} x1={0} y1={(i + 1) * (SVG_H / 9)} x2={SVG_W} y2={(i + 1) * (SVG_H / 9)}
                  stroke={T.border} strokeWidth={0.5} strokeOpacity={0.4} />
              ))}
              {[...Array(10)].map((_, i) => (
                <line key={`bnm-v-${i}`} x1={(i + 1) * (SVG_W / 11)} y1={0} x2={(i + 1) * (SVG_W / 11)} y2={SVG_H}
                  stroke={T.border} strokeWidth={0.5} strokeOpacity={0.4} />
              ))}

              <path d={BRAZIL_PATH} fill={T.primary + "08"} stroke={T.primary + "30"} strokeWidth={1.5} />

              {[["p1","p2"],["p1","p3"],["p1","p4"],["p3","p11"],["p11","p6"],["p6","p8"],["p8","p7"]].map(([a, b], i) => {
                const pa = PINS.find(p => p.id === a)!;
                const pb = PINS.find(p => p.id === b)!;
                return (
                  <line key={`bnm-conn-${i}`}
                    x1={pa.x / 100 * SVG_W} y1={pa.y / 100 * SVG_H}
                    x2={pb.x / 100 * SVG_W} y2={pb.y / 100 * SVG_H}
                    stroke={T.primary} strokeWidth={0.8} strokeOpacity={0.2} strokeDasharray="3 4" />
                );
              })}

              {filtered.map(pin => {
                const cx = pin.x / 100 * SVG_W;
                const cy = pin.y / 100 * SVG_H;
                const cfg = STATUS_CFG[pin.status];
                const isSel = selected?.id === pin.id;
                const r = Math.max(6, Math.min(18, pin.screens / 8));

                return (
                  <g key={pin.id} onClick={() => setSelected(isSel ? null : pin)}
                    style={{ cursor: "pointer" }}>
                    <circle cx={cx} cy={cy} r={r * 3} fill={`url(#bnm-glow-${pin.id})`} />
                    {cfg.pulse && (
                      <circle cx={cx} cy={cy} r={r + 4} fill="none" stroke={cfg.color} strokeWidth={1}
                        strokeOpacity={0.5} style={{ animation: "ping 2s infinite" }} />
                    )}
                    <circle cx={cx} cy={cy} r={r}
                      fill={isSel ? cfg.color : cfg.color + "CC"}
                      stroke={isSel ? "#fff" : cfg.color}
                      strokeWidth={isSel ? 2.5 : 1.5} />
                    {pin.screens >= 15 && (
                      <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle"
                        fill="#fff" fontSize={r > 10 ? 7 : 6} fontWeight="bold">
                        {pin.screens}
                      </text>
                    )}
                    <text x={cx} y={cy + r + 10} textAnchor="middle"
                      fill={isSel ? cfg.color : T.textSub + "CC"} fontSize={8} fontWeight={isSel ? "bold" : "normal"}>
                      {pin.city}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="absolute bottom-3 left-3 flex items-center gap-3 text-xs px-3 py-1.5 rounded-full"
            style={{ background: T.bg + "E0", border: `1px solid ${T.border}` }}>
            {Object.entries(STATUS_CFG).map(([k, v]) => (
              <span key={k} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ background: v.color }} />
                <span style={{ color: T.textSub }}>{v.label}</span>
              </span>
            ))}
            <span style={{ color: T.textSub }}>· Tamanho = nº de telas</span>
          </div>
        </div>

        {selected && (
          <div className="rounded-2xl border p-5" style={{ background: `linear-gradient(135deg, ${STATUS_CFG[selected.status].color}08, ${T.card})`, borderColor: STATUS_CFG[selected.status].color + "30" }}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: STATUS_CFG[selected.status].color }} />
                  <h3 className="font-black text-lg">{selected.city}</h3>
                  <span className="text-sm font-bold" style={{ color: T.textSub }}>{selected.state}</span>
                </div>
                <p className="text-sm" style={{ color: T.textSub }}>{selected.name}</p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                style={{ background: STATUS_CFG[selected.status].color + "15", color: STATUS_CFG[selected.status].color }}>
                {STATUS_CFG[selected.status].label}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: "Telas",         value: selected.screens.toString(),                         color: T.primary },
                { label: "Impress./dia",  value: selected.impressions.toLocaleString("pt-BR"),        color: T.accent  },
                { label: "Receita/mês",   value: `R$${selected.revenue.toLocaleString("pt-BR")}`,    color: T.success },
              ].map((k, i) => (
                <div key={i} className="rounded-xl p-3 text-center" style={{ background: T.panel }}>
                  <div className="font-black text-lg" style={{ color: k.color }}>{k.value}</div>
                  <div className="text-xs" style={{ color: T.textSub }}>{k.label}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => onNavigate?.("screen-setup")}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold border hover:bg-white/5"
                style={{ borderColor: T.border, color: T.textSub }}>
                Instalar tela aqui
              </button>
              <button onClick={() => onNavigate?.("analytics-dashboard")}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold hover:opacity-90"
                style={{ background: STATUS_CFG[selected.status].color, color: selected.status === "online" ? "#05060E" : "#fff" }}>
                Ver Analytics
              </button>
            </div>
          </div>
        )}

        <div className="rounded-2xl border overflow-hidden" style={{ background: T.card, borderColor: T.border }}>
          <div className="px-5 py-3 border-b flex items-center justify-between" style={{ borderColor: T.border }}>
            <h3 className="font-bold">Ranking de cidades</h3>
            <span className="text-xs" style={{ color: T.textSub }}>por receita mensal</span>
          </div>
          <div className="divide-y" style={{ borderColor: T.border }}>
            {[...PINS].sort((a, b) => b.revenue - a.revenue).slice(0, 8).map((pin, i) => {
              const cfg = STATUS_CFG[pin.status];
              const maxRev = PINS[0]?.revenue ?? 1;
              return (
                <button key={pin.id} onClick={() => setSelected(pin)}
                  className="w-full flex items-center gap-3 px-5 py-3 hover:bg-white/2 transition-all text-left">
                  <span className="w-5 text-xs font-black text-center flex-shrink-0"
                    style={{ color: i < 3 ? T.gold : T.textSub }}>
                    {i + 1}
                  </span>
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cfg.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{pin.city}</div>
                    <div className="h-1 rounded-full mt-1" style={{ background: T.border }}>
                      <div className="h-full rounded-full" style={{ width: `${(pin.revenue / maxRev) * 100}%`, background: cfg.color + "80" }} />
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-black" style={{ color: T.success }}>R${pin.revenue.toLocaleString("pt-BR")}</div>
                    <div className="text-xs" style={{ color: T.textSub }}>{pin.screens} telas</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`@keyframes ping { 0%{transform:scale(1);opacity:0.8} 100%{transform:scale(2);opacity:0} }`}</style>
    </div>
  );
}
