import { useState } from "react";
import {
  ArrowLeft, Bell, CheckCheck, Filter, Settings, Trash2,
  AlertTriangle, CheckCircle, Info, Zap, TrendingUp,
  Shield, DollarSign, Monitor, RefreshCw, Plus, X, Clock,
  Activity, Globe
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

interface Props { onBack: () => void; onNavigate?: (v: string) => void; }
type TabId = "inbox" | "webhooks" | "preferences";

type NotifLevel = "critical" | "warning" | "info" | "success";
type NotifCategory = "campaign" | "fraud" | "billing" | "system" | "optimization" | "screen";

interface Notification {
  id: string;
  title: string;
  body: string;
  level: NotifLevel;
  category: NotifCategory;
  time: string;
  read: boolean;
  actionLabel?: string;
  actionView?: string;
}

const NOTIFICATIONS: Notification[] = [
  { id: "N001", title: "Fraude detectada — Av. Paulista",   body: "Loop bot bloqueado. 91.200 impressões inválidas canceladas. Impacto: R$3.840.",   level: "critical",  category: "fraud",        time: "2 min atrás",    read: false, actionLabel: "Ver Fraudes",      actionView: "fraud-detection"       },
  { id: "N002", title: "Campanha iFood superou meta CTR",   body: "CTR atual 6.1% — 22% acima da meta de 5.0%. Otimizador sugere novo criativo.",     level: "success",   category: "optimization", time: "18 min atrás",   read: false, actionLabel: "Otimizar",         actionView: "campaign-optimizer"    },
  { id: "N003", title: "Budget Bradesco Q3 — 25% utilizado",body: "R$31.200 de R$120.000. Campanha no ritmo. Início em 01/08.",                       level: "info",      category: "campaign",     time: "1h atrás",       read: false, actionLabel: "Ver Campanha",     actionView: "campaigns"             },
  { id: "N004", title: "Tela Rodoviária Novo Rio offline",  body: "Sinal de heartbeat perdido há 42 minutos. Verificação técnica recomendada.",       level: "warning",   category: "screen",       time: "42 min atrás",   read: false, actionLabel: "Publisher Portal", actionView: "publisher-portal"      },
  { id: "N005", title: "Fatura #INV-0078 disponível",       body: "Valor: R$23.480 — vencimento 05/08/2025. Pague via PIX para desconto de 2%.",      level: "info",      category: "billing",      time: "3h atrás",       read: true,  actionLabel: "Ver Fatura",       actionView: "billing-center"        },
  { id: "N006", title: "ProofChain batch consolidado",      body: "4.218.400 impressões registradas na blockchain Polygon. Hash: 0x3f9a…c14b.",       level: "success",   category: "system",       time: "6h atrás",       read: true                                                                  },
  { id: "N007", title: "Sync HubSpot com falha",            body: "Token OAuth expirado. Reconecte o conector em Data Integration.",                  level: "warning",   category: "system",       time: "2h atrás",       read: false, actionLabel: "Reconectar",       actionView: "data-integration"      },
  { id: "N008", title: "A/B Test — Variante B venceu",      body: "Criativo 'Countdown Timer' (iFood) CTR 7.1% vs 5.9%. Ativar vencedor?",           level: "success",   category: "optimization", time: "Ontem 18:44",    read: true,  actionLabel: "Ativar",           actionView: "campaign-optimizer"    },
  { id: "N009", title: "Limite de taxa API atingido",       body: "Integração Google Ads: 95% da cota diária utilizada. Reset às 00:00.",             level: "warning",   category: "system",       time: "Ontem 14:22",    read: true                                                                  },
  { id: "N010", title: "Novo publisher cadastrado",         body: "'NordesteMídia' adicionou 3 telas no Recife. Avalie o inventário.",                level: "info",      category: "screen",       time: "Ontem 11:05",    read: true,  actionLabel: "Ver Marketplace",  actionView: "marketplace-screen"    },
];

const LEVEL_META: Record<NotifLevel, { color: string; icon: any; bg: string }> = {
  critical: { color: T.danger,  icon: AlertTriangle, bg: T.danger  + "15" },
  warning:  { color: T.warning, icon: AlertTriangle, bg: T.warning + "15" },
  info:     { color: T.primary, icon: Info,          bg: T.primary + "15" },
  success:  { color: T.success, icon: CheckCircle,   bg: T.success + "15" },
};

const CAT_META: Record<NotifCategory, { label: string; color: string }> = {
  campaign:     { label: "Campanha",    color: T.primary  },
  fraud:        { label: "Fraude",      color: T.danger   },
  billing:      { label: "Financeiro",  color: T.gold     },
  system:       { label: "Sistema",     color: T.textSub  },
  optimization: { label: "Otimização",  color: T.accent   },
  screen:       { label: "Telas",       color: T.success  },
};

const NOTIF_VOLUME = [
  { h: "00h", count: 2  }, { h: "04h", count: 1  }, { h: "08h", count: 8  },
  { h: "10h", count: 14 }, { h: "12h", count: 11 }, { h: "14h", count: 18 },
  { h: "16h", count: 22 }, { h: "18h", count: 16 }, { h: "20h", count: 9  }, { h: "22h", count: 5  },
];

const BY_CAT = [
  { cat: "Campanha",   count: 28, color: T.primary },
  { cat: "Fraude",     count: 12, color: T.danger  },
  { cat: "Sistema",    count: 21, color: T.textSub },
  { cat: "Otimização", count: 18, color: T.accent  },
  { cat: "Telas",      count: 9,  color: T.success },
  { cat: "Financeiro", count: 6,  color: T.gold    },
];

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  status: "active" | "failing" | "paused";
  lastCall: string;
  successRate: number;
}

