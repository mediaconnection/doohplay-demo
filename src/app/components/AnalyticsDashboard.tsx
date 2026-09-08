import { useState } from "react";
import { ArrowLeft, TrendingUp, Eye, DollarSign, Clock, BarChart2, Star, Users, ArrowUpRight, ArrowDownRight, Filter, Download, Calendar } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from "recharts";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

const HOUR_DATA = Array.from({ length: 17 }, (_, i) => {
  const h = i + 6;
  const isPrime = h >= 11 && h <= 14 || h >= 18 && h <= 21;
  const base = isPrime ? 110 + Math.random() * 60 : 40 + Math.random() * 40;
  return { hora: `${h}h`, impressoes: Math.round(base), receita: +(base * 0.038).toFixed(2) };
});

const WEEK_DATA = [
  { dia: "Seg", impressoes: 1284, receita: 48.79, campanhas: 5 },
  { dia: "Ter", impressoes: 1198, receita: 45.52, campanhas: 5 },
  { dia: "Qua", impressoes: 1420, receita: 53.96, campanhas: 6 },
  { dia: "Qui", impressoes: 1380, receita: 52.44, campanhas: 6 },
  { dia: "Sex", impressoes: 1650, receita: 62.70, campanhas: 7 },
  { dia: "Sáb", impressoes: 980, receita: 37.24, campanhas: 4 },
  { dia: "Dom", impressoes: 720, receita: 27.36, campanhas: 3 },
];

const MONTH_DATA = Array.from({ length: 30 }, (_, i) => ({
  dia: i + 1,
  receita: Math.round(30 + Math.random() * 40 + (i > 15 ? 15 : 0)),
  impressoes: Math.round(900 + Math.random() * 600),
}));

const ADVERTISERS = [
  { name: "Auto Finance",     impressoes: 48200, receita: 183.16, cpm: 38.0,  share: 28 },
  { name: "Varejo Brasil",    impressoes: 38700, receita: 136.87, cpm: 35.4,  share: 22 },
  { name: "Banco Delta",      impressoes: 31400, receita: 137.72, cpm: 43.9,  share: 18 },
  { name: "Food Express",     impressoes: 27600, receita: 98.27,  cpm: 35.6,  share: 16 },
  { name: "Canal DOOHPLAY",   impressoes: 29800, receita: 89.40,  cpm: 30.0,  share: 16 },
];

const PIE_DATA = ADVERTISERS.map(a => ({ name: a.name, value: a.share }));
const PIE_COLORS = [T.primary, T.accent, T.success, T.warning, T.textSub];

const CONTENT_PERF = [
  { name: "Promoção do Dia",    views: 12840, ctr: 4.2, avgDuration: 15, score: 98 },
  { name: "Cardápio Executivo", views: 9210,  ctr: 3.8, avgDuration: 20, score: 97 },
  { name: "Institucional",      views: 11400, ctr: 2.1, avgDuration: 30, score: 100 },
  { name: "Canal DOOHPLAY",     views: 8900,  ctr: 1.9, avgDuration: 10, score: 100 },
  { name: "Happy Hour",         views: 7200,  ctr: 5.1, avgDuration: 15, score: 99 },
];

type Period = "hoje" | "semana" | "mês";
interface Props { onBack: () => void; }

