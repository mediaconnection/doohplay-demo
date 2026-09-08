import { useState } from "react";
import { ArrowLeft, DollarSign, TrendingUp, Zap, ChevronRight, Calculator } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

const PLAN_COST = { starter: 97, pro: 290, enterprise: 620 };
const SEGMENTS = ["Academia","Barbearia","Restaurante","Farmácia","Varejo","Clínica","Pet Shop","Outro"];
const BASE_CPM: Record<string, number> = { Academia: 45, Barbearia: 42, Restaurante: 40, Farmácia: 44, Varejo: 41, Clínica: 46, "Pet Shop": 38, Outro: 40 };

interface Props { onBack: () => void; onNavigate?: (v: string) => void; }

export default function ROICalculator({ onBack, onNavigate }: Props) {
  const [screens, setScreens] = useState(1);
  const [segment, setSegment] = useState("Barbearia");
  const [plan, setPlan] = useState<"starter" | "pro" | "enterprise">("starter");
  const [fillRate, setFillRate] = useState(75);
  const [hoursPerDay, setHoursPerDay] = useState(12);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [cpmOverride, setCpmOverride] = useState<number | null>(null);

  const cpm = cpmOverride ?? BASE_CPM[segment] ?? 40;
  const planCost = PLAN_COST[plan];
  const slotsPerHour = 4; // 15s each
  const dailySlots = hoursPerDay * slotsPerHour * (fillRate / 100);
  const monthlySlots = dailySlots * 30 * screens;
  const monthlyImpressions = monthlySlots * 250; // avg 250 viewers per slot
  const grossRevenue = (monthlyImpressions / 1000) * cpm;
  const netRevenue = grossRevenue - planCost;
  const roi = planCost > 0 ? ((netRevenue / planCost) * 100) : 0;
  const breakEvenDays = planCost / (grossRevenue / 30);

  const projectionData = Array.from({ length: 12 }, (_, i) => {
    const m = i + 1;
    const fillGrowth = Math.min(fillRate + m * 2, 95) / 100;
    const monthly = (hoursPerDay * slotsPerHour * fillGrowth * 30 * screens * 250 / 1000) * cpm;
    return { month: `M${m}`, revenue: Math.round(monthly), net: Math.round(monthly - planCost) };
  });

  const yearTotal = projectionData.reduce((a, p) => a + p.revenue, 0);

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5"><ArrowLeft size={18} style={{ color: T.textSub }} /></button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.gold + "20" }}>
              <Calculator size={18} style={{ color: T.gold }} />
            </div>
            <div>
              <h1 className="font-black text-lg">Calculadora de ROI</h1>
              <p className="text-xs" style={{ color: T.textSub }}>Projete sua receita DOOH</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6 space-y-5">
        {/* Inputs */}
        <div className="space-y-4 p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
          <h3 className="font-bold text-sm">Configure seu cenário</h3>

          {/* Screens */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium" style={{ color: T.textSub }}>Número de telas</label>
              <span className="font-black" style={{ color: T.primary }}>{screens} tela{screens > 1 ? "s" : ""}</span>
            </div>
            <input type="range" min={1} max={20} value={screens} onChange={e => setScreens(Number(e.target.value))}
              className="w-full accent-blue-500" />
            <div className="flex justify-between text-xs mt-1" style={{ color: T.textSub }}>
              <span>1</span><span>5</span><span>10</span><span>15</span><span>20</span>
            </div>
          </div>

          {/* Segment */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: T.textSub }}>Segmento</label>
            <div className="grid grid-cols-4 gap-2">
              {SEGMENTS.map(s => (
                <button key={s} onClick={() => setSegment(s)}
                  className="py-2 rounded-xl text-xs font-medium transition-all"
                  style={{ background: segment === s ? T.primary + "20" : T.panel, color: segment === s ? T.primary : T.textSub, border: `1px solid ${segment === s ? T.primary + "40" : T.border}` }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Plan */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: T.textSub }}>Plano DOOHPLAY</label>
            <div className="grid grid-cols-3 gap-2">
              {(["starter","pro","enterprise"] as const).map(p => (
                <button key={p} onClick={() => setPlan(p)}
                  className="py-3 rounded-xl text-center transition-all"
                  style={{ background: plan === p ? T.primary + "20" : T.panel, border: `1px solid ${plan === p ? T.primary + "40" : T.border}` }}>
                  <div className="font-black text-sm capitalize" style={{ color: plan === p ? T.primary : T.text }}>{p}</div>
                  <div className="text-xs" style={{ color: T.textSub }}>R${PLAN_COST[p]}/mês</div>
                </button>
              ))}
            </div>
          </div>

          {/* Fill rate + hours */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-xs" style={{ color: T.textSub }}>Fill rate estimado</label>
                <span className="font-bold text-xs" style={{ color: T.success }}>{fillRate}%</span>
              </div>
              <input type="range" min={20} max={98} value={fillRate} onChange={e => setFillRate(Number(e.target.value))}
                className="w-full accent-blue-500" />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-xs" style={{ color: T.textSub }}>Horas/dia ativo</label>
                <span className="font-bold text-xs" style={{ color: T.primary }}>{hoursPerDay}h</span>
              </div>
              <input type="range" min={4} max={24} value={hoursPerDay} onChange={e => setHoursPerDay(Number(e.target.value))}
                className="w-full accent-blue-500" />
            </div>
          </div>

          {/* Advanced */}
          <button onClick={() => setShowAdvanced(v => !v)} className="flex items-center gap-1 text-xs" style={{ color: T.textSub }}>
            <ChevronRight size={12} style={{ transform: showAdvanced ? "rotate(90deg)" : "none" }} />
            Configurações avançadas
          </button>
          {showAdvanced && (
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: T.textSub }}>CPM personalizado (R$)</label>
              <input type="number" placeholder={`Padrão: R$${cpm}`}
                value={cpmOverride ?? ""}
                onChange={e => setCpmOverride(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-3 py-2.5 rounded-xl text-sm"
                style={{ background: T.panel, border: `1px solid ${T.border}`, color: T.text }} />
            </div>
          )}
        </div>

        {/* Results */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Receita bruta/mês",    value: `R$${grossRevenue.toFixed(0)}`,           color: T.success },
            { label: "Receita líquida/mês",  value: `R$${Math.max(0,netRevenue).toFixed(0)}`, color: netRevenue >= 0 ? T.success : T.danger },
            { label: "ROI sobre o plano",    value: `${roi.toFixed(0)}%`,                     color: roi >= 200 ? T.gold : roi >= 100 ? T.success : T.warning },
            { label: "Break-even",           value: `${Math.ceil(breakEvenDays)} dias`,        color: breakEvenDays < 10 ? T.success : T.warning },
          ].map((k, i) => (
            <div key={i} className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <div className="text-xs mb-1" style={{ color: T.textSub }}>{k.label}</div>
              <div className="font-black text-2xl" style={{ color: k.color }}>{k.value}</div>
            </div>
          ))}
        </div>

        {/* Impressions detail */}
        <div className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
          <h4 className="font-bold text-sm mb-3">Detalhamento mensal</h4>
          <div className="space-y-2">
            {[
              { label: "Slots por dia",            value: dailySlots.toFixed(0)                         },
              { label: "Impressões mensais",        value: monthlyImpressions.toLocaleString("pt-BR")   },
              { label: "CPM aplicado",              value: `R$${cpm}`                                   },
              { label: "Custo do plano",            value: `-R$${planCost}`                             },
              { label: "Receita estimada ano 1",    value: `R$${yearTotal.toLocaleString("pt-BR")}`,    bold: true, color: T.success },
            ].map((row, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span style={{ color: T.textSub }}>{row.label}</span>
                <span style={{ fontWeight: row.bold ? 900 : 400, color: row.color ?? T.text }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 12-month projection chart */}
        <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
          <h3 className="font-bold text-sm mb-4">Projeção 12 meses (fill rate crescente)</h3>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={projectionData}>
              <defs>
                <linearGradient key="roi-gross" id="roi-gross" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={T.success} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={T.success} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fill: T.textSub, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 12, color: T.text }}
                formatter={(v: number, name: string) => [`R$${v.toLocaleString("pt-BR")}`, name === "revenue" ? "Bruto" : "Líquido"]} />
              <Area type="monotone" dataKey="revenue" key="roi-area-gross" stroke={T.success} fill="url(#roi-gross)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="net" key="roi-area-net" stroke={T.primary} fill="none" strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* CTA */}
        <button onClick={() => onNavigate?.("screen-setup")}
          className="w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3"
          style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`, color: "#fff" }}>
          <Zap size={20} /> Começar a ganhar R${Math.round(grossRevenue / 30)}/dia
        </button>
      </div>
    </div>
  );
}
