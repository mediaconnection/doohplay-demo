import { useState } from "react";
import {
  ArrowLeft, Type, Image, Square, Circle, Play, Download, Trash2, Plus,
  AlignLeft, AlignCenter, AlignRight, Bold, Italic, Layers, Monitor,
  Smartphone, Tv, Wand2, Copy, Eye, Save, ChevronDown,
} from "lucide-react";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

interface Props { onBack: () => void; onNavigate?: (v: string) => void; }

type Tool = "select" | "text" | "image" | "shape" | "bg";
type Align = "left" | "center" | "right";

interface Layer {
  id: number; type: "text" | "image" | "shape";
  x: number; y: number; w: number; h: number;
  content?: string; fontSize?: number; fontWeight?: string;
  color?: string; bgColor?: string; align?: Align;
  shape?: "rect" | "circle"; opacity?: number;
}

const RATIOS = [
  { label: "16:9 Full HD", w: 1920, h: 1080, icon: Tv },
  { label: "9:16 Vertical", w: 1080, h: 1920, icon: Smartphone },
  { label: "1:1 Square", w: 1080, h: 1080, icon: Square },
  { label: "4:3 Classic", w: 1024, h: 768, icon: Monitor },
];

const PALETTE = [
  "#4F6EF7", "#7C5CFC", "#00DC82", "#FFAA00", "#FF4D6A",
  "#FFD700", "#00A8FF", "#FF6B6B", "#FFFFFF", "#ECF0FF",
  "#1A1D35", "#0F1120", "#05060E", "#FF9F43", "#00D2D3",
];

const TEMPLATES = [
  { name: "Promoção Verão", bg: "linear-gradient(135deg,#4F6EF7,#7C5CFC)", text: "50% OFF", sub: "Só hoje!" },
  { name: "Flash Sale", bg: "linear-gradient(135deg,#FF4D6A,#FFAA00)", text: "FLASH SALE", sub: "Últimas vagas" },
  { name: "Lançamento", bg: "linear-gradient(135deg,#00DC82,#4F6EF7)", text: "NOVO", sub: "Confira agora" },
  { name: "Institucional", bg: "linear-gradient(135deg,#0F1120,#1A1D35)", text: "Sua Marca", sub: "Qualidade e confiança" },
  { name: "Evento", bg: "linear-gradient(135deg,#FFD700,#FF6B6B)", text: "EVENTO", sub: "Não perca!" },
  { name: "Cardápio", bg: "linear-gradient(135deg,#00A8FF,#00DC82)", text: "Menu Especial", sub: "Peça já" },
];

let nextId = 10;

const defaultLayers = (): Layer[] => [
  { id: 1, type: "shape", x: 0, y: 0, w: 100, h: 100, shape: "rect", bgColor: T.primary, opacity: 100 },
  { id: 2, type: "text", x: 10, y: 35, w: 80, h: 15, content: "Sua Campanha Aqui", fontSize: 32, fontWeight: "900", color: "#FFFFFF", align: "center" },
  { id: 3, type: "text", x: 20, y: 55, w: 60, h: 10, content: "Subtítulo impactante", fontSize: 16, fontWeight: "400", color: "#FFFFFFCC", align: "center" },
];

