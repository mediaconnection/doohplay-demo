import { useState, useEffect } from "react";
import { ArrowLeft, CheckCircle, AlertTriangle, XCircle, Clock, RefreshCw, Bell, ExternalLink, ChevronDown, ChevronUp, Wifi, Server, Shield, Zap, Database, Globe } from "lucide-react";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

type Status = "operational" | "degraded" | "outage" | "maintenance";

interface Service {
  id: string;
  name: string;
  desc: string;
  status: Status;
  uptime: number;
  latency: number;
  icon: typeof Server;
}

interface Incident {
  id: string;
  title: string;
  status: "resolved" | "monitoring" | "investigating" | "identified";
  severity: "critical" | "major" | "minor";
  started: string;
  resolved?: string;
  updates: { time: string; msg: string; status: string }[];
}

const SERVICES: Service[] = [
  { id: "sv1", name: "API Principal",       desc: "REST API v1 — autenticação, dados e controle",          status: "operational", uptime: 99.97, latency: 48,   icon: Zap      },
  { id: "sv2", name: "Player Network",      desc: "Comunicação com os players Android no campo",         status: "operational", uptime: 99.84, latency: 112,  icon: Wifi     },
  { id: "sv3", name: "ProofChain Engine",   desc: "Assinatura RSA-SHA256, Merkle tree e timestamp",     status: "operational", uptime: 100.0, latency: 210,  icon: Shield   },
  { id: "sv4", name: "Blockchain Relay",    desc: "Envio de provas para Polygon PoS",                  status: "degraded",    uptime: 98.12, latency: 840,  icon: Database },
  { id: "sv5", name: "Canal DOOHPLAY CDN",  desc: "Entrega de conteúdo dos 12 canais de programação",   status: "operational", uptime: 99.93, latency: 38,   icon: Globe    },
  { id: "sv6", name: "Dashboard Web",       desc: "Painel de controle e app web",                      status: "operational", uptime: 99.99, latency: 22,   icon: Server   },
  { id: "sv7", name: "WhatsApp OTP",        desc: "Autenticação via WhatsApp Business API",              status: "operational", uptime: 99.61, latency: 180,  icon: Bell     },
  { id: "sv8", name: "IA Generativa",       desc: "Geração de criativos com Gemini",                    status: "operational", uptime: 99.45, latency: 2400, icon: Zap      },
];

const INCIDENTS: Incident[] = [
  {
    id: "i1", title: "Latência elevada no Blockchain Relay", status: "monitoring", severity: "minor",
    started: "2026-07-23T11:00:00Z",
    updates: [
      { time: "14:30", msg: "Latência voltando ao normal. Continuamos monitorando.", status: "monitoring" },
      { time: "12:15", msg: "Problema identificado: congestionamento na rede Polygon. Relay operando com fallback.", status: "identified" },
      { time: "11:00", msg: "Detectamos latência acima do normal no relay de blockchain.", status: "investigating" },
    ],
  },
  {
    id: "i2", title: "Interrupção parcial do WhatsApp OTP", status: "resolved", severity: "major",
    started: "2026-07-18T08:15:00Z", resolved: "2026-07-18T09:40:00Z",
    updates: [
      { time: "09:40", msg: "Serviço restaurado completamente. Meta (WhatsApp) resolveu a instabilidade.", status: "resolved" },
      { time: "09:10", msg: "Parcialmente operacional. Usuários novos afetados conseguem usar SMS como fallback.", status: "identified" },
      { time: "08:15", msg: "Recebendo relatos de falha no envio do código OTP via WhatsApp.", status: "investigating" },
    ],
  },
  {
    id: "i3", title: "CDN com entrega lenta na região Sul", status: "resolved", severity: "minor",
    started: "2026-07-10T14:00:00Z", resolved: "2026-07-10T15:30:00Z",
    updates: [
      { time: "15:30", msg: "CDN edge node restaurado. Todos os conteúdos entregando normalmente.", status: "resolved" },
      { time: "14:00", msg: "Edge node na região Sul apresentando problemas de entrega.", status: "investigating" },
    ],
  },
];

function buildUptimeBar(uptime: number) {
  return Array.from({ length: 90 }, () => {
    const rand = Math.random();
    if (rand > 0.98 && uptime < 99.9) return "outage";
    if (rand > 0.94 && uptime < 99.95) return "degraded";
    return "ok";
  });
}

