import { useState } from "react";
import { ArrowLeft, TrendingUp, DollarSign, Globe, Users, Tv, Shield,
  Activity, Award, ChevronUp, ArrowRight, Zap, Building2 } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const T = {
  bg: "#020617", card: "#0F172A", cardLight: "#1E293B",
  border: "rgba(255,255,255,0.08)", primary: "#2563EB", secondary: "#0EA5E9",
  success: "#22C55E", warning: "#F59E0B", purple: "#8B5CF6", gray: "#64748B",
  text: "#F1F5F9", textSub: "#94A3B8",
};

const data12m = [
  { m: "Set/25", arr: 68, mrr: 5.7, screens: 9200 }, { m: "Out/25", arr: 72, mrr: 6.0, screens: 9800 },
  { m: "Nov/25", arr: 76, mrr: 6.3, screens: 10400 }, { m: "Dez/25", arr: 82, mrr: 6.8, screens: 11000 },
  { m: "Jan/26", arr: 87, mrr: 7.3, screens: 11400 }, { m: "Fev/26", arr: 91, mrr: 7.6, screens: 11800 },
  { m: "Mar/26", arr: 95, mrr: 7.9, screens: 12100 }, { m: "Abr/26", arr: 97, mrr: 8.1, screens: 12300 },
  { m: "Mai/26", arr: 99, mrr: 8.2, screens: 12500 }, { m: "Jun/26", arr: 100, mrr: 8.4, screens: 12700 },
  { m: "Jul/26", arr: 102, mrr: 8.5, screens: 12780 }, { m: "Ago/26", arr: 106, mrr: 8.9, screens: 12847 },
];

const marketData = [
  { label: "TAM Brasil DOOH", value: "R$2.8B", desc: "Total Addressable Market", color: T.primary, pct: 100 },
  { label: "SAM Retail Media", value: "R$840M", desc: "Serviceable Available Market", color: T.secondary, pct: 30 },
  { label: "SOM DOOHPLAY", value: "R$101M", desc: "Serviceable Obtainable Market", color: T.success, pct: 12 },
];

const expansion = [
  { region: "Brasil", status: "Ativo", screens: "12.847", cities: "10+", arr: "R$106M", color: T.success, icon: "🇧🇷" },
  { region: "LatAm", status: "2027", screens: "50.000+", cities: "50+", arr: "R$500M+", color: T.warning, icon: "🌎" },
  { region: "Global", status: "2028", screens: "200.000+", cities: "200+", arr: "R$2B+", color: T.primary, icon: "🌍" },
];

const milestones = [
  { year: "2023", event: "Fundação DOOHPLAY — 0 telas", color: T.gray },
  { year: "2024", event: "1.000 telas — Lançamento Retail Media", color: T.secondary },
  { year: "2025", event: "5.000 telas — ProofChain + ICP Brasil", color: T.primary },
  { year: "2026", event: "12.847 telas — R$106M ARR", color: T.success },
  { year: "2027", event: "50.000 telas — Expansão LatAm", color: T.warning },
  { year: "2028", event: "200.000 telas — Global", color: T.purple },
];

