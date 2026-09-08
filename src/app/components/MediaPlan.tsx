import { useState } from "react";
import {
  ArrowLeft, BookOpen, Target, DollarSign, Calendar, MapPin,
  Monitor, TrendingUp, Plus, Trash2, ChevronRight, Zap,
  CheckCircle, Eye, BarChart2, Sparkles, Download, Send
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

interface Props { onBack: () => void; onNavigate?: (v: string) => void; }

type PlanStatus = "draft" | "approved" | "running" | "completed";
type Objective = "awareness" | "consideration" | "conversion" | "retention";

interface ScreenRec {
  id: string; name: string; city: string; type: string;
  cpm: number; dailyImpressions: number; budget: number; days: number; score: number;
}

interface MediaPlanDoc {
  id: string; name: string; client: string; objective: Objective;
  budget: number; startDate: string; endDate: string; status: PlanStatus;
  screens: ScreenRec[]; totalImpressions: number; projectedCtr: number; projectedRoi: number;
}

const OBJ_META: Record<Objective, { label: string; color: string; icon: any }> = {
  awareness:    { label: "Awareness",    color: T.primary, icon: Eye },
  consideration:{ label: "Consideracao", color: T.accent,  icon: Target },
  conversion:   { label: "Conversao",    color: T.success, icon: Zap },
  retention:    { label: "Retencao",     color: T.gold,    icon: CheckCircle },
};

const STATUS_META: Record<PlanStatus, { label: string; color: string }> = {
  draft:     { label: "Rascunho",  color: T.textSub },
  approved:  { label: "Aprovado",  color: T.success },
  running:   { label: "Ativo",     color: T.primary },
  completed: { label: "Encerrado", color: T.warning },
};

const PLANS: MediaPlanDoc[] = [
  {
    id: "MP001", name: "Ambev Verao - Julho 2025", client: "Ambev", objective: "awareness",
    budget: 84000, startDate: "01/07/2025", endDate: "31/07/2025",
    status: "running", totalImpressions: 4218400, projectedCtr: 3.4, projectedRoi: 3.8,
    screens: [
      { id: "s1", name: "Shopping Ibirapuera", city: "Sao Paulo", type: "Indoor",  cpm: 42, dailyImpressions: 28000, budget: 24000, days: 31, score: 94 },
      { id: "s2", name: "Av. Paulista 1000",   city: "Sao Paulo", type: "Outdoor", cpm: 65, dailyImpressions: 54000, budget: 38000, days: 31, score: 98 },
    ]
  },
  {
    id: "MP002", name: "Bradesco Q3 Brand Push", client: "Bradesco", objective: "consideration",
    budget: 120000, startDate: "01/08/2025", endDate: "30/09/2025",
    status: "approved", totalImpressions: 9840000, projectedCtr: 2.8, projectedRoi: 4.1,
    screens: [
      { id: "s4", name: "Aeroporto GRU T2", city: "Guarulhos", type: "Indoor", cpm: 88, dailyImpressions: 18000, budget: 55000, days: 61, score: 99 },
    ]
  },
];

const BUDGET_SPLIT = [
  { type: "Indoor",  pct: 38, value: 84000 * 0.38, color: T.primary },
  { type: "Outdoor", pct: 29, value: 84000 * 0.29, color: T.success },
  { type: "Transito",pct: 20, value: 84000 * 0.20, color: T.accent  },
  { type: "Retail",  pct: 13, value: 84000 * 0.13, color: T.gold    },
];

const AI_SUGGESTIONS = [
  { screen: "Shopping Morumbi", city: "Sao Paulo", match: 96, reason: "Alto CPM, fit com objetivo awareness, 32k imp/dia" },
  { screen: "Av. Boa Viagem",   city: "Recife",    match: 88, reason: "Expansao regional, cobre publico jovem 18-34" },
];

export default function MediaPlan({ onBack, onNavigate }: Props) {
  const [tab, setTab]           = useState<"plans" | "builder" | "insights">("plans");
  const [selected, setSelected] = useState<MediaPlanDoc | null>(PLANS[0]);
  const [objective, setObjective] = useState<Objective>("awareness");
  const [budget, setBudget]     = useState("50000");
  const [duration, setDuration] = useState("30");
  const [city, setCity]         = useState("Sao Paulo");
  const [showAI, setShowAI]     = useState(false);

  const totalBudget  = PLANS.filter(p => p.status === "running").reduce((s, p) => s + p.budget, 0);
  const totalImp     = PLANS.filter(p => p.status === "running").reduce((s, p) => s + p.totalImpressions, 0);
  const activePlans  = PLANS.filter(p => p.status === "running").length;

  const projBudget   = parseFloat(budget) || 0;
  const projDays     = parseInt(duration) || 30;
  const projImpressions = Math.round(projBudget / 47 * 1000 * projDays / 30);
  const projReach    = Math.round(projImpressions * 0.62);
  const projCtr      = 3.4;
  const projLeads    = Math.round(projImpressions * projCtr / 100 * 0.08);

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5"><ArrowLeft size={18} style={{ color: T.textSub }} /></button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.accent + "20" }}><BookOpen size={18} style={{ color: T.accent }} /></div>
              <div><h1 className="font-black text-lg">Media Plan</h1><p className="text-xs" style={{ color: T.textSub }}>Planos de midia inteligentes com sugestoes de telas e projecoes</p></div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {(["plans","builder","insights"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} className="px-4 py-2 rounded-xl text-sm font-bold transition-all" style={{ background: tab === t ? T.accent + "20" : "transparent", color: tab === t ? T.accent : T.textSub }}>
                {t === "plans" ? "Planos" : t === "builder" ? "Criar Plano" : "Insights IA"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Planos Ativos",      value: activePlans,                            color: T.success, icon: CheckCircle },
            { label: "Budget em Execucao", value: `R$${(totalBudget/1000).toFixed(0)}k`, color: T.gold,    icon: DollarSign },
            { label: "Impressoes (mes)",   value: `${(totalImp/1000000).toFixed(1)}M`,   color: T.primary, icon: Eye },
            { label: "Planos em Rascunho", value: PLANS.filter(p=>p.status==="draft").length, color: T.textSub, icon: BookOpen },
          ].map((k, i) => (
            <div key={i} className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3" style={{ background: k.color + "20" }}><k.icon size={15} style={{ color: k.color }} /></div>
              <div className="font-black text-2xl" style={{ color: k.color }}>{k.value}</div>
              <div className="text-xs mt-0.5" style={{ color: T.textSub }}>{k.label}</div>
            </div>
          ))}
        </div>

        {tab === "plans" && (
          <div className="flex gap-6">
            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-black">Planos de Midia</h2>
                <button onClick={() => setTab("builder")} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black" style={{ background: T.accent, color: "#fff" }}><Plus size={14} /> Novo Plano</button>
              </div>
              {PLANS.map(plan => {
                const om = OBJ_META[plan.objective];
                const sm = STATUS_META[plan.status];
                const ObjIcon = om.icon;
                return (
                  <div key={plan.id} onClick={() => setSelected(selected?.id === plan.id ? null : plan)} className="p-4 rounded-2xl border cursor-pointer hover:bg-white/3 transition-all" style={{ background: T.card, borderColor: selected?.id === plan.id ? T.accent + "60" : T.border }}>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: om.color + "20" }}><ObjIcon size={18} style={{ color: om.color }} /></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black">{plan.name}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: sm.color + "20", color: sm.color }}>{sm.label}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: om.color + "20", color: om.color }}>{om.label}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-xs" style={{ color: T.textSub }}>
                          <span>{plan.client}</span><span>-</span><span>{plan.startDate} - {plan.endDate}</span><span>-</span><span>{plan.screens.length} telas</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-black" style={{ color: T.gold }}>R${(plan.budget/1000).toFixed(0)}k</div>
                        <div className="text-xs" style={{ color: T.textSub }}>budget</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="w-56 flex-shrink-0">
              <div className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black text-sm mb-3">Budget por Tipo</h3>
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie data={BUDGET_SPLIT} dataKey="pct" cx="50%" cy="50%" innerRadius={35} outerRadius={58} paddingAngle={3}>
                      {BUDGET_SPLIT.map((entry, i) => (<Cell key={`cell-bp-${i}`} fill={entry.color} />))}
                    </Pie>
                    <Tooltip contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10 }} formatter={(v: number) => [`${v}%`, "Share"]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5">
                  {BUDGET_SPLIT.map((b, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full" style={{ background: b.color }} /><span>{b.type}</span></div>
                      <span className="font-bold" style={{ color: b.color }}>{b.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "builder" && (
          <div className="grid grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-black mb-4">Configuracao do Plano</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold mb-2 block" style={{ color: T.textSub }}>OBJETIVO DA CAMPANHA</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.entries(OBJ_META) as [Objective, any][]).map(([key, meta]) => {
                      const Icon = meta.icon;
                      return (
                        <button key={key} onClick={() => setObjective(key)} className="p-3 rounded-xl flex items-center gap-2" style={{ background: objective === key ? meta.color + "20" : T.panel, border: `2px solid ${objective === key ? meta.color : T.border}` }}>
                          <Icon size={14} style={{ color: meta.color }} />
                          <span className="text-xs font-black" style={{ color: objective === key ? meta.color : T.textSub }}>{meta.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold mb-1.5 block" style={{ color: T.textSub }}>BUDGET (R$)</label>
                    <input type="number" value={budget} onChange={e => setBudget(e.target.value)} className="w-full px-3 py-2.5 rounded-xl text-sm" style={{ background: T.panel, border: `1px solid ${T.border}`, color: T.text }} />
                  </div>
                  <div>
                    <label className="text-xs font-bold mb-1.5 block" style={{ color: T.textSub }}>DURACAO (dias)</label>
                    <input type="number" value={duration} onChange={e => setDuration(e.target.value)} className="w-full px-3 py-2.5 rounded-xl text-sm" style={{ background: T.panel, border: `1px solid ${T.border}`, color: T.text }} />
                  </div>
                </div>
                <button onClick={() => setShowAI(true)} className="w-full py-3 rounded-xl text-sm font-black flex items-center justify-center gap-2" style={{ background: `linear-gradient(135deg, ${T.accent}, ${T.primary})`, color: "#fff" }}>
                  <Sparkles size={15} /> Gerar Plano com IA
                </button>
              </div>
            </div>
            <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-black mb-4">Projecoes do Plano</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Impressoes proj.", value: `${(projImpressions/1000000).toFixed(1)}M`, color: T.primary },
                  { label: "Alcance proj.",    value: `${(projReach/1000).toFixed(0)}k`,          color: T.accent  },
                  { label: "CTR proj.",        value: `${projCtr}%`,                               color: T.success },
                  { label: "Leads proj.",      value: projLeads.toLocaleString("pt-BR"),           color: T.gold    },
                ].map((m, i) => (
                  <div key={i} className="p-3 rounded-xl" style={{ background: T.panel }}>
                    <div className="font-black text-lg" style={{ color: m.color }}>{m.value}</div>
                    <div className="text-xs" style={{ color: T.textSub }}>{m.label}</div>
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
