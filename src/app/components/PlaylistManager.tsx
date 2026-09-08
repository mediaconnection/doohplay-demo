import { useState, useRef } from "react";
import { ArrowLeft, Play, Pause, Trash2, GripVertical, Plus, Clock, Image, Video, Music, Zap, Eye, Copy, CheckCircle, Settings, ChevronDown, ChevronUp, AlertTriangle, Radio } from "lucide-react";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

type ContentType = "image" | "video" | "channel" | "ai";
type SlotStatus = "active" | "scheduled" | "expired";

interface PlaylistItem {
  id: string;
  title: string;
  type: ContentType;
  duration: number;
  weight: number;
  source: string;
  active: boolean;
  thumb: string;
}

interface TimeSlot {
  id: string;
  label: string;
  start: string;
  end: string;
  items: PlaylistItem[];
  cpmBoost: number;
}

const TYPE_CONFIG: Record<ContentType, { icon: typeof Image; color: string; label: string }> = {
  image:   { icon: Image,  color: T.primary, label: "Imagem" },
  video:   { icon: Video,  color: T.accent,  label: "Vídeo" },
  channel: { icon: Radio,  color: T.success, label: "Canal DOOHPLAY" },
  ai:      { icon: Zap,    color: T.gold,    label: "Gerado por IA" },
};

const LIBRARY: PlaylistItem[] = [
  { id: "l1", title: "Promoção Corte + Barba",    type: "image",   duration: 15, weight: 40, source: "upload", active: true, thumb: "photo-1503951914875-452162b0f3f1" },
  { id: "l2", title: "Vídeo Institucional 2026",  type: "video",   duration: 30, weight: 30, source: "upload", active: true, thumb: "photo-1595078475328-1ab05d0a6a0e" },
  { id: "l3", title: "Canal Entretenimento",       type: "channel", duration: 60, weight: 20, source: "doohplay", active: true, thumb: "photo-1522869635100-9f4c5e86aa37" },
  { id: "l4", title: "Anúncio Nike — Gerado IA",  type: "ai",      duration: 15, weight: 10, source: "ai", active: true, thumb: "photo-1542291026-7eec264c27ff" },
  { id: "l5", title: "Cardápio do Dia",            type: "image",   duration: 10, weight: 25, source: "upload", active: false, thumb: "photo-1414235077428-338989a2e8c0" },
  { id: "l6", title: "Canal Notícias",             type: "channel", duration: 60, weight: 15, source: "doohplay", active: true, thumb: "photo-1504711434969-e33886168f5c" },
];

const DEFAULT_SLOTS: TimeSlot[] = [
  {
    id: "s1", label: "Manhã", start: "06:00", end: "11:59", cpmBoost: 0,
    items: [LIBRARY[0], LIBRARY[2], LIBRARY[1]],
  },
  {
    id: "s2", label: "Tarde", start: "12:00", end: "17:59", cpmBoost: 15,
    items: [LIBRARY[0], LIBRARY[3], LIBRARY[2]],
  },
  {
    id: "s3", label: "Prime Time", start: "18:00", end: "21:59", cpmBoost: 63,
    items: [LIBRARY[1], LIBRARY[0], LIBRARY[3], LIBRARY[2]],
  },
  {
    id: "s4", label: "Noite", start: "22:00", end: "05:59", cpmBoost: -20,
    items: [LIBRARY[2], LIBRARY[5]],
  },
];

function WeightBar({ items }: { items: PlaylistItem[] }) {
  const total = items.reduce((a, i) => a + (i.active ? i.weight : 0), 0) || 1;
  const colors = [T.primary, T.accent, T.success, T.gold, T.warning, T.danger];
  return (
    <div className="flex h-2 rounded-full overflow-hidden gap-px">
      {items.filter(i => i.active).map((item, idx) => (
        <div key={item.id} style={{ width: `${(item.weight / total) * 100}%`, background: colors[idx % colors.length], minWidth: 2 }} />
      ))}
    </div>
  );
}

interface Props {
  onBack: () => void;
  onNavigate?: (view: string) => void;
}

