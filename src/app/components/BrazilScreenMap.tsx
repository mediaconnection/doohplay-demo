import { useState, useMemo } from "react";
import { ArrowLeft, MapPin, Filter, Tv, Zap, TrendingUp, Search, RefreshCw, Layers } from "lucide-react";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

interface Props { onBack: () => void; onNavigate?: (v: string) => void; }

type ScreenType = "outdoor" | "indoor" | "transit" | "retail" | "airport";
type ScreenStatus = "online" | "offline" | "maintenance";

interface Screen {
  id: string; name: string; city: string; state: string;
  type: ScreenType; status: ScreenStatus;
  lat: number; lng: number;
  impressions: number; cpm: number; revenue: number;
}

const SCREENS: Screen[] = [
  { id:"sp1",  name:"Paulista Av.",      city:"São Paulo",       state:"SP", type:"outdoor",  status:"online",      lat:67, lng:43, impressions:48200, cpm:62, revenue:2988 },
  { id:"sp2",  name:"Shopping Ibirapuera",city:"São Paulo",      state:"SP", type:"retail",   status:"online",      lat:68, lng:44, impressions:22100, cpm:45, revenue:995  },
  { id:"sp3",  name:"Metrô Consolação",  city:"São Paulo",       state:"SP", type:"transit",  status:"online",      lat:67, lng:43, impressions:39800, cpm:38, revenue:1512 },
  { id:"sp4",  name:"Terminal Tietê",    city:"São Paulo",       state:"SP", type:"transit",  status:"maintenance", lat:66, lng:42, impressions:31200, cpm:36, revenue:1123 },
  { id:"sp5",  name:"Guarulhos T2",      city:"Guarulhos",       state:"SP", type:"airport",  status:"online",      lat:65, lng:41, impressions:16800, cpm:88, revenue:1478 },
  { id:"rj1",  name:"Ipanema Posto 9",   city:"Rio de Janeiro",  state:"RJ", type:"outdoor",  status:"online",      lat:72, lng:37, impressions:41500, cpm:58, revenue:2407 },
  { id:"rj2",  name:"Metrô Botafogo",    city:"Rio de Janeiro",  state:"RJ", type:"transit",  status:"online",      lat:73, lng:37, impressions:28900, cpm:40, revenue:1156 },
  { id:"rj3",  name:"Shopping Barra",    city:"Rio de Janeiro",  state:"RJ", type:"retail",   status:"offline",     lat:72, lng:36, impressions:0,      cpm:42, revenue:0    },
  { id:"rj4",  name:"Galeão T1",         city:"Rio de Janeiro",  state:"RJ", type:"airport",  status:"online",      lat:71, lng:36, impressions:19200, cpm:82, revenue:1574 },
  { id:"bh1",  name:"Savassi Praça",     city:"Belo Horizonte",  state:"MG", type:"outdoor",  status:"online",      lat:63, lng:37, impressions:32100, cpm:52, revenue:1669 },
  { id:"bh2",  name:"BH Shopping",       city:"Belo Horizonte",  state:"MG", type:"retail",   status:"online",      lat:62, lng:37, impressions:18700, cpm:40, revenue:748  },
  { id:"bsb1", name:"Eixo Monumental",   city:"Brasília",        state:"DF", type:"outdoor",  status:"online",      lat:55, lng:37, impressions:27800, cpm:55, revenue:1529 },
  { id:"bsb2", name:"BSB Internacional", city:"Brasília",        state:"DF", type:"airport",  status:"online",      lat:54, lng:36, impressions:15400, cpm:80, revenue:1232 },
  { id:"poa1", name:"Beira Rio",         city:"Porto Alegre",    state:"RS", type:"outdoor",  status:"online",      lat:80, lng:32, impressions:29400, cpm:50, revenue:1470 },
  { id:"poa2", name:"Moinhos Shopping",  city:"Porto Alegre",    state:"RS", type:"retail",   status:"online",      lat:81, lng:33, impressions:16200, cpm:38, revenue:616  },
  { id:"cwb1", name:"Batel Av.",         city:"Curitiba",        state:"PR", type:"outdoor",  status:"online",      lat:75, lng:35, impressions:31800, cpm:48, revenue:1526 },
  { id:"cwb2", name:"Afonso Pena",       city:"Curitiba",        state:"PR", type:"airport",  status:"online",      lat:74, lng:34, impressions:13100, cpm:78, revenue:1022 },
  { id:"ssa1", name:"Barra Orla",        city:"Salvador",        state:"BA", type:"outdoor",  status:"online",      lat:52, lng:45, impressions:24600, cpm:46, revenue:1132 },
  { id:"ssa2", name:"Salvador Shopping", city:"Salvador",        state:"BA", type:"retail",   status:"maintenance", lat:53, lng:46, impressions:0,      cpm:39, revenue:0    },
  { id:"rec1", name:"Boa Viagem Praia",  city:"Recife",          state:"PE", type:"outdoor",  status:"online",      lat:43, lng:50, impressions:22100, cpm:44, revenue:972  },
  { id:"for1", name:"Meireles Av. Beira Mar",city:"Fortaleza",   state:"CE", type:"outdoor",  status:"online",      lat:33, lng:51, impressions:20800, cpm:42, revenue:874  },
  { id:"mao1", name:"Adrianópolis Mall", city:"Manaus",          state:"AM", type:"retail",   status:"online",      lat:30, lng:28, impressions:14200, cpm:36, revenue:511  },
  { id:"bel1", name:"Hangar Centro",     city:"Belém",           state:"PA", type:"outdoor",  status:"online",      lat:26, lng:40, impressions:16400, cpm:38, revenue:623  },
  { id:"goi1", name:"Flamboyant Mall",   city:"Goiânia",         state:"GO", type:"retail",   status:"online",      lat:58, lng:36, impressions:17800, cpm:40, revenue:712  },
];