const WEBHOOKS: Webhook[] = [
  { id: "WH001", name: "Slack — #alertas-dooh",       url: "https://hooks.slack.com/services/T0…",       events: ["fraud.detected","campaign.alert"],       status: "active",  lastCall: "2 min",   successRate: 100 },
  { id: "WH002", name: "Zapier — CRM Sync",            url: "https://hooks.zapier.com/hooks/catch/1…",    events: ["lead.captured","conversion.tracked"],    status: "active",  lastCall: "18 min",  successRate: 98  },
  { id: "WH003", name: "PagerDuty — Incidentes",       url: "https://events.pagerduty.com/v2/enqueue",    events: ["screen.offline","fraud.critical"],       status: "failing", lastCall: "2h atrás",successRate: 41  },
  { id: "WH004", name: "Custom — Dashboard TV",        url: "https://dashboard.empresa.com/webhook",      events: ["campaign.impression","campaign.stats"],  status: "paused",  lastCall: "3d atrás",successRate: 99  },
];

const WH_STATUS_META = {
  active:  { label: "Ativo",    color: T.success },
  failing: { label: "Falhando", color: T.danger  },
  paused:  { label: "Pausado",  color: T.warning },
};

const PREF_CATEGORIES = [
  { cat: "Campanha",    key: "campaign",     defaultOn: true  },
  { cat: "Fraude",      key: "fraud",        defaultOn: true  },
  { cat: "Financeiro",  key: "billing",      defaultOn: true  },
  { cat: "Telas",       key: "screen",       defaultOn: true  },
  { cat: "Otimização",  key: "optimization", defaultOn: true  },
  { cat: "Sistema",     key: "system",       defaultOn: false },
];

