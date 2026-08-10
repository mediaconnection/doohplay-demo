import { useState } from "react";
import {
  ArrowLeft, TrendingUp, TrendingDown, Minus, Award, Target,
  BarChart2, Users, DollarSign, Eye, Zap, ChevronUp, ChevronDown,
  RefreshCw, Star, Globe
} from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
  LineChart, Line, Legend
} from "recharts";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

interface Props { onBack: () => void; onNavigate?: (v: string) => void; }

type MetricTrend = "up" | "down" | "flat";

interface BenchmarkMetric {
  id: string; label: string; doohplay: number; marketAvg: number;
  topPerformer: number; unit: string; higherIsBetter: boolean;
}

interface Competitor {
  name: string; cpm: number; ctr: number; fillRate: number;
  screens: number; nps: number; color: string;
}

const METRICS: BenchmarkMetric[] = [
  { id: "cpm",       label: "CPM Médio",          doohplay: 47,   marketAvg: 38,  topPerformer: 62,  unit: "R$", higherIsBetter: true  },
  { id: "ctr",       label: "CTR",                doohplay: 3.4,  marketAvg: 2.1, topPerformer: 4.8, unit: "%",  higherIsBetter: true  },
  { id: "fillrate",  label: "Fill Rate",           doohplay: 82,   marketAvg: 71,  topPerformer: 94,  unit: "%",  higherIsBetter: true  },
  { id: "viewtime",  label: "Tempo de Exibição",  doohplay: 12.4, marketAvg: 10.1,topPerformer: 15.8,unit: "s",  higherIsBetter: true  },
  { id: "uptime",    label: "Uptime de Telas",     doohplay: 98.7, marketAvg: 95.2,topPerformer: 99.4,unit: "%",  higherIsBetter: true  },
  { id: "latency",   label: "Latência Deploy",     doohplay: 1.8,  marketAvg: 4.2, topPerformer: 0.9, unit: "s",  higherIsBetter: false },
  { id: "nps",       label: "NPS Anunciante",      doohplay: 72,   marketAvg: 54,  topPerformer: 81,  unit: "pts",higherIsBetter: true  },
  { id: "roi",       label: "ROI Médio",           doohplay: 3.8,  marketAvg: 2.9, topPerformer: 5.1, unit: "x",  higherIsBetter: true  },
];

const COMPETITORS: Competitor[] = [
  { name: "DOOHPLAY",  cpm: 47,  ctr: 3.4, fillRate: 82, screens: 168, nps: 72, color: T.primary  },
  { name: "Rede OOH A",cpm: 38,  ctr: 2.8, fillRate: 74, screens: 420, nps: 61, color: T.textSub  },
  { name: "Plat. B",   cpm: 55,  ctr: 2.2, fillRate: 68, screens: 280, nps: 58, color: T.accent + "80" },
  { name: "Plat. C",   cpm: 31,  ctr: 3.1, fillRate: 79, screens: 94,  nps: 65, color: T.gold + "80" },
  { name: "Mercado",   cpm: 38,  ctr: 2.1, fillRate: 71, screens: 0,   nps: 54, color: T.border    },
];

const RADAR_DATA = [
  { subject: "CPM",      doohplay: 76, market: 61 },
  { subject: "CTR",      doohplay: 71, market: 44 },
  { subject: "Fill Rate",doohplay: 87, market: 76 },
  { subject: "Uptime",   doohplay: 99, market: 95 },
  { subject: "NPS",      doohplay: 72, market: 54 },
  { subject: "ROI",      doohplay: 74, market: 57 },
];

const TREND_DATA = Array.from({ length: 6 }, (_, i) => ({
  month: ["Fev","Mar","Abr","Mai","Jun","Jul"][i],
  doohplay: [3.1, 3.2, 3.0, 3.3, 3.5, 3.4][i],
  market:   [2.0, 2.1, 2.0, 2.2, 2.1, 2.1][i],
}));