const TYPE_COLOR: Record<ScreenType, string> = {
  outdoor: T.primary, indoor: T.accent, transit: T.success, retail: T.gold, airport: T.warning,
};

const STATUS_COLOR: Record<ScreenStatus, string> = {
  online: T.success, offline: T.danger, maintenance: T.warning,
};

const BRAZIL_PATH = `
  M 220,20 L 260,15 L 310,22 L 360,30 L 400,45 L 430,55 L 460,75 L 475,95
  L 480,115 L 470,135 L 450,150 L 430,165 L 420,185 L 415,210 L 410,235
  L 405,255 L 395,270 L 380,280 L 365,295 L 355,315 L 350,340 L 355,365
  L 360,385 L 355,405 L 340,420 L 320,430 L 295,435 L 270,432 L 250,425
  L 235,410 L 225,395 L 215,375 L 200,355 L 188,335 L 178,310 L 165,290
  L 150,275 L 140,255 L 135,235 L 140,215 L 145,195 L 148,175 L 145,155
  L 135,140 L 120,128 L 108,115 L 100,100 L 105,82 L 118,68 L 135,55
  L 158,42 L 185,30 L 210,22 Z
`;

export default function BrazilScreenMap({ onBack }: Props) {
  const [selectedScreen, setSelectedScreen] = useState<Screen | null>(null);
  const [filterType, setFilterType]         = useState<ScreenType | "all">("all");
  const [filterStatus, setFilterStatus]     = useState<ScreenStatus | "all">("all");
  const [search, setSearch]                 = useState("");
  const [heatmap, setHeatmap]               = useState(false);
  const [hoveredId, setHoveredId]           = useState<string | null>(null);

  const filtered = useMemo(() => SCREENS.filter(s => {
    if (filterType !== "all" && s.type !== filterType) return false;
    if (filterStatus !== "all" && s.status !== filterStatus) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) &&
        !s.city.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [filterType, filterStatus, search]);

  const totalImpressions = filtered.reduce((a, s) => a + s.impressions, 0);
  const totalRevenue     = filtered.reduce((a, s) => a + s.revenue, 0);
  const onlineCount      = filtered.filter(s => s.status === "online").length;

  const toSvg = (s: Screen) => ({
    x: (s.lng / 100) * 500,
    y: (s.lat / 100) * 480,
  });

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-full px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5">
              <ArrowLeft size={18} style={{ color: T.textSub }} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.primary + "20" }}>
                <MapPin size={18} style={{ color: T.primary }} />
              </div>
              <div>
                <h1 className="font-black text-lg">Mapa de Telas Brasil</h1>
                <p className="text-xs" style={{ color: T.textSub }}>{filtered.length} telas · {onlineCount} online</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: T.card, border: `1px solid ${T.border}` }}>
              <Search size={13} style={{ color: T.textSub }} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar tela ou cidade…" className="bg-transparent outline-none text-sm w-40"
                style={{ color: T.text }} />
            </div>
            <button onClick={() => setHeatmap(h => !h)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all"
              style={{ background: heatmap ? T.accent + "25" : T.card, color: heatmap ? T.accent : T.textSub, border: `1px solid ${heatmap ? T.accent + "40" : T.border}` }}>
              <Layers size={13} /> Heatmap
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-73px)]">
        <div className="w-72 border-r flex flex-col" style={{ borderColor: T.border, background: T.panel }}>
          <div className="p-4 grid grid-cols-2 gap-2 border-b" style={{ borderColor: T.border }}>
            {[
              { label: "Impressões", value: (totalImpressions/1000).toFixed(0)+"k", color: T.primary },
              { label: "Receita hoje", value: "R$"+totalRevenue.toLocaleString("pt-BR"), color: T.gold },
              { label: "Online", value: onlineCount.toString(), color: T.success },
              { label: "Total", value: filtered.length.toString(), color: T.textSub },
            ].map((s, i) => (
              <div key={i} className="p-2.5 rounded-xl" style={{ background: T.card }}>
                <div className="font-black text-base" style={{ color: s.color }}>{s.value}</div>
                <div className="text-xs" style={{ color: T.textSub }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div className="p-4 border-b" style={{ borderColor: T.border }}>
            <div className="text-xs font-black mb-2" style={{ color: T.textSub }}>TIPO</div>
            <div className="flex flex-wrap gap-1.5">
              {(["all","outdoor","indoor","transit","retail","airport"] as const).map(t => (
                <button key={t} onClick={() => setFilterType(t)}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold transition-all capitalize"
                  style={{
                    background: filterType === t ? (t === "all" ? T.primary : TYPE_COLOR[t as ScreenType]) + "25" : T.card,
                    color: filterType === t ? (t === "all" ? T.primary : TYPE_COLOR[t as ScreenType]) : T.textSub,
                    border: `1px solid ${filterType === t ? (t === "all" ? T.primary : TYPE_COLOR[t as ScreenType]) + "50" : T.border}`,
                  }}>
                  {t === "all" ? "Todos" : t}
                </button>
              ))}
            </div>
            <div className="text-xs font-black mt-3 mb-2" style={{ color: T.textSub }}>STATUS</div>
            <div className="flex gap-1.5">
              {(["all","online","offline","maintenance"] as const).map(s => (
                <button key={s} onClick={() => setFilterStatus(s)}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold transition-all capitalize"
                  style={{
                    background: filterStatus === s ? (s === "all" ? T.primary : STATUS_COLOR[s as ScreenStatus]) + "20" : T.card,
                    color: filterStatus === s ? (s === "all" ? T.primary : STATUS_COLOR[s as ScreenStatus]) : T.textSub,
                    border: `1px solid ${filterStatus === s ? (s === "all" ? T.primary : STATUS_COLOR[s as ScreenStatus]) + "40" : T.border}`,
                  }}>
                  {s === "all" ? "Todos" : s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filtered.map(s => (
              <button key={s.id} onClick={() => setSelectedScreen(s === selectedScreen ? null : s)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left border-b transition-all hover:bg-white/3"
                style={{
                  borderColor: T.border,
                  background: selectedScreen?.id === s.id ? T.primary + "10" : "transparent",
                }}>
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: STATUS_COLOR[s.status] }} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold truncate" style={{ color: T.text }}>{s.name}</div>
                  <div className="text-xs" style={{ color: T.textSub }}>{s.city} · {s.state}</div>
                </div>
                <div className="text-xs font-black" style={{ color: TYPE_COLOR[s.type] }}>{s.type}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 relative overflow-hidden" style={{ background: T.bg }}>
          <svg viewBox="0 0 500 480" className="w-full h-full" style={{ maxHeight: "calc(100vh - 73px)" }}>
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke={T.border} strokeWidth="0.3" opacity="0.4" />
              </pattern>
              <radialGradient id="heatGrad">
                <stop offset="0%" stopColor={T.accent} stopOpacity="0.6" />
                <stop offset="100%" stopColor={T.accent} stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="500" height="480" fill="url(#grid)" />

            <path d={BRAZIL_PATH} fill={T.card} stroke={T.border} strokeWidth="1.5" opacity="0.7" />

            {[
              { label:"SP", x:248, y:310 }, { label:"RJ", x:272, y:290 }, { label:"MG", x:232, y:272 },
              { label:"DF", x:193, y:232 }, { label:"RS", x:165, y:358 }, { label:"PR", x:190, y:325 },
              { label:"BA", x:220, y:218 }, { label:"PE", x:247, y:193 }, { label:"CE", x:225, y:153 },
              { label:"AM", x:145, y:130 }, { label:"PA", x:195, y:115 }, { label:"GO", x:198, y:248 },
            ].map(st => (
              <text key={st.label} x={st.x} y={st.y} textAnchor="middle" fontSize="8" fill={T.textSub} opacity="0.5" fontFamily="Inter" fontWeight="700">{st.label}</text>
            ))}

            {heatmap && filtered.filter(s => s.status === "online").map(s => {
              const { x, y } = toSvg(s);
              const r = Math.sqrt(s.impressions / 500);
              return <circle key={`heat-${s.id}`} cx={x} cy={y} r={r} fill={`url(#heatGrad)`} opacity="0.35" />;
            })}

            {filtered.map(s => {
              const { x, y } = toSvg(s);
              const isSelected = selectedScreen?.id === s.id;
              const isHov = hoveredId === s.id;
              const col = STATUS_COLOR[s.status];
              const typeCol = TYPE_COLOR[s.type];
              return (
                <g key={s.id} style={{ cursor: "pointer" }}
                  onClick={() => setSelectedScreen(s === selectedScreen ? null : s)}
                  onMouseEnter={() => setHoveredId(s.id)}
                  onMouseLeave={() => setHoveredId(null)}>
                  {s.status === "online" && (
                    <circle cx={x} cy={y} r={isSelected ? 14 : 10} fill="none" stroke={typeCol} strokeWidth="1" opacity="0.3" />
                  )}
                  <circle cx={x} cy={y} r={isSelected ? 7 : isHov ? 6 : 5}
                    fill={isSelected ? typeCol : T.card}
                    stroke={s.status === "offline" ? T.danger : typeCol}
                    strokeWidth={isSelected ? 2.5 : 1.5} />
                  <circle cx={x} cy={y} r={2} fill={col} />
                  {(isSelected || isHov) && (
                    <text x={x} y={y - 10} textAnchor="middle" fontSize="7" fill={T.text} fontFamily="Inter" fontWeight="700">{s.city}</text>
                  )}
                </g>
              );
            })}
          </svg>

          {selectedScreen && (
            <div className="absolute bottom-6 right-6 w-72 p-4 rounded-2xl shadow-2xl"
              style={{ background: T.card, border: `1px solid ${TYPE_COLOR[selectedScreen.type]}40` }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-black">{selectedScreen.name}</div>
                  <div className="text-xs" style={{ color: T.textSub }}>{selectedScreen.city} · {selectedScreen.state}</div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs font-black capitalize"
                  style={{ background: STATUS_COLOR[selectedScreen.status] + "20", color: STATUS_COLOR[selectedScreen.status] }}>
                  {selectedScreen.status}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Impressões", value: (selectedScreen.impressions/1000).toFixed(1)+"k", color: T.primary },
                  { label: "CPM", value: `R$${selectedScreen.cpm}`, color: T.gold },
                  { label: "Receita", value: `R$${selectedScreen.revenue.toLocaleString("pt-BR")}`, color: T.success },
                ].map((m, i) => (
                  <div key={i} className="p-2 rounded-xl text-center" style={{ background: T.panel }}>
                    <div className="font-black text-sm" style={{ color: m.color }}>{m.value}</div>
                    <div className="text-xs" style={{ color: T.textSub }}>{m.label}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold capitalize"
                  style={{ background: TYPE_COLOR[selectedScreen.type] + "20", color: TYPE_COLOR[selectedScreen.type] }}>
                  {selectedScreen.type}
                </span>
                <span className="text-xs" style={{ color: T.textSub }}>ID: {selectedScreen.id}</span>
              </div>
            </div>
          )}

          <div className="absolute top-4 right-4 p-3 rounded-xl" style={{ background: T.panel + "E8", border: `1px solid ${T.border}` }}>
            <div className="text-xs font-black mb-2" style={{ color: T.textSub }}>TIPO</div>
            {(Object.entries(TYPE_COLOR) as [ScreenType, string][]).map(([type, color]) => (
              <div key={type} className="flex items-center gap-2 mb-1">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                <span className="text-xs capitalize" style={{ color: T.textSub }}>{type}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
