import { useState } from "react";
import { ArrowLeft, Sparkles, Brain, Copy, Download, RefreshCw, ChevronRight, Target, Clock, DollarSign, Monitor, Zap, CheckCircle, Edit3, Send } from "lucide-react";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

interface Props { onBack: () => void; onNavigate?: (v: string) => void; }

const SEGMENTS = ["Alimentação", "Fitness", "Farmácia", "Saúde", "Beleza", "Pet", "Varejo", "Educação", "Tecnologia", "Imóveis"];
const OBJECTIVES = ["Aumentar vendas", "Lançar produto", "Gerar leads", "Reforçar marca", "Evento especial", "Fidelizar clientes"];
const TONES = ["Urgente e promocional", "Aspiracional e premium", "Amigável e próximo", "Profissional e sério", "Divertido e criativo"];
const DURATIONS = ["7 dias", "14 dias", "30 dias", "60 dias", "90 dias"];
const BUDGETS = ["R$300–500", "R$500–1.000", "R$1.000–3.000", "R$3.000–10.000", "Acima de R$10.000"];

interface Brief {
  headline: string;
  subheadline: string;
  cta: string;
  hook: string;
  description: string;
  targeting: string;
  bestHours: string;
  estimatedCPM: string;
  estimatedImpressions: string;
  estimatedROI: string;
  keyMessages: string[];
  doList: string[];
  dontList: string[];
}

function generateBrief(segment: string, objective: string, tone: string, budget: string, duration: string, brand: string): Brief {
  const brandName = brand || "sua marca";

  const headlines: Record<string, Record<string, string>> = {
    "Alimentação": { "Aumentar vendas": `${brandName}: Sabor que você não esquece`, "Lançar produto": `Novo! ${brandName} chegou com tudo`, "Gerar leads": `Peça online, receba em 30min` },
    "Fitness": { "Aumentar vendas": `Transforme seu corpo. Comece hoje.`, "Lançar produto": `Novidade ${brandName}: Performance redefinida`, "Gerar leads": `Primeira semana grátis — Experimente` },
    "Farmácia": { "Aumentar vendas": `Saúde em primeiro lugar`, "Lançar produto": `Novo produto ${brandName} chegou`, "Gerar leads": `Consulte nosso farmacêutico` },
  };

  const defaultHeadline = headlines[segment]?.[objective] ?? `${brandName}: ${objective}`;
  const cpmMap: Record<string, number> = { "R$300–500": 32, "R$500–1.000": 38, "R$1.000–3.000": 42, "R$3.000–10.000": 48, "Acima de R$10.000": 58 };
  const cpm = cpmMap[budget] ?? 40;
  const budgetMid = { "R$300–500": 400, "R$500–1.000": 750, "R$1.000–3.000": 2000, "R$3.000–10.000": 6500, "Acima de R$10.000": 15000 }[budget] ?? 1000;
  const durationDays = parseInt(duration);
  const impressions = Math.round((budgetMid / cpm) * 1000);
  const roi = Math.round(((impressions * 0.02 * 18) / budgetMid) * 100);

  return {
    headline: defaultHeadline,
    subheadline: `A melhor experiência em ${segment.toLowerCase()} da região`,
    cta: objective.includes("vendas") ? "Aproveite agora!" : objective.includes("produto") ? "Conheça já!" : "Saiba mais",
    hook: `Você sabia que ${segment === "Fitness" ? "73% dos brasileiros querem começar a se exercitar em 2026" : segment === "Alimentação" ? "delivery cresce 35% ao ano no Brasil" : "clientes fiéis gastam 5× mais"}?`,
    description: `Campanha ${tone.toLowerCase()} para ${segment} com foco em ${objective.toLowerCase()}. Duração de ${duration} com veiculação nas telas DOOHPLAY, atingindo audiência qualificada em momento de alta receptividade.`,
    targeting: `${segment} · ${duration} · Horário de pico do segmento · CPM R$${cpm} · Telas premium`,
    bestHours: segment === "Alimentação" ? "11h–13h e 19h–21h" : segment === "Fitness" ? "6h–9h e 17h–20h" : "9h–12h e 14h–17h",
    estimatedCPM: `R$${cpm}`,
    estimatedImpressions: impressions.toLocaleString("pt-BR"),
    estimatedROI: `${roi}%`,
    keyMessages: [
      `Benefício principal de ${brandName || "sua oferta"}`,
      `Diferencial exclusivo vs. concorrência`,
      `Urgência ou escassez — "${tone.includes("Urgente") ? "Só hoje!" : "Vagas limitadas!"}"`,
      `Prova social — depoimento ou número de clientes`,
    ],
    doList: [
      "Use imagem de alta resolução (1920×1080 mín.)",
      "Textos curtos — máx. 6 palavras no headline",
      "Contraste alto: fundo escuro + texto claro",
      "Inclua logotipo visível no terço inferior",
      `CTA claro: "${tone.includes("Urgente") ? "COMPRE AGORA" : "SAIBA MAIS"}"`,
    ],
    dontList: [
      "Evite blocos de texto — tela é vista por 3s",
      "Não use cores similares ao fundo",
      "Sem QR code em tela vertical — difícil de escanear",
      "Não coloque mais de 2 informações principais",
    ],
  };
}

