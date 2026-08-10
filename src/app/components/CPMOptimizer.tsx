import { useState } from "react";
import { ArrowLeft, Zap, TrendingUp, Clock, Target, DollarSign, Brain, ChevronRight, Star, AlertTriangle, CheckCircle, BarChart2 } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

interface Props { onBack: () => void; onNavigate?: (v: string) => void; }

const SEGMENTS = ["Alimentação", "Fitness", "Farmácia", "Saúde", "Beleza", "Pet", "Varejo", "Educação"];

const BASE_CPM_BY_HOUR: Record<string, number[]> = {
  Alimentação: [8,6,5,4,4,5,12,18,14,16,22,28,38,32,28,26,32,44,52,46,38,28,18,10],
  Fitness:     [6,5,4,4,4,8,22,30,26,18,14,12,14,12,16,20,30,40,44,36,28,18,12,8],
  Farmácia:    [5,4,4,3,3,4,8,16,22,26,28,30,32,28,26,28,30,32,28,22,18,14,10,6],
  Saúde:       [4,3,3,3,3,4,6,14,20,28,32,30,28,26,28,30,28,22,18,14,10,8,6,4],
  Beleza:      [5,4,3,3,3,4,8,18,24,28,26,24,22,20,22,26,30,36,40,34,24,16,10,6],
  Pet:         [4,3,3,3,3,4,6,12,16,18,20,22,24,22,20,22,24,28,30,24,18,12,8,5],
  Varejo:      [6,5,4,4,4,5,8,16,22,26,30,34,38,36,32,30,34,38,42,36,28,20,14,8],
  Educação:    [4,3,3,3,3,4,6,14,18,20,18,16,18,20,22,20,22,28,30,24,18,12,8,4],
};

const DAY_MULTIPLIERS = [0.85, 0.90, 0.95, 1.0, 1.1, 1.35, 1.25];
const DAYS = ["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"];

const AI_TIPS: Record<string, string[]> = {
  Alimentação: [
    "Pico de audiência 19h–21h — eleve CPM 40% nessa janela",
    "Sextas e sábados têm 35% mais viewers. Concentre budget.",
    "Conteúdo de delivery converte 2.4× mais após 20h",
  ],
  Fitness: [
    "Manhãs 6h–9h são o pico de audiência fitness (academia cheia)",
    "Segunda e quinta têm maior motivação de treino — aproveite",
    "Promoções de matrícula convertem 3× mais no início do mês",
  ],
  Farmácia: [
    "Horário de almoço 11h–13h é o segundo pico de audiência",
    "Campanhas de vitaminas C e D performam 28% melhor no inverno",
    "CPM de fins de semana 22% menor — boa oportunidade de alcance",
  ],
};

const tooltipStyle = { background: T.panel, border: `1px solid ${T.border}`, borderRadius: 12, color: T.text };

