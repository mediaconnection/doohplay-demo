import { useState } from "react";
import {
  ArrowLeft, Cpu, TrendingUp, Zap, Play, Pause, RefreshCw,
  Target, BarChart2, CheckCircle, AlertTriangle, Settings,
  ChevronUp, ChevronDown, Eye, DollarSign, Clock, Sliders
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, CartesianGrid, ReferenceLine
} from "recharts";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

interface Props { onBack: () => void; onNavigate?: (v: string) => void; }
type TabId = "optimizer" | "abtest" | "history";

interface Campaign {
  id: string;
  name: string;
  client: string;
  budget: number;
  spent: number;
  ctr: number;
  ctrTarget: number;
  cpm: number;
  cpmTarget: number;
  score: number;
  status: "optimizing" | "manual" | "paused";
  suggestions: Suggestion[];
}

interface Suggestion {
  type: "budget_shift" | "schedule_adjust" | "creative_swap" | "audience_expand" | "screen_add" | "screen_remove";
  title: string;
  description: string;
  impact: string;
  impactColor: string;
  auto: boolean;
  applied: boolean;
}

const CAMPAIGNS: Campaign[] = [
  {
    id: "OPT001", name: "Ambev Verão", client: "Ambev", budget: 84000, spent: 52400,
    ctr: 4.8, ctrTarget: 4.0, cpm: 44, cpmTarget: 50, score: 87, status: "optimizing",
    suggestions: [
      { type: "budget_shift",    title: "Aumentar budget noturno",         description: "18h–22h tem CTR 38% maior. Realocar R$2.400 desse budget.",        impact: "+0.6% CTR",    impactColor: T.success, auto: true,  applied: false },
      { type: "creative_swap",   title: "Trocar criativo de final de semana",description: "Variante B do sábado tem CTR 2.1x maior que variante A.",          impact: "+12% impr.", impactColor: T.success, auto: false, applied: false },
      { type: "screen_remove",   title: "Pausar tela Shopping BH",         description: "CPM R$58 com CTR 1.2% — abaixo do breakeven. Economizar R$3.800.",  impact: "-R$3.8k custo",impactColor: T.warning, auto: false, applied: true  },
    ]
  },
  {
    id: "OPT002", name: "Bradesco Q3", client: "Bradesco", budget: 120000, spent: 31200,
    ctr: 2.9, ctrTarget: 3.5, cpm: 72, cpmTarget: 65, score: 61, status: "manual",
    suggestions: [
      { type: "audience_expand", title: "Expandir para Shopping Morumbi",  description: "Perfil executivo 92% compatível. Projeção +14k imp/dia.",            impact: "+18% alcance", impactColor: T.success, auto: false, applied: false },
      { type: "schedule_adjust", title: "Concentrar em 7h–9h e 18h–20h",  description: "Análise de frequência mostra 44% das conversões nesse horário.",     impact: "+0.8% CTR",    impactColor: T.success, auto: true,  applied: false },
    ]
  },
  {
    id: "OPT003", name: "iFood Almoço", client: "iFood", budget: 45000, spent: 28900,
    ctr: 6.1, ctrTarget: 5.0, cpm: 35, cpmTarget: 38, score: 94, status: "optimizing",
    suggestions: [
      { type: "screen_add",      title: "Adicionar Metrô Luz",             description: "Cobertura do trajeto de ida para trabalho — 38k passageiros/dia.",   impact: "+22k alcance",  impactColor: T.success, auto: false, applied: false },
    ]
  },
];

const AB_TESTS = [
  { id: "AB001", campaign: "Ambev Verão",  metric: "CTR",  variantA: { label: "Garrafa gelada", value: 4.2 }, variantB: { label: "Pessoa bebendo", value: 5.8 }, status: "running", confidence: 94, winner: "B", daysLeft: 3 },
  { id: "AB002", campaign: "Bradesco Q3",  metric: "Conv.",variantA: { label: "CTA Saiba Mais", value: 2.1 }, variantB: { label: "CTA Abra Sua Conta",value:2.9},status: "running", confidence: 71, winner: null, daysLeft: 8 },
  { id: "AB003", campaign: "iFood Almoço", metric: "CTR",  variantA: { label: "Foto prato",     value: 5.9 }, variantB: { label: "Countdown timer", value: 7.1 }, status: "concluded", confidence: 98, winner: "B", daysLeft: 0 },
];

