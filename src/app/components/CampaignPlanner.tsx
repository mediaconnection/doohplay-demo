import { useState } from "react";
import { ArrowLeft, Plus, Calendar, DollarSign, Target, Clock, ChevronLeft, ChevronRight, Trash2, Edit3, CheckCircle, Zap, TrendingUp } from "lucide-react";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

interface Props { onBack: () => void; onNavigate?: (v: string) => void; }

interface Campaign {
  id: number;
  name: string;
  startDay: number;
  endDay: number;
  month: number;
  budget: number;
  status: "active" | "scheduled" | "paused" | "draft";
  color: string;
  screens: number;
  type: string;
}

const MONTH_NAMES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const DAYS_IN_MONTH = [31,28,31,30,31,30,31,31,30,31,30,31];
const CAMPAIGN_COLORS = [T.primary, T.accent, T.success, T.warning, T.gold, "#FF6B6B", "#00D4AA", "#FF9F43"];
const TYPES = ["Institucional", "Promoção", "Lançamento", "Evento", "Temporada", "Flash Sale"];

const INITIAL_CAMPAIGNS: Campaign[] = [
  { id: 1, name: "Campanha Verão 2026", startDay: 1, endDay: 15, month: 6, budget: 2400, status: "active", color: T.primary, screens: 8, type: "Temporada" },
  { id: 2, name: "Promo Julho 50%", startDay: 5, endDay: 20, month: 6, budget: 1800, status: "scheduled", color: T.accent, screens: 5, type: "Promoção" },
  { id: 3, name: "Flash Sale Fim de Mês", startDay: 28, endDay: 31, month: 6, budget: 900, status: "draft", color: T.warning, screens: 3, type: "Flash Sale" },
  { id: 4, name: "Lançamento Produto X", startDay: 10, endDay: 25, month: 7, budget: 3200, status: "scheduled", color: T.success, screens: 10, type: "Lançamento" },
];

const statusConfig = {
  active:    { label: "Ativo",      color: T.success },
  scheduled: { label: "Agendado",   color: T.primary },
  paused:    { label: "Pausado",    color: T.warning },
  draft:     { label: "Rascunho",   color: T.textSub },
};

