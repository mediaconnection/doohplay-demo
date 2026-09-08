import { useState } from "react";
import {
  ArrowLeft, Shield, AlertTriangle, Ban, Eye, TrendingDown,
  CheckCircle, XCircle, RefreshCw, Download, Filter, Globe,
  Monitor, Activity, Zap, Clock, Hash
} from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, CartesianGrid } from "recharts";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

interface Props { onBack: () => void; onNavigate?: (v: string) => void; }

type TabId = "overview" | "alerts" | "blocklist";

const HOURLY_FRAUD = [
  { h: "00", imp: 3200, fraud: 640 },
  { h: "02", imp: 2100, fraud: 1100 },
  { h: "04", imp: 1800, fraud: 1400 },
  { h: "06", imp: 4200, fraud: 180 },
  { h: "08", imp: 8400, fraud: 210 },
  { h: "10", imp: 12300, fraud: 150 },
  { h: "12", imp: 14800, fraud: 190 },
  { h: "14", imp: 13200, fraud: 220 },
  { h: "16", imp: 15100, fraud: 170 },
  { h: "18", imp: 16800, fraud: 195 },
  { h: "20", imp: 14200, fraud: 180 },
  { h: "22", imp: 8900, fraud: 310 },
];

const TREND_7D = [
  { d: "Qui", rate: 4.2 }, { d: "Sex", rate: 3.8 }, { d: "Sáb", rate: 6.1 },
  { d: "Dom", rate: 5.4 }, { d: "Seg", rate: 2.9 }, { d: "Ter", rate: 3.1 }, { d: "Qua", rate: 2.7 },
];

interface Alert {
  id: string;
  screen: string;
  city: string;
  type: "loop_bot" | "ghosting" | "ip_cluster" | "timing_anomaly";
  severity: "critical" | "high" | "medium";
  impactoR$: number;
  detectedAt: string;
  impressions: number;
  status: "open" | "investigating" | "resolved";
}

const ALERTS: Alert[] = [
  { id: "FR001", screen: "Av. Paulista 1000",    city: "São Paulo", type: "loop_bot",      severity: "critical", impactoR$: 3840, detectedAt: "Hoje 02:14", impressions: 91200, status: "open"         },
  { id: "FR002", screen: "Rodoviária Tietê",     city: "São Paulo", type: "ip_cluster",    severity: "high",     impactoR$: 1240, detectedAt: "Hoje 04:07", impressions: 34600, status: "investigating" },
  { id: "FR003", screen: "Shopping BH",          city: "BH",        type: "ghosting",      severity: "high",     impactoR$: 890,  detectedAt: "Ontem 23:52",impressions: 24800, status: "open"         },
  { id: "FR004", screen: "Aeroporto Congonhas",  city: "São Paulo", type: "timing_anomaly",severity: "medium",   impactoR$: 420,  detectedAt: "Ontem 18:33",impressions: 11700, status: "resolved"     },
  { id: "FR005", screen: "Shopping Recife",      city: "Recife",    type: "loop_bot",      severity: "medium",   impactoR$: 310,  detectedAt: "Ontem 15:10",impressions: 8600,  status: "resolved"     },
];

const TYPE_META = {
  loop_bot:       { label: "Loop Bot",        color: T.danger,  desc: "Requisições repetidas em intervalo fixo sem variância humana" },
  ghosting:       { label: "Ghosting Screen", color: T.warning, desc: "Tela reportando impressões sem estar fisicamente ativa" },
  ip_cluster:     { label: "IP Cluster",      color: T.accent,  desc: "Múltiplos cliques/impressões de mesmo range de IP em curto período" },
  timing_anomaly: { label: "Timing Anomaly",  color: T.primary, desc: "Padrão temporal suspeito divergindo do tráfego orgânico esperado" },
};

const SEV_META = {
  critical: { label: "Crítico", color: T.danger  },
  high:     { label: "Alto",    color: T.warning  },
  medium:   { label: "Médio",   color: T.primary  },
};

