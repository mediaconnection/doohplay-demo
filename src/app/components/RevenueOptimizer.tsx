import { useState } from "react";
import { ArrowLeft, TrendingUp, DollarSign, Zap, Target, BarChart2, CheckCircle, ArrowRight, Star, Lightbulb, Clock, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

const CURRENT = { cpm: 32, fillRate: 71, impressionsDay: 1284, revenueMonth: 1190, screens: 3 };

const RECOMMENDATIONS = [
  {
    id: "r1", priority: "critical", title: "Ativar Sorteio Ponderado",
    impact: "+R$420/mês", effort: "5 min",
    desc: "Seu playlist usa distribuição uniforme. Com sorteio ponderado 60/20/15/5%, anúncios premium aparecem mais — aumentando CPM médio de R$32 para R$42.",
    steps: ["Acesse Content Studio → Sorteio Ponderado", "Configure os pesos por categoria", "Salve e aguarde 24h para otimização"],
    category: "conteúdo", color: T.danger, icon: "🎲",
    before: 32, after: 42, metric: "CPM",
  },
  {
    id: "r2", priority: "high", title: "Ativar Canal DOOHPLAY nos horários vazios",
    impact: "+R$180/mês", effort: "2 min",
    desc: "Suas telas ficam 29% do tempo sem anúncio pago (fill rate 71%). O Canal DOOHPLAY preenche esses momentos com conteúdo que gera receita de rede.",
    steps: ["Content Studio → Canal DOOHPLAY", "Ative os 12 canais disponíveis", "Defina prioridade: menor que anúncios pagos"],
    category: "fill rate", color: T.warning, icon: "📺",
    before: 71, after: 94, metric: "Fill Rate %",
  },
  {
    id: "r3", priority: "high", title: "Adicionar 2 telas — limite do seu plano",
    impact: "+R$800/mês", effort: "Físico",
    desc: "Você tem 3 telas de 5 permitidas no plano Pro. Cada tela adicional gera ~R$400/mês com sua configuração atual.",
    steps: ["Compre ou localize TVs disponíveis (43″ recomendado)", "Instale DOOHPLAY Player via QR Code", "Ative em Setup de Tela → código único"],
    category: "escala", color: T.primary, icon: "📺",
    before: 3, after: 5, metric: "Telas",
  },
  {
    id: "r4", priority: "medium", title: "Criar conteúdo com IA para horário nobre",
    impact: "+R$95/mês", effort: "15 min",
    desc: "Das 11h–14h e 18h–21h o CPM sobe 35%. Peças criadas especificamente para esses horários aumentam o CTR e o valor pago pelos anunciantes.",
    steps: ["Content Studio → IA Generativa", "Crie peças para horário de almoço e jantar", "Agende para esses períodos no playlist"],
    category: "conteúdo", color: T.accent, icon: "🤖",
    before: 32, after: 43, metric: "CPM horário nobre",
  },
  {
    id: "r5", priority: "medium", title: "Configurar widgets dinâmicos",
    impact: "+R$60/mês", effort: "10 min",
    desc: "Telas com clima, câmbio e notícias em tempo real aumentam o tempo de atenção do espectador — anunciantes pagam 15% mais por impressões em telas com widgets.",
    steps: ["Content Studio → Widgets", "Ative clima local + câmbio + manchetes", "Posicione no rodapé ou canto lateral"],
    category: "engajamento", color: T.success, icon: "🌡️",
    before: 32, after: 37, metric: "CPM médio",
  },
];

const PROJ_DATA = Array.from({ length: 6 }, (_, i) => {
  const month = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"][i];
  const base = CURRENT.revenueMonth * (1 + i * 0.05);
  const opt = CURRENT.revenueMonth * (1 + i * 0.22);
  return { month, atual: Math.round(base), otimizado: Math.round(opt) };
});

const CPM_DATA = [
  { hora: "06h", cpm: 22 }, { hora: "08h", cpm: 28 }, { hora: "10h", cpm: 35 },
  { hora: "12h", cpm: 45 }, { hora: "14h", cpm: 42 }, { hora: "16h", cpm: 38 },
  { hora: "18h", cpm: 48 }, { hora: "20h", cpm: 52 }, { hora: "22h", cpm: 30 },
];

const PRIORITY_ORDER = ["critical", "high", "medium"];
const PRIORITY_COLOR: Record<string, string> = { critical: T.danger, high: T.warning, medium: T.primary };
const PRIORITY_LABEL: Record<string, string> = { critical: "Crítico", high: "Alta", medium: "Média" };

interface Props { onBack: () => void; }

export default function RevenueOptimizer({ onBack }: Props) {
  const [applied, setApplied] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<string | null>("r1");
  const [applying, setApplying] = useState<string | null>(null);
  const [tab, setTab] = useState<"recs" | "analytics" | "simulate">("recs");
  const [simScreens, setSimScreens] = useState(3);
  const [simCpm, setSimCpm] = useState(32);
  const [simFill, setSimFill] = useState(71);

  const totalImpact = RECOMMENDATIONS
    .filter(r => !applied.has(r.id))
    .reduce((a, r) => a + parseInt(r.impact.replace(/[^0-9]/g, "")), 0);

  const handleApply = (id: string) => {
    setApplying(id);
    setTimeout(() => {
      setApplying(null);
      setApplied(prev => new Set([...prev, id]));
    }, 1600);
  };

  const simRevenue = Math.round(simScreens * (simCpm / 1000) * 1440 * (simFill / 100) * 30);

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5"><ArrowLeft size={18} style={{ color: T.textSub }} /></button>
          <div>
            <h1 className="font-black text-lg">Otimizador de Receita</h1>
            <p className="text-xs" style={{ color: T.textSub }}>Recomendações de IA para maximizar seu ganho mensal</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium" style={{ background: T.success + "15", color: T.success }}>
              <TrendingUp size={12} /> +R${totalImpact}/mês disponível
            </div>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-6 pb-3 flex gap-1">
          {(["recs", "analytics", "simulate"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{ background: tab === t ? T.primary + "20" : "transparent", color: tab === t ? T.primary : T.textSub }}>
              {t === "recs" ? "Recomendações" : t === "analytics" ? "Analytics" : "Simulador"}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* RECS TAB */}
        {tab === "recs" && (
          <div className="space-y-6">
            {/* Current state */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Receita atual/mês", value: `R$${CURRENT.revenueMonth.toLocaleString("pt-BR")}`, color: T.success },
                { label: "CPM médio", value: `R$${CURRENT.cpm},00`, color: T.primary },
                { label: "Fill rate", value: `${CURRENT.fillRate}%`, color: T.warning },
                { label: "Potencial total", value: `+R$${totalImpact}`, color: T.gold },
              ].map((s, i) => (
                <div key={i} className="rounded-xl border p-4" style={{ background: T.card, borderColor: T.border }}>
                  <div className="text-xs mb-1" style={{ color: T.textSub }}>{s.label}</div>
                  <div className="text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Recs */}
            <div className="space-y-3">
              {RECOMMENDATIONS.sort((a, b) => PRIORITY_ORDER.indexOf(a.priority) - PRIORITY_ORDER.indexOf(b.priority)).map(r => {
                const isApplied = applied.has(r.id);
                const isApplying = applying === r.id;
                const isExpanded = expanded === r.id;
                return (
                  <div key={r.id} className="rounded-2xl border overflow-hidden transition-all"
                    style={{ background: T.card, borderColor: isApplied ? T.success + "30" : PRIORITY_COLOR[r.priority] + "20" }}>
                    <div className="p-5 flex items-start gap-4 cursor-pointer" onClick={() => setExpanded(isExpanded ? null : r.id)}>
                      <span className="text-3xl flex-shrink-0">{r.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-bold">{r.title}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: PRIORITY_COLOR[r.priority] + "20", color: PRIORITY_COLOR[r.priority] }}>
                            {PRIORITY_LABEL[r.priority]}
                          </span>
                          {isApplied && <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: T.success + "20", color: T.success }}>✓ Aplicado</span>}
                        </div>
                        <p className="text-sm line-clamp-2" style={{ color: T.textSub }}>{r.desc}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs">
                          <span className="font-black" style={{ color: T.success }}>{r.impact}</span>
                          <span style={{ color: T.textSub }}>⏱ {r.effort}</span>
                          <span className="capitalize px-2 py-0.5 rounded" style={{ background: T.panel, color: T.textSub }}>{r.category}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!isApplied && (
                          <button
                            onClick={e => { e.stopPropagation(); handleApply(r.id); }}
                            disabled={isApplying}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:opacity-90 disabled:opacity-50"
                            style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`, color: "#fff" }}>
                            {isApplying ? <RefreshCw size={13} className="animate-spin" /> : <Zap size={13} />}
                            {isApplying ? "Aplicando..." : "Aplicar"}
                          </button>
                        )}
                        {isExpanded ? <ChevronUp size={16} style={{ color: T.textSub }} /> : <ChevronDown size={16} style={{ color: T.textSub }} />}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-5 pb-5 pt-0 border-t" style={{ borderColor: T.border }}>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div className="rounded-xl p-4" style={{ background: T.panel }}>
                            <div className="text-xs mb-2" style={{ color: T.textSub }}>Antes</div>
                            <div className="text-3xl font-black mb-1" style={{ color: T.textSub }}>{r.before}{r.metric.includes("%") ? "%" : r.metric === "Telas" ? "" : ""}</div>
                            <div className="text-xs" style={{ color: T.textSub }}>{r.metric}</div>
                          </div>
                          <div className="rounded-xl p-4" style={{ background: T.success + "08", border: `1px solid ${T.success}20` }}>
                            <div className="text-xs mb-2" style={{ color: T.success }}>Depois</div>
                            <div className="text-3xl font-black mb-1" style={{ color: T.success }}>{r.after}{r.metric.includes("%") ? "%" : ""}</div>
                            <div className="text-xs" style={{ color: T.success }}>{r.metric}</div>
                          </div>
                        </div>
                        <div className="mt-4">
                          <div className="font-medium text-sm mb-2">Como fazer:</div>
                          <div className="space-y-2">
                            {r.steps.map((s, i) => (
                              <div key={i} className="flex items-start gap-2 text-sm">
                                <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                                  style={{ background: T.primary + "20", color: T.primary }}>{i + 1}</div>
                                <span style={{ color: T.textSub }}>{s}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ANALYTICS TAB */}
        {tab === "analytics" && (
          <div className="space-y-6">
            <div className="rounded-2xl border p-5" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-bold mb-4">Receita: atual vs otimizada</h3>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={PROJ_DATA}>
                  <defs>
                    <linearGradient key="ro-atual" id="ro-atual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={T.primary} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={T.primary} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient key="ro-opt" id="ro-opt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={T.success} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={T.success} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
                  <XAxis dataKey="month" tick={{ fill: T.textSub, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: T.textSub, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${v}`} />
                  <Tooltip contentStyle={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12 }} labelStyle={{ color: T.textSub }} formatter={(v: number) => [`R$${v}`, ""]} />
                  <Area key="area-atual" type="monotone" dataKey="atual" stroke={T.primary} fill="url(#ro-atual)" strokeWidth={2} name="Atual" />
                  <Area key="area-otimizado" type="monotone" dataKey="otimizado" stroke={T.success} fill="url(#ro-opt)" strokeWidth={2} name="Otimizado" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-2xl border p-5" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-bold mb-4">CPM por horário do dia</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={CPM_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
                  <XAxis dataKey="hora" tick={{ fill: T.textSub, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: T.textSub, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${v}`} />
                  <Tooltip contentStyle={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12 }} labelStyle={{ color: T.textSub }} formatter={(v: number) => [`R$${v}`, "CPM"]} />
                  <Bar key="bar-cpm" dataKey="cpm" radius={[4, 4, 0, 0]}>
                    {CPM_DATA.map((d, i) => (
                      <rect key={`ro-bar-${i}`} fill={d.cpm >= 45 ? T.success : d.cpm >= 35 ? T.primary : T.textSub} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs mt-2" style={{ color: T.textSub }}>Horários premium (18h–21h) têm CPM até 63% maior. Concentre conteúdo de alta qualidade nesses períodos.</p>
            </div>
          </div>
        )}

        {/* SIMULATE TAB */}
        {tab === "simulate" && (
          <div className="space-y-6">
            <div className="rounded-2xl border p-6" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-bold text-lg mb-6">Simulador de receita</h3>
              <div className="space-y-6">
                {[
                  { label: "Número de telas", value: simScreens, set: setSimScreens, min: 1, max: 20, step: 1, unit: "telas" },
                  { label: "CPM médio", value: simCpm, set: setSimCpm, min: 15, max: 80, step: 1, unit: "R$/mil" },
                  { label: "Fill rate", value: simFill, set: setSimFill, min: 20, max: 100, step: 1, unit: "%" },
                ].map(s => (
                  <div key={s.label}>
                    <div className="flex justify-between mb-2 text-sm">
                      <span style={{ color: T.textSub }}>{s.label}</span>
                      <span className="font-bold">{s.value} {s.unit}</span>
                    </div>
                    <input type="range" min={s.min} max={s.max} step={s.step} value={s.value}
                      onChange={e => s.set(Number(e.target.value))}
                      className="w-full accent-blue-500" />
                    <div className="flex justify-between text-xs mt-1" style={{ color: T.textSub }}>
                      <span>{s.min}</span><span>{s.max}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border p-6 text-center" style={{ background: `linear-gradient(135deg, ${T.success}12, ${T.success}05)`, borderColor: T.success + "30" }}>
              <div className="text-xs mb-1" style={{ color: T.textSub }}>Receita mensal estimada</div>
              <div className="text-6xl font-black mb-1" style={{ color: T.success }}>R${simRevenue.toLocaleString("pt-BR")}</div>
              <div className="text-sm" style={{ color: T.textSub }}>{simScreens} telas · CPM R${simCpm} · Fill {simFill}%</div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Impressões/dia", value: Math.round(simScreens * 1440 * (simFill / 100)).toLocaleString("pt-BR") },
                { label: "Receita/dia", value: `R$${Math.round(simRevenue / 30)}` },
                { label: "Receita/ano", value: `R$${(simRevenue * 12).toLocaleString("pt-BR")}` },
              ].map((s, i) => (
                <div key={i} className="rounded-xl border p-4 text-center" style={{ background: T.card, borderColor: T.border }}>
                  <div className="text-xl font-black mb-1" style={{ color: T.primary }}>{s.value}</div>
                  <div className="text-xs" style={{ color: T.textSub }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