export default function CampaignBriefing({ onBack, onNavigate }: Props) {
  const [step, setStep]           = useState<"form" | "result">("form");
  const [generating, setGenerating] = useState(false);
  const [brief, setBrief]         = useState<Brief | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);

  // Form state
  const [brand, setBrand]         = useState("");
  const [segment, setSegment]     = useState("Alimentação");
  const [objective, setObjective] = useState("Aumentar vendas");
  const [tone, setTone]           = useState("Urgente e promocional");
  const [budget, setBudget]       = useState("R$1.000–3.000");
  const [duration, setDuration]   = useState("30 dias");
  const [extra, setExtra]         = useState("");

  const generate = () => {
    setGenerating(true);
    setTimeout(() => {
      setBrief(generateBrief(segment, objective, tone, budget, duration, brand));
      setGenerating(false);
      setStep("result");
    }, 1800);
  };

  const regenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setBrief(generateBrief(segment, objective, tone, budget, duration, brand));
      setGenerating(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={step === "result" ? () => setStep("form") : onBack} className="p-2 rounded-lg hover:bg-white/5">
              <ArrowLeft size={18} style={{ color: T.textSub }} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.accent + "20" }}>
                <Brain size={18} style={{ color: T.accent }} />
              </div>
              <div>
                <h1 className="font-black text-lg">Gerador de Brief IA</h1>
                <p className="text-xs" style={{ color: T.textSub }}>
                  {step === "form" ? "Preencha os dados da campanha" : "Brief gerado com sucesso"}
                </p>
              </div>
            </div>
          </div>
          {step === "result" && (
            <div className="flex items-center gap-2">
              <button onClick={regenerate} disabled={generating}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold"
                style={{ background: T.card, color: T.textSub, border: `1px solid ${T.border}` }}>
                <RefreshCw size={13} style={{ animation: generating ? "spin 0.8s linear infinite" : "none" }} />
                Regerar
              </button>
              <button className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold"
                style={{ background: T.success + "20", color: T.success, border: `1px solid ${T.success}30` }}>
                <Download size={13} /> Exportar PDF
              </button>
              <button onClick={() => onNavigate?.("campaign-planner")}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
                style={{ background: T.primary, color: "#fff" }}>
                <Send size={13} /> Criar Campanha
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-6">

        {/* FORM */}
        {step === "form" && (
          <div className="space-y-6">
            {/* Brand */}
            <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-bold text-sm mb-4">1. Sua marca / negócio</h3>
              <input value={brand} onChange={e => setBrand(e.target.value)}
                placeholder="Ex: Bar & Grill São Paulo, Academia FitLife..."
                className="w-full px-4 py-3 rounded-xl text-sm"
                style={{ background: T.panel, border: `1px solid ${T.border}`, color: T.text }} />
            </div>

            {/* Segment */}
            <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-bold text-sm mb-4">2. Segmento</h3>
              <div className="flex flex-wrap gap-2">
                {SEGMENTS.map(s => (
                  <button key={s} onClick={() => setSegment(s)}
                    className="px-3 py-2 rounded-xl text-sm font-bold transition-all"
                    style={{ background: segment === s ? T.primary + "25" : T.panel, color: segment === s ? T.primary : T.textSub, border: `1px solid ${segment === s ? T.primary + "40" : T.border}` }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Objective */}
            <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-bold text-sm mb-4">3. Objetivo principal</h3>
              <div className="grid grid-cols-2 gap-2">
                {OBJECTIVES.map(o => (
                  <button key={o} onClick={() => setObjective(o)}
                    className="py-3 px-4 rounded-xl text-sm font-bold text-left transition-all"
                    style={{ background: objective === o ? T.accent + "20" : T.panel, color: objective === o ? T.accent : T.textSub, border: `1px solid ${objective === o ? T.accent + "40" : T.border}` }}>
                    {o}
                  </button>
                ))}
              </div>
            </div>

            {/* Tone + Budget + Duration */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl border col-span-3" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-bold text-sm mb-4">4. Tom da comunicação</h3>
                <div className="flex flex-wrap gap-2">
                  {TONES.map(t => (
                    <button key={t} onClick={() => setTone(t)}
                      className="px-3 py-2 rounded-xl text-sm font-bold transition-all"
                      style={{ background: tone === t ? T.warning + "20" : T.panel, color: tone === t ? T.warning : T.textSub, border: `1px solid ${tone === t ? T.warning + "40" : T.border}` }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-bold text-sm mb-3">5. Orçamento</h3>
                <div className="space-y-1.5">
                  {BUDGETS.map(b => (
                    <button key={b} onClick={() => setBudget(b)}
                      className="w-full py-2 px-3 rounded-xl text-sm font-bold text-left transition-all"
                      style={{ background: budget === b ? T.gold + "20" : T.panel, color: budget === b ? T.gold : T.textSub, border: `1px solid ${budget === b ? T.gold + "30" : T.border}` }}>
                      {b}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-bold text-sm mb-3">6. Duração</h3>
                <div className="space-y-1.5">
                  {DURATIONS.map(d => (
                    <button key={d} onClick={() => setDuration(d)}
                      className="w-full py-2 px-3 rounded-xl text-sm font-bold text-left transition-all"
                      style={{ background: duration === d ? T.success + "20" : T.panel, color: duration === d ? T.success : T.textSub, border: `1px solid ${duration === d ? T.success + "30" : T.border}` }}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Extra */}
            <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-bold text-sm mb-3">7. Informações extras (opcional)</h3>
              <textarea value={extra} onChange={e => setExtra(e.target.value)}
                placeholder="Ex: Promoção válida só no fim de semana, produto novo com 30% OFF, evento no sábado às 20h..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl text-sm resize-none"
                style={{ background: T.panel, border: `1px solid ${T.border}`, color: T.text }} />
            </div>

            {/* Generate button */}
            <button onClick={generate}
              className="w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all hover:opacity-90"
              style={{ background: `linear-gradient(135deg, ${T.accent}, ${T.primary})`, color: "#fff" }}>
              <Sparkles size={22} />
              Gerar Brief com IA
              <ChevronRight size={20} />
            </button>
          </div>
        )}

        {/* GENERATING */}
        {generating && step === "form" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(2,3,14,0.85)" }}>
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: T.accent + "20", border: `1px solid ${T.accent}30` }}>
                <Brain size={28} style={{ color: T.accent, animation: "pulse 1s infinite" }} />
              </div>
              <div className="font-black text-xl mb-2">Gerando seu brief...</div>
              <div className="text-sm" style={{ color: T.textSub }}>Analisando segmento, tom e objetivo</div>
              <div className="flex items-center justify-center gap-1 mt-4">
                {[0,1,2].map(i => (
                  <div key={i} className="w-2 h-2 rounded-full" style={{ background: T.accent, animation: `bounce 0.6s ${i*0.2}s infinite` }} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* RESULT */}
        {step === "result" && brief && !generating && (
          <div className="space-y-5">
            {/* AI badge */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl w-fit" style={{ background: T.accent + "15", border: `1px solid ${T.accent}30` }}>
              <Sparkles size={14} style={{ color: T.accent }} />
              <span className="text-sm font-bold" style={{ color: T.accent }}>Brief gerado por IA — DOOHPLAY Gemini</span>
            </div>

            {/* Main copy */}
            <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.primary + "30" }}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold" style={{ color: T.textSub }}>COPY PRINCIPAL</span>
                <button className="p-1.5 rounded-lg hover:bg-white/5"><Copy size={13} style={{ color: T.textSub }} /></button>
              </div>
              <div className="font-black text-3xl mb-2 leading-tight" style={{ color: T.text }}>{brief.headline}</div>
              <div className="text-lg mb-3" style={{ color: T.textSub }}>{brief.subheadline}</div>
              <div className="inline-block px-6 py-2.5 rounded-xl font-black text-base"
                style={{ background: `linear-gradient(135deg,${T.primary},${T.accent})`, color: "#fff" }}>
                {brief.cta}
              </div>
            </div>

            {/* Hook */}
            <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <div className="text-xs font-bold mb-2" style={{ color: T.textSub }}>GANCHO DE ABERTURA</div>
              <p className="text-sm italic" style={{ color: T.textSub }}>"{ brief.hook}"</p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "CPM estimado", value: brief.estimatedCPM, icon: DollarSign, color: T.gold },
                { label: "Impressões", value: brief.estimatedImpressions, icon: Monitor, color: T.primary },
                { label: "ROI estimado", value: brief.estimatedROI, icon: Zap, color: T.success },
              ].map((m, i) => (
                <div key={i} className="p-4 rounded-2xl border text-center" style={{ background: T.card, borderColor: T.border }}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ background: m.color + "20" }}>
                    <m.icon size={15} style={{ color: m.color }} />
                  </div>
                  <div className="font-black text-xl" style={{ color: m.color }}>{m.value}</div>
                  <div className="text-xs mt-0.5" style={{ color: T.textSub }}>{m.label}</div>
                </div>
              ))}
            </div>

            {/* Targeting + schedule */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <div className="flex items-center gap-2 mb-2">
                  <Target size={14} style={{ color: T.accent }} />
                  <span className="text-xs font-bold" style={{ color: T.textSub }}>SEGMENTAÇÃO</span>
                </div>
                <p className="text-sm">{brief.targeting}</p>
              </div>
              <div className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={14} style={{ color: T.gold }} />
                  <span className="text-xs font-bold" style={{ color: T.textSub }}>MELHORES HORÁRIOS</span>
                </div>
                <p className="text-sm font-bold" style={{ color: T.gold }}>{brief.bestHours}</p>
              </div>
            </div>

            {/* Key messages */}
            <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <div className="text-xs font-bold mb-3" style={{ color: T.textSub }}>MENSAGENS-CHAVE</div>
              <div className="space-y-2">
                {brief.keyMessages.map((m, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs mt-0.5"
                      style={{ background: T.primary + "25", color: T.primary }}>{i + 1}</div>
                    <span className="text-sm">{m}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Do / Don't */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.success + "20" }}>
                <div className="text-xs font-bold mb-3" style={{ color: T.success }}>✓ FAÇA</div>
                <div className="space-y-2">
                  {brief.doList.map((d, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle size={12} style={{ color: T.success, flexShrink: 0, marginTop: 2 }} />
                      <span className="text-xs">{d}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.danger + "20" }}>
                <div className="text-xs font-bold mb-3" style={{ color: T.danger }}>✗ EVITE</div>
                <div className="space-y-2">
                  {brief.dontList.map((d, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="w-3 h-3 rounded-full border flex-shrink-0 mt-0.5" style={{ borderColor: T.danger }} />
                      <span className="text-xs">{d}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button onClick={() => onNavigate?.("ad-creative")}
                className="flex-1 py-3 rounded-2xl text-sm font-black flex items-center justify-center gap-2"
                style={{ background: T.accent + "20", color: T.accent, border: `1px solid ${T.accent}30` }}>
                <Sparkles size={15} /> Criar Criativo
              </button>
              <button onClick={() => onNavigate?.("campaign-planner")}
                className="flex-1 py-3 rounded-2xl text-sm font-black flex items-center justify-center gap-2"
                style={{ background: T.primary, color: "#fff" }}>
                <Send size={15} /> Criar Campanha
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
