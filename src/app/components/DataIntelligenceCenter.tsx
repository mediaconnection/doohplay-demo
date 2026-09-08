import { useState } from "react";
import { ArrowLeft, Brain, TrendingUp, DollarSign, Eye, Shield, Activity,
  Zap, Globe, MapPin, Star, ChevronUp, BarChart2 } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from "recharts";

const T = {
  bg: "#020617", card: "#0F172A", cardLight: "#1E293B",
  border: "rgba(255,255,255,0.08)", primary: "#2563EB", secondary: "#0EA5E9",
  success: "#22C55E", warning: "#F59E0B", purple: "#8B5CF6", gray: "#64748B",
  text: "#F1F5F9", textSub: "#94A3B8",
};

const revenueByCity = [
  { city: "São Paulo", revenue: 3.4, growth: 18 }, { city: "Rio", revenue: 1.8, growth: 14 },
  { city: "BH", revenue: 0.9, growth: 22 }, { city: "Curitiba", revenue: 0.7, growth: 31 },
  { city: "Brasília", revenue: 0.6, growth: 16 }, { city: "Salvador", revenue: 0.4, growth: 28 },
  { city: "Fortaleza", revenue: 0.3, growth: 24 }, { city: "Recife", revenue: 0.2, growth: 19 },
];

const hourlyImpressions = Array.from({ length: 24 }, (_, i) => ({
  h: `${i}h`, food: Math.floor(800 + Math.sin(i * 0.5) * 400 + Math.random() * 200),
  retail: Math.floor(600 + Math.cos(i * 0.4) * 300 + Math.random() * 150),
  health: Math.floor(400 + Math.sin(i * 0.6) * 200 + Math.random() * 100),
}));

const segmentData = [
  { seg: "Retail", value: 34, color: T.primary },
  { seg: "Food", value: 28, color: T.success },
  { seg: "Health", value: 18, color: T.secondary },
  { seg: "Fitness", value: 12, color: T.warning },
  { seg: "Outros", value: 8, color: T.purple },
];

const revenueTimeline = [
  { m: "Jan", r: 5.2 }, { m: "Fev", r: 5.8 }, { m: "Mar", r: 5.5 }, { m: "Abr", r: 6.4 },
  { m: "Mai", r: 7.1 }, { m: "Jun", r: 7.8 }, { m: "Jul", r: 7.2 }, { m: "Ago", r: 8.4 },
];

const aiInsights = [
  { title: "Melhor Horário", value: "18h–20h", detail: "+34% mais conversões", icon: "⏰", color: T.success },
  { title: "Melhor Segmento", value: "Retail", detail: "CPM R$22 · ROI +41%", icon: "🏆", color: T.warning },
  { title: "Maior Crescimento", value: "Curitiba", detail: "+31% MoM", icon: "📈", color: T.primary },
  { title: "Maior ROI", value: "Nike Q3", detail: "+44% vs. benchmark", icon: "💡", color: T.purple },
];

const aiRecommendations = [
  { text: "Aumentar investimento em Curitiba — crescimento 31% MoM acima da média nacional", type: "revenue" },
  { text: "Horário 18h–20h tem 34% mais conversões — recomendar shift de budget", type: "optimization" },
  { text: "Segmento Fitness subexplorado — potencial de R$1.2M incremental", type: "expansion" },
  { text: "3 novas redes em Salvador com Trust Score 96+ disponíveis para parceria", type: "network" },
];

const heatmapData = Array.from({ length: 7 }, (_, day) =>
  Array.from({ length: 24 }, (_, hour) => ({
    day, hour, value: Math.floor(20 + Math.sin(hour * 0.4 + day * 0.8) * 40 + Math.random() * 30),
  }))
).flat();

