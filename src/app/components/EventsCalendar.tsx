import { useState } from "react";
import {
  ArrowLeft, Calendar, Sparkles, ChevronLeft, ChevronRight,
  Star, Zap, TrendingUp, Clock, Check, Plus, Bell, Play
} from "lucide-react";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

type EventCategory = "holiday" | "seasonal" | "sports" | "commerce" | "local";
type EventImpact = "high" | "medium" | "low";

interface CalendarEvent {
  id: string;
  date: string;
  year?: number;
  name: string;
  category: EventCategory;
  impact: EventImpact;
  cpmBoost: number;
  emoji: string;
  tip: string;
  segments: string[];
  scheduled?: boolean;
}

const EVENTS: CalendarEvent[] = [
  { id: "ev1",  date: "07-25", name: "Dia do Estudante antecip.",    category: "holiday",  impact: "medium", cpmBoost: 25, emoji: "📚", tip: "Promova descontos em material escolar e serviços para estudantes.",                                segments: ["varejo","farmacia"],                  scheduled: true  },
  { id: "ev2",  date: "07-28", name: "Dia do Nutricionista",         category: "holiday",  impact: "low",    cpmBoost: 15, emoji: "🥗", tip: "Datas de nicho têm baixa concorrência. Aposte em conteúdo educativo.",                              segments: ["clinica","academia"],                 scheduled: false },
  { id: "ev3",  date: "08-01", name: "Dia do Amigo",                 category: "holiday",  impact: "medium", cpmBoost: 30, emoji: "🤝", tip: "Promoções de 'venha com um amigo' e 'indique e ganhe' têm alta conversão.",                         segments: ["academia","restaurante","barbearia"], scheduled: true  },
  { id: "ev4",  date: "08-11", name: "Dia do Estudante (oficial)",   category: "holiday",  impact: "high",   cpmBoost: 45, emoji: "🎓", tip: "Uma das maiores datas para varejo de eletrônicos e papelaria. Prepare criativo 7 dias antes.",       segments: ["varejo"],                             scheduled: false },
  { id: "ev5",  date: "08-15", name: "Dia dos Pais",                 category: "holiday",  impact: "high",   cpmBoost: 60, emoji: "👔", tip: "Segunda maior data do varejo após Natal. CPM sobe 60%+. Reserve inventário agora.",                 segments: ["varejo","restaurante","barbearia"],   scheduled: false },
  { id: "ev6",  date: "08-16", name: "Olimpíadas 2024 (replay)",     category: "sports",   impact: "medium", cpmBoost: 20, emoji: "🎅", tip: "Conteúdo esportivo tem alta atenção. Academia e nutrição performam bem.",                          segments: ["academia"],                           scheduled: false },
  { id: "ev7",  date: "08-22", name: "Dia do Folclore",              category: "local",    impact: "low",    cpmBoost: 10, emoji: "🎪", tip: "Conteúdo regional gera identificação com o público local.",                                         segments: ["restaurante"],                        scheduled: false },
  { id: "ev8",  date: "09-07", name: "Independência do Brasil",      category: "holiday",  impact: "high",   cpmBoost: 50, emoji: "🇧🇷", tip: "Feriado nacional com alto tráfego em shoppings. Anúncios patrióticos têm alta recall.",             segments: ["varejo","restaurante"],               scheduled: false },
  { id: "ev9",  date: "09-15", name: "Dia do Cliente",               category: "commerce", impact: "high",   cpmBoost: 55, emoji: "🛍️", tip: "Foca em fidelização: 'obrigado por ser nosso cliente'. Churn cai após esta data.",                 segments: ["academia","clinica","pet","barbearia"],scheduled: false },
  { id: "ev10", date: "10-04", name: "Dia dos Animais",              category: "holiday",  impact: "medium", cpmBoost: 35, emoji: "🐾", tip: "Pico anual para Pet Shops. Prepare campanha de banho & tosa e acessórios.",                        segments: ["pet"],                                scheduled: false },
  { id: "ev11", date: "10-12", name: "Dia das Crianças",             category: "holiday",  impact: "high",   cpmBoost: 65, emoji: "🎠", tip: "Top 3 datas do varejo. Brinquedos, doces, roupas: agende criativo com 10 dias de antecedência.",   segments: ["varejo","farmacia"],                  scheduled: false },
  { id: "ev12", date: "10-31", name: "Halloween",                    category: "seasonal", impact: "medium", cpmBoost: 30, emoji: "🎃", tip: "Cresce anualmente no Brasil. Restaurantes, doces e decoração se beneficiam.",                      segments: ["restaurante","varejo"],               scheduled: false },
  { id: "ev13", date: "11-02", name: "Finados",                      category: "holiday",  impact: "low",    cpmBoost: 0,  emoji: "🕯️", tip: "Feriado silencioso: evite campanhas de alto impacto.",                                             segments: [],                                     scheduled: false },
  { id: "ev14", date: "11-15", name: "Proclamação da República",     category: "holiday",  impact: "low",    cpmBoost: 10, emoji: "🏙️", tip: "Feriado com tráfego em centros comerciais. Bom para promoções de passagem.",                       segments: ["varejo","restaurante"],               scheduled: false },
  { id: "ev15", date: "11-28", name: "Black Friday 2026",            category: "commerce", impact: "high",   cpmBoost: 80, emoji: "🖤", tip: "Maior evento comercial do ano. CPM atinge pico histórico. Prepare criativo com 3 semanas de antecedência.", segments: ["varejo","farmacia","academia"],   scheduled: false },
  { id: "ev16", date: "12-25", name: "Natal",                        category: "holiday",  impact: "high",   cpmBoost: 75, emoji: "🎄", tip: "Maior volume de impressões do ano. Reserve inventário em outubro para garantir preços.",            segments: ["varejo","restaurante","pet"],          scheduled: false },
  { id: "ev17", date: "12-31", name: "Réveillon",                    category: "holiday",  impact: "high",   cpmBoost: 70, emoji: "🎆", tip: "Noite mais cara do DOOH. Restaurantes e varejo de luxo têm CPM 3x acima da média.",                segments: ["restaurante","varejo"],               scheduled: false },
];

