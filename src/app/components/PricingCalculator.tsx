import { useState } from "react";
import {
  ArrowLeft, Calculator, DollarSign, TrendingUp, Target,
  Download, Send, CheckCircle, Plus, Minus, Star,
  Zap, BarChart2, Users, Monitor, RefreshCw
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie
} from "recharts";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

interface Props { onBack: () => void; onNavigate?: (v: string) => void; }
type TabId = "calculator" | "quote" | "scenarios";

type ScreenType = "outdoor" | "indoor" | "transit" | "retail" | "airport";

const SCREEN_TYPES: Record<ScreenType, { label: string; baseCpm: number; color: string; avgImp: number }> = {
  outdoor: { label: "Outdoor",   baseCpm: 55, color: T.primary, avgImp: 48000 },
  indoor:  { label: "Indoor",    baseCpm: 42, color: T.success, avgImp: 22000 },
  transit: { label: "Trânsito",  baseCpm: 35, color: T.accent,  avgImp: 40000 },
  retail:  { label: "Retail",    baseCpm: 38, color: T.gold,    avgImp: 18000 },
  airport: { label: "Aeroporto", baseCpm: 84, color: T.warning, avgImp: 16000 },
};

const PLANS = [
  { name: "Starter",    price: 97,   features: ["1 campanha ativa","Até 5 telas","Relatórios básicos","Suporte email"],              color: T.primary, popular: false },
  { name: "Growth",     price: 290,  features: ["10 campanhas ativas","Até 50 telas","Dashboard avançado","API acesso","Suporte chat"], color: T.accent,  popular: true  },
  { name: "Enterprise", price: 620,  features: ["Ilimitado","White label","ProofChain","Programmatic Desk","Gerente dedicado"],        color: T.gold,    popular: false },
];

const SCENARIOS = [
  { name: "Lançamento de Produto",   budget: 45000, screens: 8,  days: 30, objective: "Awareness",   projCtr: 4.2, projRoi: 3.8, projImp: "38M"  },
  { name: "Campanha Sazonal (Black)",budget: 120000,screens: 24, days: 15, objective: "Conversão",   projCtr: 5.8, projRoi: 5.1, projImp: "62M"  },
  { name: "Brand Building Anual",    budget: 840000,screens: 60, days: 365,objective: "Awareness",   projCtr: 3.6, projRoi: 4.9, projImp: "1.2B" },
  { name: "Teste de Mercado",        budget: 8000,  screens: 3,  days: 14, objective: "Consideração",projCtr: 3.1, projRoi: 2.4, projImp: "3.2M" },
];

