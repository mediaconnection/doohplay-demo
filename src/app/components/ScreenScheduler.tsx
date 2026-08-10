import { useState } from "react";
import { ArrowLeft, Clock, Monitor, ChevronLeft, ChevronRight, Plus, Trash2, Copy, Zap, Calendar, Eye } from "lucide-react";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

interface Props { onBack: () => void; onNavigate?: (v: string) => void; }

const SCREENS = ["Recepção", "Sala Espera A", "Corredor B2", "Vitrine Norte", "Caixa 1", "Lounge VIP"];
const HOURS = Array.from({ length: 16 }, (_, i) => i + 7);
const DAYS = ["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"];

interface Block {
  id: number; screen: number; day: number; startH: number; endH: number;
  name: string; color: string; type: string;
}

const CAMPAIGN_COLORS = [T.primary, T.accent, T.success, T.warning, "#FF6B6B", "#00D4AA", T.gold];
const TYPES = ["Promoção", "Institucional", "Conteúdo", "Evento", "Patrocínio"];

let nid = 20;

const INITIAL_BLOCKS: Block[] = [
  { id: 1, screen: 0, day: 0, startH: 8, endH: 12, name: "Campanha Verão", color: T.primary, type: "Promoção" },
  { id: 2, screen: 0, day: 0, startH: 14, endH: 18, name: "Happy Hour", color: T.warning, type: "Evento" },
  { id: 3, screen: 1, day: 0, startH: 9, endH: 17, name: "Institucional", color: T.success, type: "Institucional" },
  { id: 4, screen: 2, day: 1, startH: 7, endH: 11, name: "Flash Sale", color: T.danger, type: "Promoção" },
  { id: 5, screen: 0, day: 2, startH: 10, endH: 14, name: "Evento Tech", color: T.accent, type: "Evento" },
  { id: 6, screen: 3, day: 1, startH: 8, endH: 20, name: "Cardápio Digital", color: T.gold, type: "Conteúdo" },
  { id: 7, screen: 4, day: 3, startH: 12, endH: 16, name: "Promo Tarde", color: "#FF6B6B", type: "Promoção" },
  { id: 8, screen: 5, day: 4, startH: 18, endH: 22, name: "Noite Premium", color: "#00D4AA", type: "Patrocínio" },
];

const hourLabel = (h: number) => `${String(h).padStart(2, "0")}:00`;

