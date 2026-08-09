import { useState, useEffect } from "react";
import { ArrowLeft, CheckCircle, AlertTriangle, XCircle, RefreshCw, Activity, Server, Database, Wifi, Globe, Zap, Clock, TrendingUp } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

interface Props { onBack: () => void; onNavigate?: (v: string) => void; }

type Status = "operational" | "degraded" | "outage" | "maintenance";

interface ServiceStatus {
  name: string; group: string; status: Status;
  uptime99d: number; p99ms: number; lastIncident: string;
}

const SERVICES: ServiceStatus[] = [
  { name: "API Gateway",              group: "Core",       status: "operational", uptime99d: 99.98, p99ms: 42,   lastIncident: "12 dias atrás" },
  { name: "Player SDK (Android)",     group: "Core",       status: "operational", uptime99d: 99.95, p99ms: 18,   lastIncident: "28 dias atrás" },
  { name: "Content Delivery (CDN)",   group: "Core",       status: "operational", uptime99d: 99.99, p99ms: 24,   lastIncident: "47 dias atrás" },
  { name: "Auth / WhatsApp OTP",      group: "Core",       status: "operational", uptime99d: 99.92, p99ms: 310,  lastIncident: "5 dias atrás"  },
  { name: "ProofChain — Camada RSA",   group: "Blockchain", status: "operational", uptime99d: 100.00,p99ms: 88,   lastIncident: "Nunca"           },
  { name: "ProofChain — Merkle Tree",  group: "Blockchain", status: "operational", uptime99d: 100.00,p99ms: 95,   lastIncident: "Nunca"           },
  { name: "ProofChain — Polygon RPC",  group: "Blockchain", status: "degraded",    uptime99d: 99.71, p99ms: 1240, lastIncident: "Agora"           },
  { name: "ProofChain — TSA RFC3161",  group: "Blockchain", status: "operational", uptime99d: 99.96, p99ms: 145,  lastIncident: "19 dias atrás" },
  { name: "Supabase DB (primário)",   group: "Dados",      status: "operational", uptime99d: 99.97, p99ms: 31,   lastIncident: "34 dias atrás" },
  { name: "Storage / Criativos",      group: "Dados",      status: "operational", uptime99d: 99.93, p99ms: 55,   lastIncident: "8 dias atrás"  },
  { name: "Realtime / WebSocket",     group: "Dados",      status: "operational", uptime99d: 99.89, p99ms: 62,   lastIncident: "3 dias atrás"  },
  { name: "Gemini AI (geração)",     group: "AI",         status: "operational", uptime99d: 99.84, p99ms: 520,  lastIncident: "7 dias atrás"  },
  { name: "Programmatic Exchange",    group: "Ad Tech",    status: "operational", uptime99d: 99.91, p99ms: 76,   lastIncident: "15 dias atrás" },
  { name: "Dashboard Web",            group: "Frontend",   status: "operational", uptime99d: 99.99, p99ms: 210,  lastIncident: "60 dias atrás" },
];

const INCIDENTS = [
  { id: "INC-2026-031", title: "Latência elevada no Polygon RPC",  status: "investigating", severity: "medium", started: "Hoje 14:32",    service: "ProofChain — Polygon RPC" },
  { id: "INC-2026-028", title: "Lentidão intermitente no Auth OTP", status: "resolved",      severity: "minor",  started: "18/07 09:15",  service: "Auth / WhatsApp OTP"        },
  { id: "INC-2026-024", title: "Falha de conexão Realtime 5min",     status: "resolved",      severity: "minor",  started: "15/07 22:40",  service: "Realtime / WebSocket"       },
];

function generateUptimeBar(uptime: number) {
  return Array.from({ length: 90 }, (_, i) => {
    const rand = Math.random();
    if (uptime >= 99.99) return "ok";
    if (rand > uptime / 100) return i > 85 ? "incident" : "ok";
    return "ok";
  });
}

const UP_HISTORY = Array.from({ length: 24 }, (_, i) => ({
  hour: `${String(i).padStart(2, "0")}h`,
  latency: Math.floor(Math.random() * 60 + 20),
  requests: Math.floor(Math.random() * 4000 + 1000),
}));

const statusConfig: Record<Status, { label: string; color: string; icon: typeof CheckCircle }> = {
  operational: { label: "Operacional", color: T.success, icon: CheckCircle  },
  degraded:    { label: "Degradado",   color: T.warning, icon: AlertTriangle },
  outage:      { label: "Fora do ar",  color: T.danger,  icon: XCircle       },
  maintenance: { label: "Manutenção",  color: T.primary, icon: RefreshCw    },
};

