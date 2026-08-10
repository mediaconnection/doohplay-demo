import { useState } from "react";
import { ArrowLeft, ArrowRight, MapPin, Eye, DollarSign, Star, Shield, Target, Upload, CreditCard, CheckCircle, Zap, Users, Clock, BarChart2, ChevronRight, Play, Search, Filter } from "lucide-react";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

type Step = "objective" | "screens" | "creative" | "budget" | "review" | "live";

interface ScreenOption {
  id: string;
  name: string;
  location: string;
  type: string;
  impressions: number;
  cpm: number;
  rating: number;
  proofChain: boolean;
  photo: string;
  tags: string[];
}

const AVAILABLE_SCREENS: ScreenOption[] = [
  { id: "s1", name: "Barbearia Zimerman",  location: "Pinheiros, SP",   type: "Barbearia", impressions: 480, cpm: 42, rating: 4.9, proofChain: true,  photo: "photo-1503951914875-452162b0f3f1", tags: ["Masculino 25-45", "Classe B"] },
  { id: "s2", name: "Academia FitSpace",   location: "Itaim Bibi, SP",  type: "Academia",  impressions: 820, cpm: 55, rating: 4.8, proofChain: true,  photo: "photo-1534438327276-14e5300c3a48", tags: ["Fitness", "18-40 anos"] },
  { id: "s3", name: "Restaurante Sabor",   location: "Vila Madalena, SP",type: "Restaurante",impressions: 620, cpm: 38, rating: 4.6, proofChain: false, photo: "photo-1414235077428-338989a2e8c0", tags: ["Gastronomia", "18-55"] },
  { id: "s4", name: "Clínica Estética",    location: "Moema, SP",       type: "Clínica",   impressions: 340, cpm: 61, rating: 5.0, proofChain: true,  photo: "photo-1519494026892-80bbd2d6fd0d", tags: ["Feminino 28-50", "Alta renda"] },
  { id: "s5", name: "Padaria Artesanal",   location: "Perdizes, SP",    type: "Padaria",   impressions: 710, cpm: 31, rating: 4.7, proofChain: false, photo: "photo-1509440159596-0249088772ff", tags: ["Família", "Manhã 6-11h"] },
  { id: "s6", name: "Salão Glamour",       location: "Jardins, SP",     type: "Salão",     impressions: 390, cpm: 48, rating: 4.8, proofChain: true,  photo: "photo-1560066984-138dadb4c035", tags: ["Feminino 25-55", "Luxo"] },
];

const OBJECTIVES = [
  { id: "awareness", label: "Reconhecimento de Marca", icon: "👁", desc: "Maximize impressões e alcance" },
  { id: "traffic",   label: "Tráfego para Loja",       icon: "📍", desc: "Atraia clientes físicos" },
  { id: "sales",     label: "Impulsionar Vendas",       icon: "💰", desc: "CPM premium com alta conversão" },
  { id: "launch",    label: "Lançamento de Produto",    icon: "🚀", desc: "Máxima exposição no lançamento" },
];

const DURATIONS = [
  { days: 7,  label: "7 dias",  discount: 0 },
  { days: 14, label: "14 dias", discount: 5 },
  { days: 30, label: "30 dias", discount: 12 },
  { days: 60, label: "60 dias", discount: 20 },
];

interface Props {
  onBack: () => void;
  onNavigate?: (view: string) => void;
}

const STEPS: Step[] = ["objective", "screens", "creative", "budget", "review", "live"];
const STEP_LABELS = ["Objetivo", "Telas", "Criativo", "Orçamento", "Revisão", ""];

