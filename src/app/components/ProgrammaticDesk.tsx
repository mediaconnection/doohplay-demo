import { useState } from "react";
import {
  ArrowLeft, Zap, TrendingUp, DollarSign, Activity, Filter,
  Play, Pause, Settings, Plus, ChevronRight, Globe, Eye,
  BarChart2, RefreshCw, Clock, Target, Shield, Layers
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid
} from "recharts";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

interface Props { onBack: () => void; onNavigate?: (v: string) => void; }

type TabId = "marketplace" | "deals" | "rtb";

interface InventoryListing {
  id: string;
  name: string;
  publisher: string;
  city: string;
  type: string;
  floorCpm: number;
  dailyAvailImp: number;
  occupancy: number;
  dealType: "open" | "pmp" | "programmatic-guaranteed";
  score: number;
}

interface Deal {
  id: string;
  name: string;
  publisher: string;
  type: "pmp" | "pg" | "open";
  floorCpm: number;
  budget: number;
  spent: number;
  impressions: number;
  status: "active" | "paused" | "pending";
  startDate: string;
  endDate: string;
}

const INVENTORY: InventoryListing[] = [
  { id: "INV001", name: "Av. Paulista 1000",      publisher: "OOH Media SP",  city: "São Paulo", type: "Outdoor",  floorCpm: 62, dailyAvailImp: 54000, occupancy: 72, dealType: "open",                    score: 98 },
  { id: "INV002", name: "Shopping Iguatemi",       publisher: "Mall Mídia",    city: "São Paulo", type: "Indoor",   floorCpm: 55, dailyAvailImp: 22000, occupancy: 88, dealType: "pmp",                     score: 94 },
  { id: "INV003", name: "Aeroporto GRU T2",        publisher: "AereoMídia",    city: "Guarulhos", type: "Trânsito", floorCpm: 84, dailyAvailImp: 18000, occupancy: 91, dealType: "programmatic-guaranteed", score: 99 },
  { id: "INV004", name: "Metrô Paulista",           publisher: "Transit Media", city: "São Paulo", type: "Trânsito", floorCpm: 36, dailyAvailImp: 42000, occupancy: 95, dealType: "open",                    score: 91 },
  { id: "INV005", name: "Shopping Boa Viagem",      publisher: "NordesteMídia", city: "Recife",    type: "Retail",   floorCpm: 32, dailyAvailImp: 19000, occupancy: 64, dealType: "open",                    score: 82 },
  { id: "INV006", name: "Rodoviária Novo Rio",      publisher: "Rio OOH",       city: "Rio",       type: "Trânsito", floorCpm: 30, dailyAvailImp: 32000, occupancy: 58, dealType: "pmp",                     score: 77 },
];

const DEALS: Deal[] = [
  { id: "DL001", name: "Ambev PMP Premium SP",   publisher: "OOH Media SP",  type: "pmp", floorCpm: 58, budget: 80000, spent: 52400, impressions: 903400, status: "active",  startDate: "01/07", endDate: "31/07" },
  { id: "DL002", name: "Bradesco PG Aeroportos", publisher: "AereoMídia",    type: "pg",  floorCpm: 82, budget: 120000, spent: 31200, impressions: 380400, status: "active",  startDate: "01/08", endDate: "30/09" },
  { id: "DL003", name: "iFood Open Exchange",    publisher: "Transit Media", type: "open",floorCpm: 34, budget: 45000, spent: 28900, impressions: 850000, status: "active",  startDate: "15/07", endDate: "14/08" },
  { id: "DL004", name: "Natura Retail Network",  publisher: "Mall Mídia",    type: "pmp", floorCpm: 52, budget: 30000, spent: 0,     impressions: 0,       status: "pending", startDate: "01/08", endDate: "31/08" },
];

