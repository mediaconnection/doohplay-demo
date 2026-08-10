import { useState } from "react";
import {
  ArrowLeft, Users, TrendingUp, MapPin, Clock, Eye, BarChart2,
  Brain, Activity, ChevronDown, ArrowUpRight, Zap
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

interface Props { onBack: () => void; onNavigate?: (v: string) => void; }

const HOURS = Array.from({ length: 24 }, (_, i) => {
  const base = i >= 6 && i <= 9 ? 55 + i * 3 : i >= 11 && i <= 14 ? 80 + i * 2 : i >= 17 && i <= 21 ? 90 + i : 20 + i;
  return { hour: `${i}h`, audience: Math.min(100, base + Math.round(Math.random() * 15)) };
});

const WEEK_DATA = [
  { day: "Seg", audience: 68, dwell: 4.2 },
  { day: "Ter", audience: 72, dwell: 4.5 },
  { day: "Qua", audience: 85, dwell: 5.1 },
  { day: "Qui", audience: 79, dwell: 4.8 },
  { day: "Sex", audience: 92, dwell: 5.6 },
  { day: "Sáb", audience: 96, dwell: 6.2 },
  { day: "Dom", audience: 61, dwell: 3.9 },
];

const AGE_GROUPS = [
  { group: "13–17", pct: 8,  color: T.accent },
  { group: "18–24", pct: 22, color: T.primary },
  { group: "25–34", pct: 31, color: T.success },
  { group: "35–44", pct: 20, color: T.gold },
  { group: "45–54", pct: 12, color: T.warning },
  { group: "55+",   pct: 7,  color: T.textSub },
];

const GENDER_DATA = [
  { name: "Feminino", value: 54, color: T.accent },
  { name: "Masculino", value: 42, color: T.primary },
  { name: "Não binário", value: 4, color: T.gold },
];

const INCOME_DATA = [
  { class: "A (>20k)", pct: 12, color: T.gold },
  { class: "B (5–20k)", pct: 31, color: T.success },
  { class: "C (2–5k)", pct: 38, color: T.primary },
  { class: "D/E (<2k)", pct: 19, color: T.textSub },
];

const INTERESTS = [
  { name: "Gastronomia", pct: 68 }, { name: "Fitness", pct: 54 }, { name: "Tecnologia", pct: 49 },
  { name: "Moda", pct: 45 }, { name: "Viagem", pct: 38 }, { name: "Pet", pct: 34 },
  { name: "Finanças", pct: 29 }, { name: "Saúde", pct: 26 },
];

const LOCATIONS = [
  { name: "Shopping Ibirapuera",    city: "São Paulo",     daily: 14200, dwell: 5.8, cpm: 52 },
  { name: "Metro Paulista L1",      city: "São Paulo",     daily: 28400, dwell: 2.1, cpm: 38 },
  { name: "Aeroporto GRU T2",       city: "Guarulhos",     daily: 31000, dwell: 42,  cpm: 68 },
  { name: "Av. Paulista 1000",       city: "São Paulo",     daily: 44000, dwell: 1.2, cpm: 28 },
  { name: "Shopping Iguatemi SP",   city: "São Paulo",     daily: 12800, dwell: 6.4, cpm: 58 },
  { name: "Rodoviária Tietê",       city: "São Paulo",     daily: 22000, dwell: 18,  cpm: 35 },
];

const RADAR_DATA = [
  { subject: "Alcance",      A: 88, fullMark: 100 },
  { subject: "Freqúencia",   A: 72, fullMark: 100 },
  { subject: "Engajamento",  A: 64, fullMark: 100 },
  { subject: "Dwell Time",   A: 81, fullMark: 100 },
  { subject: "Conversão",    A: 56, fullMark: 100 },
  { subject: "Brand Recall", A: 79, fullMark: 100 },
];

const SEGMENTS = [
  { name: "Executivos em trânsito",  size: "320k", icon: "💼", match: 92 },
  { name: "Jovens urbanos",          size: "540k", icon: "🎯", match: 87 },
  { name: "Famílias de fim de semana", size: "280k", icon: "👨‍👩‍👧", match: 79 },
  { name: "Turistas e visitantes",   size: "190k", icon: "✈️", match: 74 },
  { name: "Profissionais de saúde",  size: "88k",  icon: "🏥", match: 68 },
];

export default function AudienceAnalytics({ onBack, onNavigate }: Props) {
  const [period, setPeriod]   = useState("7d");
  const [location, setLocation] = useState("Todos");
  const [activeTab, setActiveTab] = useState<"overview"|"demographics"|"locations"|"segments">("overview");

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5">
              <ArrowLeft size={18} style={{ color: T.textSub }} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.success + "20" }}>
                <Users size={18} style={{ color: T.success }} />
              </div>
              <div>
                <h1 className="font-black text-lg">Audiência Analytics</h1>
                <p className="text-xs" style={{ color: T.textSub }}>Análise demográfica e comportamental</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {["24h","7d","30d","90d"].map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className="px-3 py-1.5 rounded-lg text-sm font-bold"
                style={{ background: period === p ? T.success + "20" : "transparent", color: period === p ? T.success : T.textSub, border: `1px solid ${period === p ? T.success + "40" : "transparent"}` }}>
                {p}
              </button>
            ))}
            <div className="flex items-center gap-1 ml-2 px-3 py-1.5 rounded-xl text-sm" style={{ background: T.card, border: `1px solid ${T.border}`, color: T.textSub }}>
              <MapPin size={13} />
              <select value={location} onChange={e => setLocation(e.target.value)}
                className="bg-transparent text-sm outline-none" style={{ color: T.textSub }}>
                <option>Todos</option>
                {LOCATIONS.map(l => <option key={l.name}>{l.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 flex gap-1 pb-3">
          {(["overview","demographics","locations","segments"] as const).map((id) => {
            const labels: Record<string,string> = { overview: "Visão Geral", demographics: "Demografias", locations: "Locais", segments: "Segmentos" };
            return (
              <button key={id} onClick={() => setActiveTab(id)}
                className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
                style={{ background: activeTab === id ? T.success + "20" : "transparent", color: activeTab === id ? T.success : T.textSub, border: `1px solid ${activeTab === id ? T.success + "30" : "transparent"}` }}>
                {labels[id]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        <div className="grid grid-cols-5 gap-4">
          {[
            { label: "Audiência Diária",       value: "148k",  delta: "+12%", color: T.success, icon: Users },
            { label: "Dwell Time Médio",        value: "4.8s",  delta: "+0.3s", color: T.primary, icon: Clock },
            { label: "Freqúencia/Pessoa/Dia",   value: "2.4×",  delta: "+0.2×", color: T.gold, icon: Eye },
            { label: "CPM Efetivo",             value: "R$42",  delta: "-R$3", color: T.accent, icon: TrendingUp },
            { label: "Score Engajamento",       value: "78/100", delta: "+4", color: T.warning, icon: Activity },
          ].map((k, i) => (
            <div key={i} className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: k.color + "20" }}>
                  <k.icon size={15} style={{ color: k.color }} />
                </div>
                <span className="text-xs font-bold" style={{ color: k.delta.startsWith("+") ? T.success : T.danger }}>{k.delta}</span>
              </div>
              <div className="font-black text-2xl" style={{ color: k.color }}>{k.value}</div>
              <div className="text-xs mt-0.5" style={{ color: T.textSub }}>{k.label}</div>
            </div>
          ))}
        </div>

        {activeTab === "overview" && (
          <>
            <div className="grid grid-cols-5 gap-6">
              <div className="col-span-3 p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black mb-1">Audiência por Hora</h3>
                <p className="text-xs mb-4" style={{ color: T.textSub }}>Índice de lotação relativo (0–100)</p>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={HOURS}>
                    <defs>
                      <linearGradient key="grad-aud" id="grad-aud" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={T.success} stopOpacity={0.35} />
                        <stop offset="100%" stopColor={T.success} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="hour" tick={{ fill: T.textSub, fontSize: 9 }} axisLine={false} tickLine={false} interval={2} />
                    <YAxis hide />
                    <Tooltip contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10 }} formatter={(v: number) => [`${v}`, "Índice"]} />
                    <Area key="area-audience" type="monotone" dataKey="audience" stroke={T.success} fill="url(#grad-aud)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="col-span-2 p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black mb-1">Por Dia da Semana</h3>
                <p className="text-xs mb-4" style={{ color: T.textSub }}>Índice de audiência</p>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={WEEK_DATA}>
                    <XAxis dataKey="day" tick={{ fill: T.textSub, fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10 }} />
                    <Bar key="bar-audience" dataKey="audience" radius={[6,6,0,0]}>
                      {WEEK_DATA.map((d, i) => (
                        <Cell key={i} fill={d.day === "Sex" || d.day === "Sáb" ? T.success : T.primary + "90"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black mb-1">Score de Performance</h3>
                <p className="text-xs mb-2" style={{ color: T.textSub }}>Radar multidimensional</p>
                <ResponsiveContainer width="100%" height={200}>
                  <RadarChart data={RADAR_DATA}>
                    <PolarGrid stroke={T.border} />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: T.textSub, fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0,100]} tick={{ fill: T.textSub, fontSize: 8 }} />
                    <Radar key="radar-A" name="Score" dataKey="A" stroke={T.success} fill={T.success} fillOpacity={0.2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="col-span-2 p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black mb-4">Top Interesses da Audiência</h3>
                <div className="space-y-2.5">
                  {INTERESTS.map((interest, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-sm w-36 flex-shrink-0">{interest.name}</span>
                      <div className="flex-1 h-2 rounded-full" style={{ background: T.border }}>
                        <div className="h-full rounded-full transition-all"
                          style={{ width: `${interest.pct}%`, background: `linear-gradient(90deg,${T.success},${T.primary})` }} />
                      </div>
                      <span className="text-xs font-bold w-8 text-right" style={{ color: T.success }}>{interest.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === "demographics" && (
          <div className="grid grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-black mb-4">Faixa Etária</h3>
              <div className="space-y-3">
                {AGE_GROUPS.map(ag => (
                  <div key={ag.group}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold">{ag.group}</span>
                      <span className="text-sm font-black" style={{ color: ag.color }}>{ag.pct}%</span>
                    </div>
                    <div className="h-2.5 rounded-full" style={{ background: T.border }}>
                      <div className="h-full rounded-full" style={{ width: `${ag.pct * 3}%`, background: ag.color }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-xl" style={{ background: T.panel }}>
                <div className="text-xs font-bold" style={{ color: T.gold }}>Mediana de idade</div>
                <div className="font-black text-2xl mt-0.5">31 anos</div>
              </div>
            </div>

            <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-black mb-4">Gênero</h3>
              <div className="flex items-center justify-center mb-4">
                <PieChart width={180} height={180}>
                  <Pie key="pie-gender" data={GENDER_DATA} cx={90} cy={90} innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={3}>
                    {GENDER_DATA.map((g, i) => <Cell key={i} fill={g.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10 }} formatter={(v: number) => [`${v}%`, ""]} />
                </PieChart>
              </div>
              <div className="space-y-2">
                {GENDER_DATA.map(g => (
                  <div key={g.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: g.color }} />
                      <span className="text-sm">{g.name}</span>
                    </div>
                    <span className="font-black" style={{ color: g.color }}>{g.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-black mb-4">Renda Estimada</h3>
              <div className="space-y-3">
                {INCOME_DATA.map(ic => (
                  <div key={ic.class}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold">{ic.class}</span>
                      <span className="text-sm font-black" style={{ color: ic.color }}>{ic.pct}%</span>
                    </div>
                    <div className="h-2.5 rounded-full" style={{ background: T.border }}>
                      <div className="h-full rounded-full" style={{ width: `${ic.pct * 2.5}%`, background: ic.color }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-xl flex items-start gap-2" style={{ background: T.panel }}>
                <Brain size={14} style={{ color: T.accent, flexShrink: 0, marginTop: 1 }} />
                <div className="text-xs" style={{ color: T.textSub }}>
                  Audiência concentrada nas classes B e C — ideal para campanhas de varejo e serviços essenciais.
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "locations" && (
          <div className="rounded-2xl border overflow-hidden" style={{ borderColor: T.border }}>
            <div className="p-4" style={{ background: T.card, borderBottom: `1px solid ${T.border}` }}>
              <h3 className="font-black">Audiência por Local</h3>
              <p className="text-xs mt-0.5" style={{ color: T.textSub }}>Fluxo diário estimado, dwell time e CPM</p>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: T.panel, borderBottom: `1px solid ${T.border}` }}>
                  {["Local","Cidade","Fluxo Diário","Dwell Time","CPM","Potencial"].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-bold" style={{ color: T.textSub }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {LOCATIONS.map((loc, i) => {
                  const potential = Math.round((loc.daily * loc.dwell) / 1000);
                  return (
                    <tr key={i} className="border-b hover:bg-white/3" style={{ borderColor: T.border + "60" }}>
                      <td className="px-5 py-4"><div className="font-bold">{loc.name}</div></td>
                      <td className="px-5 py-4 text-sm" style={{ color: T.textSub }}>{loc.city}</td>
                      <td className="px-5 py-4"><span className="font-black" style={{ color: T.success }}>{loc.daily.toLocaleString("pt-BR")}</span></td>
                      <td className="px-5 py-4"><span className="font-bold" style={{ color: loc.dwell > 10 ? T.gold : T.primary }}>{loc.dwell >= 60 ? `${Math.round(loc.dwell/60)}min` : `${loc.dwell}s`}</span></td>
                      <td className="px-5 py-4 font-bold" style={{ color: T.accent }}>R${loc.cpm}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 rounded-full w-20" style={{ background: T.border }}>
                            <div className="h-full rounded-full" style={{ width: `${Math.min(100, potential * 3)}%`, background: T.success }} />
                          </div>
                          <span className="text-xs font-bold" style={{ color: T.success }}>{potential}k·s</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "segments" && (
          <div className="space-y-5">
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl" style={{ background: T.accent + "12", border: `1px solid ${T.accent}25` }}>
              <Brain size={16} style={{ color: T.accent }} />
              <span className="text-sm" style={{ color: T.accent }}>
                Segmentos gerados por IA — baseados em comportamento de fluxo, horário e localização
              </span>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {SEGMENTS.map((seg, i) => (
                <div key={i} className="p-5 rounded-2xl border flex items-center justify-between"
                  style={{ background: T.card, borderColor: T.border }}>
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{seg.icon}</div>
                    <div>
                      <div className="font-black text-base">{seg.name}</div>
                      <div className="text-sm mt-0.5" style={{ color: T.textSub }}>{seg.size} pessoas/mês · Score de match: {seg.match}%</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-black text-xl" style={{ color: T.success }}>{seg.match}%</div>
                      <div className="text-xs" style={{ color: T.textSub }}>compatibilidade</div>
                    </div>
                    <button onClick={() => onNavigate?.("cpm-optimizer")}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
                      style={{ background: T.primary + "20", color: T.primary, border: `1px solid ${T.primary}30` }}>
                      <Zap size={13} /> Criar Campanha
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