export default function NotificationCenter({ onBack, onNavigate }: Props) {
  const [tab, setTab]         = useState<TabId>("inbox");
  const [catFilter, setCatFilter] = useState("all");
  const [readFilter, setReadFilter] = useState<"all" | "unread">("all");
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [prefs, setPrefs]     = useState<Record<string, boolean>>({ campaign: true, fraud: true, billing: true, screen: true, optimization: true, system: false });

  const markAllRead  = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const markRead     = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const deleteNotif  = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id));

  const unreadCount  = notifications.filter(n => !n.read).length;
  const criticalCount = notifications.filter(n => n.level === "critical" && !n.read).length;

  const filtered = notifications.filter(n =>
    (catFilter === "all" || n.category === catFilter) &&
    (readFilter === "all" || !n.read)
  );

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
              <div className="relative">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.warning + "20" }}>
                  <Bell size={18} style={{ color: T.warning }} />
                </div>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs font-black flex items-center justify-center"
                    style={{ background: T.danger, color: "#fff", fontSize: 9 }}>{unreadCount}</span>
                )}
              </div>
              <div>
                <h1 className="font-black text-lg">Notification Center</h1>
                <p className="text-xs" style={{ color: T.textSub }}>Central de alertas, webhooks e preferências de notificação</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold"
                style={{ background: T.panel, color: T.textSub, border: `1px solid ${T.border}` }}>
                <CheckCheck size={13} /> Marcar todas lidas
              </button>
            )}
            {(["inbox","webhooks","preferences"] as TabId[]).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
                style={{ background: tab === t ? T.warning + "20" : "transparent", color: tab === t ? T.warning : T.textSub, border: `1px solid ${tab === t ? T.warning + "30" : "transparent"}` }}>
                {t === "inbox" ? "Inbox" : t === "webhooks" ? "Webhooks" : "Preferências"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Não lidas",      value: unreadCount,   color: unreadCount > 0 ? T.warning : T.success, icon: Bell          },
            { label: "Críticas",       value: criticalCount, color: criticalCount > 0 ? T.danger : T.success, icon: AlertTriangle },
            { label: "Total (30d)",    value: 94,            color: T.primary, icon: Activity },
            { label: "Webhooks Ativos",value: WEBHOOKS.filter(w => w.status === "active").length, color: T.accent, icon: Globe },
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

        {/* INBOX TAB */}
        {tab === "inbox" && (
          <div className="flex gap-6">
            <div className="flex-1 space-y-3">
              {/* Filters */}
              <div className="flex items-center gap-2 flex-wrap">
                <button onClick={() => setReadFilter(readFilter === "unread" ? "all" : "unread")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                  style={{ background: readFilter === "unread" ? T.warning + "20" : T.panel, color: readFilter === "unread" ? T.warning : T.textSub, border: `1px solid ${readFilter === "unread" ? T.warning + "40" : T.border}` }}>
                  <Bell size={11} /> Não lidas ({unreadCount})
                </button>
                <div className="w-px h-4" style={{ background: T.border }} />
                {["all", ...Object.keys(CAT_META)].map(cat => (
                  <button key={cat} onClick={() => setCatFilter(cat)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold"
                    style={{ background: catFilter === cat ? (CAT_META[cat as NotifCategory]?.color ?? T.primary) + "20" : T.panel, color: catFilter === cat ? (CAT_META[cat as NotifCategory]?.color ?? T.primary) : T.textSub, border: `1px solid ${catFilter === cat ? (CAT_META[cat as NotifCategory]?.color ?? T.primary) + "40" : T.border}` }}>
                    {cat === "all" ? "Todas" : CAT_META[cat as NotifCategory]?.label}
                  </button>
                ))}
              </div>

              {/* List */}
              <div className="space-y-2">
                {filtered.map(notif => {
                  const lm = LEVEL_META[notif.level];
                  const cm = CAT_META[notif.category];
                  const LevelIcon = lm.icon;
                  return (
                    <div key={notif.id} onClick={() => markRead(notif.id)}
                      className="p-4 rounded-2xl border cursor-pointer hover:bg-white/2 transition-all"
                      style={{ background: T.card, borderColor: notif.read ? T.border : lm.color + "30", opacity: notif.read ? 0.75 : 1 }}>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: lm.bg }}>
                          <LevelIcon size={14} style={{ color: lm.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            {!notif.read && <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: lm.color }} />}
                            <span className="font-black text-sm">{notif.title}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                              style={{ background: cm.color + "20", color: cm.color }}>{cm.label}</span>
                          </div>
                          <p className="text-xs mt-0.5" style={{ color: T.textSub }}>{notif.body}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs" style={{ color: T.textSub }}>{notif.time}</span>
                          {notif.actionLabel && onNavigate && (
                            <button onClick={e => { e.stopPropagation(); onNavigate(notif.actionView!); }}
                              className="px-2.5 py-1 rounded-lg text-xs font-black"
                              style={{ background: lm.color + "20", color: lm.color }}>
                              {notif.actionLabel}
                            </button>
                          )}
                          <button onClick={e => { e.stopPropagation(); deleteNotif(notif.id); }}
                            className="p-1.5 rounded-lg hover:bg-white/5">
                            <X size={11} style={{ color: T.textSub }} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {filtered.length === 0 && (
                  <div className="p-12 rounded-2xl border text-center" style={{ background: T.card, borderColor: T.border }}>
                    <CheckCheck size={32} className="mx-auto mb-3" style={{ color: T.success }} />
                    <div className="font-black" style={{ color: T.textSub }}>Tudo em dia!</div>
                  </div>
                )}
              </div>
            </div>

            {/* Volume chart */}
            <div className="w-52 flex-shrink-0 space-y-4">
              <div className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black text-sm mb-3">Volume por hora</h3>
                <ResponsiveContainer width="100%" height={130}>
                  <BarChart data={NOTIF_VOLUME} barSize={14}>
                    <XAxis dataKey="h" tick={{ fill: T.textSub, fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10 }}
                      formatter={(v: number) => [v, "Notificações"]} />
                    <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                      {NOTIF_VOLUME.map((_, i) => <Cell key={`cell-nv-${i}`} fill={T.warning} opacity={0.6 + i * 0.04} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black text-sm mb-3">Por categoria</h3>
                <div className="space-y-2">
                  {BY_CAT.map((c, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between text-xs mb-0.5">
                        <span style={{ color: T.textSub }}>{c.cat}</span>
                        <span className="font-bold" style={{ color: c.color }}>{c.count}</span>
                      </div>
                      <div className="h-1 rounded-full overflow-hidden" style={{ background: T.border }}>
                        <div className="h-full rounded-full" style={{ width: `${(c.count / 28) * 100}%`, background: c.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* WEBHOOKS TAB */}
        {tab === "webhooks" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-black">Webhooks</h2>
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black"
                style={{ background: T.primary, color: "#fff" }}>
                <Plus size={14} /> Novo Webhook
              </button>
            </div>
            <div className="space-y-3">
              {WEBHOOKS.map(wh => {
                const wsm = WH_STATUS_META[wh.status];
                return (
                  <div key={wh.id} className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: wsm.color + "20" }}>
                        <Globe size={14} style={{ color: wsm.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black">{wh.name}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                            style={{ background: wsm.color + "20", color: wsm.color }}>{wsm.label}</span>
                        </div>
                        <div className="font-mono text-xs mt-0.5 truncate" style={{ color: T.textSub }}>{wh.url}</div>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {wh.events.map(ev => (
                            <span key={ev} className="text-xs px-2 py-0.5 rounded font-bold"
                              style={{ background: T.primary + "15", color: T.primary }}>{ev}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0 text-sm">
                        <div className="text-right">
                          <div className="font-black" style={{ color: wh.successRate >= 95 ? T.success : T.danger }}>{wh.successRate}%</div>
                          <div className="text-xs" style={{ color: T.textSub }}>sucesso</div>
                        </div>
                        <div className="text-right">
                          <div className="font-black text-xs">{wh.lastCall}</div>
                          <div className="text-xs" style={{ color: T.textSub }}>último call</div>
                        </div>
                        <div className="flex gap-1.5">
                          <button className="p-2 rounded-lg hover:bg-white/5"><Settings size={12} style={{ color: T.textSub }} /></button>
                          <button className="p-2 rounded-lg hover:bg-white/5"><RefreshCw size={12} style={{ color: T.primary }} /></button>
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

        {/* PREFERENCES TAB */}
        {tab === "preferences" && (
          <div className="grid grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-black mb-4">Categorias de Alertas</h3>
              <div className="space-y-3">
                {PREF_CATEGORIES.map(p => (
                  <div key={p.key} className="flex items-center justify-between p-3 rounded-xl"
                    style={{ background: T.panel }}>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full" style={{ background: CAT_META[p.key as NotifCategory]?.color ?? T.textSub }} />
                      <span className="font-bold text-sm">{p.cat}</span>
                    </div>
                    <button onClick={() => setPrefs(prev => ({ ...prev, [p.key]: !prev[p.key] }))}
                      className="relative w-10 h-5 rounded-full transition-all"
                      style={{ background: prefs[p.key] ? T.success : T.border }}>
                      <div className="absolute top-0.5 w-4 h-4 rounded-full transition-all"
                        style={{ background: "#fff", left: prefs[p.key] ? "calc(100% - 1.25rem)" : "0.125rem" }} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black mb-4">Canais de Entrega</h3>
                <div className="space-y-3">
                  {[
                    { label: "Email",      sub: "joao@empresa.com",        active: true  },
                    { label: "WhatsApp",   sub: "+55 11 9 8765-4321",      active: true  },
                    { label: "Push App",   sub: "Android / iOS",           active: false },
                    { label: "Slack",      sub: "#alertas-dooh",           active: true  },
                    { label: "SMS",        sub: "+55 11 9 8765-4321",      active: false },
                  ].map((ch, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl" style={{ background: T.panel }}>
                      <div>
                        <div className="font-bold text-sm">{ch.label}</div>
                        <div className="text-xs" style={{ color: T.textSub }}>{ch.sub}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold" style={{ color: ch.active ? T.success : T.textSub }}>
                          {ch.active ? "Ativo" : "Inativo"}
                        </span>
                        <button className="text-xs px-2.5 py-1 rounded-lg font-bold"
                          style={{ background: T.primary + "20", color: T.primary }}>Configurar</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl border flex items-start gap-3"
                style={{ background: T.success + "08", borderColor: T.success + "25" }}>
                <CheckCircle size={14} style={{ color: T.success }} className="mt-0.5 flex-shrink-0" />
                <p className="text-xs" style={{ color: T.success }}>
                  Alertas críticos de fraude e telas offline chegam <strong>sempre</strong> pelo WhatsApp, independente das preferências.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