const OPT_HISTORY = [
  { d: "01/07", score: 58 }, { d: "05/07", score: 62 }, { d: "10/07", score: 67 },
  { d: "15/07", score: 71 }, { d: "18/07", score: 75 }, { d: "21/07", score: 82 }, { d: "23/07", score: 87 },
];

const SCORE_BREAKDOWN = [
  { metric: "CTR vs Target",    score: 95, color: T.success },
  { metric: "CPM Eficiência",   score: 88, color: T.success },
  { metric: "Cobertura",        score: 82, color: T.primary  },
  { metric: "Freq. Ótima",      score: 79, color: T.primary  },
  { metric: "Budget Util.",     score: 92, color: T.success  },
  { metric: "Brand Safety",     score: 97, color: T.success  },
];

const STYPE_META = {
  budget_shift:    { color: T.gold    },
  schedule_adjust: { color: T.primary },
  creative_swap:   { color: T.accent  },
  audience_expand: { color: T.success },
  screen_add:      { color: T.success },
  screen_remove:   { color: T.warning },
};

export default function CampaignOptimizer({ onBack }: Props) {
  const [tab, setTab]         = useState<TabId>("optimizer");
  const [selectedCamp, setSelectedCamp] = useState<string>("OPT001");
  const [applied, setApplied] = useState<Set<string>>(new Set(["OPT001-2"]));

  const camp = CAMPAIGNS.find(c => c.id === selectedCamp)!;
  const avgScore = Math.round(CAMPAIGNS.reduce((s, c) => s + c.score, 0) / CAMPAIGNS.length);
  const totalSuggestions = CAMPAIGNS.reduce((s, c) => s + c.suggestions.filter(sg => !sg.applied).length, 0);

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5">
              <ArrowLeft size={18} style={{ color: T.textSub }} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.accent + "20" }}>
                <Cpu size={18} style={{ color: T.accent }} />
              </div>
              <div>
                <h1 className="font-black text-lg">Campaign Optimizer</h1>
                <p className="text-xs" style={{ color: T.textSub }}>Otimização automática com ML — budget, schedule, criativos e A/B test</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {(["optimizer","abtest","history"] as TabId[]).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
                style={{ background: tab === t ? T.accent + "20" : "transparent", color: tab === t ? T.accent : T.textSub, border: `1px solid ${tab === t ? T.accent + "30" : "transparent"}` }}>
                {t === "optimizer" ? "Otimizador" : t === "abtest" ? "A/B Tests" : "Histórico"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Score Médio",        value: `${avgScore}/100`, color: T.accent,  icon: Target    },
            { label: "Sugestões Ativas",   value: totalSuggestions,  color: T.warning, icon: Zap       },
            { label: "Campanhas Otimiz.",  value: CAMPAIGNS.filter(c => c.status === "optimizing").length, color: T.success, icon: Cpu },
            { label: "A/B Tests Rodando",  value: AB_TESTS.filter(a => a.status === "running").length, color: T.primary, icon: BarChart2 },
          ].map((k, i) => (
            <div key={i} className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3" style={{ background: k.color + "20" }}>
                <k.icon size={15} style={{ color: k.color }} />
              </div>
              <div className="font-black text-2xl" style={{ color: k.color }}>{k.value}</div>
              <div className="text-xs mt-0.5" style={{ color: T.textSub }}>{k.label}</div>
            </div>
          ))}
        </div>

        {/* OPTIMIZER TAB */}
        {tab === "optimizer" && (
          <div className="flex gap-6">
            {/* Campaign selector + suggestions */}
            <div className="flex-1 space-y-4">
              {/* Campaign tabs */}
              <div className="flex items-center gap-2">
                {CAMPAIGNS.map(c => (
                  <button key={c.id} onClick={() => setSelectedCamp(c.id)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
                    style={{ background: selectedCamp === c.id ? T.accent + "20" : T.panel, color: selectedCamp === c.id ? T.accent : T.textSub, border: `1px solid ${selectedCamp === c.id ? T.accent + "40" : T.border}` }}>
                    {c.name}
                    <span className="text-xs px-1.5 py-0.5 rounded font-black"
                      style={{ background: (c.score > 80 ? T.success : c.score > 60 ? T.warning : T.danger) + "20", color: c.score > 80 ? T.success : c.score > 60 ? T.warning : T.danger }}>
                      {c.score}
                    </span>
                  </button>
                ))}
              </div>

              {/* Camp metrics */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "CTR atual",  value: `${camp.ctr}%`,  target: `meta ${camp.ctrTarget}%`,  up: camp.ctr >= camp.ctrTarget,  color: T.success },
                  { label: "CPM atual",  value: `R$${camp.cpm}`, target: `meta R$${camp.cpmTarget}`, up: camp.cpm <= camp.cpmTarget,  color: T.gold    },
                  { label: "Budget util.",value:`${Math.round(camp.spent/camp.budget*100)}%`, target:`R$${(camp.spent/1000).toFixed(0)}k/${(camp.budget/1000).toFixed(0)}k`, up: true, color: T.primary },
                  { label: "Status",     value: camp.status === "optimizing" ? "Auto" : "Manual", target: camp.status === "optimizing" ? "IA ativa" : "Intervenção", up: camp.status === "optimizing", color: T.accent },
                ].map((m, i) => (
                  <div key={i} className="p-3 rounded-xl" style={{ background: T.panel, border: `1px solid ${T.border}` }}>
                    <div className="flex items-center gap-1 mb-1">
                      {m.up ? <ChevronUp size={12} style={{ color: T.success }} /> : <ChevronDown size={12} style={{ color: T.warning }} />}
                      <span className="font-black" style={{ color: m.color }}>{m.value}</span>
                    </div>
                    <div className="text-xs" style={{ color: T.textSub }}>{m.label}</div>
                    <div className="text-xs mt-0.5" style={{ color: T.textSub }}>{m.target}</div>
                  </div>
                ))}
              </div>

              {/* Suggestions */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-black">Sugestões da IA</h3>
                  <button className="flex items-center gap-1.5 text-xs font-bold" style={{ color: T.primary }}>
                    <RefreshCw size={11} /> Reanalisar
                  </button>
                </div>
                <div className="space-y-3">
                  {camp.suggestions.map((sg, i) => {
                    const key = `${camp.id}-${i}`;
                    const isApplied = sg.applied || applied.has(key);
                    const stm = STYPE_META[sg.type];
                    return (
                      <div key={i} className="p-4 rounded-2xl border"
                        style={{ background: T.card, borderColor: isApplied ? T.success + "30" : T.border, opacity: isApplied ? 0.7 : 1 }}>
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: stm.color + "20" }}>
                            <Zap size={14} style={{ color: stm.color }} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-black text-sm">{sg.title}</span>
                              {sg.auto && <span className="text-xs px-2 py-0.5 rounded-full font-black" style={{ background: T.accent + "20", color: T.accent }}>AUTO</span>}
                              {isApplied && <span className="text-xs px-2 py-0.5 rounded-full font-black" style={{ background: T.success + "20", color: T.success }}>✓ Aplicado</span>}
                            </div>
                            <p className="text-xs mt-0.5" style={{ color: T.textSub }}>{sg.description}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-sm font-black" style={{ color: sg.impactColor }}>{sg.impact}</span>
                            {!isApplied && (
                              <button onClick={() => setApplied(prev => new Set([...prev, key]))}
                                className="px-3 py-1.5 rounded-xl text-xs font-black"
                                style={{ background: T.success, color: "#000" }}>Aplicar</button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Score panel */}
            <div className="w-52 flex-shrink-0 space-y-4">
              <div className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black text-sm mb-1">Score de Otimização</h3>
                <div className="font-black text-5xl text-center py-4" style={{ color: camp.score > 80 ? T.success : camp.score > 60 ? T.warning : T.danger }}>
                  {camp.score}
                </div>
                <div className="text-xs text-center" style={{ color: T.textSub }}>de 100 pontos</div>
                <div className="space-y-2 mt-4">
                  {SCORE_BREAKDOWN.map((s, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between text-xs mb-0.5">
                        <span style={{ color: T.textSub }}>{s.metric}</span>
                        <span className="font-bold" style={{ color: s.color }}>{s.score}</span>
                      </div>
                      <div className="h-1 rounded-full overflow-hidden" style={{ background: T.border }}>
                        <div className="h-full rounded-full" style={{ width: `${s.score}%`, background: s.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* A/B TEST TAB */}
        {tab === "abtest" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-black">A/B Tests de Criativos</h2>
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black"
                style={{ background: T.accent, color: "#fff" }}>
                <Zap size={14} /> Novo Teste
              </button>
            </div>

            <div className="space-y-4">
              {AB_TESTS.map(test => {
                const maxVal   = Math.max(test.variantA.value, test.variantB.value);
                const isA      = test.variantA.value >= test.variantB.value;
                return (
                  <div key={test.id} className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black">{test.campaign}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                            style={{ background: test.status === "running" ? T.primary + "20" : T.success + "20", color: test.status === "running" ? T.primary : T.success }}>
                            {test.status === "running" ? "Em andamento" : "Encerrado"}
                          </span>
                          {test.status === "running" && (
                            <span className="text-xs" style={{ color: T.textSub }}>{test.daysLeft}d restantes</span>
                          )}
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: T.textSub }}>Métrica: {test.metric} · Confiança: {test.confidence}%</div>
                      </div>
                      {test.winner && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
                          style={{ background: T.success + "20" }}>
                          <CheckCircle size={13} style={{ color: T.success }} />
                          <span className="text-xs font-black" style={{ color: T.success }}>Vencedor: {test.winner === "A" ? test.variantA.label : test.variantB.label}</span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: "Variante A", variant: test.variantA, isWinner: test.winner === "A" },
                        { label: "Variante B", variant: test.variantB, isWinner: test.winner === "B" },
                      ].map(({ label, variant, isWinner }, i) => (
                        <div key={i} className="p-4 rounded-xl" style={{ background: T.panel, border: `2px solid ${isWinner ? T.success : T.border}` }}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-black text-sm">{label}</span>
                            {isWinner && <CheckCircle size={14} style={{ color: T.success }} />}
                          </div>
                          <div className="text-xs mb-3" style={{ color: T.textSub }}>{variant.label}</div>
                          <div className="font-black text-3xl mb-1" style={{ color: isWinner ? T.success : T.textSub }}>{variant.value}%</div>
                          <div className="h-2 rounded-full overflow-hidden" style={{ background: T.border }}>
                            <div className="h-full rounded-full transition-all"
                              style={{ width: `${(variant.value / maxVal) * 100}%`, background: isWinner ? T.success : T.primary }} />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Confidence bar */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span style={{ color: T.textSub }}>Confiança estatística</span>
                        <span className="font-black" style={{ color: test.confidence >= 95 ? T.success : test.confidence >= 80 ? T.warning : T.textSub }}>
                          {test.confidence}%
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: T.border }}>
                        <div className="h-full rounded-full"
                          style={{ width: `${test.confidence}%`, background: test.confidence >= 95 ? T.success : T.warning }} />
                      </div>
                      {test.confidence < 95 && (
                        <p className="text-xs mt-1.5" style={{ color: T.textSub }}>Aguardando confiança ≥95% para declarar vencedor.</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* HISTORY TAB */}
        {tab === "history" && (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-black mb-4">Evolução do Score de Otimização</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={OPT_HISTORY}>
                  <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
                  <XAxis dataKey="d" tick={{ fill: T.textSub, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: T.textSub, fontSize: 10 }} axisLine={false} tickLine={false} domain={[40, 100]} />
                  <Tooltip contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10 }}
                    formatter={(v: number) => [`${v}/100`, "Score"]} />
                  <ReferenceLine y={80} stroke={T.success} strokeDasharray="4 4" label={{ value: "Meta 80", fill: T.success, fontSize: 10 }} />
                  <Line key="line-opt-score" type="monotone" dataKey="score" stroke={T.accent} strokeWidth={3}
                    dot={{ fill: T.accent, r: 5 }} activeDot={{ r: 7 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Sugestões aplicadas",   value: "28",    sub: "últimos 30 dias",           color: T.success },
                { label: "Melhoria de CTR",        value: "+1.4pp",sub: "antes vs depois otimiz.",  color: T.accent  },
                { label: "Economia de CPM",        value: "-R$8",  sub: "vs. baseline manual",      color: T.gold    },
              ].map((m, i) => (
                <div key={i} className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                  <div className="font-black text-2xl" style={{ color: m.color }}>{m.value}</div>
                  <div className="text-xs mt-0.5" style={{ color: T.textSub }}>{m.label}</div>
                  <div className="text-xs mt-2 font-bold" style={{ color: m.color }}>{m.sub}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
