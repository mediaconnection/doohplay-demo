import { useState } from "react";
import {
  DollarSign, Tv, Megaphone, Shield, Hash, Activity, TrendingUp, TrendingDown,
  ArrowLeft, Globe, BarChart2, CheckCircle2, AlertCircle, ChevronRight,
  Building2, MapPin, Eye, RefreshCw, Download, Calendar
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip,
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell
} from "recharts";

const v = {
  bg: "#020817", card: "#071126", border: "rgba(255,255,255,0.08)",
  text: "#F1F5F9", sub: "#94A3B8", muted: "#475569",
  primary: "#2563EB", success: "#22C55E", warning: "#F59E0B", danger: "#EF4444",
};

interface Props { onBack: () => void; }

const revenueData = [
  { mes: "Jan", receita: 6.1, meta: 6.0 }, { mes: "Fev", receita: 6.8, meta: 6.5 },
  { mes: "Mar", receita: 7.2, meta: 7.0 }, { mes: "Abr", receita: 7.8, meta: 7.5 },
  { mes: "Mai", receita: 8.1, meta: 8.0 }, { mes: "Jun", receita: 8.4, meta: 8.2 },
];

const topCities = [
  { rank: 1, city: "São Paulo", screens: 412, revenue: "R$ 3.2M", trust: 98.1, sla: "99.2%", trend: "+12%" },
  { rank: 2, city: "Rio de Janeiro", screens: 218, revenue: "R$ 1.8M", trust: 97.4, sla: "98.7%", trend: "+8%" },
  { rank: 3, city: "Belo Horizonte", screens: 184, revenue: "R$ 1.1M", trust: 96.9, sla: "97.8%", trend: "+15%" },
  { rank: 4, city: "Curitiba", screens: 142, revenue: "R$ 820K", trust: 97.2, sla: "98.1%", trend: "+6%" },
  { rank: 5, city: "Porto Alegre", screens: 98, revenue: "R$ 640K", trust: 96.5, sla: "96.9%", trend: "+9%" },
];

const topAdvertisers = [
  { name: "Banco Itaú", spend: "R$ 1.24M", campaigns: 8, reach: "12.4M", trust: 99 },
  { name: "iFood", spend: "R$ 980K", campaigns: 6, reach: "9.8M", trust: 98 },
  { name: "Bradesco", spend: "R$ 820K", campaigns: 5, reach: "8.2M", trust: 97 },
  { name: "Natura", spend: "R$ 640K", campaigns: 4, reach: "6.4M", trust: 99 },
  { name: "Nescafé", spend: "R$ 480K", campaigns: 3, reach: "4.8M", trust: 96 },
];

const kpis = [
  { label: "Receita Nacional", value: "R$ 8.4M", sub: "+21% MoM", up: true, icon: DollarSign, color: v.success, bg: "#22C55E15" },
  { label: "Telas Ativas", value: "12.847", sub: "58 offline", up: true, icon: Tv, color: v.primary, bg: "#2563EB15" },
  { label: "Campanhas", value: "124", sub: "18 agências", up: true, icon: Megaphone, color: v.warning, bg: "#F59E0B15" },
  { label: "Trust Score", value: "97.3", sub: "Excelente", up: true, icon: Shield, color: v.success, bg: "#22C55E15" },
  { label: "Proofs hoje", value: "4.8M", sub: "em tempo real", up: true, icon: Hash, color: "#8B5CF6", bg: "#8B5CF615" },
  { label: "SLA da rede", value: "99.9%", sub: "+0.3pp", up: true, icon: Activity, color: v.primary, bg: "#2563EB15" },
];

