import { useState } from "react";
import {
  ArrowLeft, Link2, TrendingUp, Eye, Smartphone, Globe, ShoppingCart,
  MapPin, Clock, Zap, ChevronRight, BarChart2, Filter,
  CheckCircle, AlertTriangle, Download, RefreshCw
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, FunnelChart, Funnel, LabelList,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, CartesianGrid
} from "recharts";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

interface Props { onBack: () => void; onNavigate?: (v: string) => void; }
type TabId = "overview" | "journeys" | "models";

const CONVERSION_TREND = [
  { d: "Qui", dooh: 48,  digital: 124, store: 31 },
  { d: "Sex", dooh: 62,  digital: 158, store: 44 },
  { d: "Sáb", dooh: 91,  digital: 213, store: 78 },
  { d: "Dom", dooh: 83,  digital: 196, store: 62 },
  { d: "Seg", dooh: 54,  digital: 138, store: 28 },
  { d: "Ter", dooh: 67,  digital: 162, store: 35 },
  { d: "Qua", dooh: 71,  digital: 178, store: 41 },
];

const CHANNEL_ATTR = [
  { channel: "DOOH Direto",      value: 18, color: T.primary  },
  { channel: "DOOH → App",       value: 29, color: T.accent   },
  { channel: "DOOH → Web",       value: 24, color: T.success  },
  { channel: "DOOH → Loja",      value: 15, color: T.gold     },
  { channel: "DOOH → Social",    value: 9,  color: T.warning  },
  { channel: "Assistido",        value: 5,  color: T.textSub  },
];

interface Journey {
  id: string;
  user: string;
  screens: string[];
  channels: string[];
  converted: boolean;
  convValue: number;
  timeSinceExp: string;
  convType: "app_install" | "purchase" | "store_visit" | "form_fill";
}

const JOURNEYS: Journey[] = [
  { id: "JRN001", user: "Usuário #7824A", screens: ["Av. Paulista 1000","Shopping Ibirapuera"], channels: ["DOOH","Google Search","App"], converted: true,  convValue: 349, timeSinceExp: "4h12m",  convType: "purchase"     },
  { id: "JRN002", user: "Usuário #3312F", screens: ["Metrô Paulista"],                          channels: ["DOOH","Instagram"],          converted: true,  convValue: 0,   timeSinceExp: "1h55m",  convType: "app_install"  },
  { id: "JRN003", user: "Usuário #9901B", screens: ["Aeroporto GRU T2","Av. Paulista"],         channels: ["DOOH","Email","Web"],         converted: true,  convValue: 1840,timeSinceExp: "2d",     convType: "purchase"     },
  { id: "JRN004", user: "Usuário #5543C", screens: ["Shopping Boa Viagem"],                     channels: ["DOOH","Facebook","Loja"],     converted: true,  convValue: 0,   timeSinceExp: "3h22m",  convType: "store_visit"  },
  { id: "JRN005", user: "Usuário #1128D", screens: ["Rodoviária Tietê"],                        channels: ["DOOH","WhatsApp"],            converted: false, convValue: 0,   timeSinceExp: "8h",     convType: "form_fill"    },
];

const CONV_TYPE_META = {
  app_install: { label: "App Install",   color: T.primary },
  purchase:    { label: "Compra",        color: T.gold    },
  store_visit: { label: "Visita Loja",   color: T.success },
  form_fill:   { label: "Form Lead",     color: T.accent  },
};

const MODEL_COMPARE = [
  { model: "Last Touch",   dooh: 12, digital: 68, other: 20 },
  { model: "First Touch",  dooh: 34, digital: 48, other: 18 },
  { model: "Linear",       dooh: 22, digital: 56, other: 22 },
  { model: "Time Decay",   dooh: 18, digital: 61, other: 21 },
  { model: "Data-Driven",  dooh: 28, digital: 54, other: 18 },
];

const LOOKBACK_ROI = [
  { window: "1h",  roi: 1.2 }, { window: "6h",  roi: 2.1 }, { window: "24h", roi: 3.4 },
  { window: "3d",  roi: 4.1 }, { window: "7d",  roi: 4.8 }, { window: "14d", roi: 5.0 },
  { window: "30d", roi: 4.6 },
];

