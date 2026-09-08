import { useState } from "react";
import {
  ArrowLeft, Palette, Upload, Play, Pause, Eye, Download,
  Plus, Trash2, Type, Image, Square, Circle, AlignLeft,
  AlignCenter, Bold, Italic, Monitor, Smartphone, Layers,
  CheckCircle, Star, Copy, MoreHorizontal, Zap
} from "lucide-react";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

interface Props { onBack: () => void; onNavigate?: (v: string) => void; }
type TabId = "templates" | "editor" | "library";

interface Template {
  id: string;
  name: string;
  category: string;
  aspect: "16:9" | "9:16" | "4:3" | "1:1";
  color: string;
  tags: string[];
  popular: boolean;
}

const TEMPLATES: Template[] = [
  { id: "T001", name: "Produto em Destaque",    category: "Varejo",      aspect: "16:9", color: T.primary, tags: ["promo","oferta"],       popular: true  },
  { id: "T002", name: "Countdown Oferta",       category: "Varejo",      aspect: "16:9", color: T.danger,  tags: ["urgência","timer"],      popular: true  },
  { id: "T003", name: "Serviço Financeiro",     category: "Finanças",    aspect: "16:9", color: T.gold,    tags: ["banco","seguro"],        popular: false },
  { id: "T004", name: "Entrega Rápida",         category: "Food",        aspect: "16:9", color: T.success, tags: ["delivery","app"],        popular: true  },
  { id: "T005", name: "Evento ao Vivo",         category: "Entretenimento",aspect:"16:9",color: T.accent,  tags: ["evento","show"],         popular: false },
  { id: "T006", name: "Vertical Billboard",     category: "Outdoor",     aspect: "9:16", color: T.primary, tags: ["outdoor","vertical"],    popular: true  },
  { id: "T007", name: "QR Code Ação",           category: "Interativo",  aspect: "16:9", color: T.warning, tags: ["qr","interativo"],       popular: false },
  { id: "T008", name: "Clima Dinâmico",         category: "Dinâmico",    aspect: "16:9", color: T.accent,  tags: ["clima","temperatura"],   popular: false },
];

interface Creative {
  id: string;
  name: string;
  template: string;
  status: "approved" | "pending" | "draft" | "rejected";
  campaign: string;
  lastModified: string;
  aspect: string;
  fileSize: string;
}

const LIBRARY: Creative[] = [
  { id: "C001", name: "Ambev Verão Hero",     template: "Produto em Destaque",  status: "approved", campaign: "Ambev Verão",   lastModified: "Hoje 14:23",  aspect: "16:9", fileSize: "2.1 MB" },
  { id: "C002", name: "iFood Almoço 12h",     template: "Countdown Oferta",     status: "approved", campaign: "iFood Almoço",  lastModified: "Hoje 11:05",  aspect: "16:9", fileSize: "1.8 MB" },
  { id: "C003", name: "Bradesco Executivo",   template: "Serviço Financeiro",   status: "pending",  campaign: "Bradesco Q3",   lastModified: "Ontem 16:44", aspect: "16:9", fileSize: "3.2 MB" },
  { id: "C004", name: "Natura Billboard",     template: "Vertical Billboard",   status: "draft",    campaign: "Natura Natura", lastModified: "21/07 09:12", aspect: "9:16", fileSize: "4.5 MB" },
  { id: "C005", name: "Mercado Livre Black",  template: "Countdown Oferta",     status: "rejected", campaign: "ML Black",      lastModified: "20/07 18:30", aspect: "16:9", fileSize: "1.9 MB" },
];

const STATUS_META = {
  approved: { label: "Aprovado",   color: T.success },
  pending:  { label: "Revisão",    color: T.warning },
  draft:    { label: "Rascunho",   color: T.textSub },
  rejected: { label: "Rejeitado",  color: T.danger  },
};

const CATEGORIES = ["Todos", "Varejo", "Finanças", "Food", "Entretenimento", "Outdoor", "Interativo", "Dinâmico"];

const EDITOR_FONTS    = ["Inter", "Montserrat", "Poppins", "Oswald", "Playfair Display"];
const EDITOR_COLORS   = [T.primary, T.accent, T.success, T.warning, T.danger, T.gold, "#FFFFFF", "#000000", "#FF6B35", "#4ECDC4"];
const EDITOR_ELEMENTS = [
  { icon: Type,   label: "Texto"    },
  { icon: Image,  label: "Imagem"   },
  { icon: Square, label: "Retângulo"},
  { icon: Circle, label: "Círculo"  },
];

