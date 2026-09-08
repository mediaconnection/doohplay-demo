import { useState } from "react";
import { ArrowLeft, Zap, Activity, TrendingUp, DollarSign, Shield, Globe,
  ArrowRight, CheckCircle2, Database, Link2, Cpu, Eye } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const T = {
  bg: "#020617", card: "#0F172A", cardLight: "#1E293B",
  border: "rgba(255,255,255,0.08)", borderLight: "rgba(255,255,255,0.12)",
  primary: "#2563EB", secondary: "#0EA5E9", success: "#22C55E",
  warning: "#F59E0B", purple: "#8B5CF6", gray: "#64748B",
  text: "#F1F5F9", textSub: "#94A3B8",
};

const hourlyData = Array.from({ length: 24 }, (_, i) => ({
  h: `${i}h`, requests: Math.floor(8000 + Math.random() * 6000),
  bids: Math.floor(5000 + Math.random() * 4000), wins: Math.floor(1200 + Math.random() * 800),
  revenue: Math.floor(2200 + Math.random() * 1800), cpm: parseFloat((16 + Math.random() * 8).toFixed(2)),
}));

const flowSteps = [
  { label: "DSPs", sub: "12 conectados", icon: Globe, color: T.primary },
  { label: "DOOHPLAY Exchange", sub: "Leilão em tempo real", icon: Zap, color: T.secondary },
  { label: "Inventory", sub: "12.847 telas", icon: Cpu, color: T.purple },
  { label: "Players", sub: "Exibição ao vivo", icon: Activity, color: T.success },
  { label: "ProofChain", sub: "Registro auditável", icon: Link2, color: T.warning },
  { label: "Blockchain", sub: "Ethereum #18.2M", icon: Database, color: T.success },
];

const topDSPs = [
  { name: "The Trade Desk", spend: "R$2.4M", wins: "18.4K", share: 28 },
  { name: "DV360", spend: "R$1.9M", wins: "14.2K", share: 22 },
  { name: "Amazon DSP", spend: "R$1.4M", wins: "10.8K", share: 17 },
  { name: "Xandr", spend: "R$980K", wins: "7.6K", share: 12 },
  { name: "MediaMath", spend: "R$720K", wins: "5.4K", share: 9 },
];

const topCities = [
  { city: "São Paulo", impr: "28.4M", cpm: "R$22", trust: 98.1 },
  { city: "Rio de Janeiro", impr: "14.2M", cpm: "R$20", trust: 97.4 },
  { city: "Belo Horizonte", impr: "8.7M", cpm: "R$18", trust: 96.8 },
  { city: "Curitiba", impr: "6.2M", cpm: "R$19", trust: 97.9 },
  { city: "Brasília", impr: "5.8M", cpm: "R$21", trust: 97.2 },
];