export default function AttributionEngine({ onBack }: Props) {
  const [tab, setTab] = useState<TabId>("overview");
  const [lookback, setLookback] = useState("7d");
  const [model, setModel] = useState("Data-Driven");

  const totalConvs     = JOURNEYS.filter(j => j.converted).length;
  const totalRevenue   = JOURNEYS.reduce((s, j) => s + j.convValue, 0);
  const avgTimeToConv  = "3h 41m";
  const doohRoi        = "4.8x";

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5">
              <ArrowLeft size={18} style={{ color: T.textSub }} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.accent + "20" }}>
                <Link2 size={18} style={{ color: T.accent }} />
              </div>
              <div>
                <h1 className="font-black text-lg">Attribution Engine</h1>
                <p className="text-xs" style={{ color: T.textSub }}>Atribuição de conversões offline e online a exposições DOOH — multi-touch</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {(["overview","journeys","models"] as TabId[]).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
                style={{ background: tab === t ? T.accent + "20" : "transparent", color: tab === t ? T.accent : T.textSub, border: `1px solid ${tab === t ? T.accent + "30" : "transparent"}` }}>
                {t === "overview" ? "Overview" : t === "journeys" ? "Jornadas" : "Modelos"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Conversões (7d)",      value: totalConvs,                             color: T.success, icon: CheckCircle },
            { label: "Receita Atribuída",     value: `R$${(totalRevenue/1000).toFixed(1)}k`,color: T.gold,    icon: TrendingUp  },
            { label: "Tempo médio p/ conv.",  value: avgTimeToConv,                          color: T.primary, icon: Clock       },
            { label: "ROI DOOH",             value: doohRoi,                                color: T.accent,  icon: Zap         },
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

        {tab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black mb-4">Conversões por Canal (7 dias)</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={CONVERSION_TREND}>
                    <defs>
                      <linearGradient key="grad-dooh" id="grad-dooh" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={T.primary} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={T.primary} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient key="grad-digital" id="grad-digital" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={T.success} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={T.success} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient key="grad-store" id="grad-store" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={T.gold} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={T.gold} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="d" tick={{ fill: T.textSub, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10 }} />
                    <Area key="area-dooh"    type="monotone" dataKey="dooh"    stroke={T.primary} strokeWidth={2} fill="url(#grad-dooh)"    />
                    <Area key="area-digital" type="monotone" dataKey="digital" stroke={T.success} strokeWidth={2} fill="url(#grad-digital)" />
                    <Area key="area-store"   type="monotone" dataKey="store"   stroke={T.gold}    strokeWidth={2} fill="url(#grad-store)"   />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="flex items-center gap-4 mt-2 text-xs">
                  {[{ label: "DOOH Assistido", color: T.primary }, { label: "Digital", color: T.success }, { label: "Loja", color: T.gold }].map((l, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />
                      <span style={{ color: T.textSub }}>{l.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black mb-4">Atribuição por Canal (%)</h3>
                <div className="space-y-2.5">
                  {CHANNEL_ATTR.map((ch, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span>{ch.channel}</span>
                        <span className="font-black" style={{ color: ch.color }}>{ch.value}%</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: T.border }}>
                        <div className="h-full rounded-full transition-all"
                          style={{ width: `${ch.value}%`, background: ch.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Janela de Lookback",    value: "7 dias",       sub: "DOOH → conversão",     color: T.primary },
                { label: "Atribuição por Pixel",  value: "84.2%",        sub: "dos cliques rastreados",color: T.success },
                { label: "Lift incremental DOOH", value: "+38%",         sub: "vs. controle sem DOOH", color: T.gold    },
              ].map((m, i) => (
                <div key={i} className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                  <div className="font-black text-xl" style={{ color: m.color }}>{m.value}</div>
                  <div className="text-xs mt-0.5" style={{ color: T.textSub }}>{m.label}</div>
                  <div className="text-xs mt-1.5 font-bold" style={{ color: m.color }}>{m.sub}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "journeys" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-black">Jornadas de Conversão</h2>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                  style={{ background: T.panel, color: T.textSub, border: `1px solid ${T.border}` }}>
                  <RefreshCw size={11} /> Atualizar
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                  style={{ background: T.panel, color: T.textSub, border: `1px solid ${T.border}` }}>
                  <Download size={11} /> Exportar
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {JOURNEYS.map(j => {
                const ctm = CONV_TYPE_META[j.convType];
                return (
                  <div key={j.id} className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: j.converted ? T.success + "20" : T.textSub + "20" }}>
                        {j.converted ? <CheckCircle size={14} style={{ color: T.success }} /> : <AlertTriangle size={14} style={{ color: T.textSub }} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-black text-sm">{j.user}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                            style={{ background: ctm.color + "20", color: ctm.color }}>{ctm.label}</span>
                          {j.convValue > 0 && (
                            <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                              style={{ background: T.gold + "20", color: T.gold }}>R${j.convValue.toLocaleString("pt-BR")}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {j.screens.map((sc, i) => (
                            <span key={i} className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg"
                              style={{ background: T.primary + "20", color: T.primary }}>
                              <Eye size={10} /> {sc}
                            </span>
                          ))}
                          <ChevronRight size={12} style={{ color: T.textSub }} />
                          {j.channels.slice(1).map((ch, i) => (
                            <span key={i} className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg"
                              style={{ background: T.accent + "20", color: T.accent }}>
                              {ch}
                            </span>
                          ))}
                          {j.converted && (
                            <>
                              <ChevronRight size={12} style={{ color: T.textSub }} />
                              <span className="text-xs px-2 py-1 rounded-lg font-bold"
                                style={{ background: T.success + "20", color: T.success }}>Conversão</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-black text-sm" style={{ color: T.textSub }}>{j.timeSinceExp}</div>
                        <div className="text-xs" style={{ color: T.textSub }}>após exp. DOOH</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === "models" && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="text-sm font-black" style={{ color: T.textSub }}>Modelo ativo:</span>
              {MODEL_COMPARE.map(m => (
                <button key={m.model} onClick={() => setModel(m.model)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold"
                  style={{ background: model === m.model ? T.accent + "20" : T.panel, color: model === m.model ? T.accent : T.textSub, border: `1px solid ${model === m.model ? T.accent + "40" : T.border}` }}>
                  {m.model}
                </button>
              ))}
            </div>

            <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-black mb-4">Comparativo de Modelos — Crédito ao DOOH (%)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={MODEL_COMPARE} barSize={30} layout="vertical">
                  <XAxis type="number" hide domain={[0, 100]} />
                  <YAxis type="category" dataKey="model" tick={{ fill: T.textSub, fontSize: 11 }} axisLine={false} tickLine={false} width={90} />
                  <Tooltip contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10 }} />
                  <Bar key="bar-dooh-attr" dataKey="dooh" name="DOOH" stackId="a" radius={[0, 0, 0, 0]}>
                    {MODEL_COMPARE.map((entry, i) => (
                      <Cell key={`cell-ma-${i}`} fill={entry.model === model ? T.accent : T.primary} />
                    ))}
                  </Bar>
                  <Bar key="bar-digital-attr" dataKey="digital" name="Digital" stackId="a" fill={T.textSub + "60"} />
                  <Bar key="bar-other-attr" dataKey="other" name="Outros" stackId="a" fill={T.border} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black mb-4 text-sm">ROI por Janela de Lookback</h3>
                <ResponsiveContainer width="100%" height={170}>
                  <LineChart data={LOOKBACK_ROI}>
                    <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
                    <XAxis dataKey="window" tick={{ fill: T.textSub, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: T.textSub, fontSize: 10 }} axisLine={false} tickLine={false}
                      tickFormatter={v => `${v}x`} domain={[0, 6]} />
                    <Tooltip contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10 }}
                      formatter={(v: number) => [`${v}x`, "ROI"]} />
                    <Line key="line-roi" type="monotone" dataKey="roi" stroke={T.gold} strokeWidth={2.5}
                      dot={{ fill: T.gold, r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black mb-3 text-sm">Janela Recomendada: 7 dias</h3>
                <div className="space-y-2.5">
                  {[
                    { label: "Conversões capturadas", value: "94%",  color: T.success },
                    { label: "Falsos positivos",      value: "<2%",  color: T.success },
                    { label: "ROI calculado",         value: "4.8x", color: T.gold    },
                    { label: "Precisão do modelo",    value: "91%",  color: T.primary },
                  ].map((m, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b" style={{ borderColor: T.border }}>
                      <span className="text-sm" style={{ color: T.textSub }}>{m.label}</span>
                      <span className="font-black" style={{ color: m.color }}>{m.value}</span>
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