const incidentSeverity = {
  critical: { label: "Crítico", color: T.danger  },
  medium:   { label: "Médio",   color: T.warning },
  minor:    { label: "Menor",    color: T.primary },
};

const incidentStatus = {
  investigating: { label: "Investigando", color: T.warning },
  identified:    { label: "Identificado", color: T.primary },
  monitoring:    { label: "Monitorando",  color: T.accent  },
  resolved:      { label: "Resolvido",    color: T.success },
};

const GROUPS = ["Core", "Blockchain", "Dados", "AI", "Ad Tech", "Frontend"];

const tooltipStyle = { background: T.panel, border: `1px solid ${T.border}`, borderRadius: 12, color: T.text };

export default function PlatformHealth({ onBack, onNavigate }: Props) {
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<"services" | "incidents" | "metrics">("services");

  const operationalCount = SERVICES.filter(s => s.status === "operational").length;
  const degradedCount    = SERVICES.filter(s => s.status === "degraded").length;
  const outageCount      = SERVICES.filter(s => s.status === "outage").length;
  const overallStatus: Status = outageCount > 0 ? "outage" : degradedCount > 0 ? "degraded" : "operational";
  const overallCfg = statusConfig[overallStatus];
  const avgUptime = (SERVICES.reduce((a, s) => a + s.uptime99d, 0) / SERVICES.length).toFixed(3);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => { setLastUpdated(new Date()); setRefreshing(false); }, 800);
  };

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5"><ArrowLeft size={18} style={{ color: T.textSub }} /></button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: overallCfg.color + "20" }}>
                <Activity size={18} style={{ color: overallCfg.color }} />
              </div>
              <div>
                <h1 className="font-black text-lg">Status da Plataforma</h1>
                <p className="text-xs" style={{ color: T.textSub }}>Atualizado: {lastUpdated.toLocaleTimeString("pt-BR")}</p>
              </div>
            </div>
          </div>
          <button onClick={handleRefresh} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold" style={{ background: T.card, color: T.textSub, border: `1px solid ${T.border}` }}>
            <RefreshCw size={14} style={{ animation: refreshing ? "spin 0.8s linear infinite" : "none" }} />
            Atualizar
          </button>
        </div>
        <div className="max-w-4xl mx-auto px-6 pb-0 flex gap-1">
          {(["services","incidents","metrics"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className="px-5 py-2.5 text-sm font-bold border-b-2 transition-all"
              style={{ color: tab === t ? T.primary : T.textSub, borderColor: tab === t ? T.primary : "transparent" }}>
              {t === "services" ? "Serviços" : t === "incidents" ? `Incidentes (${INCIDENTS.filter(i => i.status !== "resolved").length})` : "Métricas"}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
        <div className="p-5 rounded-2xl border flex items-center gap-5" style={{ background: overallCfg.color + "10", borderColor: overallCfg.color + "30" }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: overallCfg.color + "20" }}>
            <overallCfg.icon size={24} style={{ color: overallCfg.color }} />
          </div>
          <div className="flex-1">
            <h2 className="font-black text-xl" style={{ color: overallCfg.color }}>
              {overallStatus === "operational" ? "Todos os sistemas operacionais" : overallStatus === "degraded" ? "Desempenho degradado em alguns serviços" : "Interrupção em progresso"}
            </h2>
            <p className="text-sm" style={{ color: T.textSub }}>{operationalCount} operacionais · {degradedCount} degradados · {outageCount} fora do ar · Uptime médio 90d: {avgUptime}%</p>
          </div>
          {overallStatus !== "operational" && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold" style={{ background: T.warning + "20", color: T.warning }}>
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: T.warning }} />
              1 incidente ativo
            </div>
          )}
        </div>

        {tab === "services" && (
          <div className="space-y-5">
            {GROUPS.map(group => {
              const groupServices = SERVICES.filter(s => s.group === group);
              return (
                <div key={group} className="rounded-2xl border overflow-hidden" style={{ borderColor: T.border }}>
                  <div className="px-5 py-3 flex items-center justify-between" style={{ background: T.card }}>
                    <span className="font-bold text-sm">{group}</span>
                    <span className="text-xs" style={{ color: T.textSub }}>{groupServices.length} serviços</span>
                  </div>
                  {groupServices.map(s => {
                    const cfg = statusConfig[s.status];
                    const bars = generateUptimeBar(s.uptime99d);
                    return (
                      <div key={s.name} className="px-5 py-4 flex items-center gap-4" style={{ borderTop: `1px solid ${T.border}`, background: s.status !== "operational" ? cfg.color + "05" : "transparent" }}>
                        <cfg.icon size={16} style={{ color: cfg.color, flexShrink: 0 }} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{s.name}</span>
                            {s.status !== "operational" && (
                              <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: cfg.color + "20", color: cfg.color }}>{cfg.label}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-0.5">
                            {bars.slice(0, 60).map((b, bi) => (
                              <div key={bi} className="w-1 h-3 rounded-sm" style={{ background: b === "ok" ? T.success + "60" : cfg.color }} />
                            ))}
                            <span className="text-xs ml-2" style={{ color: T.textSub }}>{s.uptime99d}%</span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-sm font-bold" style={{ color: s.p99ms > 500 ? T.warning : T.text }}>{s.p99ms}ms</div>
                          <div className="text-xs" style={{ color: T.textSub }}>p99 latência</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}

        {tab === "incidents" && (
          <div className="space-y-4">
            {INCIDENTS.map(inc => {
              const sev = incidentSeverity[inc.severity as keyof typeof incidentSeverity];
              const ist = incidentStatus[inc.status as keyof typeof incidentStatus];
              return (
                <div key={inc.id} className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: inc.status !== "resolved" ? sev.color + "40" : T.border }}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-black">{inc.title}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: ist.color + "20", color: ist.color }}>{ist.label}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: sev.color + "20", color: sev.color }}>{sev.label}</span>
                      </div>
                      <div className="text-sm" style={{ color: T.textSub }}>{inc.id} · {inc.service} · Iniciado: {inc.started}</div>
                    </div>
                  </div>
                  {inc.status !== "resolved" && (
                    <div className="p-3 rounded-xl text-sm" style={{ background: T.panel, color: T.textSub }}>Estamos investigando latência elevada nas chamadas ao nó Polygon RPC. Transações ainda funcionam, mas com atraso. Atualização em 30min.</div>
                  )}
                  {inc.status === "resolved" && (
                    <div className="flex items-center gap-1.5 text-sm" style={{ color: T.success }}>
                      <CheckCircle size={14} /> Resolvido sem impacto nos usuários finais.
                    </div>
                  )}
                </div>
              );
            })}
            <div className="p-4 rounded-2xl border text-center" style={{ background: T.card, borderColor: T.border }}>
              <Clock size={20} style={{ color: T.textSub, margin: "0 auto 8px" }} />
              <p className="text-sm" style={{ color: T.textSub }}>Histórico completo de incidentes disponível no painel de administração.</p>
            </div>
          </div>
        )}

        {tab === "metrics" && (
          <div className="space-y-5">
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: "Req/min (atual)", value: "4.2k",   color: T.primary, icon: Zap       },
                { label: "Latência p50",   value: "28ms",   color: T.success, icon: Activity  },
                { label: "Latência p99",   value: "142ms",  color: T.warning, icon: Clock     },
                { label: "Error rate",      value: "0.02%",  color: T.success, icon: TrendingUp },
              ].map((m, i) => (
                <div key={i} className="p-4 rounded-2xl border flex items-center gap-3" style={{ background: T.card, borderColor: T.border }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: m.color + "20" }}>
                    <m.icon size={16} style={{ color: m.color }} />
                  </div>
                  <div>
                    <div className="font-black text-xl" style={{ color: m.color }}>{m.value}</div>
                    <div className="text-xs" style={{ color: T.textSub }}>{m.label}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-bold mb-4">Latência p99 — últimas 24h (ms)</h3>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={UP_HISTORY}>
                  <defs>
                    <linearGradient id="ph-lat" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={T.primary} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={T.primary} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}ms`, "p99"]} />
                  <Area type="monotone" dataKey="latency" stroke={T.primary} fill="url(#ph-lat)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-bold mb-4">Requisições/hora — últimas 24h</h3>
              <ResponsiveContainer width="100%" height={120}>
                <AreaChart data={UP_HISTORY}>
                  <defs>
                    <linearGradient id="ph-req" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={T.success} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={T.success} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v.toLocaleString()}`, "requisições"]} />
                  <Area type="monotone" dataKey="requests" stroke={T.success} fill="url(#ph-req)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "SLA 30 dias", value: "99.94%", target: "99.9%",  color: T.success },
                { label: "SLA 90 dias", value: "99.91%", target: "99.9%",  color: T.success },
                { label: "MTTR médio", value: "18min",  target: "<30min", color: T.success },
              ].map((s, i) => (
                <div key={i} className="p-4 rounded-2xl border text-center" style={{ background: T.card, borderColor: T.border }}>
                  <div className="font-black text-2xl mb-1" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-xs mb-1" style={{ color: T.textSub }}>{s.label}</div>
                  <div className="text-xs font-bold" style={{ color: T.textSub }}>Meta: {s.target}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