const segmentPie = [
  { name: "São Paulo", value: 38, color: "#2563EB" },
  { name: "Rio de Janeiro", value: 21, color: "#00A8FF" },
  { name: "Minas Gerais", value: 18, color: "#22C55E" },
  { name: "Sul", value: 14, color: "#F59E0B" },
  { name: "Outros", value: 9, color: "#8B5CF6" },
];

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-[20px] ${className}`}
      style={{ background: v.card, border: `1px solid ${v.border}`, boxShadow: "0 12px 40px rgba(0,0,0,0.18)" }}>
      {children}
    </div>
  );
}

function KPICard({ k }: { k: typeof kpis[0] }) {
  return (
    <Card className="p-5 flex flex-col gap-3 hover:scale-[1.02] transition-transform cursor-default">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium" style={{ color: v.sub }}>{k.label}</span>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: k.bg }}>
          <k.icon size={15} style={{ color: k.color }} />
        </div>
      </div>
      <div>
        <p className="text-2xl font-extrabold" style={{ color: v.text, fontFamily: "'Inter Tight', sans-serif" }}>{k.value}</p>
        <div className={`flex items-center gap-1 text-xs mt-1 ${k.up ? "text-[#22C55E]" : "text-[#EF4444]"}`}>
          {k.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />} {k.sub}
        </div>
      </div>
    </Card>
  );
}

export default function ExecutiveDashboard({ onBack }: Props) {
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");

  return (
    <div className="min-h-screen" style={{ background: v.bg, fontFamily: "'Inter', sans-serif" }}>
      <header className="border-b px-6 py-4 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md"
        style={{ borderColor: v.border, background: `${v.bg}e0` }}>
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-2 text-sm transition-colors hover:text-white" style={{ color: v.sub }}>
            <ArrowLeft size={16} /> Voltar
          </button>
          <div className="w-px h-5" style={{ background: v.border }} />
          <div>
            <p className="text-xs font-medium" style={{ color: v.sub }}>DOOHPLAY</p>
            <h1 className="font-bold text-white" style={{ fontFamily: "'Inter Tight', sans-serif" }}>Executive Dashboard</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{ background: "#22C55E15", color: "#22C55E", border: "1px solid #22C55E30" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" /> LIVE NETWORK
          </div>
          <button className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors"
            style={{ background: v.card, border: `1px solid ${v.border}`, color: v.sub }}>
            <Download size={13} /> Exportar PDF
          </button>
          <div className="flex gap-1 p-1 rounded-xl" style={{ background: v.card, border: `1px solid ${v.border}` }}>
            {(["7d", "30d", "90d"] as const).map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className="px-3 py-1 rounded-lg text-xs font-bold transition-all"
                style={period === p ? { background: v.primary, color: "#fff" } : { color: v.sub }}>
                {p}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-screen-2xl mx-auto px-6 py-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {kpis.map((k, i) => <KPICard key={i} k={k} />)}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-bold text-white" style={{ fontFamily: "'Inter Tight', sans-serif" }}>Receita Nacional</h2>
                <p className="text-xs mt-0.5" style={{ color: v.sub }}>Receita realizada vs meta — últimos 6 meses</p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5" style={{ color: v.success }}><span className="w-2.5 h-0.5 rounded" style={{ background: v.success, display: "inline-block" }} /> Realizado</span>
                <span className="flex items-center gap-1.5" style={{ color: v.muted }}><span className="w-2.5 h-0.5 rounded border-b border-dashed" style={{ display: "inline-block", borderColor: v.muted }} /> Meta</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient key="exec-rev-grad" id="exec-rev-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis key="exec-xaxis" dataKey="mes" tick={{ fontSize: 11, fill: v.muted }} axisLine={false} tickLine={false} />
                <YAxis key="exec-yaxis" hide />
                <Tooltip key="exec-tooltip" formatter={(val: number) => [`R$ ${val}M`, ""]} contentStyle={{ background: v.card, border: `1px solid ${v.border}`, borderRadius: 12, color: v.text, fontSize: 12 }} />
                <Area key="exec-area" type="monotone" dataKey="receita" stroke="#22C55E" strokeWidth={2.5} fill="url(#exec-rev-grad)" dot={false} />
                <Line key="exec-line" type="monotone" dataKey="meta" stroke={v.muted} strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-5">
            <h2 className="font-bold text-white mb-1" style={{ fontFamily: "'Inter Tight', sans-serif" }}>Receita por região</h2>
            <p className="text-xs mb-4" style={{ color: v.sub }}>Distribuição nacional</p>
            <div className="flex justify-center mb-4">
              <div className="relative">
                <PieChart width={140} height={140}>
                  <Pie key="pie-data" data={segmentPie} cx={70} cy={70} innerRadius={44} outerRadius={60} dataKey="value" strokeWidth={0}>
                    {segmentPie.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                </PieChart>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-lg font-extrabold text-white">R$8.4M</p>
                    <p className="text-[10px]" style={{ color: v.sub }}>Total</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              {segmentPie.map((s, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2" style={{ color: v.sub }}>
                    <span className="w-2 h-2 rounded-full" style={{ background: s.color }} /> {s.name}
                  </span>
                  <span className="font-bold" style={{ color: s.color }}>{s.value}%</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="overflow-hidden">
            <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: v.border }}>
              <div>
                <h2 className="font-bold text-white" style={{ fontFamily: "'Inter Tight', sans-serif" }}>Top Cidades</h2>
                <p className="text-xs" style={{ color: v.sub }}>Por receita gerada</p>
              </div>
              <Globe size={16} style={{ color: v.sub }} />
            </div>
            <div className="divide-y" style={{ borderColor: v.border }}>
              {topCities.map((c, i) => (
                <div key={i} className="px-5 py-3.5 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: i === 0 ? "#F59E0B20" : i === 1 ? "#94A3B820" : "#2563EB15" }}>
                    <span className="text-xs font-extrabold" style={{ color: i === 0 ? v.warning : i === 1 ? v.sub : v.primary }}>#{c.rank}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm text-white truncate">{c.city}</p>
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full" style={{ background: "#22C55E15", color: v.success }}>{c.trend}</span>
                    </div>
                    <p className="text-[11px]" style={{ color: v.muted }}>{c.screens} telas · SLA {c.sla}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm" style={{ color: v.success }}>{c.revenue}</p>
                    <p className="text-[10px]" style={{ color: v.sub }}>Trust {c.trust}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: v.border }}>
              <div>
                <h2 className="font-bold text-white" style={{ fontFamily: "'Inter Tight', sans-serif" }}>Top Anunciantes</h2>
                <p className="text-xs" style={{ color: v.sub }}>Por investimento em mídia</p>
              </div>
              <Building2 size={16} style={{ color: v.sub }} />
            </div>
            <div className="divide-y" style={{ borderColor: v.border }}>
              {topAdvertisers.map((a, i) => (
                <div key={i} className="px-5 py-3.5 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-xs"
                    style={{ background: v.primary + "20", color: v.primary }}>
                    {a.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-white truncate">{a.name}</p>
                    <p className="text-[11px]" style={{ color: v.muted }}>{a.campaigns} campanhas · Reach {a.reach}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm" style={{ color: v.warning }}>{a.spend}</p>
                    <div className="flex items-center gap-1 justify-end">
                      <CheckCircle2 size={10} style={{ color: v.success }} />
                      <p className="text-[10px]" style={{ color: v.success }}>Trust {a.trust}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold text-white" style={{ fontFamily: "'Inter Tight', sans-serif" }}>Saúde da Rede Nacional</h2>
              <p className="text-xs" style={{ color: v.sub }}>Status operacional por região</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs" style={{ color: v.success }}>
              <RefreshCw size={11} className="animate-spin" style={{ animationDuration: "3s" }} /> Atualizado há 30s
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { region: "São Paulo", pct: 98.7, screens: "412/430", color: v.success },
              { region: "Rio de Janeiro", pct: 97.9, screens: "218/224", color: v.success },
              { region: "Minas Gerais", pct: 95.1, screens: "184/196", color: v.warning },
              { region: "Paraná", pct: 96.8, screens: "142/148", color: v.success },
              { region: "Bahia", pct: 90.4, screens: "98/108", color: v.warning },
              { region: "Outras", pct: 95.7, screens: "135/141", color: v.success },
            ].map((r, i) => (
              <div key={i} className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-2">
                  <svg width={64} height={64} style={{ transform: "rotate(-90deg)" }}>
                    <circle cx={32} cy={32} r={24} fill="none" stroke={v.border} strokeWidth={5} />
                    <circle cx={32} cy={32} r={24} fill="none" stroke={r.color} strokeWidth={5}
                      strokeDasharray={2 * Math.PI * 24} strokeDashoffset={2 * Math.PI * 24 * (1 - r.pct / 100)} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-extrabold" style={{ color: r.color }}>{r.pct}%</span>
                  </div>
                </div>
                <p className="text-xs font-semibold text-white">{r.region}</p>
                <p className="text-[10px]" style={{ color: v.sub }}>{r.screens}</p>
              </div>
            ))}
          </div>
        </Card>

      </div>
    </div>
  );
}
