import { useState, useEffect } from "react";
import { ArrowLeft, Target, TrendingUp, Plus, Edit3, Check, X, Zap, AlertTriangle, CheckCircle, ChevronRight, BarChart2, Calendar, DollarSign, Award, Brain } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine } from "recharts";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

interface Goal {
  id: string;
  label: string;
  target: number;
  current: number;
  unit: string;
  period: "month" | "week" | "day";
  color: string;
  icon: string;
  aiTip?: string;
}

const DEFAULT_GOALS: Goal[] = [
  { id: "g1", label: "Receita mensal", target: 1200, current: 847, unit: "R$", period: "month", color: T.success, icon: "💰", aiTip: "Ative o horário de pico das 18h às 21h para +R$180/mês" },
  { id: "g2", label: "Impressões", target: 15000, current: 11340, unit: "", period: "month", color: T.primary, icon: "👁", aiTip: "Adicionar 2 conteúdos premium aumenta fill rate para 97%" },
  { id: "g3", label: "Fill rate", target: 95, current: 82, unit: "%", period: "month", color: T.accent, icon: "📊", aiTip: "Configure o Canal DOOHPLAY no horário de baixa demanda" },
  { id: "g4", label: "CPM médio", target: 48, current: 36, unit: "R$", period: "month", color: T.warning, icon: "📈", aiTip: "Segmento de saúde e beleza tem CPM 40% maior nessa região" },
];

const HISTORY = [
  { month: "Jan", receita: 420, meta: 1200 },
  { month: "Fev", receita: 580, meta: 1200 },
  { month: "Mar", receita: 710, meta: 1200 },
  { month: "Abr", receita: 695, meta: 1200 },
  { month: "Mai", receita: 830, meta: 1200 },
  { month: "Jun", receita: 788, meta: 1200 },
  { month: "Jul", receita: 847, meta: 1200 },
];

const AI_ACTIONS = [
  { id: "a1", title: "Ativar anúncios de academia", desc: "4 anunciantes de fitness aguardam telas na sua região. CPM estimado R$52.", impact: "+R$140/mês", effort: "Fácil", color: T.success, done: false },
  { id: "a2", title: "Otimizar vitrine às 18h–21h", desc: "Seu horário de pico tem fill rate de 67%. Ativar mais conteúdo pode ir para 94%.", impact: "+R$180/mês", effort: "Fácil", color: T.success, done: false },
  { id: "a3", title: "Atualizar perfil de negócio", desc: "Perfis completos recebem 2.3× mais propostas de anunciantes.", impact: "+R$95/mês", effort: "5 min", color: T.primary, done: false },
  { id: "a4", title: "Adicionar tela 2 no corredor", desc: "Segunda tela no mesmo espaço dobra o inventário sem custo de aquisição.", impact: "+R$420/mês", effort: "Médio", color: T.warning, done: false },
];

interface Props {
  onBack: () => void;
  onNavigate?: (view: string) => void;
  session?: { name?: string; plan?: string } | null;
}

function RadialProgress({ pct, size, color, label }: { pct: number; size: number; color: string; label: string }) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={T.border} strokeWidth={6} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={6}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.8s cubic-bezier(.4,0,.2,1)" }} />
      </svg>
      <div className="absolute text-center">
        <div className="font-black text-sm" style={{ color }}>{pct}%</div>
        <div className="text-xs leading-tight" style={{ color: T.textSub, fontSize: 9 }}>{label}</div>
      </div>
    </div>
  );
}

