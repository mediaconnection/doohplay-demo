import { useState } from "react";
import {
  ArrowLeft, Users, Plus, X, ChevronDown, Zap, Check,
  Target, Clock, MapPin, Smartphone, DollarSign, TrendingUp, Save, Eye
} from "lucide-react";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

type FilterType = "age" | "gender" | "time" | "location" | "device" | "income" | "interest";

interface FilterDef {
  id: string;
  type: FilterType;
  label: string;
  values: string[];
  selected: string[];
}

interface Segment {
  id: string;
  name: string;
  description: string;
  estimatedReach: number;
  cpmPremium: number;
  filters: FilterDef[];
  saved: boolean;
}

const FILTER_OPTIONS: Record<FilterType, { label: string; icon: typeof Users; options: string[] }> = {
  age:       { label: "Faixa etária",    icon: Users,       options: ["18–24","25–34","35–44","45–54","55–64","65+"] },
  gender:    { label: "Gênero",          icon: Users,       options: ["Masculino","Feminino","Todos"] },
  time:      { label: "Horário",         icon: Clock,       options: ["Manhã (6h–12h)","Tarde (12h–18h)","Noite (18h–22h)","Madrugada (22h–6h)"] },
  location:  { label: "Localização",     icon: MapPin,      options: ["Centro","Zona Sul","Zona Norte","Zona Leste","Zona Oeste","Bairros premium"] },
  device:    { label: "Dispositivo",     icon: Smartphone,  options: ["Smartphone iOS","Smartphone Android","Desktop","Smart TV"] },
  income:    { label: "Renda",           icon: DollarSign,  options: ["A (>R$10K)","B (R$5K–10K)","C (R$2K–5K)","D (<R$2K)"] },
  interest:  { label: "Interesse",       icon: Target,      options: ["Fitness","Gastronomia","Tecnologia","Moda","Automóveis","Saúde","Educação","Finanças"] },
};

const PRESET_SEGMENTS: Segment[] = [
  {
    id: "s1", name: "Homens executivos SP", description: "Homens 30–50 anos, alta renda, zona sul e centro",
    estimatedReach: 142000, cpmPremium: 65, saved: true,
    filters: [
      { id: "f1", type: "age",      label: "Faixa etária",  values: [], selected: ["25–34","35–44","45–54"] },
      { id: "f2", type: "gender",   label: "Gênero",        values: [], selected: ["Masculino"] },
      { id: "f3", type: "income",   label: "Renda",         values: [], selected: ["A (>R$10K)","B (R$5K–10K)"] },
      { id: "f4", type: "location", label: "Localização",   values: [], selected: ["Centro","Zona Sul","Bairros premium"] },
    ],
  },
  {
    id: "s2", name: "Mulheres fit 25–40", description: "Mulheres ativas, interesse em fitness, manhã e noite",
    estimatedReach: 98000, cpmPremium: 52, saved: true,
    filters: [
      { id: "f1", type: "age",      label: "Faixa etária",  values: [], selected: ["25–34","35–44"] },
      { id: "f2", type: "gender",   label: "Gênero",        values: [], selected: ["Feminino"] },
      { id: "f3", type: "time",     label: "Horário",       values: [], selected: ["Manhã (6h–12h)","Noite (18h–22h)"] },
      { id: "f4", type: "interest", label: "Interesse",     values: [], selected: ["Fitness","Saúde"] },
    ],
  },
];

interface Props { onBack: () => void; onNavigate?: (v: string) => void; }

function estimateReach(filters: FilterDef[]): number {
  let base = 500000;
  const sel = filters.flatMap(f => f.selected);
  if (sel.includes("Masculino") || sel.includes("Feminino")) base *= 0.52;
  if (sel.some(s => s.startsWith("A") || s.startsWith("B"))) base *= 0.3;
  if (sel.includes("25–34") || sel.includes("35–44")) base *= 0.4;
  if (sel.some(s => s.includes("Noite") || s.includes("Manhã"))) base *= 0.5;
  return Math.max(8000, Math.round(base));
}

function estimateCpm(filters: FilterDef[]): number {
  let premium = 1.0;
  const sel = filters.flatMap(f => f.selected);
  if (sel.includes("A (>R$10K)")) premium += 0.4;
  if (sel.includes("Bairros premium")) premium += 0.2;
  if (sel.some(s => s.includes("Noite"))) premium += 0.15;
  return Math.round(42 * premium);
}

