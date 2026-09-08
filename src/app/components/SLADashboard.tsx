import { useState } from "react";
import {
  ArrowLeft, Shield, CheckCircle, AlertTriangle, XCircle,
  Clock, TrendingUp, TrendingDown, Activity, Download,
  Zap, Eye, BarChart2, RefreshCw, ExternalLink
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, BarChart, Bar, Cell } from "recharts";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

const UPTIME_90 = Array.from({ length: 90 }, (_, i) => ({
  day: `D-${90 - i}`,
  uptime: parseFloat((97.5 + Math.random() * 2.4).toFixed(2)),
  incidents: Math.random() > 0.92 ? Math.floor(Math.random() * 3 + 1) : 0,
}));

const LATENCY_24 = Array.from({ length: 24 }, (_, h) => ({
  h: `${String(h).padStart(2, "0")}h`,
  p50: Math.round(18 + Math.random() * 14),
  p95: Math.round(45 + Math.random() * 40),
  p99: Math.round(90 + Math.random() * 80),
}));

const COMPONENTS = [
  { name: "Player API",         status: "operational", uptime: 99.97, latency: 22  },
  { name: "ProofChain Engine",  status: "operational", uptime: 99.94, latency: 38  },
  { name: "Campaign Delivery",  status: "operational", uptime: 99.91, latency: 28  },
  { name: "Analytics Pipeline", status: "degraded",    uptime: 98.12, latency: 184 },
  { name: "Billing Gateway",    status: "operational", uptime: 99.99, latency: 14  },
  { name: "AI Generation",      status: "operational", uptime: 99.80, latency: 680 },
  { name: "Blockchain Anchor",  status: "operational", uptime: 99.98, latency: 120 },
  { name: "CDN / Asset Store",  status: "operational", uptime: 99.95, latency: 8   },
];

const INCIDENTS = [
  { id: "INC-042", date: "21/07/2026 14:22", duration: "12 min", severity: "minor",    component: "Analytics Pipeline", desc: "Atraso no processamento de eventos — sem perda de dados" },
  { id: "INC-041", date: "14/07/2026 03:11", duration: "4 min",  severity: "minor",    component: "Player API",         desc: "Latência elevada em 3 regiões — resolvido automaticamente" },
  { id: "INC-040", date: "08/07/2026 18:45", duration: "28 min", severity: "moderate", component: "Campaign Delivery",  desc: "Falha na sincronização de playlist — 847 telas afetadas" },
  { id: "INC-039", date: "01/07/2026 09:03", duration: "6 min",  severity: "minor",    component: "CDN / Asset Store",  desc: "Lentidão na entrega de assets em região Sul" },
];

const SEV_CFG = {
  minor:    { label: "Menor",    color: T.warning, bg: T.warning + "15" },
  moderate: { label: "Moderado", color: T.danger,  bg: T.danger  + "15" },
  critical: { label: "Crítico",  color: T.danger,  bg: T.danger  + "30" },
};

const STATUS_ICON = {
  operational: <CheckCircle size={14} style={{ color: T.success }} />,
  degraded:    <AlertTriangle size={14} style={{ color: T.warning }} />,
  outage:      <XCircle size={14} style={{ color: T.danger }} />,
};

