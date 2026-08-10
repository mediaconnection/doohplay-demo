import { useState } from "react";
import {
  ArrowLeft, Users, Target, Eye, TrendingUp, MapPin,
  RefreshCw, Plus, ChevronRight, BarChart2, Layers,
  Clock, Star, Zap, CheckCircle, Sliders
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  PieChart, Pie
} from "recharts";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

interface Props { onBack: () => void; onNavigate?: (v: string) => void; }
type TabId = "segments" | "planner" | "frequency";

interface Segment {
  id: string;
  name: string;
  size: number;
  description: string;
  affinities: string[];
  avgAge: string;
  income: string;
  color: string;
}

const SEGMENTS: Segment[] = [
  { id: "SEG001", name: "Executivos Urbanos",  size: 840000, description: "Profissionais 35–55, renda A/B, frequentadores de aeroportos e centros empresariais", affinities: ["Finanças","Tecnologia","Viagens"], avgAge: "42",  income: "R$18k+",  color: T.gold    },
  { id: "SEG002", name: "Jovens Conectados",   size: 2100000,description: "18–32, heavy mobile, centros comerciais e transporte público, sensíveis a tendências",  affinities: ["Moda","Games","Food"], avgAge: "26", income: "R$4k–9k", color: T.primary },
  { id: "SEG003", name: "Famílias Premium",    size: 1200000,description: "28–45, filhos, shoppings de alto padrão, consumo planejado de médio/alto ticket",        affinities: ["Educação","Saúde","Casa"],  avgAge: "36",  income: "R$10k+",  color: T.success },
  { id: "SEG004", name: "Commuters SP",        size: 3400000,description: "Passageiros diários de metrô/ônibus em São Paulo, pico 7–9h e 17–20h",                   affinities: ["Delivery","Apps","Varejo"], avgAge: "31", income: "R$3k–8k", color: T.accent  },
  { id: "SEG005", name: "Viajantes Frequentes",size: 420000, description: "Passageiros de aeroportos com viagens mensais, alta renda, perfil decisor",              affinities: ["Hotéis","Seguros","Carros"], avgAge: "39", income: "R$20k+", color: T.danger  },
];

const AGE_DIST = [
  { group: "18–24", pct: 18 }, { group: "25–34", pct: 32 }, { group: "35–44", pct: 26 },
  { group: "45–54", pct: 14 }, { group: "55+",   pct: 10 },
];

const HOUR_REACH = [
  { h: "06", reach: 12 }, { h: "08", reach: 48 }, { h: "10", reach: 62 },
  { h: "12", reach: 71 }, { h: "14", reach: 64 }, { h: "16", reach: 69 },
  { h: "18", reach: 82 }, { h: "20", reach: 74 }, { h: "22", reach: 41 },
];

const RADAR_DATA = [
  { metric: "Alcance",      value: 88 },
  { metric: "Freqúencia",   value: 72 },
  { metric: "Relevância",   value: 91 },
  { metric: "Viewability",  value: 84 },
  { metric: "Brand Safety", value: 97 },
  { metric: "Custo-efic.",  value: 79 },
];

const FREQ_DATA = [
  { freq: "1x",  pct: 28 }, { freq: "2x",  pct: 24 }, { freq: "3x", pct: 19 },
  { freq: "4x",  pct: 13 }, { freq: "5x",  pct: 8  }, { freq: "6x+", pct: 8 },
];

