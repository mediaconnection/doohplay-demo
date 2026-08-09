import { useState } from "react";
import {
  ArrowLeft, ArrowRight, Check, Target, Users, Tv, Image, DollarSign,
  Megaphone, MapPin, Calendar, Zap, Star, ChevronRight, Sparkles
} from "lucide-react";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

interface Props { onBack: () => void; onNavigate?: (v: string) => void; }

const STEPS = [
  { id: 1, label: "Objetivo",   icon: Target     },
  { id: 2, label: "Audiência",  icon: Users      },
  { id: 3, label: "Telas",      icon: Tv         },
  { id: 4, label: "Criativo",   icon: Image      },
  { id: 5, label: "Budget",     icon: DollarSign },
];

const OBJECTIVES = [
  { id: "awareness",      label: "Brand Awareness",   desc: "Maximize alcance e reconhecimento de marca",    icon: Star,      color: T.primary },
  { id: "consideration",  label: "Consideração",       desc: "Engajar audiência qualificada em pesquisa",     icon: Zap,       color: T.accent  },
  { id: "conversion",     label: "Conversão",          desc: "Drive ações diretas: visitas, compras, leads",  icon: Target,    color: T.success },
  { id: "retention",      label: "Retenção",           desc: "Fidelizar clientes e reduzir churn",            icon: Sparkles,  color: T.gold    },
];

const AUDIENCES = [
  { id: "broad",         label: "Ampla",            desc: "18-65 anos, todos os perfis",                   size: "12.4M" },
  { id: "professional",  label: "Profissionais",     desc: "25-45 anos, renda A/B, centros empresariais",   size: "3.8M"  },
  { id: "shoppers",      label: "Compradores",       desc: "Frequentadores de shopping, varejo, 20-50 anos",size: "5.2M"  },
  { id: "commuters",     label: "Commuters",         desc: "Usuários de transporte público e aeroportos",   size: "8.1M"  },
  { id: "premium",       label: "Premium",           desc: "Renda A, bairros nobres, 30-55 anos",           size: "1.9M"  },
  { id: "young",         label: "Jovens",            desc: "18-30 anos, universidades e lazer",             size: "4.6M"  },
];

const SCREEN_TYPES = [
  { id: "outdoor",  label: "Outdoor",    count: 142, cpm: 55, color: T.primary  },
  { id: "indoor",   label: "Indoor",     count: 89,  cpm: 42, color: T.accent   },
  { id: "transit",  label: "Trânsito",   count: 215, cpm: 35, color: T.success  },
  { id: "retail",   label: "Retail",     count: 178, cpm: 38, color: T.gold     },
  { id: "airport",  label: "Aeroporto",  count: 34,  cpm: 84, color: T.warning  },
];

const REGIONS = [
  { id: "sp",       label: "Grande SP",         screens: 287 },
  { id: "rj",       label: "Rio de Janeiro",    screens: 142 },
  { id: "sul",      label: "Sul",               screens: 198 },
  { id: "nordeste", label: "Nordeste",           screens: 156 },
  { id: "centro",   label: "Centro-Oeste",       screens: 89  },
  { id: "norte",    label: "Norte",              screens: 67  },
];

