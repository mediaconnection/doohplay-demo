import { useState } from "react";
import {
  ArrowLeft, Monitor, MapPin, Calendar, Package, DollarSign, TrendingUp,
  Search, Plus, Eye, CheckCircle, X, BarChart2, Grid, List
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

interface Props { onBack: () => void; onNavigate?: (v: string) => void; }

type ScreenStatus = "available" | "booked" | "maintenance" | "reserved";
type ScreenType = "indoor" | "outdoor" | "transit" | "retail";

interface Screen {
  id: string;
  name: string;
  city: string;
  state: string;
  type: ScreenType;
  status: ScreenStatus;
  resolution: string;
  cpm: number;
  impressionsDay: number;
  occupancy: number;
  rating: number;
  owner: string;
}

const TYPE_META: Record<ScreenType, { label: string; color: string }> = {
  indoor:  { label: "Indoor",   color: T.primary },
  outdoor: { label: "Outdoor",  color: T.success },
  transit: { label: "Trânsito", color: T.accent  },
  retail:  { label: "Retail",   color: T.gold    },
};

const STATUS_META: Record<ScreenStatus, { label: string; color: string }> = {
  available:   { label: "Disponível", color: T.success },
  booked:      { label: "Reservada",  color: T.warning },
  maintenance: { label: "Manutenção", color: T.danger  },
  reserved:    { label: "Bloqueada",  color: T.textSub },
};

const SCREENS: Screen[] = [
  { id: "SCR-001", name: "Shopping Ibirapuera — Entrada Principal",  city: "São Paulo",      state: "SP", type: "indoor",  status: "available",   resolution: "1920×1080", cpm: 42, impressionsDay: 28000, occupancy: 78,  rating: 4.8, owner: "MediaHub SP" },
  { id: "SCR-002", name: "Av. Paulista 1000 — Fachada",              city: "São Paulo",      state: "SP", type: "outdoor", status: "booked",      resolution: "3840×2160", cpm: 65, impressionsDay: 54000, occupancy: 95,  rating: 4.9, owner: "DOOHPLAY" },
  { id: "SCR-003", name: "Metrô Paulista — Plataforma",              city: "São Paulo",      state: "SP", type: "transit", status: "available",   resolution: "1920×1080", cpm: 38, impressionsDay: 42000, occupancy: 65,  rating: 4.6, owner: "DOOHPLAY" },
  { id: "SCR-004", name: "Aeroporto GRU — Terminal 2",               city: "Guarulhos",      state: "SP", type: "indoor",  status: "booked",      resolution: "3840×2160", cpm: 88, impressionsDay: 18000, occupancy: 100, rating: 5.0, owner: "MediaHub SP" },
  { id: "SCR-005", name: "Shopping Iguatemi — Praça Alimentação",    city: "São Paulo",      state: "SP", type: "retail",  status: "available",   resolution: "1920×1080", cpm: 55, impressionsDay: 22000, occupancy: 71,  rating: 4.7, owner: "OOH Nordeste" },
  { id: "SCR-006", name: "Rodoviária Tietê — Hall Central",          city: "São Paulo",      state: "SP", type: "transit", status: "maintenance", resolution: "1920×1080", cpm: 35, impressionsDay: 0,     occupancy: 0,   rating: 4.5, owner: "DOOHPLAY" },
  { id: "SCR-007", name: "Shopping Barra — Corredor A",              city: "Salvador",       state: "BA", type: "indoor",  status: "available",   resolution: "1920×1080", cpm: 31, impressionsDay: 16000, occupancy: 58,  rating: 4.4, owner: "OOH Nordeste" },
  { id: "SCR-008", name: "Av. Boa Viagem — Digital Outdoor",         city: "Recife",         state: "PE", type: "outdoor", status: "reserved",    resolution: "3840×2160", cpm: 28, impressionsDay: 38000, occupancy: 0,   rating: 4.3, owner: "Tela Digital Sul" },
  { id: "SCR-009", name: "BH Shopping — Acesso Leste",               city: "Belo Horizonte", state: "MG", type: "retail",  status: "available",   resolution: "1920×1080", cpm: 36, impressionsDay: 19000, occupancy: 62,  rating: 4.6, owner: "DOOHPLAY" },
  { id: "SCR-010", name: "Parque Ibirapuera — Portão 10",            city: "São Paulo",      state: "SP", type: "outdoor", status: "available",   resolution: "1920×1080", cpm: 48, impressionsDay: 31000, occupancy: 82,  rating: 4.8, owner: "DOOHPLAY" },
];

const OCC_TREND = [
  { month: "Ago", occupancy: 61, revenue: 38000 },
  { month: "Set", occupancy: 65, revenue: 42000 },
  { month: "Out", occupancy: 72, revenue: 49000 },
  { month: "Nov", occupancy: 85, revenue: 62000 },
  { month: "Dez", occupancy: 91, revenue: 71000 },
  { month: "Jan", occupancy: 78, revenue: 55000 },
  { month: "Fev", occupancy: 70, revenue: 48000 },
  { month: "Mar", occupancy: 74, revenue: 52000 },
  { month: "Abr", occupancy: 80, revenue: 59000 },
  { month: "Mai", occupancy: 84, revenue: 64000 },
  { month: "Jun", occupancy: 87, revenue: 68000 },
  { month: "Jul", occupancy: 82, revenue: 63000 },
];

const CPM_BY_TYPE = [
  { type: "Aeroporto", cpm: 88, color: T.gold    },
  { type: "Outdoor",   cpm: 56, color: T.success },
  { type: "Indoor",    cpm: 55, color: T.primary },
  { type: "Retail",    cpm: 46, color: T.warning },
  { type: "Trânsito",  cpm: 37, color: T.accent  },
];

const PACKAGES = [
  { id: "PKG-A", name: "São Paulo Premium",    screens: 4, duration: "30 dias", price: 48000, impressions: "4.2M", status: "available" },
  { id: "PKG-B", name: "Metrô & Trânsito SP",  screens: 6, duration: "15 dias", price: 22000, impressions: "2.8M", status: "available" },
  { id: "PKG-C", name: "Aeroportos Brasil",     screens: 3, duration: "7 dias",  price: 19800, impressions: "1.1M", status: "booked"    },
  { id: "PKG-D", name: "Shopping Premium Sul",  screens: 5, duration: "30 dias", price: 31000, impressions: "3.0M", status: "available" },
  { id: "PKG-E", name: "Mídia Exterior Verão",  screens: 8, duration: "30 dias", price: 56000, impressions: "7.4M", status: "available" },
];

export default function InventoryManager({ onBack, onNavigate }: Props) {
  const [tab, setTab]           = useState<"screens" | "packages" | "analytics">("screens");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [search, setSearch]     = useState("");
  const [statusFilter, setStatusFilter] = useState<ScreenStatus | "all">("all");
  const [selected, setSelected] = useState<Screen | null>(null);

  const filtered = SCREENS.filter(s => {
    if (statusFilter !== "all" && s.status !== statusFilter) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.city.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const available = SCREENS.filter(s => s.status === "available").length;
  const booked    = SCREENS.filter(s => s.status === "booked").length;
  const nonMaint  = SCREENS.filter(s => s.status !== "maintenance");
  const avgOcc    = Math.round(nonMaint.reduce((s, sc) => s + sc.occupancy, 0) / nonMaint.length);
  const totalImp  = SCREENS.reduce((s, sc) => s + sc.impressionsDay, 0);

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5">
              <ArrowLeft size={18} style={{ color: T.textSub }} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.primary + "20" }}>
                <Monitor size={18} style={{ color: T.primary }} />
              </div>
              <div>
                <h1 className="font-black text-lg">Inventory Manager</h1>
                <p className="text-xs" style={{ color: T.textSub }}>Telas, pacotes e disponibilidade em tempo real</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {(["screens","packages","analytics"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
                style={{ background: tab === t ? T.primary + "20" : "transparent", color: tab === t ? T.primary : T.textSub, border: `1px solid ${tab === t ? T.primary + "30" : "transparent"}` }}>
                {t === "screens" ? "Telas" : t === "packages" ? "Pacotes" : "Analytics"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Disponíveis",      value: available,                            color: T.success, icon: CheckCircle },
            { label: "Reservadas",        value: booked,                              color: T.warning, icon: Calendar    },
            { label: "Ocupação Média",    value: `${avgOcc}%`,                        color: T.primary, icon: BarChart2   },
            { label: "Impress. Diárias",  value: `${(totalImp / 1000).toFixed(0)}k`, color: T.gold,    icon: Eye         },
          ].map((k, i) => (
            <div key={i} className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3" style={{ background: k.color + "20" }}>
                <k.icon size={15} style={{ color: k.color }} />
              </div>
              <div className="font-black text-2xl" style={{ color: k.color }}>{k.value}</div>
              <div className="text-xs mt-0.5" style={{ color: T.textSub }}>{k.label}</div>
            </div>
          ))}
        </div>

        {/* SCREENS TAB */}
        {tab === "screens" && (
          <div className="flex gap-6">
            <div className="flex-1 min-w-0 space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 min-w-48">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: T.textSub }} />
                  <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Buscar telas..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm"
                    style={{ background: T.card, border: `1px solid ${T.border}`, color: T.text }} />
                </div>
                {(["all","available","booked","maintenance","reserved"] as const).map(f => {
                  const meta = f === "all" ? null : STATUS_META[f as ScreenStatus];
                  const color = meta?.color || T.primary;
                  return (
                    <button key={f} onClick={() => setStatusFilter(f)}
                      className="px-3 py-2 rounded-xl text-xs font-bold"
                      style={{ background: statusFilter === f ? color + "20" : T.card, color: statusFilter === f ? color : T.textSub, border: `1px solid ${statusFilter === f ? color + "30" : T.border}` }}>
                      {f === "all" ? "Todas" : meta!.label}
                    </button>
                  );
                })}
                <div className="flex items-center gap-1 ml-auto">
                  {([["list", List], ["grid", Grid]] as const).map(([mode, Icon]) => (
                    <button key={mode} onClick={() => setViewMode(mode)}
                      className="p-2 rounded-lg"
                      style={{ background: viewMode === mode ? T.primary + "20" : "transparent", color: viewMode === mode ? T.primary : T.textSub }}>
                      <Icon size={15} />
                    </button>
                  ))}
                </div>
              </div>

              {viewMode === "list" ? (
                <div className="rounded-2xl border overflow-hidden" style={{ borderColor: T.border }}>
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ background: T.card, borderBottom: `1px solid ${T.border}` }}>
                        {["Tela","Cidade","Tipo","CPM","Impress./dia","Ocup.","Status"].map(h => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-bold" style={{ color: T.textSub }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(screen => {
                        const tm = TYPE_META[screen.type];
                        const sm = STATUS_META[screen.status];
                        return (
                          <tr key={screen.id}
                            onClick={() => setSelected(selected?.id === screen.id ? null : screen)}
                            className="border-b cursor-pointer hover:bg-white/3 transition-colors"
                            style={{ borderColor: T.border + "50", background: selected?.id === screen.id ? T.primary + "08" : "transparent" }}>
                            <td className="px-4 py-3">
                              <div className="font-bold text-xs">{screen.name}</div>
                              <div className="text-xs" style={{ color: T.textSub }}>{screen.id} · {screen.resolution}</div>
                            </td>
                            <td className="px-4 py-3 text-xs">{screen.city}, {screen.state}</td>
                            <td className="px-4 py-3">
                              <span className="text-xs font-black" style={{ color: tm.color }}>{tm.label}</span>
                            </td>
                            <td className="px-4 py-3 text-xs font-black" style={{ color: T.gold }}>R${screen.cpm}</td>
                            <td className="px-4 py-3 text-xs">{screen.impressionsDay > 0 ? screen.impressionsDay.toLocaleString("pt-BR") : "—"}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5">
                                <div className="w-10 h-1.5 rounded-full" style={{ background: T.border }}>
                                  <div className="h-full rounded-full"
                                    style={{ width: `${screen.occupancy}%`, background: screen.occupancy >= 80 ? T.success : screen.occupancy >= 50 ? T.warning : T.danger }} />
                                </div>
                                <span className="text-xs">{screen.occupancy}%</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                                style={{ background: sm.color + "20", color: sm.color }}>{sm.label}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {filtered.map(screen => {
                    const tm = TYPE_META[screen.type];
                    const sm = STATUS_META[screen.status];
                    return (
                      <div key={screen.id}
                        onClick={() => setSelected(selected?.id === screen.id ? null : screen)}
                        className="p-4 rounded-2xl border cursor-pointer hover:bg-white/3 transition-all"
                        style={{ background: T.card, borderColor: selected?.id === screen.id ? T.primary + "60" : T.border }}>
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-xs font-black" style={{ color: tm.color }}>{tm.label}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                            style={{ background: sm.color + "20", color: sm.color }}>{sm.label}</span>
                        </div>
                        <div className="font-black text-sm leading-tight mb-1">{screen.name}</div>
                        <div className="text-xs mb-3" style={{ color: T.textSub }}>{screen.city}, {screen.state}</div>
                        <div className="flex justify-between text-xs">
                          <span style={{ color: T.gold }}>R${screen.cpm} CPM</span>
                          <span style={{ color: T.textSub }}>{screen.impressionsDay > 0 ? `${(screen.impressionsDay / 1000).toFixed(0)}k/dia` : "offline"}</span>
                          <span>{screen.occupancy}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Detail panel */}
            {selected && (
              <div className="w-64 flex-shrink-0 p-5 rounded-2xl border space-y-4" style={{ background: T.card, borderColor: T.border }}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold" style={{ color: T.textSub }}>{selected.id}</span>
                  <button onClick={() => setSelected(null)}><X size={13} style={{ color: T.textSub }} /></button>
                </div>
                <div>
                  <div className="font-black text-sm leading-snug">{selected.name}</div>
                  <div className="flex items-center gap-1 mt-1 text-xs" style={{ color: T.textSub }}>
                    <MapPin size={10} /> {selected.city}, {selected.state}
                  </div>
                </div>
                {[
                  { label: "Tipo",           value: TYPE_META[selected.type].label,    color: TYPE_META[selected.type].color },
                  { label: "Status",         value: STATUS_META[selected.status].label, color: STATUS_META[selected.status].color },
                  { label: "Resolução",      value: selected.resolution },
                  { label: "CPM",            value: `R$${selected.cpm}`,               color: T.gold },
                  { label: "Impressões/dia", value: selected.impressionsDay > 0 ? selected.impressionsDay.toLocaleString("pt-BR") : "—" },
                  { label: "Ocupação",       value: `${selected.occupancy}%`,           color: selected.occupancy >= 80 ? T.success : T.warning },
                  { label: "Dono",           value: selected.owner },
                  { label: "Avaliação",      value: `★ ${selected.rating}`,            color: T.gold },
                ].map((r, i) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span style={{ color: T.textSub }}>{r.label}</span>
                    <span className="font-bold" style={{ color: (r as any).color || T.text }}>{r.value}</span>
                  </div>
                ))}
                <div className="space-y-2 pt-2">
                  {selected.status === "available" && (
                    <button className="w-full py-2 rounded-xl text-xs font-black" style={{ background: T.success, color: "#000" }}>
                      Reservar Tela
                    </button>
                  )}
                  <button className="w-full py-2 rounded-xl text-xs font-bold"
                    style={{ background: T.primary + "20", color: T.primary, border: `1px solid ${T.primary}30` }}>
                    Ver Calendário
                  </button>
                  <button className="w-full py-2 rounded-xl text-xs font-bold"
                    style={{ background: T.border, color: T.textSub }}>
                    Editar Detalhes
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PACKAGES TAB */}
        {tab === "packages" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-black">Pacotes de Mídia</h2>
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black"
                style={{ background: T.primary, color: "#fff" }}>
                <Plus size={14} /> Criar Pacote
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {PACKAGES.map(pkg => (
                <div key={pkg.id} className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: T.primary + "20" }}>
                      <Package size={16} style={{ color: T.primary }} />
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                      style={{ background: pkg.status === "available" ? T.success + "20" : T.warning + "20", color: pkg.status === "available" ? T.success : T.warning }}>
                      {pkg.status === "available" ? "Disponível" : "Vendido"}
                    </span>
                  </div>
                  <div className="font-black mb-1">{pkg.name}</div>
                  <div className="text-xs mb-4" style={{ color: T.textSub }}>{pkg.screens} telas · {pkg.duration}</div>
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="font-black text-xl" style={{ color: T.gold }}>
                        R${pkg.price.toLocaleString("pt-BR")}
                      </div>
                      <div className="text-xs" style={{ color: T.textSub }}>{pkg.impressions} impressões</div>
                    </div>
                    {pkg.status === "available" && (
                      <button className="px-3 py-1.5 rounded-xl text-xs font-black"
                        style={{ background: T.primary, color: "#fff" }}>
                        Reservar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ANALYTICS TAB */}
        {tab === "analytics" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black mb-1">Ocupação & Receita — 12 meses</h3>
                <p className="text-xs mb-4" style={{ color: T.textSub }}>Ocupação média % e receita diária estimada</p>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={OCC_TREND}>
                    <defs>
                      <linearGradient id="grad-occ" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={T.primary} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={T.primary} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" tick={{ fill: T.textSub, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10 }}
                      formatter={(v: number, name: string) => [name === "occupancy" ? `${v}%` : `R$${(v / 1000).toFixed(0)}k`, name === "occupancy" ? "Ocupação" : "Receita"]} />
                    <Area type="monotone" dataKey="occupancy" stroke={T.primary} fill="url(#grad-occ)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black mb-4">CPM Médio por Tipo de Tela</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={CPM_BY_TYPE} barSize={28}>
                    <XAxis dataKey="type" tick={{ fill: T.textSub, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10 }}
                      formatter={(v: number) => [`R$${v}`, "CPM"]} />
                    <Bar dataKey="cpm" radius={[6, 6, 0, 0]}>
                      {CPM_BY_TYPE.map((entry, i) => (
                        <Cell key={`cell-cpm-${i}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-black mb-4">Top Telas por Receita Diária Estimada</h3>
              <div className="space-y-2">
                {SCREENS
                  .filter(s => s.status !== "maintenance")
                  .sort((a, b) => b.cpm * b.impressionsDay - a.cpm * a.impressionsDay)
                  .slice(0, 6)
                  .map((s, i) => {
                    const rev = Math.round(s.cpm * s.impressionsDay / 1000);
                    return (
                      <div key={s.id} className="flex items-center gap-4 p-3 rounded-xl" style={{ background: T.panel }}>
                        <div className="w-5 h-5 rounded-full flex items-center justify-center font-black text-xs flex-shrink-0"
                          style={{ background: i < 3 ? T.gold + "20" : T.border, color: i < 3 ? T.gold : T.textSub }}>
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold truncate">{s.name}</div>
                          <div className="text-xs" style={{ color: T.textSub }}>{s.city} · R${s.cpm} CPM · {(s.impressionsDay / 1000).toFixed(0)}k imp/dia</div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="font-black" style={{ color: T.gold }}>R${rev.toLocaleString("pt-BR")}</div>
                          <div className="text-xs" style={{ color: T.textSub }}>receita/dia</div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