export default function DataIntelligenceCenter({ onBack }: { onBack: () => void }) {
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");
  const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const heatColor = (v: number) => {
    if (v < 30) return `${T.primary}20`;
    if (v < 50) return `${T.primary}50`;
    if (v < 70) return `${T.primary}80`;
    return T.primary;
  };

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <header className="sticky top-0 z-50 px-6 py-4 border-b flex items-center gap-4" style={{ background: `${T.bg}F0`, borderColor: T.border, backdropFilter: "blur(20px)" }}>
        <button onClick={onBack} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-white/5" style={{ color: T.textSub }}><ArrowLeft size={16} /> Voltar</button>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${T.purple}, ${T.primary})` }}><Brain size={16} color="#fff" /></div>
          <div>
            <div className="font-bold text-xl leading-none" style={{ color: T.text }}>Data Intelligence Center</div>
            <div className="text-xs mt-0.5" style={{ color: T.textSub }}>Insights em tempo real da maior rede de Retail Media auditável do Brasil</div>
          </div>
        </div>
        <div className="ml-auto flex gap-2">
          {(["7d", "30d", "90d"] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)} className="px-4 py-2 rounded-lg text-xs font-semibold transition-all" style={{ background: period === p ? T.primary : T.card, color: period === p ? "#fff" : T.textSub, border: `1px solid ${period === p ? T.primary : T.border}` }}>{p}</button>
          ))}
        </div>
      </header>

      {/* KPI Row */}
      <div className="px-6 py-4 border-b" style={{ borderColor: T.border }}>
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { l: "Receita Total", v: "R$8.4M", c: T.success, t: "+23%", i: DollarSign },
            { l: "Impressões", v: "84.2M", c: T.primary, t: "+18%", i: Eye },
            { l: "Conversões", v: "24.8K", c: T.secondary, t: "+31%", i: TrendingUp },
            { l: "Audiência", v: "2.4M", c: T.warning, t: "+14%", i: Globe },
            { l: "Trust Score", v: "97.3", c: T.warning, t: "Estável", i: Shield },
            { l: "Fill Rate", v: "68%", c: T.purple, t: "+8%", i: Activity },
          ].map((k, i) => (
            <div key={`dic-${i}`} className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: `${k.c}25` }}>
              <div className="flex items-center justify-between mb-1">
                <div className="text-xs" style={{ color: T.textSub }}>{k.l}</div>
                <span className="flex items-center gap-0.5 text-xs font-semibold" style={{ color: T.success }}><ChevronUp size={10} />{k.t}</span>
              </div>
              <div className="text-2xl font-bold" style={{ color: k.c }}>{k.v}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-6 py-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left 2/3 */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          {/* Revenue Timeline */}
          <div className="rounded-2xl border p-5" style={{ background: T.card, borderColor: T.border }}>
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-semibold" style={{ color: T.text }}>Receita Mensal (R$ M)</div>
              <div className="text-xs px-2 py-1 rounded-full" style={{ background: `${T.success}18`, color: T.success }}>+23% MoM</div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={revenueTimeline}>
                <defs><linearGradient key="dicg" id="dicg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={T.primary} stopOpacity={0.5} /><stop offset="100%" stopColor={T.primary} stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid key="diccg" strokeDasharray="3 3" stroke={T.border} />
                <XAxis key="dicx" dataKey="m" tick={{ fontSize: 10, fill: T.textSub }} stroke={T.border} />
                <YAxis key="dicy" tick={{ fontSize: 10, fill: T.textSub }} stroke={T.border} />
                <Tooltip key="dictt" contentStyle={{ background: T.cardLight, border: "none", borderRadius: 8, fontSize: 11, color: T.text }} />
                <Area key="dica" type="monotone" dataKey="r" stroke={T.primary} strokeWidth={2.5} fill="url(#dicg)" name="Receita (R$M)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Heatmap */}
          <div className="rounded-2xl border p-5" style={{ background: T.card, borderColor: T.border }}>
            <div className="text-sm font-semibold mb-4" style={{ color: T.text }}>Heatmap de Impressões — Dia × Hora</div>
            <div className="flex gap-1">
              <div className="flex flex-col gap-1 mr-1">
                <div className="h-5" />
                {days.map(d => <div key={d} className="h-5 text-xs flex items-center" style={{ color: T.textSub, width: 28 }}>{d}</div>)}
              </div>
              <div className="flex-1 overflow-x-auto">
                <div className="flex gap-1 mb-1">
                  {Array.from({ length: 24 }, (_, h) => <div key={h} className="text-xs flex-shrink-0 text-center" style={{ color: T.textSub, width: 20 }}>{h}</div>)}
                </div>
                {days.map((d, di) => (
                  <div key={d} className="flex gap-1 mb-1">
                    {Array.from({ length: 24 }, (_, h) => {
                      const point = heatmapData.find(p => p.day === di && p.hour === h);
                      return <div key={h} className="rounded flex-shrink-0 transition-all hover:scale-110" style={{ width: 20, height: 20, background: heatColor(point?.value ?? 0) }} title={`${d} ${h}h: ${point?.value ?? 0}`} />;
                    })}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <span className="text-xs" style={{ color: T.textSub }}>Menor</span>
              {[0.2, 0.5, 0.8, 1].map(o => <div key={o} className="w-4 h-4 rounded" style={{ background: `${T.primary}${Math.round(o * 255).toString(16).padStart(2, "0")}` }} />)}
              <span className="text-xs" style={{ color: T.textSub }}>Maior</span>
            </div>
          </div>

          {/* City Revenue & Hourly */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border p-5" style={{ background: T.card, borderColor: T.border }}>
              <div className="text-sm font-semibold mb-4" style={{ color: T.text }}>Receita por Cidade (R$M)</div>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={revenueByCity} layout="vertical">
                  <XAxis key="drbx" type="number" tick={{ fontSize: 9, fill: T.textSub }} stroke={T.border} />
                  <YAxis key="drby" type="category" dataKey="city" tick={{ fontSize: 9, fill: T.textSub }} stroke={T.border} width={55} />
                  <Tooltip key="drbtt" contentStyle={{ background: T.cardLight, border: "none", borderRadius: 8, fontSize: 10, color: T.text }} />
                  <Bar key="drbb" dataKey="revenue" fill={T.primary} radius={[0, 4, 4, 0]} name="R$M" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="rounded-2xl border p-5" style={{ background: T.card, borderColor: T.border }}>
              <div className="text-sm font-semibold mb-4" style={{ color: T.text }}>Impressões por Horário</div>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={hourlyImpressions.slice(6, 22)}>
                  <XAxis key="dhx" dataKey="h" tick={{ fontSize: 8, fill: T.textSub }} stroke={T.border} />
                  <Tooltip key="dhtt" contentStyle={{ background: T.cardLight, border: "none", borderRadius: 8, fontSize: 10, color: T.text }} />
                  <Line key="dhl1" type="monotone" dataKey="food" stroke={T.success} strokeWidth={1.5} dot={false} name="Food" />
                  <Line key="dhl2" type="monotone" dataKey="retail" stroke={T.primary} strokeWidth={1.5} dot={false} name="Retail" />
                  <Line key="dhl3" type="monotone" dataKey="health" stroke={T.secondary} strokeWidth={1.5} dot={false} name="Health" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right 1/3 */}
        <div className="flex flex-col gap-5">
          {/* Segment Pie */}
          <div className="rounded-2xl border p-5" style={{ background: T.card, borderColor: T.border }}>
            <div className="text-sm font-semibold mb-4" style={{ color: T.text }}>Receita por Segmento</div>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={100} height={100}>
                <PieChart>
                  <Pie key="dicp" data={segmentData} dataKey="value" cx="50%" cy="50%" innerRadius={30} outerRadius={48} strokeWidth={0}>
                    {segmentData.map((e, i) => <Cell key={`dcc-${i}`} fill={e.color} opacity={0.9} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-1.5 flex-1">
                {segmentData.map((s, i) => (
                  <div key={`dsl-${i}`} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: s.color }} /><span style={{ color: T.textSub }}>{s.seg}</span></div>
                    <span className="font-semibold" style={{ color: T.text }}>{s.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Insights */}
          <div className="rounded-2xl border p-5" style={{ background: T.card, borderColor: T.border }}>
            <div className="flex items-center gap-2 mb-4 text-sm font-semibold" style={{ color: T.text }}><Brain size={14} style={{ color: T.purple }} /> AI Insights</div>
            <div className="grid grid-cols-2 gap-3">
              {aiInsights.map((ins, i) => (
                <div key={`ai-ins-${i}`} className="p-3 rounded-xl border" style={{ background: T.cardLight, borderColor: `${ins.color}25` }}>
                  <div className="text-lg mb-1">{ins.icon}</div>
                  <div className="text-xs font-semibold" style={{ color: T.textSub }}>{ins.title}</div>
                  <div className="text-sm font-bold" style={{ color: ins.color }}>{ins.value}</div>
                  <div className="text-xs mt-0.5" style={{ color: T.gray }}>{ins.detail}</div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="rounded-2xl border p-5" style={{ background: T.card, borderColor: T.border }}>
            <div className="flex items-center gap-2 mb-4 text-sm font-semibold" style={{ color: T.text }}><Zap size={14} style={{ color: T.secondary }} /> Recomendações IA</div>
            <div className="flex flex-col gap-3">
              {aiRecommendations.map((r, i) => {
                const color = r.type === "revenue" ? T.success : r.type === "optimization" ? T.primary : r.type === "expansion" ? T.warning : T.purple;
                return (
                  <div key={`rec-${i}`} className="flex gap-3 p-3 rounded-xl" style={{ background: `${color}08`, border: `1px solid ${color}20` }}>
                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: color }} />
                    <p className="text-xs leading-relaxed" style={{ color: T.textSub }}>{r.text}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* City Growth */}
          <div className="rounded-2xl border p-5" style={{ background: T.card, borderColor: T.border }}>
            <div className="text-sm font-semibold mb-4" style={{ color: T.text }}>Crescimento por Cidade</div>
            {revenueByCity.map((c, i) => (
              <div key={`cgrow-${i}`} className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: T.text }}>{c.city}</span>
                  <span style={{ color: T.success }}>+{c.growth}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: T.cardLight }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${c.growth * 2.5}%`, background: `linear-gradient(90deg, ${T.primary}, ${T.secondary})` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
