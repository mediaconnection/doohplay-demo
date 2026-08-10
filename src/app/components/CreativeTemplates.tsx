import { useState } from "react";
import {
  ArrowLeft, Search, Star, Download, Eye, Zap, ChevronRight,
  Play, Pause, Monitor, Smartphone, LayoutGrid, List,
  Sparkles, Lock, Check, X, Plus, Heart
} from "lucide-react";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

type Segment = "all" | "academia" | "barbearia" | "restaurante" | "farmacia" | "varejo" | "clinica" | "pet";
type Format = "all" | "15s" | "30s" | "static";
type PlanReq = "starter" | "pro" | "enterprise";

interface Template {
  id: string;
  name: string;
  segment: Segment;
  format: "15s" | "30s" | "static";
  planReq: PlanReq;
  tags: string[];
  rating: number;
  uses: number;
  liked: boolean;
  palette: string[];
  preview: { bg: string; accent: string; headline: string; sub: string; cta: string };
  aiReady: boolean;
}

const TEMPLATES: Template[] = [
  { id: "t1",  name: "Promoção Flash",         segment: "varejo",      format: "15s",    planReq: "starter",    tags: ["promoção","desconto"],        rating: 4.9, uses: 2840, liked: false, palette: ["#FF4D6A","#FF8C42","#FFF"],    preview: { bg: "#1A0510", accent: "#FF4D6A", headline: "50% OFF",              sub: "Só hoje · Produtos selecionados", cta: "Aproveite agora" }, aiReady: true  },
  { id: "t2",  name: "Bem-vindo ao Treino",     segment: "academia",    format: "15s",    planReq: "starter",    tags: ["motivação","fitness"],         rating: 4.8, uses: 1920, liked: true,  palette: ["#00DC82","#4F6EF7","#FFF"],    preview: { bg: "#041510", accent: "#00DC82", headline: "Transforme seu corpo",   sub: "Resultados reais em 30 dias",     cta: "Comece hoje"     }, aiReady: true  },
  { id: "t3",  name: "Prato do Dia",            segment: "restaurante", format: "30s",    planReq: "starter",    tags: ["cardápio","promoção"],         rating: 4.7, uses: 1540, liked: false, palette: ["#FFAA00","#E64A19","#FFF"],    preview: { bg: "#150800", accent: "#FFAA00", headline: "Prato do Dia",           sub: "R$29,90 · Inclui sobremesa",      cta: "Peça agora"      }, aiReady: true  },
  { id: "t4",  name: "Corte + Barba",           segment: "barbearia",   format: "15s",    planReq: "starter",    tags: ["serviço","masculino"],         rating: 4.9, uses: 3210, liked: false, palette: ["#1A1A2E","#7C5CFC","#FFF"],    preview: { bg: "#0A0010", accent: "#7C5CFC", headline: "Corte + Barba R$45",     sub: "Agende pelo WhatsApp",            cta: "Reservar"        }, aiReady: true  },
  { id: "t5",  name: "Oferta Medicamento",      segment: "farmacia",    format: "static", planReq: "starter",    tags: ["saúde","desconto"],            rating: 4.6, uses: 980,  liked: false, palette: ["#00DC82","#00A8CC","#FFF"],    preview: { bg: "#011510", accent: "#00DC82", headline: "Vitamina C 500mg",       sub: "R$12,90 · Desconto de 30%",       cta: "Disponível aqui" }, aiReady: false },
  { id: "t6",  name: "Black Friday Countdown",  segment: "varejo",      format: "30s",    planReq: "pro",        tags: ["black friday","urgência"],     rating: 5.0, uses: 4120, liked: true,  palette: ["#000","#FF4D6A","#FFD700"],    preview: { bg: "#0D0000", accent: "#FF4D6A", headline: "BLACK FRIDAY",           sub: "Faltam 3 dias · Até 70% OFF",     cta: "Não perca"       }, aiReady: true  },
  { id: "t7",  name: "Consulta Online",         segment: "clinica",     format: "30s",    planReq: "pro",        tags: ["saúde","agendamento"],         rating: 4.7, uses: 720,  liked: false, palette: ["#4F6EF7","#00DC82","#FFF"],    preview: { bg: "#010820", accent: "#4F6EF7", headline: "Consulta agora",         sub: "Sem fila · Resultado em 24h",     cta: "Agende online"   }, aiReady: true  },
  { id: "t8",  name: "Banho & Tosa Promoção",   segment: "pet",         format: "15s",    planReq: "starter",    tags: ["pet","serviço"],               rating: 4.5, uses: 640,  liked: false, palette: ["#FFAA00","#4F6EF7","#FFF"],    preview: { bg: "#100800", accent: "#FFAA00", headline: "Banho + Tosa R$60",      sub: "Hora marcada · Sem surpresas",    cta: "Ligar agora"     }, aiReady: false },
  { id: "t9",  name: "Lançamento de Produto",   segment: "varejo",      format: "30s",    planReq: "pro",        tags: ["lançamento","novidade"],       rating: 4.8, uses: 1380, liked: false, palette: ["#7C5CFC","#4F6EF7","#FFF"],    preview: { bg: "#080010", accent: "#7C5CFC", headline: "Chegou o novo iPhone",   sub: "Disponível a partir de hoje",     cta: "Confira"         }, aiReady: true  },
  { id: "t10", name: "Resultado Garantido",      segment: "academia",    format: "30s",    planReq: "enterprise", tags: ["resultado","premium"],         rating: 5.0, uses: 890,  liked: false, palette: ["#FFD700","#FF4D6A","#000"],    preview: { bg: "#0D0A00", accent: "#FFD700", headline: "-10kg em 60 dias",       sub: "Método comprovado · 3.000 alunos",cta: "Comece já"       }, aiReady: true  },
  { id: "t11", name: "Happy Hour",              segment: "restaurante", format: "15s",    planReq: "starter",    tags: ["happy hour","bebida"],         rating: 4.7, uses: 2100, liked: true,  palette: ["#FF8C42","#FFAA00","#FFF"],    preview: { bg: "#120400", accent: "#FF8C42", headline: "Happy Hour 17h–19h",     sub: "2 por 1 em drinques selecionados",cta: "Vem pra cá"      }, aiReady: true  },
  { id: "t12", name: "Campanha Dia das Mães",   segment: "all",         format: "30s",    planReq: "pro",        tags: ["datas","mãe","presente"],      rating: 4.9, uses: 3400, liked: false, palette: ["#FF4D6A","#FF8FC0","#FFF"],    preview: { bg: "#150010", accent: "#FF4D6A", headline: "Dia das Mães",           sub: "Presenteie quem você ama",        cta: "Ver opções"      }, aiReady: true  },
];