const MONTHS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
const MONTH_DAYS = [31,28,29,31,30,31,30,31,31,30,31,30,31];

const CAT_CFG: Record<EventCategory, { label: string; color: string }> = {
  holiday:  { label: "Feriado",   color: T.primary },
  seasonal: { label: "Sazonal",   color: T.warning  },
  sports:   { label: "Esportes",  color: T.success  },
  commerce: { label: "Comércio",  color: T.gold     },
  local:    { label: "Local",     color: T.accent   },
};

const IMPACT_CFG: Record<EventImpact, { color: string; label: string }> = {
  high:   { color: T.success, label: "Alto impacto"   },
  medium: { color: T.warning, label: "Médio impacto"  },
  low:    { color: T.textSub, label: "Baixo impacto"  },
};

function getEventsForMonth(month: number): CalendarEvent[] {
  const mm = String(month + 1).padStart(2, "0");
  return EVENTS.filter(e => e.date.startsWith(mm + "-"));
}

function getEventsForDay(month: number, day: number): CalendarEvent[] {
  const mm = String(month + 1).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return EVENTS.filter(e => e.date === `${mm}-${dd}`);
}

function getDayOfWeekOffset(month: number, year: number): number {
  return new Date(year, month, 1).getDay();
}

interface Props { onBack: () => void; onNavigate?: (v: string) => void; }

