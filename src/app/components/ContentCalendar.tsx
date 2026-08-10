import { useState } from "react";
import { ArrowLeft, Plus, Trash2, Clock, ChevronLeft, ChevronRight, Calendar, Tv, Layers, Zap, CheckCircle, Copy, MoreVertical, GripVertical, X } from "lucide-react";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280",
};

const DAYS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
const DAYS_SHORT = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const HOURS = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];

const CONTENT_OPTIONS = [
  { id: "promo-dia",   label: "Promoção do Dia",       color: T.primary,  type: "image" },
  { id: "cardapio",    label: "Cardápio Executivo",     color: T.success,  type: "image" },
  { id: "inst",        label: "Institucional",          color: T.accent,   type: "video" },
  { id: "canal-news",  label: "Canal Notícias",         color: T.textSub,  type: "canal" },
  { id: "canal-clima", label: "Canal Clima",            color: "#4FC3F7",  type: "canal" },
  { id: "fds",         label: "Especial Fim de Semana", color: T.warning,  type: "image" },
  { id: "happy-hour",  label: "Happy Hour",             color: "#FF6B35",  type: "image" },
  { id: "ai-gen",      label: "IA Generativa",          color: T.accent,   type: "ai"    },
];

type SlotKey = `${number}-${number}`;

interface Slot {
  contentId: string;
  duration: number;
}

function buildDefaultSlots(): Record<SlotKey, Slot> {
  const s: Record<SlotKey, Slot> = {};
  [0,1,2,3,4].forEach(d => { s[`${d}-12`] = { contentId: "promo-dia", duration: 2 }; });
  [0,1,2,3,4].forEach(d => { s[`${d}-9`] = { contentId: "inst", duration: 1 }; });
  [0,1,2,3,4].forEach(d => { s[`${d}-7`] = { contentId: "canal-news", duration: 2 }; });
  s["5-10"] = { contentId: "fds", duration: 2 };
  s["6-10"] = { contentId: "fds", duration: 2 };
  s["5-14"] = { contentId: "happy-hour", duration: 3 };
  s["6-14"] = { contentId: "happy-hour", duration: 2 };
  [0,1,2,3,4].forEach(d => { s[`${d}-18`] = { contentId: "happy-hour", duration: 2 }; });
  return s;
}

interface Props { onBack: () => void; }