const SEGMENT_LABELS: Record<Segment, string> = {
  all: "Todos", academia: "Academia", barbearia: "Barbearia", restaurante: "Restaurante",
  farmacia: "Farmácia", varejo: "Varejo", clinica: "Clínica", pet: "Pet Shop",
};

const PLAN_COLOR: Record<PlanReq, string> = {
  starter: T.success, pro: T.primary, enterprise: T.gold,
};

interface Props { onBack: () => void; onNavigate?: (v: string) => void; plan?: string; }

type TView = "browse" | "preview" | "customize";

function TemplateCard({ tpl, onPreview, onUse, locked }: { tpl: Template; onPreview: () => void; onUse: () => void; locked: boolean }) {
  const [liked, setLiked] = useState(tpl.liked);
  const p = tpl.preview;
  return (
    <div className="rounded-2xl border overflow-hidden" style={{ background: T.card, borderColor: T.border }}>
      <div className="relative h-36 flex flex-col items-center justify-center p-4 overflow-hidden"
        style={{ background: p.bg }}>
        <div className="absolute inset-0 opacity-10" style={{ background: `radial-gradient(ellipse at 50% 0%, ${p.accent}, transparent 70%)` }} />
        {locked && (
          <div className="absolute inset-0 flex items-center justify-center z-10"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
            <div className="text-center">
              <Lock size={22} className="mx-auto mb-1" style={{ color: T.gold }} />
              <div className="text-xs font-bold" style={{ color: T.gold }}>Plano {tpl.planReq}</div>
            </div>
          </div>
        )}
        <div className="relative z-0 text-center">
          <div className="font-black text-xl leading-tight" style={{ color: p.accent }}>{p.headline}</div>
          <div className="text-xs mt-1 opacity-80" style={{ color: T.text }}>{p.sub}</div>
          <div className="mt-2 px-3 py-1 rounded-full text-xs font-bold inline-block"
            style={{ background: p.accent + "25", color: p.accent, border: `1px solid ${p.accent}40` }}>
            {p.cta}
          </div>
        </div>
        <div className="absolute bottom-2 right-2 flex gap-1">
          {tpl.palette.map((c, i) => (
            <div key={i} className="w-3 h-3 rounded-full border border-white/20" style={{ background: c }} />
          ))}
        </div>
        {tpl.aiReady && (
          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold"
            style={{ background: T.accent + "20", color: T.accent, border: `1px solid ${T.accent}30` }}>
            <Sparkles size={10} /> IA
          </div>
        )}
        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-medium"
          style={{ background: T.panel + "CC", color: T.textSub }}>
          {tpl.format}
        </div>
      </div>

      <div className="p-3">
        <div className="flex items-start justify-between gap-2 mb-1">
          <span className="font-bold text-sm leading-tight">{tpl.name}</span>
          <button onClick={() => setLiked(l => !l)}>
            <Heart size={14} style={{ color: liked ? T.danger : T.textSub, fill: liked ? T.danger : "none" }} />
          </button>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: T.panel, color: T.textSub }}>
            {SEGMENT_LABELS[tpl.segment]}
          </span>
          <span className="text-xs px-1.5 py-0.5 rounded-full font-bold" style={{ background: PLAN_COLOR[tpl.planReq] + "15", color: PLAN_COLOR[tpl.planReq] }}>
            {tpl.planReq}
          </span>
          <div className="ml-auto flex items-center gap-1">
            <Star size={11} style={{ color: T.gold, fill: T.gold }} />
            <span className="text-xs font-bold" style={{ color: T.gold }}>{tpl.rating}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={onPreview}
            className="flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1"
            style={{ background: T.panel, color: T.textSub, border: `1px solid ${T.border}` }}>
            <Eye size={12} /> Preview
          </button>
          <button onClick={onUse} disabled={locked}
            className="flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 disabled:opacity-40"
            style={{ background: locked ? T.border : `linear-gradient(135deg, ${T.primary}, ${T.accent})`, color: locked ? T.textSub : "#fff" }}>
            {locked ? <Lock size={12} /> : <Zap size={12} />}
            {locked ? "Bloqueado" : "Usar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CreativeTemplates({ onBack, onNavigate, plan = "pro" }: Props) {
  const [tView, setTView] = useState<TView>("browse");
  const [segment, setSegment] = useState<Segment>("all");
  const [format, setFormat] = useState<Format>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Template | null>(null);
  const [customText, setCustomText] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiDone, setAiDone] = useState(false);

  const planOrder: Record<PlanReq, number> = { starter: 0, pro: 1, enterprise: 2 };
  const myPlanOrder = planOrder[plan as PlanReq] ?? 1;
  const isLocked = (tpl: Template) => planOrder[tpl.planReq] > myPlanOrder;

  const filtered = TEMPLATES.filter(t => {
    const matchSeg = segment === "all" || t.segment === segment || t.segment === "all";
    const matchFmt = format === "all" || t.format === format;
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.tags.some(g => g.includes(search.toLowerCase()));
    return matchSeg && matchFmt && matchSearch;
  });

  const handleUse = (tpl: Template) => {
    if (isLocked(tpl)) return;
    setSelected(tpl);
    setCustomText(tpl.preview.sub);
    setAiDone(false);
    setTView("customize");
  };

  const handlePreview = (tpl: Template) => { setSelected(tpl); setTView("preview"); };

  const runAI = () => {
    setAiGenerating(true);
    setTimeout(() => { setAiGenerating(false); setAiDone(true); }, 2200);
  };

  if (tView === "preview" && selected) {
    const p = selected.preview;
    return (
      <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
        <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
          <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
            <button onClick={() => setTView("browse")} className="p-2 rounded-lg hover:bg-white/5"><ArrowLeft size={18} style={{ color: T.textSub }} /></button>
            <h1 className="font-black">{selected.name}</h1>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
          <div className="w-full aspect-video rounded-3xl overflow-hidden relative flex items-center justify-center"
            style={{ background: p.bg }}>
            <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 50% 0%, ${p.accent}40, transparent 70%)` }} />
            <div className="relative text-center p-8">
              <div className="font-black text-5xl mb-3" style={{ color: p.accent }}>{p.headline}</div>
              <div className="text-xl opacity-80 mb-6" style={{ color: T.text }}>{p.sub}</div>
              <div className="inline-block px-6 py-3 rounded-2xl font-black text-lg"
                style={{ background: p.accent, color: "#000" }}>{p.cta}</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Avaliação", value: `⭐ ${selected.rating}` },
              { label: "Usos", value: `${(selected.uses / 1000).toFixed(1)}K` },
              { label: "Formato", value: selected.format },
            ].map((s, i) => (
              <div key={i} className="p-3.5 rounded-xl border text-center" style={{ background: T.card, borderColor: T.border }}>
                <div className="font-black text-lg">{s.value}</div>
                <div className="text-xs" style={{ color: T.textSub }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => handleUse(selected)} disabled={isLocked(selected)}
              className="flex-1 py-3.5 rounded-xl font-black flex items-center justify-center gap-2"
              style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`, color: "#fff" }}>
              <Zap size={16} /> Usar este template
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (tView === "customize" && selected) {
    const p = selected.preview;
    return (
      <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
        <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
          <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
            <button onClick={() => setTView("browse")} className="p-2 rounded-lg hover:bg-white/5"><ArrowLeft size={18} style={{ color: T.textSub }} /></button>
            <h1 className="font-black">Personalizar</h1>
            <span className="text-xs ml-auto" style={{ color: T.textSub }}>{selected.name}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-6 py-6 space-y-6">
          <div className="w-full h-48 rounded-2xl overflow-hidden relative flex items-center justify-center"
            style={{ background: p.bg }}>
            <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 50% 0%, ${p.accent}30, transparent 70%)` }} />
            <div className="relative text-center">
              <div className="font-black text-3xl" style={{ color: p.accent }}>{p.headline}</div>
              <div className="text-sm mt-1 opacity-80" style={{ color: T.text }}>{customText || p.sub}</div>
              <div className="mt-2 inline-block px-4 py-1.5 rounded-xl font-bold text-sm"
                style={{ background: p.accent, color: "#000" }}>{p.cta}</div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: T.textSub }}>Texto principal</label>
              <input value={p.headline} readOnly className="w-full px-4 py-3 rounded-xl text-sm"
                style={{ background: T.card, border: `1px solid ${T.border}`, color: T.text }} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: T.textSub }}>Subtítulo</label>
              <input value={customText} onChange={e => setCustomText(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm"
                style={{ background: T.card, border: `1px solid ${T.primary}50`, color: T.text }} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: T.textSub }}>Call to action</label>
              <input value={p.cta} readOnly className="w-full px-4 py-3 rounded-xl text-sm"
                style={{ background: T.card, border: `1px solid ${T.border}`, color: T.text }} />
            </div>
          </div>

          {selected.aiReady && (
            <div className="p-4 rounded-2xl border" style={{ background: T.accent + "08", borderColor: T.accent + "25" }}>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={15} style={{ color: T.accent }} />
                <span className="font-bold text-sm">Reescrever com IA</span>
              </div>
              <input placeholder="Descreva o seu negócio... Ex: barbearia premium em Pinheiros"
                className="w-full px-3 py-2.5 rounded-xl text-sm mb-3"
                style={{ background: T.card, border: `1px solid ${T.border}`, color: T.text }} />
              {!aiDone ? (
                <button onClick={runAI} disabled={aiGenerating}
                  className="w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                  style={{ background: `linear-gradient(135deg, ${T.accent}, ${T.primary})`, color: "#fff", opacity: aiGenerating ? 0.7 : 1 }}>
                  {aiGenerating ? (
                    <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Gerando...</>
                  ) : (
                    <><Sparkles size={14} /> Gerar com IA Gemini</>
                  )}
                </button>
              ) : (
                <div className="flex items-center gap-2 p-2.5 rounded-xl" style={{ background: T.success + "15" }}>
                  <Check size={14} style={{ color: T.success }} />
                  <span className="text-sm font-medium" style={{ color: T.success }}>Texto otimizado pela IA aplicado!</span>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <button className="flex-1 py-3.5 rounded-xl font-black flex items-center justify-center gap-2"
              style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`, color: "#fff" }}
              onClick={() => onNavigate?.("playlist")}>
              <Play size={16} /> Publicar na Playlist
            </button>
            <button className="px-4 py-3.5 rounded-xl flex items-center justify-center"
              style={{ background: T.card, color: T.textSub, border: `1px solid ${T.border}` }}>
              <Download size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5"><ArrowLeft size={18} style={{ color: T.textSub }} /></button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.accent + "20" }}>
              <Sparkles size={18} style={{ color: T.accent }} />
            </div>
            <div>
              <h1 className="font-black text-lg">Templates Criativos</h1>
              <p className="text-xs" style={{ color: T.textSub }}>{TEMPLATES.length} templates · IA Gemini integrada</p>
            </div>
          </div>
          <button onClick={() => onNavigate?.("content-studio")}
            className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold"
            style={{ background: T.accent + "15", color: T.accent, border: `1px solid ${T.accent}25` }}>
            <Plus size={14} /> Criar do zero
          </button>
        </div>

        <div className="max-w-3xl mx-auto px-6 pb-0 flex gap-1 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {(Object.entries(SEGMENT_LABELS) as [Segment, string][]).map(([k, v]) => (
            <button key={k} onClick={() => setSegment(k)}
              className="px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-all"
              style={{ borderColor: segment === k ? T.primary : "transparent", color: segment === k ? T.primary : T.textSub }}>
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-6 space-y-5">
        <div className="flex gap-3">
          <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl border" style={{ background: T.card, borderColor: T.border }}>
            <Search size={15} style={{ color: T.textSub }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar templates..."
              className="flex-1 bg-transparent text-sm outline-none" style={{ color: T.text }} />
          </div>
          <div className="flex gap-1 p-1 rounded-xl border" style={{ background: T.card, borderColor: T.border }}>
            {(["all","15s","30s","static"] as Format[]).map(f => (
              <button key={f} onClick={() => setFormat(f)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{ background: format === f ? T.primary : "transparent", color: format === f ? "#fff" : T.textSub }}>
                {f === "all" ? "Todos" : f}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-4 p-3.5 rounded-xl border" style={{ background: T.card, borderColor: T.border }}>
          {[
            { label: "Templates", value: String(TEMPLATES.length), color: T.text },
            { label: "Com IA", value: String(TEMPLATES.filter(t => t.aiReady).length), color: T.accent },
            { label: "Grátis", value: String(TEMPLATES.filter(t => t.planReq === "starter").length), color: T.success },
            { label: "Pro+", value: String(TEMPLATES.filter(t => t.planReq !== "starter").length), color: T.primary },
          ].map((s, i) => (
            <div key={i} className="text-center flex-1">
              <div className="font-black text-xl" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs" style={{ color: T.textSub }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {filtered.map(tpl => (
            <TemplateCard key={tpl.id} tpl={tpl} locked={isLocked(tpl)}
              onPreview={() => handlePreview(tpl)}
              onUse={() => handleUse(tpl)} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16" style={{ color: T.textSub }}>
            <Sparkles size={40} className="mx-auto mb-3 opacity-20" />
            <p>Nenhum template neste filtro.</p>
          </div>
        )}
      </div>
    </div>
  );
}
