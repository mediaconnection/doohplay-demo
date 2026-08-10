import { useState } from "react";
import { ArrowLeft, TrendingUp, Users, Monitor, DollarSign, Target, Zap, Star, Globe, ArrowUpRight, ChevronRight, Trophy, Rocket } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

interface Props { onBack: () => void; onNavigate?: (v: string) => void; }

const ARR_DATA = [
  { month: "Jan", arr: 48000, mrr: 4000, screens: 22, clients: 18 },
  { month: "Fev", arr: 61200, mrr: 5100, screens: 28, clients: 23 },
  { month: "Mar", arr: 57600, mrr: 4800, screens: 26, clients: 22 },
  { month: "Abr", arr: 75600, mrr: 6300, screens: 33, clients: 29 },
  { month: "Mai", arr: 86400, mrr: 7200, screens: 38, clients: 34 },
  { month: "Jun", arr: 97200, mrr: 8100, screens: 43, clients: 40 },
  { month: "Jul", arr: 112800, mrr: 9400, screens: 51, clients: 47 },
];

const EXPANSION_DATA = [
  { city: "São Paulo", screens: 24, revenue: 42000, growth: 18 },
  { city: "Rio de Janeiro", screens: 10, revenue: 18500, growth: 24 },
  { city: "Belo Horizonte", screens: 7, revenue: 12800, growth: 31 },
  { city: "Curitiba", screens: 5, revenue: 9200, growth: 45 },
  { city: "Florianópolis", screens: 3, revenue: 6100, growth: 62 },
  { city: "Porto Alegre", screens: 2, revenue: 4000, growth: 78 },
];

const MILESTONES = [
  { label: "10 telas ativas", achieved: true, date: "Mar 2026" },
  { label: "R$5k MRR", achieved: true, date: "Fev 2026" },
  { label: "25 clientes", achieved: true, date: "Mai 2026" },
  { label: "R$10k MRR", achieved: true, date: "Jul 2026" },
  { label: "50 telas ativas", achieved: false, date: "Set 2026 (meta)" },
  { label: "R$20k MRR", achieved: false, date: "Nov 2026 (meta)" },
  { label: "100 clientes", achieved: false, date: "Jan 2027 (meta)" },
  { label: "Série A", achieved: false, date: "2027 (meta)" },
];

const COHORTS = [
  { cohort: "Jan–Mar", retained3m: 88, retained6m: 76, ltv: 4200 },
  { cohort: "Abr–Jun", retained3m: 91, retained6m: null, ltv: 5100 },
  { cohort: "Jul+", retained3m: null, retained6m: null, ltv: null },
];

const tooltipStyle = { background: T.panel, border: `1px solid ${T.border}`, borderRadius: 12, color: T.text };

