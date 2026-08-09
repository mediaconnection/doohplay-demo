import { useState } from "react";
import { ArrowLeft, ArrowRight, Target, DollarSign, MapPin, Calendar, Upload, Play, CheckCircle, Tv, Users, BarChart2, Zap, Shield, Image, Video, RefreshCw, Plus, X } from "lucide-react";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280",
};

const SEGMENTS = [
  { id: "barbearia", label: "Barbearia / Salão", icon: "💈", screens: 48, cpm: 42 },
  { id: "restaurante", label: "Restaurante", icon: "🍽️", screens: 127, cpm: 38 },
  { id: "farmacia", label: "Farmácia / Clínica", icon: "💊", screens: 63, cpm: 45 },
  { id: "academia", label: "Academia", icon: "🏋️", screens: 34, cpm: 40 },
  { id: "comercio", label: "Comércio em geral", icon: "🏪", screens: 215, cpm: 35 },
  { id: "todos", label: "Todos os segmentos", icon: "🌐", screens: 487, cpm: 38 },
];

const STATES = [
  { id: "sp", label: "São Paulo", screens: 198 },
  { id: "rj", label: "Rio de Janeiro", screens: 87 },
  { id: "pr", label: "Paraná", screens: 62 },
  { id: "mg", label: "Minas Gerais", screens: 54 },
  { id: "rs", label: "Rio Grande do Sul", screens: 48 },
  { id: "sc", label: "Santa Catarina", screens: 38 },
];

const FORMATS = [
  { id: "image", label: "Imagem estática", icon: Image, duration: 15, desc: "JPG/PNG · 1920×1080" },
  { id: "video", label: "Vídeo", icon: Video, duration: 30, desc: "MP4 · até 50MB" },
  { id: "generated", label: "Criar com IA", icon: Zap, duration: 15, desc: "Gera automaticamente com Gemini" },
];

type Step = "objective" | "audience" | "budget" | "creative" | "review" | "done";

interface Props { onBack: () => void; }