export default function SLADashboard({ onBack, onNavigate }: { onBack: () => void; onNavigate?: (v: string) => void }) {
  const [tab, setTab] = useState<"overview" | "components" | "incidents" | "latency">("overview");
  const overallUptime = 99.87;
  const slaTarget = 99.90;
  const slaOk = overallUptime >= slaTarget;

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      <div className="border-b px-6 py-4 flex items-center gap-4 sticky top-0 z-10" style={{ background: T.panel, borderColor: T.border }}>
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5">
          <ArrowLeft size={18} style={{ color: T.textSub }} />
        </button>
        <div>
          <h1 className="font-bold text-lg">SLA Dashboard</h1>
          <p className="text-xs" style={{ color: T.textSub }}>Status e compromissos de disponibilidade — público para anunciantes</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full" style={{ background: T.success + "15", color: T.success }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: T.success }} /> Todos os sistemas operacionais
          </span>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold" style={{ background: T.border, color: T.textSub }}>
            <Download size={13} /> Relatório
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6">
        {/* SLA commitment banner */}
        <div className="p-5 rounded-2xl border mb-6 flex items-center gap-4" style={{ background: slaOk ? T.success + "08" : T.danger + "08", borderColor: slaOk ? T.success + "30" : T.danger + "30" }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: slaOk ? T.success + "20" : T.danger + "20" }}>
            <Shield size={22} style={{ color: slaOk ? T.success : T.danger }} />
          </div>
          <div>
            <p className="font-bold">SLA de disponibilidade: {slaTarget}% / mês</p>
            <p className="text-sm" style={{ color: T.textSub }}>
              Uptime atual (Jul/2026): <span style={{ color: slaOk ? T.success : T.danger, fontWeight: 700 }}>{overallUptime}%</span>
              {slaOk ? " — dentro do SLA ✓" : " — fora do SLA ✗"}
            </p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-xs" style={{ color: T.textSub }}>Penalidade por downtime</p>
            <p className="font-semibold text-sm" style={{ color: T.warning }}>Crédito proporcional automático</p>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Uptime 30d",         value: `${overallUptime}%`,  color: T.success, icon: Activity  },
            { label: "Incidentes Jul",      value: "4",                  color: T.warning, icon: AlertTriangle },
            { label: "MTTR médio",          value: "12 min",             color: T.text,    icon: Clock    },
            { label: "Latência p95 (API)",  value: "68ms",               color: T.primary, icon: Zap      },
          ].map(m => {
            const Icon = m.icon;
            return (
              <div key={m.label} className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={14} style={{ color: m.color }} />
                  <p className="text-xs" style={{ color: T.textSub }}>{m.label}</p>
                </div>
                <p className="text-2xl font-bold" style={{ color: m.color }}>{m.value}</p>
              </div>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-2xl mb-6" style={{ background: T.card }}>
          {(["overview","components","incidents","latency"] as const).map((id) => {
            const labels: Record<string, string> = { overview: "Visão geral", components: "Componentes", incidents: "Incidentes", latency: "Latência" };
            return (
              <button key={id} onClick={() => setTab(id)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                style={{ background: tab === id ? T.primary : "transparent", color: tab === id ? "#fff" : T.textSub }}>
                {labels[id]}
              </button>
            );
          })}
        </div>

        {/* Overview — uptime 90d */}
        {tab === "overview" && (
          <div className="space-y-5">
            <div className="p-6 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-bold text-sm mb-4">Uptime — últimos 90 dias</h3>
              <ResponsiveContainer width="100%" height={140}>
                <AreaChart data={UPTIME_90.slice(-30)}>
                  <defs>
                    <linearGradient key="sla-up-grad" id="sla-up-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={T.success} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={T.success} stopOpacity={0}   />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" tick={{ fontSize: 9, fill: T.textSub }} axisLine={false} tickLine={false} interval={4} />
                  <YAxis domain={[97, 100]} tick={{ fontSize: 9, fill: T.textSub }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 11 }}
                    formatter={(v: number) => [`${v}%`, "Uptime"]} />
                  <Area key="area-uptime" type="monotone" dataKey="uptime" stroke={T.success} fill="url(#sla-up-grad)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-bold text-sm mb-3">Histórico de uptime mensal</h3>
              <div className="space-y-2">
                {[
                  { month: "Jul/2026", uptime: 99.87, target: 99.90, incidents: 4 },
                  { month: "Jun/2026", uptime: 99.94, target: 99.90, incidents: 1 },
                  { month: "Mai/2026", uptime: 99.91, target: 99.90, incidents: 2 },
                  { month: "Abr/2026", uptime: 99.96, target: 99.90, incidents: 0 },
                  { month: "Mar/2026", uptime: 99.88, target: 99.90, incidents: 3 },
                ].map(m => (
                  <div key={m.month} className="flex items-center gap-4 py-2 border-b text-sm" style={{ borderColor: T.border }}>
                    <span className="w-24 font-medium">{m.month}</span>
                    <div className="flex-1 h-2 rounded-full" style={{ background: T.border }}>
                      <div className="h-2 rounded-full" style={{ width: `${((m.uptime - 99) / 1) * 100}%`, background: m.uptime >= m.target ? T.success : T.danger }} />
                    </div>
                    <span className="w-16 text-right font-mono" style={{ color: m.uptime >= m.target ? T.success : T.danger }}>{m.uptime}%</span>
                    <span className="w-20 text-right text-xs" style={{ color: T.textSub }}>{m.incidents} incid.</span>
                    {m.uptime >= m.target ? <CheckCircle size={14} style={{ color: T.success }} /> : <AlertTriangle size={14} style={{ color: T.danger }} />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Components */}
        {tab === "components" && (
          <div className="space-y-2">
            {COMPONENTS.map((c, i) => (
              <div key={`comp-${i}`} className="flex items-center gap-4 p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <div className="w-8 flex justify-center">{STATUS_ICON[c.status as keyof typeof STATUS_ICON]}</div>
                <span className="flex-1 font-semibold text-sm">{c.name}</span>
                <span className="text-xs px-2 py-1 rounded-lg" style={{ background: c.status === "operational" ? T.success + "15" : T.warning + "15", color: c.status === "operational" ? T.success : T.warning }}>
                  {c.status === "operational" ? "Operacional" : "Degradado"}
                </span>
                <div className="w-20 text-right">
                  <p className="font-mono text-xs font-bold" style={{ color: c.uptime >= 99.9 ? T.success : T.warning }}>{c.uptime}%</p>
                  <p className="text-xs" style={{ color: T.textSub }}>uptime</p>
                </div>
                <div className="w-20 text-right">
                  <p className="font-mono text-xs font-bold" style={{ color: c.latency > 200 ? T.warning : T.text }}>{c.latency}ms</p>
                  <p className="text-xs" style={{ color: T.textSub }}>latência</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Incidents */}
        {tab === "incidents" && (
          <div className="space-y-3">
            {INCIDENTS.map(inc => {
              const sev = SEV_CFG[inc.severity as keyof typeof SEV_CFG];
              return (
                <div key={inc.id} className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs" style={{ color: T.textSub }}>{inc.id}</span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: sev.bg, color: sev.color }}>{sev.label}</span>
                        <span className="text-xs px-2 py-0.5 rounded-lg" style={{ background: T.border, color: T.textSub }}>{inc.component}</span>
                      </div>
                      <p className="text-sm font-semibold">{inc.desc}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs" style={{ color: T.textSub }}>{inc.date}</p>
                      <p className="text-xs mt-1 flex items-center gap-1 justify-end" style={{ color: T.warning }}>
                        <Clock size={10} /> {inc.duration}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <CheckCircle size={12} style={{ color: T.success }} />
                    <span className="text-xs" style={{ color: T.success }}>Resolvido</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Latency */}
        {tab === "latency" && (
          <div className="space-y-5">
            <div className="p-6 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-bold text-sm mb-1">Latência Player API — últimas 24h</h3>
              <p className="text-xs mb-4" style={{ color: T.textSub }}>p50 · p95 · p99 em milissegundos</p>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={LATENCY_24}>
                  <defs>
                    <linearGradient key="sla-p99-grad" id="sla-p99-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={T.danger} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={T.danger} stopOpacity={0}   />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="h" tick={{ fontSize: 9, fill: T.textSub }} axisLine={false} tickLine={false} interval={3} />
                  <YAxis tick={{ fontSize: 9, fill: T.textSub }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 11 }}
                    formatter={(v: number, n: string) => [`${v}ms`, n]} />
                  <Area key="area-p99" type="monotone" dataKey="p99" stroke={T.danger}   fill="url(#sla-p99-grad)" strokeWidth={1.5} dot={false} name="p99" />
                  <Area key="area-p95" type="monotone" dataKey="p95" stroke={T.warning}  fill="none" strokeWidth={1.5} dot={false} name="p95" />
                  <Area key="area-p50" type="monotone" dataKey="p50" stroke={T.success}  fill="none" strokeWidth={2}   dot={false} name="p50" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {([["p50", "28ms", T.success],["p95","68ms",T.warning],["p99","142ms",T.danger]] as [string,string,string][]).map(([k,v,c]) => (
                <div key={k} className="p-5 rounded-2xl border text-center" style={{ background: T.card, borderColor: T.border }}>
                  <p className="text-xs mb-1" style={{ color: T.textSub }}>Latência {k}</p>
                  <p className="text-2xl font-bold font-mono" style={{ color: c }}>{v}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