export default function ProgrammaticExchange({ onBack }: { onBack: () => void }) {
  const [period, setPeriod] = useState<"1d" | "7d" | "30d">("1d");
  const [liveReqs, setLiveReqs] = useState(284719);

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <header className="sticky top-0 z-50 px-6 py-4 border-b flex items-center gap-4" style={{ background: `${T.bg}F0`, borderColor: T.border, backdropFilter: "blur(20px)" }}>
        <button onClick={onBack} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-white/5" style={{ color: T.textSub }}><ArrowLeft size={16} /> Voltar</button>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.secondary})` }}><Zap size={16} color="#fff" /></div>
          <div>
            <div className="font-bold text-lg leading-none" style={{ color: T.text }}>DOOHPLAY Exchange</div>
            <div className="text-xs mt-0.5" style={{ color: T.textSub }}>Programmatic DOOH · RTB em tempo real</div>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="relative inline-flex w-2 h-2"><span className="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping" style={{ backgroundColor: T.success }} /><span className="relative inline-flex w-2 h-2 rounded-full" style={{ backgroundColor: T.success }} /></span>
          <span className="text-xs font-semibold" style={{ color: T.success }}>Exchange Ativo</span>
          <span className="text-xs ml-2" style={{ color: T.textSub }}>{liveReqs.toLocaleString("pt-BR")} requests / hora</span>
        </div>
      </header>

      {/* KPI Bar */}
      <div className="px-6 py-4 border-b" style={{ borderColor: T.border }}>
        <div className="max-w-full grid grid-cols-4 lg:grid-cols-8 gap-3">
          {[
            { l: "Requests", v: "284.7K", c: T.primary, i: Activity },
            { l: "Bids", v: "189.2K", c: T.secondary, i: Zap },
            { l: "Wins", v: "42.8K", c: T.success, i: CheckCircle2 },
            { l: "Revenue", v: "R$8.4M", c: T.success, i: DollarSign },
            { l: "Fill Rate", v: "68%", c: T.warning, i: TrendingUp },
            { l: "CPM Médio", v: "R$18.40", c: T.primary, i: DollarSign },
            { l: "Trust Score", v: "97.3", c: T.warning, i: Shield },
            { l: "Latência", v: "12ms", c: T.purple, i: Zap },
          ].map((k, i) => (
            <div key={`xkpi-${i}`} className="p-3 rounded-xl border flex flex-col gap-1" style={{ background: T.card, borderColor: `${k.c}20` }}>
              <div className="text-xs" style={{ color: T.textSub }}>{k.l}</div>
              <div className="text-lg font-bold" style={{ color: k.c }}>{k.v}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-6 py-6 max-w-full">
        {/* Flow Visual */}
        <div className="rounded-2xl border p-6 mb-6 overflow-hidden relative" style={{ background: T.card, borderColor: T.border }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 80% 60% at 50% 50%, ${T.primary}08, transparent)` }} />
          <div className="relative text-xs font-bold mb-4" style={{ color: T.textSub }}>FLUXO PROGRAMÁTICO RTB</div>
          <div className="flex items-center justify-center gap-2 flex-wrap relative">
            {flowSteps.map((s, i) => (
              <div key={`flow-${i}`} className="flex items-center gap-2">
                <div className="flex flex-col items-center p-3 rounded-2xl border min-w-28" style={{ background: T.cardLight, borderColor: `${s.color}30` }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2" style={{ background: `${s.color}18` }}><s.icon size={20} style={{ color: s.color }} /></div>
                  <div className="text-sm font-semibold text-center" style={{ color: T.text }}>{s.label}</div>
                  <div className="text-xs text-center mt-0.5" style={{ color: T.textSub }}>{s.sub}</div>
                </div>
                {i < flowSteps.length - 1 && (
                  <div className="flex flex-col items-center gap-1">
                    <div className="text-xs font-mono" style={{ color: T.textSub }}>→</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Charts */}
          <div className="xl:col-span-2 flex flex-col gap-6">
            <div className="flex gap-2 mb-2">
              {(["1d", "7d", "30d"] as const).map(p => (
                <button key={p} onClick={() => setPeriod(p)} className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all" style={{ background: period === p ? T.primary : T.card, color: period === p ? "#fff" : T.textSub, border: `1px solid ${period === p ? T.primary : T.border}` }}>{p}</button>
              ))}
            </div>
            <div className="rounded-2xl border p-5" style={{ background: T.card, borderColor: T.border }}>
              <div className="text-sm font-semibold mb-4" style={{ color: T.text }}>Volume de Leilões (24h)</div>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={hourlyData}>
                  <defs>
                    <linearGradient key="xgr" id="xgr" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={T.primary} stopOpacity={0.4} /><stop offset="100%" stopColor={T.primary} stopOpacity={0} /></linearGradient>
                    <linearGradient key="xgb" id="xgb" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={T.secondary} stopOpacity={0.3} /><stop offset="100%" stopColor={T.secondary} stopOpacity={0} /></linearGradient>
                  </defs>
                  <CartesianGrid key="xcg" strokeDasharray="3 3" stroke={T.border} />
                  <XAxis key="xx" dataKey="h" tick={{ fontSize: 10, fill: T.textSub }} stroke={T.border} />
                  <YAxis key="xy" tick={{ fontSize: 10, fill: T.textSub }} stroke={T.border} />
                  <Tooltip key="xtt" contentStyle={{ background: T.cardLight, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 11, color: T.text }} />
                  <Area key="xa1" type="monotone" dataKey="requests" stroke={T.primary} strokeWidth={2} fill="url(#xgr)" name="Requests" />
                  <Area key="xa2" type="monotone" dataKey="bids" stroke={T.secondary} strokeWidth={2} fill="url(#xgb)" name="Bids" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border p-5" style={{ background: T.card, borderColor: T.border }}>
                <div className="text-sm font-semibold mb-3" style={{ color: T.text }}>Revenue por Hora (R$)</div>
                <ResponsiveContainer width="100%" height={140}>
                  <BarChart data={hourlyData.slice(0, 12)}>
                    <XAxis key="xrx" dataKey="h" tick={{ fontSize: 9, fill: T.textSub }} stroke={T.border} />
                    <Tooltip key="xrtt" contentStyle={{ background: T.cardLight, border: "none", borderRadius: 8, fontSize: 10, color: T.text }} />
                    <Bar key="xrb" dataKey="revenue" fill={T.success} radius={[4, 4, 0, 0]} name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="rounded-2xl border p-5" style={{ background: T.card, borderColor: T.border }}>
                <div className="text-sm font-semibold mb-3" style={{ color: T.text }}>CPM Médio por Hora</div>
                <ResponsiveContainer width="100%" height={140}>
                  <LineChart data={hourlyData.slice(0, 12)}>
                    <XAxis key="xcx" dataKey="h" tick={{ fontSize: 9, fill: T.textSub }} stroke={T.border} />
                    <Tooltip key="xctt" contentStyle={{ background: T.cardLight, border: "none", borderRadius: 8, fontSize: 10, color: T.text }} />
                    <Line key="xcl" type="monotone" dataKey="cpm" stroke={T.warning} strokeWidth={2} dot={false} name="CPM" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border p-5" style={{ background: T.card, borderColor: T.border }}>
              <div className="text-sm font-bold mb-4" style={{ color: T.text }}>Top DSPs</div>
              {topDSPs.map((d, i) => (
                <div key={`dsp-${i}`} className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: T.text }}>{d.name}</span>
                    <span style={{ color: T.success }}>{d.spend}</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: T.cardLight }}>
                    <div className="h-full rounded-full" style={{ width: `${d.share}%`, background: `linear-gradient(90deg, ${T.primary}, ${T.secondary})` }} />
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: T.gray }}>{d.wins} wins · {d.share}% share</div>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border overflow-hidden" style={{ background: T.card, borderColor: T.border }}>
              <div className="px-5 py-3 border-b text-sm font-bold" style={{ borderColor: T.border, color: T.text }}>Top Cidades</div>
              {topCities.map((c, i) => (
                <div key={`tc-${i}`} className="flex items-center px-5 py-2.5 border-b last:border-b-0 text-xs" style={{ borderColor: T.border }}>
                  <span className="flex-1 font-medium" style={{ color: T.text }}>{c.city}</span>
                  <span className="mr-3" style={{ color: T.secondary }}>{c.impr}</span>
                  <span className="mr-3" style={{ color: T.success }}>{c.cpm}</span>
                  <span style={{ color: T.warning }}>{c.trust}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