export default function ScreenScheduler({ onBack, onNavigate }: Props) {
  const [blocks, setBlocks] = useState<Block[]>(INITIAL_BLOCKS);
  const [viewMode, setViewMode] = useState<"week" | "screen">("week");
  const [currentDay, setCurrentDay] = useState(0);
  const [selectedScreen, setSelectedScreen] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ screen: 0, day: 0, startH: 9, endH: 12, name: "", color: T.primary, type: "Promoção" });

  const addBlock = () => {
    if (!form.name || form.endH <= form.startH) return;
    setBlocks(prev => [...prev, { id: nid++, ...form }]);
    setShowForm(false);
    setForm({ screen: 0, day: 0, startH: 9, endH: 12, name: "", color: T.primary, type: "Promoção" });
  };

  const deleteBlock = (id: number) => {
    setBlocks(prev => prev.filter(b => b.id !== id));
    if (selected === id) setSelected(null);
  };

  const totalHours = blocks.reduce((a, b) => a + (b.endH - b.startH), 0);
  const fillPct = Math.round((totalHours / (SCREENS.length * DAYS.length * HOURS.length)) * 100);
  const selectedBlock = blocks.find(b => b.id === selected);

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-full px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5"><ArrowLeft size={18} style={{ color: T.textSub }} /></button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.primary + "20" }}>
                <Calendar size={18} style={{ color: T.primary }} />
              </div>
              <div>
                <h1 className="font-black text-lg">Grade de Programação</h1>
                <p className="text-xs" style={{ color: T.textSub }}>Semana 29 · Jul 2026 · Fill: {fillPct}%</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: T.card, border: `1px solid ${T.border}` }}>
              {(["week","screen"] as const).map(v => (
                <button key={v} onClick={() => setViewMode(v)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                  style={{ background: viewMode === v ? T.primary : "transparent", color: viewMode === v ? "#fff" : T.textSub }}>
                  {v === "week" ? "Por dia" : "Por tela"}
                </button>
              ))}
            </div>
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
              style={{ background: T.primary, color: "#fff" }}>
              <Plus size={14} /> Adicionar Bloco
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Blocos agendados", value: blocks.length, color: T.primary, icon: Calendar },
            { label: "Horas programadas", value: `${totalHours}h`, color: T.success, icon: Clock },
            { label: "Fill rate da grade", value: `${fillPct}%`, color: fillPct > 60 ? T.success : T.warning, icon: Zap },
            { label: "Telas ativas", value: SCREENS.length, color: T.accent, icon: Monitor },
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

        {viewMode === "week" ? (
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentDay(d => Math.max(0, d - 1))} className="p-2 rounded-lg hover:bg-white/5">
              <ChevronLeft size={16} style={{ color: T.textSub }} />
            </button>
            {DAYS.map((d, i) => (
              <button key={d} onClick={() => setCurrentDay(i)}
                className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
                style={{ background: currentDay === i ? T.primary : T.card, color: currentDay === i ? "#fff" : T.textSub, border: `1px solid ${currentDay === i ? T.primary : T.border}` }}>
                {d}
              </button>
            ))}
            <button onClick={() => setCurrentDay(d => Math.min(6, d + 1))} className="p-2 rounded-lg hover:bg-white/5">
              <ChevronRight size={16} style={{ color: T.textSub }} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {SCREENS.map((s, i) => (
              <button key={s} onClick={() => setSelectedScreen(i)}
                className="px-4 py-2 rounded-xl text-sm font-bold transition-all truncate"
                style={{ background: selectedScreen === i ? T.accent : T.card, color: selectedScreen === i ? "#fff" : T.textSub, border: `1px solid ${selectedScreen === i ? T.accent : T.border}` }}>
                {s}
              </button>
            ))}
          </div>
        )}

        <div className="rounded-2xl border overflow-x-auto" style={{ background: T.card, borderColor: T.border }}>
          <div className="flex border-b" style={{ borderColor: T.border, minWidth: 900 }}>
            <div className="w-32 flex-shrink-0 px-3 py-2 text-xs font-bold" style={{ color: T.textSub }}>
              {viewMode === "week" ? `${DAYS[currentDay]} — Tela` : `Tela: ${SCREENS[selectedScreen]}`}
            </div>
            {HOURS.map(h => (
              <div key={h} className="flex-1 px-1 py-2 text-center text-xs" style={{ color: T.textSub, borderLeft: `1px solid ${T.border}` }}>
                {hourLabel(h)}
              </div>
            ))}
          </div>
          {(viewMode === "week" ? SCREENS : DAYS).map((label, rowIdx) => {
            const screenIdx = viewMode === "week" ? rowIdx : selectedScreen;
            const dayIdx = viewMode === "week" ? currentDay : rowIdx;
            const rowBlocks = blocks.filter(b => b.screen === screenIdx && b.day === dayIdx);
            return (
              <div key={label} className="flex border-b last:border-0" style={{ borderColor: T.border, minWidth: 900 }}>
                <div className="w-32 flex-shrink-0 px-3 py-3 flex items-center" style={{ borderRight: `1px solid ${T.border}` }}>
                  <div className="flex items-center gap-2">
                    <Monitor size={12} style={{ color: T.textSub }} />
                    <span className="text-xs font-medium truncate">{label}</span>
                  </div>
                </div>
                <div className="flex-1 relative h-12">
                  {HOURS.map((_, i) => (
                    <div key={i} className="absolute top-0 bottom-0" style={{ left: `${(i / HOURS.length) * 100}%`, width: 1, background: T.border }} />
                  ))}
                  {rowBlocks.map(b => {
                    const left = ((b.startH - HOURS[0]) / HOURS.length) * 100;
                    const width = ((b.endH - b.startH) / HOURS.length) * 100;
                    return (
                      <button key={b.id}
                        onClick={() => setSelected(b.id === selected ? null : b.id)}
                        className="absolute top-1 bottom-1 rounded-lg flex items-center px-2 overflow-hidden transition-all"
                        style={{ left: `${left}%`, width: `${width}%`, background: b.color + "30", border: `1px solid ${b.color}60`, outline: selected === b.id ? `2px solid ${b.color}` : "none" }}>
                        <span className="text-xs font-bold truncate" style={{ color: b.color }}>{b.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {selectedBlock && (
          <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: selectedBlock.color + "40" }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded" style={{ background: selectedBlock.color }} />
                <span className="font-black text-lg">{selectedBlock.name}</span>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: selectedBlock.color + "20", color: selectedBlock.color }}>{selectedBlock.type}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setBlocks(prev => [...prev, { ...selectedBlock, id: nid++, startH: selectedBlock.startH + 1, endH: selectedBlock.endH + 1 }])}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: T.primary + "20", color: T.primary }}>
                  <Copy size={12} /> Duplicar
                </button>
                <button onClick={() => deleteBlock(selectedBlock.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: T.danger + "20", color: T.danger }}>
                  <Trash2 size={12} /> Excluir
                </button>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3 mt-4">
              {[
                { label: "Tela", value: SCREENS[selectedBlock.screen] },
                { label: "Dia", value: DAYS[selectedBlock.day] },
                { label: "Horário", value: `${hourLabel(selectedBlock.startH)} – ${hourLabel(selectedBlock.endH)}` },
                { label: "Duração", value: `${selectedBlock.endH - selectedBlock.startH}h` },
              ].map((d, i) => (
                <div key={i} className="p-3 rounded-xl" style={{ background: T.panel }}>
                  <div className="text-xs mb-1" style={{ color: T.textSub }}>{d.label}</div>
                  <div className="font-bold text-sm">{d.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="w-full max-w-md p-6 rounded-3xl border" style={{ background: T.panel, borderColor: T.border }}>
            <h3 className="font-black text-lg mb-5">Novo Bloco de Programação</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: T.textSub }}>Nome do conteúdo</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Ex: Campanha Verão"
                  className="w-full px-3 py-2.5 rounded-xl text-sm"
                  style={{ background: T.card, border: `1px solid ${T.border}`, color: T.text }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: T.textSub }}>Tela</label>
                  <select value={form.screen} onChange={e => setForm(f => ({ ...f, screen: Number(e.target.value) }))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm"
                    style={{ background: T.card, border: `1px solid ${T.border}`, color: T.text }}>
                    {SCREENS.map((s, i) => <option key={i} value={i}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: T.textSub }}>Dia da semana</label>
                  <select value={form.day} onChange={e => setForm(f => ({ ...f, day: Number(e.target.value) }))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm"
                    style={{ background: T.card, border: `1px solid ${T.border}`, color: T.text }}>
                    {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: T.textSub }}>Início</label>
                  <select value={form.startH} onChange={e => setForm(f => ({ ...f, startH: Number(e.target.value) }))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm"
                    style={{ background: T.card, border: `1px solid ${T.border}`, color: T.text }}>
                    {HOURS.map(h => <option key={h} value={h}>{hourLabel(h)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: T.textSub }}>Fim</label>
                  <select value={form.endH} onChange={e => setForm(f => ({ ...f, endH: Number(e.target.value) }))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm"
                    style={{ background: T.card, border: `1px solid ${T.border}`, color: T.text }}>
                    {HOURS.filter(h => h > form.startH).map(h => <option key={h} value={h}>{hourLabel(h)}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: T.textSub }}>Tipo</label>
                <div className="flex flex-wrap gap-2">
                  {TYPES.map(t => (
                    <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold"
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
                      className="w-8 h-8 rounded-lg"
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
              <button onClick={addBlock} disabled={!form.name}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold"
                style={{ background: form.name ? T.primary : T.textSub, color: "#fff" }}>
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
