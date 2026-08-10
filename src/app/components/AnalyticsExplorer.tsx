import { useState } from "react";
import {
  ArrowLeft, Search, Play, Save, Download, Plus, ChevronRight,
  BarChart2, TrendingUp, Eye, Clock, Star, Table2,
  PieChart as PieIcon, Activity, Filter, Layers, Zap
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, ScatterChart, Scatter,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid,
  PieChart, Pie
} from "recharts";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

interface Props { onBack: () => void; onNavigate?: (v: string) => void; }
type TabId = "explorer" | "saved" | "insights";
type ChartType = "area" | "bar" | "line" | "scatter" | "pie";

const METRICS = ["Impressões","Cliques","CTR (%)","CPM (R$)","Reach","Freqúencia","Conversões","ROI","Budget Gasto","Viewability (%)"];
const DIMENSIONS = ["Campanha","Tela","Cidade","Estado","Tipo de Tela","Horário","Dia da Semana","Publisher","Segmento","Criativo"];

const SAVED_QUERIES = [
  { id: "Q001", name: "CTR por Tipo de Tela — Julho",  chart: "bar",  runs: 28, lastRun: "2h atrás",   star: true  },
  { id: "Q002", name: "Impressões Diárias — 30 dias",  chart: "area", runs: 14, lastRun: "Hoje 10:12", star: true  },
  { id: "Q003", name: "ROI por Cidade",                chart: "bar",  runs: 7,  lastRun: "Ontem",      star: false },
  { id: "Q004", name: "Distribuição CPM por Publisher",chart: "pie",  runs: 5,  lastRun: "3 dias",     star: false },
  { id: "Q005", name: "Freqúencia vs. Conversão",      chart: "scatter",runs:12, lastRun: "Ontem",    star: true  },
];

const BAR_DATA = [
  { name: "Outdoor",   value: 4.8, color: T.primary  },
  { name: "Indoor",    value: 3.4, color: T.success  },
  { name: "Trânsito",  value: 5.2, color: T.accent   },
  { name: "Retail",    value: 2.9, color: T.gold     },
  { name: "Aeroporto", value: 3.8, color: T.warning  },
];

const AREA_DATA = Array.from({ length: 30 }, (_, i) => ({
  d: `${i + 1}/07`,
  impressions: Math.round(180000 + Math.sin(i * 0.4) * 40000 + Math.random() * 20000),
  reach:       Math.round(110000 + Math.sin(i * 0.4) * 25000 + Math.random() * 12000),
}));

const LINE_DATA = [
  { city: "SP",  roi: 4.1 }, { city: "RJ", roi: 3.2 }, { city: "BH",  roi: 3.8 },
  { city: "BSB", roi: 2.9 }, { city: "CWB",roi: 3.5 }, { city: "POA", roi: 3.1 },
  { city: "SSA", roi: 2.7 }, { city: "REC", roi: 3.0 },
];

const SCATTER_DATA = Array.from({ length: 20 }, (_, i) => ({
  freq: Math.round(1 + Math.random() * 6),
  conv: Math.round(5 + Math.random() * 35 + i * 1.2),
  size: Math.round(30 + Math.random() * 60),
}));

const PIE_DATA = [
  { name: "OOH Media SP",   value: 34, color: T.primary  },
  { name: "AereoMídia",     value: 22, color: T.accent   },
  { name: "Transit Media",  value: 18, color: T.success  },
  { name: "Mall Mídia",     value: 15, color: T.gold     },
  { name: "Outros",         value: 11, color: T.textSub  },
];