export default function AudienceBuilder({ onBack, onNavigate }: Props) {
  const [segments, setSegments] = useState<Segment[]>(PRESET_SEGMENTS);
  const [editing, setEditing] = useState<Segment | null>(null);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [activeFilters, setActiveFilters] = useState<FilterDef[]>([]);
  const [addingFilter, setAddingFilter] = useState(false);
  const [saved, setSaved] = useState(false);

  const startNew = () => {
    setEditing({ id: "new", name: "", description: "", estimatedReach: 0, cpmPremium: 42, filters: [], saved: false });
    setActiveFilters([]);
    setNewName("");
    setNewDesc("");
    setSaved(false);
  };

  const addFilter = (type: FilterType) => {
    const def = FILTER_OPTIONS[type];
    setActiveFilters(prev => [...prev, { id: `f${Date.now()}`, type, label: def.label, values: def.options, selected: [] }]);
    setAddingFilter(false);
  };

  const toggleOption = (filterId: string, option: string) => {
    setActiveFilters(prev => prev.map(f =>
      f.id !== filterId ? f : {
        ...f,
        selected: f.selected.includes(option) ? f.selected.filter(s => s !== option) : [...f.selected, option],
      }
    ));
  };

  const removeFilter = (filterId: string) => setActiveFilters(prev => prev.filter(f => f.id !== filterId));

  const saveSegment = () => {
    if (!newName) return;
    const seg: Segment = {
      id: `s${Date.now()}`,
      name: newName,
      description: newDesc,
      estimatedReach: estimateReach(activeFilters),
      cpmPremium: estimateCpm(activeFilters),
      filters: activeFilters,
      saved: true,
    };
    setSegments(prev => [seg, ...prev]);
    setSaved(true);
    setTimeout(() => { setEditing(null); setSaved(false); }, 1500);
  };

  const reach = estimateReach(activeFilters);
  const cpm = estimateCpm(activeFilters);

  if (editing) {
    return (
      <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
        <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
          <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
            <button onClick={() => setEditing(null)} className="p-2 rounded-lg hover:bg-white/5"><ArrowLeft size={18} style={{ color: T.textSub }} /></button>
            <h1 className="font-black">Novo Segmento</h1>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-6 py-6 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl border text-center" style={{ background: T.card, borderColor: T.border }}>
              <div className="font-black text-3xl" style={{ color: T.primary }}>{(reach / 1000).toFixed(0)}K</div>
              <div className="text-xs mt-1" style={{ color: T.textSub }}>alcance estimado / mês</div>
            </div>
            <div className="p-4 rounded-2xl border text-center" style={{ background: T.card, borderColor: T.border }}>
              <div className="font-black text-3xl" style={{ color: T.gold }}>R${cpm}</div>
              <div className="text-xs mt-1" style={{ color: T.textSub }}>CPM premium estimado</div>
            </div>
          </div>

          <div className="space-y-3">
            {[{ label: "Nome do segmento", val: newName, set: setNewName, ph: "Ex: Executivos SP Premium" },
              { label: "Descrição", val: newDesc, set: setNewDesc, ph: "Ex: Homens 35–50, alta renda, zona sul" }].map((f, i) => (
              <div key={i}>
                <label className="block text-xs font-medium mb-1.5" style={{ color: T.textSub }}>{f.label}</label>
                <input value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph}
                  className="w-full px-4 py-3 rounded-xl text-sm"
                  style={{ background: T.card, border: `1px solid ${T.border}`, color: T.text }} />
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm">Filtros ativos ({activeFilters.length})</h3>
              <button onClick={() => setAddingFilter(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{ background: T.primary + "15", color: T.primary }}>
                <Plus size={12} /> Adicionar filtro
              </button>
            </div>

            {addingFilter && (
              <div className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.primary + "30" }}>
                <div className="text-xs font-medium mb-3" style={{ color: T.textSub }}>Escolha o tipo de filtro:</div>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.entries(FILTER_OPTIONS) as [FilterType, typeof FILTER_OPTIONS[FilterType]][]).map(([k, v]) => {
                    const Icon = v.icon;
                    const alreadyAdded = activeFilters.some(f => f.type === k);
                    return (
                      <button key={k} onClick={() => !alreadyAdded && addFilter(k)} disabled={alreadyAdded}
                        className="flex items-center gap-2 p-2.5 rounded-xl text-sm font-medium disabled:opacity-40"
                        style={{ background: T.panel, color: alreadyAdded ? T.textSub : T.text, border: `1px solid ${T.border}` }}>
                        <Icon size={13} style={{ color: T.primary }} />
                        {v.label}
                        {alreadyAdded && <Check size={12} style={{ color: T.success, marginLeft: "auto" }} />}
                      </button>
                    );
                  })}
                </div>
                <button onClick={() => setAddingFilter(false)} className="mt-2 text-xs" style={{ color: T.textSub }}>Cancelar</button>
              </div>
            )}

            {activeFilters.map(filter => {
              const def = FILTER_OPTIONS[filter.type];
              const Icon = def.icon;
              return (
                <div key={filter.id} className="rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                  <div className="flex items-center gap-2 p-3 border-b" style={{ borderColor: T.border }}>
                    <Icon size={14} style={{ color: T.primary }} />
                    <span className="font-bold text-sm flex-1">{def.label}</span>
                    <button onClick={() => removeFilter(filter.id)}>
                      <X size={14} style={{ color: T.textSub }} />
                    </button>
                  </div>
                  <div className="p-3 flex flex-wrap gap-2">
                    {def.options.map(opt => {
                      const sel = filter.selected.includes(opt);
                      return (
                        <button key={opt} onClick={() => toggleOption(filter.id, opt)}
                          className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                          style={{ background: sel ? T.primary + "20" : T.panel, color: sel ? T.primary : T.textSub, border: `1px solid ${sel ? T.primary + "40" : T.border}` }}>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {activeFilters.length === 0 && !addingFilter && (
              <div className="text-center py-8 rounded-2xl border border-dashed" style={{ borderColor: T.border, color: T.textSub }}>
                <Target size={28} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Adicione filtros para definir seu segmento</p>
              </div>
            )}
          </div>

          <button onClick={saveSegment} disabled={!newName || saved}
            className="w-full py-3.5 rounded-xl font-black flex items-center justify-center gap-2 disabled:opacity-40"
            style={{ background: saved ? T.success : `linear-gradient(135deg, ${T.primary}, ${T.accent})`, color: "#fff" }}>
            {saved ? <><Check size={16} /> Segmento salvo!</> : <><Save size={16} /> Salvar segmento</>}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5"><ArrowLeft size={18} style={{ color: T.textSub }} /></button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.accent + "20" }}>
              <Target size={18} style={{ color: T.accent }} />
            </div>
            <div>
              <h1 className="font-black text-lg">Segmentos de Audiência</h1>
              <p className="text-xs" style={{ color: T.textSub }}>{segments.length} segmentos · CPM premium +até 65%</p>
            </div>
          </div>
          <button onClick={startNew}
            className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold"
            style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`, color: "#fff" }}>
            <Plus size={14} /> Novo segmento
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6 space-y-5">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Segmentos criados", value: String(segments.length), color: T.primary },
            { label: "Maior alcance",     value: "142K/mês",              color: T.success },
            { label: "CPM máximo",        value: "R$65",                  color: T.gold    },
          ].map((k, i) => (
            <div key={i} className="p-3.5 rounded-xl border text-center" style={{ background: T.card, borderColor: T.border }}>
              <div className="font-black text-2xl" style={{ color: k.color }}>{k.value}</div>
              <div className="text-xs mt-0.5" style={{ color: T.textSub }}>{k.label}</div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          {segments.map(seg => (
            <div key={seg.id} className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="font-bold">{seg.name}</div>
                  <div className="text-xs" style={{ color: T.textSub }}>{seg.description}</div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="text-right">
                    <div className="font-black text-sm" style={{ color: T.primary }}>{(seg.estimatedReach / 1000).toFixed(0)}K</div>
                    <div className="text-xs" style={{ color: T.textSub }}>alcance</div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-sm" style={{ color: T.gold }}>R${seg.cpmPremium}</div>
                    <div className="text-xs" style={{ color: T.textSub }}>CPM</div>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {seg.filters.flatMap(f => f.selected.map(s => (
                  <span key={`${f.id}-${s}`} className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: T.primary + "15", color: T.primary }}>
                    {s}
                  </span>
                )))}
              </div>
              <div className="flex gap-2 mt-3">
                <button className="flex-1 py-2 rounded-xl text-xs font-bold"
                  style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`, color: "#fff" }}>
                  Usar em campanha
                </button>
                <button className="px-4 py-2 rounded-xl text-xs font-medium"
                  style={{ background: T.panel, color: T.textSub, border: `1px solid ${T.border}` }}>
                  Editar
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 rounded-2xl border" style={{ background: T.accent + "08", borderColor: T.accent + "25" }}>
          <div className="font-bold text-sm mb-2">💡 Como funciona o CPM premium</div>
          <p className="text-sm" style={{ color: T.textSub }}>
            Segmentos bem definidos permitem cobrar CPM até <strong className="text-white">65% maior</strong> dos anunciantes. Quanto mais específico o segmento, maior o valor percebido e o preço de venda.
          </p>
        </div>
      </div>
    </div>
  );
}
