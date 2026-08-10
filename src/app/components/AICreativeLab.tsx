import { useState, useEffect, useRef } from "react";
import { Sparkles, Wand2, Download, RefreshCw, Copy, Check, ChevronRight, Palette, Layout, Type } from "lucide-react";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82",
  warning: "#FFAA00", danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280",
  gold: "#FFD700",
};

interface Props { onBack: () => void; onNavigate: (v: string) => void; }

type Format = "landscape" | "portrait" | "square";
type Stage = "brief" | "generating" | "results";

interface AdConcept {
  id: string;
  headline: string;
  subhead: string;
  cta: string;
  bg: string;
  textColor: string;
  accentColor: string;
  style: "bold" | "minimal" | "vibrant";
}

const OBJECTIVES = ["Awareness de Marca", "Promoção / Oferta", "Lançamento de Produto", "Drive-to-Store", "App Downloads", "Institutional"];
const AUDIENCES = ["Jovens 18-24", "Adultos 25-40", "Executivos 35-55", "Famílias", "Esportistas", "Tech savvies"];
const TONES = ["Energético", "Sofisticado", "Divertido", "Confiável", "Urgente", "Inspirador"];

function generateConcepts(brief: { brand: string; message: string; objective: string; tone: string }): AdConcept[] {
  const themes = [
    { bg: "linear-gradient(135deg, #1a0533 0%, #4F6EF7 100%)", textColor: "#ECF0FF", accentColor: "#00DC82", style: "bold" as const },
    { bg: "linear-gradient(135deg, #05060E 0%, #0F1120 100%)", textColor: "#ECF0FF", accentColor: "#7C5CFC", style: "minimal" as const },
    { bg: "linear-gradient(135deg, #FF4D6A 0%, #FFAA00 100%)", textColor: "#05060E", accentColor: "#05060E", style: "vibrant" as const },
  ];
  const headlines = [
    `${brief.brand}: ${brief.message}`,
    `Descubra ${brief.brand}`,
    `${brief.brand} — O Futuro é Agora`,
  ];
  const subheads = [
    `${brief.objective} · ${brief.tone}`,
    "Experimente. Transforme. Conquiste.",
    "Onde inovação encontra resultado.",
  ];
  const ctas = ["Saiba Mais", "Experimente Grátis", "Aproveite Já", "Descubra Agora", "Acesse Hoje"];
  return themes.map((theme, i) => ({
    id: `concept-${i + 1}`,
    headline: headlines[i] || headlines[0],
    subhead: subheads[i] || subheads[0],
    cta: ctas[i],
    ...theme,
  }));
}

const FORMAT_DIMS: Record<Format, { w: number; h: number; label: string }> = {
  landscape: { w: 320, h: 180, label: "16:9 — Billboard" },
  portrait: { w: 180, h: 320, label: "9:16 — Totem" },
  square: { w: 240, h: 240, label: "1:1 — Indoor" },
};

function AdPreview({ concept, format }: { concept: AdConcept; format: Format }) {
  const dims = FORMAT_DIMS[format];
  return (
    <div style={{
      width: dims.w, height: dims.h, borderRadius: 10, overflow: "hidden",
      background: concept.bg, position: "relative", flexShrink: 0,
      display: "flex", flexDirection: "column", justifyContent: "flex-end",
      padding: 16, boxSizing: "border-box", boxShadow: `0 8px 32px rgba(0,0,0,0.5)`,
    }}>
      <div style={{ position: "absolute", inset: 8, border: `1px dashed ${concept.textColor}30`, borderRadius: 6, pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: 16, left: 16, background: `${concept.textColor}18`, borderRadius: 6, padding: "4px 10px" }}>
        <span style={{ fontSize: 10, fontWeight: 800, color: concept.textColor, letterSpacing: 1 }}>BRAND</span>
      </div>
      <div>
        <p style={{ fontSize: format === "portrait" ? 14 : 12, fontWeight: 800, color: concept.textColor, margin: "0 0 4px", lineHeight: 1.2 }}>{concept.headline}</p>
        <p style={{ fontSize: 9, color: `${concept.textColor}aa`, margin: "0 0 10px", lineHeight: 1.4 }}>{concept.subhead}</p>
        <div style={{ display: "inline-block", background: concept.accentColor, borderRadius: 6, padding: "5px 12px" }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: concept.style === "vibrant" ? "#fff" : T.bg }}>{concept.cta}</span>
        </div>
      </div>
    </div>
  );
}