const INSIGHT_CARDS = [
  { title: "Tela com maior CTR",       value: "Metrô Paulista", detail: "5.2% CTR — 53% acima da média da rede",         color: T.success, trend: "+53%"  },
  { title: "Horário mais eficiente",   value: "18h–20h",        detail: "CTR médio 4.9% vs 3.1% demais horários",        color: T.gold,    trend: "+58%"  },
  { title: "Cidade com melhor ROI",    value: "São Paulo",      detail: "4.1x ROI médio — referência da plataforma",     color: T.primary, trend: "4.1x"  },
  { title: "Segmento com + conversão", value: "Jovens Conect.", detail: "3.8% taxa de conversão, 2.2x acima da média",   color: T.accent,  trend: "3.8%"  },
];

export default function AnalyticsExplorer({ onBack }: Props) {
  const [tab, setTab]           = useState<TabId>("explorer");
  const [metric, setMetric]     = useState("CTR (%)");
  const [dimension, setDimension] = useState("Tipo de Tela");
  const [chartType, setChartType] = useState<ChartType>("bar");
  const [dateRange, setDateRange] = useState("30d");
  const [isRunning, setIsRunning] = useState(false);
  const [hasResult, setHasResult] = useState(true);

  const runQuery = () => {
    setIsRunning(true);
    setTimeout(() => { setIsRunning(false); setHasResult(true); }, 800);
  };

  const CHART_TYPES: { type: ChartType; icon: any; label: string }[] = [
    { type: "bar",     icon: BarChart2,  label: "Barras"    },
    { type: "area",    icon: Activity,   label: "Área"      },
    { type: "line",    icon: TrendingUp, label: "Linha"     },
    { type: "scatter", icon: Layers,     label: "Dispersão" },
    { type: "pie",     icon: PieIcon,    label: "Pizza"     },
  ];

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5">
              <ArrowLeft size={18} style={{ color: T.textSub }} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.accent + "20" }}>
                <Search size={18} style={{ color: T.accent }} />
              </div>
              <div>
                <h1 className="font-black text-lg">Analytics Explorer</h1>
                <p className="text-xs" style={{ color: T.textSub }}>Exploração avançada de dados DOOH — query builder visual e insights automáticos</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {(["explorer","saved","insights"] as TabId[]).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
                style={{ background: tab === t ? T.accent + "20" : "transparent", color: tab === t ? T.accent : T.textSub, border: `1px solid ${tab === t ? T.accent + "30" : "transparent"}` }}>
                {t === "explorer" ? "Explorer" : t === "saved" ? "Salvos" : "Insights IA"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {tab === "explorer" && (
          <div className="flex gap-4" style={{ minHeight: 560 }}>
            <div className="w-56 flex-shrink-0 space-y-3">
              <div className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black text-xs mb-3" style={{ color: T.textSub }}>MÉTRICA</h3>
                <div className="space-y-1">
                  {METRICS.map(m => (
                    <button key={m} onClick={() => setMetric(m)}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all"
                      style={{ background: metric === m ? T.accent + "20" : "transparent", color: metric === m ? T.accent : T.textSub }}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="w-48 flex-shrink-0 space-y-3">
              <div className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black text-xs mb-3" style={{ color: T.textSub }}>DIMENSÃO</h3>
                <div className="space-y-1">
                  {DIMENSIONS.map(d => (
                    <button key={d} onClick={() => setDimension(d)}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all"
                      style={{ background: dimension === d ? T.primary + "20" : "transparent", color: dimension === d ? T.primary : T.textSub }}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-3">
              <div className="flex items-center gap-3 p-3 rounded-2xl border flex-wrap" style={{ background: T.card, borderColor: T.border }}>
                <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: T.panel }}>
                  {CHART_TYPES.map(ct => {
                    const Icon = ct.icon;
                    return (
                      <button key={ct.type} onClick={() => setChartType(ct.type)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                        style={{ background: chartType === ct.type ? T.accent + "25" : "transparent", color: chartType === ct.type ? T.accent : T.textSub }}>
                        <Icon size={12} />{ct.label}
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center gap-1" style={{ background: T.panel, borderRadius: 12, padding: 4 }}>
                  {["7d","30d","90d","1y"].map(r => (
                    <button key={r} onClick={() => setDateRange(r)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold"
                      style={{ background: dateRange === r ? T.primary + "25" : "transparent", color: dateRange === r ? T.primary : T.textSub }}>
                      {r}
                    </button>
                  ))}
                </div>
                <div className="flex-1" />
                <button onClick={runQuery}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black"
                  style={{ background: T.accent, color: "#fff", opacity: isRunning ? 0.7 : 1 }}>
                  <Play size={13} /> {isRunning ? "Executando…" : "Executar"}
                </button>
                <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold"
                  style={{ background: T.panel, color: T.textSub, border: `1px solid ${T.border}` }}>
                  <Save size={12} /> Salvar
                </button>
                <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold"
                  style={{ background: T.panel, color: T.textSub, border: `1px solid ${T.border}` }}>
                  <Download size={12} /> CSV
                </button>
              </div>

              <div className="px-4 py-2 rounded-xl text-xs font-mono" style={{ background: T.panel, color: T.textSub }}>
                <span style={{ color: T.accent }}>SELECT</span> <span style={{ color: T.gold }}>{metric}</span>
                {" "}<span style={{ color: T.accent }}>FROM</span> impressions
                {" "}<span style={{ color: T.accent }}>GROUP BY</span> <span style={{ color: T.primary }}>{dimension}</span>
                {" "}<span style={{ color: T.accent }}>WHERE</span> date <span style={{ color: T.accent }}>{">"}}</span> NOW() - INTERVAL <span style={{ color: T.gold }}>{dateRange}</span>
              </div>

              {hasResult && (
                <div className="flex-1 p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-black">{metric} por {dimension}</h3>
                    <span className="text-xs" style={{ color: T.textSub }}>Últimos {dateRange}</span>
                  </div>

                  {chartType === "bar" && (
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={BAR_DATA} barSize={40}>
                        <XAxis dataKey="name" tick={{ fill: T.textSub, fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: T.textSub, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                        <Tooltip contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10 }}
                          formatter={(v: number) => [`${v}%`, metric]} />
                        <Bar key="bar-explorer" dataKey="value" radius={[6, 6, 0, 0]}>
                          {BAR_DATA.map((entry, i) => <Cell key={`cell-ex-${i}`} fill={entry.color} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}

                  {chartType === "area" && (
                    <ResponsiveContainer width="100%" height={280}>
                      <AreaChart data={AREA_DATA.slice(-14)}>
                        <defs>
                          <linearGradient key="grad-expl" id="grad-expl" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={T.accent} stopOpacity={0.4} />
                            <stop offset="95%" stopColor={T.accent} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="d" tick={{ fill: T.textSub, fontSize: 9 }} axisLine={false} tickLine={false} />
                        <YAxis hide />
                        <Tooltip contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10 }}
                          formatter={(v: number) => [v.toLocaleString("pt-BR"), "Impressões"]} />
                        <Area key="area-expl" type="monotone" dataKey="impressions" stroke={T.accent} strokeWidth={2.5} fill="url(#grad-expl)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}

                  {chartType === "line" && (
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={LINE_DATA} barSize={36}>
                        <XAxis dataKey="city" tick={{ fill: T.textSub, fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: T.textSub, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}x`} />
                        <Tooltip contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10 }}
                          formatter={(v: number) => [`${v}x`, "ROI"]} />
                        <Bar key="bar-line-roi" dataKey="roi" radius={[6, 6, 0, 0]}>
                          {LINE_DATA.map((entry, i) => <Cell key={`cell-lr-${i}`} fill={entry.roi >= 3.8 ? T.success : entry.roi >= 3.2 ? T.primary : T.textSub} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}

                  {chartType === "scatter" && (
                    <ResponsiveContainer width="100%" height={280}>
                      <ScatterChart>
                        <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
                        <XAxis type="number" dataKey="freq" name="Freqúencia" tick={{ fill: T.textSub, fontSize: 10 }} axisLine={false} tickLine={false} label={{ value: "Freqúencia (x)", position: "insideBottom", offset: -5, fill: T.textSub, fontSize: 10 }} />
                        <YAxis type="number" dataKey="conv" name="Conversões" tick={{ fill: T.textSub, fontSize: 10 }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10 }}
                          formatter={(v: number, n: string) => [v, n === "freq" ? "Freq." : "Conv."]} />
                        <Scatter key="scatter-expl" data={SCATTER_DATA} fill={T.accent} opacity={0.7} />
                      </ScatterChart>
                    </ResponsiveContainer>
                  )}

                  {chartType === "pie" && (
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie key="pie-expl" data={PIE_DATA} dataKey="value" cx="50%" cy="50%" outerRadius={110} paddingAngle={3}>
                          {PIE_DATA.map((entry, i) => <Cell key={`cell-pe-${i}`} fill={entry.color} />)}
                        </Pie>
                        <Tooltip contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10 }}
                          formatter={(v: number) => [`${v}%`, "Share"]} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}

                  {chartType === "pie" && (
                    <div className="flex items-center justify-center gap-4 mt-2">
                      {PIE_DATA.map((d, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-xs">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                          <span style={{ color: T.textSub }}>{d.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "saved" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-black">Queries Salvas</h2>
              <button onClick={() => setTab("explorer")}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black"
                style={{ background: T.accent, color: "#fff" }}>
                <Plus size={14} /> Nova Query
              </button>
            </div>
            <div className="space-y-3">
              {SAVED_QUERIES.map(q => (
                <div key={q.id} className="p-4 rounded-2xl border hover:bg-white/2 cursor-pointer"
                  style={{ background: T.card, borderColor: T.border }}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: T.accent + "20" }}>
                      <BarChart2 size={16} style={{ color: T.accent }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black">{q.name}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                          style={{ background: T.primary + "20", color: T.primary }}>{q.chart}</span>
                        {q.star && <Star size={12} style={{ color: T.gold }} fill={T.gold} />}
                      </div>
                      <div className="text-xs" style={{ color: T.textSub }}>
                        {q.runs} execuções · Último run: {q.lastRun}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setTab("explorer")}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                        style={{ background: T.accent + "20", color: T.accent }}>
                        <Play size={11} /> Executar
                      </button>
                      <button className="p-2 rounded-lg hover:bg-white/5">
                        <Download size={13} style={{ color: T.textSub }} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "insights" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {INSIGHT_CARDS.map((ins, i) => (
                <div key={i} className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: ins.color + "25" }}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-black mb-1" style={{ color: T.textSub }}>{ins.title.toUpperCase()}</div>
                      <div className="font-black text-xl" style={{ color: ins.color }}>{ins.value}</div>
                      <p className="text-xs mt-1.5" style={{ color: T.textSub }}>{ins.detail}</p>
                    </div>
                    <span className="font-black text-xl" style={{ color: ins.color }}>{ins.trend}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <div className="flex items-center gap-2 mb-4">
                <Zap size={15} style={{ color: T.accent }} />
                <h3 className="font-black">Anomalias Detectadas — Últimas 48h</h3>
              </div>
              <div className="space-y-2">
                {[
                  { metric: "CTR Aeroporto GRU",    value: "+41%",  desc: "Pico incomum de cliques — possível evento corporativo no terminal.", color: T.gold    },
                  { metric: "CPM Metrô Paulista",   value: "-18%",  desc: "Queda súbita de CPM às 02h–04h. Tráfego reduzido esperado.",        color: T.primary },
                  { metric: "Freq. Shopping BH",    value: "+2.8x", desc: "Freqúencia acima do ideal (6.2x). Considerar pausar exibições.",    color: T.danger  },
                ].map((a, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: T.panel }}>
                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: a.color }} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-black">{a.metric}</span>
                        <span className="font-black" style={{ color: a.color }}>{a.value}</span>
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: T.textSub }}>{a.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