export default function ContentCalendar({ onBack }: Props) {
  const [slots, setSlots] = useState<Record<SlotKey, Slot>>(buildDefaultSlots);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [addModal, setAddModal] = useState<{ day: number; hour: number } | null>(null);
  const [selectedContent, setSelectedContent] = useState<string>(CONTENT_OPTIONS[0].id);
  const [selectedDuration, setSelectedDuration] = useState(1);
  const [viewMode, setViewMode] = useState<"week" | "day">("week");
  const [copied, setCopied] = useState(false);

  const content = (id: string) => CONTENT_OPTIONS.find(c => c.id === id);

  const addSlot = () => {
    if (!addModal) return;
    const key: SlotKey = `${addModal.day}-${addModal.hour}`;
    setSlots(prev => ({ ...prev, [key]: { contentId: selectedContent, duration: selectedDuration } }));
    setAddModal(null);
  };

  const removeSlot = (key: SlotKey) => {
    setSlots(prev => { const n = { ...prev }; delete n[key]; return n; });
  };

  const copyDayToWeek = (srcDay: number) => {
    const dayCopy: Record<SlotKey, Slot> = {};
    HOURS.forEach(h => {
      const src: SlotKey = `${srcDay}-${h}`;
      if (slots[src]) {
        [0,1,2,3,4].forEach(d => {
          if (d !== srcDay) { dayCopy[`${d}-${h}`] = { ...slots[src] }; }
        });
      }
    });
    setSlots(prev => ({ ...prev, ...dayCopy }));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const totalSlots = Object.keys(slots).length;
  const filledHours = Object.values(slots).reduce((a, s) => a + s.duration, 0);
  const weekHours = 7 * 17;
  const fillPct = Math.round((filledHours / weekHours) * 100);

  const displayDays = viewMode === "day" && selectedDay !== null ? [selectedDay] : [0,1,2,3,4,5,6];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
            <ArrowLeft size={18} style={{ color: T.textSub }} />
          </button>
          <Calendar size={20} style={{ color: T.primary }} />
          <div>
            <h1 className="font-black text-lg">Calendário de Conteúdo</h1>
            <p className="text-xs" style={{ color: T.textSub }}>{totalSlots} blocos · {fillPct}% da semana preenchido</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="flex rounded-xl border overflow-hidden" style={{ borderColor: T.border }}>
              <button onClick={() => setViewMode("week")}
                className="px-3 py-1.5 text-xs font-medium transition-all"
                style={{ background: viewMode === "week" ? T.primary : T.panel, color: viewMode === "week" ? "#fff" : T.textSub }}>
                Semana
              </button>
              <button onClick={() => setViewMode("day")}
                className="px-3 py-1.5 text-xs font-medium transition-all"
                style={{ background: viewMode === "day" ? T.primary : T.panel, color: viewMode === "day" ? "#fff" : T.textSub }}>
                Dia
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex max-w-6xl mx-auto w-full px-6 py-6 gap-6">
        <div className="w-52 flex-shrink-0 space-y-4">
          {viewMode === "day" && (
            <div className="rounded-xl border p-3" style={{ background: T.card, borderColor: T.border }}>
              <div className="text-xs font-medium mb-2" style={{ color: T.textSub }}>Dia</div>
              <div className="space-y-1">
                {DAYS.map((d, i) => (
                  <button key={i} onClick={() => setSelectedDay(i)}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm transition-all"
                    style={{ background: selectedDay === i ? T.primary + "20" : "transparent", color: selectedDay === i ? T.primary : T.textSub }}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-xl border p-3" style={{ background: T.card, borderColor: T.border }}>
            <div className="text-xs font-medium mb-2" style={{ color: T.textSub }}>Conteúdos</div>
            <div className="space-y-1.5">
              {CONTENT_OPTIONS.map(c => (
                <div key={c.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg" style={{ background: T.panel }}>
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: c.color }} />
                  <span className="text-xs truncate">{c.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border p-3 space-y-2" style={{ background: T.card, borderColor: T.border }}>
            <div className="text-xs font-medium mb-2" style={{ color: T.textSub }}>Semana atual</div>
            <div className="h-1.5 rounded-full" style={{ background: T.border }}>
              <div className="h-full rounded-full" style={{ width: `${fillPct}%`, background: fillPct > 80 ? T.success : T.primary }} />
            </div>
            <div className="text-xs flex justify-between">
              <span style={{ color: T.textSub }}>Preenchimento</span>
              <span className="font-bold" style={{ color: T.success }}>{fillPct}%</span>
            </div>
            <div className="text-xs flex justify-between">
              <span style={{ color: T.textSub }}>Blocos</span>
              <span className="font-bold">{totalSlots}</span>
            </div>
            <div className="text-xs flex justify-between">
              <span style={{ color: T.textSub }}>Horas</span>
              <span className="font-bold">{filledHours}h</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-x-auto">
          <div className="min-w-0">
            <div className="flex mb-1" style={{ marginLeft: 48 }}>
              {displayDays.map(d => (
                <div key={d} className="flex-1 text-center pb-2 border-b" style={{ borderColor: T.border }}>
                  <div className="text-xs font-bold" style={{ color: T.text }}>{DAYS_SHORT[d]}</div>
                  {selectedDay === d && viewMode === "day" && (
                    <button onClick={() => copyDayToWeek(d)}
                      className="mt-1 text-xs px-2 py-0.5 rounded-lg"
                      style={{ background: copied ? T.success + "20" : T.primary + "20", color: copied ? T.success : T.primary }}>
                      {copied ? "✓ Copiado" : "Copiar p/ semana"}
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-0.5">
              {HOURS.map(h => (
                <div key={h} className="flex items-stretch gap-0.5" style={{ minHeight: 44 }}>
                  <div className="w-12 flex-shrink-0 flex items-center justify-end pr-2">
                    <span className="text-xs font-mono" style={{ color: T.textSub }}>{h}:00</span>
                  </div>
                  {displayDays.map(d => {
                    const key: SlotKey = `${d}-${h}`;
                    const slot = slots[key];
                    const c = slot ? content(slot.contentId) : null;
                    return (
                      <div key={d} className="flex-1 relative group"
                        style={{ minHeight: 44 }}>
                        {slot && c ? (
                          <div
                            className="absolute inset-0.5 rounded-lg flex items-center justify-between px-2 py-1 cursor-pointer transition-all hover:opacity-80"
                            style={{ background: c.color + "25", border: `1.5px solid ${c.color}50` }}>
                            <div className="min-w-0">
                              <div className="text-xs font-bold truncate leading-tight" style={{ color: c.color }}>{c.label}</div>
                              <div className="text-xs" style={{ color: c.color + "90" }}>{slot.duration}h</div>
                            </div>
                            <button
                              onClick={() => removeSlot(key)}
                              className="opacity-0 group-hover:opacity-100 p-0.5 rounded transition-opacity flex-shrink-0"
                              style={{ color: c.color }}>
                              <X size={11} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setAddModal({ day: d, hour: h })}
                            className="absolute inset-0.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center"
                            style={{ background: T.primary + "10", border: `1px dashed ${T.primary}40` }}>
                            <Plus size={14} style={{ color: T.primary }} />
                          </button>
                        )}
                        {!slot && (
                          <div className="absolute inset-0.5 rounded-lg" style={{ background: h % 2 === 0 ? T.panel : "transparent" }} />
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {addModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
          onClick={e => e.target === e.currentTarget && setAddModal(null)}>
          <div className="w-full max-w-sm rounded-2xl border overflow-hidden" style={{ background: T.card, borderColor: T.border }}>
            <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: T.border }}>
              <div>
                <div className="font-bold">Adicionar conteúdo</div>
                <div className="text-xs mt-0.5" style={{ color: T.textSub }}>
                  {DAYS[addModal.day]} às {addModal.hour}:00
                </div>
              </div>
              <button onClick={() => setAddModal(null)} style={{ color: T.textSub }}>
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <div className="text-sm font-medium mb-2">Conteúdo</div>
                <div className="space-y-1.5 max-h-52 overflow-y-auto">
                  {CONTENT_OPTIONS.map(c => (
                    <button key={c.id} onClick={() => setSelectedContent(c.id)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all"
                      style={{ background: selectedContent === c.id ? c.color + "15" : T.panel, borderColor: selectedContent === c.id ? c.color : T.border }}>
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: c.color }} />
                      <span className="text-sm flex-1">{c.label}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: T.card, color: T.textSub }}>{c.type}</span>
                      {selectedContent === c.id && <CheckCircle size={13} style={{ color: c.color }} />}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium mb-2">Duração</div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map(d => (
                    <button key={d} onClick={() => setSelectedDuration(d)}
                      className="flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all"
                      style={{ background: selectedDuration === d ? T.primary + "20" : T.panel, borderColor: selectedDuration === d ? T.primary : T.border, color: selectedDuration === d ? T.primary : T.textSub }}>
                      {d}h
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={addSlot}
                className="w-full py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90"
                style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`, color: "#fff" }}>
                Adicionar ao calendário
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