const RTB_TREND = [
  { t: "00h", bids: 420,  wins: 310,  cpm: 38 },
  { t: "04h", bids: 210,  wins: 140,  cpm: 33 },
  { t: "08h", bids: 1840, wins: 1240, cpm: 54 },
  { t: "10h", bids: 3200, wins: 2100, cpm: 61 },
  { t: "12h", bids: 4100, wins: 2800, cpm: 64 },
  { t: "14h", bids: 3800, wins: 2600, cpm: 62 },
  { t: "16h", bids: 4400, wins: 3100, cpm: 67 },
  { t: "18h", bids: 5100, wins: 3600, cpm: 72 },
  { t: "20h", bids: 3900, wins: 2700, cpm: 65 },
  { t: "22h", bids: 2100, wins: 1400, cpm: 48 },
];

const DEAL_TYPE_META = {
  open: { label: "Open Exchange", color: T.primary  },
  pmp:  { label: "PMP",           color: T.accent   },
  pg:   { label: "PG",            color: T.gold     },
};

const STATUS_META = {
  active:  { label: "Ativo",    color: T.success },
  paused:  { label: "Pausado",  color: T.warning },
  pending: { label: "Pendente", color: T.textSub },
};

const WIN_RATE_BARS = RTB_TREND.map(r => ({ ...r, winRate: Math.round((r.wins / r.bids) * 100) }));

