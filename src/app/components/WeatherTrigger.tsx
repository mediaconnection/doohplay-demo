import { useState } from "react";
import {
  ArrowLeft, CloudRain, Sun, Cloud, Wind, Thermometer, Droplets,
  Plus, Trash2, Play, Pause, Zap, CheckCircle, AlertTriangle,
  ToggleLeft, ToggleRight, Eye, ChevronDown, RefreshCw, MapPin
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

interface Props { onBack: () => void; onNavigate?: (v: string) => void; }

type WeatherCondition = "sunny" | "cloudy" | "rainy" | "stormy" | "hot" | "cold" | "windy" | "humid";
type TriggerStatus = "active" | "paused" | "triggered";

interface WeatherRule {
  id: string;
  name: string;
  condition: WeatherCondition;
  operator: ">=" | "<=" | "==" | "range";
  threshold: number;
  unit: string;
  campaign: string;
  screens: number;
  status: TriggerStatus;
  triggeredToday: number;
}

const CONDITION_META: Record<WeatherCondition, { icon: any; color: string; label: string }> = {
  sunny:  { icon: Sun,         color: T.gold,    label: "Ensolarado" },
  cloudy: { icon: Cloud,       color: T.textSub, label: "Nublado" },
  rainy:  { icon: CloudRain,   color: T.primary, label: "Chuva" },
  stormy: { icon: AlertTriangle,color: T.danger, label: "Tempestade" },
  hot:    { icon: Thermometer, color: T.warning, label: "Calor" },
  cold:   { icon: Thermometer, color: "#60AFFF", label: "Frio" },
  windy:  { icon: Wind,        color: T.accent,  label: "Vento" },
  humid:  { icon: Droplets,    color: T.success, label: "Umidade alta" },
};

const RULES: WeatherRule[] = [
  { id: "R1", name: "Bebidas geladas no calor",   condition: "hot",    operator: ">=", threshold: 30, unit: "°C",  campaign: "Ambev Verão",      screens: 24, status: "triggered", triggeredToday: 12 },
  { id: "R2", name: "Guarda-chuvas na chuva",     condition: "rainy",  operator: ">=", threshold: 5,  unit: "mm",  campaign: "Carrefour Jul",    screens: 18, status: "active",    triggeredToday: 3  },
  { id: "R3", name: "Casacos no frio",             condition: "cold",   operator: "<=", threshold: 15, unit: "°C",  campaign: "Renner Inverno",   screens: 31, status: "active",    triggeredToday: 0  },
  { id: "R4", name: "Protetor solar ensolarado",  condition: "sunny",  operator: "==", threshold: 1,  unit: "idx", campaign: "Nivea UV",         screens: 15, status: "triggered", triggeredToday: 18 },
  { id: "R5", name: "Delivery nos ventos fortes", condition: "windy",  operator: ">=", threshold: 40, unit: "km/h",campaign: "iFood OOH Jul",    screens: 9,  status: "paused",    triggeredToday: 0  },
  { id: "R6", name: "Ar-condicionado no calor",   condition: "hot",    operator: ">=", threshold: 32, unit: "°C",  campaign: "Philco A/C",       screens: 22, status: "active",    triggeredToday: 7  },
];

const CURRENT_WEATHER = [
  { city: "São Paulo",     temp: 34, rain: 0,   wind: 18, humidity: 62, icon: Sun,       cond: "Ensolarado",  color: T.gold    },
  { city: "Rio de Janeiro",temp: 37, rain: 0,   wind: 22, humidity: 71, icon: Sun,       cond: "Ensolarado",  color: T.gold    },
  { city: "Brasília",      temp: 28, rain: 4,   wind: 30, humidity: 55, icon: CloudRain, cond: "Chuva fraca", color: T.primary },
  { city: "Curitiba",      temp: 14, rain: 12,  wind: 45, humidity: 88, icon: CloudRain, cond: "Chuva forte", color: T.primary },
  { city: "Salvador",      temp: 31, rain: 0,   wind: 15, humidity: 79, icon: Cloud,     cond: "Nublado",     color: T.textSub },
  { city: "Recife",        temp: 33, rain: 0,   wind: 20, humidity: 76, icon: Sun,       cond: "Ensolarado",  color: T.gold    },
];

const TRIGGER_HISTORY = Array.from({ length: 7 }, (_, i) => ({
  day: ["Qui","Sex","Sáb","Dom","Seg","Ter","Qua"][i],
  triggers: [8, 14, 22, 6, 18, 31, 24][i],
  impressions: [8, 14, 22, 6, 18, 31, 24][i] * 1200,
}));

export default function WeatherTrigger({ onBack, onNavigate }: Props) {
  const [tab, setTab]           = useState<"rules" | "live" | "history">("rules");
  const [rules, setRules]       = useState<WeatherRule[]>(RULES);
  const [showNew, setShowNew]   = useState(false);
  const [newName, setNewName]   = useState("");
  const [newCondition, setNewCondition] = useState<WeatherCondition>("hot");
  const [newThreshold, setNewThreshold] = useState("30");

  function toggleRule(id: string) {
    setRules(r => r.map(rule => rule.id !== id ? rule : {
      ...rule,
      status: rule.status === "active" ? "paused" : "active",
    }));
  }

  function deleteRule(id: string) {
    setRules(r => r.filter(rule => rule.id !== id));
  }

  function addRule() {
    if (!newName) return;
    const meta = CONDITION_META[newCondition];
    const newRule: WeatherRule = {
      id: `R${Date.now()}`, name: newName, condition: newCondition,
      operator: ">=", threshold: parseFloat(newThreshold) || 30, unit: "°C",
      campaign: "—", screens: 0, status: "active", triggeredToday: 0,
    };
    setRules(r => [newRule, ...r]);
    setShowNew(false);
    setNewName("");
  }

  const activeCount   = rules.filter(r => r.status !== "paused").length;
  const triggeredToday = rules.reduce((s, r) => s + r.triggeredToday, 0);
  const totalScreens  = rules.filter(r => r.status !== "paused").reduce((s, r) => s + r.screens, 0);

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
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.warning + "20" }}>
                <CloudRain size={18} style={{ color: T.warning }} />
              </div>
              <div>
                <h1 className="font-black text-lg">Weather Trigger</h1>
                <p className="text-xs" style={{ color: T.textSub }}>Veiculação contextual por clima em tempo real</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {(["rules","live","history"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
                style={{ background: tab === t ? T.warning + "20" : "transparent", color: tab === t ? T.warning : T.textSub, border: `1px solid ${tab === t ? T.warning + "30" : "transparent"}` }}>
                {t === "rules" ? "Regras" : t === "live" ? "Ao Vivo" : "Histórico"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Regras Ativas",       value: activeCount,      color: T.success, icon: CheckCircle },
            { label: "Triggers Hoje",        value: triggeredToday,   color: T.warning, icon: Zap },
            { label: "Telas Afetadas",       value: totalScreens,     color: T.primary, icon: Eye },
            { label: "Cidades Monitoradas",  value: 6,                color: T.accent,  icon: MapPin },
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

        {/* RULES TAB */}
        {tab === "rules" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-black">Regras de Veiculação</h2>
              <button onClick={() => setShowNew(!showNew)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black"
                style={{ background: T.warning, color: "#000" }}>
                <Plus size={14} /> Nova Regra
              </button>
            </div>

            {showNew && (
              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.warning + "40" }}>
                <h3 className="font-black mb-4 text-sm">Criar Nova Regra</h3>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="text-xs font-bold mb-1.5 block" style={{ color: T.textSub }}>NOME DA REGRA</label>
                    <input value={newName} onChange={e => setNewName(e.target.value)}
                      placeholder="Ex: Sorvetes no calor"
                      className="w-full px-3 py-2.5 rounded-xl text-sm"
                      style={{ background: T.panel, border: `1px solid ${T.border}`, color: T.text }} />
                  </div>
                  <div>
                    <label className="text-xs font-bold mb-1.5 block" style={{ color: T.textSub }}>CONDIÇÃO</label>
                    <select value={newCondition} onChange={e => setNewCondition(e.target.value as WeatherCondition)}
                      className="w-full px-3 py-2.5 rounded-xl text-sm"
                      style={{ background: T.panel, border: `1px solid ${T.border}`, color: T.text }}>
                      {(Object.entries(CONDITION_META) as [WeatherCondition, any][]).map(([key, meta]) => (
                        <option key={key} value={key}>{meta.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold mb-1.5 block" style={{ color: T.textSub }}>LIMIAR</label>
                    <input value={newThreshold} onChange={e => setNewThreshold(e.target.value)}
                      type="number"
                      className="w-full px-3 py-2.5 rounded-xl text-sm"
                      style={{ background: T.panel, border: `1px solid ${T.border}`, color: T.text }} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={addRule} className="px-5 py-2 rounded-xl text-sm font-black" style={{ background: T.warning, color: "#000" }}>Criar</button>
                  <button onClick={() => setShowNew(false)} className="px-5 py-2 rounded-xl text-sm font-bold" style={{ background: T.border, color: T.textSub }}>Cancelar</button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {rules.map(rule => {
                const meta = CONDITION_META[rule.condition];
                const Icon = meta.icon;
                return (
                  <div key={rule.id} className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: rule.status === "triggered" ? meta.color + "40" : T.border }}>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: meta.color + "20" }}>
                        <Icon size={18} style={{ color: meta.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-black">{rule.name}</span>
                          {rule.status === "triggered" && (
                            <span className="flex items-center gap-1 text-xs font-black px-2 py-0.5 rounded-full" style={{ background: T.success + "20", color: T.success }}>
                              <Zap size={10} /> ATIVO AGORA
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-xs" style={{ color: T.textSub }}>
                          <span>{meta.label} {rule.operator} {rule.threshold}{rule.unit}</span>
                          <span>·</span>
                          <span>{rule.campaign}</span>
                          <span>·</span>
                          <span>{rule.screens} telas</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {rule.triggeredToday > 0 && (
                          <div className="text-right">
                            <div className="font-black text-sm" style={{ color: meta.color }}>{rule.triggeredToday}</div>
                            <div className="text-xs" style={{ color: T.textSub }}>hoje</div>
                          </div>
                        )}
                        <button onClick={() => toggleRule(rule.id)} className="p-2 rounded-lg hover:bg-white/5">
                          {rule.status === "paused"
                            ? <Play size={15} style={{ color: T.success }} />
                            : <Pause size={15} style={{ color: T.warning }} />}
                        </button>
                        <button onClick={() => deleteRule(rule.id)} className="p-2 rounded-lg hover:bg-white/5">
                          <Trash2 size={15} style={{ color: T.danger }} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* LIVE TAB */}
        {tab === "live" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-black">Clima Atual — Principais Praças</h2>
              <div className="flex items-center gap-2 text-xs" style={{ color: T.success }}>
                <RefreshCw size={11} className="animate-spin" />
                Atualizado há 2 min
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {CURRENT_WEATHER.map((cw, i) => {
                const Icon = cw.icon;
                const triggered = rules.filter(r => r.status === "triggered" && r.screens > 0);
                return (
                  <div key={i} className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-black">{cw.city}</div>
                        <div className="text-xs" style={{ color: T.textSub }}>{cw.cond}</div>
                      </div>
                      <Icon size={28} style={{ color: cw.color }} />
                    </div>
                    <div className="font-black text-3xl mb-3" style={{ color: cw.color }}>{cw.temp}°C</div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center p-2 rounded-xl" style={{ background: T.panel }}>
                        <CloudRain size={11} className="mx-auto mb-0.5" style={{ color: T.primary }} />
                        <div className="font-bold">{cw.rain}mm</div>
                      </div>
                      <div className="text-center p-2 rounded-xl" style={{ background: T.panel }}>
                        <Wind size={11} className="mx-auto mb-0.5" style={{ color: T.textSub }} />
                        <div className="font-bold">{cw.wind}km/h</div>
                      </div>
                      <div className="text-center p-2 rounded-xl" style={{ background: T.panel }}>
                        <Droplets size={11} className="mx-auto mb-0.5" style={{ color: T.accent }} />
                        <div className="font-bold">{cw.humidity}%</div>
                      </div>
                    </div>
                    {i === 0 && (
                      <div className="mt-3 pt-3 border-t" style={{ borderColor: T.border }}>
                        <div className="text-xs font-bold" style={{ color: T.success }}>
                          2 regras disparadas agora
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-black mb-4">Regras disparadas agora</h3>
              <div className="space-y-2">
                {rules.filter(r => r.status === "triggered").map(rule => {
                  const meta = CONDITION_META[rule.condition];
                  const Icon = meta.icon;
                  return (
                    <div key={rule.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: T.panel }}>
                      <Icon size={16} style={{ color: meta.color }} />
                      <div className="flex-1">
                        <span className="text-sm font-bold">{rule.name}</span>
                        <span className="text-xs ml-2" style={{ color: T.textSub }}>{rule.campaign} · {rule.screens} telas</span>
                      </div>
                      <span className="flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-full" style={{ background: T.success + "20", color: T.success }}>
                        <Zap size={10} /> ON
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* HISTORY TAB */}
        {tab === "history" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black mb-1">Triggers por Dia — 7 dias</h3>
                <p className="text-xs mb-4" style={{ color: T.textSub }}>Número de ativações por condição climática</p>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={TRIGGER_HISTORY} barSize={20}>
                    <XAxis dataKey="day" tick={{ fill: T.textSub, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10 }}
                      formatter={(v: number) => [v, "Triggers"]} />
                    {TRIGGER_HISTORY.map((_, i) => (
                      <Cell key={`cell-${i}`} fill={T.warning} />
                    ))}
                    <Bar dataKey="triggers" radius={[6, 6, 0, 0]}>
                      {TRIGGER_HISTORY.map((_, i) => (
                        <Cell key={`cell-bar-${i}`} fill={T.warning + "CC"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black mb-4">Performance por Condição</h3>
                <div className="space-y-3">
                  {[
                    { label: "Calor (≥30°C)",    triggers: 42, impressions: "50.4k", color: T.warning },
                    { label: "Ensolarado",        triggers: 24, impressions: "28.8k", color: T.gold    },
                    { label: "Chuva (≥5mm)",     triggers: 18, impressions: "21.6k", color: T.primary },
                    { label: "Frio (≤15°C)",     triggers: 8,  impressions: "9.6k",  color: "#60AFFF" },
                    { label: "Vento (≥40km/h)",  triggers: 5,  impressions: "6.0k",  color: T.accent  },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl" style={{ background: T.panel }}>
                      <span className="text-sm font-bold" style={{ color: s.color }}>{s.label}</span>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-black text-sm">{s.triggers}</div>
                          <div className="text-xs" style={{ color: T.textSub }}>triggers</div>
                        </div>
                        <div className="text-right">
                          <div className="font-black text-sm" style={{ color: s.color }}>{s.impressions}</div>
                          <div className="text-xs" style={{ color: T.textSub }}>impressões</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
