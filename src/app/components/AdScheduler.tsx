import { useState } from "react";
import {
  ArrowLeft, CalendarDays, Clock, Zap, Plus, Trash2, Play, Pause,
  ChevronLeft, ChevronRight, CheckCircle, Edit3, Copy, Sun, Moon,
  Sunrise, Sunset, X, BarChart2, TrendingUp, Eye
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

interface Props { onBack: () => void; onNavigate?: (v: string) => void; }

type SlotStatus = "active" | "paused" | "completed" | "draft";
type DayPart = "madrugada" | "manha" | "tarde" | "noite";

interface ScheduleSlot {
  id: string;
  campaign: string;
  creative: string;
  days: number[];
  startHour: number;
  endHour: number;
  screens: string[];
  status: SlotStatus;
  priority: number;
  impressionsTarget: number;
  impressionsDone: number;
  color: string;
}

const STATUS_META: Record<SlotStatus, { label: string; color: string }> = {
  active:    { label: "Ativo",      color: T.success },
  paused:    { label: "Pausado",    color: T.warning },
  completed: { label: "Concluído",  color: T.textSub },
  draft:     { label: "Rascunho",   color: T.primary },
};

const DAY_LABELS = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
const HOUR_LABELS = ["0h","2h","4h","6h","8h","10h","12h","14h","16h","18h","20h","22h"];

const SLOTS: ScheduleSlot[] = [
  { id: "SL01", campaign: "Ambev Verão",     creative: "Filme 30s",        days: [1,2,3,4,5],   startHour: 11, endHour: 14, screens: ["Shopping Ibirapuera","Av. Paulista"], status: "active",    priority: 1, impressionsTarget: 280000, impressionsDone: 196000, color: T.primary  },
  { id: "SL02", campaign: "Bradesco Ads",    creative: "Banner Animado",   days: [1,2,3,4,5,6], startHour: 8,  endHour: 20, screens: ["Metrô Paulista"],                  status: "active",    priority: 2, impressionsTarget: 420000, impressionsDone: 310000, color: T.accent   },
  { id: "SL03", campaign: "iFood OOH Jul",   creative: "Promo Almoço",     days: [1,2,3,4,5],   startHour: 11, endHour: 13, screens: ["Rodoviária Tietê","GRU T2"],       status: "active",    priority: 1, impressionsTarget: 180000, impressionsDone: 154000, color: T.success  },
  { id: "SL04", campaign: "Carrefour Jul",   creative: "Ofertas da Semana",days: [6,0],          startHour: 9,  endHour: 21, screens: ["Shopping Iguatemi"],               status: "active",    priority: 3, impressionsTarget: 120000, impressionsDone: 88000,  color: T.gold     },
  { id: "SL05", campaign: "Nivea UV",        creative: "Protetor Solar",   days: [1,2,3,4,5,6,0],startHour: 10,endHour: 16, screens: ["Parque Ibirapuera"],               status: "paused",    priority: 2, impressionsTarget: 90000,  impressionsDone: 21000,  color: T.warning  },
  { id: "SL06", campaign: "FitLife Academia",creative: "Madrugada Fit",    days: [1,2,3,4,5],   startHour: 5,  endHour: 8,  screens: ["Av. Boa Viagem"],                  status: "active",    priority: 3, impressionsTarget: 60000,  impressionsDone: 48000,  color: T.danger   },
  { id: "SL07", campaign: "Unilever Q3",     creative: "Prime Time",       days: [1,2,3,4,5,6,0],startHour: 19,endHour: 22, screens: ["Shopping Ibirapuera","Shopping Iguatemi"], status: "draft", priority: 1, impressionsTarget: 200000, impressionsDone: 0,  color: "#60AFFF"  },
];

const HOURLY_DENSITY = [
  { hour: "0h",  slots: 1  }, { hour: "2h",  slots: 1  }, { hour: "4h",  slots: 1  },
  { hour: "6h",  slots: 3  }, { hour: "8h",  slots: 5  }, { hour: "10h", slots: 7  },
  { hour: "12h", slots: 8  }, { hour: "14h", slots: 7  }, { hour: "16h", slots: 6  },
  { hour: "18h", slots: 8  }, { hour: "20h", slots: 7  }, { hour: "22h", slots: 4  },
];

function getDayPart(hour: number): DayPart {
  if (hour < 6) return "madrugada";
  if (hour < 12) return "manha";
  if (hour < 18) return "tarde";
  return "noite";
}

const DAY_PART_META: Record<DayPart, { label: string; icon: any; color: string }> = {
  madrugada: { label: "Madrugada 0–6h", icon: Moon,    color: T.textSub },
  manha:     { label: "Manhã 6–12h",    icon: Sunrise, color: T.warning  },
  tarde:     { label: "Tarde 12–18h",   icon: Sun,     color: T.gold     },
  noite:     { label: "Noite 18–24h",   icon: Sunset,  color: T.primary  },
};

export default function AdScheduler({ onBack, onNavigate }: Props) {
  const [tab, setTab]           = useState<"calendar" | "slots" | "heatmap">("calendar");
  const [weekOffset, setWeekOffset] = useState(0);
  const [selected, setSelected] = useState<ScheduleSlot | null>(null);
  const [slots, setSlots]       = useState<ScheduleSlot[]>(SLOTS);
  const [showNew, setShowNew]   = useState(false);
  const [newCampaign, setNewCampaign] = useState("Ambev Verão");
  const [newStart, setNewStart] = useState(9);
  const [newEnd, setNewEnd]     = useState(18);
  const [selectedDays, setSelectedDays] = useState<number[]>([1,2,3,4,5]);

  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay() + weekOffset * 7);

  function toggleSlot(id: string) {
    setSlots(s => s.map(sl => sl.id !== id ? sl : {
      ...sl, status: sl.status === "active" ? "paused" : "active",
    }));
  }

  function deleteSlot(id: string) {
    setSlots(s => s.filter(sl => sl.id !== id));
    if (selected?.id === id) setSelected(null);
  }

  function toggleDay(d: number) {
    setSelectedDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  }

  const activeSlots    = slots.filter(s => s.status === "active").length;
  const totalImpTarget = slots.reduce((s, sl) => s + sl.impressionsTarget, 0);
  const totalImpDone   = slots.reduce((s, sl) => s + sl.impressionsDone, 0);
  const avgProgress    = Math.round(totalImpDone / totalImpTarget * 100);

  const HOURS = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5">
              <ArrowLeft size={18} style={{ color: T.textSub }} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.primary + "20" }}>
                <CalendarDays size={18} style={{ color: T.primary }} />
              </div>
              <div>
                <h1 className="font-black text-lg">Ad Scheduler</h1>
                <p className="text-xs" style={{ color: T.textSub }}>Agendamento inteligente de veiculções por horário e dia</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {(["calendar","slots","heatmap"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
                style={{ background: tab === t ? T.primary + "20" : "transparent", color: tab === t ? T.primary : T.textSub, border: `1px solid ${tab === t ? T.primary + "30" : "transparent"}` }}>
                {t === "calendar" ? "Calendário" : t === "slots" ? "Slots" : "Heatmap"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Slots Ativos",        value: activeSlots,                           color: T.success, icon: CheckCircle },
            { label: "Impressões Meta",     value: `${(totalImpTarget / 1000).toFixed(0)}k`, color: T.primary, icon: Eye   },
            { label: "Progresso Médio",     value: `${avgProgress}%`,                    color: T.gold,    icon: BarChart2   },
            { label: "Campanhas Ativas",    value: new Set(slots.filter(s => s.status === "active").map(s => s.campaign)).size, color: T.accent, icon: TrendingUp },
          ].map((k, i) => (
            <div key={i} className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3" style={{ background: k.color + "20" }}>
                <k.icon size={15} style={{ color: k.color }} />
              </div>
              <div className="font-black text-2xl" style={{ color: k.color }}>{k.value}</div>
              <div className="text-xs mt-0.5" style={{ color: T.textSub }}>{k.label}</div>
            </div>
          ))}
        </div>

        {/* CALENDAR TAB */}
        {tab === "calendar" && (
          <div className="space-y-4">
            {/* Week nav */}
            <div className="flex items-center gap-4">
              <button onClick={() => setWeekOffset(w => w - 1)} className="p-2 rounded-xl hover:bg-white/5" style={{ background: T.card, border: `1px solid ${T.border}` }}>
                <ChevronLeft size={15} style={{ color: T.textSub }} />
              </button>
              <div className="font-black">
                {weekStart.toLocaleDateString("pt-BR", { day: "2-digit", month: "long" })} —{" "}
                {new Date(weekStart.getTime() + 6 * 86400000).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
              </div>
              <button onClick={() => setWeekOffset(w => w + 1)} className="p-2 rounded-xl hover:bg-white/5" style={{ background: T.card, border: `1px solid ${T.border}` }}>
                <ChevronRight size={15} style={{ color: T.textSub }} />
              </button>
              {weekOffset !== 0 && (
                <button onClick={() => setWeekOffset(0)} className="px-3 py-1.5 rounded-xl text-xs font-bold"
                  style={{ background: T.primary + "20", color: T.primary }}>Hoje</button>
              )}
              <button onClick={() => setShowNew(true)} className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black"
                style={{ background: T.primary, color: "#fff" }}>
                <Plus size={14} /> Novo Slot
              </button>
            </div>

            {/* New slot form */}
            {showNew && (
              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.primary + "40" }}>
                <h3 className="font-black mb-4 text-sm">Novo Slot de Veiculação</h3>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="text-xs font-bold mb-1.5 block" style={{ color: T.textSub }}>CAMPANHA</label>
                    <select value={newCampaign} onChange={e => setNewCampaign(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl text-sm"
                      style={{ background: T.panel, border: `1px solid ${T.border}`, color: T.text }}>
                      {["Ambev Verão","Bradesco Ads","iFood OOH Jul","Carrefour Jul","Unilever Q3"].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold mb-1.5 block" style={{ color: T.textSub }}>HORA INÍCIO</label>
                    <input type="number" min={0} max={23} value={newStart} onChange={e => setNewStart(+e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl text-sm"
                      style={{ background: T.panel, border: `1px solid ${T.border}`, color: T.text }} />
                  </div>
                  <div>
                    <label className="text-xs font-bold mb-1.5 block" style={{ color: T.textSub }}>HORA FIM</label>
                    <input type="number" min={1} max={24} value={newEnd} onChange={e => setNewEnd(+e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl text-sm"
                      style={{ background: T.panel, border: `1px solid ${T.border}`, color: T.text }} />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="text-xs font-bold mb-2 block" style={{ color: T.textSub }}>DIAS DA SEMANA</label>
                  <div className="flex gap-2">
                    {DAY_LABELS.map((d, i) => (
                      <button key={i} onClick={() => toggleDay(i)}
                        className="w-9 h-9 rounded-xl text-xs font-black transition-all"
                        style={{ background: selectedDays.includes(i) ? T.primary + "20" : T.panel, color: selectedDays.includes(i) ? T.primary : T.textSub, border: `2px solid ${selectedDays.includes(i) ? T.primary : T.border}` }}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setSlots(s => [...s, { id: `SL0${s.length + 1}`, campaign: newCampaign, creative: "Novo criativo", days: selectedDays, startHour: newStart, endHour: newEnd, screens: ["—"], status: "draft", priority: 3, impressionsTarget: 50000, impressionsDone: 0, color: T.accent }]); setShowNew(false); }}
                    className="px-5 py-2 rounded-xl text-sm font-black" style={{ background: T.primary, color: "#fff" }}>
                    Criar Slot
                  </button>
                  <button onClick={() => setShowNew(false)} className="px-5 py-2 rounded-xl text-sm font-bold" style={{ background: T.border, color: T.textSub }}>Cancelar</button>
                </div>
              </div>
            )}

            {/* Timeline grid */}
            <div className="rounded-2xl border overflow-hidden" style={{ background: T.card, borderColor: T.border }}>
              {/* Header row */}
              <div className="grid border-b" style={{ gridTemplateColumns: "80px repeat(7, 1fr)", borderColor: T.border }}>
                <div className="p-3 text-xs font-bold" style={{ color: T.textSub }}>Hora</div>
                {Array.from({ length: 7 }, (_, i) => {
                  const d = new Date(weekStart.getTime() + i * 86400000);
                  const isToday = d.toDateString() === today.toDateString();
                  return (
                    <div key={i} className="p-3 text-center border-l" style={{ borderColor: T.border }}>
                      <div className="text-xs" style={{ color: T.textSub }}>{DAY_LABELS[d.getDay()]}</div>
                      <div className="font-black text-sm" style={{ color: isToday ? T.primary : T.text }}>{d.getDate()}</div>
                      {isToday && <div className="w-1.5 h-1.5 rounded-full mx-auto mt-0.5" style={{ background: T.primary }} />}
                    </div>
                  );
                })}
              </div>
              {/* Rows for each 2-hour block */}
              {HOUR_LABELS.map((hourLabel, hIdx) => {
                const hour = hIdx * 2;
                return (
                  <div key={hIdx} className="grid border-b last:border-0" style={{ gridTemplateColumns: "80px repeat(7, 1fr)", borderColor: T.border + "60", minHeight: 36 }}>
                    <div className="px-3 py-1 flex items-center text-xs" style={{ color: T.textSub }}>{hourLabel}</div>
                    {Array.from({ length: 7 }, (_, dayIdx) => {
                      const d = new Date(weekStart.getTime() + dayIdx * 86400000);
                      const dayNum = d.getDay();
                      const matching = slots.filter(sl =>
                        sl.days.includes(dayNum) &&
                        sl.status !== "draft" &&
                        sl.startHour <= hour + 1 && sl.endHour > hour
                      );
                      return (
                        <div key={dayIdx} className="border-l p-0.5" style={{ borderColor: T.border + "40" }}>
                          {matching.map(sl => (
                            <div key={sl.id}
                              onClick={() => setSelected(selected?.id === sl.id ? null : sl)}
                              className="px-1.5 py-0.5 rounded-md text-xs font-bold cursor-pointer truncate mb-0.5"
                              style={{ background: sl.color + "30", color: sl.color, border: `1px solid ${sl.color}40` }}>
                              {sl.campaign.split(" ")[0]}
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SLOTS TAB */}
        {tab === "slots" && (
          <div className="flex gap-6">
            <div className="flex-1 space-y-3">
              {slots.map(sl => {
                const sm = STATUS_META[sl.status];
                const progress = sl.impressionsTarget > 0 ? Math.round(sl.impressionsDone / sl.impressionsTarget * 100) : 0;
                const dp = DAY_PART_META[getDayPart(sl.startHour)];
                const DpIcon = dp.icon;
                return (
                  <div key={sl.id}
                    onClick={() => setSelected(selected?.id === sl.id ? null : sl)}
                    className="p-4 rounded-2xl border cursor-pointer hover:bg-white/3 transition-all"
                    style={{ background: T.card, borderColor: selected?.id === sl.id ? sl.color + "60" : T.border }}>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: sl.color + "20" }}>
                        <DpIcon size={18} style={{ color: sl.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-black">{sl.campaign}</span>
                          <span className="text-xs" style={{ color: T.textSub }}>·</span>
                          <span className="text-xs" style={{ color: T.textSub }}>{sl.creative}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full font-bold ml-1"
                            style={{ background: sm.color + "20", color: sm.color }}>{sm.label}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-xs" style={{ color: T.textSub }}>
                          <span><Clock size={9} className="inline mr-0.5" />{sl.startHour}h–{sl.endHour}h</span>
                          <span>{sl.days.map(d => DAY_LABELS[d]).join(", ")}</span>
                          <span>·</span>
                          <span>{sl.screens.length} tela(s)</span>
                        </div>
                        {sl.status !== "draft" && (
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex-1 h-1.5 rounded-full" style={{ background: T.border }}>
                              <div className="h-full rounded-full" style={{ width: `${progress}%`, background: sl.color }} />
                            </div>
                            <span className="text-xs font-bold" style={{ color: sl.color }}>{progress}%</span>
                            <span className="text-xs" style={{ color: T.textSub }}>
                              {(sl.impressionsDone / 1000).toFixed(0)}k / {(sl.impressionsTarget / 1000).toFixed(0)}k imp.
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={e => { e.stopPropagation(); toggleSlot(sl.id); }} className="p-2 rounded-lg hover:bg-white/5">
                          {sl.status === "active" ? <Pause size={14} style={{ color: T.warning }} /> : <Play size={14} style={{ color: T.success }} />}
                        </button>
                        <button onClick={e => { e.stopPropagation(); deleteSlot(sl.id); }} className="p-2 rounded-lg hover:bg-white/5">
                          <Trash2 size={14} style={{ color: T.danger }} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {selected && (
              <div className="w-64 flex-shrink-0 p-5 rounded-2xl border space-y-4" style={{ background: T.card, borderColor: T.border }}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold" style={{ color: T.textSub }}>{selected.id}</span>
                  <button onClick={() => setSelected(null)}><X size={13} style={{ color: T.textSub }} /></button>
                </div>
                <div>
                  <div className="font-black">{selected.campaign}</div>
                  <div className="text-xs mt-0.5" style={{ color: T.textSub }}>{selected.creative}</div>
                </div>
                {[
                  { label: "Status",    value: STATUS_META[selected.status].label, color: STATUS_META[selected.status].color },
                  { label: "Horário",   value: `${selected.startHour}h – ${selected.endHour}h` },
                  { label: "Dias",      value: selected.days.map(d => DAY_LABELS[d]).join(", ") },
                  { label: "Telas",     value: selected.screens.join(", "), truncate: true },
                  { label: "Prioridade",value: `P${selected.priority}`, color: selected.priority === 1 ? T.gold : T.textSub },
                  { label: "Meta",      value: `${(selected.impressionsTarget / 1000).toFixed(0)}k imp.` },
                  { label: "Realizado", value: `${(selected.impressionsDone / 1000).toFixed(0)}k imp.`, color: T.success },
                ].map((r, i) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span style={{ color: T.textSub }}>{r.label}</span>
                    <span className="font-bold truncate ml-2 text-right" style={{ color: (r as any).color || T.text, maxWidth: 120 }}>{r.value}</span>
                  </div>
                ))}
                <div className="space-y-2 pt-2">
                  <button className="w-full py-2 rounded-xl text-xs font-bold" style={{ background: T.primary + "20", color: T.primary, border: `1px solid ${T.primary}30` }}>
                    <Edit3 size={11} className="inline mr-1" /> Editar Slot
                  </button>
                  <button className="w-full py-2 rounded-xl text-xs font-bold" style={{ background: T.border, color: T.textSub }}>
                    <Copy size={11} className="inline mr-1" /> Duplicar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* HEATMAP TAB */}
        {tab === "heatmap" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black mb-1">Densidade de Slots por Hora</h3>
                <p className="text-xs mb-4" style={{ color: T.textSub }}>Número de slots ativos em cada bloco de 2h</p>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={HOURLY_DENSITY} barSize={22}>
                    <XAxis dataKey="hour" tick={{ fill: T.textSub, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10 }}
                      formatter={(v: number) => [v, "Slots"]} />
                    <Bar key="bar-density" dataKey="slots" radius={[6, 6, 0, 0]}>
                      {HOURLY_DENSITY.map((entry, i) => (
                        <Cell key={`cell-d-${i}`} fill={entry.slots >= 7 ? T.success : entry.slots >= 5 ? T.warning : T.primary + "AA"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black mb-4">Day-parts & Oportunidade</h3>
                {(Object.entries(DAY_PART_META) as [DayPart, any][]).map(([dp, meta]) => {
                  const Icon = meta.icon;
                  const slotCount = slots.filter(s => getDayPart(s.startHour) === dp && s.status === "active").length;
                  const capacity = 10;
                  const pct = Math.round(slotCount / capacity * 100);
                  return (
                    <div key={dp} className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Icon size={13} style={{ color: meta.color }} />
                          <span className="text-sm font-bold">{meta.label}</span>
                        </div>
                        <span className="text-xs font-black" style={{ color: pct >= 70 ? T.danger : pct >= 40 ? T.warning : T.success }}>
                          {slotCount}/{capacity} slots
                        </span>
                      </div>
                      <div className="h-2 rounded-full" style={{ background: T.border }}>
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct >= 70 ? T.danger : pct >= 40 ? T.warning : T.success }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 7-day heatmap grid */}
            <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-black mb-4">Mapa de Calor — Semana Atual</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr>
                      <th className="text-left pr-3 pb-2 font-bold" style={{ color: T.textSub }}>Hora</th>
                      {DAY_LABELS.map(d => (
                        <th key={d} className="text-center pb-2 font-bold w-12" style={{ color: T.textSub }}>{d}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 12 }, (_, hIdx) => {
                      const hour = hIdx * 2;
                      return (
                        <tr key={hIdx}>
                          <td className="pr-3 py-0.5 font-mono" style={{ color: T.textSub }}>{hour}h</td>
                          {Array.from({ length: 7 }, (_, dayIdx) => {
                            const count = slots.filter(sl =>
                              sl.days.includes(dayIdx) &&
                              sl.status === "active" &&
                              sl.startHour <= hour + 1 && sl.endHour > hour
                            ).length;
                            const intensity = Math.min(count / 4, 1);
                            return (
                              <td key={dayIdx} className="text-center py-0.5">
                                <div className="w-8 h-5 rounded mx-auto flex items-center justify-center text-xs font-bold"
                                  style={{ background: count > 0 ? T.primary + Math.round(intensity * 200).toString(16).padStart(2, "0") : T.border + "40", color: count > 0 ? "#fff" : T.textSub + "60" }}>
                                  {count > 0 ? count : ""}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