export default function CampaignPlanner({ onBack, onNavigate }: Props) {
  const [campaigns, setCampaigns] = useState<Campaign[]>(INITIAL_CAMPAIGNS);
  const [currentMonth, setCurrentMonth] = useState(6); // July = index 6
  const [selected, setSelected] = useState<Campaign | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [tab, setTab] = useState<"calendar" | "list" | "budget">("calendar");

  // Form state
  const [form, setForm] = useState({ name: "", startDay: 1, endDay: 7, budget: 500, screens: 1, type: "Promoção", color: T.primary });

  const monthCampaigns = campaigns.filter(c => c.month === currentMonth);
  const totalBudget = monthCampaigns.reduce((a, c) => a + c.budget, 0);
  const activeCampaigns = monthCampaigns.filter(c => c.status === "active").length;
  const days = DAYS_IN_MONTH[currentMonth];

  const handleAdd = () => {
    const newCamp: Campaign = {
      id: Date.now(), ...form, month: currentMonth, status: "draft",
    };
    setCampaigns(prev => [...prev, newCamp]);
    setShowForm(false);
    setForm({ name: "", startDay: 1, endDay: 7, budget: 500, screens: 1, type: "Promoção", color: T.primary });
  };

  const handleDelete = (id: number) => {
    setCampaigns(prev => prev.filter(c => c.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  // Generate calendar rows (7 days per row)
  const weeks: number[][] = [];
  for (let d = 1; d <= days; d += 7) {
    weeks.push(Array.from({ length: Math.min(7, days - d + 1) }, (_, i) => d + i));
  }

  const getCampaignsForDay = (day: number) =>
    monthCampaigns.filter(c => day >= c.startDay && day <= c.endDay);

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5"><ArrowLeft size={18} style={{ color: T.textSub }} /></button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.primary + "20" }}>
                <Calendar size={18} style={{ color: T.primary }} />
              </div>
              <div>
                <h1 className="font-black text-lg">Planejador de Campanhas</h1>
                <p className="text-xs" style={{ color: T.textSub }}>Organize e agende suas campanhas</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Month nav */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: T.card, border: `1px solid ${T.border}` }}>
              <button onClick={() => setCurrentMonth(m => Math.max(0, m - 1))} className="hover:opacity-70">
                <ChevronLeft size={16} style={{ color: T.textSub }} />
              </button>
              <span className="font-bold text-sm w-24 text-center">{MONTH_NAMES[currentMonth]} 2026</span>
              <button onClick={() => setCurrentMonth(m => Math.min(11, m + 1))} className="hover:opacity-70">
                <ChevronRight size={16} style={{ color: T.textSub }} />
              </button>
            </div>
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
              style={{ background: T.primary, color: "#fff" }}>
              <Plus size={14} /> Nova Campanha
            </button>
          </div>
        </div>
        {/* Tabs */}
        <div className="max-w-6xl mx-auto px-6 pb-0 flex gap-1">
          {(["calendar","list","budget"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="px-5 py-2.5 text-sm font-bold capitalize border-b-2 transition-all"
              style={{ color: tab === t ? T.primary : T.textSub, borderColor: tab === t ? T.primary : "transparent" }}>
              {t === "calendar" ? "Calendário" : t === "list" ? "Lista" : "Orçamento"}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        {/* KPI strip */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Campanhas no mês", value: monthCampaigns.length, color: T.primary, icon: Calendar },
            { label: "Ativas agora", value: activeCampaigns, color: T.success, icon: Zap },
            { label: "Orçamento total", value: `R$${totalBudget.toLocaleString("pt-BR")}`, color: T.gold, icon: DollarSign },
            { label: "CPM médio estimado", value: "R$42", color: T.accent, icon: TrendingUp },
          ].map((k, i) => (
            <div key={i} className="p-4 rounded-2xl border flex items-center gap-3" style={{ background: T.card, borderColor: T.border }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: k.color + "20" }}>
                <k.icon size={16} style={{ color: k.color }} />
              </div>
              <div>
                <div className="font-black text-xl" style={{ color: k.color }}>{k.value}</div>
                <div className="text-xs" style={{ color: T.textSub }}>{k.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Calendar tab */}
        {tab === "calendar" && (
          <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
            <h3 className="font-bold mb-4">{MONTH_NAMES[currentMonth]} 2026</h3>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"].map(d => (
                <div key={d} className="text-center text-xs font-bold py-1" style={{ color: T.textSub }}>{d}</div>
              ))}
            </div>

            {/* Days */}
            <div className="space-y-1">
              {weeks.map((week, wi) => (
                <div key={wi} className="grid grid-cols-7 gap-1">
                  {week.map(day => {
                    const dayC = getCampaignsForDay(day);
                    const isToday = day === 23 && currentMonth === 6;
                    return (
                      <div key={day} className="min-h-16 rounded-xl p-1.5"
                        style={{ background: isToday ? T.primary + "15" : T.panel, border: `1px solid ${isToday ? T.primary + "40" : T.border}` }}>
                        <div className="text-xs font-bold mb-1" style={{ color: isToday ? T.primary : T.textSub }}>{day}</div>
                        <div className="space-y-0.5">
                          {dayC.slice(0, 2).map(c => (
                            <div key={c.id} onClick={() => setSelected(c)}
                              className="text-xs px-1 py-0.5 rounded cursor-pointer truncate font-medium"
                              style={{ background: c.color + "25", color: c.color }}>
                              {c.name.length > 10 ? c.name.slice(0, 10) + "…" : c.name}
                            </div>
                          ))}
                          {dayC.length > 2 && (
                            <div className="text-xs px-1" style={{ color: T.textSub }}>+{dayC.length - 2}</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {/* Fill remaining slots */}
                  {Array.from({ length: 7 - week.length }, (_, i) => (
                    <div key={`empty-${i}`} />
                  ))}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-3">
              {monthCampaigns.map(c => (
                <div key={c.id} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm" style={{ background: c.color }} />
                  <span className="text-xs" style={{ color: T.textSub }}>{c.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* List tab */}
        {tab === "list" && (
          <div className="space-y-3">
            {campaigns.map(c => (
              <div key={c.id} className="p-4 rounded-2xl border flex items-center gap-4 transition-all hover:border-opacity-60"
                style={{ background: T.card, borderColor: T.border }}>
                <div className="w-3 h-12 rounded-full flex-shrink-0" style={{ background: c.color }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold truncate">{c.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                      style={{ background: statusConfig[c.status].color + "20", color: statusConfig[c.status].color }}>
                      {statusConfig[c.status].label}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs" style={{ color: T.textSub }}>
                    <span><Calendar size={10} className="inline mr-1" />{MONTH_NAMES[c.month]} {c.startDay}–{c.endDay}</span>
                    <span><Target size={10} className="inline mr-1" />{c.screens} telas</span>
                    <span><Clock size={10} className="inline mr-1" />{c.type}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-black" style={{ color: T.gold }}>R${c.budget.toLocaleString("pt-BR")}</div>
                  <div className="text-xs" style={{ color: T.textSub }}>orçamento</div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setSelected(c)} className="p-2 rounded-lg hover:bg-white/5">
                    <Edit3 size={14} style={{ color: T.textSub }} />
                  </button>
                  <button onClick={() => handleDelete(c.id)} className="p-2 rounded-lg hover:bg-white/5">
                    <Trash2 size={14} style={{ color: T.danger + "80" }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Budget tab */}
        {tab === "budget" && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-bold mb-4">Distribuição de orçamento — {MONTH_NAMES[currentMonth]}</h3>
              <div className="space-y-3">
                {monthCampaigns.map(c => (
                  <div key={c.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span style={{ color: T.text }}>{c.name}</span>
                      <span className="font-bold" style={{ color: c.color }}>R${c.budget.toLocaleString("pt-BR")} ({Math.round(c.budget / totalBudget * 100)}%)</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: T.panel }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${(c.budget / totalBudget) * 100}%`, background: c.color }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t flex justify-between font-bold" style={{ borderColor: T.border }}>
                <span style={{ color: T.textSub }}>Total do mês</span>
                <span style={{ color: T.gold }}>R${totalBudget.toLocaleString("pt-BR")}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Estimativa de impressões", value: "2.4M", color: T.primary },
                { label: "CPM médio", value: "R$42,00", color: T.accent },
                { label: "ROI estimado", value: "340%", color: T.success },
              ].map((m, i) => (
                <div key={i} className="p-4 rounded-2xl border text-center" style={{ background: T.card, borderColor: T.border }}>
                  <div className="font-black text-2xl mb-1" style={{ color: m.color }}>{m.value}</div>
                  <div className="text-xs" style={{ color: T.textSub }}>{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selected campaign detail */}
        {selected && (
          <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: selected.color + "40" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-lg">{selected.name}</h3>
              <button onClick={() => setSelected(null)} className="text-xs" style={{ color: T.textSub }}>fechar</button>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "Período", value: `${MONTH_NAMES[selected.month]} ${selected.startDay}–${selected.endDay}` },
                { label: "Orçamento", value: `R$${selected.budget.toLocaleString("pt-BR")}` },
                { label: "Telas", value: `${selected.screens} ativas` },
                { label: "Tipo", value: selected.type },
              ].map((d, i) => (
                <div key={i} className="p-3 rounded-xl" style={{ background: T.panel }}>
                  <div className="text-xs mb-1" style={{ color: T.textSub }}>{d.label}</div>
                  <div className="font-bold text-sm">{d.value}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
                style={{ background: T.success + "20", color: T.success, border: `1px solid ${T.success}30` }}>
                <CheckCircle size={14} /> Ativar Campanha
              </button>
              <button onClick={() => onNavigate?.("campaign-analytics")}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
                style={{ background: T.primary + "20", color: T.primary, border: `1px solid ${T.primary}30` }}>
                <TrendingUp size={14} /> Ver Analytics
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add campaign modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="w-full max-w-md p-6 rounded-3xl border" style={{ background: T.panel, borderColor: T.border }}>
            <h3 className="font-black text-lg mb-5">Nova Campanha</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: T.textSub }}>Nome da campanha</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Ex: Promoção Julho"
                  className="w-full px-3 py-2.5 rounded-xl text-sm"
                  style={{ background: T.card, border: `1px solid ${T.border}`, color: T.text }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: T.textSub }}>Dia início</label>
                  <input type="number" min={1} max={days} value={form.startDay} onChange={e => setForm(f => ({ ...f, startDay: Number(e.target.value) }))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm"
                    style={{ background: T.card, border: `1px solid ${T.border}`, color: T.text }} />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: T.textSub }}>Dia fim</label>
                  <input type="number" min={1} max={days} value={form.endDay} onChange={e => setForm(f => ({ ...f, endDay: Number(e.target.value) }))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm"
                    style={{ background: T.card, border: `1px solid ${T.border}`, color: T.text }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: T.textSub }}>Orçamento (R$)</label>
                  <input type="number" value={form.budget} onChange={e => setForm(f => ({ ...f, budget: Number(e.target.value) }))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm"
                    style={{ background: T.card, border: `1px solid ${T.border}`, color: T.text }} />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: T.textSub }}>Nº de telas</label>
                  <input type="number" min={1} value={form.screens} onChange={e => setForm(f => ({ ...f, screens: Number(e.target.value) }))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm"
                    style={{ background: T.card, border: `1px solid ${T.border}`, color: T.text }} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: T.textSub }}>Tipo</label>
                <div className="grid grid-cols-3 gap-2">
                  {TYPES.map(t => (
                    <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))}
                      className="py-2 rounded-xl text-xs font-bold transition-all"
                      style={{ background: form.type === t ? T.primary + "20" : T.card, color: form.type === t ? T.primary : T.textSub, border: `1px solid ${form.type === t ? T.primary + "40" : T.border}` }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: T.textSub }}>Cor</label>
                <div className="flex gap-2">
                  {CAMPAIGN_COLORS.map(c => (
                    <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                      className="w-8 h-8 rounded-lg transition-all"
                      style={{ background: c, outline: form.color === c ? `2px solid white` : "none", outlineOffset: 2 }} />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold"
                style={{ background: T.card, color: T.textSub, border: `1px solid ${T.border}` }}>
                Cancelar
              </button>
              <button onClick={handleAdd} disabled={!form.name}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
                style={{ background: form.name ? T.primary : T.textSub, color: "#fff" }}>
                Criar Campanha
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