export default function PlaylistManager({ onBack, onNavigate }: Props) {
  const [slots, setSlots] = useState<TimeSlot[]>(DEFAULT_SLOTS);
  const [activeSlot, setActiveSlot] = useState<string | null>("s3");
  const [tab, setTab] = useState<"playlist" | "library" | "preview">("playlist");
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [previewIdx, setPreviewIdx] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addToSlot, setAddToSlot] = useState<string | null>(null);

  const currentSlot = slots.find(s => s.id === activeSlot) ?? slots[0];
  const totalDuration = currentSlot.items.reduce((a, i) => a + (i.active ? i.duration : 0), 0);
  const activeItems = currentSlot.items.filter(i => i.active);
  const totalWeight = activeItems.reduce((a, i) => a + i.weight, 0);

  const removeFromSlot = (slotId: string, itemId: string) => {
    setSlots(prev => prev.map(s => s.id === slotId ? { ...s, items: s.items.filter(i => i.id !== itemId) } : s));
  };

  const toggleItem = (slotId: string, itemId: string) => {
    setSlots(prev => prev.map(s =>
      s.id === slotId ? { ...s, items: s.items.map(i => i.id === itemId ? { ...i, active: !i.active } : i) } : s
    ));
  };

  const moveItem = (slotId: string, fromIdx: number, toIdx: number) => {
    setSlots(prev => prev.map(s => {
      if (s.id !== slotId) return s;
      const items = [...s.items];
      const [moved] = items.splice(fromIdx, 1);
      items.splice(toIdx, 0, moved);
      return { ...s, items };
    }));
  };

  const addFromLibrary = (slotId: string, item: PlaylistItem) => {
    setSlots(prev => prev.map(s =>
      s.id === slotId ? { ...s, items: [...s.items, { ...item, id: `${item.id}-${Date.now()}` }] } : s
    ));
    setShowAddModal(false);
  };

  const colors = [T.primary, T.accent, T.success, T.gold, T.warning, T.danger];

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5"><ArrowLeft size={18} style={{ color: T.textSub }} /></button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.primary + "20" }}>
              <Play size={18} style={{ color: T.primary }} />
            </div>
            <div>
              <h1 className="font-black text-lg">Gerenciar Playlist</h1>
              <p className="text-xs" style={{ color: T.textSub }}>Barbearia Zimerman · {slots.reduce((a, s) => a + s.items.filter(i => i.active).length, 0)} itens ativos</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
            style={{ background: T.success + "15", color: T.success }}>
            <Radio size={10} className="animate-pulse" /> AO VIVO
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-6 pb-0 flex gap-1">
          {(["playlist", "library", "preview"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="px-4 py-2.5 text-sm font-medium border-b-2 transition-all capitalize"
              style={{ borderColor: tab === t ? T.primary : "transparent", color: tab === t ? T.primary : T.textSub }}>
              {t === "playlist" ? "Playlist" : t === "library" ? "Biblioteca" : "Prévia"}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6 space-y-5">

        {/* PLAYLIST */}
        {tab === "playlist" && (
          <>
            {/* Slot selector */}
            <div className="grid grid-cols-4 gap-2">
              {slots.map(slot => (
                <button key={slot.id} onClick={() => setActiveSlot(slot.id)}
                  className="p-2.5 rounded-xl border text-center transition-all"
                  style={{
                    background: activeSlot === slot.id ? T.primary + "15" : T.card,
                    borderColor: activeSlot === slot.id ? T.primary : T.border,
                  }}>
                  <div className="text-xs font-black mb-0.5" style={{ color: activeSlot === slot.id ? T.primary : T.text }}>{slot.label}</div>
                  <div className="text-xs" style={{ color: T.textSub }}>{slot.start}</div>
                  {slot.cpmBoost !== 0 && (
                    <div className="text-xs font-bold mt-0.5" style={{ color: slot.cpmBoost > 0 ? T.success : T.danger }}>
                      {slot.cpmBoost > 0 ? "+" : ""}{slot.cpmBoost}% CPM
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Slot info */}
            <div className="rounded-2xl border p-4" style={{ background: T.card, borderColor: T.border }}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="font-bold">{currentSlot.label}</span>
                  <span className="text-xs ml-2" style={{ color: T.textSub }}>{currentSlot.start} – {currentSlot.end}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span style={{ color: T.textSub }}>{activeItems.length} itens</span>
                  <span style={{ color: T.textSub }}>·</span>
                  <span style={{ color: T.primary }}>{totalDuration}s / loop</span>
                  {currentSlot.cpmBoost > 0 && (
                    <span className="px-2 py-0.5 rounded-full font-bold" style={{ background: T.success + "15", color: T.success }}>
                      +{currentSlot.cpmBoost}% CPM
                    </span>
                  )}
                </div>
              </div>
              <WeightBar items={currentSlot.items} />
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {activeItems.map((item, idx) => {
                  const tc = TYPE_CONFIG[item.type];
                  return (
                    <div key={item.id} className="flex items-center gap-1 text-xs">
                      <div className="w-2 h-2 rounded-full" style={{ background: colors[idx % colors.length] }} />
                      <span style={{ color: T.textSub }}>{item.title.slice(0, 16)}…</span>
                      <span className="font-bold" style={{ color: colors[idx % colors.length] }}>{Math.round((item.weight / totalWeight) * 100)}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Items list */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm">Conteúdo do slot</h3>
                <button onClick={() => { setAddToSlot(currentSlot.id); setShowAddModal(true); }}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl font-bold"
                  style={{ background: T.primary + "20", color: T.primary, border: `1px solid ${T.primary}30` }}>
                  <Plus size={12} /> Adicionar
                </button>
              </div>
              {currentSlot.items.map((item, idx) => {
                const tc = TYPE_CONFIG[item.type];
                const Icon = tc.icon;
                return (
                  <div key={item.id}
                    onDragStart={() => setDragging(item.id)}
                    onDragOver={e => { e.preventDefault(); setDragOver(item.id); }}
                    onDrop={() => {
                      if (dragging && dragOver && dragging !== dragOver) {
                        const fromIdx = currentSlot.items.findIndex(i => i.id === dragging);
                        const toIdx = currentSlot.items.findIndex(i => i.id === dragOver);
                        moveItem(currentSlot.id, fromIdx, toIdx);
                      }
                      setDragging(null); setDragOver(null);
                    }}
                    onDragEnd={() => { setDragging(null); setDragOver(null); }}
                    draggable
                    className="flex items-center gap-3 p-3 rounded-xl border transition-all cursor-grab"
                    style={{
                      background: dragOver === item.id ? T.primary + "08" : T.card,
                      borderColor: dragOver === item.id ? T.primary + "40" : T.border,
                      opacity: dragging === item.id ? 0.5 : item.active ? 1 : 0.5,
                    }}>
                    <GripVertical size={14} style={{ color: T.textSub, flexShrink: 0 }} />
                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={`https://images.unsplash.com/${item.thumb}?w=80&h=80&fit=crop&auto=format`}
                        alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Icon size={11} style={{ color: tc.color }} />
                        <span className="font-medium text-sm truncate">{item.title}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs" style={{ color: T.textSub }}>
                        <span><Clock size={9} className="inline" /> {item.duration}s</span>
                        <span>·</span>
                        <span style={{ color: colors[idx % colors.length] }}>Peso {item.weight}%</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => toggleItem(currentSlot.id, item.id)}
                        className="p-1.5 rounded-lg hover:bg-white/5">
                        {item.active
                          ? <Eye size={13} style={{ color: T.success }} />
                          : <Eye size={13} style={{ color: T.textSub }} />}
                      </button>
                      <button onClick={() => removeFromSlot(currentSlot.id, item.id)}
                        className="p-1.5 rounded-lg hover:bg-red-900/20">
                        <Trash2 size={13} style={{ color: T.danger }} />
                      </button>
                    </div>
                  </div>
                );
              })}
              {currentSlot.items.length === 0 && (
                <div className="text-center py-10 rounded-xl border border-dashed" style={{ borderColor: T.border }}>
                  <div className="text-3xl mb-2">💭</div>
                  <p className="text-sm" style={{ color: T.textSub }}>Slot vazio — adicione conteúdo</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* LIBRARY */}
        {tab === "library" && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="font-bold">Biblioteca de conteúdo</h2>
              <button onClick={() => onNavigate?.("content-studio")}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl font-bold"
                style={{ background: T.primary, color: "#fff" }}>
                <Plus size={12} /> Novo conteúdo
              </button>
            </div>
            <div className="space-y-2">
              {LIBRARY.map(item => {
                const tc = TYPE_CONFIG[item.type];
                const Icon = tc.icon;
                const usedIn = slots.filter(s => s.items.some(i => i.id === item.id || i.id.startsWith(item.id)));
                return (
                  <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl border" style={{ background: T.card, borderColor: T.border }}>
                    <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                      <img src={`https://images.unsplash.com/${item.thumb}?w=100&h=100&fit=crop&auto=format`}
                        alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Icon size={11} style={{ color: tc.color }} />
                        <span className="font-medium text-sm">{item.title}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs" style={{ color: T.textSub }}>
                        <span>{tc.label}</span>
                        <span>·</span>
                        <span>{item.duration}s</span>
                        {usedIn.length > 0 && (
                          <>
                            <span>·</span>
                            <span style={{ color: T.success }}>{usedIn.length} slot{usedIn.length > 1 ? "s" : ""}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: item.active ? T.success + "15" : T.border, color: item.active ? T.success : T.textSub }}>
                      {item.active ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* PREVIEW */}
        {tab === "preview" && (
          <>
            <div className="rounded-2xl border overflow-hidden" style={{ background: T.card, borderColor: T.border }}>
              <div className="relative aspect-video" style={{ background: "#000" }}>
                <img
                  src={`https://images.unsplash.com/${activeItems[previewIdx % Math.max(activeItems.length, 1)]?.thumb ?? "photo-1503951914875-452162b0f3f1"}?w=700&h=400&fit=crop&auto=format`}
                  alt="preview"
                  className="w-full h-full object-cover opacity-90"
                />
                <div className="absolute inset-0 flex items-end p-4" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)" }}>
                  <div className="flex-1">
                    <div className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.6)" }}>Reproduzindo agora</div>
                    <div className="font-bold text-white">{activeItems[previewIdx % Math.max(activeItems.length, 1)]?.title ?? "—"}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: T.success }} />
                    <span className="text-xs text-white/60">AO VIVO</span>
                  </div>
                </div>
                <div className="absolute top-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {activeItems.map((_, i) => (
                    <div key={i} className="rounded-full transition-all"
                      style={{ width: i === previewIdx % activeItems.length ? 16 : 6, height: 6, background: i === previewIdx % activeItems.length ? "#fff" : "rgba(255,255,255,0.3)" }} />
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 border-t" style={{ borderColor: T.border }}>
                <button onClick={() => setPreviewIdx(p => Math.max(0, p - 1))}
                  className="p-2 rounded-lg hover:bg-white/5">
                  <ChevronDown size={16} style={{ color: T.textSub, transform: "rotate(90deg)" }} />
                </button>
                <button onClick={() => setPlaying(p => !p)}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:opacity-90"
                  style={{ background: T.primary }}>
                  {playing ? <Pause size={16} color="#fff" /> : <Play size={16} color="#fff" />}
                </button>
                <button onClick={() => setPreviewIdx(p => p + 1)}
                  className="p-2 rounded-lg hover:bg-white/5">
                  <ChevronUp size={16} style={{ color: T.textSub, transform: "rotate(90deg)" }} />
                </button>
                <div className="flex-1 mx-2">
                  <div className="h-1.5 rounded-full" style={{ background: T.border }}>
                    <div className="h-full rounded-full w-1/3 transition-all" style={{ background: T.primary }} />
                  </div>
                </div>
                <span className="text-xs" style={{ color: T.textSub }}>
                  {previewIdx % Math.max(activeItems.length, 1) + 1}/{activeItems.length}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm">Fila — {currentSlot.label}</h3>
                <div className="flex gap-1">
                  {slots.map(s => (
                    <button key={s.id} onClick={() => setActiveSlot(s.id)}
                      className="text-xs px-2 py-1 rounded-lg transition-all"
                      style={{ background: activeSlot === s.id ? T.primary : T.card, color: activeSlot === s.id ? "#fff" : T.textSub }}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
              {activeItems.map((item, idx) => {
                const tc = TYPE_CONFIG[item.type];
                const isCurrent = idx === previewIdx % activeItems.length;
                return (
                  <div key={item.id}
                    onClick={() => setPreviewIdx(idx)}
                    className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all"
                    style={{ background: isCurrent ? T.primary + "10" : T.card, borderColor: isCurrent ? T.primary + "40" : T.border }}>
                    <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={`https://images.unsplash.com/${item.thumb}?w=64&h=64&fit=crop&auto=format`} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 text-sm">{item.title}</div>
                    <span className="text-xs" style={{ color: T.textSub }}>{item.duration}s</span>
                    {isCurrent && <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: T.success }} />}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Add modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4" style={{ background: "rgba(0,0,0,0.75)" }}
          onClick={e => e.target === e.currentTarget && setShowAddModal(false)}>
          <div className="w-full max-w-lg rounded-2xl border p-5 space-y-3" style={{ background: T.panel, borderColor: T.border }}>
            <h3 className="font-black">Adicionar ao slot {slots.find(s => s.id === addToSlot)?.label}</h3>
            {LIBRARY.map(item => {
              const tc = TYPE_CONFIG[item.type];
              const Icon = tc.icon;
              return (
                <button key={item.id} onClick={() => addToSlot && addFromLibrary(addToSlot, item)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border text-left hover:border-opacity-60 transition-all"
                  style={{ background: T.card, borderColor: T.border }}>
                  <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={`https://images.unsplash.com/${item.thumb}?w=80&h=80&fit=crop&auto=format`} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 text-sm font-medium">
                      <Icon size={11} style={{ color: tc.color }} />{item.title}
                    </div>
                    <div className="text-xs" style={{ color: T.textSub }}>{tc.label} · {item.duration}s</div>
                  </div>
                  <Plus size={14} style={{ color: T.primary }} />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
