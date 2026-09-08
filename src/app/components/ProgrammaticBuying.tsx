import { useState } from "react";
import {
  ArrowLeft, Zap, TrendingUp, DollarSign, Target, Clock, Play, Pause,
  Filter, RefreshCw, ChevronUp, ChevronDown, ArrowUpRight, Activity,
  BarChart2, Globe, Layers, Brain
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from "recharts";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

interface Props { onBack: () => void; onNavigate?: (v: string) => void; }

// Simulated auction feed
const AUCTION_LOG = Array.from({ length: 18 }, (_, i) => ({
  id: `AUC-${9000 + i}`,
  screen: ["Shopping Ibirapuera","Metro Paulista","Av. Paulista","GRU T2","Iguatemi SP","Rodoviária Tietê"][i % 6],
  slot: ["09:00","09:15","09:30","10:00","10:15","11:00"][i % 6],
  floorCPM: 28 + (i % 5) * 4,
  clearingCPM: 35 + (i % 8) * 3,
  bidders: 3 + (i % 5),
  winner: ["iFood OOH","Carrefour","Burguer Co","FitLife","Pet Center"][i % 5],
  impressions: 800 + (i % 12) * 150,
  status: i < 14 ? "cleared" : i < 16 ? "nobid" : "pending",
}));

const SPEND_TREND = Array.from({ length: 14 }, (_, i) => ({
  day: `D-${13 - i}`,
  spend: 1200 + i * 180 + Math.random() * 300,
  impressions: 14000 + i * 2200 + Math.random() * 3000,
}));

const DEMAND_SOURCES = [
  { name: "DOOHPLAY Direct",   share: 42, cpm: 52, budget: 28400, color: T.primary },
  { name: "Trade Desk",        share: 22, cpm: 38, budget: 14800, color: T.accent },
  { name: "DV360",             share: 18, cpm: 35, budget: 12100, color: T.success },
  { name: "Xandr",             share: 10, cpm: 31, budget: 6700,  color: T.gold },
  { name: "Outros DSPs",       share: 8,  cpm: 28, budget: 5400,  color: T.textSub },
];

const ACTIVE_DEALS = [
  { id: "DEAL-001", buyer: "iFood OOH",     type: "PG",     cpm: 62, budget: 15000, pacing: 78, status: "active" },
  { id: "DEAL-002", buyer: "Carrefour OOH", type: "PMP",    cpm: 45, budget: 8000,  pacing: 91, status: "active" },
  { id: "DEAL-003", buyer: "Unilever DOOH", type: "PG",     cpm: 58, budget: 22000, pacing: 45, status: "active" },
  { id: "DEAL-004", buyer: "Bradesco Ads",  type: "OA",     cpm: 34, budget: 5000,  pacing: 63, status: "paused" },
  { id: "DEAL-005", buyer: "Ambev Media",   type: "PMP",    cpm: 48, budget: 11000, pacing: 88, status: "active" },
];

const DEAL_TYPE_COLOR: Record<string, string> = { PG: T.gold, PMP: T.primary, OA: T.textSub };
const DEAL_TYPE_LABEL: Record<string, string> = { PG: "Programmatic Guaranteed", PMP: "Private Marketplace", OA: "Open Auction" };

function PacingBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full" style={{ background: T.border }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-xs font-bold w-7" style={{ color }}>{pct}%</span>
    </div>
  );
}