export default function InvestorDashboard({ onBack }: { onBack: () => void }) {
  const [period, setPeriod] = useState<"12m" | "24m" | "36m">("12m");

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      {/* Hero Header */}
      <div className="relative px-8 pt-8 pb-8 overflow-hidden" style={{ background: "linear-gradient(135deg, #020617 0%, #0A1628 60%, #020617 100%)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 60% 50% at 70% 50%, ${T.primary}10, transparent)` }} />
        <div className="relative">
          <button onClick={onBack} className="flex items-center gap-2 text-sm mb-6 hover:opacity-80" style={{ color: T.textSub }}><ArrowLeft size={16} /> Voltar</button>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.purple})` }}><TrendingUp size={24} color="#fff" /></div>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: T.text }}>Investor Dashboard</h1>
              <p className="text-sm mt-0.5" style={{ color: T.textSub }}>A maior infraestrutura de Retail Media Auditável do Brasil</p>
            </div>
          </div>
          {/* Hero KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {[
              { l: "ARR", v: "R$106M", sub: "+68% YoY", c: T.success, i: DollarSign },
              { l: "MRR", v: "R$8.9M", sub: "+23% MoM", c: T.primary, i: TrendingUp },
              { l: "Telas Ativas", v: "12.847", sub: "+42% YoY", c: T.secondary, i: Tv },
              { l: "Trust Score", v: "97.3", sub: "Liderança BR", c: T.warning, i: Shield },
            ].map((k, i) => (
              <div key={`invkpi-${i}`} className="p-5 rounded-2xl border relative overflow-hidden" style={{ background: `${T.card}CC`, borderColor: `${k.c}30`, boxShadow: `0 4px 24px ${k.c}12` }}>
                <div className="flex items-center justify-between mb-2">
                  <k.i size={20} style={{ color: k.c }} />
                  <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: T.success }}><ChevronUp size={10} />{k.sub}</span>
                </div>
                <div className="text-3xl font-bold" style={{ color: k.c }}>{k.v}</div>
                <div className="text-xs mt-1" style={{ color: T.textSub }}>{k.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Period Selector */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-sm font-semibold" style={{ color: T.textSub }}>Período:</span>
          {(["12m", "24m", "36m"] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)} className="px-4 py-2 rounded-lg text-sm font-semibold transition-all" style={{ background: period === p ? T.primary : T.card, color: period === p ? "#fff" : T.textSub, border: `1px solid ${period === p ? T.primary : T.border}` }}>Últimos {p}</button>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
          {/* ARR Growth */}
          <div className="xl:col-span-2 rounded-2xl border p-5" style={{ background: T.card, borderColor: T.border }}>
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-semibold" style={{ color: T.text }}>ARR + Telas (últimos 12 meses)</div>
              <div className="text-xs px-2 py-1 rounded-full" style={{ background: `${T.success}18`, color: T.success }}>+68% YoY</div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={data12m}>
                <defs>
                  <linearGradient id="invg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={T.success} stopOpacity={0.4} /><stop offset="100%" stopColor={T.success} stopOpacity={0} /></linearGradient>
                  <linearGradient id="invg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={T.primary} stopOpacity={0.3} /><stop offset="100%" stopColor={T.primary} stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
                <XAxis dataKey="m" tick={{ fontSize: 9, fill: T.textSub }} stroke={T.border} />
                <YAxis tick={{ fontSize: 9, fill: T.textSub }} stroke={T.border} />
                <Tooltip contentStyle={{ background: T.cardLight, border: "none", borderRadius: 8, fontSize: 11, color: T.text }} />
                <Area key="area-arr" type="monotone" dataKey="arr" stroke={T.success} strokeWidth={2.5} fill="url(#invg1)" name="ARR (R$M)" />
                <Area key="area-mrr" type="monotone" dataKey="mrr" stroke={T.primary} strokeWidth={2} fill="url(#invg2)" name="MRR (R$M)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          {/* TAM/SAM/SOM */}
          <div className="rounded-2xl border p-5" style={{ background: T.card, borderColor: T.border }}>
            <div className="text-sm font-semibold mb-5" style={{ color: T.text }}>TAM · SAM · SOM</div>
            <div className="flex flex-col gap-4">
              {marketData.map((m, i) => (
                <div key={`tam-${i}`}>
                  <div className="flex justify-between mb-1.5">
                    <div><div className="text-sm font-semibold" style={{ color: T.text }}>{m.label}</div><div className="text-xs" style={{ color: T.textSub }}>{m.desc}</div></div>
                    <div className="text-xl font-bold" style={{ color: m.color }}>{m.value}</div>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: T.cardLight }}>
                    <div className="h-full rounded-full" style={{ width: `${m.pct}%`, background: m.color }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 p-4 rounded-xl" style={{ background: `${T.success}08`, border: `1px solid ${T.success}20` }}>
              <div className="text-xs font-semibold" style={{ color: T.textSub }}>Market Share Atual</div>
              <div className="text-2xl font-bold" style={{ color: T.success }}>12%</div>
              <div className="text-xs" style={{ color: T.textSub }}>do SAM Retail Media Brasil</div>
            </div>
          </div>
        </div>

        {/* Expansion + Milestones */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="rounded-2xl border p-5" style={{ background: T.card, borderColor: T.border }}>
            <div className="text-sm font-semibold mb-5 flex items-center gap-2" style={{ color: T.text }}><Globe size={14} style={{ color: T.primary }} /> Roadmap de Expansão</div>
            <div className="flex flex-col gap-4">
              {expansion.map((e, i) => (
                <div key={`exp-${i}`} className="p-4 rounded-2xl border flex items-center gap-4" style={{ background: T.cardLight, borderColor: `${e.color}30` }}>
                  <div className="text-3xl">{e.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold" style={{ color: T.text }}>{e.region}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: `${e.color}18`, color: e.color }}>{e.status}</span>
                    </div>
                    <div className="text-xs" style={{ color: T.textSub }}>{e.screens} telas · {e.cities} cidades</div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-bold" style={{ color: e.color }}>{e.arr}</div>
                    <div className="text-xs" style={{ color: T.textSub }}>ARR projetado</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border p-5" style={{ background: T.card, borderColor: T.border }}>
            <div className="text-sm font-semibold mb-5 flex items-center gap-2" style={{ color: T.text }}><Zap size={14} style={{ color: T.warning }} /> Milestones</div>
            <div className="relative pl-4">
              <div className="absolute left-0 top-0 bottom-0 w-px" style={{ background: `linear-gradient(${T.secondary}, ${T.purple})` }} />
              {milestones.map((m, i) => (
                <div key={`ms-${i}`} className="relative flex items-start gap-3 mb-5 last:mb-0">
                  <div className="absolute -left-4 w-3 h-3 rounded-full border-2 mt-0.5" style={{ background: m.color, borderColor: T.bg }} />
                  <div>
                    <div className="text-xs font-bold" style={{ color: m.color }}>{m.year}</div>
                    <div className="text-sm" style={{ color: T.textSub }}>{m.event}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Additional KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          {[
            { l: "Clientes Totais", v: "3.847", c: T.primary, i: Users },
            { l: "Agências Parceiras", v: "48", c: T.secondary, i: Building2 },
            { l: "Anunciantes", v: "284", c: T.purple, i: Activity },
            { l: "Provas Blockchain", v: "4.8M", c: T.success, i: Shield },
            { l: "NPS Score", v: "72", c: T.warning, i: Award },
            { l: "Churn Rate", v: "1.8%", c: T.success, i: TrendingUp },
          ].map((k, i) => (
            <div key={`invkpi2-${i}`} className="p-4 rounded-2xl border text-center" style={{ background: T.card, borderColor: `${k.c}20` }}>
              <k.i size={16} style={{ color: k.c, margin: "0 auto 6px" }} />
              <div className="text-xl font-bold" style={{ color: k.c }}>{k.v}</div>
              <div className="text-xs mt-0.5" style={{ color: T.textSub }}>{k.l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