export default function GrowthDashboard({ onBack, onNavigate }: Props) {
  const [tab, setTab] = useState<"metrics" | "expansion" | "cohorts">("metrics");

  const current = ARR_DATA[ARR_DATA.length - 1];
  const prev = ARR_DATA[ARR_DATA.length - 2];
  const mrrGrowth = ((current.mrr - prev.mrr) / prev.mrr * 100).toFixed(1);
  const screenGrowth = ((current.screens - prev.screens) / prev.screens * 100).toFixed(0);
  const unicornDistance = ((1000000000 / current.arr) * 100).toFixed(2);

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5"><ArrowLeft size={18} style={{ color: T.textSub }} /></button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.accent + "20" }}>
                <Rocket size={18} style={{ color: T.accent }} />
              </div>
              <div>
                <h1 className="font-black text-lg">Painel de Crescimento</h1>
                <p className="text-xs" style={{ color: T.textSub }}>Métricas de expansão DOOHPLAY</p>
              </div>
            </div>
          </div>
          <button onClick={() => onNavigate?.("unicorn-roadmap")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
            style={{ background: `linear-gradient(135deg, ${T.gold}20, ${T.warning}20)`, color: T.gold, border: `1px solid ${T.gold}30` }}>
            <Trophy size={14} /> Roadmap Unicórnio
          </button>
        </div>
        <div className="max-w-6xl mx-auto px-6 pb-0 flex gap-1">
          {(["metrics","expansion","cohorts"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="px-5 py-2.5 text-sm font-bold border-b-2 transition-all"
              style={{ color: tab === t ? T.primary : T.textSub, borderColor: tab === t ? T.primary : "transparent" }}>
              {t === "metrics" ? "Métricas" : t === "expansion" ? "Expansão" : "Cohorts"}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        <div className="grid grid-cols-5 gap-4">
          {[
            { label: "ARR atual", value: `R$${(current.arr / 1000).toFixed(0)}k`, growth: mrrGrowth, color: T.success, icon: DollarSign },
            { label: "MRR — Jul", value: `R$${current.mrr.toLocaleString("pt-BR")}`, growth: mrrGrowth, color: T.primary, icon: TrendingUp },
            { label: "Telas ativas", value: current.screens.toString(), growth: screenGrowth, color: T.accent, icon: Monitor },
            { label: "Clientes", value: current.clients.toString(), growth: "+17%", color: T.warning, icon: Users },
            { label: "Caminho unicórnio", value: `${unicornDistance}%`, growth: null, color: T.gold, icon: Star },
          ].map((k, i) => (
            <div key={i} className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <div className="flex items-center gap-2 mb-2">
                <k.icon size={14} style={{ color: k.color }} />
                <span className="text-xs" style={{ color: T.textSub }}>{k.label}</span>
              </div>
              <div className="font-black text-2xl mb-1" style={{ color: k.color }}>{k.value}</div>
              {k.growth && (
                <div className="flex items-center gap-1 text-xs font-bold" style={{ color: T.success }}>
                  <ArrowUpRight size={10} />+{k.growth}% MoM
                </div>
              )}
              {k.label === "Caminho unicórnio" && (
                <div className="text-xs mt-1" style={{ color: T.textSub }}>do ARR necessário</div>
              )}
            </div>
          ))}
        </div>

        {tab === "metrics" && (
          <>
            <div className="grid grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-bold mb-4">ARR acumulado (R$)</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={ARR_DATA}>
                    <defs>
                      <linearGradient key="gd-arr" id="gd-arr" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={T.success} stopOpacity={0.35} />
                        <stop offset="95%" stopColor={T.success} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" tick={{ fill: T.textSub, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`R$${v.toLocaleString("pt-BR")}`, "ARR"]} />
                    <Area key="area-arr" type="monotone" dataKey="arr" stroke={T.success} fill="url(#gd-arr)" strokeWidth={2.5} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-bold mb-4">Telas e clientes</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={ARR_DATA}>
                    <XAxis dataKey="month" tick={{ fill: T.textSub, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar key="bar-screens" dataKey="screens" fill={T.primary} radius={[3, 3, 0, 0]} name="Telas" />
                    <Bar key="bar-clients" dataKey="clients" fill={T.accent} radius={[3, 3, 0, 0]} name="Clientes" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-bold mb-4">Marcos de crescimento</h3>
              <div className="grid grid-cols-4 gap-3">
                {MILESTONES.map((m, i) => (
                  <div key={i} className="p-3 rounded-xl border"
                    style={{ background: m.achieved ? T.success + "10" : T.panel, borderColor: m.achieved ? T.success + "30" : T.border }}>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: m.achieved ? T.success : T.textSub + "20" }}>
                        {m.achieved ? <span className="text-xs">✓</span> : <span className="text-xs" style={{ color: T.textSub }}>○</span>}
                      </div>
                    </div>
                    <div className="font-bold text-sm" style={{ color: m.achieved ? T.text : T.textSub }}>{m.label}</div>
                    <div className="text-xs mt-0.5" style={{ color: m.achieved ? T.success : T.textSub }}>{m.date}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-2xl border" style={{ background: `linear-gradient(135deg, ${T.gold}08, ${T.accent}08)`, borderColor: T.gold + "20" }}>
              <div className="flex items-center gap-3 mb-4">
                <Trophy size={20} style={{ color: T.gold }} />
                <div>
                  <h3 className="font-bold">Progresso rumo ao unicórnio</h3>
                  <p className="text-xs" style={{ color: T.textSub }}>Meta: US$1B valuation — ARR mínimo ~R$100M</p>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { label: "ARR", current: current.arr, target: 100_000_000, unit: "R$", color: T.success },
                  { label: "Telas ativas", current: current.screens, target: 10000, unit: "", color: T.primary },
                  { label: "Clientes pagantes", current: current.clients, target: 5000, unit: "", color: T.accent },
                  { label: "Cidades cobertas", current: 6, target: 50, unit: "", color: T.warning },
                ].map((g, i) => {
                  const pct = Math.min(100, (g.current / g.target) * 100);
                  return (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span style={{ color: T.textSub }}>{g.label}</span>
                        <span style={{ color: T.text }}>
                          {g.unit}{g.current.toLocaleString("pt-BR")} / {g.unit}{g.target.toLocaleString("pt-BR")} — {pct.toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-2.5 rounded-full overflow-hidden" style={{ background: T.panel }}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${g.color}, ${g.color}99)` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {tab === "expansion" && (
          <>
            <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-bold mb-4">Receita por cidade — Julho 2026</h3>
              <div className="space-y-3">
                {EXPANSION_DATA.map((city, i) => {
                  const maxRev = Math.max(...EXPANSION_DATA.map(c => c.revenue));
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-3">
                          <Globe size={12} style={{ color: T.textSub }} />
                          <span className="font-medium text-sm">{city.city}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                            style={{ background: T.success + "20", color: T.success }}>
                            +{city.growth}%
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-sm" style={{ color: T.gold }}>R${city.revenue.toLocaleString("pt-BR")}</div>
                          <div className="text-xs" style={{ color: T.textSub }}>{city.screens} telas</div>
                        </div>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: T.panel }}>
                        <div className="h-full rounded-full" style={{ width: `${(city.revenue / maxRev) * 100}%`, background: T.primary }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-bold mb-4">Cidades com maior crescimento MoM</h3>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={EXPANSION_DATA} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis dataKey="city" type="category" tick={{ fill: T.textSub, fontSize: 11 }} axisLine={false} tickLine={false} width={120} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`+${v}%`, "Crescimento"]} />
                  <Bar key="bar-growth" dataKey="growth" fill={T.success} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {tab === "cohorts" && (
          <>
            <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-bold mb-2">Retenção por cohort</h3>
              <p className="text-sm mb-5" style={{ color: T.textSub }}>% de clientes ainda ativos após X meses</p>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                      {["Cohort", "Mês 1", "Mês 3", "Mês 6", "LTV médio"].map(h => (
                        <th key={h} className="px-4 py-2 text-left text-xs font-bold" style={{ color: T.textSub }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {COHORTS.map((c, i) => (
                      <tr key={i} style={{ borderBottom: i < COHORTS.length - 1 ? `1px solid ${T.border}` : "none" }}>
                        <td className="px-4 py-3 font-medium">{c.cohort}</td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-bold" style={{ color: T.success }}>100%</span>
                        </td>
                        <td className="px-4 py-3">
                          {c.retained3m ? <span className="text-sm font-bold" style={{ color: T.primary }}>{c.retained3m}%</span> : <span style={{ color: T.textSub }}>—</span>}
                        </td>
                        <td className="px-4 py-3">
                          {c.retained6m ? <span className="text-sm font-bold" style={{ color: T.accent }}>{c.retained6m}%</span> : <span style={{ color: T.textSub }}>—</span>}
                        </td>
                        <td className="px-4 py-3">
                          {c.ltv ? <span className="text-sm font-bold" style={{ color: T.gold }}>R${c.ltv.toLocaleString("pt-BR")}</span> : <span style={{ color: T.textSub }}>—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Churn rate médio", value: "3.2%", sub: "Excelente para SaaS B2B", color: T.success },
                { label: "LTV médio", value: "R$4.650", sub: "Crescendo +18% QoQ", color: T.gold },
                { label: "CAC atual", value: "R$320", sub: "LTV/CAC: 14.5x", color: T.primary },
              ].map((m, i) => (
                <div key={i} className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                  <div className="text-xs mb-2" style={{ color: T.textSub }}>{m.label}</div>
                  <div className="font-black text-3xl mb-1" style={{ color: m.color }}>{m.value}</div>
                  <div className="text-xs" style={{ color: T.textSub }}>{m.sub}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