export default function ProgrammaticBuying({ onBack, onNavigate }: Props) {
  const [activeView, setActiveView] = useState<"marketplace"|"deals"|"auction"|"analytics">("marketplace");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [simulTick, setSimulTick] = useState(0);

  const totalSpend = ACTIVE_DEALS.reduce((s, d) => s + d.budget, 0);
  const activeDeals = ACTIVE_DEALS.filter(d => d.status === "active").length;

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5">
              <ArrowLeft size={18} style={{ color: T.textSub }} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.gold + "20" }}>
                <Globe size={18} style={{ color: T.gold }} />
              </div>
              <div>
                <h1 className="font-black text-lg">Programmatic Buying</h1>
                <p className="text-xs" style={{ color: T.textSub }}>SSP/DSP · Open Auction · PMP · PG</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs"
              style={{ background: autoRefresh ? T.success + "10" : T.card, color: autoRefresh ? T.success : T.textSub, border: `1px solid ${autoRefresh ? T.success + "30" : T.border}` }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: autoRefresh ? T.success : T.textSub, animation: autoRefresh ? "pulse 1s infinite" : "none" }} />
              Live
            </div>
            <button onClick={() => setAutoRefresh(!autoRefresh)} className="p-2 rounded-lg hover:bg-white/5">
              <RefreshCw size={15} style={{ color: T.textSub }} />
            </button>
          </div>
        </div>

        {/* Sub nav */}
        <div className="max-w-7xl mx-auto px-6 flex gap-1 pb-3">
          {(["marketplace","Marketplace"],["deals","Deals Privados"],["auction","Auction Log"],["analytics","Analytics"] as const).map(([id, label]) => (
            <button key={id} onClick={() => setActiveView(id)}
              className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
              style={{ background: activeView === id ? T.gold + "20" : "transparent", color: activeView === id ? T.gold : T.textSub, border: `1px solid ${activeView === id ? T.gold + "30" : "transparent"}` }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">

        {/* KPIs */}
        <div className="grid grid-cols-5 gap-4">
          {[
            { label: "Spend Total/Mês",     value: `R$${(totalSpend/1000).toFixed(0)}k`, color: T.gold, icon: DollarSign },
            { label: "Deals Ativos",         value: activeDeals,                          color: T.success, icon: Layers },
            { label: "Fill Rate",            value: "87%",                                color: T.primary, icon: Target },
            { label: "CPM Médio Clearing",   value: "R$44",                               color: T.accent, icon: TrendingUp },
            { label: "Impressões/Hora",      value: "18.4k",                              color: T.warning, icon: Activity },
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

        {/* MARKETPLACE */}
        {activeView === "marketplace" && (
          <>
            <div className="grid grid-cols-2 gap-6">
              {/* Spend trend */}
              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black mb-1">Spend dos Últimos 14 Dias</h3>
                <p className="text-xs mb-4" style={{ color: T.textSub }}>R$ investido via programático</p>
                <ResponsiveContainer width="100%" height={160}>
                  <AreaChart data={SPEND_TREND}>
                    <defs>
                      <linearGradient key="grad-spend" id="grad-spend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={T.gold} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={T.gold} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" tick={{ fill: T.textSub, fontSize: 10 }} axisLine={false} tickLine={false} interval={2} />
                    <YAxis hide />
                    <Tooltip contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10 }} formatter={(v: number) => [`R$${v.toFixed(0)}`, "Spend"]} />
                    <Area key="area-spend" type="monotone" dataKey="spend" stroke={T.gold} fill="url(#grad-spend)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Demand sources */}
              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black mb-4">Fontes de Demanda (DSPs)</h3>
                <div className="space-y-3">
                  {DEMAND_SOURCES.map(ds => (
                    <div key={ds.name}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ background: ds.color }} />
                          <span className="text-sm font-bold">{ds.name}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                          <span style={{ color: T.textSub }}>CPM R${ds.cpm}</span>
                          <span className="font-black" style={{ color: ds.color }}>{ds.share}%</span>
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full" style={{ background: T.border }}>
                        <div className="h-full rounded-full" style={{ width: `${ds.share * 2.4}%`, background: ds.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floor / ceiling CPM by screen */}
            <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-black mb-4">Floor Price por Tela</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={[
                  { screen: "Shopping IB", floor: 42, clearing: 58 },
                  { screen: "Metro PL",    floor: 28, clearing: 35 },
                  { screen: "Av. Paulista",floor: 22, clearing: 31 },
                  { screen: "GRU T2",      floor: 55, clearing: 72 },
                  { screen: "Iguatemi",    floor: 48, clearing: 65 },
                  { screen: "Rodoviária",  floor: 30, clearing: 38 },
                ]}>
                  <XAxis dataKey="screen" tick={{ fill: T.textSub, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: T.textSub, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${v}`} />
                  <Tooltip contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10 }} formatter={(v: number) => [`R$${v}`, ""]} />
                  <Bar key="bar-floor" dataKey="floor" fill={T.textSub + "80"} radius={[4,4,0,0]} />
                  <Bar key="bar-clearing" dataKey="clearing" fill={T.gold} radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {/* DEALS */}
        {activeView === "deals" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black">Deals Privados Ativos</h3>
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black"
                style={{ background: T.primary, color: "#fff" }}>
                + Novo Deal
              </button>
            </div>
            {ACTIVE_DEALS.map(deal => (
              <div key={deal.id} className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-black text-base">{deal.buyer}</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-black" style={{ background: DEAL_TYPE_COLOR[deal.type] + "20", color: DEAL_TYPE_COLOR[deal.type] }}>
                        {deal.type}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                        style={{ background: deal.status === "active" ? T.success + "15" : T.warning + "15", color: deal.status === "active" ? T.success : T.warning }}>
                        {deal.status === "active" ? "Ativo" : "Pausado"}
                      </span>
                    </div>
                    <div className="text-xs" style={{ color: T.textSub }}>{deal.id} · {DEAL_TYPE_LABEL[deal.type]}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded-lg hover:bg-white/5">
                      {deal.status === "active"
                        ? <Pause size={15} style={{ color: T.warning }} />
                        : <Play size={15} style={{ color: T.success }} />}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <div className="text-xs mb-0.5" style={{ color: T.textSub }}>CPM Garantido</div>
                    <div className="font-black text-xl" style={{ color: T.gold }}>R${deal.cpm}</div>
                  </div>
                  <div>
                    <div className="text-xs mb-0.5" style={{ color: T.textSub }}>Budget</div>
                    <div className="font-black text-xl">R${deal.budget.toLocaleString("pt-BR")}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs mb-1.5" style={{ color: T.textSub }}>Pacing do Mês</div>
                    <PacingBar pct={deal.pacing} color={deal.pacing > 80 ? T.success : deal.pacing > 50 ? T.warning : T.danger} />
                    <div className="text-xs mt-1" style={{ color: T.textSub }}>
                      R${Math.round(deal.budget * deal.pacing / 100).toLocaleString("pt-BR")} investido de R${deal.budget.toLocaleString("pt-BR")}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* AUCTION LOG */}
        {activeView === "auction" && (
          <div className="rounded-2xl border overflow-hidden" style={{ borderColor: T.border }}>
            <div className="flex items-center justify-between p-4" style={{ background: T.card, borderBottom: `1px solid ${T.border}` }}>
              <div>
                <h3 className="font-black">Log de Leilões em Tempo Real</h3>
                <p className="text-xs mt-0.5" style={{ color: T.textSub }}>Últimas 18 transações · Atualização a cada 3s</p>
              </div>
              <div className="flex items-center gap-2 text-xs" style={{ color: T.success }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: T.success, animation: "pulse 1s infinite" }} />
                Live feed
              </div>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: T.panel, borderBottom: `1px solid ${T.border}` }}>
                  {["Leilão","Tela","Horário","Floor CPM","Clearing CPM","Licitantes","Vencedor","Impressões","Status"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold" style={{ color: T.textSub }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {AUCTION_LOG.map((a, i) => (
                  <tr key={i} className="border-b hover:bg-white/3" style={{ borderColor: T.border + "60" }}>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: T.textSub }}>{a.id}</td>
                    <td className="px-4 py-3 text-xs font-bold truncate max-w-28">{a.screen}</td>
                    <td className="px-4 py-3 text-xs font-mono">{a.slot}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: T.textSub }}>R${a.floorCPM}</td>
                    <td className="px-4 py-3">
                      <span className="font-black text-xs" style={{ color: T.gold }}>R${a.clearingCPM}</span>
                    </td>
                    <td className="px-4 py-3 text-xs font-bold">{a.bidders}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: T.accent }}>{a.status !== "nobid" ? a.winner : "—"}</td>
                    <td className="px-4 py-3 text-xs">{a.impressions.toLocaleString("pt-BR")}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                        style={{ background: a.status === "cleared" ? T.success + "20" : a.status === "nobid" ? T.danger + "20" : T.warning + "20", color: a.status === "cleared" ? T.success : a.status === "nobid" ? T.danger : T.warning }}>
                        {a.status === "cleared" ? "Fechado" : a.status === "nobid" ? "Sem Bid" : "Pendente"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ANALYTICS */}
        {activeView === "analytics" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black mb-1">Impressões × Spend</h3>
                <p className="text-xs mb-4" style={{ color: T.textSub }}>14 dias de histórico programático</p>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={SPEND_TREND}>
                    <defs>
                      <linearGradient key="grad-imp" id="grad-imp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={T.primary} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={T.primary} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" tick={{ fill: T.textSub, fontSize: 10 }} axisLine={false} tickLine={false} interval={2} />
                    <YAxis yAxisId="left" hide />
                    <YAxis yAxisId="right" orientation="right" hide />
                    <Tooltip contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10 }} />
                    <Area key="area-impressions" yAxisId="left" type="monotone" dataKey="impressions" stroke={T.primary} fill="url(#grad-imp)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black mb-4">Recomendações IA</h3>
                <div className="space-y-3">
                  {[
                    { tip: "Aumentar floor da GRU T2 em 15%", impact: "+R$2.800/mês", color: T.gold },
                    { tip: "Criar PMP exclusivo para segmento 'Executivos'", impact: "+R$5.200/mês", color: T.success },
                    { tip: "Expandir janela 18h–20h para open auction", impact: "+R$1.400/mês", color: T.primary },
                    { tip: "Ativar Deal ID com DV360 para Unilever", impact: "+R$3.100/mês", color: T.accent },
                  ].map((r, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: T.panel }}>
                      <Brain size={14} style={{ color: r.color, flexShrink: 0, marginTop: 1 }} />
                      <div className="flex-1">
                        <div className="text-sm">{r.tip}</div>
                        <div className="text-xs font-black mt-0.5" style={{ color: r.color }}>{r.impact}</div>
                      </div>
                      <button className="text-xs font-bold" style={{ color: r.color }}>Aplicar</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