const BLOCKLIST = [
  { id: "BL001", entity: "185.234.xxx.0/24",     type: "IP Range",    reason: "Loop bot cluster",        addedAt: "22/07/2025", blocked: 184000 },
  { id: "BL002", entity: "chrome-headless-v120",  type: "User Agent",  reason: "Scraper bot",             addedAt: "20/07/2025", blocked:  52000 },
  { id: "BL003", entity: "SCR-BH-008 (ghosting)", type: "Screen",      reason: "Tela offline reportando", addedAt: "19/07/2025", blocked:  24800 },
  { id: "BL004", entity: "91.108.4.xxx/24",       type: "IP Range",    reason: "Proxy/VPN abuse",         addedAt: "18/07/2025", blocked:  18400 },
  { id: "BL005", entity: "phantom-click-sdk-v2",  type: "SDK",         reason: "SDK manipulado",          addedAt: "15/07/2025", blocked:   9100 },
];

const FRAUD_TYPES_BAR = [
  { type: "Loop Bot",   pct: 48, count: 3 },
  { type: "IP Cluster", pct: 29, count: 2 },
  { type: "Ghosting",   pct: 14, count: 1 },
  { type: "Timing",     pct: 9,  count: 1 },
];

export default function FraudDetection({ onBack }: Props) {
  const [tab, setTab]         = useState<TabId>("overview");
  const [sevFilter, setSevFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const totalFraudImp  = ALERTS.reduce((s, a) => s + a.impressions, 0);
  const totalImpacto   = ALERTS.reduce((s, a) => s + a.impactoR$, 0);
  const openAlerts     = ALERTS.filter(a => a.status !== "resolved").length;
  const avgFraudRate   = 3.2;

  const filteredAlerts = ALERTS.filter(a =>
    (sevFilter === "all" || a.severity === sevFilter) &&
    (statusFilter === "all" || a.status === statusFilter)
  );

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5">
              <ArrowLeft size={18} style={{ color: T.textSub }} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.danger + "20" }}>
                <Shield size={18} style={{ color: T.danger }} />
              </div>
              <div>
                <h1 className="font-black text-lg">Fraud Detection</h1>
                <p className="text-xs" style={{ color: T.textSub }}>Detecção de impressões inválidas, bots e comportamentos fraudulentos</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {(["overview","alerts","blocklist"] as TabId[]).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
                style={{ background: tab === t ? T.danger + "20" : "transparent", color: tab === t ? T.danger : T.textSub, border: `1px solid ${tab === t ? T.danger + "30" : "transparent"}` }}>
                {t === "overview" ? "Overview" : t === "alerts" ? "Alertas" : "Blocklist"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Taxa de Fraude",       value: `${avgFraudRate}%`, sub: "vs. 4.1% ontem",       color: T.success, delta: "down" },
            { label: "Impressões Bloqueadas", value: `${(totalFraudImp/1000).toFixed(0)}k`,    sub: "últimas 48h",           color: T.danger,  delta: null   },
            { label: "Impacto R$ Protegido",  value: `R$${(totalImpacto/1000).toFixed(1)}k`,   sub: "receita recuperada",    color: T.gold,    delta: null   },
            { label: "Alertas Abertos",       value: openAlerts,                                sub: `${ALERTS.length} total`, color: T.warning, delta: null  },
          ].map((k, i) => (
            <div key={i} className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-black text-2xl" style={{ color: k.color }}>{k.value}</div>
                  <div className="text-xs mt-0.5" style={{ color: T.textSub }}>{k.label}</div>
                </div>
                {k.delta === "down" && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: T.success + "20", color: T.success }}>-0.9pp</span>
                )}
              </div>
              <div className="text-xs mt-1.5" style={{ color: T.textSub }}>{k.sub}</div>
            </div>
          ))}
        </div>

        {tab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black mb-4">Impressões vs. Fraude por Hora (hoje)</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={HOURLY_FRAUD}>
                    <defs>
                      <linearGradient key="grad-imp" id="grad-imp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={T.primary} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={T.primary} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient key="grad-fraud" id="grad-fraud" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={T.danger} stopOpacity={0.5} />
                        <stop offset="95%" stopColor={T.danger} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="h" tick={{ fill: T.textSub, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10 }}
                      formatter={(v: number, n: string) => [v.toLocaleString("pt-BR"), n === "imp" ? "Impressões" : "Fraudes"]} />
                    <Area key="area-imp"   type="monotone" dataKey="imp"   stroke={T.primary} strokeWidth={2} fill="url(#grad-imp)"   />
                    <Area key="area-fraud" type="monotone" dataKey="fraud" stroke={T.danger}  strokeWidth={2} fill="url(#grad-fraud)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black mb-4">Taxa de Fraude — 7 dias</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={TREND_7D}>
                    <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
                    <XAxis dataKey="d" tick={{ fill: T.textSub, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: T.textSub, fontSize: 10 }} axisLine={false} tickLine={false}
                      tickFormatter={v => `${v}%`} domain={[0, 8]} />
                    <Tooltip contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10 }}
                      formatter={(v: number) => [`${v}%`, "Taxa de Fraude"]} />
                    <Line key="line-fraud-rate" type="monotone" dataKey="rate" stroke={T.danger} strokeWidth={2.5}
                      dot={{ fill: T.danger, r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black mb-4 text-sm">Por Tipo de Fraude</h3>
                <ResponsiveContainer width="100%" height={140}>
                  <BarChart data={FRAUD_TYPES_BAR} layout="vertical" barSize={18}>
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="type" tick={{ fill: T.textSub, fontSize: 10 }} axisLine={false} tickLine={false} width={70} />
                    <Tooltip contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10 }}
                      formatter={(v: number) => [`${v}%`, "Share"]} />
                    <Bar key="bar-fraud-type" dataKey="pct" radius={[0, 6, 6, 0]}>
                      {FRAUD_TYPES_BAR.map((_, i) => (
                        <Cell key={`cell-ft-${i}`} fill={[T.danger, T.accent, T.warning, T.primary][i]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="col-span-2 p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black mb-4 text-sm">Detalhamento por Tipo</h3>
                <div className="space-y-3">
                  {(Object.entries(TYPE_META) as [string, any][]).map(([key, meta]) => (
                    <div key={key} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: T.panel }}>
                      <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: meta.color }} />
                      <div className="flex-1">
                        <div className="text-xs font-black" style={{ color: meta.color }}>{meta.label}</div>
                        <div className="text-xs" style={{ color: T.textSub }}>{meta.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "alerts" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter size={14} style={{ color: T.textSub }} />
                <select value={sevFilter} onChange={e => setSevFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl text-xs" style={{ background: T.panel, border: `1px solid ${T.border}`, color: T.text }}>
                  <option value="all">Todas severidades</option>
                  <option value="critical">Crítico</option>
                  <option value="high">Alto</option>
                  <option value="medium">Médio</option>
                </select>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl text-xs" style={{ background: T.panel, border: `1px solid ${T.border}`, color: T.text }}>
                  <option value="all">Todos status</option>
                  <option value="open">Aberto</option>
                  <option value="investigating">Investigando</option>
                  <option value="resolved">Resolvido</option>
                </select>
              </div>
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

            <div className="space-y-2">
              {filteredAlerts.map(alert => {
                const sm = SEV_META[alert.severity];
                const tm = TYPE_META[alert.type];
                const statusColor = alert.status === "resolved" ? T.success : alert.status === "investigating" ? T.warning : T.danger;
                const statusLabel = alert.status === "resolved" ? "Resolvido" : alert.status === "investigating" ? "Investigando" : "Aberto";
                return (
                  <div key={alert.id} className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: sm.color + "20" }}>
                        <AlertTriangle size={14} style={{ color: sm.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black text-sm">{alert.screen}</span>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: sm.color + "20", color: sm.color }}>{sm.label}</span>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: tm.color + "20", color: tm.color }}>{tm.label}</span>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: statusColor + "20", color: statusColor }}>{statusLabel}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-xs" style={{ color: T.textSub }}>
                          <span>{alert.city}</span>
                          <span>·</span>
                          <span>{alert.detectedAt}</span>
                          <span>·</span>
                          <span>{alert.id}</span>
                        </div>
                        <div className="text-xs mt-1.5" style={{ color: T.textSub }}>{tm.desc}</div>
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0 text-sm">
                        <div className="text-right">
                          <div className="font-black" style={{ color: T.danger }}>R${alert.impactoR$.toLocaleString("pt-BR")}</div>
                          <div className="text-xs" style={{ color: T.textSub }}>impacto</div>
                        </div>
                        <div className="text-right">
                          <div className="font-black">{(alert.impressions/1000).toFixed(0)}k</div>
                          <div className="text-xs" style={{ color: T.textSub }}>imp. bloqueadas</div>
                        </div>
                        {alert.status !== "resolved" && (
                          <div className="flex flex-col gap-1.5">
                            <button className="px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1" style={{ background: T.success + "20", color: T.success }}>
                              <CheckCircle size={11} /> Resolver
                            </button>
                            <button className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1" style={{ background: T.danger + "20", color: T.danger }}>
                              <Ban size={11} /> Bloquear
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === "blocklist" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-black">Entidades Bloqueadas</h2>
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black"
                style={{ background: T.danger, color: "#fff" }}>
                <Ban size={13} /> Adicionar à Blocklist
              </button>
            </div>

            <div className="rounded-2xl border overflow-hidden" style={{ background: T.card, borderColor: T.border }}>
              <div className="grid gap-0">
                <div className="grid grid-cols-5 gap-4 px-4 py-3 text-xs font-black" style={{ color: T.textSub, borderBottom: `1px solid ${T.border}` }}>
                  <span>ENTIDADE</span>
                  <span>TIPO</span>
                  <span>MOTIVO</span>
                  <span>ADICIONADO</span>
                  <span>IMP. BLOQUEADAS</span>
                </div>
                {BLOCKLIST.map((entry, i) => (
                  <div key={entry.id} className="grid grid-cols-5 gap-4 px-4 py-3 items-center text-sm hover:bg-white/2"
                    style={{ borderBottom: i < BLOCKLIST.length - 1 ? `1px solid ${T.border}` : "none" }}>
                    <div className="flex items-center gap-2">
                      <Hash size={12} style={{ color: T.textSub }} />
                      <span className="font-mono text-xs" style={{ color: T.danger }}>{entry.entity}</span>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold w-fit"
                      style={{ background: T.primary + "20", color: T.primary }}>{entry.type}</span>
                    <span className="text-xs" style={{ color: T.textSub }}>{entry.reason}</span>
                    <span className="text-xs" style={{ color: T.textSub }}>{entry.addedAt}</span>
                    <div className="flex items-center justify-between">
                      <span className="font-black text-sm" style={{ color: T.warning }}>{entry.blocked.toLocaleString("pt-BR")}</span>
                      <button className="p-1.5 rounded-lg hover:bg-white/5">
                        <XCircle size={13} style={{ color: T.danger }} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl border flex items-center gap-3" style={{ background: T.warning + "10", borderColor: T.warning + "30" }}>
              <AlertTriangle size={14} style={{ color: T.warning }} />
              <p className="text-xs" style={{ color: T.warning }}>
                <strong>Atenção:</strong> Adicionar telas legítimas à blocklist interrompe imediatamente a veiculação. Confirme a análise antes de bloquear.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