export default function CPMOptimizer({ onBack, onNavigate }: Props) {
  const [segment, setSegment]   = useState("Alimentação");
  const [budget, setBudget]     = useState(2000);
  const [days, setDays]         = useState<number[]>([0,1,2,3,4,5,6]);
  const [hours, setHours]       = useState<number[]>([8,9,10,11,12,13,14,15,16,17,18,19,20,21]);
  const [tab, setTab]           = useState<"optimizer" | "heatmap" | "recommendations">("optimizer");

  const baseCPM = BASE_CPM_BY_HOUR[segment] ?? BASE_CPM_BY_HOUR.Alimentação;

  const hourlyData = Array.from({ length: 24 }, (_, h) => {
    const avgDayMult = days.reduce((a, d) => a + DAY_MULTIPLIERS[d], 0) / Math.max(1, days.length);
    const cpm = baseCPM[h] * avgDayMult;
    const isSelected = hours.includes(h);
    return { hour: `${String(h).padStart(2,"0")}h`, cpm: Math.round(cpm * 10) / 10, selected: isSelected };
  });

  const selectedHourData = hourlyData.filter((_, h) => hours.includes(h));
  const avgSelectedCPM   = selectedHourData.length ? selectedHourData.reduce((a, d) => a + d.cpm, 0) / selectedHourData.length : 0;
  const peakHour         = hourlyData.reduce((a, b) => b.cpm > a.cpm ? b : a);
  const peakHourIdx      = hourlyData.indexOf(peakHour);
  const estImpressions   = budget > 0 && avgSelectedCPM > 0 ? Math.round((budget / avgSelectedCPM) * 1000) : 0;

  const sortedHours = [...hourlyData].sort((a, b) => b.cpm - a.cpm);
  const suggestedHours = sortedHours.slice(0, 8).map(h => hourlyData.indexOf(h));

  const heatmapData = DAYS.map((day, di) => ({
    day,
    data: Array.from({ length: 24 }, (_, h) => ({ h, cpm: Math.round(baseCPM[h] * DAY_MULTIPLIERS[di] * 10) / 10 })),
  }));

  const maxCPM = Math.max(...baseCPM) * 1.35;

  const toggleHour = (h: number) => setHours(prev => prev.includes(h) ? prev.filter(x => x !== h) : [...prev, h].sort((a,b)=>a-b));
  const toggleDay = (d: number) => setDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d].sort((a,b)=>a-b));
  const applySuggested = () => setHours(suggestedHours.sort((a,b)=>a-b));

  const tips = AI_TIPS[segment] ?? AI_TIPS.Alimentação;

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5"><ArrowLeft size={18} style={{ color: T.textSub }} /></button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.accent + "20" }}>
                <Brain size={18} style={{ color: T.accent }} />
              </div>
              <div>
                <h1 className="font-black text-lg">CPM Optimizer</h1>
                <p className="text-xs" style={{ color: T.textSub }}>Sugestão de CPM ideal por horário e segmento</p>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-6 pb-0 flex gap-1">
          {(["optimizer","heatmap","recommendations"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="px-5 py-2.5 text-sm font-bold border-b-2 transition-all"
              style={{ color: tab === t ? T.primary : T.textSub, borderColor: tab === t ? T.primary : "transparent" }}>
              {t === "optimizer" ? "Otimizador" : t === "heatmap" ? "Mapa de Calor" : "Recomendações IA"}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">
        <div className="flex items-center gap-2 flex-wrap">
          {SEGMENTS.map(s => (
            <button key={s} onClick={() => setSegment(s)}
              className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
              style={{ background: segment === s ? T.accent + "25" : T.card, color: segment === s ? T.accent : T.textSub, border: `1px solid ${segment === s ? T.accent + "50" : T.border}` }}>
              {s}
            </button>
          ))}
        </div>

        {tab === "optimizer" && (
          <>
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: "CPM médio no período", value: `R$${avgSelectedCPM.toFixed(2)}`, color: T.primary, icon: DollarSign },
                { label: "CPM pico (melhor hora)", value: `R$${peakHour.cpm.toFixed(2)}`, color: T.gold, icon: TrendingUp },
                { label: "Impressões estimadas", value: estImpressions.toLocaleString("pt-BR"), color: T.success, icon: Target },
                { label: "Janelas selecionadas", value: `${hours.length}h`, color: T.accent, icon: Clock },
              ].map((k, i) => (
                <div key={i} className="p-4 rounded-2xl border flex items-center gap-3" style={{ background: T.card, borderColor: T.border }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: k.color + "20" }}>
                    <k.icon size={16} style={{ color: k.color }} />
                  </div>
                  <div>
                    <div className="font-black text-xl" style={{ color: k.color }}>{k.value}</div>
                    <div className="text-xs" style={{ color: T.textSub }}>{k.label}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <div className="flex justify-between mb-2">
                <label className="font-bold text-sm">Orçamento mensal (R$)</label>
                <span className="font-black" style={{ color: T.gold }}>R${budget.toLocaleString("pt-BR")}</span>
              </div>
              <input type="range" min={200} max={20000} step={100} value={budget} onChange={e => setBudget(Number(e.target.value))} className="w-full accent-blue-500 mb-1" />
              <div className="flex justify-between text-xs" style={{ color: T.textSub }}><span>R$200</span><span>R$5.000</span><span>R$10.000</span><span>R$20.000</span></div>
            </div>

            <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-bold text-sm mb-3">Dias da semana</h3>
              <div className="flex gap-2">
                {DAYS.map((d, i) => (
                  <button key={d} onClick={() => toggleDay(i)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
                    style={{ background: days.includes(i) ? T.primary + "25" : T.panel, color: days.includes(i) ? T.primary : T.textSub, border: `1px solid ${days.includes(i) ? T.primary + "50" : T.border}` }}>
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm">CPM por horário — {segment}</h3>
                <button onClick={applySuggested} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold" style={{ background: T.success + "20", color: T.success, border: `1px solid ${T.success}30` }}>
                  <Zap size={11} /> Aplicar sugestão IA
                </button>
              </div>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={hourlyData}>
                  <XAxis dataKey="hour" tick={{ fill: T.textSub, fontSize: 8 }} axisLine={false} tickLine={false} interval={3} />
                  <YAxis hide />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`R$${v}`, "CPM"]} />
                  <Bar key="bar-cpm" dataKey="cpm" radius={[3,3,0,0]}>
                    {hourlyData.map((h, i) => <Cell key={i} fill={h.selected ? T.primary : T.textSub + "40"} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-12 gap-1">
                {hourlyData.map((h, i) => (
                  <button key={i} onClick={() => toggleHour(i)}
                    className="py-1.5 rounded-lg text-xs font-bold transition-all"
                    style={{ background: hours.includes(i) ? T.primary + "25" : T.panel, color: hours.includes(i) ? T.primary : T.textSub, border: `1px solid ${hours.includes(i) ? T.primary + "40" : T.border}` }}>
                    {String(i).padStart(2,"0")}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {tab === "heatmap" && (
          <div className="p-5 rounded-2xl border overflow-x-auto" style={{ background: T.card, borderColor: T.border }}>
            <h3 className="font-bold mb-4">Mapa de calor CPM — {segment} (R$)</h3>
            <div style={{ minWidth: 700 }}>
              <div className="flex mb-1" style={{ paddingLeft: 48 }}>
                {Array.from({ length: 24 }, (_, h) => (
                  <div key={h} className="flex-1 text-center text-xs" style={{ color: T.textSub, minWidth: 26 }}>
                    {h % 3 === 0 ? `${String(h).padStart(2,"0")}h` : ""}
                  </div>
                ))}
              </div>
              {heatmapData.map(({ day, data }) => (
                <div key={day} className="flex items-center mb-1">
                  <div className="w-12 text-xs font-bold flex-shrink-0" style={{ color: T.textSub }}>{day}</div>
                  {data.map(({ h, cpm }) => {
                    const intensity = cpm / maxCPM;
                    const bg = intensity > 0.7 ? T.danger : intensity > 0.5 ? T.warning : intensity > 0.3 ? T.primary : T.primary + "30";
                    return (
                      <div key={h} title={`${String(h).padStart(2,"0")}h: R$${cpm}`}
                        className="flex-1 h-7 rounded-sm mx-px flex items-center justify-center text-xs font-bold transition-all hover:scale-110"
                        style={{ background: bg, color: intensity > 0.4 ? "#fff" : "transparent", minWidth: 26 }}>
                        {intensity > 0.5 ? cpm : ""}
                      </div>
                    );
                  })}
                </div>
              ))}
              <div className="flex items-center gap-3 mt-4">
                <span className="text-xs" style={{ color: T.textSub }}>Menor CPM</span>
                {[T.primary + "30", T.primary, T.warning, T.danger].map((c, i) => (
                  <div key={i} className="w-6 h-4 rounded" style={{ background: c }} />
                ))}
                <span className="text-xs" style={{ color: T.textSub }}>Maior CPM</span>
              </div>
            </div>
          </div>
        )}

        {tab === "recommendations" && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.accent + "30" }}>
              <div className="flex items-center gap-2 mb-4">
                <Brain size={18} style={{ color: T.accent }} />
                <h3 className="font-bold">Recomendações IA para {segment}</h3>
              </div>
              <div className="space-y-3">
                {tips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: T.panel }}>
                    <Zap size={14} style={{ color: T.accent, flexShrink: 0, marginTop: 2 }} />
                    <span className="text-sm" style={{ color: T.text }}>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-bold mb-4">CPM médio por segmento</h3>
              <div className="space-y-2">
                {SEGMENTS.map(seg => {
                  const avg = (BASE_CPM_BY_HOUR[seg] ?? []).reduce((a: number, b: number) => a + b, 0) / 24;
                  const maxAvg = 32;
                  return (
                    <div key={seg} onClick={() => setSegment(seg)} className="cursor-pointer">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium" style={{ color: seg === segment ? T.accent : T.text }}>{seg}</span>
                        <span className="text-sm font-bold" style={{ color: seg === segment ? T.accent : T.gold }}>R${avg.toFixed(2)}</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: T.panel }}>
                        <div className="h-full rounded-full" style={{ width: `${(avg / maxAvg) * 100}%`, background: seg === segment ? T.accent : T.primary + "60" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