const STATUS_CONFIG: Record<Status, { label: string; color: string; bg: string; icon: typeof CheckCircle }> = {
  operational:  { label: "Operacional",  color: T.success, bg: T.success + "15", icon: CheckCircle  },
  degraded:     { label: "Degradado",    color: T.warning, bg: T.warning + "15", icon: AlertTriangle },
  outage:       { label: "Indisponível", color: T.danger,  bg: T.danger  + "15", icon: XCircle       },
  maintenance:  { label: "Manutenção",   color: T.primary, bg: T.primary + "15", icon: Clock         },
};

const SEVERITY_COLORS: Record<string, string> = {
  critical: T.danger, major: T.warning, minor: T.primary,
};

interface Props { onBack: () => void; }

export default function StatusPage({ onBack }: Props) {
  const [expanded, setExpanded] = useState<string | null>("i1");
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [pulsing, setPulsing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
      setPulsing(true);
      setTimeout(() => setPulsing(false), 600);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const degradedCount = SERVICES.filter(s => s.status === "degraded").length;
  const activeIncidents = INCIDENTS.filter(i => i.status !== "resolved");

  const overallStatus: Status = SERVICES.some(s => s.status === "outage") ? "outage"
    : SERVICES.some(s => s.status === "degraded") ? "degraded"
    : "operational";

  const overallCfg = STATUS_CONFIG[overallStatus];
  const OverallIcon = overallCfg.icon;

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5"><ArrowLeft size={18} style={{ color: T.textSub }} /></button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: overallCfg.bg }}>
              <OverallIcon size={18} style={{ color: overallCfg.color }} />
            </div>
            <div>
              <h1 className="font-black text-lg">Status do Sistema</h1>
              <p className="text-xs" style={{ color: T.textSub }}>status.doohplay.com.br</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-xs" style={{ color: T.textSub }}>
            <RefreshCw size={11} className={pulsing ? "animate-spin" : ""} />
            {lastUpdate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        <div className="rounded-2xl border p-6 text-center"
          style={{ background: overallCfg.bg, borderColor: overallCfg.color + "30" }}>
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-3 h-3 rounded-full animate-pulse" style={{ background: overallCfg.color }} />
            <span className="text-2xl font-black" style={{ color: overallCfg.color }}>
              {overallStatus === "operational" ? "Todos os sistemas operacionais" : `${degradedCount} serviço(s) com degradação`}
            </span>
          </div>
          <p className="text-sm" style={{ color: T.textSub }}>
            Atualizado às {lastUpdate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })} · {activeIncidents.length} incidente(s) ativo(s)
          </p>
        </div>

        {activeIncidents.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-bold text-sm" style={{ color: T.warning }}>⚠ Incidentes em andamento</h2>
            {activeIncidents.map(inc => {
              const isExpanded = expanded === inc.id;
              return (
                <div key={inc.id} className="rounded-2xl border overflow-hidden"
                  style={{ background: T.card, borderColor: SEVERITY_COLORS[inc.severity] + "30" }}>
                  <button onClick={() => setExpanded(isExpanded ? null : inc.id)}
                    className="w-full flex items-center gap-3 p-4 hover:bg-white/2 text-left">
                    <div className="w-2 h-2 rounded-full flex-shrink-0 animate-pulse"
                      style={{ background: SEVERITY_COLORS[inc.severity] }} />
                    <div className="flex-1">
                      <div className="font-bold text-sm">{inc.title}</div>
                      <div className="text-xs" style={{ color: T.textSub }}>
                        Iniciado {new Date(inc.started).toLocaleString("pt-BR")}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded-full capitalize"
                        style={{ background: SEVERITY_COLORS[inc.severity] + "15", color: SEVERITY_COLORS[inc.severity] }}>
                        {inc.severity}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: T.warning + "15", color: T.warning }}>
                        {inc.status === "monitoring" ? "Monitorando" : inc.status === "identified" ? "Identificado" : "Investigando"}
                      </span>
                      {isExpanded ? <ChevronUp size={14} style={{ color: T.textSub }} /> : <ChevronDown size={14} style={{ color: T.textSub }} />}
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="border-t p-4 space-y-3" style={{ borderColor: T.border }}>
                      {inc.updates.map((u, i) => (
                        <div key={i} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className="w-2 h-2 rounded-full mt-1 flex-shrink-0"
                              style={{ background: i === 0 ? SEVERITY_COLORS[inc.severity] : T.border }} />
                            {i < inc.updates.length - 1 && <div className="w-px flex-1 mt-1" style={{ background: T.border }} />}
                          </div>
                          <div className="pb-3">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-xs font-bold" style={{ color: T.textSub }}>{u.time}</span>
                              <span className="text-xs px-1.5 py-0.5 rounded-full"
                                style={{ background: T.panel, color: T.textSub }}>{u.status}</span>
                            </div>
                            <p className="text-sm">{u.msg}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="space-y-2">
          <h2 className="font-bold">Serviços</h2>
          {SERVICES.map(svc => {
            const cfg = STATUS_CONFIG[svc.status];
            const Icon = svc.icon;
            const StatusIcon = cfg.icon;
            const uptimeBars = buildUptimeBar(svc.uptime);
            return (
              <div key={svc.id} className="rounded-xl border p-4" style={{ background: T.card, borderColor: T.border }}>
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: cfg.bg }}>
                    <Icon size={14} style={{ color: cfg.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-sm">{svc.name}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded-full"
                        style={{ background: cfg.bg, color: cfg.color }}>
                        {cfg.label}
                      </span>
                    </div>
                    <div className="text-xs" style={{ color: T.textSub }}>{svc.desc}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-black" style={{ color: cfg.color }}>{svc.uptime.toFixed(2)}%</div>
                    <div className="text-xs" style={{ color: T.textSub }}>{svc.latency}ms</div>
                  </div>
                </div>
                <div>
                  <div className="flex gap-0.5">
                    {uptimeBars.map((b, i) => (
                      <div key={i} className="flex-1 h-5 rounded-sm"
                        style={{ background: b === "ok" ? T.success + "60" : b === "degraded" ? T.warning + "80" : T.danger + "80" }} />
                    ))}
                  </div>
                  <div className="flex justify-between mt-1 text-xs" style={{ color: T.textSub }}>
                    <span>90 dias atrás</span><span>Hoje</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-3">
          <h2 className="font-bold">Incidentes resolvidos</h2>
          {INCIDENTS.filter(i => i.status === "resolved").map(inc => {
            const isExpanded = expanded === inc.id;
            const duration = inc.resolved
              ? Math.round((new Date(inc.resolved).getTime() - new Date(inc.started).getTime()) / 60000)
              : null;
            return (
              <div key={inc.id} className="rounded-xl border overflow-hidden" style={{ background: T.card, borderColor: T.border }}>
                <button onClick={() => setExpanded(isExpanded ? null : inc.id)}
                  className="w-full flex items-center gap-3 p-4 hover:bg-white/2 text-left">
                  <CheckCircle size={14} style={{ color: T.success }} className="flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{inc.title}</div>
                    <div className="text-xs" style={{ color: T.textSub }}>
                      {new Date(inc.started).toLocaleDateString("pt-BR")} · resolvido em {duration}min
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp size={14} style={{ color: T.textSub }} /> : <ChevronDown size={14} style={{ color: T.textSub }} />}
                </button>
                {isExpanded && (
                  <div className="border-t p-4 space-y-2" style={{ borderColor: T.border }}>
                    {inc.updates.map((u, i) => (
                      <div key={i} className="flex gap-2 text-sm">
                        <span className="text-xs font-bold w-12 flex-shrink-0" style={{ color: T.textSub }}>{u.time}</span>
                        <span style={{ color: T.textSub }}>{u.msg}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="rounded-2xl border p-5" style={{ background: T.card, borderColor: T.border }}>
          <h3 className="font-bold mb-4">SLA dos últimos 90 dias</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "API Principal",      sla: "99.97%",  color: T.success },
              { label: "Player Network",      sla: "99.84%",  color: T.success },
              { label: "ProofChain Engine",   sla: "100.00%", color: T.success },
              { label: "Blockchain Relay",    sla: "98.12%",  color: T.warning },
            ].map((s, i) => (
              <div key={i} className="flex justify-between items-center p-3 rounded-xl" style={{ background: T.panel }}>
                <span className="text-xs" style={{ color: T.textSub }}>{s.label}</span>
                <span className="font-black text-sm" style={{ color: s.color }}>{s.sla}</span>
              </div>
            ))}
          </div>
          <p className="text-xs mt-3 text-center" style={{ color: T.textSub }}>
            Compromisso contratual: 99.5% · <span style={{ color: T.success }}>✓ Dentro do SLA</span>
          </p>
        </div>
      </div>
    </div>
  );
}
