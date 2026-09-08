import { useState } from "react";
import { ArrowLeft, Monitor, Plus, Trash2, Move, Type, Image, Square, Layout, Save, Eye, Grid, Layers, Settings, Copy } from "lucide-react";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

interface Props { onBack: () => void; onNavigate?: (v: string) => void; }

type ZoneType = "media" | "ticker" | "clock" | "qrcode" | "weather" | "social";

interface Zone {
  id: string;
  label: string;
  type: ZoneType;
  x: number; y: number;
  w: number; h: number;
  color: string;
  priority: number;
  loop: number;
  content: string;
}

const ZONE_COLORS: Record<ZoneType, string> = {
  media: "#4F6EF7", ticker: "#FFAA00", clock: "#00DC82", qrcode: "#7C5CFC", weather: "#FF4D6A", social: "#FFD700",
};

const ZONE_ICONS: Record<ZoneType, string> = {
  media: "▶", ticker: "≡", clock: "◷", qrcode: "▦", weather: "☁", social: "❤",
};

const ZONE_LABELS: Record<ZoneType, string> = {
  media: "Mídia", ticker: "Ticker", clock: "Relógio", qrcode: "QR Code", weather: "Tempo", social: "Social Feed",
};

const RESOLUTIONS = [
  { label: "Full HD Horizontal", w: 1920, h: 1080, tag: "16:9" },
  { label: "Full HD Vertical", w: 1080, h: 1920, tag: "9:16" },
  { label: "4K Horizontal", w: 3840, h: 2160, tag: "4K" },
  { label: "HD Square", w: 1080, h: 1080, tag: "1:1" },
];

const TEMPLATES: { name: string; zones: Omit<Zone,"id">[] }[] = [
  {
    name: "Tela Completa",
    zones: [
      { label: "Mídia Principal", type: "media", x: 0, y: 0, w: 100, h: 100, color: ZONE_COLORS.media, priority: 1, loop: 15, content: "" },
    ],
  },
  {
    name: "Mídia + Ticker",
    zones: [
      { label: "Vídeo/Imagem", type: "media", x: 0, y: 0, w: 100, h: 85, color: ZONE_COLORS.media, priority: 1, loop: 15, content: "" },
      { label: "Ticker de Notícias", type: "ticker", x: 0, y: 85, w: 100, h: 15, color: ZONE_COLORS.ticker, priority: 2, loop: 60, content: "Bem-vindo à DOOHPLAY" },
    ],
  },
  {
    name: "L-Shape",
    zones: [
      { label: "Conteúdo Principal", type: "media", x: 0, y: 0, w: 75, h: 100, color: ZONE_COLORS.media, priority: 1, loop: 15, content: "" },
      { label: "Sidebar Info", type: "clock", x: 75, y: 0, w: 25, h: 50, color: ZONE_COLORS.clock, priority: 2, loop: 0, content: "" },
      { label: "QR Code", type: "qrcode", x: 75, y: 50, w: 25, h: 50, color: ZONE_COLORS.qrcode, priority: 3, loop: 0, content: "doohplay.com.br" },
    ],
  },
  {
    name: "Split 3 Zonas",
    zones: [
      { label: "Zona 1", type: "media", x: 0, y: 0, w: 33, h: 100, color: ZONE_COLORS.media, priority: 1, loop: 15, content: "" },
      { label: "Zona 2", type: "media", x: 33, y: 0, w: 34, h: 100, color: ZONE_COLORS.social, priority: 2, loop: 20, content: "" },
      { label: "Zona 3", type: "media", x: 67, y: 0, w: 33, h: 100, color: ZONE_COLORS.weather, priority: 3, loop: 10, content: "" },
    ],
  },
];

let zoneCounter = 0;
function makeZone(partial: Omit<Zone,"id">): Zone {
  return { ...partial, id: `zone-${++zoneCounter}` };
}

