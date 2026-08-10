import React, { useState, useEffect } from "react";
import { ArrowLeft, Users, Eye, TrendingUp, MapPin, Clock, BarChart2, Zap, Shield, DollarSign, Brain, Activity } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, BarChart, Bar, Cell, PieChart, Pie } from "recharts";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  text: "#ECF0FF", textSub: "#4A5280",
};

const hourlyAudience = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}h`,
  count: i < 7 ? Math.floor(Math.random() * 50 + 10) :
    i < 10 ? Math.floor(Math.random() * 400 + 200) :
    i < 14 ? Math.floor(Math.random() * 700 + 400) :
    i < 18 ? Math.floor(Math.random() * 600 + 350) :
    i < 22 ? Math.floor(Math.random() * 800 + 500) :
    Math.floor(Math.random() * 200 + 80),
  dwellTime: Math.floor(Math.random() * 8 + 4),
  engagement: Math.floor(Math.random() * 40 + 20),
}));

const segments = [
  { name: "18–24 anos", pct: 22, color: T.accent },
  { name: "25–34 anos", pct: 31, color: T.primary },
  { name: "35–44 anos", pct: 24, color: T.success },
  { name: "45–54 anos", pct: 15, color: T.warning },
  { name: "55+ anos", pct: 8, color: "#E74C3C" },
];

const venuePerf = [
  { venue: "Shopping", audience: 8420, cpm: 47, engagement: 38, revenue: 396 },
  { venue: "Restaurante", audience: 3840, cpm: 38, engagement: 52, revenue: 146 },
  { venue: "Academia", audience: 2100, cpm: 35, engagement: 44, revenue: 74 },
  { venue: "Hotel", audience: 1560, cpm: 48, engagement: 29, revenue: 75 },
  { venue: "Corporativo", audience: 4200, cpm: 55, engagement: 41, revenue: 231 },
  { venue: "Hospital", audience: 2800, cpm: 52, engagement: 36, revenue: 146 },
];

const weeklyTrend = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map(d => ({
  day: d,
  audience: Math.floor(Math.random() * 5000 + 3000),
  proofs: Math.floor(Math.random() * 800 + 400),
  revenue: Math.floor(Math.random() * 1200 + 600),
}));

const heatData = Array.from({ length: 7 }, (_, day) =>
  Array.from({ length: 24 }, (_, hour) => ({
    day, hour,
    value: (() => {
      const base = hour < 7 ? 0.1 : hour < 10 ? 0.4 : hour < 14 ? 0.8 : hour < 18 ? 0.7 : hour < 22 ? 0.9 : 0.3;
      const wknd = (day === 5 || day === 6) ? 0.7 : 1;
      return base * wknd * (0.6 + Math.random() * 0.8);
    })(),
  }))
).flat();

const DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

interface Props { onBack: () => void; }

export default function AudienceIntelligence({ onBack }: Props) {
  const [tab, setTab] = useState<"overview" | "segments" | "heatmap" | "venues" | "product">("overview");
  const [liveCount, setLiveCount] = useState(2847);
  const [totalProfiles, setTotalProfiles] = useState(284700);

  useEffect(() => {
    const iv = setInterval(() => {
      setLiveCount(c => c + Math.floor(Math.random() * 5) - 1);
      setTotalProfiles(p => p + Math.floor(Math.random() * 12));
    }, 2000);
    return () => clearInterval(iv);
  }, []);

  const TABS = [
    { id: "overview", label: "Overview", icon: BarChart2 },
    { id: "segments", label: "Segmentos", icon: Users },
    { id: "heatmap", label: "Heatmap temporal", icon: Activity },
    { id: "venues", label: "Por venue", icon: MapPin },
    { id: "product", label: "Como produto", icon: DollarSign },
  ] as const;

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F0", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-sm hover:text-white transition-colors" style={{ color: T.textSub }}>
            <ArrowLeft size={16} /> Voltar
          </button>
          <div className="flex items-center gap-2 font-bold">
            <Brain size={16} style={{ color: T.accent }} /> Audience Intelligence
          </div>
          <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border" style={{ borderColor: T.border, color: T.textSub }}>
            <Shield size={12} style={{ color: T.success }} /> 100% anônimo · LGPD
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Audiência ao vivo", value: liveCount.toLocaleString("pt-BR"), sub: "pessoas na rede agora", color: T.success, icon: Eye },
            { label: "Perfis anônimos", value: `${(totalProfiles/1000).toFixed(1)}k`, sub: "acumulado (30 dias)", color: T.primary, icon: Users },
            { label: "Dwell time médio", value: "6,8s", sub: "tempo de exposição", color: T.accent, icon: Clock },
            { label: "Engajamento", value: "34%", sub: "taxa de atenção estimada", color: T.warning, icon: TrendingUp },
          ].map((m, i) => {
            const Icon = m.icon;
            return (
              <div key={i} className="rounded-2xl border p-5" style={{ background: T.card, borderColor: T.border }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs" style={{ color: T.textSub }}>{m.label}</span>
                  <Icon size={14} style={{ color: m.color }} />
                </div>
                <div className="text-2xl font-black mb-0.5" style={{ color: m.color }}>{m.value}</div>
                <div className="text-xs" style={{ color: T.textSub }}>{m.sub}</div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-shrink-0"
                style={{ background: tab === t.id ? T.accent : T.card, color: tab === t.id ? "#fff" : T.textSub, border: `1px solid ${tab === t.id ? T.accent : T.border}` }}>
                <Icon size={14} /> {t.label}
              </button>
            );
          })}
        </div>

        {tab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-2xl border p-6" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-bold mb-1">Audiência por hora do dia</h3>
                <p className="text-xs mb-4" style={{ color: T.textSub }}>Contagem anonimizada · estimativa por sensor de proximidade</p>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={hourlyAudience}>
                    <defs>
                      <linearGradient key="ai-aud" id="ai-aud" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={T.accent} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={T.accent} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="hour" tick={{ fontSize: 9, fill: T.textSub }} axisLine={false} tickLine={false} interval={3} />
                    <YAxis tick={{ fontSize: 9, fill: T.textSub }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 12 }} />
                    <Area key="area-count" type="monotone" dataKey="count" stroke={T.accent} fill="url(#ai-aud)" strokeWidth={2} name="Audiência" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="rounded-2xl border p-6" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-bold mb-1">Tendência semanal</h3>
                <p className="text-xs mb-4" style={{ color: T.textSub }}>Audiência total, provas e receita por dia</p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={weeklyTrend}>
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: T.textSub }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: T.textSub }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 12 }} />
                    <Bar key="bar-audience" dataKey="audience" fill={T.primary} radius={[4, 4, 0, 0]} name="Audiência" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: "Pico de audiência", value: "20h–22h", sub: "Sáb e Dom · +40% vs semana", color: T.success },
                { label: "Dwell time máximo", value: "12,4s", sub: "Hospital / ambientes de espera", color: T.primary },
                { label: "Contexto com maior CPM", value: "Corporativo", sub: "R$55 CPM médio", color: T.warning },
              ].map((s, i) => (
                <div key={i} className="rounded-xl border p-5" style={{ background: T.card, borderColor: T.border }}>
                  <div className="text-xs mb-1" style={{ color: T.textSub }}>{s.label}</div>
                  <div className="text-2xl font-black mb-1" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-xs" style={{ color: T.textSub }}>{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "segments" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="rounded-2xl border p-6" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-bold mb-4">Distribuição etária estimada</h3>
              <div className="flex items-center gap-8">
                <PieChart width={180} height={180}>
                  <Pie key="pie-data" data={segments} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="pct" paddingAngle={3}>
                    {segments.map((s) => <Cell key={`ai-seg-${s.name}`} fill={s.color} />)}
                  </Pie>
                </PieChart>
                <div className="flex-1 space-y-3">
                  {segments.map((s, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: s.color }} />
                      <div className="flex-1 text-sm">{s.name}</div>
                      <div className="font-bold text-sm" style={{ color: s.color }}>{s.pct}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border p-6" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-bold mb-4">Segmentos de comportamento</h3>
                {[
                  { segment: "Frequent visitors", icon: "🔄", count: "18,4k", cpm_premium: "+22%", color: T.success },
                  { segment: "Lunch crowd", icon: "🍽️", count: "42,1k", cpm_premium: "+15%", color: T.primary },
                  { segment: "Evening shoppers", icon: "🛍️", count: "61,3k", cpm_premium: "+31%", color: T.accent },
                  { segment: "Weekend family", icon: "👨‍👩‍👧", count: "34,7k", cpm_premium: "+18%", color: T.warning },
                  { segment: "Business decision-makers", icon: "💼", count: "9,2k", cpm_premium: "+47%", color: "#9B59B6" },
                ].map((seg, i) => (
                  <div key={i} className="flex items-center gap-3 py-3 border-b text-sm" style={{ borderColor: T.border }}>
                    <span className="text-xl">{seg.icon}</span>
                    <div className="flex-1">{seg.segment}</div>
                    <div style={{ color: T.textSub }}>{seg.count} perfis</div>
                    <div className="font-bold" style={{ color: seg.color }}>CPM {seg.cpm_premium}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "heatmap" && (
          <div className="rounded-2xl border p-6" style={{ background: T.card, borderColor: T.border }}>
            <h2 className="font-bold text-lg mb-2">Heatmap de audiência — hora × dia da semana</h2>
            <p className="text-sm mb-6" style={{ color: T.textSub }}>Intensidade de audiência por célula (mais escuro = mais pessoas)</p>
            <div className="overflow-x-auto">
              <div className="min-w-max">
                <div className="grid gap-1" style={{ gridTemplateColumns: `60px repeat(24, 1fr)` }}>
                  <div />
                  {Array.from({ length: 24 }, (_, h) => (
                    <div key={h} className="text-center text-xs pb-1" style={{ color: T.textSub }}>{h}h</div>
                  ))}
                  {DAYS.map((day, di) => (
                    <React.Fragment key={`row-${di}`}>
                      <div className="flex items-center text-xs font-medium pr-2" style={{ color: T.textSub }}>{day}</div>
                      {Array.from({ length: 24 }, (_, hi) => {
                        const cell = heatData.find(d => d.day === di && d.hour === hi);
                        const v = cell?.value ?? 0;
                        return (
                          <div key={`cell-${di}-${hi}`}
                            className="h-8 rounded-sm transition-all"
                            style={{ background: `rgba(124, 92, 252, ${v.toFixed(2)})`, minWidth: 28 }}
                            title={`${day} ${hi}h — ${Math.round(v * 100)}% capacidade`}
                          />
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
                <div className="flex items-center gap-3 mt-4">
                  <span className="text-xs" style={{ color: T.textSub }}>Baixo</span>
                  <div className="flex gap-1">
                    {[0.1, 0.25, 0.4, 0.55, 0.7, 0.85, 1].map((v, i) => (
                      <div key={i} className="w-6 h-4 rounded-sm" style={{ background: `rgba(124, 92, 252, ${v})` }} />
                    ))}
                  </div>
                  <span className="text-xs" style={{ color: T.textSub }}>Alto</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "venues" && (
          <div>
            <h2 className="font-bold text-xl mb-2">Audiência por tipo de venue</h2>
            <p className="text-sm mb-6" style={{ color: T.textSub }}>Performance de audiência, CPM e receita por contexto de exibição</p>
            <div className="space-y-3">
              {venuePerf.sort((a, b) => b.revenue - a.revenue).map((v, i) => (
                <div key={i} className="rounded-2xl border p-5" style={{ background: T.card, borderColor: T.border }}>
                  <div className="flex items-center gap-6">
                    <div className="text-lg font-bold w-28 flex-shrink-0" style={{ color: T.text }}>{v.venue}</div>
                    <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: "Audiência/dia", value: v.audience.toLocaleString("pt-BR"), color: T.accent },
                        { label: "CPM médio", value: `R$${v.cpm}`, color: T.primary },
                        { label: "Engajamento", value: `${v.engagement}%`, color: T.success },
                        { label: "Receita/dia", value: `R$${v.revenue}`, color: T.warning },
                      ].map((s, j) => (
                        <div key={j}>
                          <div className="text-xs mb-0.5" style={{ color: T.textSub }}>{s.label}</div>
                          <div className="font-bold text-sm" style={{ color: s.color }}>{s.value}</div>
                        </div>
                      ))}
                    </div>
                    <div className="w-24 text-right flex-shrink-0">
                      <div className="text-xs mb-1" style={{ color: T.textSub }}>Rank</div>
                      <div className="text-xl font-black" style={{ color: i < 2 ? T.warning : T.textSub }}>#{i + 1}</div>
                    </div>
                  </div>
                  <div className="mt-3 h-1 rounded-full" style={{ background: T.border }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${(v.revenue / 396) * 100}%`, background: i < 2 ? T.warning : T.primary }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "product" && (
          <div className="space-y-6">
            <div className="rounded-2xl border p-8" style={{ background: `linear-gradient(135deg, ${T.accent}15, ${T.primary}10)`, borderColor: T.accent + "30" }}>
              <h2 className="text-2xl font-bold mb-3">Dado de audiência como produto</h2>
              <p className="leading-relaxed" style={{ color: T.textSub }}>
                Os dados anônimos agregados de audiência — cruzados com ProofChain — são o maior ativo de longo prazo da DOOHPLAY. Nenhum concorrente no Brasil combina prova criptográfica com inteligência de audiência em uma única plataforma.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  title: "Audience Insights API",
                  desc: "Venda acesso a dados de audiência agregados para agências e marcas. Segmentação por venue, horário, dia da semana e contexto.",
                  price: "R$2.000–15.000/mês",
                  target: "Agências de mídia, planejamento de mídia",
                  color: T.primary,
                  icon: Brain,
                },
                {
                  title: "Verified Audience Package",
                  desc: "Pacote premium: audiência + ProofChain em um único relatório auditável. Diferencial único — DoubleVerify não tem equivalente DOOH no Brasil.",
                  price: "R$5.000–50.000/campanha",
                  target: "Grandes anunciantes, auditoria de mídia",
                  color: T.accent,
                  icon: Shield,
                },
                {
                  title: "ESG Audience Score",
                  desc: "Score de eficiência: impacto por watt, alcance por real investido vs. painel LED. Argumento ESG para marcas com metas de sustentabilidade.",
                  price: "R$500–2.000/relatório",
                  target: "Marcas com programa ESG, B3 listed",
                  color: T.success,
                  icon: Zap,
                },
              ].map((p, i) => {
                const Icon = p.icon;
                return (
                  <div key={i} className="rounded-2xl border p-6" style={{ background: T.card, borderColor: p.color + "30" }}>
                    <Icon size={24} className="mb-4" style={{ color: p.color }} />
                    <h3 className="font-bold mb-2">{p.title}</h3>
                    <p className="text-sm mb-4 leading-relaxed" style={{ color: T.textSub }}>{p.desc}</p>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2">
                        <DollarSign size={12} style={{ color: p.color }} />
                        <span style={{ color: p.color }}>{p.price}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Users size={12} className="mt-0.5" style={{ color: T.textSub }} />
                        <span style={{ color: T.textSub }}>{p.target}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="rounded-2xl border p-6" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-bold mb-4">Projeção de receita de dados (2027–2030)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                      {["Produto", "2027", "2028", "2029", "2030"].map(h => (
                        <th key={h} className="text-left p-3 font-medium" style={{ color: T.textSub }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { prod: "Audience Insights API", v: ["R$24k", "R$180k", "R$720k", "R$2,4M"] },
                      { prod: "Verified Audience Package", v: ["R$60k", "R$480k", "R$1,8M", "R$6M"] },
                      { prod: "ESG Audience Score", v: ["R$12k", "R$48k", "R$240k", "R$800k"] },
                      { prod: "Total dados", v: ["R$96k", "R$708k", "R$2,76M", "R$9,2M"], bold: true },
                    ].map((row, i) => (
                      <tr key={i} className="border-b" style={{ borderColor: T.border, background: row.bold ? T.success + "08" : "transparent" }}>
                        <td className="p-3 font-medium" style={{ color: row.bold ? T.success : T.text }}>{row.prod}</td>
                        {row.v.map((val, j) => (
                          <td key={j} className="p-3 font-mono text-xs" style={{ color: row.bold ? T.success : T.textSub }}>{val}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