export default function CreativeStudio({ onBack }: Props) {
  const [tab, setTab]         = useState<TabId>("templates");
  const [catFilter, setCatFilter]  = useState("Todos");
  const [editorBg, setEditorBg]    = useState(T.primary);
  const [textColor, setTextColor]  = useState("#FFFFFF");
  const [headline, setHeadline]    = useState("Seu produto em destaque");
  const [subline, setSubline]      = useState("Aproveite a oferta especial por tempo limitado");
  const [ctaText, setCtaText]      = useState("SAIBA MAIS");
  const [font, setFont]            = useState("Montserrat");
  const [previewAspect, setPreviewAspect] = useState<"16:9" | "9:16">("16:9");
  const [selectedCreative, setSelectedCreative] = useState<string | null>(null);

  const filteredTemplates = TEMPLATES.filter(t => catFilter === "Todos" || t.category === catFilter);

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5">
              <ArrowLeft size={18} style={{ color: T.textSub }} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.warning + "20" }}>
                <Palette size={18} style={{ color: T.warning }} />
              </div>
              <div>
                <h1 className="font-black text-lg">Creative Studio</h1>
                <p className="text-xs" style={{ color: T.textSub }}>Editor de criativos DOOH — templates, customização e preview em telas reais</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {(["templates","editor","library"] as TabId[]).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
                style={{ background: tab === t ? T.warning + "20" : "transparent", color: tab === t ? T.warning : T.textSub, border: `1px solid ${tab === t ? T.warning + "30" : "transparent"}` }}>
                {t === "templates" ? "Templates" : t === "editor" ? "Editor" : "Biblioteca"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">

        {tab === "templates" && (
          <div className="space-y-5">
            <div className="flex items-center gap-2 flex-wrap">
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setCatFilter(cat)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                  style={{ background: catFilter === cat ? T.warning + "20" : T.panel, color: catFilter === cat ? T.warning : T.textSub, border: `1px solid ${catFilter === cat ? T.warning + "40" : T.border}` }}>
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-4 gap-4">
              {filteredTemplates.map(tpl => (
                <div key={tpl.id} className="rounded-2xl border overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform"
                  style={{ background: T.card, borderColor: T.border }}>
                  <div className="relative" style={{ aspectRatio: tpl.aspect === "16:9" ? "16/9" : tpl.aspect === "9:16" ? "9/16" : "4/3", background: `linear-gradient(135deg, ${tpl.color}40, ${tpl.color}10)` }}>
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                      <div className="font-black text-sm leading-tight mb-1" style={{ fontFamily: "Montserrat, sans-serif" }}>
                        Seu Título
                      </div>
                      <div className="text-xs opacity-70">Subtítulo aqui</div>
                      <div className="mt-2 px-3 py-1 rounded-lg text-xs font-black"
                        style={{ background: tpl.color, color: "#fff" }}>CTA</div>
                    </div>
                    {tpl.popular && (
                      <div className="absolute top-2 right-2 flex items-center gap-1 text-xs font-black px-2 py-0.5 rounded-full"
                        style={{ background: T.gold + "20", color: T.gold }}>
                        <Star size={9} /> Popular
                      </div>
                    )}
                    <div className="absolute bottom-2 left-2 text-xs font-black px-2 py-0.5 rounded"
                      style={{ background: T.panel + "CC", color: T.textSub }}>{tpl.aspect}</div>
                  </div>
                  <div className="p-3">
                    <div className="font-black text-sm">{tpl.name}</div>
                    <div className="text-xs" style={{ color: T.textSub }}>{tpl.category}</div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {tpl.tags.map(tag => (
                        <span key={tag} className="text-xs px-1.5 py-0.5 rounded font-bold"
                          style={{ background: tpl.color + "15", color: tpl.color }}>#{tag}</span>
                      ))}
                    </div>
                    <button onClick={() => setTab("editor")}
                      className="w-full mt-3 py-2 rounded-xl text-xs font-black"
                      style={{ background: tpl.color + "20", color: tpl.color }}>
                      Usar Template
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "editor" && (
          <div className="flex gap-4" style={{ height: "calc(100vh - 180px)", minHeight: 520 }}>
            <div className="w-52 flex-shrink-0 space-y-4">
              <div className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black text-xs mb-3" style={{ color: T.textSub }}>ELEMENTOS</h3>
                <div className="grid grid-cols-2 gap-2">
                  {EDITOR_ELEMENTS.map(el => {
                    const Icon = el.icon;
                    return (
                      <button key={el.label} className="p-3 rounded-xl flex flex-col items-center gap-1.5 text-xs font-bold hover:bg-white/5"
                        style={{ background: T.panel, color: T.textSub, border: `1px solid ${T.border}` }}>
                        <Icon size={16} />
                        {el.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black text-xs mb-3" style={{ color: T.textSub }}>FUNDO</h3>
                <div className="flex flex-wrap gap-2">
                  {EDITOR_COLORS.map(c => (
                    <button key={c} onClick={() => setEditorBg(c)}
                      className="w-7 h-7 rounded-lg border-2 transition-all"
                      style={{ background: c, borderColor: editorBg === c ? "#fff" : "transparent" }} />
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black text-xs mb-3" style={{ color: T.textSub }}>TEXTO</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {EDITOR_COLORS.map(c => (
                    <button key={c} onClick={() => setTextColor(c)}
                      className="w-7 h-7 rounded-lg border-2 transition-all"
                      style={{ background: c, borderColor: textColor === c ? "#fff" : "transparent" }} />
                  ))}
                </div>
                <select value={font} onChange={e => setFont(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg text-xs"
                  style={{ background: T.panel, border: `1px solid ${T.border}`, color: T.text }}>
                  {EDITOR_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>

              <div className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black text-xs mb-3" style={{ color: T.textSub }}>UPLOAD</h3>
                <button className="w-full p-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border-dashed border-2 hover:bg-white/3"
                  style={{ color: T.textSub, borderColor: T.border }}>
                  <Upload size={14} /> Subir Imagem
                </button>
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-3">
              <div className="flex items-center gap-2 p-3 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <button className="p-2 rounded-lg hover:bg-white/5"><Bold size={14} style={{ color: T.textSub }} /></button>
                <button className="p-2 rounded-lg hover:bg-white/5"><Italic size={14} style={{ color: T.textSub }} /></button>
                <button className="p-2 rounded-lg hover:bg-white/5"><AlignLeft size={14} style={{ color: T.textSub }} /></button>
                <button className="p-2 rounded-lg hover:bg-white/5"><AlignCenter size={14} style={{ color: T.textSub }} /></button>
                <div className="w-px h-5 mx-1" style={{ background: T.border }} />
                <button onClick={() => setPreviewAspect("16:9")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold"
                  style={{ background: previewAspect === "16:9" ? T.primary + "20" : "transparent", color: previewAspect === "16:9" ? T.primary : T.textSub }}>
                  <Monitor size={12} /> 16:9
                </button>
                <button onClick={() => setPreviewAspect("9:16")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold"
                  style={{ background: previewAspect === "9:16" ? T.primary + "20" : "transparent", color: previewAspect === "9:16" ? T.primary : T.textSub }}>
                  <Smartphone size={12} /> 9:16
                </button>
                <div className="flex-1" />
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold"
                  style={{ background: T.success, color: "#000" }}>
                  <CheckCircle size={12} /> Salvar
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold"
                  style={{ background: T.panel, color: T.textSub, border: `1px solid ${T.border}` }}>
                  <Download size={12} /> Exportar
                </button>
              </div>

              <div className="flex-1 flex items-center justify-center" style={{ background: T.panel, borderRadius: 16 }}>
                <div className="relative overflow-hidden rounded-xl shadow-2xl"
                  style={{ width: previewAspect === "16:9" ? 560 : 270, height: previewAspect === "16:9" ? 315 : 480, background: editorBg, transition: "all 0.3s" }}>
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                    <div className="font-black text-2xl leading-tight mb-3 cursor-text"
                      style={{ color: textColor, fontFamily: font + ", sans-serif" }}
                      contentEditable suppressContentEditableWarning onBlur={e => setHeadline(e.currentTarget.textContent || "")}>
                      {headline}
                    </div>
                    <div className="text-sm opacity-80 mb-6 cursor-text"
                      style={{ color: textColor, fontFamily: font + ", sans-serif" }}
                      contentEditable suppressContentEditableWarning onBlur={e => setSubline(e.currentTarget.textContent || "")}>
                      {subline}
                    </div>
                    <div className="px-6 py-2 rounded-full font-black text-sm cursor-text"
                      style={{ background: textColor, color: editorBg, fontFamily: font + ", sans-serif" }}
                      contentEditable suppressContentEditableWarning onBlur={e => setCtaText(e.currentTarget.textContent || "")}>
                      {ctaText}
                    </div>
                  </div>
                  <div className="absolute bottom-3 right-3 text-xs font-black px-2 py-0.5 rounded"
                    style={{ background: "rgba(0,0,0,0.4)", color: "rgba(255,255,255,0.6)" }}>DOOHPLAY</div>
                </div>
              </div>
            </div>

            <div className="w-52 flex-shrink-0 space-y-4">
              <div className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black text-xs mb-3" style={{ color: T.textSub }}>PROPRIEDADES</h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold mb-1 block" style={{ color: T.textSub }}>TÍTULO</label>
                    <input value={headline} onChange={e => setHeadline(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg text-xs"
                      style={{ background: T.panel, border: `1px solid ${T.border}`, color: T.text }} />
                  </div>
                  <div>
                    <label className="font-bold mb-1 block" style={{ color: T.textSub }}>SUBTÍTULO</label>
                    <textarea value={subline} onChange={e => setSubline(e.target.value)} rows={2}
                      className="w-full px-2 py-1.5 rounded-lg text-xs resize-none"
                      style={{ background: T.panel, border: `1px solid ${T.border}`, color: T.text }} />
                  </div>
                  <div>
                    <label className="font-bold mb-1 block" style={{ color: T.textSub }}>CTA</label>
                    <input value={ctaText} onChange={e => setCtaText(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg text-xs"
                      style={{ background: T.panel, border: `1px solid ${T.border}`, color: T.text }} />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black text-xs mb-3" style={{ color: T.textSub }}>EXPORTAR COMO</h3>
                <div className="space-y-2">
                  {["PNG HD", "MP4 15s", "MP4 30s", "GIF animado"].map(fmt => (
                    <button key={fmt} className="w-full py-2 rounded-lg text-xs font-bold text-left px-3 hover:bg-white/5"
                      style={{ background: T.panel, color: T.textSub, border: `1px solid ${T.border}` }}>
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "library" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-black">Biblioteca de Criativos</h2>
              <div className="flex items-center gap-2">
                <button onClick={() => setTab("editor")}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black"
                  style={{ background: T.warning, color: "#000" }}>
                  <Plus size={14} /> Novo Criativo
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {LIBRARY.map(cr => {
                const sm = STATUS_META[cr.status];
                return (
                  <div key={cr.id} onClick={() => setSelectedCreative(selectedCreative === cr.id ? null : cr.id)}
                    className="p-4 rounded-2xl border cursor-pointer hover:bg-white/2"
                    style={{ background: T.card, borderColor: selectedCreative === cr.id ? T.warning + "50" : T.border }}>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-12 rounded-xl flex-shrink-0 overflow-hidden flex items-center justify-center"
                        style={{ background: `linear-gradient(135deg, ${T.primary}40, ${T.accent}20)`, border: `1px solid ${T.border}` }}>
                        <Monitor size={16} style={{ color: T.primary }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black">{cr.name}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                            style={{ background: sm.color + "20", color: sm.color }}>{sm.label}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                            style={{ background: T.primary + "20", color: T.primary }}>{cr.aspect}</span>
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: T.textSub }}>
                          {cr.campaign} · {cr.template} · {cr.lastModified} · {cr.fileSize}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button className="p-2 rounded-lg hover:bg-white/5"><Eye size={13} style={{ color: T.textSub }} /></button>
                        <button className="p-2 rounded-lg hover:bg-white/5"><Copy size={13} style={{ color: T.textSub }} /></button>
                        <button className="p-2 rounded-lg hover:bg-white/5"><Download size={13} style={{ color: T.textSub }} /></button>
                        <button className="p-2 rounded-lg hover:bg-white/5"><Trash2 size={13} style={{ color: T.danger }} /></button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