export default function DigitalSignage({ onBack, onNavigate }: Props) {
  const [resIdx, setResIdx]         = useState(0);
  const [zones, setZones]           = useState<Zone[]>(TEMPLATES[1].zones.map(makeZone));
  const [selected, setSelected]     = useState<string | null>(null);
  const [dragging, setDragging]     = useState<string | null>(null);
  const [tab, setTab]               = useState<"zones" | "settings" | "preview">("zones");
  const [layoutName, setLayoutName] = useState("Layout Principal");
  const [saved, setSaved]           = useState(false);

  const res = RESOLUTIONS[resIdx];
  const selZone = zones.find(z => z.id === selected);

  function applyTemplate(idx: number) {
    setZones(TEMPLATES[idx].zones.map(makeZone));
    setSelected(null);
  }

  function addZone(type: ZoneType) {
    const z = makeZone({ label: ZONE_LABELS[type], type, x: 10, y: 10, w: 40, h: 30, color: ZONE_COLORS[type], priority: zones.length + 1, loop: 15, content: "" });
    setZones(prev => [...prev, z]);
    setSelected(z.id);
  }

  function deleteZone(id: string) {
    setZones(prev => prev.filter(z => z.id !== id));
    if (selected === id) setSelected(null);
  }

  function updateZone(id: string, patch: Partial<Zone>) {
    setZones(prev => prev.map(z => z.id === id ? { ...z, ...patch } : z));
  }

  function saveLayout() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5">
              <ArrowLeft size={18} style={{ color: T.textSub }} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.primary + "20" }}>
                <Layout size={18} style={{ color: T.primary }} />
              </div>
              <div>
                <h1 className="font-black text-lg">Digital Signage</h1>
                <p className="text-xs" style={{ color: T.textSub }}>Configurador de layout de telas</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {["zones","settings","preview"].map(t => (
              <button key={t} onClick={() => setTab(t as any)}
                className="px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all"
                style={{ background: tab === t ? T.primary + "25" : "transparent", color: tab === t ? T.primary : T.textSub, border: `1px solid ${tab === t ? T.primary + "40" : "transparent"}` }}>
                {t === "zones" ? "Zonas" : t === "settings" ? "Config" : "Preview"}
              </button>
            ))}
            <button onClick={saveLayout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black ml-2"
              style={{ background: saved ? T.success : T.primary, color: "#fff" }}>
              <Save size={13} />
              {saved ? "Salvo!" : "Salvar"}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden" style={{ minHeight: 0 }}>
        <div className="w-72 border-r overflow-y-auto" style={{ borderColor: T.border, background: T.panel }}>
          {tab === "zones" && (
            <div className="p-4 space-y-4">
              <div>
                <label className="text-xs font-bold block mb-1.5" style={{ color: T.textSub }}>NOME DO LAYOUT</label>
                <input value={layoutName} onChange={e => setLayoutName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-sm"
                  style={{ background: T.card, border: `1px solid ${T.border}`, color: T.text }} />
              </div>
              <div>
                <label className="text-xs font-bold block mb-1.5" style={{ color: T.textSub }}>RESOLUÇÃO</label>
                <div className="space-y-1">
                  {RESOLUTIONS.map((r, i) => (
                    <button key={i} onClick={() => setResIdx(i)}
                      className="w-full px-3 py-2 rounded-xl text-sm text-left flex items-center justify-between"
                      style={{ background: resIdx === i ? T.primary + "20" : T.card, color: resIdx === i ? T.primary : T.textSub, border: `1px solid ${resIdx === i ? T.primary + "30" : T.border}` }}>
                      <span>{r.label}</span>
                      <span className="text-xs font-bold">{r.tag}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold block mb-1.5" style={{ color: T.textSub }}>TEMPLATES</label>
                <div className="grid grid-cols-2 gap-2">
                  {TEMPLATES.map((tpl, i) => (
                    <button key={i} onClick={() => applyTemplate(i)}
                      className="py-2 px-3 rounded-xl text-xs font-bold"
                      style={{ background: T.card, color: T.textSub, border: `1px solid ${T.border}` }}>
                      {tpl.name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold block mb-1.5" style={{ color: T.textSub }}>ADICIONAR ZONA</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(Object.keys(ZONE_COLORS) as ZoneType[]).map(type => (
                    <button key={type} onClick={() => addZone(type)}
                      className="py-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1"
                      style={{ background: ZONE_COLORS[type] + "15", color: ZONE_COLORS[type], border: `1px solid ${ZONE_COLORS[type]}25` }}>
                      <span className="text-base">{ZONE_ICONS[type]}</span>
                      <span>{ZONE_LABELS[type]}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold block mb-1.5" style={{ color: T.textSub }}>ZONAS ({zones.length})</label>
                <div className="space-y-1.5">
                  {zones.map(z => (
                    <div key={z.id} onClick={() => setSelected(z.id === selected ? null : z.id)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer"
                      style={{ background: selected === z.id ? z.color + "20" : T.card, border: `1px solid ${selected === z.id ? z.color + "40" : T.border}` }}>
                      <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: z.color }} />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold truncate">{z.label}</div>
                        <div className="text-xs" style={{ color: T.textSub }}>{ZONE_LABELS[z.type]} · {z.w}×{z.h}%</div>
                      </div>
                      <button onClick={e => { e.stopPropagation(); deleteZone(z.id); }}
                        className="p-1 rounded hover:bg-white/5 flex-shrink-0">
                        <Trash2 size={11} style={{ color: T.danger }} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              {selZone && (
                <div className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: selZone.color + "30" }}>
                  <div className="text-xs font-bold mb-3" style={{ color: selZone.color }}>EDITAR ZONA</div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs" style={{ color: T.textSub }}>Label</label>
                      <input value={selZone.label} onChange={e => updateZone(selZone.id, { label: e.target.value })}
                        className="w-full px-2 py-1.5 rounded-lg text-xs mt-1"
                        style={{ background: T.panel, border: `1px solid ${T.border}`, color: T.text }} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {(["x","y","w","h"] as const).map(prop => (
                        <div key={prop}>
                          <label className="text-xs uppercase" style={{ color: T.textSub }}>{prop} %</label>
                          <input type="number" min={0} max={100} value={selZone[prop]}
                            onChange={e => updateZone(selZone.id, { [prop]: +e.target.value } as any)}
                            className="w-full px-2 py-1.5 rounded-lg text-xs mt-1"
                            style={{ background: T.panel, border: `1px solid ${T.border}`, color: T.text }} />
                        </div>
                      ))}
                    </div>
                    <div>
                      <label className="text-xs" style={{ color: T.textSub }}>Loop (seg, 0=fixo)</label>
                      <input type="number" min={0} value={selZone.loop}
                        onChange={e => updateZone(selZone.id, { loop: +e.target.value })}
                        className="w-full px-2 py-1.5 rounded-lg text-xs mt-1"
                        style={{ background: T.panel, border: `1px solid ${T.border}`, color: T.text }} />
                    </div>
                    {(selZone.type === "ticker" || selZone.type === "qrcode") && (
                      <div>
                        <label className="text-xs" style={{ color: T.textSub }}>Conteúdo</label>
                        <input value={selZone.content} onChange={e => updateZone(selZone.id, { content: e.target.value })}
                          className="w-full px-2 py-1.5 rounded-lg text-xs mt-1"
                          style={{ background: T.panel, border: `1px solid ${T.border}`, color: T.text }} />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          {tab === "settings" && (
            <div className="p-4 space-y-4">
              {[
                { label: "FPS do loop", options: ["24", "30", "60"], def: "30" },
                { label: "Transição", options: ["Fade", "Slide", "Zoom", "Nenhuma"], def: "Fade" },
                { label: "Duração padrão (seg)", options: ["5","10","15","20","30"], def: "15" },
                { label: "Prioridade por horário", options: ["Sim", "Não"], def: "Sim" },
                { label: "Fallback offline", options: ["Logo estático", "Relógio", "Imagem padrão"], def: "Logo estático" },
              ].map(s => (
                <div key={s.label}>
                  <label className="text-xs font-bold block mb-1.5" style={{ color: T.textSub }}>{s.label.toUpperCase()}</label>
                  <select className="w-full px-3 py-2 rounded-xl text-sm"
                    style={{ background: T.card, border: `1px solid ${T.border}`, color: T.text }}>
                    {s.options.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              ))}
              <div className="p-3 rounded-xl border" style={{ background: T.card, borderColor: T.warning + "30" }}>
                <div className="text-xs font-bold mb-1" style={{ color: T.warning }}>MODO EMERGÊNCIA</div>
                <p className="text-xs" style={{ color: T.textSub }}>Ativa conteúdo de segurança em todas as telas deste layout imediatamente.</p>
                <button className="mt-2 w-full py-1.5 rounded-lg text-xs font-bold" style={{ background: T.danger + "20", color: T.danger }}>
                  Ativar Modo Emergência
                </button>
              </div>
            </div>
          )}
          {tab === "preview" && (
            <div className="p-4 space-y-3">
              <div className="text-xs font-bold" style={{ color: T.textSub }}>TELAS VINCULADAS</div>
              {["Shopping Ibirapuera P1", "Metro Paulista L01", "Aeroporto GRU T2", "Av. Paulista 900"].map((screen, i) => (
                <div key={i} className="flex items-center gap-2 p-3 rounded-xl" style={{ background: T.card, border: `1px solid ${T.border}` }}>
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: T.success }} />
                  <div>
                    <div className="text-xs font-bold">{screen}</div>
                    <div className="text-xs" style={{ color: T.textSub }}>Online · {RESOLUTIONS[resIdx].tag}</div>
                  </div>
                </div>
              ))}
              <button className="w-full py-2 rounded-xl text-sm font-bold mt-2"
                style={{ background: T.primary + "20", color: T.primary, border: `1px solid ${T.primary}30` }}>
                Aplicar em Todas
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 flex items-center justify-center p-8" style={{ background: "#02030A" }}>
          <div className="relative" style={{
            width: Math.min(800, res.w * 0.4),
            height: Math.min(450, res.h * 0.4 * (res.w > res.h ? 1 : res.w / res.h)),
            background: "#000",
            borderRadius: 4,
            overflow: "hidden",
            boxShadow: "0 0 0 1px #1A1D35, 0 20px 80px rgba(0,0,0,0.7)",
          }}>
            <div className="absolute inset-0 pointer-events-none" style={{
              backgroundImage: `repeating-linear-gradient(0deg,transparent,transparent calc(10% - 1px),#ffffff08 calc(10% - 1px),#ffffff08 10%),repeating-linear-gradient(90deg,transparent,transparent calc(10% - 1px),#ffffff08 calc(10% - 1px),#ffffff08 10%)`,
            }} />
            {zones.map(z => {
              const canvasW = Math.min(800, res.w * 0.4);
              const canvasH = Math.min(450, res.h * 0.4 * (res.w > res.h ? 1 : res.w / res.h));
              const px = (z.x / 100) * canvasW;
              const py = (z.y / 100) * canvasH;
              const pw = (z.w / 100) * canvasW;
              const ph = (z.h / 100) * canvasH;
              const isSel = selected === z.id;
              return (
                <div key={z.id} onClick={() => setSelected(isSel ? null : z.id)}
                  className="absolute cursor-pointer flex items-center justify-center"
                  style={{
                    left: px, top: py, width: pw, height: ph,
                    background: z.color + (isSel ? "50" : "30"),
                    border: `2px solid ${z.color}${isSel ? "FF" : "60"}`,
                    boxShadow: isSel ? `0 0 16px ${z.color}60` : "none",
                    transition: "all 0.15s",
                  }}>
                  <div className="text-center pointer-events-none select-none" style={{ padding: "4px" }}>
                    <div style={{ fontSize: Math.max(10, pw * 0.12), color: z.color, fontWeight: 900 }}>{ZONE_ICONS[z.type]}</div>
                    {pw > 60 && ph > 30 && (
                      <div style={{ fontSize: Math.max(8, Math.min(12, pw * 0.06)), color: "#fff", fontWeight: 700, opacity: 0.9, marginTop: 2 }}>{z.label}</div>
                    )}
                    {pw > 80 && ph > 50 && (
                      <div style={{ fontSize: Math.max(7, Math.min(9, pw * 0.04)), color: z.color, opacity: 0.8, marginTop: 1 }}>{z.w}×{z.h}%</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-2 rounded-xl"
            style={{ background: T.card, border: `1px solid ${T.border}` }}>
            <Monitor size={13} style={{ color: T.textSub }} />
            <span className="text-xs font-bold" style={{ color: T.textSub }}>
              {res.w}×{res.h}px · {res.tag} · {zones.length} zona{zones.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