export default function PricingCalculator({ onBack }: Props) {
  const [tab, setTab]               = useState<TabId>("calculator");
  const [screenType, setScreenType] = useState<ScreenType>("outdoor");
  const [numScreens, setNumScreens] = useState(5);
  const [days, setDays]             = useState(30);
  const [dailyHours, setDailyHours] = useState(16);
  const [objective, setObjective]   = useState("awareness");
  const [industry, setIndustry]     = useState("varejo");
  const [quoteEmail, setQuoteEmail] = useState("");
  const [quoteName, setQuoteName]   = useState("");

  const stm = SCREEN_TYPES[screenType];
  const cpmMultiplier = objective === "conversion" ? 1.15 : objective === "retention" ? 0.92 : 1.0;
  const industryMult  = industry === "finanças" ? 1.3 : industry === "automóveis" ? 1.2 : 1.0;
  const finalCpm      = Math.round(stm.baseCpm * cpmMultiplier * industryMult);
  const dailyImpPerScreen = Math.round(stm.avgImp * (dailyHours / 16));
  const totalDailyImp  = dailyImpPerScreen * numScreens;
  const totalImp       = totalDailyImp * days;
  const totalBudget    = Math.round((totalImp / 1000) * finalCpm);
  const projReach      = Math.round(totalImp * 0.62);
  const projCtr        = ((objective === "conversion" ? 5.1 : objective === "consideration" ? 3.8 : 4.2) * (1 + (numScreens - 1) * 0.02)).toFixed(1);
  const projLeads      = Math.round(totalImp * parseFloat(projCtr) / 100 * 0.08);
  const projRoi        = (totalBudget > 0 ? (parseFloat(projCtr) * 0.82).toFixed(1) : "–");

  const BUDGET_PIE = Object.entries(SCREEN_TYPES).map(([key, val]) => ({
    name: val.label, value: Math.round(val.baseCpm * 100 / Object.values(SCREEN_TYPES).reduce((s, v) => s + v.baseCpm, 0)), color: val.color,
  }));

  const SCENARIO_BAR = SCENARIOS.map(s => ({ name: s.name.split(" ")[0], roi: s.projRoi, color: T.primary }));

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
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.gold + "20" }}>
                <Calculator size={18} style={{ color: T.gold }} />
              </div>
              <div>
                <h1 className="font-black text-lg">Pricing Calculator</h1>
                <p className="text-xs" style={{ color: T.textSub }}>Calcule orçamentos, ROI projetado e gere cotações para clientes</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {(["calculator","quote","scenarios"] as TabId[]).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
                style={{ background: tab === t ? T.gold + "20" : "transparent", color: tab === t ? T.gold : T.textSub, border: `1px solid ${tab === t ? T.gold + "30" : "transparent"}` }}>
                {t === "calculator" ? "Calculadora" : t === "quote" ? "Cotação" : "Cenários"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">

        {/* CALCULATOR TAB */}
        {tab === "calculator" && (
          <div className="grid grid-cols-2 gap-6">
            {/* Input panel */}
            <div className="space-y-4">
              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black mb-4">Parâmetros da Campanha</h3>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-black mb-2 block" style={{ color: T.textSub }}>TIPO DE TELA</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(Object.entries(SCREEN_TYPES) as [ScreenType, any][]).map(([key, val]) => (
                        <button key={key} onClick={() => setScreenType(key)}
                          className="p-2.5 rounded-xl text-xs font-bold transition-all"
                          style={{ background: screenType === key ? val.color + "25" : T.panel, color: screenType === key ? val.color : T.textSub, border: `2px solid ${screenType === key ? val.color : T.border}` }}>
                          {val.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-black mb-1.5 block" style={{ color: T.textSub }}>Nº DE TELAS</label>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setNumScreens(Math.max(1, numScreens - 1))}
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ background: T.panel, border: `1px solid ${T.border}` }}>
                          <Minus size={12} style={{ color: T.textSub }} />
                        </button>
                        <div className="flex-1 text-center font-black text-lg" style={{ color: T.gold }}>{numScreens}</div>
                        <button onClick={() => setNumScreens(numScreens + 1)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ background: T.panel, border: `1px solid ${T.border}` }}>
                          <Plus size={12} style={{ color: T.textSub }} />
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-black mb-1.5 block" style={{ color: T.textSub }}>DURAÇÃO (DIAS)</label>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setDays(Math.max(1, days - 1))}
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ background: T.panel, border: `1px solid ${T.border}` }}>
                          <Minus size={12} style={{ color: T.textSub }} />
                        </button>
                        <div className="flex-1 text-center font-black text-lg" style={{ color: T.primary }}>{days}</div>
                        <button onClick={() => setDays(days + 1)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ background: T.panel, border: `1px solid ${T.border}` }}>
                          <Plus size={12} style={{ color: T.textSub }} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-black" style={{ color: T.textSub }}>HORAS/DIA DE EXIBIÇÃO</label>
                      <span className="font-black text-sm" style={{ color: T.accent }}>{dailyHours}h</span>
                    </div>
                    <input type="range" min="4" max="24" value={dailyHours} onChange={e => setDailyHours(parseInt(e.target.value))}
                      className="w-full" style={{ accentColor: T.accent }} />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-black mb-1.5 block" style={{ color: T.textSub }}>OBJETIVO</label>
                      <select value={objective} onChange={e => setObjective(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl text-sm"
                        style={{ background: T.panel, border: `1px solid ${T.border}`, color: T.text }}>
                        <option value="awareness">Awareness</option>
                        <option value="consideration">Consideração</option>
                        <option value="conversion">Conversão</option>
                        <option value="retention">Retenção</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-black mb-1.5 block" style={{ color: T.textSub }}>SEGMENTO</label>
                      <select value={industry} onChange={e => setIndustry(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl text-sm"
                        style={{ background: T.panel, border: `1px solid ${T.border}`, color: T.text }}>
                        <option value="varejo">Varejo</option>
                        <option value="finanças">Finanças</option>
                        <option value="food">Food & Delivery</option>
                        <option value="automóveis">Automóveis</option>
                        <option value="saúde">Saúde & Pharma</option>
                        <option value="tech">Tecnologia</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Results panel */}
            <div className="space-y-4">
              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black mb-4">Projeção de Resultados</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "CPM Estimado",       value: `R$${finalCpm}`,                     color: T.gold    },
                    { label: "Budget Total",        value: `R$${totalBudget.toLocaleString("pt-BR")}`, color: T.primary },
                    { label: "Impressões Totais",   value: totalImp >= 1000000 ? `${(totalImp/1000000).toFixed(1)}M` : `${(totalImp/1000).toFixed(0)}k`, color: T.success },
                    { label: "Alcance Projetado",   value: projReach >= 1000000 ? `${(projReach/1000000).toFixed(1)}M` : `${(projReach/1000).toFixed(0)}k`, color: T.accent },
                    { label: "CTR Projetado",       value: `${projCtr}%`,                       color: T.warning },
                    { label: "Leads Estimados",     value: projLeads.toLocaleString("pt-BR"),    color: T.primary },
                    { label: "ROI Projetado",       value: `${projRoi}x`,                       color: T.success },
                    { label: "CPM Pago",            value: `R$${finalCpm}/mil`,                 color: T.textSub },
                  ].map((m, i) => (
                    <div key={i} className="p-3 rounded-xl" style={{ background: T.panel }}>
                      <div className="font-black text-lg" style={{ color: m.color }}>{m.value}</div>
                      <div className="text-xs" style={{ color: T.textSub }}>{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black mb-3 text-sm">CPM por Tipo de Tela</h3>
                <div className="space-y-2">
                  {(Object.entries(SCREEN_TYPES) as [ScreenType, any][]).map(([key, val]) => (
                    <div key={key} className="flex items-center gap-3">
                      <div className="w-16 text-xs font-bold" style={{ color: val.color }}>{val.label}</div>
                      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: T.border }}>
                        <div className="h-full rounded-full" style={{ width: `${(val.baseCpm / 84) * 100}%`, background: val.color }} />
                      </div>
                      <div className="w-12 text-right text-xs font-black" style={{ color: val.color }}>R${val.baseCpm}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setTab("quote")} className="flex-1 py-3 rounded-xl text-sm font-black flex items-center justify-center gap-2"
                  style={{ background: T.gold, color: "#000" }}>
                  <Send size={13} /> Gerar Cotação
                </button>
                <button className="px-5 py-3 rounded-xl text-sm font-bold"
                  style={{ background: T.panel, color: T.textSub, border: `1px solid ${T.border}` }}>
                  <Download size={13} className="inline mr-1" />PDF
                </button>
              </div>
            </div>
          </div>
        )}

        {/* QUOTE TAB */}
        {tab === "quote" && (
          <div className="space-y-6">
            {/* Plans */}
            <div className="grid grid-cols-3 gap-4">
              {PLANS.map(plan => (
                <div key={plan.name} className="p-5 rounded-2xl border relative"
                  style={{ background: T.card, borderColor: plan.popular ? plan.color + "50" : T.border }}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 text-xs font-black px-3 py-1 rounded-full"
                      style={{ background: plan.color, color: "#000" }}>
                      <Star size={10} fill="currentColor" /> Mais Popular
                    </div>
                  )}
                  <div className="font-black text-lg mb-1">{plan.name}</div>
                  <div className="font-black text-3xl mb-0.5" style={{ color: plan.color }}>R${plan.price}</div>
                  <div className="text-xs mb-4" style={{ color: T.textSub }}>por mês</div>
                  <div className="space-y-2 mb-5">
                    {plan.features.map(f => (
                      <div key={f} className="flex items-center gap-2 text-xs">
                        <CheckCircle size={12} style={{ color: plan.color }} />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                  <button className="w-full py-2.5 rounded-xl text-sm font-black"
                    style={{ background: plan.popular ? plan.color : plan.color + "20", color: plan.popular ? "#000" : plan.color }}>
                    Selecionar
                  </button>
                </div>
              ))}
            </div>

            {/* Quote form */}
            <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-black mb-4">Enviar Cotação ao Cliente</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs font-black mb-1.5 block" style={{ color: T.textSub }}>NOME DO CLIENTE</label>
                  <input type="text" value={quoteName} onChange={e => setQuoteName(e.target.value)}
                    placeholder="Ex: João Silva — Ambev"
                    className="w-full px-3 py-2.5 rounded-xl text-sm"
                    style={{ background: T.panel, border: `1px solid ${T.border}`, color: T.text }} />
                </div>
                <div>
                  <label className="text-xs font-black mb-1.5 block" style={{ color: T.textSub }}>EMAIL</label>
                  <input type="email" value={quoteEmail} onChange={e => setQuoteEmail(e.target.value)}
                    placeholder="joao@empresa.com"
                    className="w-full px-3 py-2.5 rounded-xl text-sm"
                    style={{ background: T.panel, border: `1px solid ${T.border}`, color: T.text }} />
                </div>
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-black"
                  style={{ background: T.success, color: "#000" }}>
                  <Send size={13} /> Enviar por Email
                </button>
                <button className="flex items-center gap-1.5 px-4 py-3 rounded-xl text-sm font-bold"
                  style={{ background: T.panel, color: T.textSub, border: `1px solid ${T.border}` }}>
                  <Download size={13} /> Baixar PDF
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SCENARIOS TAB */}
        {tab === "scenarios" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {SCENARIOS.map((sc, i) => (
                <div key={i} className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                  <div className="font-black mb-1">{sc.name}</div>
                  <div className="text-xs mb-3" style={{ color: T.textSub }}>
                    {sc.screens} telas · {sc.days} dias · {sc.objective}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Budget",    value: `R$${(sc.budget/1000).toFixed(0)}k`, color: T.gold    },
                      { label: "CTR proj.", value: `${sc.projCtr}%`,                    color: T.success },
                      { label: "ROI proj.", value: `${sc.projRoi}x`,                    color: T.primary },
                    ].map((m, j) => (
                      <div key={j} className="p-2 rounded-xl text-center" style={{ background: T.panel }}>
                        <div className="font-black text-sm" style={{ color: m.color }}>{m.value}</div>
                        <div className="text-xs" style={{ color: T.textSub }}>{m.label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 text-xs" style={{ color: T.textSub }}>Impressões: <strong style={{ color: T.text }}>{sc.projImp}</strong></div>
                  <button onClick={() => setTab("calculator")}
                    className="w-full mt-3 py-2 rounded-xl text-xs font-black"
                    style={{ background: T.primary + "20", color: T.primary }}>
                    Usar como base
                  </button>
                </div>
              ))}
            </div>

            <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-black mb-4 text-sm">ROI por Cenário</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={SCENARIO_BAR} barSize={48}>
                  <XAxis dataKey="name" tick={{ fill: T.textSub, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: T.textSub, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}x`} />
                  <Tooltip contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10 }}
                    formatter={(v: number) => [`${v}x`, "ROI"]} />
                  <Bar key="bar-scenario-roi" dataKey="roi" radius={[6, 6, 0, 0]}>
                    {SCENARIOS.map((_, i) => (
                      <Cell key={`cell-sc-${i}`} fill={[T.primary, T.success, T.gold, T.accent][i]} />
                    ))}
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