export default function EventsCalendar({ onBack, onNavigate }: Props) {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year] = useState(2026);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [scheduledIds, setScheduledIds] = useState<Set<string>>(
    new Set(EVENTS.filter(e => e.scheduled).map(e => e.id))
  );
  const [tab, setTab] = useState<"calendar" | "upcoming" | "insights">("calendar");

  const prevMonth = () => setMonth(m => (m === 0 ? 11 : m - 1));
  const nextMonth = () => setMonth(m => (m === 11 ? 0 : m + 1));

  const monthEvents = getEventsForMonth(month);
  const selectedEvents = selectedDay ? getEventsForDay(month, selectedDay) : [];
  const upcoming = [...EVENTS]
    .filter(e => {
      const [mm, dd] = e.date.split("-").map(Number);
      const evDate = new Date(year, mm - 1, dd);
      return evDate >= now;
    })
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 8);

  const toggleSchedule = (id: string) => {
    setScheduledIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const highImpactUpcoming = upcoming.filter(e => e.impact === "high");

  const offset = getDayOfWeekOffset(month, year);
  const daysInMonth = MONTH_DAYS[month];

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5"><ArrowLeft size={18} style={{ color: T.textSub }} /></button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.warning + "20" }}>
              <Calendar size={18} style={{ color: T.warning }} />
            </div>
            <div>
              <h1 className="font-black text-lg">Calendário de Datas</h1>
              <p className="text-xs" style={{ color: T.textSub }}>{scheduledIds.size} datas agendadas · IA de conteúdo ativa</p>
            </div>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-6 pb-0 flex border-b-0">
          {(["calendar","upcoming","insights"] as const).map(id => (
            <button key={id} onClick={() => setTab(id)}
              className="px-5 py-2.5 text-sm font-medium border-b-2 transition-all"
              style={{ borderColor: tab === id ? T.primary : "transparent", color: tab === id ? T.primary : T.textSub }}>
              {id === "calendar" ? "Calendário" : id === "upcoming" ? "Próximas" : "Insights"}
              {id === "upcoming" && highImpactUpcoming.length > 0 && (
                <span className="ml-1.5 px-1.5 rounded-full text-xs font-black" style={{ background: T.warning, color: "#000" }}>
                  {highImpactUpcoming.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6 space-y-5">
        {tab === "calendar" && (
          <>
            <div className="flex items-center justify-between">
              <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-white/5"><ChevronLeft size={18} style={{ color: T.textSub }} /></button>
              <h2 className="font-black text-xl">{MONTHS[month]} {year}</h2>
              <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-white/5"><ChevronRight size={18} style={{ color: T.textSub }} /></button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {["D","S","T","Q","Q","S","S"].map((d, i) => (
                <div key={i} className="text-xs font-bold py-1" style={{ color: T.textSub }}>{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: offset }).map((_, i) => <div key={`off-${i}`} />)}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const dayEvents = getEventsForDay(month, day);
                const hasHigh = dayEvents.some(e => e.impact === "high");
                const hasMed = dayEvents.some(e => e.impact === "medium");
                const isToday = day === now.getDate() && month === now.getMonth();
                const isSelected = day === selectedDay;
                const hasScheduled = dayEvents.some(e => scheduledIds.has(e.id));
                return (
                  <button key={day} onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                    className="aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all"
                    style={{
                      background: isSelected ? T.primary : isToday ? T.primary + "30" : dayEvents.length > 0 ? T.card : "transparent",
                      border: `1px solid ${isSelected ? T.primary : isToday ? T.primary + "50" : dayEvents.length > 0 ? T.border : "transparent"}`,
                    }}>
                    <span className="text-sm font-bold" style={{ color: isSelected ? "#fff" : isToday ? T.primary : T.text }}>
                      {day}
                    </span>
                    {dayEvents.length > 0 && (
                      <div className="flex gap-0.5 mt-0.5">
                        {hasHigh && <div className="w-1.5 h-1.5 rounded-full" style={{ background: T.success }} />}
                        {hasMed && <div className="w-1.5 h-1.5 rounded-full" style={{ background: T.warning }} />}
                        {hasScheduled && <div className="w-1.5 h-1.5 rounded-full" style={{ background: T.accent }} />}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-4 text-xs" style={{ color: T.textSub }}>
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{ background: T.success }} /> Alto</div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{ background: T.warning }} /> Médio</div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{ background: T.accent }} /> Agendado</div>
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-sm" style={{ color: T.textSub }}>
                {selectedDay ? `${String(selectedDay).padStart(2, "0")} de ${MONTHS[month]}` : `${MONTHS[month]} — ${monthEvents.length} evento${monthEvents.length !== 1 ? "s" : ""}`}
              </h3>
              {(selectedDay ? selectedEvents : monthEvents).map(ev => {
                const imp = IMPACT_CFG[ev.impact];
                const cat = CAT_CFG[ev.category];
                const isScheduled = scheduledIds.has(ev.id);
                return (
                  <div key={ev.id} className="flex items-start gap-3 p-4 rounded-2xl border"
                    style={{ background: T.card, borderColor: isScheduled ? T.accent + "30" : T.border }}>
                    <span className="text-2xl flex-shrink-0 mt-0.5">{ev.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm">{ev.name}</span>
                        <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: cat.color + "15", color: cat.color }}>{cat.label}</span>
                        {ev.cpmBoost > 0 && (
                          <span className="text-xs font-black" style={{ color: T.gold }}>+{ev.cpmBoost}% CPM</span>
                        )}
                      </div>
                      <div className="text-xs mt-1" style={{ color: T.textSub }}>
                        {ev.date.split("-").reverse().join("/")} · <span style={{ color: imp.color }}>{imp.label}</span>
                      </div>
                      <p className="text-xs mt-1.5 leading-relaxed" style={{ color: T.textSub }}>{ev.tip}</p>
                      {ev.segments.length > 0 && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {ev.segments.map((s, i) => (
                            <span key={i} className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: T.panel, color: T.textSub }}>{s}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <button onClick={() => toggleSchedule(ev.id)}
                        className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                        style={{ background: isScheduled ? T.accent + "25" : T.panel, border: `1px solid ${isScheduled ? T.accent + "50" : T.border}` }}>
                        {isScheduled ? <Check size={14} style={{ color: T.accent }} /> : <Plus size={14} style={{ color: T.textSub }} />}
                      </button>
                      {ev.cpmBoost > 0 && (
                        <button onClick={() => onNavigate?.("creative-templates")}
                          className="w-8 h-8 rounded-xl flex items-center justify-center"
                          style={{ background: T.warning + "15", border: `1px solid ${T.warning}25` }}>
                          <Sparkles size={13} style={{ color: T.warning }} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              {(selectedDay ? selectedEvents : monthEvents).length === 0 && (
                <div className="text-center py-8" style={{ color: T.textSub }}>
                  <Calendar size={32} className="mx-auto mb-2 opacity-20" />
                  <p className="text-sm">Sem eventos neste {selectedDay ? "dia" : "mês"}.</p>
                </div>
              )}
            </div>
          </>
        )}

        {tab === "upcoming" && (
          <div className="space-y-3">
            {highImpactUpcoming.length > 0 && (
              <div className="p-4 rounded-2xl border" style={{ background: T.warning + "08", borderColor: T.warning + "25" }}>
                <div className="flex items-center gap-2 mb-2">
                  <Bell size={15} style={{ color: T.warning }} />
                  <span className="font-bold text-sm" style={{ color: T.warning }}>
                    {highImpactUpcoming.length} datas de alto impacto nos próximos 90 dias
                  </span>
                </div>
                <p className="text-xs" style={{ color: T.textSub }}>
                  Agende o conteúdo com antecedência para garantir o CPM mais alto.
                </p>
              </div>
            )}
            {upcoming.map(ev => {
              const [mm, dd] = ev.date.split("-").map(Number);
              const evDate = new Date(year, mm - 1, dd);
              const diffDays = Math.ceil((evDate.getTime() - now.getTime()) / 86400000);
              const imp = IMPACT_CFG[ev.impact];
              const isScheduled = scheduledIds.has(ev.id);
              return (
                <div key={ev.id} className="flex items-start gap-4 p-4 rounded-2xl border"
                  style={{ background: T.card, borderColor: isScheduled ? T.accent + "30" : T.border }}>
                  <div className="flex flex-col items-center flex-shrink-0 w-12">
                    <div className="text-2xl">{ev.emoji}</div>
                    <div className="text-xs font-black mt-1" style={{ color: imp.color }}>
                      {diffDays === 0 ? "Hoje" : diffDays === 1 ? "Amanhã" : `${diffDays}d`}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm">{ev.name}</div>
                    <div className="text-xs" style={{ color: T.textSub }}>{dd.toString().padStart(2,"0")}/{mm.toString().padStart(2,"0")}/{year}</div>
                    {ev.cpmBoost > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        <TrendingUp size={11} style={{ color: T.gold }} />
                        <span className="text-xs font-bold" style={{ color: T.gold }}>+{ev.cpmBoost}% CPM estimado</span>
                      </div>
                    )}
                    <p className="text-xs mt-1 line-clamp-2" style={{ color: T.textSub }}>{ev.tip}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => toggleSchedule(ev.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                      style={{ background: isScheduled ? T.accent + "20" : T.primary + "15", color: isScheduled ? T.accent : T.primary }}>
                      {isScheduled ? "✓ Agendado" : "Agendar"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === "insights" && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-bold mb-3">CPM projetado por data (próx. 90 dias)</h3>
              <div className="space-y-3">
                {upcoming.filter(e => e.cpmBoost > 0).slice(0, 6).map(ev => (
                  <div key={ev.id} className="flex items-center gap-3">
                    <span className="text-xl flex-shrink-0">{ev.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium truncate">{ev.name}</span>
                        <span className="text-sm font-black ml-2 flex-shrink-0" style={{ color: T.gold }}>+{ev.cpmBoost}%</span>
                      </div>
                      <div className="h-2 rounded-full" style={{ background: T.border }}>
                        <div className="h-full rounded-full" style={{ width: `${ev.cpmBoost}%`, background: ev.impact === "high" ? T.success : ev.impact === "medium" ? T.warning : T.textSub }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-bold mb-3">Datas críticas do seu segmento</h3>
              <div className="space-y-2">
                {[
                  { emoji: "💈", ev: "Dia do Amigo",     date: "01/08", tip: "Promoção 'traga um amigo' — barbearia",   boost: 30 },
                  { emoji: "👔", ev: "Dia dos Pais",      date: "15/08", tip: "Corte especial + kit presente",          boost: 60 },
                  { emoji: "🖤", ev: "Black Friday",      date: "28/11", tip: "Pacotes mensais com desconto",           boost: 80 },
                  { emoji: "🎄", ev: "Natal",             date: "25/12", tip: "Gift cards e combos de Natal",           boost: 75 },
                ].map((d, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: T.panel }}>
                    <span className="text-lg">{d.emoji}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">{d.ev}</span>
                        <span className="text-xs" style={{ color: T.textSub }}>{d.date}</span>
                      </div>
                      <div className="text-xs" style={{ color: T.textSub }}>{d.tip}</div>
                    </div>
                    <span className="font-black text-sm" style={{ color: T.gold }}>+{d.boost}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 rounded-2xl border" style={{ background: T.accent + "08", borderColor: T.accent + "25" }}>
              <div className="flex items-start gap-3">
                <Sparkles size={16} style={{ color: T.accent, marginTop: 1 }} />
                <div>
                  <div className="font-bold text-sm mb-1">Sugestão da IA para Agosto</div>
                  <p className="text-sm" style={{ color: T.textSub }}>
                    Agosto tem <strong className="text-white">3 datas de alto impacto</strong> (Dia do Estudante, Dia dos Pais, Dia do Amigo). Prepare criativos diferentes para cada uma. Receita estimada do mês: <strong style={{ color: T.success }}>R$2.100</strong> (+68% vs julho).
                  </p>
                  <button onClick={() => onNavigate?.("creative-templates")}
                    className="mt-3 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"
                    style={{ background: T.accent + "20", color: T.accent }}>
                    <Sparkles size={13} /> Gerar criativos para agosto
                  </button>
                </div>
              </div>
            </div>
            <button onClick={() => onNavigate?.("content-calendar")}
              className="w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2"
              style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`, color: "#fff" }}>
              <Play size={16} /> Ver Calendário de Conteúdo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