function getDelta(doohplay: number, market: number, higherIsBetter: boolean): { value: number; trend: MetricTrend } {
  const diff = ((doohplay - market) / market) * 100;
  const trend: MetricTrend = Math.abs(diff) < 2 ? "flat" : (diff > 0) === higherIsBetter ? "up" : "down";
  return { value: Math.abs(diff), trend };
}

export default function PerformanceBenchmark({ onBack, onNavigate }: Props) {
  const [tab, setTab] = useState<"overview" | "metrics" | "competitors">("overview");
  const [period, setPeriod] = useState("30d");

  const beatMarket = METRICS.filter(m => {
    const delta = getDelta(m.doohplay, m.marketAvg, m.higherIsBetter);
    return delta.trend === "up";
  }).length;

  const overallScore = Math.round(METRICS.reduce((s, m) => {
    const pct = m.higherIsBetter
      ? Math.min(m.doohplay / m.topPerformer * 100, 100)
      : Math.min((1 - (m.doohplay - m.topPerformer) / (m.marketAvg - m.topPerformer)) * 100, 100);
    return s + pct;
  }, 0) / METRICS.length);

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5"><ArrowLeft size={18} style={{ color: T.textSub }} /></button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.gold + "20" }}><Award size={18} style={{ color: T.gold }} /></div>
              <div><h1 className="font-black text-lg">Performance Benchmark</h1><p className="text-xs" style={{ color: T.textSub }}>Comparativo vs. mercado DOOH e top performers</p></div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select value={period} onChange={e => setPeriod(e.target.value)} className="px-3 py-2 rounded-xl text-sm" style={{ background: T.card, border: `1px solid ${T.border}`, color: T.text }}>
              {["7d","30d","90d"].map(p => <option key={p} value={p}>{p === "7d" ? "7 dias" : p === "30d" ? "30 dias" : "90 dias"}</option>)}
            </select>
            {(["overview","metrics","competitors"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
                style={{ background: tab === t ? T.gold + "20" : "transparent", color: tab === t ? T.gold : T.textSub, border: `1px solid ${tab === t ? T.gold + "30" : "transparent"}` }}>
                {t === "overview" ? "Visão Geral" : t === "metrics" ? "Métricas" : "Concorrentes"}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Pontuação Geral",        value: `${overallScore}%`,  color: T.gold,    icon: Award     },
            { label: "Métricas acima do mercado",value: `${beatMarket}/${METRICS.length}`, color: T.success, icon: TrendingUp },
            { label: "CTR vs. Mercado",         value: "+62%",              color: T.primary, icon: Target    },
            { label: "NPS Anunciante",          value: "72 pts",            color: T.accent,  icon: Star      },
          ].map((k, i) => (
            <div key={i} className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3" style={{ background: k.color + "20" }}><k.icon size={15} style={{ color: k.color }} /></div>
              <div className="font-black text-2xl" style={{ color: k.color }}>{k.value}</div>
              <div className="text-xs mt-0.5" style={{ color: T.textSub }}>{k.label}</div>
            </div>
          ))}
        </div>
        {tab === "overview" && (
          <div className="grid grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-black mb-1">Radar de Performance</h3>
              <p className="text-xs mb-4" style={{ color: T.textSub }}>DOOHPLAY vs. média do mercado</p>
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={RADAR_DATA}>
                  <PolarGrid stroke={T.border} />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: T.textSub, fontSize: 11 }} />
                  <Radar key="radar-dp" name="DOOHPLAY" dataKey="doohplay" stroke={T.primary} fill={T.primary} fillOpacity={0.2} />
                  <Radar key="radar-mkt" name="Mercado"  dataKey="market"   stroke={T.textSub} fill={T.textSub} fillOpacity={0.1} />
                </RadarChart>
              </ResponsiveContainer>
              <div className="flex items-center justify-center gap-6 mt-2">
                {[{ label: "DOOHPLAY", color: T.primary }, { label: "Mercado", color: T.textSub }].map((l, i) => (
                  <div key={i} className="flex items-center gap-2"><div className="w-3 h-0.5 rounded" style={{ background: l.color }} /><span className="text-xs" style={{ color: l.color }}>{l.label}</span></div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black mb-1">CTR — Tendência 6 meses</h3>
                <p className="text-xs mb-3" style={{ color: T.textSub }}>DOOHPLAY vs. média mercado</p>
                <ResponsiveContainer width="100%" height={140}>
                  <LineChart data={TREND_DATA}>
                    <XAxis dataKey="month" tick={{ fill: T.textSub, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis hide domain={[1.5, 4]} />
                    <Tooltip contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10 }} formatter={(v: number, name: string) => [`${v}%`, name]} />
                    <Line key="line-dp" type="monotone" dataKey="doohplay" stroke={T.primary} strokeWidth={2} dot={false} name="DOOHPLAY" />
                    <Line key="line-mkt" type="monotone" dataKey="market"  stroke={T.textSub}  strokeWidth={2} dot={false} strokeDasharray="4 2" name="Mercado" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black mb-3">Posição no Mercado</h3>
                <div className="space-y-2">
                  {[
                    { rank: 1, label: "Top Performer",  range: "Score ≥ 85%", color: T.gold,    current: overallScore >= 85 },
                    { rank: 2, label: "Acima do Mercado",range: "Score 70–84%", color: T.success, current: overallScore >= 70 && overallScore < 85 },
                    { rank: 3, label: "Na Média",        range: "Score 50–69%", color: T.warning, current: overallScore >= 50 && overallScore < 70 },
                    { rank: 4, label: "Abaixo da Média", range: "Score < 50%",  color: T.danger,  current: overallScore < 50 },
                  ].map((tier, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-xl" style={{ background: tier.current ? tier.color + "15" : "transparent", border: `1px solid ${tier.current ? tier.color + "30" : "transparent"}` }}>
                      <div className="w-5 h-5 rounded-full flex items-center justify-center font-black text-xs flex-shrink-0" style={{ background: tier.color + "20", color: tier.color }}>{tier.rank}</div>
                      <div className="flex-1"><div className="text-xs font-bold" style={{ color: tier.current ? tier.color : T.text }}>{tier.label}</div><div className="text-xs" style={{ color: T.textSub }}>{tier.range}</div></div>
                      {tier.current && <span className="text-xs font-black" style={{ color: tier.color }}>{"← VOCÊ"}</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        {tab === "metrics" && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3 text-xs font-bold px-4" style={{ color: T.textSub }}>
              <span>Métrica</span>
              <span className="text-center">DOOHPLAY vs. Mercado vs. Top</span>
              <span className="text-right">Posição</span>
            </div>
            {METRICS.map(m => {
              const delta = getDelta(m.doohplay, m.marketAvg, m.higherIsBetter);
              const topPct = m.higherIsBetter ? Math.min(m.doohplay / m.topPerformer * 100, 100) : Math.min((m.topPerformer / m.doohplay) * 100, 100);
              const TrendIcon = delta.trend === "up" ? TrendingUp : delta.trend === "down" ? TrendingDown : Minus;
              const trendColor = delta.trend === "up" ? T.success : delta.trend === "down" ? T.danger : T.textSub;
              return (
                <div key={m.id} className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                  <div className="flex items-center gap-4">
                    <div className="w-32 flex-shrink-0"><div className="font-black text-sm">{m.label}</div><div className="text-xs" style={{ color: T.textSub }}>em {m.unit}</div></div>
                    <div className="flex-1">
                      <div className="space-y-1.5">
                        {[{ label: "DOOHPLAY", value: m.doohplay, color: T.primary, max: m.topPerformer }, { label: "Mercado", value: m.marketAvg, color: T.textSub, max: m.topPerformer }, { label: "Top", value: m.topPerformer, color: T.gold, max: m.topPerformer }].map((row, i) => {
                          const pct = m.higherIsBetter ? (row.value / row.max) * 100 : (row.max / row.value) * 100;
                          return (
                            <div key={i} className="flex items-center gap-2">
                              <div className="w-16 text-xs" style={{ color: row.color }}>{row.label}</div>
                              <div className="flex-1 h-1.5 rounded-full" style={{ background: T.border }}><div className="h-full rounded-full" style={{ width: `${Math.min(pct, 100)}%`, background: row.color }} /></div>
                              <div className="w-12 text-xs font-black text-right" style={{ color: row.color }}>{m.unit === "R$" ? `R$${row.value}` : `${row.value}${m.unit}`}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="w-24 flex-shrink-0 text-right">
                      <div className="flex items-center justify-end gap-1"><TrendIcon size={13} style={{ color: trendColor }} /><span className="font-black text-sm" style={{ color: trendColor }}>{delta.trend !== "flat" ? `${delta.value.toFixed(0)}%` : "—"}</span></div>
                      <div className="text-xs mt-0.5" style={{ color: T.textSub }}>{Math.round(topPct)}% do top</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {tab === "competitors" && (
          <div className="space-y-6">
            <div className="rounded-2xl border overflow-hidden" style={{ borderColor: T.border }}>
              <table className="w-full text-sm">
                <thead><tr style={{ background: T.card, borderBottom: `1px solid ${T.border}` }}>{["Plataforma","CPM Médio","CTR","Fill Rate","Telas","NPS"].map(h => (<th key={h} className="text-left px-4 py-3 text-xs font-bold" style={{ color: T.textSub }}>{h}</th>))}</tr></thead>
                <tbody>
                  {COMPETITORS.map((comp, i) => {
                    const isUs = comp.name === "DOOHPLAY";
                    return (
                      <tr key={i} className="border-b transition-colors" style={{ borderColor: T.border + "50", background: isUs ? T.primary + "08" : "transparent" }}>
                        <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{ background: comp.color }} /><span className="font-black text-sm">{comp.name}</span>{isUs && <span className="text-xs px-1.5 py-0.5 rounded-full font-bold" style={{ background: T.primary + "20", color: T.primary }}>Você</span>}</div></td>
                        <td className="px-4 py-3 font-black" style={{ color: isUs ? T.gold : T.text }}>{comp.cpm > 0 ? `R$${comp.cpm}` : "—"}</td>
                        <td className="px-4 py-3 font-black" style={{ color: isUs ? T.success : T.text }}>{comp.ctr}%</td>
                        <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="w-16 h-1.5 rounded-full" style={{ background: T.border }}><div className="h-full rounded-full" style={{ width: `${comp.fillRate}%`, background: isUs ? T.primary : T.textSub }} /></div><span className="text-xs font-bold">{comp.fillRate}%</span></div></td>
                        <td className="px-4 py-3 text-sm">{comp.screens > 0 ? comp.screens : "N/D"}</td>
                        <td className="px-4 py-3"><div className="flex items-center gap-1"><Star size={11} style={{ color: T.gold }} /><span className="font-black text-sm" style={{ color: isUs ? T.gold : T.text }}>{comp.nps}</span></div></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-black mb-4">DOOHPLAY vs. Concorrentes — CPM por Plataforma</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={COMPETITORS.filter(c => c.cpm > 0)} barSize={28}>
                  <XAxis dataKey="name" tick={{ fill: T.textSub, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10 }} formatter={(v: number) => [`R$${v}`, "CPM"]} />
                  <Bar key="bar-cpm-comp" dataKey="cpm" radius={[6, 6, 0, 0]}>
                    {COMPETITORS.filter(c => c.cpm > 0).map((comp, i) => (<Cell key={`cell-cmp-${i}`} fill={comp.color} />))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