export default function GoalsTracker({ onBack, onNavigate, session }: Props) {
  const [goals, setGoals] = useState<Goal[]>(DEFAULT_GOALS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [actions, setActions] = useState(AI_ACTIONS);
  const [tab, setTab] = useState<"metas" | "historico" | "ia">("metas");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newGoalLabel, setNewGoalLabel] = useState("");
  const [newGoalTarget, setNewGoalTarget] = useState("");

  const daysInMonth = 31;
  const today = 23;
  const monthPct = Math.round((today / daysInMonth) * 100);

  const mainGoal = goals[0];
  const mainPct = Math.round((mainGoal.current / mainGoal.target) * 100);
  const onTrack = mainPct >= monthPct;

  const projected = Math.round(mainGoal.current * (daysInMonth / today));
  const projectedPct = Math.round((projected / mainGoal.target) * 100);

  const startEdit = (goal: Goal) => {
    setEditingId(goal.id);
    setEditValue(goal.target.toString());
  };

  const saveEdit = (id: string) => {
    const val = parseFloat(editValue);
    if (!isNaN(val) && val > 0) {
      setGoals(prev => prev.map(g => g.id === id ? { ...g, target: val } : g));
    }
    setEditingId(null);
  };

  const markAction = (id: string) => {
    setActions(prev => prev.map(a => a.id === id ? { ...a, done: true } : a));
  };

  const addGoal = () => {
    if (!newGoalLabel || !newGoalTarget) return;
    const colors = [T.primary, T.accent, T.warning, T.success];
    const icons = ["🎯", "⚡", "🌟", "📌"];
    const idx = goals.length % 4;
    setGoals(prev => [...prev, {
      id: `g${Date.now()}`,
      label: newGoalLabel,
      target: parseFloat(newGoalTarget),
      current: 0,
      unit: "",
      period: "month",
      color: colors[idx],
      icon: icons[idx],
    }]);
    setNewGoalLabel(""); setNewGoalTarget(""); setShowAddModal(false);
  };

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
            <ArrowLeft size={18} style={{ color: T.textSub }} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.gold + "20" }}>
              <Target size={18} style={{ color: T.gold }} />
            </div>
            <div>
              <h1 className="font-black text-lg">Metas & Objetivos</h1>
              <p className="text-xs" style={{ color: T.textSub }}>Julho 2026 · Dia {today}/{daysInMonth}</p>
            </div>
          </div>
          <div className={`ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold`}
            style={{ background: onTrack ? T.success + "15" : T.warning + "15", color: onTrack ? T.success : T.warning }}>
            {onTrack ? <><CheckCircle size={12} /> No ritmo</> : <><AlertTriangle size={12} /> Atenção</>}
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-6 pb-0 flex gap-1">
          {(["metas", "historico", "ia"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="px-4 py-2.5 text-sm font-medium border-b-2 transition-all"
              style={{ borderColor: tab === t ? T.primary : "transparent", color: tab === t ? T.primary : T.textSub }}>
              {t === "metas" ? "Metas" : t === "historico" ? "Histórico" : "IA · Ações"}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        {tab === "metas" && (
          <>
            <div className="rounded-2xl border p-6" style={{ background: `linear-gradient(135deg, ${T.success}10, ${T.primary}08)`, borderColor: T.success + "25" }}>
              <div className="flex items-center gap-6">
                <RadialProgress pct={mainPct} size={96} color={mainPct >= monthPct ? T.success : T.warning} label="meta" />
                <div className="flex-1">
                  <div className="text-xs mb-1" style={{ color: T.textSub }}>Receita mensal · Jul/26</div>
                  <div className="text-3xl font-black mb-1">
                    R${mainGoal.current.toLocaleString("pt-BR")}
                    <span className="text-base font-normal ml-2" style={{ color: T.textSub }}>/ R${mainGoal.target.toLocaleString("pt-BR")}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span style={{ color: T.textSub }}>Projeção:</span>
                    <span className="font-bold" style={{ color: projected >= mainGoal.target ? T.success : T.warning }}>
                      R${projected.toLocaleString("pt-BR")} ({projectedPct}%)
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full" style={{ background: T.border }}>
                    <div className="h-full rounded-full transition-all"
                      style={{ width: `${Math.min(mainPct, 100)}%`, background: mainPct >= monthPct ? T.success : T.warning }} />
                  </div>
                  <div className="flex justify-between mt-1 text-xs" style={{ color: T.textSub }}>
                    <span>Hoje: {monthPct}% do mês</span>
                    <span className={mainPct >= monthPct ? "text-green-400" : ""}>
                      {mainPct >= monthPct ? "✓ No ritmo" : `Faltam R${mainGoal.target - mainGoal.current}`}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold">Todas as metas</h3>
                <button onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all hover:bg-white/5"
                  style={{ color: T.primary, border: `1px solid ${T.primary}30` }}>
                  <Plus size={12} /> Nova meta
                </button>
              </div>
              {goals.map(goal => {
                const pct = Math.round((goal.current / goal.target) * 100);
                const isEditing = editingId === goal.id;
                return (
                  <div key={goal.id} className="rounded-2xl border p-4" style={{ background: T.card, borderColor: T.border }}>
                    <div className="flex items-start gap-3 mb-3">
                      <span className="text-xl">{goal.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-bold text-sm">{goal.label}</span>
                          <span className="text-xs px-1.5 py-0.5 rounded-full capitalize"
                            style={{ background: T.panel, color: T.textSub }}>
                            {goal.period === "month" ? "mensal" : goal.period === "week" ? "semanal" : "diário"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-lg" style={{ color: goal.color }}>
                            {goal.unit}{goal.current.toLocaleString("pt-BR")}
                          </span>
                          <span className="text-sm" style={{ color: T.textSub }}>
                            / {isEditing ? (
                              <span className="inline-flex items-center gap-1">
                                <input type="number" value={editValue} onChange={e => setEditValue(e.target.value)}
                                  className="w-20 px-2 py-0.5 rounded text-sm"
                                  style={{ background: T.panel, border: `1px solid ${T.primary}`, color: T.text, outline: "none" }}
                                  autoFocus />
                                <button onClick={() => saveEdit(goal.id)} className="p-0.5 rounded" style={{ color: T.success }}><Check size={14} /></button>
                                <button onClick={() => setEditingId(null)} className="p-0.5 rounded" style={{ color: T.danger }}><X size={14} /></button>
                              </span>
                            ) : (
                              <span className="cursor-pointer hover:underline" onClick={() => startEdit(goal)}>
                                {goal.unit}{goal.target.toLocaleString("pt-BR")} <Edit3 size={10} className="inline" />
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-xl" style={{ color: pct >= 100 ? T.success : goal.color }}>{pct}%</div>
                      </div>
                    </div>
                    <div className="h-2 rounded-full" style={{ background: T.border }}>
                      <div className="h-full rounded-full transition-all"
                        style={{ width: `${Math.min(pct, 100)}%`, background: pct >= 100 ? T.success : goal.color }} />
                    </div>
                    {goal.aiTip && pct < 100 && (
                      <div className="mt-2 flex items-start gap-2 text-xs px-2.5 py-1.5 rounded-lg"
                        style={{ background: T.primary + "10", color: T.primary, border: `1px solid ${T.primary}15` }}>
                        <Brain size={11} className="mt-0.5 flex-shrink-0" />
                        {goal.aiTip}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {tab === "historico" && (
          <>
            <div className="rounded-2xl border p-5" style={{ background: T.card, borderColor: T.border }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold">Receita vs. Meta</h3>
                <span className="text-xs" style={{ color: T.textSub }}>últimos 7 meses</span>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={HISTORY} margin={{ top: 10, right: 0, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient key="gt-meta" id="gt-meta" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={T.primary} stopOpacity={0.15} />
                      <stop offset="95%" stopColor={T.primary} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient key="gt-rec" id="gt-rec" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={T.success} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={T.success} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fill: T.textSub, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: T.textSub, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${v}`} />
                  <Tooltip contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 12 }} formatter={(v: any) => [`R$${v}`, ""]} />
                  <ReferenceLine y={1200} stroke={T.primary} strokeDasharray="4 2" strokeOpacity={0.4} />
                  <Area key="gt-area-meta" type="monotone" dataKey="meta" stroke={T.primary} strokeWidth={1.5} strokeDasharray="4 2" fill="url(#gt-meta)" dot={false} />
                  <Area key="gt-area-rec" type="monotone" dataKey="receita" stroke={T.success} strokeWidth={2.5} fill="url(#gt-rec)" dot={{ fill: T.success, r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex items-center gap-6 mt-2 text-xs" style={{ color: T.textSub }}>
                <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 rounded inline-block" style={{ background: T.success }} /> Receita real</span>
                <span className="flex items-center gap-1.5"><span className="w-3 border-t border-dashed inline-block" style={{ borderColor: T.primary }} /> Meta R$1.200</span>
              </div>
            </div>

            <div className="space-y-2">
              {HISTORY.slice().reverse().map((h, i) => {
                const pct = Math.round((h.receita / h.meta) * 100);
                const met = h.receita >= h.meta;
                return (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-xl border" style={{ background: T.card, borderColor: T.border }}>
                    <div className="w-10 text-sm font-bold" style={{ color: T.textSub }}>{h.month}</div>
                    <div className="flex-1">
                      <div className="h-2 rounded-full" style={{ background: T.border }}>
                        <div className="h-full rounded-full" style={{ width: `${Math.min(pct, 100)}%`, background: met ? T.success : T.warning }} />
                      </div>
                    </div>
                    <div className="text-sm font-bold w-20 text-right" style={{ color: met ? T.success : T.warning }}>
                      R${h.receita.toLocaleString("pt-BR")}
                    </div>
                    <div className="w-10 text-xs text-right" style={{ color: T.textSub }}>{pct}%</div>
                    {met ? <CheckCircle size={14} style={{ color: T.success }} /> : <AlertTriangle size={14} style={{ color: T.warning }} />}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {tab === "ia" && (
          <>
            <div className="rounded-2xl border p-4 flex items-start gap-3" style={{ background: T.primary + "10", borderColor: T.primary + "25" }}>
              <Brain size={18} style={{ color: T.primary }} className="mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold mb-0.5">Análise de IA — Julho/26</p>
                <p className="text-sm" style={{ color: T.textSub }}>
                  Você está a <strong className="text-white">R${mainGoal.target - mainGoal.current}</strong> da sua meta mensal. Com as ações abaixo você pode chegar a <strong style={{ color: T.success }}>R${projected.toLocaleString("pt-BR")}</strong> projetado até o final do mês.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {actions.map(a => (
                <div key={a.id} className="rounded-2xl border p-4 transition-all"
                  style={{ background: T.card, borderColor: a.done ? T.success + "30" : T.border, opacity: a.done ? 0.6 : 1 }}>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm">{a.title}</span>
                        {a.done && <CheckCircle size={14} style={{ color: T.success }} />}
                      </div>
                      <p className="text-sm" style={{ color: T.textSub }}>{a.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold px-2 py-1 rounded-lg"
                        style={{ background: a.color + "15", color: a.color }}>
                        {a.impact}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-lg" style={{ background: T.panel, color: T.textSub }}>
                        Esforço: {a.effort}
                      </span>
                    </div>
                    {!a.done ? (
                      <button onClick={() => { markAction(a.id); onNavigate?.("revenue-optimizer"); }}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl font-bold transition-all hover:opacity-90"
                        style={{ background: a.color, color: "#05060E" }}>
                        Aplicar <ChevronRight size={12} />
                      </button>
                    ) : (
                      <span className="text-xs" style={{ color: T.success }}>✓ Aplicado</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border p-5 text-center" style={{ background: T.card, borderColor: T.border }}>
              <div className="text-3xl mb-2">🎯</div>
              <h3 className="font-bold mb-1">Potencial não realizado</h3>
              <p className="text-sm mb-3" style={{ color: T.textSub }}>Se aplicar todas as ações acima</p>
              <div className="text-3xl font-black" style={{ color: T.success }}>
                +R${actions.reduce((a, ac) => a + parseInt(ac.impact.replace(/\D/g, "")) , 0).toLocaleString("pt-BR")}/mês
              </div>
            </div>
          </>
        )}

      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={e => e.target === e.currentTarget && setShowAddModal(false)}>
          <div className="w-full max-w-lg rounded-2xl border p-6 space-y-4" style={{ background: T.panel, borderColor: T.border }}>
            <h3 className="font-black text-lg">Nova meta</h3>
            <div>
              <label className="block text-sm mb-1" style={{ color: T.textSub }}>Nome da meta</label>
              <input value={newGoalLabel} onChange={e => setNewGoalLabel(e.target.value)}
                placeholder="ex: Novos anunciantes"
                className="w-full px-4 py-3 rounded-xl text-sm"
                style={{ background: T.card, border: `1.5px solid ${T.border}`, color: T.text, outline: "none" }} />
            </div>
            <div>
              <label className="block text-sm mb-1" style={{ color: T.textSub }}>Valor alvo</label>
              <input type="number" value={newGoalTarget} onChange={e => setNewGoalTarget(e.target.value)}
                placeholder="ex: 5"
                className="w-full px-4 py-3 rounded-xl text-sm"
                style={{ background: T.card, border: `1.5px solid ${T.border}`, color: T.text, outline: "none" }} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowAddModal(false)}
                className="flex-1 py-3 rounded-xl font-bold text-sm border transition-all hover:bg-white/5"
                style={{ borderColor: T.border, color: T.textSub }}>Cancelar</button>
              <button onClick={addGoal}
                className="flex-1 py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90"
                style={{ background: T.primary, color: "#fff" }}>Criar Meta</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