export default function CampaignCreator({ onBack }: Props) {
  const [step, setStep] = useState<Step>("objective");
  const [name, setName] = useState("");
  const [objective, setObjective] = useState<string | null>(null);
  const [segments, setSegments] = useState<string[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [budget, setBudget] = useState(500);
  const [duration, setDuration] = useState(14);
  const [format, setFormat] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiPreview, setAiPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [campaignId] = useState(() => "CAM-" + Math.random().toString(36).slice(2, 8).toUpperCase());

  const STEPS: { id: Step; label: string }[] = [
    { id: "objective", label: "Objetivo" },
    { id: "audience", label: "Audiência" },
    { id: "budget", label: "Budget" },
    { id: "creative", label: "Criativo" },
    { id: "review", label: "Revisão" },
    { id: "done", label: "Ativo!" },
  ];
  const stepIdx = STEPS.findIndex(s => s.id === step);

  const toggleSegment = (id: string) => {
    if (id === "todos") { setSegments(["todos"]); return; }
    setSegments(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev.filter(s => s !== "todos"), id]);
  };
  const toggleState = (id: string) => setStates(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);

  const selectedScreens = segments.length === 0 ? 0 :
    segments.includes("todos") ? 487 :
    segments.reduce((a, s) => a + (SEGMENTS.find(sg => sg.id === s)?.screens ?? 0), 0);

  const avgCpm = segments.length === 0 ? 38 :
    segments.includes("todos") ? 38 :
    Math.round(segments.reduce((a, s) => a + (SEGMENTS.find(sg => sg.id === s)?.cpm ?? 38), 0) / segments.length);

  const estimatedImpressions = Math.round((budget / avgCpm) * 1000);
  const dailyBudget = Math.round(budget / duration);

  const handleAiGenerate = () => {
    setAiGenerating(true);
    setTimeout(() => {
      setAiGenerating(false);
      setAiPreview("photo-1542038374803-82bffca72ad2");
    }, 2400);
  };

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => { setSubmitting(false); setStep("done"); }, 1800);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
            <ArrowLeft size={18} style={{ color: T.textSub }} />
          </button>
          <div>
            <h1 className="font-black">Nova Campanha</h1>
            <p className="text-xs" style={{ color: T.textSub }}>Anuncie em telas DOOHPLAY por todo o Brasil</p>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-6 pb-4">
          <div className="flex items-center gap-1">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex-1">
                <div className="h-1.5 rounded-full mb-1 transition-all" style={{ background: i <= stepIdx ? T.primary : T.border }} />
                <div className="text-xs text-center hidden sm:block" style={{ color: i === stepIdx ? T.primary : i < stepIdx ? T.success : T.textSub }}>
                  {i < stepIdx ? "✓" : s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-2xl mx-auto w-full px-6 py-8">

        {/* STEP: OBJECTIVE */}
        {step === "objective" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black mb-2">Qual é o objetivo da campanha?</h2>
              <p style={{ color: T.textSub }}>Escolha o objetivo e dê um nome para identificar sua campanha.</p>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {[
                { id: "awareness", label: "Reconhecimento de marca", desc: "Maximize o alcance e visibilidade da sua marca.", icon: "👁️", color: T.primary },
                { id: "traffic", label: "Gerar tráfego / visitas", desc: "Leve pessoas ao seu estabelecimento ou site.", icon: "📍", color: T.accent },
                { id: "promo", label: "Promoção / oferta", desc: "Divulgue preços, descontos e ofertas especiais.", icon: "🏷️", color: T.warning },
                { id: "launch", label: "Lançamento de produto", desc: "Apresente novos produtos ou serviços.", icon: "🚀", color: T.success },
              ].map(o => (
                <button key={o.id} onClick={() => setObjective(o.id)}
                  className="flex items-center gap-4 p-5 rounded-2xl border text-left transition-all"
                  style={{ background: objective === o.id ? o.color + "12" : T.card, borderColor: objective === o.id ? o.color : T.border }}>
                  <span className="text-3xl">{o.icon}</span>
                  <div>
                    <div className="font-bold">{o.label}</div>
                    <div className="text-sm" style={{ color: T.textSub }}>{o.desc}</div>
                  </div>
                  {objective === o.id && <CheckCircle size={18} className="ml-auto flex-shrink-0" style={{ color: o.color }} />}
                </button>
              ))}
            </div>
            <div>
              <label className="text-sm font-medium block mb-2" style={{ color: T.textSub }}>Nome da campanha</label>
              <input value={name} onChange={e => setName(e.target.value)}
                placeholder="Ex: Promoção de Julho 2026"
                className="w-full px-4 py-3 rounded-xl border outline-none text-sm"
                style={{ background: T.card, borderColor: T.border, color: T.text }} />
            </div>
            <button onClick={() => objective && name.trim() && setStep("audience")}
              disabled={!objective || !name.trim()}
              className="w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-30 transition-all hover:opacity-90"
              style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`, color: "#fff" }}>
              Continuar <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* STEP: AUDIENCE */}
        {step === "audience" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black mb-2">Onde e para quem?</h2>
              <p style={{ color: T.textSub }}>Selecione os segmentos e estados onde sua campanha vai aparecer.</p>
            </div>

            <div>
              <div className="font-medium text-sm mb-3">Segmento de estabelecimento</div>
              <div className="grid grid-cols-2 gap-2">
                {SEGMENTS.map(s => (
                  <button key={s.id} onClick={() => toggleSegment(s.id)}
                    className="flex items-center gap-2 p-3 rounded-xl border text-left text-sm transition-all"
                    style={{ background: segments.includes(s.id) ? T.primary + "15" : T.card, borderColor: segments.includes(s.id) ? T.primary : T.border }}>
                    <span>{s.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{s.label}</div>
                      <div className="text-xs" style={{ color: T.textSub }}>{s.screens} telas</div>
                    </div>
                    {segments.includes(s.id) && <CheckCircle size={13} style={{ color: T.primary, flexShrink: 0 }} />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="font-medium text-sm mb-3">Estado <span className="font-normal" style={{ color: T.textSub }}>(opcional — deixe em branco para todo o Brasil)</span></div>
              <div className="grid grid-cols-3 gap-2">
                {STATES.map(s => (
                  <button key={s.id} onClick={() => toggleState(s.id)}
                    className="flex flex-col items-center p-3 rounded-xl border text-xs transition-all"
                    style={{ background: states.includes(s.id) ? T.accent + "15" : T.card, borderColor: states.includes(s.id) ? T.accent : T.border, color: states.includes(s.id) ? T.accent : T.textSub }}>
                    <MapPin size={14} className="mb-1" />
                    <span className="font-medium">{s.label}</span>
                    <span>{s.screens} telas</span>
                  </button>
                ))}
              </div>
            </div>

            {segments.length > 0 && (
              <div className="rounded-xl border p-4 flex items-center gap-4" style={{ background: T.success + "08", borderColor: T.success + "25" }}>
                <Tv size={18} style={{ color: T.success }} />
                <div>
                  <div className="font-bold">{selectedScreens} telas disponíveis</div>
                  <div className="text-xs" style={{ color: T.textSub }}>CPM médio R${avgCpm}.00 · Brasil</div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setStep("objective")} className="px-6 py-4 rounded-2xl border font-bold" style={{ borderColor: T.border, color: T.textSub }}>Voltar</button>
              <button onClick={() => segments.length > 0 && setStep("budget")} disabled={segments.length === 0}
                className="flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-30"
                style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`, color: "#fff" }}>
                Continuar <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP: BUDGET */}
        {step === "budget" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black mb-2">Defina o orçamento</h2>
              <p style={{ color: T.textSub }}>Mínimo R$300. Você só paga pelas impressões verificadas com ProofChain.</p>
            </div>

            <div className="rounded-2xl border p-6 text-center" style={{ background: T.card, borderColor: T.border }}>
              <div className="text-xs mb-2" style={{ color: T.textSub }}>Orçamento total</div>
              <div className="text-5xl font-black mb-1" style={{ color: T.primary }}>R${budget}</div>
              <input type="range" min={300} max={20000} step={100} value={budget} onChange={e => setBudget(Number(e.target.value))}
                className="w-full mt-4 accent-blue-500" />
              <div className="flex justify-between text-xs mt-1" style={{ color: T.textSub }}>
                <span>R$300</span><span>R$20.000</span>
              </div>
            </div>

            <div>
              <div className="font-medium text-sm mb-3">Duração da campanha</div>
              <div className="grid grid-cols-4 gap-2">
                {[7, 14, 30, 60].map(d => (
                  <button key={d} onClick={() => setDuration(d)}
                    className="py-3 rounded-xl border text-sm font-medium transition-all"
                    style={{ background: duration === d ? T.primary + "20" : T.card, borderColor: duration === d ? T.primary : T.border, color: duration === d ? T.primary : T.textSub }}>
                    {d} dias
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Impressões est.", value: estimatedImpressions.toLocaleString("pt-BR"), color: T.primary },
                { label: "Budget/dia", value: `R$${dailyBudget}`, color: T.accent },
                { label: "CPM", value: `R$${avgCpm},00`, color: T.success },
              ].map((s, i) => (
                <div key={i} className="rounded-xl border p-4 text-center" style={{ background: T.card, borderColor: T.border }}>
                  <div className="text-xs mb-1" style={{ color: T.textSub }}>{s.label}</div>
                  <div className="text-xl font-black" style={{ color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>

            <div className="rounded-xl border p-4 flex items-start gap-3" style={{ background: T.panel, borderColor: T.border }}>
              <Shield size={16} style={{ color: T.success, flexShrink: 0, marginTop: 2 }} />
              <div className="text-sm" style={{ color: T.textSub }}>
                <span className="font-medium text-white">Pagamento por resultado.</span>{" "}
                Você paga apenas por exibições verificadas com prova criptográfica via ProofChain. Zero desperdício.
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep("audience")} className="px-6 py-4 rounded-2xl border font-bold" style={{ borderColor: T.border, color: T.textSub }}>Voltar</button>
              <button onClick={() => setStep("creative")}
                className="flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-2"
                style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`, color: "#fff" }}>
                Continuar <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP: CREATIVE */}
        {step === "creative" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black mb-2">Criativo da campanha</h2>
              <p style={{ color: T.textSub }}>Escolha como criar a peça publicitária para as telas.</p>
            </div>

            <div className="space-y-3">
              {FORMATS.map(f => {
                const Icon = f.icon;
                return (
                  <button key={f.id} onClick={() => setFormat(f.id)}
                    className="w-full flex items-center gap-4 p-5 rounded-2xl border text-left transition-all"
                    style={{ background: format === f.id ? T.primary + "12" : T.card, borderColor: format === f.id ? T.primary : T.border }}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: T.primary + "20" }}>
                      <Icon size={22} style={{ color: T.primary }} />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold">{f.label}</div>
                      <div className="text-sm" style={{ color: T.textSub }}>{f.desc} · {f.duration}s</div>
                    </div>
                    {format === f.id && <CheckCircle size={18} style={{ color: T.primary, flexShrink: 0 }} />}
                  </button>
                );
              })}
            </div>

            {format === "generated" && (
              <div className="rounded-2xl border p-5" style={{ background: T.card, borderColor: T.accent + "30" }}>
                <div className="flex items-center gap-2 mb-3">
                  <Zap size={16} style={{ color: T.accent }} />
                  <span className="font-bold text-sm">Geração com IA</span>
                </div>
                <textarea value={aiPrompt} onChange={e => setAiPrompt(e.target.value)}
                  placeholder="Descreva sua peça: produto, promoção, cores, tom..."
                  rows={3}
                  className="w-full rounded-xl border p-3 text-sm resize-none outline-none mb-3"
                  style={{ background: T.panel, borderColor: T.border, color: T.text }} />
                <div className="flex flex-wrap gap-2 mb-3">
                  {["Promoção de verão", "Black Friday", "Lançamento exclusivo", "Oferta especial"].map(s => (
                    <button key={s} onClick={() => setAiPrompt(s)}
                      className="px-2 py-1 rounded-lg text-xs"
                      style={{ background: T.panel, color: T.textSub, border: `1px solid ${T.border}` }}>
                      {s}
                    </button>
                  ))}
                </div>
                <button onClick={handleAiGenerate} disabled={aiGenerating || !aiPrompt.trim()}
                  className="w-full py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-40"
                  style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`, color: "#fff" }}>
                  {aiGenerating ? <><RefreshCw size={13} className="animate-spin" /> Gerando...</> : <><Zap size={13} /> Gerar peça com IA</>}
                </button>
                {aiPreview && !aiGenerating && (
                  <div className="mt-3 rounded-xl overflow-hidden">
                    <img src={`https://images.unsplash.com/${aiPreview}?w=480&h=270&fit=crop&auto=format`} alt="preview" className="w-full rounded-xl" />
                    <div className="text-xs mt-2 text-center" style={{ color: T.success }}>✓ Peça gerada · pronta para uso</div>
                  </div>
                )}
              </div>
            )}

            {format === "upload" || format === "image" || format === "video" ? (
              <div className="border-2 border-dashed rounded-2xl p-8 flex flex-col items-center gap-3 cursor-pointer hover:border-opacity-60 transition-all"
                style={{ borderColor: T.primary + "50" }}>
                <Upload size={32} style={{ color: T.primary }} />
                <div className="text-center">
                  <div className="font-medium">Arraste ou clique para enviar</div>
                  <div className="text-sm mt-1" style={{ color: T.textSub }}>
                    {format === "video" ? "MP4 · até 50MB · 1920×1080" : "JPG/PNG · até 10MB · 1920×1080"}
                  </div>
                </div>
              </div>
            ) : null}

            <div className="flex gap-3">
              <button onClick={() => setStep("budget")} className="px-6 py-4 rounded-2xl border font-bold" style={{ borderColor: T.border, color: T.textSub }}>Voltar</button>
              <button onClick={() => format && setStep("review")} disabled={!format}
                className="flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-30"
                style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`, color: "#fff" }}>
                Revisar campanha <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP: REVIEW */}
        {step === "review" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black mb-2">Revisão final</h2>
              <p style={{ color: T.textSub }}>Confirme os detalhes antes de ativar sua campanha.</p>
            </div>

            <div className="rounded-2xl border overflow-hidden" style={{ background: T.card, borderColor: T.border }}>
              {[
                { label: "Nome", value: name, icon: Target },
                { label: "Objetivo", value: { awareness: "Reconhecimento", traffic: "Tráfego", promo: "Promoção", launch: "Lançamento" }[objective ?? ""] ?? "—", icon: BarChart2 },
                { label: "Telas", value: `${selectedScreens} telas · ${segments.map(s => SEGMENTS.find(sg => sg.id === s)?.label ?? s).join(", ")}`, icon: Tv },
                { label: "Orçamento", value: `R$${budget} · ${duration} dias · R$${dailyBudget}/dia`, icon: DollarSign },
                { label: "Impressões est.", value: estimatedImpressions.toLocaleString("pt-BR"), icon: Users },
                { label: "Formato", value: FORMATS.find(f => f.id === format)?.label ?? "—", icon: Image },
                { label: "ProofChain", value: "Ativo — prova criptográfica de cada exibição", icon: Shield },
              ].map((r, i) => {
                const Icon = r.icon;
                return (
                  <div key={i} className="flex items-start gap-3 p-4 border-b last:border-0" style={{ borderColor: T.border }}>
                    <Icon size={15} style={{ color: T.primary, flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <div className="text-xs mb-0.5" style={{ color: T.textSub }}>{r.label}</div>
                      <div className="text-sm font-medium">{r.value}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="rounded-xl border p-4" style={{ background: T.warning + "08", borderColor: T.warning + "25" }}>
              <div className="text-sm font-medium mb-1" style={{ color: T.warning }}>Cobrança</div>
              <p className="text-xs" style={{ color: T.textSub }}>
                Você será cobrado R${budget} no cartão cadastrado. O valor é debitado conforme as impressões são entregues e verificadas. Não há cobrança por impressões não exibidas.
              </p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep("creative")} className="px-6 py-4 rounded-2xl border font-bold" style={{ borderColor: T.border, color: T.textSub }}>Voltar</button>
              <button onClick={handleSubmit} disabled={submitting}
                className="flex-1 py-4 rounded-2xl font-black flex items-center justify-center gap-2 disabled:opacity-60 transition-all hover:opacity-90"
                style={{ background: `linear-gradient(135deg, ${T.success}, #00B86B)`, color: "#fff" }}>
                {submitting ? <><RefreshCw size={18} className="animate-spin" /> Ativando...</> : <><Zap size={18} /> Ativar campanha</>}
              </button>
            </div>
          </div>
        )}

        {/* STEP: DONE */}
        {step === "done" && (
          <div className="space-y-8 text-center py-4">
            <div>
              <div className="text-7xl mb-4">🎯</div>
              <h2 className="text-4xl font-black mb-3" style={{ color: T.success }}>Campanha ativa!</h2>
              <p className="text-lg" style={{ color: T.textSub }}>
                <strong className="text-white">{name}</strong> está rodando em {selectedScreens} telas agora mesmo.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-left">
              {[
                { label: "ID da campanha", value: campaignId, color: T.primary },
                { label: "Telas ativas", value: selectedScreens, color: T.accent },
                { label: "Impressões/dia est.", value: Math.round(estimatedImpressions / duration).toLocaleString("pt-BR"), color: T.warning },
                { label: "ProofChain", value: "Ativo · 100/100", color: T.success },
              ].map((s, i) => (
                <div key={i} className="rounded-xl border p-4" style={{ background: T.card, borderColor: T.border }}>
                  <div className="text-xs mb-1" style={{ color: T.textSub }}>{s.label}</div>
                  <div className="font-black text-lg" style={{ color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>

            <div className="rounded-xl border p-4 flex items-center gap-3" style={{ background: T.success + "08", borderColor: T.success + "25" }}>
              <Shield size={16} style={{ color: T.success }} />
              <div className="text-sm text-left">
                <span className="font-medium">Proof-of-Play ativo.</span>{" "}
                <span style={{ color: T.textSub }}>Cada exibição gera prova criptográfica auditável em blockchain. Acesse o relatório a qualquer momento.</span>
              </div>
            </div>

            <div className="space-y-3">
              <button onClick={onBack}
                className="w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90"
                style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`, color: "#fff" }}>
                <BarChart2 size={18} /> Ver painel de campanhas
              </button>
              <button onClick={onBack} className="w-full py-3 text-sm" style={{ color: T.textSub }}>Voltar ao início</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