export default function AdvertiserSelfServe({ onBack, onNavigate }: Props) {
  const [step, setStep] = useState<Step>("objective");
  const [objective, setObjective] = useState("awareness");
  const [selectedScreens, setSelectedScreens] = useState<Set<string>>(new Set(["s1", "s2"]));
  const [creativeName, setCreativeName] = useState("");
  const [creativeType, setCreativeType] = useState<"upload" | "ai">("upload");
  const [budget, setBudget] = useState(800);
  const [duration, setDuration] = useState(14);
  const [companyName, setCompanyName] = useState("Nike Brasil");
  const [searchScreens, setSearchScreens] = useState("");

  const stepIdx = STEPS.indexOf(step);
  const next = () => setStep(STEPS[Math.min(stepIdx + 1, STEPS.length - 1)]);
  const back = () => stepIdx > 0 ? setStep(STEPS[stepIdx - 1]) : onBack();

  const toggleScreen = (id: string) => {
    setSelectedScreens(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  const selScreens = AVAILABLE_SCREENS.filter(s => selectedScreens.has(s.id));
  const totalImpressions = selScreens.reduce((a, s) => a + s.impressions, 0) * duration;
  const avgCpm = selScreens.length ? Math.round(selScreens.reduce((a, s) => a + s.cpm, 0) / selScreens.length) : 0;
  const disc = DURATIONS.find(d => d.days === duration)?.discount ?? 0;
  const totalCost = Math.round(budget * (1 - disc / 100));

  const filteredScreens = AVAILABLE_SCREENS.filter(s =>
    !searchScreens || s.name.toLowerCase().includes(searchScreens.toLowerCase()) ||
    s.location.toLowerCase().includes(searchScreens.toLowerCase()) ||
    s.tags.some(t => t.toLowerCase().includes(searchScreens.toLowerCase()))
  );

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={back} className="p-2 rounded-lg hover:bg-white/5"><ArrowLeft size={18} style={{ color: T.textSub }} /></button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.accent + "20" }}>
              <Target size={18} style={{ color: T.accent }} />
            </div>
            <div>
              <h1 className="font-black text-lg">Criar Campanha</h1>
              <p className="text-xs" style={{ color: T.textSub }}>{companyName || "Anunciante"}</p>
            </div>
          </div>
        </div>
        {step !== "live" && (
          <div className="max-w-xl mx-auto px-6 pb-4">
            <div className="flex items-center gap-1">
              {STEPS.slice(0, -1).map((s, i) => (
                <div key={s} className="flex items-center gap-1 flex-1 last:flex-none">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                    style={{
                      background: i < stepIdx ? T.success : i === stepIdx ? T.primary : T.border,
                      color: i <= stepIdx ? "#fff" : T.textSub,
                    }}>
                    {i < stepIdx ? "✓" : i + 1}
                  </div>
                  {i < STEPS.length - 2 && (
                    <div className="h-0.5 flex-1" style={{ background: i < stepIdx ? T.success : T.border }} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-1">
              {STEP_LABELS.slice(0, -1).map((l, i) => (
                <span key={i} className="text-xs" style={{ color: i === stepIdx ? T.primary : T.textSub }}>{l}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="max-w-xl mx-auto px-6 py-8">
        {step === "objective" && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-black mb-1">Qual o objetivo?</h2>
              <p style={{ color: T.textSub }}>Otimizaremos sua campanha com base na sua meta.</p>
            </div>
            <div>
              <label className="block text-sm mb-1.5" style={{ color: T.textSub }}>Empresa / Marca</label>
              <input value={companyName} onChange={e => setCompanyName(e.target.value)}
                placeholder="Nome da empresa"
                className="w-full px-4 py-3 rounded-xl text-sm"
                style={{ background: T.card, border: `1.5px solid ${T.border}`, color: T.text, outline: "none" }} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {OBJECTIVES.map(obj => (
                <button key={obj.id} onClick={() => setObjective(obj.id)}
                  className="p-4 rounded-2xl border text-left transition-all"
                  style={{
                    background: objective === obj.id ? T.primary + "15" : T.card,
                    borderColor: objective === obj.id ? T.primary : T.border,
                  }}>
                  <div className="text-2xl mb-2">{obj.icon}</div>
                  <div className="font-bold text-sm mb-1">{obj.label}</div>
                  <div className="text-xs" style={{ color: T.textSub }}>{obj.desc}</div>
                </button>
              ))}
            </div>
            <button onClick={next}
              className="w-full py-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 hover:opacity-90"
              style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`, color: "#fff" }}>
              Continuar <ArrowRight size={16} />
            </button>
          </div>
        )}

        {step === "screens" && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-black mb-1">Selecione as telas</h2>
              <p style={{ color: T.textSub }}>{selectedScreens.size} telas selecionadas · {totalImpressions.toLocaleString("pt-BR")} impressões/período</p>
            </div>
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: T.textSub }} />
              <input value={searchScreens} onChange={e => setSearchScreens(e.target.value)}
                placeholder="Buscar por tipo, bairro, público..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm"
                style={{ background: T.card, border: `1.5px solid ${T.border}`, color: T.text, outline: "none" }} />
            </div>
            <div className="space-y-2">
              {filteredScreens.map(screen => {
                const isSel = selectedScreens.has(screen.id);
                return (
                  <button key={screen.id} onClick={() => toggleScreen(screen.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all"
                    style={{ background: isSel ? T.primary + "10" : T.card, borderColor: isSel ? T.primary : T.border }}>
                    <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                      <img src={`https://images.unsplash.com/${screen.photo}?w=100&h=100&fit=crop&auto=format`}
                        alt={screen.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="font-bold text-sm">{screen.name}</span>
                        {screen.proofChain && <Shield size={11} style={{ color: T.success }} />}
                      </div>
                      <div className="text-xs mb-1" style={{ color: T.textSub }}>
                        <MapPin size={10} className="inline" /> {screen.location} · CPM R${screen.cpm}
                      </div>
                      <div className="flex gap-1 flex-wrap">
                        {screen.tags.map((tag, i) => (
                          <span key={i} className="text-xs px-1.5 py-0.5 rounded-full"
                            style={{ background: T.primary + "10", color: T.primary }}>{tag}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center`}
                        style={{ borderColor: isSel ? T.primary : T.border, background: isSel ? T.primary : "transparent" }}>
                        {isSel && <CheckCircle size={14} color="#fff" fill="#fff" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <button onClick={next} disabled={selectedScreens.size === 0}
              className="w-full py-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-40"
              style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`, color: "#fff" }}>
              {selectedScreens.size} telas selecionadas · Continuar <ArrowRight size={16} />
            </button>
          </div>
        )}

        {step === "creative" && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-black mb-1">Adicionar criativo</h2>
              <p style={{ color: T.textSub }}>Envie uma peça pronta ou gere com IA em segundos.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {(["upload", "ai"] as const).map(t => (
                <button key={t} onClick={() => setCreativeType(t)}
                  className="p-4 rounded-2xl border text-center transition-all"
                  style={{ background: creativeType === t ? T.primary + "15" : T.card, borderColor: creativeType === t ? T.primary : T.border }}>
                  <div className="text-2xl mb-2">{t === "upload" ? "📁" : "🤖"}</div>
                  <div className="font-bold text-sm">{t === "upload" ? "Enviar arquivo" : "Gerar com IA"}</div>
                  <div className="text-xs mt-0.5" style={{ color: T.textSub }}>{t === "upload" ? "JPG, PNG, MP4" : "Gemini · 30s"}</div>
                </button>
              ))}
            </div>
            {creativeType === "upload" ? (
              <div className="border-2 border-dashed rounded-2xl p-10 text-center" style={{ borderColor: T.border }}>
                <Upload size={32} className="mx-auto mb-3" style={{ color: T.textSub }} />
                <p className="font-bold mb-1">Arraste seu arquivo aqui</p>
                <p className="text-sm" style={{ color: T.textSub }}>JPG, PNG ou MP4 · máx. 50MB · 1920×1080px recomendado</p>
                <button className="mt-4 px-4 py-2 rounded-xl text-sm font-bold hover:opacity-90" style={{ background: T.primary, color: "#fff" }}>
                  Escolher arquivo
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm mb-1.5" style={{ color: T.textSub }}>Descreva sua peça</label>
                  <textarea value={creativeName} onChange={e => setCreativeName(e.target.value)}
                    placeholder="ex: Anúncio de tênis para público masculino jovem. Visual esportivo, cores vibrantes, slogan 'Just Do It'"
                    rows={3} className="w-full px-4 py-3 rounded-xl text-sm resize-none"
                    style={{ background: T.card, border: `1.5px solid ${T.border}`, color: T.text, outline: "none" }} />
                </div>
                <div className="rounded-xl overflow-hidden border" style={{ borderColor: T.border }}>
                  <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=340&fit=crop&auto=format"
                    alt="AI preview" className="w-full h-40 object-cover" />
                  <div className="p-3 flex items-center justify-between" style={{ background: T.card }}>
                    <div>
                      <div className="font-bold text-sm">Prévia gerada pela IA</div>
                      <div className="text-xs" style={{ color: T.textSub }}>Powered by Gemini</div>
                    </div>
                    <button className="text-xs px-3 py-1.5 rounded-lg font-bold" style={{ background: T.gold + "15", color: T.gold }}>Regenerar</button>
                  </div>
                </div>
              </div>
            )}
            <button onClick={next}
              className="w-full py-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 hover:opacity-90"
              style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`, color: "#fff" }}>
              Continuar <ArrowRight size={16} />
            </button>
          </div>
        )}

        {step === "budget" && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-black mb-1">Orçamento & Duração</h2>
              <p style={{ color: T.textSub }}>Defina quanto investir e por quanto tempo.</p>
            </div>
            <div className="rounded-2xl border p-5" style={{ background: T.card, borderColor: T.border }}>
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold">Orçamento total</span>
                <span className="text-3xl font-black" style={{ color: T.primary }}>R${budget.toLocaleString("pt-BR")}</span>
              </div>
              <input type="range" min={300} max={20000} step={100} value={budget}
                onChange={e => setBudget(Number(e.target.value))}
                className="w-full accent-primary" style={{ accentColor: T.primary }} />
              <div className="flex justify-between text-xs mt-1" style={{ color: T.textSub }}>
                <span>R$300</span><span>R$20.000</span>
              </div>
              <div className="flex gap-2 mt-3">
                {[500, 1000, 2500, 5000].map(v => (
                  <button key={v} onClick={() => setBudget(v)}
                    className="flex-1 text-xs py-1.5 rounded-lg transition-all hover:opacity-80"
                    style={{ background: budget === v ? T.primary : T.panel, color: budget === v ? "#fff" : T.textSub }}>
                    R${v.toLocaleString("pt-BR")}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm mb-2" style={{ color: T.textSub }}>Duração</label>
              <div className="grid grid-cols-4 gap-2">
                {DURATIONS.map(d => (
                  <button key={d.days} onClick={() => setDuration(d.days)}
                    className="p-3 rounded-xl border text-center transition-all"
                    style={{ background: duration === d.days ? T.primary + "15" : T.card, borderColor: duration === d.days ? T.primary : T.border }}>
                    <div className="font-bold text-sm" style={{ color: duration === d.days ? T.primary : T.text }}>{d.label}</div>
                    {d.discount > 0 && (
                      <div className="text-xs mt-0.5" style={{ color: T.success }}>-{d.discount}%</div>
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border p-4" style={{ background: T.primary + "08", borderColor: T.primary + "20" }}>
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { label: "Impressões est.", value: totalImpressions.toLocaleString("pt-BR") },
                  { label: "CPM médio", value: `R$${avgCpm}` },
                  { label: "Custo final", value: `R$${totalCost.toLocaleString("pt-BR")}` },
                ].map((k, i) => (
                  <div key={i}>
                    <div className="font-black text-lg" style={{ color: T.primary }}>{k.value}</div>
                    <div className="text-xs" style={{ color: T.textSub }}>{k.label}</div>
                  </div>
                ))}
              </div>
              {disc > 0 && (
                <div className="mt-2 text-center text-xs" style={{ color: T.success }}>
                  🎁 Desconto de {disc}% aplicado pelo período de {duration} dias
                </div>
              )}
            </div>
            <button onClick={next}
              className="w-full py-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 hover:opacity-90"
              style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`, color: "#fff" }}>
              Revisar campanha <ArrowRight size={16} />
            </button>
          </div>
        )}

        {step === "review" && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-black mb-1">Revisão final</h2>
              <p style={{ color: T.textSub }}>Confirme os detalhes antes de lançar.</p>
            </div>
            {[
              { label: "Empresa",      value: companyName },
              { label: "Objetivo",     value: OBJECTIVES.find(o => o.id === objective)?.label ?? "" },
              { label: "Telas",        value: `${selectedScreens.size} telas selecionadas` },
              { label: "Criativo",     value: creativeType === "ai" ? "Gerado por IA (Gemini)" : "Arquivo enviado" },
              { label: "Orçamento",    value: `R$${totalCost.toLocaleString("pt-BR")}` },
              { label: "Duração",      value: `${duration} dias` },
              { label: "Impressões",   value: `~${totalImpressions.toLocaleString("pt-BR")} impressões` },
            ].map((row, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 border-b last:border-0" style={{ borderColor: T.border }}>
                <span className="text-sm" style={{ color: T.textSub }}>{row.label}</span>
                <span className="font-bold text-sm">{row.value}</span>
              </div>
            ))}
            <div className="rounded-2xl border p-4" style={{ background: T.card, borderColor: T.border }}>
              <div className="flex items-center gap-2 mb-3">
                <CreditCard size={16} style={{ color: T.primary }} />
                <span className="font-bold text-sm">Pagamento</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: T.panel }}>
                <div className="w-8 h-5 rounded flex items-center justify-center text-xs font-black" style={{ background: "#1A1F71", color: "#fff" }}>VISA</div>
                <span className="text-sm">•••• •••• •••• 4821</span>
                <span className="ml-auto text-xs" style={{ color: T.success }}>Principal</span>
              </div>
            </div>
            <div className="rounded-xl p-3 text-xs flex items-start gap-2" style={{ background: T.success + "08", color: T.textSub }}>
              <Shield size={13} style={{ color: T.success }} className="mt-0.5 flex-shrink-0" />
              ProofChain ativo: cada exibição gera prova criptográfica verificável publicamente em verify.doohplay.com.br
            </div>
            <button onClick={next}
              className="w-full py-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 hover:opacity-90"
              style={{ background: `linear-gradient(135deg, ${T.success}, ${T.success}CC)`, color: "#05060E" }}>
              Lançar campanha · R${totalCost.toLocaleString("pt-BR")} <ArrowRight size={16} />
            </button>
          </div>
        )}

        {step === "live" && (
          <div className="text-center py-8 space-y-6">
            <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto"
              style={{ background: `linear-gradient(135deg, ${T.success}30, ${T.primary}20)`, border: `2px solid ${T.success}40` }}>
              <div className="text-5xl">🚀</div>
            </div>
            <div>
              <h2 className="text-3xl font-black mb-2" style={{ color: T.success }}>Campanha no ar!</h2>
              <p style={{ color: T.textSub }}>
                Suas peças já estão sendo exibidas nas <strong className="text-white">{selectedScreens.size} telas</strong> selecionadas.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Impressões",   value: "0",           color: T.primary },
                { label: "Telas ativas", value: selectedScreens.size.toString(), color: T.success },
                { label: "CPM médio",    value: `R$${avgCpm}`, color: T.accent },
              ].map((k, i) => (
                <div key={i} className="rounded-xl border p-3 text-center" style={{ background: T.card, borderColor: T.border }}>
                  <div className="font-black text-xl" style={{ color: k.color }}>{k.value}</div>
                  <div className="text-xs" style={{ color: T.textSub }}>{k.label}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => onNavigate?.("analytics-dashboard")}
                className="flex-1 py-3 rounded-xl font-bold text-sm border hover:bg-white/5"
                style={{ borderColor: T.border, color: T.textSub }}>
                Ver Analytics
              </button>
              <button onClick={() => onNavigate?.("proof-verifier")}
                className="flex-1 py-3 rounded-xl font-bold text-sm hover:opacity-90"
                style={{ background: T.primary, color: "#fff" }}>
                Verificar Provas
              </button>
            </div>
            <button onClick={onBack} className="text-sm" style={{ color: T.textSub }}>Voltar ao painel</button>
          </div>
        )}
      </div>
    </div>
  );
}