export default function AudiencePlanner({ onBack }: Props) {
  const [tab, setTab]           = useState<TabId>("segments");
  const [selectedSeg, setSelectedSeg] = useState<string | null>("SEG001");
  const [budget, setBudget]     = useState("60000");
  const [days, setDays]         = useState("30");
  const [targetFreq, setTargetFreq] = useState("3");
  const [selectedSegs, setSelectedSegs] = useState<string[]>(["SEG001","SEG002"]);

  const toggleSeg = (id: string) => setSelectedSegs(prev =>
    prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
  );

  const projBudget     = parseFloat(budget) || 0;
  const projDays       = parseInt(days) || 30;
  const selectedTotal  = SEGMENTS.filter(s => selectedSegs.includes(s.id)).reduce((sum, s) => sum + s.size, 0);
  const projImpressions = Math.round(projBudget / 48 * 1000);
  const projReach      = Math.round(projImpressions / parseInt(targetFreq));
  const projCoverage   = Math.min(Math.round((projReach / selectedTotal) * 100), 100);

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5">
              <ArrowLeft size={18} style={{ color: T.textSub }} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.success + "20" }}>
                <Users size={18} style={{ color: T.success }} />
              </div>
              <div>
                <h1 className="font-black text-lg">Audience Planner</h1>
                <p className="text-xs" style={{ color: T.textSub }}>Planejamento de audiência com reach & frequency, segmentos e cobertura geográfica</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {(["segments","planner","frequency"] as TabId[]).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
                style={{ background: tab === t ? T.success + "20" : "transparent", color: tab === t ? T.success : T.textSub, border: `1px solid ${tab === t ? T.success + "30" : "transparent"}` }}>
                {t === "segments" ? "Segmentos" : t === "planner" ? "Planner R&F" : "Freqúencia"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Audiência Total (BR)",    value: "28.4M",  color: T.success, icon: Users    },
            { label: "Segmentos Ativos",         value: SEGMENTS.length, color: T.primary, icon: Layers  },
            { label: "Cobertura Média",           value: "62%",    color: T.accent,  icon: Target   },
            { label: "Freq. Média Ideal",         value: "3.2x",   color: T.gold,    icon: RefreshCw },
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

        {tab === "segments" && (
          <div className="flex gap-6">
            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-black">Segmentos de Audiência DOOH</h2>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black"
                  style={{ background: T.success, color: "#000" }}>
                  <Plus size={14} /> Novo Segmento
                </button>
              </div>

              {SEGMENTS.map(seg => (
                <div key={seg.id} onClick={() => setSelectedSeg(selectedSeg === seg.id ? null : seg.id)}
                  className="p-4 rounded-2xl border cursor-pointer hover:bg-white/2 transition-all"
                  style={{ background: T.card, borderColor: selectedSeg === seg.id ? seg.color + "50" : T.border }}>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: seg.color + "20" }}>
                      <Users size={16} style={{ color: seg.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black">{seg.name}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                          style={{ background: seg.color + "20", color: seg.color }}>
                          {(seg.size/1000000).toFixed(1)}M pessoas
                        </span>
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: T.textSub }}>{seg.description}</p>
                      {selectedSeg === seg.id && (
                        <div className="mt-3 grid grid-cols-3 gap-3">
                          <div className="p-3 rounded-xl" style={{ background: T.panel }}>
                            <div className="font-black" style={{ color: seg.color }}>{seg.avgAge} anos</div>
                            <div className="text-xs" style={{ color: T.textSub }}>Idade média</div>
                          </div>
                          <div className="p-3 rounded-xl" style={{ background: T.panel }}>
                            <div className="font-black" style={{ color: T.gold }}>{seg.income}</div>
                            <div className="text-xs" style={{ color: T.textSub }}>Renda média</div>
                          </div>
                          <div className="p-3 rounded-xl" style={{ background: T.panel }}>
                            <div className="flex flex-wrap gap-1">
                              {seg.affinities.map(a => (
                                <span key={a} className="text-xs px-1.5 py-0.5 rounded font-bold"
                                  style={{ background: seg.color + "15", color: seg.color }}>{a}</span>
                              ))}
                            </div>
                            <div className="text-xs mt-1" style={{ color: T.textSub }}>Afinidades</div>
                          </div>
                        </div>
                      )}
                    </div>
                    <ChevronRight size={14} style={{ color: T.textSub, transform: selectedSeg === seg.id ? "rotate(90deg)" : "none", transition: "transform 0.2s" }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="w-52 flex-shrink-0 space-y-4">
              <div className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black text-sm mb-2">Score de Qualidade</h3>
                <p className="text-xs mb-3" style={{ color: T.textSub }}>Segmento selecionado</p>
                <ResponsiveContainer width="100%" height={170}>
                  <RadarChart data={RADAR_DATA}>
                    <PolarGrid stroke={T.border} />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: T.textSub, fontSize: 9 }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar key="radar-audience" name="Score" dataKey="value" stroke={T.success} fill={T.success} fillOpacity={0.2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black text-sm mb-3">Distribuição Etária</h3>
                <ResponsiveContainer width="100%" height={130}>
                  <BarChart data={AGE_DIST} barSize={22}>
                    <XAxis dataKey="group" tick={{ fill: T.textSub, fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10 }}
                      formatter={(v: number) => [`${v}%`, "Share"]} />
                    <Bar key="bar-age" dataKey="pct" radius={[4, 4, 0, 0]}>
                      {AGE_DIST.map((_, i) => (
                        <Cell key={`cell-ag-${i}`} fill={[T.textSub, T.primary, T.success, T.accent, T.gold][i]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {tab === "planner" && (
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black mb-4">Configurar Plano R&F</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-black mb-2 block" style={{ color: T.textSub }}>SEGMENTOS ALVO</label>
                    <div className="space-y-2">
                      {SEGMENTS.map(seg => (
                        <label key={seg.id} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer"
                          style={{ background: selectedSegs.includes(seg.id) ? seg.color + "10" : T.panel, border: `1px solid ${selectedSegs.includes(seg.id) ? seg.color + "30" : T.border}` }}>
                          <input type="checkbox" checked={selectedSegs.includes(seg.id)} onChange={() => toggleSeg(seg.id)}
                            style={{ accentColor: seg.color }} />
                          <div className="flex-1">
                            <span className="text-xs font-black">{seg.name}</span>
                            <span className="text-xs ml-2" style={{ color: T.textSub }}>{(seg.size/1000000).toFixed(1)}M</span>
                          </div>
                          <div className="w-2 h-2 rounded-full" style={{ background: seg.color }} />
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-black mb-1.5 block" style={{ color: T.textSub }}>BUDGET (R$)</label>
                      <input type="number" value={budget} onChange={e => setBudget(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl text-sm"
                        style={{ background: T.panel, border: `1px solid ${T.border}`, color: T.text }} />
                    </div>
                    <div>
                      <label className="text-xs font-black mb-1.5 block" style={{ color: T.textSub }}>DIAS</label>
                      <input type="number" value={days} onChange={e => setDays(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl text-sm"
                        style={{ background: T.panel, border: `1px solid ${T.border}`, color: T.text }} />
                    </div>
                    <div>
                      <label className="text-xs font-black mb-1.5 block" style={{ color: T.textSub }}>FREQ. ALVO</label>
                      <input type="number" value={targetFreq} onChange={e => setTargetFreq(e.target.value)}
                        min="1" max="10"
                        className="w-full px-3 py-2 rounded-xl text-sm"
                        style={{ background: T.panel, border: `1px solid ${T.border}`, color: T.text }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black mb-4 text-sm">Alcance por Hora do Dia</h3>
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={HOUR_REACH} barSize={20}>
                    <XAxis dataKey="h" tick={{ fill: T.textSub, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10 }}
                      formatter={(v: number) => [`${v}%`, "Alcance"]} />
                    <Bar key="bar-reach-hour" dataKey="reach" radius={[4, 4, 0, 0]}>
                      {HOUR_REACH.map((entry, i) => (
                        <Cell key={`cell-rh-${i}`} fill={entry.reach > 75 ? T.success : entry.reach > 55 ? T.primary : T.textSub} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black mb-4">Projeções R&F</h3>
                <div className="space-y-3">
                  {[
                    { label: "Audiência alvo total",  value: `${(selectedTotal/1000000).toFixed(1)}M`,       color: T.success },
                    { label: "Impressões projetadas", value: `${(projImpressions/1000000).toFixed(2)}M`,     color: T.primary },
                    { label: "Alcance projetado",     value: `${(projReach/1000000).toFixed(2)}M pessoas`,   color: T.accent  },
                    { label: "Cobertura estimada",    value: `${projCoverage}%`,                             color: T.gold    },
                    { label: "Freqúencia média",      value: `${targetFreq}x`,                               color: T.warning },
                    { label: "CPM médio",             value: "R$48",                                         color: T.text    },
                  ].map((m, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b"
                      style={{ borderColor: T.border }}>
                      <span className="text-sm" style={{ color: T.textSub }}>{m.label}</span>
                      <span className="font-black" style={{ color: m.color }}>{m.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black mb-3 text-sm">Cobertura por Segmento</h3>
                <div className="space-y-3">
                  {SEGMENTS.filter(s => selectedSegs.includes(s.id)).map(seg => {
                    const cov = Math.min(Math.round((projReach / seg.size) * 100), 100);
                    return (
                      <div key={seg.id}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span>{seg.name}</span>
                          <span className="font-black" style={{ color: seg.color }}>{cov}%</span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden" style={{ background: T.border }}>
                          <div className="h-full rounded-full" style={{ width: `${cov}%`, background: seg.color }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button className="w-full py-3 rounded-xl text-sm font-black flex items-center justify-center gap-2"
                style={{ background: `linear-gradient(135deg, ${T.success}, ${T.primary})`, color: "#fff" }}>
                <Zap size={14} /> Exportar Plano de Audiência
              </button>
            </div>
          </div>
        )}

        {tab === "frequency" && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Freq. média atual",   value: "2.8x", sub: "meta: 3–4x",          color: T.warning },
                { label: "% audiência 1x+",     value: "91%",  sub: "alcance amplo",         color: T.success },
                { label: "% audiência 3x+",     value: "47%",  sub: "recall reforçado",      color: T.primary },
              ].map((m, i) => (
                <div key={i} className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                  <div className="font-black text-2xl" style={{ color: m.color }}>{m.value}</div>
                  <div className="text-xs mt-0.5" style={{ color: T.textSub }}>{m.label}</div>
                  <div className="text-xs mt-2 font-bold" style={{ color: m.color }}>{m.sub}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black mb-4">Distribuição de Freqúencia</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={FREQ_DATA} barSize={36}>
                    <XAxis dataKey="freq" tick={{ fill: T.textSub, fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10 }}
                      formatter={(v: number) => [`${v}%`, "Audiência"]} />
                    <Bar key="bar-freq-dist" dataKey="pct" radius={[6, 6, 0, 0]}>
                      {FREQ_DATA.map((entry, i) => (
                        <Cell key={`cell-fd-${i}`} fill={i <= 1 ? T.textSub : i <= 3 ? T.primary : T.success} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black mb-4">Impacto da Freqúencia no Recall</h3>
                <div className="space-y-3">
                  {[
                    { freq: "1x", recall: 18, color: T.textSub },
                    { freq: "2x", recall: 34, color: T.primary  },
                    { freq: "3x", recall: 52, color: T.accent   },
                    { freq: "4x", recall: 64, color: T.success  },
                    { freq: "5x", recall: 71, color: T.gold     },
                    { freq: "6x+",recall: 75, color: T.warning  },
                  ].map((r, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span style={{ color: T.textSub }}>Freq. {r.freq}</span>
                        <span className="font-black" style={{ color: r.color }}>{r.recall}% recall</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: T.border }}>
                        <div className="h-full rounded-full" style={{ width: `${r.recall}%`, background: r.color }} />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs mt-4 p-3 rounded-xl" style={{ background: T.panel, color: T.textSub }}>
                  <strong style={{ color: T.gold }}>Ponto ótimo:</strong> 3–4 exposições maximizam recall sem incremento de custo. Acima de 5x, retorno marginal cai abaixo de 5%.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