export default function AnalyticsDashboard({ onBack }: Props) {
  const [period, setPeriod] = useState<Period>("semana");
  const [tab, setTab] = useState<"visao-geral" | "anunciantes" | "conteudo" | "horarios">("visao-geral");

  const totImpr = WEEK_DATA.reduce((a, d) => a + d.impressoes, 0);
  const totRec  = WEEK_DATA.reduce((a, d) => a + d.receita, 0);
  const avgCpm  = +(totRec / totImpr * 1000).toFixed(2);

  const KPIs = [
    { label: "Impressões", value: totImpr.toLocaleString("pt-BR"), delta: "+8,4%", up: true, color: T.primary, icon: Eye },
    { label: "Receita",    value: `R$${totRec.toFixed(2)}`,          delta: "+12,1%", up: true, color: T.success, icon: DollarSign },
    { label: "CPM médio",  value: `R$${avgCpm}`,                 delta: "+3,2%",  up: true, color: T.accent, icon: TrendingUp },
    { label: "Fill rate",  value: "71%",                             delta: "-2,0%",  up: false, color: T.warning, icon: BarChart2 },
  ];

  const chartData = period === "hoje" ? HOUR_DATA.map(d => ({ x: d.hora, receita: d.receita, impressoes: d.impressoes }))
    : period === "semana" ? WEEK_DATA.map(d => ({ x: d.dia, receita: d.receita, impressoes: d.impressoes }))
    : MONTH_DATA.map(d => ({ x: `${d.dia}`, receita: d.receita, impressoes: d.impressoes }));

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5 transition-colors"><ArrowLeft size={18} style={{ color: T.textSub }} /></button>
          <BarChart2 size={20} style={{ color: T.primary }} />
          <div>
            <h1 className="font-black text-lg">Analytics</h1>
            <p className="text-xs" style={{ color: T.textSub }}>Desempenho detalhado das suas telas</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="flex rounded-xl border overflow-hidden" style={{ borderColor: T.border }}>
              {(["hoje", "semana", "mês"] as Period[]).map(p => (
                <button key={p} onClick={() => setPeriod(p)} className="px-3 py-1.5 text-xs font-medium capitalize transition-all"
                  style={{ background: period === p ? T.primary : T.panel, color: period === p ? "#fff" : T.textSub }}>{p}</button>
              ))}
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs" style={{ borderColor: T.border, color: T.textSub, background: T.panel }}>
              <Download size={12} /> Exportar
            </button>
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-6 pb-3 flex gap-1">
          {([{ id: "visao-geral", label: "Visão Geral" }, { id: "anunciantes", label: "Anunciantes" }, { id: "conteudo", label: "Conteúdo" }, { id: "horarios", label: "Horários" }] as const).map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{ background: tab === t.id ? T.primary + "20" : "transparent", color: tab === t.id ? T.primary : T.textSub }}>{t.label}</button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {KPIs.map((k, i) => {
            const Icon = k.icon;
            return (
              <div key={i} className="rounded-2xl border p-4" style={{ background: T.card, borderColor: T.border }}>
                <div className="flex items-center justify-between mb-2"><span className="text-xs" style={{ color: T.textSub }}>{k.label}</span><Icon size={14} style={{ color: k.color }} /></div>
                <div className="text-2xl font-black mb-1" style={{ color: k.color }}>{k.value}</div>
                <div className="flex items-center gap-1 text-xs">
                  {k.up ? <ArrowUpRight size={12} style={{ color: T.success }} /> : <ArrowDownRight size={12} style={{ color: T.danger }} />}
                  <span style={{ color: k.up ? T.success : T.danger }}>{k.delta}</span>
                  <span style={{ color: T.textSub }}>vs. período anterior</span>
                </div>
              </div>
            );
          })}
        </div>

        {tab === "visao-geral" && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="rounded-2xl border p-5" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-bold mb-4 text-sm">Receita ({period})</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={chartData}>
                    <defs><linearGradient key="ad-rev" id="ad-rev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={T.success} stopOpacity={0.35} /><stop offset="95%" stopColor={T.success} stopOpacity={0} /></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
                    <XAxis dataKey="x" tick={{ fill: T.textSub, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: T.textSub, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${v}`} />
                    <Tooltip contentStyle={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12 }} formatter={(v: number) => [`R$${v}`, "Receita"]} />
                    <Area key="area-receita" type="monotone" dataKey="receita" stroke={T.success} fill="url(#ad-rev)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="rounded-2xl border p-5" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-bold mb-4 text-sm">Impressões ({period})</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
                    <XAxis dataKey="x" tick={{ fill: T.textSub, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: T.textSub, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12 }} formatter={(v: number) => [v.toLocaleString("pt-BR"), "Impressões"]} />
                    <Bar key="bar-impressoes" dataKey="impressoes" fill={T.primary} radius={[4, 4, 0, 0]}>
                      {chartData.map((_, i) => <Cell key={`ad-cell-${i}`} fill={T.primary} fillOpacity={0.7 + 0.3 * (i / chartData.length)} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="rounded-2xl border p-5" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-bold mb-4 text-sm">Receita por anunciante</h3>
              <div className="flex items-center gap-8">
                <PieChart width={180} height={180}>
                  <Pie key="pie-data" data={PIE_DATA} cx={85} cy={85} innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                    {PIE_DATA.map((_, i) => <Cell key={`ad-pie-${i}`} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8 }} formatter={(v: number) => [`${v}%`, ""]} />
                </PieChart>
                <div className="flex-1 space-y-2">
                  {PIE_DATA.map((d, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i] }} />
                      <span className="flex-1" style={{ color: T.textSub }}>{d.name}</span>
                      <span className="font-bold">{d.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "anunciantes" && (
          <div className="rounded-2xl border overflow-hidden" style={{ background: T.card, borderColor: T.border }}>
            <div className="p-4 border-b" style={{ borderColor: T.border }}><h3 className="font-bold text-sm">Desempenho por anunciante</h3></div>
            <table className="w-full text-sm">
              <thead><tr style={{ borderBottom: `1px solid ${T.border}` }}>{["Anunciante", "Impressões", "Receita", "CPM", "Share"].map((h, i) => <th key={i} className="px-5 py-3 text-left font-medium" style={{ color: T.textSub }}>{h}</th>)}</tr></thead>
              <tbody>
                {ADVERTISERS.map((a, i) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-white/2 transition-colors" style={{ borderColor: T.border }}>
                    <td className="px-5 py-4"><div className="flex items-center gap-2"><div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0" style={{ background: PIE_COLORS[i] + "25", color: PIE_COLORS[i] }}>{a.name[0]}</div><span className="font-medium">{a.name}</span></div></td>
                    <td className="px-5 py-4" style={{ color: T.textSub }}>{a.impressoes.toLocaleString("pt-BR")}</td>
                    <td className="px-5 py-4 font-bold" style={{ color: T.success }}>R${a.receita.toFixed(2)}</td>
                    <td className="px-5 py-4" style={{ color: T.textSub }}>R${a.cpm.toFixed(1)}</td>
                    <td className="px-5 py-4"><div className="flex items-center gap-2"><div className="h-1.5 w-16 rounded-full" style={{ background: T.border }}><div className="h-full rounded-full" style={{ width: `${a.share}%`, background: PIE_COLORS[i] }} /></div><span className="text-xs font-bold" style={{ color: PIE_COLORS[i] }}>{a.share}%</span></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "conteudo" && (
          <div className="space-y-3">
            {CONTENT_PERF.map((c, i) => (
              <div key={i} className="rounded-2xl border p-5" style={{ background: T.card, borderColor: T.border }}>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-sm" style={{ background: T.primary + "20", color: T.primary }}>{i + 1}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1"><span className="font-bold">{c.name}</span><span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: T.success + "20", color: T.success }}>Score {c.score}</span></div>
                    <div className="grid grid-cols-3 gap-4 mt-3">
                      {[{ label: "Exibições", value: c.views.toLocaleString("pt-BR"), color: T.primary }, { label: "CTR médio", value: `${c.ctr}%`, color: T.accent }, { label: "Duração", value: `${c.avgDuration}s`, color: T.warning }].map((s, j) => (
                        <div key={j}><div className="text-xs mb-0.5" style={{ color: T.textSub }}>{s.label}</div><div className="font-black text-lg" style={{ color: s.color }}>{s.value}</div></div>
                      ))}
                    </div>
                    <div className="mt-3 h-1.5 rounded-full" style={{ background: T.border }}><div className="h-full rounded-full" style={{ width: `${(c.views / CONTENT_PERF[0].views) * 100}%`, background: T.primary }} /></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "horarios" && (
          <div className="space-y-5">
            <div className="rounded-2xl border p-5" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-bold mb-1 text-sm">Impressões por hora do dia</h3>
              <p className="text-xs mb-4" style={{ color: T.textSub }}>Horários de pico: 12h–14h e 18h–21h</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={HOUR_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
                  <XAxis dataKey="hora" tick={{ fill: T.textSub, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: T.textSub, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12 }} />
                  <Bar key="bar-impressoes" dataKey="impressoes" name="Impressões" radius={[4, 4, 0, 0]}>
                    {HOUR_DATA.map((d, i) => { const h = i + 6; const prime = (h >= 11 && h <= 14) || (h >= 18 && h <= 21); return <Cell key={`ad-h-${i}`} fill={prime ? T.success : T.primary} fillOpacity={prime ? 1 : 0.5} />; })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[{ label: "Pico da manhã", time: "9h–11h", impr: "284/h", color: T.primary }, { label: "Pico do almoço", time: "12h–14h", impr: "158/h", color: T.success }, { label: "Pico noturno", time: "18h–21h", impr: "172/h", color: T.accent }].map((p, i) => (
                <div key={i} className="rounded-xl border p-4 text-center" style={{ background: T.card, borderColor: p.color + "25" }}>
                  <div className="text-xl font-black mb-1" style={{ color: p.color }}>{p.impr}</div>
                  <div className="font-medium text-sm">{p.label}</div>
                  <div className="text-xs mt-0.5" style={{ color: T.textSub }}>{p.time}</div>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border p-5" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-bold mb-4 text-sm">Receita por hora</h3>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={HOUR_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
                  <XAxis dataKey="hora" tick={{ fill: T.textSub, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: T.textSub, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${v}`} />
                  <Tooltip contentStyle={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12 }} formatter={(v: number) => [`R$${v}`, "Receita"]} />
                  <Line key="line-receita" type="monotone" dataKey="receita" stroke={T.gold} strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