export default function CampaignWizard({ onBack }: Props) {
  const [step, setStep]               = useState(1);
  const [objective, setObjective]     = useState("");
  const [audience, setAudience]       = useState("");
  const [screenTypes, setScreenTypes] = useState<string[]>([]);
  const [regions, setRegions]         = useState<string[]>([]);
  const [creativeName, setCreativeName] = useState("");
  const [creativeFormat, setCreativeFormat] = useState("16:9");
  const [campaignName, setCampaignName] = useState("");
  const [startDate, setStartDate]     = useState("");
  const [endDate, setEndDate]         = useState("");
  const [budget, setBudget]           = useState(15000);
  const [submitted, setSubmitted]     = useState(false);

  const toggleScreenType = (id: string) =>
    setScreenTypes(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleRegion = (id: string) =>
    setRegions(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const selectedScreensCount = SCREEN_TYPES.filter(s => screenTypes.includes(s.id)).reduce((a, s) => a + s.count, 0);
  const avgCpm = screenTypes.length > 0
    ? Math.round(SCREEN_TYPES.filter(s => screenTypes.includes(s.id)).reduce((a, s) => a + s.cpm, 0) / screenTypes.length)
    : 0;
  const projImp = avgCpm > 0 ? Math.round((budget / avgCpm) * 1000) : 0;

  const canNext = () => {
    if (step === 1) return !!objective;
    if (step === 2) return !!audience;
    if (step === 3) return screenTypes.length > 0 && regions.length > 0;
    if (step === 4) return !!creativeName;
    if (step === 5) return !!campaignName && !!startDate && !!endDate;
    return true;
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: T.bg }}>
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: T.success + "20", border: `2px solid ${T.success}` }}>
            <Check size={36} style={{ color: T.success }} />
          </div>
          <h2 className="font-black text-2xl mb-2" style={{ color: T.text }}>Campanha Criada!</h2>
          <p className="mb-2" style={{ color: T.textSub }}>
            <strong style={{ color: T.text }}>{campaignName}</strong> está em revisão e será ativada em breve.
          </p>
          <div className="grid grid-cols-3 gap-3 my-6">
            {[
              { label: "Telas", value: selectedScreensCount.toLocaleString("pt-BR"), color: T.primary },
              { label: "Budget", value: `R$${budget.toLocaleString("pt-BR")}`, color: T.gold },
              { label: "Imp. estimadas", value: projImp >= 1000000 ? `${(projImp/1000000).toFixed(1)}M` : `${(projImp/1000).toFixed(0)}k`, color: T.success },
            ].map((m, i) => (
              <div key={i} className="p-3 rounded-xl" style={{ background: T.card }}>
                <div className="font-black" style={{ color: m.color }}>{m.value}</div>
                <div className="text-xs" style={{ color: T.textSub }}>{m.label}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-3 justify-center">
            <button onClick={onBack} className="px-6 py-3 rounded-xl font-black text-sm"
              style={{ background: T.primary, color: "#fff" }}>
              Ver Dashboard
            </button>
            <button onClick={() => { setSubmitted(false); setStep(1); setObjective(""); setAudience(""); setScreenTypes([]); setRegions([]); }}
              className="px-6 py-3 rounded-xl font-black text-sm"
              style={{ background: T.panel, color: T.textSub, border: `1px solid ${T.border}` }}>
              Nova Campanha
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5">
              <ArrowLeft size={18} style={{ color: T.textSub }} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.primary + "20" }}>
                <Megaphone size={18} style={{ color: T.primary }} />
              </div>
              <div>
                <h1 className="font-black text-lg">Nova Campanha</h1>
                <p className="text-xs" style={{ color: T.textSub }}>Passo {step} de 5</p>
              </div>
            </div>
          </div>

          {/* Step indicators */}
          <div className="flex items-center gap-1">
            {STEPS.map((s, i) => {
              const done = step > s.id;
              const active = step === s.id;
              return (
                <div key={s.id} className="flex items-center">
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl transition-all"
                    style={{ background: active ? T.primary + "20" : done ? T.success + "15" : "transparent" }}>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-black"
                      style={{ background: done ? T.success : active ? T.primary : T.border, color: done || active ? "#fff" : T.textSub }}>
                      {done ? <Check size={10} /> : s.id}
                    </div>
                    <span className="text-xs font-bold hidden sm:block"
                      style={{ color: active ? T.primary : done ? T.success : T.textSub }}>{s.label}</span>
                  </div>
                  {i < STEPS.length - 1 && <div className="w-3 h-px mx-0.5" style={{ background: T.border }} />}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* STEP 1 — Objetivo */}
        {step === 1 && (
          <div>
            <h2 className="font-black text-2xl mb-1">Qual é o objetivo da campanha?</h2>
            <p className="mb-6" style={{ color: T.textSub }}>O objetivo guia a otimização de telas, CPM e horários.</p>
            <div className="grid grid-cols-2 gap-4">
              {OBJECTIVES.map(obj => (
                <button key={obj.id} onClick={() => setObjective(obj.id)}
                  className="p-5 rounded-2xl border text-left transition-all hover:scale-[1.01]"
                  style={{
                    background: objective === obj.id ? obj.color + "15" : T.card,
                    borderColor: objective === obj.id ? obj.color + "60" : T.border,
                    boxShadow: objective === obj.id ? `0 0 20px ${obj.color}20` : "none",
                  }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                    style={{ background: obj.color + "20" }}>
                    <obj.icon size={20} style={{ color: obj.color }} />
                  </div>
                  <div className="font-black text-base mb-1" style={{ color: T.text }}>{obj.label}</div>
                  <div className="text-sm" style={{ color: T.textSub }}>{obj.desc}</div>
                  {objective === obj.id && (
                    <div className="mt-3 flex items-center gap-1 text-xs font-black" style={{ color: obj.color }}>
                      <Check size={12} /> Selecionado
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2 — Audiência */}
        {step === 2 && (
          <div>
            <h2 className="font-black text-2xl mb-1">Defina sua audiência</h2>
            <p className="mb-6" style={{ color: T.textSub }}>Escolha o perfil de público que mais se alinha à sua campanha.</p>
            <div className="grid grid-cols-2 gap-3">
              {AUDIENCES.map(aud => (
                <button key={aud.id} onClick={() => setAudience(aud.id)}
                  className="p-4 rounded-2xl border text-left transition-all"
                  style={{ background: audience === aud.id ? T.accent + "15" : T.card, borderColor: audience === aud.id ? T.accent + "50" : T.border }}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-black" style={{ color: T.text }}>{aud.label}</div>
                    <div className="font-black text-sm" style={{ color: T.accent }}>{aud.size}</div>
                  </div>
                  <div className="text-xs" style={{ color: T.textSub }}>{aud.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3 — Telas */}
        {step === 3 && (
          <div>
            <h2 className="font-black text-2xl mb-1">Selecione tipos e regiões</h2>
            <p className="mb-6" style={{ color: T.textSub }}>Escolha ao menos 1 tipo de tela e 1 região.</p>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-xs font-black mb-3" style={{ color: T.textSub }}>TIPO DE TELA</div>
                <div className="space-y-2">
                  {SCREEN_TYPES.map(st => (
                    <button key={st.id} onClick={() => toggleScreenType(st.id)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl border transition-all"
                      style={{ background: screenTypes.includes(st.id) ? st.color + "15" : T.card, borderColor: screenTypes.includes(st.id) ? st.color + "50" : T.border }}>
                      <div className="w-5 h-5 rounded flex items-center justify-center border"
                        style={{ background: screenTypes.includes(st.id) ? st.color : "transparent", borderColor: screenTypes.includes(st.id) ? st.color : T.border }}>
                        {screenTypes.includes(st.id) && <Check size={10} style={{ color: "#000" }} />}
                      </div>
                      <span className="font-bold text-sm flex-1 text-left capitalize" style={{ color: T.text }}>{st.label}</span>
                      <span className="text-xs" style={{ color: T.textSub }}>{st.count} telas</span>
                      <span className="text-xs font-black" style={{ color: st.color }}>R${st.cpm} CPM</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs font-black mb-3" style={{ color: T.textSub }}>REGIÕES</div>
                <div className="space-y-2">
                  {REGIONS.map(r => (
                    <button key={r.id} onClick={() => toggleRegion(r.id)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl border transition-all"
                      style={{ background: regions.includes(r.id) ? T.primary + "15" : T.card, borderColor: regions.includes(r.id) ? T.primary + "50" : T.border }}>
                      <div className="w-5 h-5 rounded flex items-center justify-center border"
                        style={{ background: regions.includes(r.id) ? T.primary : "transparent", borderColor: regions.includes(r.id) ? T.primary : T.border }}>
                        {regions.includes(r.id) && <Check size={10} style={{ color: "#fff" }} />}
                      </div>
                      <MapPin size={13} style={{ color: regions.includes(r.id) ? T.primary : T.textSub }} />
                      <span className="font-bold text-sm flex-1 text-left" style={{ color: T.text }}>{r.label}</span>
                      <span className="text-xs" style={{ color: T.textSub }}>{r.screens} telas</span>
                    </button>
                  ))}
                </div>
                {screenTypes.length > 0 && (
                  <div className="mt-3 p-3 rounded-xl" style={{ background: T.primary + "10", border: `1px solid ${T.primary}25` }}>
                    <div className="text-xs font-black" style={{ color: T.textSub }}>Resumo de alcance</div>
                    <div className="font-black text-sm" style={{ color: T.primary }}>{selectedScreensCount} telas · CPM médio R${avgCpm}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4 — Criativo */}
        {step === 4 && (
          <div>
            <h2 className="font-black text-2xl mb-1">Configure o criativo</h2>
            <p className="mb-6" style={{ color: T.textSub }}>Nomeie e configure o formato do material publicitário.</p>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-black mb-2 block" style={{ color: T.textSub }}>NOME DO CRIATIVO</label>
                  <input value={creativeName} onChange={e => setCreativeName(e.target.value)}
                    placeholder="Ex: Video 15s Black Friday"
                    className="w-full px-3 py-2.5 rounded-xl text-sm"
                    style={{ background: T.panel, border: `1px solid ${T.border}`, color: T.text }} />
                </div>
                <div>
                  <label className="text-xs font-black mb-2 block" style={{ color: T.textSub }}>FORMATO</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["16:9","9:16","1:1","4:3","21:9"].map(f => (
                      <button key={f} onClick={() => setCreativeFormat(f)}
                        className="py-2 rounded-xl text-xs font-black transition-all"
                        style={{ background: creativeFormat === f ? T.accent + "25" : T.panel, color: creativeFormat === f ? T.accent : T.textSub, border: `1px solid ${creativeFormat === f ? T.accent + "50" : T.border}` }}>
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-black mb-2 block" style={{ color: T.textSub }}>DURAÇÃO (SEGUNDOS)</label>
                  <div className="flex gap-2">
                    {[5,10,15,20,30].map(d => (
                      <button key={d} className="flex-1 py-2 rounded-xl text-xs font-black"
                        style={{ background: T.panel, color: T.textSub, border: `1px solid ${T.border}` }}>
                        {d}s
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="p-6 rounded-2xl border flex flex-col items-center justify-center gap-3 w-full"
                  style={{ background: T.panel, borderColor: T.border, aspectRatio: creativeFormat === "9:16" ? "9/16" : creativeFormat === "1:1" ? "1/1" : "16/9", maxHeight: "260px" }}>
                  <Image size={32} style={{ color: T.textSub }} />
                  <div className="text-xs text-center" style={{ color: T.textSub }}>
                    Preview · {creativeFormat}<br />
                    {creativeName || "Sem nome"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5 — Budget */}
        {step === 5 && (
          <div>
            <h2 className="font-black text-2xl mb-1">Budget e datas</h2>
            <p className="mb-6" style={{ color: T.textSub }}>Defina o investimento e período da campanha.</p>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-black mb-2 block" style={{ color: T.textSub }}>NOME DA CAMPANHA</label>
                  <input value={campaignName} onChange={e => setCampaignName(e.target.value)}
                    placeholder="Ex: Black Friday 2025 — Ambev"
                    className="w-full px-3 py-2.5 rounded-xl text-sm"
                    style={{ background: T.panel, border: `1px solid ${T.border}`, color: T.text }} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-black mb-2 block" style={{ color: T.textSub }}>INÍCIO</label>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl text-sm"
                      style={{ background: T.panel, border: `1px solid ${T.border}`, color: T.text }} />
                  </div>
                  <div>
                    <label className="text-xs font-black mb-2 block" style={{ color: T.textSub }}>FIM</label>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl text-sm"
                      style={{ background: T.panel, border: `1px solid ${T.border}`, color: T.text }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-black" style={{ color: T.textSub }}>BUDGET TOTAL</label>
                    <span className="font-black text-lg" style={{ color: T.gold }}>R${budget.toLocaleString("pt-BR")}</span>
                  </div>
                  <input type="range" min="1000" max="500000" step="1000" value={budget} onChange={e => setBudget(parseInt(e.target.value))}
                    className="w-full" style={{ accentColor: T.gold }} />
                  <div className="flex justify-between text-xs mt-1" style={{ color: T.textSub }}>
                    <span>R$1k</span><span>R$500k</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="text-xs font-black mb-1" style={{ color: T.textSub }}>PROJEÇÃO</div>
                {[
                  { label: "Budget",           value: `R$${budget.toLocaleString("pt-BR")}`,   color: T.gold    },
                  { label: "CPM médio",        value: avgCpm > 0 ? `R$${avgCpm}` : "–",         color: T.primary },
                  { label: "Impressões proj.", value: projImp > 0 ? projImp >= 1000000 ? `${(projImp/1000000).toFixed(1)}M` : `${(projImp/1000).toFixed(0)}k` : "–", color: T.success },
                  { label: "Telas",            value: selectedScreensCount > 0 ? selectedScreensCount.toString() : "–", color: T.accent  },
                  { label: "Objetivo",         value: objective || "–",                          color: T.textSub },
                  { label: "Audiência",        value: audience || "–",                           color: T.textSub },
                ].map((m, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b" style={{ borderColor: T.border }}>
                    <span className="text-sm" style={{ color: T.textSub }}>{m.label}</span>
                    <span className="font-black text-sm capitalize" style={{ color: m.color }}>{m.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t" style={{ borderColor: T.border }}>
          <button onClick={() => step > 1 ? setStep(s => s - 1) : onBack()}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold"
            style={{ background: T.panel, color: T.textSub, border: `1px solid ${T.border}` }}>
            <ArrowLeft size={14} /> {step === 1 ? "Cancelar" : "Voltar"}
          </button>
          <button
            onClick={() => step < 5 ? setStep(s => s + 1) : setSubmitted(true)}
            disabled={!canNext()}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black transition-all"
            style={{
              background: canNext() ? T.primary : T.border,
              color: canNext() ? "#fff" : T.textSub,
              cursor: canNext() ? "pointer" : "not-allowed",
            }}>
            {step === 5 ? "Lançar Campanha" : "Próximo"}
            {step < 5 ? <ArrowRight size={14} /> : <Zap size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
}