export default function AdCreativeStudio({ onBack, onNavigate }: Props) {
  const [layers, setLayers] = useState<Layer[]>(defaultLayers());
  const [selected, setSelected] = useState<number | null>(2);
  const [tool, setTool] = useState<Tool>("select");
  const [ratio, setRatio] = useState(0);
  const [bgGradient, setBgGradient] = useState(`linear-gradient(135deg,${T.primary},${T.accent})`);
  const [showTemplates, setShowTemplates] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const selectedLayer = layers.find(l => l.id === selected);
  const ratioData = RATIOS[ratio];
  const aspect = ratioData.h / ratioData.w;

  const updateLayer = (id: number, patch: Partial<Layer>) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, ...patch } : l));
  };

  const addText = () => {
    const id = nextId++;
    setLayers(prev => [...prev, { id, type: "text", x: 20, y: 45, w: 60, h: 12, content: "Novo texto", fontSize: 24, fontWeight: "700", color: "#FFFFFF", align: "center" }]);
    setSelected(id);
    setTool("select");
  };

  const addShape = (shape: "rect" | "circle") => {
    const id = nextId++;
    setLayers(prev => [...prev, { id, type: "shape", x: 30, y: 30, w: 40, h: 40, shape, bgColor: T.success, opacity: 80 }]);
    setSelected(id);
    setTool("select");
  };

  const deleteLayer = (id: number) => {
    setLayers(prev => prev.filter(l => l.id !== id));
    if (selected === id) setSelected(null);
  };

  const duplicateLayer = (id: number) => {
    const src = layers.find(l => l.id === id);
    if (!src) return;
    const newId = nextId++;
    setLayers(prev => [...prev, { ...src, id: newId, x: src.x + 5, y: src.y + 5 }]);
    setSelected(newId);
  };

  const applyTemplate = (t: typeof TEMPLATES[0]) => {
    setBgGradient(t.bg);
    setLayers([
      { id: nextId++, type: "shape", x: 0, y: 0, w: 100, h: 100, shape: "rect", bgColor: "transparent", opacity: 100 },
      { id: nextId++, type: "text", x: 10, y: 30, w: 80, h: 20, content: t.text, fontSize: 40, fontWeight: "900", color: "#FFFFFF", align: "center" },
      { id: nextId++, type: "text", x: 15, y: 58, w: 70, h: 12, content: t.sub, fontSize: 18, fontWeight: "400", color: "#FFFFFFCC", align: "center" },
    ]);
    setShowTemplates(false);
  };

  const renderLayerContent = (l: Layer) => {
    if (l.type === "text") {
      return (
        <div style={{
          position: "absolute", left: `${l.x}%`, top: `${l.y}%`, width: `${l.w}%`, height: `${l.h}%`,
          display: "flex", alignItems: "center", justifyContent: l.align === "center" ? "center" : l.align === "right" ? "flex-end" : "flex-start",
          fontSize: l.fontSize ? `${l.fontSize * 0.6}%` : "4%",
          fontWeight: l.fontWeight, color: l.color, textAlign: l.align,
          cursor: "pointer", userSelect: "none",
          outline: selected === l.id ? `2px solid ${T.primary}` : "none",
          outlineOffset: 2,
        }} onClick={() => setSelected(l.id)}>
          {l.content}
        </div>
      );
    }
    if (l.type === "shape") {
      return (
        <div style={{
          position: "absolute", left: `${l.x}%`, top: `${l.y}%`, width: `${l.w}%`, height: `${l.h}%`,
          background: l.bgColor, opacity: (l.opacity ?? 100) / 100,
          borderRadius: l.shape === "circle" ? "50%" : 8,
          cursor: "pointer",
          outline: selected === l.id ? `2px solid ${T.primary}` : "none",
        }} onClick={() => setSelected(l.id)} />
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="border-b flex-shrink-0" style={{ background: T.panel, borderColor: T.border }}>
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5"><ArrowLeft size={16} style={{ color: T.textSub }} /></button>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: T.accent + "20" }}>
              <Layers size={16} style={{ color: T.accent }} />
            </div>
            <span className="font-black text-base">Creative Studio</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: T.accent + "20", color: T.accent }}>BETA</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Ratio selector */}
            <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: T.card, border: `1px solid ${T.border}` }}>
              {RATIOS.map((r, i) => (
                <button key={i} onClick={() => setRatio(i)}
                  className="p-1.5 rounded-md transition-all"
                  style={{ background: ratio === i ? T.primary + "30" : "transparent" }}
                  title={r.label}>
                  <r.icon size={14} style={{ color: ratio === i ? T.primary : T.textSub }} />
                </button>
              ))}
            </div>
            <button onClick={() => setShowTemplates(v => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold"
              style={{ background: T.card, color: T.textSub, border: `1px solid ${T.border}` }}>
              <Wand2 size={13} /> Templates <ChevronDown size={12} />
            </button>
            <button onClick={() => setPreviewMode(v => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold"
              style={{ background: previewMode ? T.primary + "30" : T.card, color: previewMode ? T.primary : T.textSub, border: `1px solid ${previewMode ? T.primary + "40" : T.border}` }}>
              <Eye size={13} /> Preview
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold"
              style={{ background: T.success + "20", color: T.success, border: `1px solid ${T.success}30` }}>
              <Save size={13} /> Salvar
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold"
              style={{ background: T.primary, color: "#fff" }}>
              <Download size={13} /> Exportar
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left toolbar */}
        {!previewMode && (
          <div className="w-14 border-r flex flex-col items-center py-4 gap-2 flex-shrink-0" style={{ background: T.panel, borderColor: T.border }}>
            {[
              { id: "select" as Tool, icon: Layers, label: "Selecionar" },
              { id: "text" as Tool, icon: Type, label: "Texto", action: addText },
              { id: "image" as Tool, icon: Image, label: "Imagem" },
              { id: "bg" as Tool, icon: Square, label: "Fundo" },
            ].map(t => (
              <button key={t.id} onClick={() => { setTool(t.id); t.action?.(); }} title={t.label}
                className="w-9 h-9 rounded-lg flex items-center justify-center transition-all"
                style={{ background: tool === t.id ? T.primary + "25" : "transparent", color: tool === t.id ? T.primary : T.textSub }}>
                <t.icon size={16} />
              </button>
            ))}
            <div className="w-8 h-px my-2" style={{ background: T.border }} />
            <button onClick={() => addShape("rect")} title="Retângulo"
              className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-white/5" style={{ color: T.textSub }}>
              <Square size={16} />
            </button>
            <button onClick={() => addShape("circle")} title="Círculo"
              className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-white/5" style={{ color: T.textSub }}>
              <Circle size={16} />
            </button>
            <button title="Animação"
              className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-white/5" style={{ color: T.textSub }}>
              <Play size={16} />
            </button>
          </div>
        )}

        {/* Canvas area */}
        <div className="flex-1 flex items-center justify-center p-8 overflow-auto" style={{ background: "#020308" }}>
          <div style={{ position: "relative", width: "min(640px,80vw)", aspectRatio: `${ratioData.w}/${ratioData.h}` }}>
            {/* Canvas */}
            <div onClick={(e) => { if (e.target === e.currentTarget) setSelected(null); }}
              style={{
                width: "100%", height: "100%",
                background: bgGradient,
                borderRadius: 8, overflow: "hidden",
                position: "relative",
                boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
              }}>
              {layers.map(l => (
                <div key={l.id}>{renderLayerContent(l)}</div>
              ))}
            </div>
            {/* Ratio label */}
            <div className="absolute -bottom-7 left-0 text-xs" style={{ color: T.textSub }}>
              {ratioData.label} · {ratioData.w}×{ratioData.h}px
            </div>
          </div>
        </div>

        {/* Right panel */}
        {!previewMode && (
          <div className="w-72 border-l flex flex-col" style={{ background: T.panel, borderColor: T.border }}>
            {/* Layers */}
            <div className="p-3 border-b" style={{ borderColor: T.border }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold" style={{ color: T.textSub }}>CAMADAS ({layers.length})</span>
                <button onClick={addText} className="p-1 rounded-md hover:bg-white/5">
                  <Plus size={13} style={{ color: T.primary }} />
                </button>
              </div>
              <div className="space-y-1 max-h-36 overflow-y-auto">
                {[...layers].reverse().map(l => (
                  <div key={l.id} onClick={() => setSelected(l.id)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-all"
                    style={{ background: selected === l.id ? T.primary + "20" : "transparent" }}>
                    <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                      style={{ background: l.type === "text" ? T.accent + "30" : T.success + "30" }}>
                      {l.type === "text" ? <Type size={9} style={{ color: T.accent }} /> : <Square size={9} style={{ color: T.success }} />}
                    </div>
                    <span className="text-xs flex-1 truncate" style={{ color: selected === l.id ? T.text : T.textSub }}>
                      {l.type === "text" ? l.content?.slice(0, 20) : l.shape}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                      <button onClick={e => { e.stopPropagation(); duplicateLayer(l.id); }} className="hover:text-white">
                        <Copy size={10} style={{ color: T.textSub }} />
                      </button>
                      <button onClick={e => { e.stopPropagation(); deleteLayer(l.id); }} className="hover:text-red-400">
                        <Trash2 size={10} style={{ color: T.danger + "80" }} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Properties */}
            <div className="flex-1 overflow-y-auto p-3 space-y-4">
              {/* Background */}
              <div>
                <div className="text-xs font-bold mb-2" style={{ color: T.textSub }}>FUNDO</div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    `linear-gradient(135deg,${T.primary},${T.accent})`,
                    `linear-gradient(135deg,${T.danger},${T.warning})`,
                    `linear-gradient(135deg,${T.success},${T.primary})`,
                    `linear-gradient(135deg,${T.gold},#FF6B6B)`,
                    `linear-gradient(135deg,#0F1120,#1A1D35)`,
                    `linear-gradient(135deg,#00A8FF,${T.success})`,
                  ].map((g, i) => (
                    <button key={i} onClick={() => setBgGradient(g)}
                      className="w-8 h-8 rounded-lg transition-all"
                      style={{ background: g, outline: bgGradient === g ? `2px solid white` : "none", outlineOffset: 2 }} />
                  ))}
                </div>
              </div>

              {/* Selected layer properties */}
              {selectedLayer && (
                <>
                  <div className="h-px" style={{ background: T.border }} />
                  <div className="text-xs font-bold" style={{ color: T.textSub }}>PROPRIEDADES</div>

                  {selectedLayer.type === "text" && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs mb-1 block" style={{ color: T.textSub }}>Texto</label>
                        <input value={selectedLayer.content ?? ""}
                          onChange={e => updateLayer(selectedLayer.id, { content: e.target.value })}
                          className="w-full px-2 py-1.5 rounded-lg text-sm"
                          style={{ background: T.card, border: `1px solid ${T.border}`, color: T.text }} />
                      </div>
                      <div>
                        <label className="text-xs mb-1 block" style={{ color: T.textSub }}>Tamanho ({selectedLayer.fontSize}px)</label>
                        <input type="range" min={8} max={96} value={selectedLayer.fontSize ?? 24}
                          onChange={e => updateLayer(selectedLayer.id, { fontSize: Number(e.target.value) })}
                          className="w-full accent-blue-500" />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => updateLayer(selectedLayer.id, { fontWeight: selectedLayer.fontWeight === "900" ? "400" : "900" })}
                          className="p-1.5 rounded-md"
                          style={{ background: selectedLayer.fontWeight === "900" ? T.primary + "30" : T.card, color: selectedLayer.fontWeight === "900" ? T.primary : T.textSub }}>
                          <Bold size={13} />
                        </button>
                        {(["left","center","right"] as Align[]).map(a => {
                          const Icon = a === "left" ? AlignLeft : a === "center" ? AlignCenter : AlignRight;
                          return (
                            <button key={a} onClick={() => updateLayer(selectedLayer.id, { align: a })}
                              className="p-1.5 rounded-md"
                              style={{ background: selectedLayer.align === a ? T.primary + "30" : T.card, color: selectedLayer.align === a ? T.primary : T.textSub }}>
                              <Icon size={13} />
                            </button>
                          );
                        })}
                      </div>
                      <div>
                        <label className="text-xs mb-1.5 block" style={{ color: T.textSub }}>Cor do texto</label>
                        <div className="flex flex-wrap gap-1">
                          {PALETTE.map(c => (
                            <button key={c} onClick={() => updateLayer(selectedLayer.id, { color: c })}
                              className="w-6 h-6 rounded-md"
                              style={{ background: c, outline: selectedLayer.color === c ? `2px solid white` : "none", outlineOffset: 1 }} />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedLayer.type === "shape" && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs mb-1.5 block" style={{ color: T.textSub }}>Cor de preenchimento</label>
                        <div className="flex flex-wrap gap-1">
                          {PALETTE.map(c => (
                            <button key={c} onClick={() => updateLayer(selectedLayer.id, { bgColor: c })}
                              className="w-6 h-6 rounded-md"
                              style={{ background: c, outline: selectedLayer.bgColor === c ? `2px solid white` : "none", outlineOffset: 1 }} />
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs mb-1 block" style={{ color: T.textSub }}>Opacidade ({selectedLayer.opacity ?? 100}%)</label>
                        <input type="range" min={10} max={100} value={selectedLayer.opacity ?? 100}
                          onChange={e => updateLayer(selectedLayer.id, { opacity: Number(e.target.value) })}
                          className="w-full accent-blue-500" />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button onClick={() => duplicateLayer(selectedLayer.id)}
                      className="flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1"
                      style={{ background: T.card, color: T.textSub, border: `1px solid ${T.border}` }}>
                      <Copy size={11} /> Duplicar
                    </button>
                    <button onClick={() => deleteLayer(selectedLayer.id)}
                      className="flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1"
                      style={{ background: T.danger + "20", color: T.danger, border: `1px solid ${T.danger}30` }}>
                      <Trash2 size={11} /> Excluir
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Template picker */}
      {showTemplates && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-6" style={{ background: "rgba(0,0,0,0.6)" }}
          onClick={() => setShowTemplates(false)}>
          <div className="w-full max-w-2xl p-5 rounded-3xl border" style={{ background: T.panel, borderColor: T.border }}
            onClick={e => e.stopPropagation()}>
            <h3 className="font-black text-lg mb-4">Templates prontos</h3>
            <div className="grid grid-cols-3 gap-3">
              {TEMPLATES.map((t, i) => (
                <button key={i} onClick={() => applyTemplate(t)}
                  className="rounded-2xl overflow-hidden border transition-all hover:scale-105"
                  style={{ borderColor: T.border }}>
                  <div className="h-24 flex flex-col items-center justify-center p-3" style={{ background: t.bg }}>
                    <div className="font-black text-white text-sm">{t.text}</div>
                    <div className="text-white/70 text-xs">{t.sub}</div>
                  </div>
                  <div className="py-2 text-xs font-bold" style={{ background: T.card, color: T.textSub }}>{t.name}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