export default function ProgrammaticDesk({ onBack }: Props) {
  const [tab, setTab] = useState<TabId>("marketplace");
  const [bidFloor, setBidFloor] = useState("50");
  const [dealFilter, setDealFilter] = useState<string>("all");
  const [selected, setSelected] = useState<string | null>(null);

  const totalBudget  = DEALS.filter(d => d.status === "active").reduce((s, d) => s + d.budget, 0);
  const totalSpent   = DEALS.filter(d => d.status === "active").reduce((s, d) => s + d.spent, 0);
  const totalImp     = DEALS.reduce((s, d) => s + d.impressions, 0);
  const avgWinRate   = 68;

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
                <Zap size={18} style={{ color: T.primary }} />
              </div>
              <div>
                <h1 className="font-black text-lg">Programmatic Desk</h1>
                <p className="text-xs" style={{ color: T.textSub }}>DSP/SSP integrado — RTB, PMP e Programmatic Guaranteed para DOOH</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {(["marketplace","deals","rtb"] as TabId[]).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
                style={{ background: tab === t ? T.primary + "20" : "transparent", color: tab === t ? T.primary : T.textSub, border: `1px solid ${tab === t ? T.primary + "30" : "transparent"}` }}>
                {t === "marketplace" ? "Marketplace" : t === "deals" ? "Deals" : "RTB Monitor"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Budget Ativo",       value: `R$${(totalBudget/1000).toFixed(0)}k`,    color: T.gold,    icon: DollarSign },
            { label: "Gasto (mês)",        value: `R$${(totalSpent/1000).toFixed(1)}k`,     color: T.primary, icon: TrendingUp },
            { label: "Impressões RTB",     value: `${(totalImp/1000000).toFixed(1)}M`,      color: T.success, icon: Eye        },
            { label: "Win Rate médio",     value: `${avgWinRate}%`,                         color: T.accent,  icon: Target     },
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

        {/* MARKETPLACE TAB */}
        {tab === "marketplace" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="font-black">Inventário Disponível</h2>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: T.success + "20", color: T.success }}>
                  {INVENTORY.length} telas
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs" style={{ background: T.panel, border: `1px solid ${T.border}` }}>
                  <span style={{ color: T.textSub }}>Floor CPM mín:</span>
                  <span className="font-black" style={{ color: T.gold }}>R${bidFloor}</span>
                </div>
                <input type="range" min="20" max="100" value={bidFloor} onChange={e => setBidFloor(e.target.value)}
                  className="w-24" style={{ accentColor: T.primary }} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {INVENTORY.filter(inv => inv.floorCpm >= parseInt(bidFloor) - 20).map(inv => {
                const dtm = DEAL_TYPE_META[inv.dealType];
                const isOpen = selected === inv.id;
                return (
                  <div key={inv.id} onClick={() => setSelected(isOpen ? null : inv.id)}
                    className="p-4 rounded-2xl border cursor-pointer hover:bg-white/2 transition-all"
                    style={{ background: T.card, borderColor: isOpen ? T.primary + "50" : T.border }}>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: T.primary + "20" }}>
                        <Globe size={16} style={{ color: T.primary }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black">{inv.name}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                            style={{ background: dtm.color + "20", color: dtm.color }}>{dtm.label}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                            style={{ background: T.textSub + "20", color: T.textSub }}>{inv.type}</span>
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: T.textSub }}>
                          {inv.publisher} · {inv.city} · {(inv.dailyAvailImp/1000).toFixed(0)}k imp/dia disponíveis
                        </div>
                      </div>
                      <div className="flex items-center gap-6 flex-shrink-0">
                        <div className="text-right">
                          <div className="font-black" style={{ color: T.gold }}>R${inv.floorCpm}</div>
                          <div className="text-xs" style={{ color: T.textSub }}>floor CPM</div>
                        </div>
                        <div className="text-right">
                          <div className="font-black">{100 - inv.occupancy}%</div>
                          <div className="text-xs" style={{ color: T.textSub }}>disponível</div>
                        </div>
                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm"
                          style={{ background: T.accent + "20", color: T.accent }}>{inv.score}</div>
                        <button className="px-4 py-2 rounded-xl text-xs font-black"
                          style={{ background: T.primary, color: "#fff" }}>Licitar</button>
                      </div>
                    </div>

                    {isOpen && (
                      <div className="mt-4 pt-4 grid grid-cols-4 gap-3 border-t" style={{ borderColor: T.border }}>
                        {[
                          { label: "Disponível/dia", value: `${((100-inv.occupancy)/100*inv.dailyAvailImp/1000).toFixed(0)}k imp` },
                          { label: "Ocupação atual", value: `${inv.occupancy}%` },
                          { label: "CPM sugerido",   value: `R$${Math.round(inv.floorCpm * 1.15)}` },
                          { label: "Score DOOHPLAY", value: `${inv.score}/100` },
                        ].map((m, i) => (
                          <div key={i} className="p-3 rounded-xl text-center" style={{ background: T.panel }}>
                            <div className="font-black" style={{ color: T.text }}>{m.value}</div>
                            <div className="text-xs" style={{ color: T.textSub }}>{m.label}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* DEALS TAB */}
        {tab === "deals" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter size={14} style={{ color: T.textSub }} />
                {(["all","open","pmp","pg"] as const).map(f => (
                  <button key={f} onClick={() => setDealFilter(f)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold"
                    style={{ background: dealFilter === f ? T.accent + "20" : T.panel, color: dealFilter === f ? T.accent : T.textSub, border: `1px solid ${dealFilter === f ? T.accent + "30" : T.border}` }}>
                    {f === "all" ? "Todos" : DEAL_TYPE_META[f as keyof typeof DEAL_TYPE_META]?.label ?? f}
                  </button>
                ))}
              </div>
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black"
                style={{ background: T.primary, color: "#fff" }}>
                <Plus size={14} /> Novo Deal
              </button>
            </div>

            <div className="space-y-3">
              {DEALS.filter(d => dealFilter === "all" || d.type === dealFilter).map(deal => {
                const dtm = DEAL_TYPE_META[deal.type];
                const sm  = STATUS_META[deal.status];
                const pct = deal.budget > 0 ? Math.round((deal.spent / deal.budget) * 100) : 0;
                return (
                  <div key={deal.id} className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: dtm.color + "20" }}>
                        <Layers size={16} style={{ color: dtm.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black">{deal.name}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                            style={{ background: dtm.color + "20", color: dtm.color }}>{dtm.label}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                            style={{ background: sm.color + "20", color: sm.color }}>{sm.label}</span>
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: T.textSub }}>
                          {deal.publisher} · {deal.startDate} – {deal.endDate} · Floor R${deal.floorCpm} CPM
                        </div>
                        {deal.status !== "pending" && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span style={{ color: T.textSub }}>Budget utilizado</span>
                              <span className="font-black" style={{ color: T.gold }}>
                                R${(deal.spent/1000).toFixed(1)}k / R${(deal.budget/1000).toFixed(0)}k ({pct}%)
                              </span>
                            </div>
                            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: T.border }}>
                              <div className="h-full rounded-full transition-all"
                                style={{ width: `${pct}%`, background: pct > 90 ? T.danger : pct > 70 ? T.warning : T.success }} />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0">
                        <div className="text-right">
                          <div className="font-black">{(deal.impressions/1000000).toFixed(2)}M</div>
                          <div className="text-xs" style={{ color: T.textSub }}>impressões</div>
                        </div>
                        <div className="flex gap-1.5">
                          <button className="p-2 rounded-lg hover:bg-white/5">
                            {deal.status === "active" ? <Pause size={13} style={{ color: T.warning }} /> : <Play size={13} style={{ color: T.success }} />}
                          </button>
                          <button className="p-2 rounded-lg hover:bg-white/5">
                            <Settings size={13} style={{ color: T.textSub }} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* RTB MONITOR TAB */}
        {tab === "rtb" && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Bids/hora (agora)", value: "5.1k",  color: T.primary },
                { label: "Win Rate",           value: "70.6%", color: T.success },
                { label: "CPM médio ganho",    value: "R$67",  color: T.gold    },
              ].map((m, i) => (
                <div key={i} className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                  <div className="font-black text-2xl" style={{ color: m.color }}>{m.value}</div>
                  <div className="text-xs mt-0.5" style={{ color: T.textSub }}>{m.label}</div>
                </div>
              ))}
            </div>

            <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black">Bids × Wins — Hoje</h3>
                <button className="flex items-center gap-1.5 text-xs font-bold" style={{ color: T.primary }}>
                  <RefreshCw size={11} /> Ao vivo
                </button>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={RTB_TREND}>
                  <defs>
                    <linearGradient key="grad-bids" id="grad-bids" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={T.primary} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={T.primary} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient key="grad-wins" id="grad-wins" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={T.success} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={T.success} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="t" tick={{ fill: T.textSub, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10 }} />
                  <Area key="area-bids" type="monotone" dataKey="bids" stroke={T.primary} strokeWidth={2} fill="url(#grad-bids)" />
                  <Area key="area-wins" type="monotone" dataKey="wins" stroke={T.success} strokeWidth={2} fill="url(#grad-wins)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black mb-4 text-sm">Win Rate por Hora (%)</h3>
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={WIN_RATE_BARS} barSize={22}>
                    <XAxis dataKey="t" tick={{ fill: T.textSub, fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis hide domain={[0, 100]} />
                    <Tooltip contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10 }}
                      formatter={(v: number) => [`${v}%`, "Win Rate"]} />
                    <Bar key="bar-winrate" dataKey="winRate" radius={[4, 4, 0, 0]}>
                      {WIN_RATE_BARS.map((entry, i) => (
                        <Cell key={`cell-wr-${i}`} fill={entry.winRate > 70 ? T.success : entry.winRate > 55 ? T.primary : T.warning} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black mb-4 text-sm">CPM Médio por Hora (R$)</h3>
                <ResponsiveContainer width="100%" height={150}>
                  <LineChart data={RTB_TREND}>
                    <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
                    <XAxis dataKey="t" tick={{ fill: T.textSub, fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: T.textSub, fontSize: 9 }} axisLine={false} tickLine={false}
                      tickFormatter={v => `R$${v}`} domain={[25, 80]} />
                    <Tooltip contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10 }}
                      formatter={(v: number) => [`R$${v}`, "CPM"]} />
                    <Line key="line-cpm" type="monotone" dataKey="cpm" stroke={T.gold} strokeWidth={2.5}
                      dot={{ fill: T.gold, r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