export default function AICreativeLab({ onBack }: Props) {
  const [stage, setStage] = useState<Stage>("brief");
  const [format, setFormat] = useState<Format>("landscape");
  const [selectedConcept, setSelectedConcept] = useState<number>(0);
  const [concepts, setConcepts] = useState<AdConcept[]>([]);
  const [generatingProgress, setGeneratingProgress] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [brief, setBrief] = useState({
    brand: "", message: "", objective: OBJECTIVES[0], audience: AUDIENCES[0], tone: TONES[0], keywords: "",
  });
  const [variations, setVariations] = useState<string[]>([]);
  const [streamedVariation, setStreamedVariation] = useState("");
  const streamRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const streamText = (text: string) => {
    setStreamedVariation("");
    let i = 0;
    const tick = () => {
      if (i < text.length) {
        setStreamedVariation(prev => prev + text[i]);
        i++;
        streamRef.current = setTimeout(tick, 20);
      }
    };
    tick();
  };

  const handleGenerate = () => {
    if (!brief.brand || !brief.message) return;
    setStage("generating");
    setGeneratingProgress(0);
    const interval = setInterval(() => {
      setGeneratingProgress(p => {
        if (p >= 100) { clearInterval(interval); return 100; }
        return p + 4;
      });
    }, 80);
    setTimeout(() => {
      clearInterval(interval);
      setGeneratingProgress(100);
      const generated = generateConcepts(brief);
      setConcepts(generated);
      setVariations([
        `${brief.brand}: ${brief.message}. Experimente agora.`,
        `Conheça ${brief.brand} — ${brief.message}.`,
        `${brief.message}. Só com ${brief.brand}.`,
        `${brief.brand} apresenta: ${brief.message}.`,
      ]);
      streamText(`${brief.brand}: ${brief.message}. Experimente agora.`);
      setStage("results");
    }, 2200);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif", padding: "32px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onBack} style={{ background: T.card, border: `1px solid ${T.textSub}22`, borderRadius: 8, padding: "6px 14px", color: T.textSub, cursor: "pointer", fontSize: 13 }}>&larr; Voltar</button>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: `${T.accent}22`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sparkles size={20} color={T.accent} />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>AI Creative Lab</h1>
            <p style={{ fontSize: 13, color: T.textSub, margin: 0 }}>Geração de criativos DOOH com inteligência artificial</p>
          </div>
        </div>
        {stage === "results" && (
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => { setStage("brief"); setConcepts([]); }} style={{ background: T.panel, border: `1px solid ${T.textSub}33`, borderRadius: 8, padding: "8px 16px", color: T.textSub, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
              <RefreshCw size={13} /> Novo Briefing
            </button>
            <button style={{ background: T.accent, color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
              <Download size={13} /> Exportar
            </button>
          </div>
        )}
      </div>

      {stage === "brief" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24 }}>
          <div style={{ background: T.panel, borderRadius: 14, padding: 28, border: `1px solid ${T.textSub}18` }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 22px" }}>Briefing de Criativo</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, color: T.textSub, display: "block", marginBottom: 6 }}>Marca / Produto *</label>
                  <input value={brief.brand} onChange={e => setBrief(p => ({ ...p, brand: e.target.value }))} placeholder="ex: Nubank, iFood, Itaú..." style={{ width: "100%", background: T.card, border: `1px solid ${T.textSub}33`, borderRadius: 8, padding: "9px 12px", color: T.text, fontSize: 13, boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: T.textSub, display: "block", marginBottom: 6 }}>Mensagem Principal *</label>
                  <input value={brief.message} onChange={e => setBrief(p => ({ ...p, message: e.target.value }))} placeholder="ex: Cashback 10% em tudo" style={{ width: "100%", background: T.card, border: `1px solid ${T.textSub}33`, borderRadius: 8, padding: "9px 12px", color: T.text, fontSize: 13, boxSizing: "border-box" }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, color: T.textSub, display: "block", marginBottom: 8 }}>Objetivo da Campanha</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {OBJECTIVES.map(o => (
                    <button key={o} onClick={() => setBrief(p => ({ ...p, objective: o }))} style={{ padding: "6px 14px", borderRadius: 8, border: `1px solid ${brief.objective === o ? T.primary : T.textSub + "33"}`, background: brief.objective === o ? `${T.primary}22` : "transparent", color: brief.objective === o ? T.primary : T.textSub, cursor: "pointer", fontSize: 12, fontWeight: 500 }}>{o}</button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, color: T.textSub, display: "block", marginBottom: 8 }}>Público-Alvo</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {AUDIENCES.map(a => (
                    <button key={a} onClick={() => setBrief(p => ({ ...p, audience: a }))} style={{ padding: "6px 14px", borderRadius: 8, border: `1px solid ${brief.audience === a ? T.accent : T.textSub + "33"}`, background: brief.audience === a ? `${T.accent}22` : "transparent", color: brief.audience === a ? T.accent : T.textSub, cursor: "pointer", fontSize: 12 }}>{a}</button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, color: T.textSub, display: "block", marginBottom: 8 }}>Tom de Voz</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {TONES.map(t => (
                    <button key={t} onClick={() => setBrief(p => ({ ...p, tone: t }))} style={{ padding: "6px 14px", borderRadius: 8, border: `1px solid ${brief.tone === t ? T.success : T.textSub + "33"}`, background: brief.tone === t ? `${T.success}22` : "transparent", color: brief.tone === t ? T.success : T.textSub, cursor: "pointer", fontSize: 12 }}>{t}</button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, color: T.textSub, display: "block", marginBottom: 6 }}>Palavras-chave adicionais (opcional)</label>
                <input value={brief.keywords} onChange={e => setBrief(p => ({ ...p, keywords: e.target.value }))} placeholder="ex: sustentável, premium, exclusivo..." style={{ width: "100%", background: T.card, border: `1px solid ${T.textSub}33`, borderRadius: 8, padding: "9px 12px", color: T.text, fontSize: 13, boxSizing: "border-box" }} />
              </div>
              <button onClick={handleGenerate} disabled={!brief.brand || !brief.message} style={{ padding: "14px", borderRadius: 10, border: "none", background: brief.brand && brief.message ? `linear-gradient(135deg, ${T.primary}, ${T.accent})` : T.textSub, color: "#fff", cursor: brief.brand && brief.message ? "pointer" : "not-allowed", fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <Sparkles size={18} /> Gerar Criativos com IA
              </button>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: T.panel, borderRadius: 12, padding: 20, border: `1px solid ${T.textSub}18` }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 14px", display: "flex", alignItems: "center", gap: 8 }}><Layout size={14} color={T.accent} /> Formato de Tela</h3>
              {(["landscape", "portrait", "square"] as Format[]).map(f => (
                <div key={f} onClick={() => setFormat(f)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 8, cursor: "pointer", background: format === f ? `${T.primary}18` : "transparent", border: `1px solid ${format === f ? T.primary + "44" : "transparent"}`, marginBottom: 6 }}>
                  <div style={{ width: format === "landscape" ? 24 : format === "square" ? 18 : 14, height: format === "portrait" ? 24 : format === "square" ? 18 : 14, border: `2px solid ${format === f ? T.primary : T.textSub}`, borderRadius: 3 }} />
                  <div><p style={{ fontSize: 12, fontWeight: 600, margin: 0, color: format === f ? T.text : T.textSub }}>{FORMAT_DIMS[f].label}</p></div>
                </div>
              ))}
            </div>
            <div style={{ background: `${T.accent}11`, borderRadius: 12, padding: 18, border: `1px solid ${T.accent}33` }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, margin: "0 0 10px", color: T.accent, display: "flex", alignItems: "center", gap: 6 }}><Wand2 size={13} /> Dicas de Criativo DOOH</h3>
              {["Máximo 7 palavras no headline", "Contraste alto — visualização a 30m", "CTA visível em 3 segundos", "Logo no primeiro terço da tela", "Evite textos menores que 10% da altura"].map(tip => (
                <div key={tip} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                  <span style={{ color: T.accent, fontSize: 12, flexShrink: 0 }}>&rarr;</span>
                  <span style={{ fontSize: 12, color: T.textSub }}>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {stage === "generating" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400, gap: 24 }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: `${T.accent}22`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sparkles size={36} color={T.accent} style={{ animation: "spin 1s linear infinite" }} />
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 20, fontWeight: 700, margin: "0 0 8px" }}>Gerando criativos com IA...</p>
            <p style={{ fontSize: 13, color: T.textSub, margin: "0 0 24px" }}>Analisando briefing · Adaptando para DOOH · Criando variações</p>
            <div style={{ width: 320, height: 6, background: `${T.textSub}22`, borderRadius: 4, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${generatingProgress}%`, background: `linear-gradient(90deg, ${T.primary}, ${T.accent})`, borderRadius: 4, transition: "width 0.1s" }} />
            </div>
            <p style={{ fontSize: 12, color: T.textSub, margin: "10px 0 0" }}>{generatingProgress}%</p>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            {["Análise semântica", "Paleta de cores", "Layout adaptativo", "Copy otimizado"].map((step, i) => (
              <div key={step} style={{ display: "flex", alignItems: "center", gap: 6, opacity: generatingProgress > i * 25 ? 1 : 0.3 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: generatingProgress > i * 25 ? T.success : T.textSub }} />
                <span style={{ fontSize: 12, color: T.textSub }}>{step}</span>
              </div>
            ))}
          </div>
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {stage === "results" && concepts.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ background: T.panel, borderRadius: 12, padding: 20, border: `1px solid ${T.textSub}18` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Conceitos Gerados — {FORMAT_DIMS[format].label}</h3>
                <div style={{ display: "flex", gap: 4 }}>
                  {(["landscape", "portrait", "square"] as Format[]).map(f => (
                    <button key={f} onClick={() => setFormat(f)} style={{ padding: "4px 10px", borderRadius: 6, border: `1px solid ${format === f ? T.primary : T.textSub + "22"}`, background: format === f ? `${T.primary}18` : "transparent", color: format === f ? T.primary : T.textSub, cursor: "pointer", fontSize: 11 }}>
                      {f === "landscape" ? "16:9" : f === "portrait" ? "9:16" : "1:1"}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                {concepts.map((c, i) => (
                  <div key={c.id} onClick={() => setSelectedConcept(i)} style={{ cursor: "pointer", opacity: selectedConcept === i ? 1 : 0.7, transform: selectedConcept === i ? "scale(1.02)" : "scale(1)", transition: "all 0.2s" }}>
                    <AdPreview concept={c} format={format} />
                    <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 12, color: selectedConcept === i ? T.accent : T.textSub, fontWeight: selectedConcept === i ? 700 : 400 }}>Conceito {i + 1} — {c.style}</span>
                      {selectedConcept === i && <span style={{ fontSize: 11, color: T.accent }}>● Selecionado</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: T.panel, borderRadius: 12, padding: 20, border: `1px solid ${T.textSub}18` }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 14px" }}>Variações de Copy</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {variations.map((v, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", background: T.card, borderRadius: 8, border: `1px solid ${T.textSub}22` }}>
                    <span style={{ flex: 1, fontSize: 13, color: T.text }}>{v}</span>
                    <button onClick={() => handleCopy(v, `copy-${i}`)} style={{ background: "transparent", border: "none", cursor: "pointer", color: copiedId === `copy-${i}` ? T.success : T.textSub, padding: 4 }}>
                      {copiedId === `copy-${i}` ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: T.panel, borderRadius: 12, padding: 20, border: `1px solid ${T.accent}33` }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 14px", color: T.accent }}>Conceito {selectedConcept + 1} Selecionado</h3>
              {[
                { label: "Headline", value: concepts[selectedConcept]?.headline },
                { label: "Subhead", value: concepts[selectedConcept]?.subhead },
                { label: "CTA", value: concepts[selectedConcept]?.cta },
                { label: "Estilo", value: concepts[selectedConcept]?.style },
              ].map(f => (
                <div key={f.label} style={{ marginBottom: 12 }}>
                  <p style={{ fontSize: 11, color: T.textSub, margin: "0 0 4px" }}>{f.label}</p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <p style={{ fontSize: 13, fontWeight: 500, margin: 0 }}>{f.value}</p>
                    <button onClick={() => handleCopy(f.value || "", `field-${f.label}`)} style={{ background: "transparent", border: "none", cursor: "pointer", color: copiedId === `field-${f.label}` ? T.success : T.textSub }}>
                      {copiedId === `field-${f.label}` ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ background: T.panel, borderRadius: 12, padding: 20, border: `1px solid ${T.textSub}18` }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, margin: "0 0 12px", display: "flex", alignItems: "center", gap: 6 }}><Palette size={13} /> Paleta de Cores</h3>
              <div style={{ display: "flex", gap: 8 }}>
                {[concepts[selectedConcept]?.accentColor, concepts[selectedConcept]?.textColor].map((c, i) => (
                  <div key={i} style={{ flex: 1, height: 40, borderRadius: 8, background: c, border: `1px solid ${T.textSub}22` }} />
                ))}
              </div>
            </div>
            <button style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`, color: "#fff", border: "none", borderRadius: 10, padding: "12px", cursor: "pointer", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <ChevronRight size={16} /> Usar nesta Campanha
            </button>
            <button style={{ background: T.panel, border: `1px solid ${T.textSub}33`, borderRadius: 10, padding: "12px", cursor: "pointer", fontSize: 13, color: T.textSub, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Download size={14} /> Baixar Assets
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
