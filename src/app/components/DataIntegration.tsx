import { useState } from "react";
import {
  ArrowLeft, Database, CheckCircle, AlertTriangle, XCircle,
  RefreshCw, Plus, Settings, Zap, Activity, Clock,
  ArrowRight, Play, Pause, Trash2, Eye, Download, Filter
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

interface Props { onBack: () => void; onNavigate?: (v: string) => void; }
type TabId = "connectors" | "pipelines" | "logs";

type ConnStatus = "connected" | "error" | "disconnected" | "syncing";

interface Connector {
  id: string;
  name: string;
  category: string;
  logo: string;
  status: ConnStatus;
  lastSync: string;
  recordsIn: number;
  recordsOut: number;
  description: string;
}

const CONNECTORS: Connector[] = [
  { id: "C001", name: "Google Analytics 4",  category: "Analytics",  logo: "GA4",  status: "connected",    lastSync: "2 min",   recordsIn: 284000, recordsOut: 12400, description: "Eventos, sessões, conversões e audiências GA4 sincronizados em tempo real" },
  { id: "C002", name: "Meta Ads",            category: "Mídia",      logo: "META", status: "connected",    lastSync: "5 min",   recordsIn: 142000, recordsOut: 8200,  description: "Campanhas, adsets, criativos e públicos personalizados do Meta Business" },
  { id: "C003", name: "Google Ads",          category: "Mídia",      logo: "GAds", status: "syncing",      lastSync: "Agora",   recordsIn: 0,      recordsOut: 5400,  description: "Keywords, campanhas display e conversões offline para match DOOH" },
  { id: "C004", name: "Salesforce CRM",      category: "CRM",        logo: "SF",   status: "connected",    lastSync: "12 min",  recordsIn: 38400,  recordsOut: 2100,  description: "Leads, oportunidades e contas para enriquecer segmentos de audiência" },
  { id: "C005", name: "HubSpot",             category: "CRM",        logo: "HS",   status: "error",        lastSync: "2h atrás",recordsIn: 0,      recordsOut: 0,     description: "Contatos, deals e propriedades de formulário para automação de público" },
  { id: "C006", name: "Segment CDP",         category: "CDP",        logo: "SEG",  status: "connected",    lastSync: "30 seg",  recordsIn: 920000, recordsOut: 41000, description: "Eventos de usuário e perfis unificados para personalizaçāo avançada" },
  { id: "C007", name: "TikTok Ads",          category: "Mídia",      logo: "TT",   status: "disconnected", lastSync: "–",       recordsIn: 0,      recordsOut: 0,     description: "Audiências e conversões TikTok For Business — instale para ativar" },
  { id: "C008", name: "BigQuery",            category: "Data Warehouse",logo:"BQ", status: "connected",    lastSync: "1h",      recordsIn: 4200000,recordsOut: 184000,description: "Export de impressões, cliques e conversões brutas para análise avançada" },
];

const STATUS_META: Record<ConnStatus, { label: string; color: string; icon: any }> = {
  connected:    { label: "Conectado",    color: T.success, icon: CheckCircle  },
  error:        { label: "Erro",         color: T.danger,  icon: XCircle      },
  disconnected: { label: "Desconectado", color: T.textSub, icon: XCircle      },
  syncing:      { label: "Sincronizando",color: T.primary, icon: RefreshCw    },
};

const CAT_COLOR: Record<string, string> = {
  Analytics: T.primary, Mídia: T.accent, CRM: T.success, CDP: T.gold, "Data Warehouse": T.warning,
};

interface Pipeline {
  id: string;
  name: string;
  source: string;
  destination: string;
  trigger: string;
  status: "active" | "paused" | "error";
  lastRun: string;
  totalRuns: number;
  avgDuration: string;
}

const PIPELINES: Pipeline[] = [
  { id: "P001", name: "GA4 → Audiências DOOH",     source: "Google Analytics 4", destination: "AudiencePlanner", trigger: "A cada 15 min", status: "active", lastRun: "3 min",   totalRuns: 4820, avgDuration: "1.2s" },
  { id: "P002", name: "Meta → Retargeting Engine", source: "Meta Ads",           destination: "RetargetingEngine",trigger: "A cada 1h",     status: "active", lastRun: "42 min",  totalRuns: 1241, avgDuration: "4.8s" },
  { id: "P003", name: "Segment → DMP Segmentos",   source: "Segment CDP",        destination: "AudiencePlanner", trigger: "Em tempo real",  status: "active", lastRun: "28 seg",  totalRuns: 18400,avgDuration: "0.3s" },
  { id: "P004", name: "CRM → Budget Automático",   source: "Salesforce CRM",     destination: "AdScheduler",    trigger: "Ao criar deal",  status: "paused", lastRun: "2h",      totalRuns: 312,  avgDuration: "2.1s" },
  { id: "P005", name: "DOOH Events → BigQuery",    source: "DOOHPLAY",           destination: "BigQuery",        trigger: "A cada 5 min",   status: "active", lastRun: "2 min",   totalRuns: 31200,avgDuration: "8.4s" },
  { id: "P006", name: "HubSpot → LeadCapture",     source: "HubSpot",            destination: "LeadCapture",     trigger: "Ao capturar lead",status:"error",  lastRun: "2h atrás",totalRuns: 148,  avgDuration: "–"    },
];

const PIPE_STATUS_META = {
  active: { label: "Ativo",    color: T.success },
  paused: { label: "Pausado",  color: T.warning  },
  error:  { label: "Erro",     color: T.danger   },
};

const SYNC_TREND = [
  { t: "00h", records: 8400   }, { t: "04h", records: 3200   }, { t: "08h", records: 24100  },
  { t: "10h", records: 48200  }, { t: "12h", records: 62000  }, { t: "14h", records: 54800  },
  { t: "16h", records: 71200  }, { t: "18h", records: 89400  }, { t: "20h", records: 64100  },
  { t: "22h", records: 31200  },
];

const LOG_ENTRIES = [
  { time: "14:52:01", level: "INFO",  connector: "Segment CDP",         msg: "Sync OK — 2.841 registros processados",         duration: "0.3s"  },
  { time: "14:51:18", level: "INFO",  connector: "Google Analytics 4",  msg: "Audiência 'Jovens Conectados' atualizada: +348", duration: "1.1s"  },
  { time: "14:48:05", level: "WARN",  connector: "Google Ads",          msg: "Rate limit atingido — retry em 30s",            duration: "–"     },
  { time: "14:45:22", level: "INFO",  connector: "DOOHPLAY → BigQuery", msg: "Export batch: 14.200 eventos de impressão",     duration: "8.2s"  },
  { time: "14:40:11", level: "ERROR", connector: "HubSpot",             msg: "Token de autenticação expirado — reconfigure",  duration: "–"     },
  { time: "14:38:44", level: "INFO",  connector: "Meta Ads",            msg: "Público custom enviado: 8.412 usuários",        duration: "4.8s"  },
  { time: "14:35:09", level: "INFO",  connector: "Salesforce CRM",      msg: "38 novos leads importados para segmentação",    duration: "2.1s"  },
];

const LOG_COLOR: Record<string, string> = { INFO: T.success, WARN: T.warning, ERROR: T.danger };

export default function DataIntegration({ onBack }: Props) {
  const [tab, setTab] = useState<TabId>("connectors");
  const [catFilter, setCatFilter] = useState("Todos");
  const [logFilter, setLogFilter] = useState("Todos");

  const connectedCount = CONNECTORS.filter(c => c.status === "connected" || c.status === "syncing").length;
  const totalRecordsIn = CONNECTORS.reduce((s, c) => s + c.recordsIn, 0);
  const errorCount     = CONNECTORS.filter(c => c.status === "error").length;
  const activePipes    = PIPELINES.filter(p => p.status === "active").length;

  const cats = ["Todos", ...Array.from(new Set(CONNECTORS.map(c => c.category)))];
  const filteredConns = CONNECTORS.filter(c => catFilter === "Todos" || c.category === catFilter);
  const filteredLogs  = LOG_ENTRIES.filter(l => logFilter === "Todos" || l.level === logFilter);

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
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.primary + "20" }}>
                <Database size={18} style={{ color: T.primary }} />
              </div>
              <div>
                <h1 className="font-black text-lg">Data Integration</h1>
                <p className="text-xs" style={{ color: T.textSub }}>Conecte GA4, Meta Ads, CRM, CDP e data warehouses à plataforma DOOH</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {(["connectors","pipelines","logs"] as TabId[]).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
                style={{ background: tab === t ? T.primary + "20" : "transparent", color: tab === t ? T.primary : T.textSub, border: `1px solid ${tab === t ? T.primary + "30" : "transparent"}` }}>
                {t === "connectors" ? "Conectores" : t === "pipelines" ? "Pipelines" : "Logs"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Conectores Ativos",      value: `${connectedCount}/${CONNECTORS.length}`, color: T.success, icon: CheckCircle },
            { label: "Registros/dia",           value: `${(totalRecordsIn/1000000).toFixed(1)}M`, color: T.primary, icon: Activity   },
            { label: "Pipelines Ativos",        value: activePipes,                              color: T.accent,  icon: Zap        },
            { label: "Erros de Sync",           value: errorCount,                               color: errorCount > 0 ? T.danger : T.success, icon: AlertTriangle },
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

        {/* CONNECTORS TAB */}
        {tab === "connectors" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                {cats.map(cat => (
                  <button key={cat} onClick={() => setCatFilter(cat)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold"
                    style={{ background: catFilter === cat ? T.primary + "20" : T.panel, color: catFilter === cat ? T.primary : T.textSub, border: `1px solid ${catFilter === cat ? T.primary + "40" : T.border}` }}>
                    {cat}
                  </button>
                ))}
              </div>
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black"
                style={{ background: T.primary, color: "#fff" }}>
                <Plus size={14} /> Novo Conector
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {filteredConns.map(conn => {
                const sm = STATUS_META[conn.status];
                const catCol = CAT_COLOR[conn.category] ?? T.textSub;
                const StatusIcon = sm.icon;
                return (
                  <div key={conn.id} className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-xs"
                        style={{ background: catCol + "20", color: catCol }}>{conn.logo}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm">{conn.name}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                            style={{ background: sm.color + "20", color: sm.color }}>
                            {sm.label}
                          </span>
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: T.textSub }}>
                          {conn.category} · Último sync: {conn.lastSync}
                        </div>
                        <p className="text-xs mt-1.5" style={{ color: T.textSub }}>{conn.description}</p>
                        {conn.status !== "disconnected" && (
                          <div className="flex items-center gap-4 mt-2 text-xs">
                            <span style={{ color: T.success }}>↓ {(conn.recordsIn/1000).toFixed(0)}k registros</span>
                            <span style={{ color: T.primary }}>↑ {(conn.recordsOut/1000).toFixed(0)}k saídas</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-1.5 flex-shrink-0">
                        {conn.status === "disconnected" ? (
                          <button className="px-3 py-1.5 rounded-lg text-xs font-black"
                            style={{ background: T.primary, color: "#fff" }}>Conectar</button>
                        ) : (
                          <>
                            <button className="p-2 rounded-lg hover:bg-white/5"><Settings size={12} style={{ color: T.textSub }} /></button>
                            <button className="p-2 rounded-lg hover:bg-white/5"><RefreshCw size={12} style={{ color: T.primary }} /></button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PIPELINES TAB */}
        {tab === "pipelines" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-black">Pipelines de Dados</h2>
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black"
                style={{ background: T.accent, color: "#fff" }}>
                <Plus size={14} /> Novo Pipeline
              </button>
            </div>

            {/* Sync trend chart */}
            <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-black mb-3 text-sm">Registros Processados — Hoje</h3>
              <ResponsiveContainer width="100%" height={120}>
                <AreaChart data={SYNC_TREND}>
                  <defs>
                    <linearGradient key="grad-sync" id="grad-sync" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={T.primary} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={T.primary} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="t" tick={{ fill: T.textSub, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10 }}
                    formatter={(v: number) => [v.toLocaleString("pt-BR"), "Registros"]} />
                  <Area key="area-sync" type="monotone" dataKey="records" stroke={T.primary} strokeWidth={2} fill="url(#grad-sync)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2">
              {PIPELINES.map(pipe => {
                const pm = PIPE_STATUS_META[pipe.status];
                return (
                  <div key={pipe.id} className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: pm.color + "20" }}>
                        <Zap size={14} style={{ color: pm.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black text-sm">{pipe.name}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                            style={{ background: pm.color + "20", color: pm.color }}>{pm.label}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-xs" style={{ color: T.textSub }}>
                          <span style={{ color: T.primary }}>{pipe.source}</span>
                          <ArrowRight size={10} />
                          <span style={{ color: T.success }}>{pipe.destination}</span>
                          <span>·</span>
                          <Clock size={9} />
                          <span>{pipe.trigger}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0 text-xs">
                        <div className="text-right">
                          <div className="font-black">{pipe.totalRuns.toLocaleString("pt-BR")}</div>
                          <div style={{ color: T.textSub }}>execuções</div>
                        </div>
                        <div className="text-right">
                          <div className="font-black">{pipe.avgDuration}</div>
                          <div style={{ color: T.textSub }}>duração</div>
                        </div>
                        <div className="text-right">
                          <div className="font-black">{pipe.lastRun}</div>
                          <div style={{ color: T.textSub }}>último run</div>
                        </div>
                        <div className="flex gap-1.5">
                          <button className="p-2 rounded-lg hover:bg-white/5">
                            {pipe.status === "active" ? <Pause size={12} style={{ color: T.warning }} /> : <Play size={12} style={{ color: T.success }} />}
                          </button>
                          <button className="p-2 rounded-lg hover:bg-white/5"><Trash2 size={12} style={{ color: T.danger }} /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* LOGS TAB */}
        {tab === "logs" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter size={14} style={{ color: T.textSub }} />
                {["Todos","INFO","WARN","ERROR"].map(f => (
                  <button key={f} onClick={() => setLogFilter(f)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold"
                    style={{ background: logFilter === f ? (LOG_COLOR[f] ?? T.primary) + "20" : T.panel, color: logFilter === f ? (LOG_COLOR[f] ?? T.primary) : T.textSub, border: `1px solid ${logFilter === f ? (LOG_COLOR[f] ?? T.primary) + "40" : T.border}` }}>
                    {f}
                  </button>
                ))}
              </div>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                style={{ background: T.panel, color: T.textSub, border: `1px solid ${T.border}` }}>
                <Download size={11} /> Exportar Logs
              </button>
            </div>

            <div className="rounded-2xl border overflow-hidden" style={{ background: T.card, borderColor: T.border }}>
              <div className="grid grid-cols-4 gap-4 px-4 py-3 text-xs font-black border-b"
                style={{ color: T.textSub, borderColor: T.border }}>
                <span>HORA</span><span>NÍVEL</span><span>CONECTOR</span><span>MENSAGEM</span>
              </div>
              {filteredLogs.map((log, i) => (
                <div key={i} className="grid grid-cols-4 gap-4 px-4 py-3 items-center text-sm border-b hover:bg-white/2"
                  style={{ borderColor: T.border }}>
                  <span className="font-mono text-xs" style={{ color: T.textSub }}>{log.time}</span>
                  <span className="text-xs font-black px-2 py-0.5 rounded w-fit"
                    style={{ background: (LOG_COLOR[log.level] ?? T.textSub) + "20", color: LOG_COLOR[log.level] ?? T.textSub }}>{log.level}</span>
                  <span className="text-xs font-bold" style={{ color: T.primary }}>{log.connector}</span>
                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: T.text }}>{log.msg}</span>
                    {log.duration !== "–" && (
                      <span className="text-xs ml-2 flex-shrink-0" style={{ color: T.textSub }}>{log.duration}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
