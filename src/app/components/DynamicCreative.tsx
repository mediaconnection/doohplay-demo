import { useState } from "react";
import {
  ArrowLeft, Layers, Sun, Moon, CloudRain, Thermometer, Users,
  Clock, Play, Pause, Eye, Sliders, Zap, Plus, Trash2,
  Monitor, ChevronRight, CheckCircle, RefreshCw
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

interface Props { onBack: () => void; onNavigate?: (v: string) => void; }

type TabId = "templates" | "rules" | "preview";
type TriggerType = "weather" | "time" | "audience" | "temperature";

interface Variant { id: string; label: string; condition: string; ctr: number; active: boolean; }
interface Template {
  id: string; name: string; campaign: string; triggerType: TriggerType;
  variantCount: number; impressions: number; avgCtr: number; status: "active" | "paused" | "draft";
  variants: Variant[];
}

const TEMPLATES: Template[] = [
  {
    id: "DC001", name: "Ambev Bebidas Dinâmico", campaign: "Ambev Verão", triggerType: "weather",
    variantCount: 4, impressions: 284000, avgCtr: 4.8, status: "active",
    variants: [
      { id: "v1", label: "Ensolarado",   condition: "Clima: Ensolarado, temp > 28°C", ctr: 5.8, active: true  },
      { id: "v2", label: "Chuvoso",      condition: "Clima: Chuva, qualquer temp",    ctr: 3.2, active: true  },
      { id: "v3", label: "Nublado",      condition: "Clima: Nublado, 18–27°C",        ctr: 4.1, active: true  },
      { id: "v4", label: "Frio",         condition: "Temperatura < 18°C",             ctr: 2.9, active: false },
    ]
  },
  {
    id: "DC002", name: "iFood Almoço/Jantar", campaign: "iFood Delivery", triggerType: "time",
    variantCount: 3, impressions: 142000, avgCtr: 6.2, status: "active",
    variants: [
      { id: "v5", label: "Manhã",   condition: "Horário: 07h–10h59",   ctr: 3.8, active: true },
      { id: "v6", label: "Almoço",  condition: "Horário: 11h–14h59",   ctr: 8.1, active: true },
      { id: "v7", label: "Jantar",  condition: "Horário: 18h–21h59",   ctr: 7.4, active: true },
    ]
  },
  {
    id: "DC003", name: "Bradesco Perfil Executivo", campaign: "Bradesco Q3", triggerType: "audience",
    variantCount: 2, impressions: 98000, avgCtr: 3.4, status: "paused",
    variants: [
      { id: "v8", label: "Executivo",  condition: "Audiência: 35–55, renda A/B",    ctr: 4.2, active: false },
      { id: "v9", label: "Geral",      condition: "Audiência: demais perfis",       ctr: 2.8, active: false },
    ]
  },
];

const TRIGGER_META: Record<TriggerType, { label: string; icon: any; color: string }> = {
  weather:     { label: "Clima",        icon: CloudRain,   color: T.primary  },
  time:        { label: "Horário",      icon: Clock,       color: T.success  },
  audience:    { label: "Audiência",    icon: Users,       color: T.accent   },
  temperature: { label: "Temperatura",  icon: Thermometer, color: T.warning  },
};

const STATUS_META = {
  active: { label: "Ativo",     color: T.success },
  paused: { label: "Pausado",   color: T.warning },
  draft:  { label: "Rascunho",  color: T.textSub },
};

const CTR_BY_TRIGGER = [
  { name: "Clima",       ctr: 4.8 }, { name: "Horário",     ctr: 6.2 },
  { name: "Audiência",   ctr: 3.4 }, { name: "Temperatura", ctr: 4.0 },
];

const VARIANT_SHARE = [
  { name: "Ensolarado", value: 38, color: T.gold    }, { name: "Chuvoso",    value: 18, color: T.primary },
  { name: "Nublado",    value: 29, color: T.accent  }, { name: "Frio",       value: 15, color: T.textSub },
];

const RULE_VARS = ["Clima", "Temperatura (°C)", "Hora do dia", "Dia da semana", "Público-alvo", "Localização"];
const RULE_OPS  = ["igual a", "maior que", "menor que", "entre", "contém"];

export default function DynamicCreative({ onBack }: Props) {
  const [tab, setTab]        = useState<TabId>("templates");
  const [expanded, setExpanded] = useState<string | null>("DC001");
  const [previewTemp, setPreviewTemp] = useState<TriggerType>("weather");
  const [rules, setRules]    = useState([
    { id: "r1", variable: "Clima", op: "igual a", value: "Ensolarado" },
    { id: "r2", variable: "Temperatura (°C)", op: "maior que", value: "28" },
  ]);

  const addRule = () => setRules(prev => [...prev, { id: `r${Date.now()}`, variable: "Clima", op: "igual a", value: "" }]);
  const removeRule = (id: string) => setRules(prev => prev.filter(r => r.id !== id));

  const activeTemplates = TEMPLATES.filter(t => t.status === "active").length;
  const totalImpressions = TEMPLATES.reduce((s, t) => s + t.impressions, 0);
  const avgCtr = (TEMPLATES.reduce((s, t) => s + t.avgCtr, 0) / TEMPLATES.length).toFixed(1);

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5"><ArrowLeft size={18} style={{ color: T.textSub }} /></button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.accent + "20" }}>
                <Layers size={18} style={{ color: T.accent }} />
              </div>
              <div>
                <h1 className="font-black text-lg">Dynamic Creative</h1>
                <p className="text-xs" style={{ color: T.textSub }}>Personalização dinâmica de criativos por clima, horário e audiência</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {(["templates","rules","preview"] as TabId[]).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
                style={{ background: tab === t ? T.accent + "20" : "transparent", color: tab === t ? T.accent : T.textSub, border: `1px solid ${tab === t ? T.accent + "30" : "transparent"}` }}>
                {t === "templates" ? "Templates" : t === "rules" ? "Regras" : "Preview"}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Templates Ativos",   value: activeTemplates,                              color: T.success },
            { label: "Variantes Totais",   value: TEMPLATES.reduce((s, t) => s + t.variantCount, 0), color: T.accent },
            { label: "Impressões (30d)",   value: `${(totalImpressions/1000).toFixed(0)}k`,    color: T.primary },
            { label: "CTR Médio",          value: `${avgCtr}%`,                                color: T.gold    },
          ].map((k, i) => (
            <div key={i} className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <div className="font-black text-2xl" style={{ color: k.color }}>{k.value}</div>
              <div className="text-xs mt-0.5" style={{ color: T.textSub }}>{k.label}</div>
            </div>
          ))}
        </div>
        {tab === "templates" && (
          <div className="flex gap-6">
            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-black">Templates Dinâmicos</h2>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black" style={{ background: T.accent, color: "#fff" }}>
                  <Plus size={14} /> Novo Template
                </button>
              </div>
              {TEMPLATES.map(tpl => {
                const tm = TRIGGER_META[tpl.triggerType];
                const sm = STATUS_META[tpl.status];
                const TrigIcon = tm.icon;
                const isOpen = expanded === tpl.id;
                return (
                  <div key={tpl.id} className="rounded-2xl border overflow-hidden" style={{ background: T.card, borderColor: isOpen ? T.accent + "40" : T.border }}>
                    <div className="p-4 cursor-pointer flex items-start gap-4 hover:bg-white/2" onClick={() => setExpanded(isOpen ? null : tpl.id)}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: tm.color + "20" }}>
                        <TrigIcon size={18} style={{ color: tm.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black">{tpl.name}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: sm.color + "20", color: sm.color }}>{sm.label}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: tm.color + "20", color: tm.color }}>{tm.label}</span>
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: T.textSub }}>{tpl.campaign} · {tpl.variantCount} variantes</div>
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0">
                        <div className="text-right">
                          <div className="font-black" style={{ color: T.success }}>{tpl.avgCtr}%</div>
                          <div className="text-xs" style={{ color: T.textSub }}>CTR médio</div>
                        </div>
                        <div className="text-right">
                          <div className="font-black">{(tpl.impressions/1000).toFixed(0)}k</div>
                          <div className="text-xs" style={{ color: T.textSub }}>imp. 30d</div>
                        </div>
                        <button className="p-2 rounded-lg hover:bg-white/5">
                          {tpl.status === "active" ? <Pause size={14} style={{ color: T.warning }} /> : <Play size={14} style={{ color: T.success }} />}
                        </button>
                        <ChevronRight size={14} style={{ color: T.textSub, transform: isOpen ? "rotate(90deg)" : "none", transition: "transform 0.2s" }} />
                      </div>
                    </div>
                    {isOpen && (
                      <div className="border-t px-4 pb-4 pt-3" style={{ borderColor: T.border }}>
                        <div className="text-xs font-black mb-2" style={{ color: T.textSub }}>VARIANTES</div>
                        <div className="space-y-2">
                          {tpl.variants.map(v => (
                            <div key={v.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: T.panel, opacity: v.active ? 1 : 0.5 }}>
                              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: v.active ? T.success : T.textSub }} />
                              <div className="flex-1">
                                <div className="text-xs font-black">{v.label}</div>
                                <div className="text-xs" style={{ color: T.textSub }}>{v.condition}</div>
                              </div>
                              <div className="text-xs font-black" style={{ color: T.success }}>{v.ctr}% CTR</div>
                              <div className="flex items-center gap-1.5">
                                <button className="p-1.5 rounded-lg hover:bg-white/5"><Eye size={11} style={{ color: T.textSub }} /></button>
                                <button className="p-1.5 rounded-lg hover:bg-white/5"><Trash2 size={11} style={{ color: T.danger }} /></button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <button className="flex items-center gap-2 mt-3 text-xs font-bold" style={{ color: T.accent }}>
                          <Plus size={12} /> Adicionar Variante
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="w-52 flex-shrink-0 space-y-4">
              <div className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black text-sm mb-3">CTR por Trigger</h3>
                <ResponsiveContainer width="100%" height={140}>
                  <BarChart data={CTR_BY_TRIGGER} barSize={20}>
                    <XAxis dataKey="name" tick={{ fill: T.textSub, fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10 }} formatter={(v: number) => [`${v}%`, "CTR"]} />
                    <Bar key="bar-ctr-trigger" dataKey="ctr" radius={[6, 6, 0, 0]}>
                      {CTR_BY_TRIGGER.map((_, i) => (<Cell key={`cell-ct-${i}`} fill={[T.primary, T.success, T.accent, T.warning][i]} />))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black text-sm mb-3">Impressões por Variante</h3>
                <ResponsiveContainer width="100%" height={130}>
                  <PieChart>
                    <Pie key="pie-variant" data={VARIANT_SHARE} dataKey="value" cx="50%" cy="50%" innerRadius={32} outerRadius={52} paddingAngle={3}>
                      {VARIANT_SHARE.map((entry, i) => (<Cell key={`cell-vs-${i}`} fill={entry.color} />))}
                    </Pie>
                    <Tooltip contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10 }} formatter={(v: number) => [`${v}%`, "Share"]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1">
                  {VARIANT_SHARE.map((v, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full" style={{ background: v.color }} /><span style={{ color: T.textSub }}>{v.name}</span></div>
                      <span className="font-bold" style={{ color: v.color }}>{v.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        {tab === "rules" && (
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-black">Editor de Regras</h3>
                  <span className="text-xs" style={{ color: T.textSub }}>Lógica: E (AND)</span>
                </div>
                <div className="space-y-3">
                  {rules.map((rule, i) => (
                    <div key={rule.id} className="flex items-center gap-2">
                      {i > 0 && <span className="text-xs font-black w-6 text-center" style={{ color: T.accent }}>E</span>}
                      {i === 0 && <span className="text-xs font-black w-6 text-center" style={{ color: T.textSub }}>SE</span>}
                      <select value={rule.variable} onChange={e => setRules(prev => prev.map(r => r.id === rule.id ? { ...r, variable: e.target.value } : r))}
                        className="flex-1 px-2 py-2 rounded-xl text-xs" style={{ background: T.panel, border: `1px solid ${T.border}`, color: T.text }}>
                        {RULE_VARS.map(v => <option key={v} value={v}>{v}</option>)}
                      </select>
                      <select value={rule.op} onChange={e => setRules(prev => prev.map(r => r.id === rule.id ? { ...r, op: e.target.value } : r))}
                        className="w-28 px-2 py-2 rounded-xl text-xs" style={{ background: T.panel, border: `1px solid ${T.border}`, color: T.text }}>
                        {RULE_OPS.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                      <input type="text" value={rule.value} placeholder="Valor"
                        onChange={e => setRules(prev => prev.map(r => r.id === rule.id ? { ...r, value: e.target.value } : r))}
                        className="w-24 px-2 py-2 rounded-xl text-xs" style={{ background: T.panel, border: `1px solid ${T.border}`, color: T.text }} />
                      <button onClick={() => removeRule(rule.id)} className="p-1.5 rounded-lg hover:bg-white/5">
                        <Trash2 size={12} style={{ color: T.danger }} />
                      </button>
                    </div>
                  ))}
                </div>
                <button onClick={addRule} className="flex items-center gap-2 mt-4 text-xs font-bold" style={{ color: T.accent }}>
                  <Plus size={12} /> Adicionar Condição
                </button>
              </div>
            </div>
            <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-black mb-1">Lógica da Regra</h3>
              <p className="text-xs mb-4" style={{ color: T.textSub }}>Visualização textual das condições definidas</p>
              <div className="p-4 rounded-xl font-mono text-xs space-y-2" style={{ background: T.panel, color: T.text }}>
                <div><span style={{ color: T.accent }}>SE</span> <span style={{ color: T.success }}>Clima</span> <span style={{ color: T.textSub }}>igual a</span> <span style={{ color: T.gold }}>"Ensolarado"</span></div>
                <div><span style={{ color: T.accent }}>E</span> <span style={{ color: T.success }}>Temperatura (°C)</span> <span style={{ color: T.textSub }}>maior que</span> <span style={{ color: T.gold }}>"28"</span></div>
                <div className="border-t pt-2" style={{ borderColor: T.border }}>
                  <span style={{ color: T.primary }}>ENTÃO</span> <span>exibir variante</span> <span style={{ color: T.accent }}>"Ensolarado"</span>
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <button className="flex-1 py-3 rounded-xl text-sm font-black" style={{ background: T.success, color: "#000" }}>
                  <CheckCircle size={13} className="inline mr-2" />Salvar Regra
                </button>
                <button className="px-4 py-3 rounded-xl text-sm font-bold" style={{ background: T.panel, color: T.textSub, border: `1px solid ${T.border}` }}>
                  <RefreshCw size={13} className="inline mr-1" />Testar
                </button>
              </div>
            </div>
          </div>
        )}
        {tab === "preview" && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="text-sm font-black" style={{ color: T.textSub }}>Simular contexto:</span>
              {(Object.entries(TRIGGER_META) as [TriggerType, any][]).map(([key, meta]) => {
                const Icon = meta.icon;
                return (
                  <button key={key} onClick={() => setPreviewTemp(key)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all"
                    style={{ background: previewTemp === key ? meta.color + "20" : T.panel, color: previewTemp === key ? meta.color : T.textSub, border: `1px solid ${previewTemp === key ? meta.color + "40" : T.border}` }}>
                    <Icon size={13} />{meta.label}
                  </button>
                );
              })}
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black mb-4 text-sm">Preview — Av. Paulista 1000</h3>
                <div className="aspect-video rounded-xl flex items-center justify-center relative overflow-hidden"
                  style={{ background: previewTemp === "weather" ? `linear-gradient(135deg, ${T.warning}30, ${T.gold}20)` : previewTemp === "time" ? `linear-gradient(135deg, ${T.success}20, ${T.primary}20)` : previewTemp === "audience" ? `linear-gradient(135deg, ${T.accent}30, ${T.primary}20)` : `linear-gradient(135deg, ${T.primary}20, ${T.textSub}20)` }}>
                  <div className="text-center p-6">
                    {previewTemp === "weather" && (<><Sun size={48} style={{ color: T.gold }} className="mx-auto mb-3" /><div className="font-black text-2xl">Seu Verão</div><div className="font-black text-2xl" style={{ color: T.gold }}>mais gelado!</div><div className="text-sm mt-2" style={{ color: T.textSub }}>Variante: Ensolarado · 35°C</div></>)}
                    {previewTemp === "time" && (<><Clock size={48} style={{ color: T.success }} className="mx-auto mb-3" /><div className="font-black text-2xl">Hora do</div><div className="font-black text-2xl" style={{ color: T.success }}>Almoço!</div><div className="text-sm mt-2" style={{ color: T.textSub }}>Variante: Almoço · 12:34</div></>)}
                    {previewTemp === "audience" && (<><Users size={48} style={{ color: T.accent }} className="mx-auto mb-3" /><div className="font-black text-2xl">Soluções para</div><div className="font-black text-2xl" style={{ color: T.accent }}>Executivos</div><div className="text-sm mt-2" style={{ color: T.textSub }}>Variante: Executivo · Perfil A</div></>)}
                    {previewTemp === "temperature" && (<><Thermometer size={48} style={{ color: T.primary }} className="mx-auto mb-3" /><div className="font-black text-2xl">Se aquece</div><div className="font-black text-2xl" style={{ color: T.primary }}>com a gente!</div><div className="text-sm mt-2" style={{ color: T.textSub }}>Variante: Frio · 14°C</div></>)}
                  </div>
                  <div className="absolute bottom-3 right-3 text-xs font-black px-2 py-1 rounded-lg" style={{ background: T.success + "30", color: T.success }}>DYNAMIC</div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                  <h3 className="font-black mb-3 text-sm">Variante Ativa</h3>
                  <div className="space-y-2.5">
                    {[
                      { label: "Trigger",          value: TRIGGER_META[previewTemp].label,  color: TRIGGER_META[previewTemp].color },
                      { label: "Condição",         value: "Ativa e correspondendo",         color: T.success },
                      { label: "Template",         value: "Ambev Bebidas Dinâmico",         color: T.text    },
                      { label: "CTR esperado",     value: "5.8%",                           color: T.gold    },
                      { label: "Exibição restante",value: "14s",                            color: T.textSub },
                    ].map((m, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span style={{ color: T.textSub }}>{m.label}</span>
                        <span className="font-black" style={{ color: m.color }}>{m.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-4 rounded-2xl border flex items-center gap-3" style={{ background: T.success + "10", borderColor: T.success + "30" }}>
                  <Zap size={14} style={{ color: T.success }} />
                  <p className="text-xs" style={{ color: T.success }}>Variante ativa renderizada em <strong>48ms</strong>. Cache de criativos aquecido para <strong>4 cenários</strong>.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
