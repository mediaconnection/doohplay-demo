import { useState } from "react";
import {
  ArrowLeft, Bell, BellOff, CheckCircle, AlertTriangle, AlertCircle,
  Info, Filter, Search, Trash2, Check, X, Monitor, Zap, DollarSign,
  Shield, RefreshCw, Clock, ChevronRight, Volume2
} from "lucide-react";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

interface Props { onBack: () => void; onNavigate?: (v: string) => void; }

type AlertSeverity = "critical" | "warning" | "info" | "success";
type AlertCategory = "screen" | "campaign" | "billing" | "security" | "system";

interface Alert {
  id: string; title: string; message: string; severity: AlertSeverity;
  category: AlertCategory; timestamp: string; read: boolean;
  location?: string; action?: string; actionView?: string;
}

const SEV_COLOR: Record<AlertSeverity, string> = {
  critical: T.danger, warning: T.warning, info: T.primary, success: T.success,
};
const SEV_ICON: Record<AlertSeverity, any> = {
  critical: AlertCircle, warning: AlertTriangle, info: Info, success: CheckCircle,
};
const SEV_LABEL: Record<AlertSeverity, string> = {
  critical: "Crítico", warning: "Atenção", info: "Informação", success: "Sucesso",
};
const CAT_ICON: Record<AlertCategory, any> = {
  screen: Monitor, campaign: Zap, billing: DollarSign, security: Shield, system: RefreshCw,
};
const CAT_LABEL: Record<AlertCategory, string> = {
  screen: "Tela", campaign: "Campanha", billing: "Cobrança", security: "Segurança", system: "Sistema",
};

const INITIAL_ALERTS: Alert[] = [
  { id: "a1",  title: "Tela offline: Metro Paulista L01",  message: "A tela não responde há 12 minutos. Última heartbeat às 09:43.", severity: "critical", category: "screen",   timestamp: "23/07 10:05", read: false, location: "Metro Paulista", action: "Ver Tela", actionView: "live-monitor" },
  { id: "a2",  title: "Limite de budget atingido",         message: "Campanha iFood OOH atingiu 95% do orçamento mensal (R$180.000).", severity: "warning",  category: "campaign",  timestamp: "23/07 09:50", read: false, action: "Ver Campanha", actionView: "campaign-manager" },
  { id: "a3",  title: "Pagamento confirmado",              message: "Fatura #FAT-2024 de R$620,00 recebida via PIX. Plano Enterprise ativo.", severity: "success",  category: "billing",   timestamp: "23/07 09:30", read: false },
  { id: "a4",  title: "Temperatura elevada: Shopping IB",  message: "CPU da tela 3 acima de 78°C. Verificar ventilação do gabinete.", severity: "warning",  category: "screen",   timestamp: "23/07 08:12", read: true,  location: "Shopping Ibirapuera", action: "Ver Tela", actionView: "live-monitor" },
  { id: "a5",  title: "Login suspeito detectado",          message: "Tentativa de login de IP 179.221.14.88 (Rússia). Bloqueado por MFA.", severity: "critical", category: "security", timestamp: "23/07 07:58", read: false, action: "Ver Segurança", actionView: "system-settings" },
  { id: "a6",  title: "ProofChain: hash verificado",       message: "12.400 registros de exibição validados no Polygon. Bloco #9.204.811.", severity: "success",  category: "system",   timestamp: "22/07 23:00", read: true },
  { id: "a7",  title: "Nova campanha aprovada",            message: "Campanha 'Ambev Verão' aprovada pela IA e agendada para veiculção amanhã.", severity: "info",     category: "campaign",  timestamp: "22/07 18:40", read: true,  action: "Ver Campanha", actionView: "campaign-planner" },
  { id: "a8",  title: "Certificado SSL expirado em 7 dias",message: "Renovar o certificado TLS do endpoint api.doohplay.com.br até 30/07.", severity: "warning",  category: "system",   timestamp: "22/07 16:00", read: true,  action: "Configurações", actionView: "system-settings" },
  { id: "a9",  title: "Novo parceiro cadastrado",          message: "Mariana Pires (Recife) completou o onboarding. Tier Bronze ativado.", severity: "info",     category: "billing",   timestamp: "22/07 14:22", read: true,  action: "Ver Parceiros", actionView: "partner-earnings" },
  { id: "a10", title: "Fill rate abaixo do esperado",      message: "Tela Av. Paulista 1000 com fill rate de 61% nas últimas 4h. Revisar floor CPM.", severity: "warning",  category: "campaign",  timestamp: "22/07 12:00", read: true,  action: "Programático", actionView: "programmatic-buying" },
  { id: "a11", title: "Atualização do sistema disponível", message: "DOOHPLAY v4.8.0 disponível. Inclui melhorias de desempenho e novos relatórios.", severity: "info",     category: "system",   timestamp: "22/07 10:00", read: true },
  { id: "a12", title: "Contrato vencendo em 30 dias",      message: "Contrato CTR-2024-0012 (Ambev) vence em 31/07/2026. Renovação recomendada.", severity: "warning",  category: "billing",   timestamp: "21/07 09:00", read: true,  action: "Ver Contrato", actionView: "contract-manager" },
];

function timeAgo(ts: string): string {
  const parts = ts.split(" ");
  if (parts[0] === "23/07") return `hoje às ${parts[1]}`;
  if (parts[0] === "22/07") return `ontem às ${parts[1]}`;
  return ts;
}

export default function AlertCenter({ onBack, onNavigate }: Props) {
  const [alerts, setAlerts]         = useState<Alert[]>(INITIAL_ALERTS);
  const [search, setSearch]         = useState("");
  const [sevFilter, setSevFilter]   = useState<AlertSeverity | "all">("all");
  const [catFilter, setCatFilter]   = useState<AlertCategory | "all">("all");
  const [showUnread, setShowUnread] = useState(false);
  const [muted, setMuted]           = useState(false);
  const [selected, setSelected]     = useState<Alert | null>(null);

  const unreadCount = alerts.filter(a => !a.read).length;
  const filtered = alerts.filter(a => {
    if (showUnread && a.read) return false;
    if (sevFilter !== "all" && a.severity !== sevFilter) return false;
    if (catFilter !== "all" && a.category !== catFilter) return false;
    if (search && !a.title.toLowerCase().includes(search.toLowerCase()) && !a.message.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  function markRead(id: string) { setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a)); }
  function markAllRead() { setAlerts(prev => prev.map(a => ({ ...a, read: true }))); }
  function dismissAlert(id: string) { setAlerts(prev => prev.filter(a => a.id !== id)); if (selected?.id === id) setSelected(null); }

  const criticalCount = alerts.filter(a => a.severity === "critical" && !a.read).length;

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5"><ArrowLeft size={18} style={{ color: T.textSub }} /></button>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.danger + "20" }}>
                  <Bell size={18} style={{ color: T.danger }} />
                </div>
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-xs font-black" style={{ background: T.danger, color: "#fff" }}>{unreadCount}</div>
                )}
              </div>
              <div>
                <h1 className="font-black text-lg">Central de Alertas</h1>
                <p className="text-xs" style={{ color: T.textSub }}>
                  {unreadCount > 0 ? <span style={{ color: T.danger }}>{unreadCount} não lidos</span> : "Tudo em dia"}
                  {criticalCount > 0 && <span style={{ color: T.danger }}> · {criticalCount} crítico{criticalCount > 1 ? "s" : ""}</span>}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setMuted(!muted)} className="p-2 rounded-xl transition-all"
              style={{ background: muted ? T.warning + "15" : "transparent", color: muted ? T.warning : T.textSub, border: `1px solid ${muted ? T.warning + "30" : "transparent"}` }}>
              {muted ? <BellOff size={16} /> : <Volume2 size={16} />}
            </button>
            <button onClick={markAllRead} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold"
              style={{ background: T.card, color: T.textSub, border: `1px solid ${T.border}` }}>
              <Check size={13} /> Marcar todos como lidos
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 flex gap-6">
        <div className="flex-1 min-w-0 space-y-5">
          <div className="grid grid-cols-4 gap-4">
            {(["critical","warning","info","success"] as AlertSeverity[]).map(sev => {
              const count = alerts.filter(a => a.severity === sev).length;
              const unread = alerts.filter(a => a.severity === sev && !a.read).length;
              const Icon = SEV_ICON[sev];
              return (
                <button key={sev} onClick={() => setSevFilter(sevFilter === sev ? "all" : sev)}
                  className="p-4 rounded-2xl border text-left transition-all"
                  style={{ background: sevFilter === sev ? SEV_COLOR[sev] + "15" : T.card, borderColor: sevFilter === sev ? SEV_COLOR[sev] + "40" : T.border }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: SEV_COLOR[sev] + "20" }}><Icon size={15} style={{ color: SEV_COLOR[sev] }} /></div>
                    {unread > 0 && <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-black" style={{ background: SEV_COLOR[sev], color: sev === "warning" ? "#000" : "#fff" }}>{unread}</div>}
                  </div>
                  <div className="font-black text-2xl" style={{ color: SEV_COLOR[sev] }}>{count}</div>
                  <div className="text-xs mt-0.5" style={{ color: T.textSub }}>{SEV_LABEL[sev]}</div>
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-44">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: T.textSub }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar alertas..." className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm" style={{ background: T.card, border: `1px solid ${T.border}`, color: T.text }} />
            </div>
            <div className="flex items-center gap-1.5">
              {(["all","screen","campaign","billing","security","system"] as const).map(cat => {
                const Icon = cat === "all" ? Filter : CAT_ICON[cat];
                return (
                  <button key={cat} onClick={() => setCatFilter(cat as any)}
                    className="flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-bold transition-all"
                    style={{ background: catFilter === cat ? T.primary + "20" : T.card, color: catFilter === cat ? T.primary : T.textSub, border: `1px solid ${catFilter === cat ? T.primary + "30" : T.border}` }}>
                    <Icon size={11} />{cat === "all" ? "Todos" : CAT_LABEL[cat]}
                  </button>
                );
              })}
            </div>
            <button onClick={() => setShowUnread(!showUnread)} className="px-3 py-2 rounded-xl text-xs font-bold transition-all"
              style={{ background: showUnread ? T.warning + "20" : T.card, color: showUnread ? T.warning : T.textSub, border: `1px solid ${showUnread ? T.warning + "30" : T.border}` }}>Não lidos</button>
          </div>
          <div className="space-y-2">
            {filtered.length === 0 && <div className="text-center py-12" style={{ color: T.textSub }}><Bell size={32} className="mx-auto mb-3 opacity-30" /><div className="font-bold">Nenhum alerta encontrado</div></div>}
            {filtered.map(alert => {
              const SevIcon = SEV_ICON[alert.severity];
              const CatIcon = CAT_ICON[alert.category];
              const isSelected = selected?.id === alert.id;
              return (
                <div key={alert.id} onClick={() => { setSelected(isSelected ? null : alert); if (!alert.read) markRead(alert.id); }}
                  className="p-4 rounded-2xl border cursor-pointer transition-all hover:border-opacity-80"
                  style={{ background: T.card, borderColor: isSelected ? SEV_COLOR[alert.severity] : alert.read ? T.border : SEV_COLOR[alert.severity] + "30", opacity: alert.read ? 0.75 : 1, borderLeft: `3px solid ${SEV_COLOR[alert.severity]}` }}>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: SEV_COLOR[alert.severity] + "20" }}><SevIcon size={15} style={{ color: SEV_COLOR[alert.severity] }} /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="font-black text-sm">{alert.title}</span>
                        {!alert.read && <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: SEV_COLOR[alert.severity] }} />}
                        <span className="px-1.5 py-0.5 rounded text-xs font-bold flex items-center gap-1" style={{ background: T.panel, color: T.textSub }}><CatIcon size={9} />{CAT_LABEL[alert.category]}</span>
                      </div>
                      <p className="text-xs mb-1.5" style={{ color: T.textSub }}>{alert.message}</p>
                      <div className="flex items-center gap-3">
                        <span className="text-xs flex items-center gap-1" style={{ color: T.textSub }}><Clock size={9} />{timeAgo(alert.timestamp)}</span>
                        {alert.location && <span className="text-xs" style={{ color: T.textSub }}>· {alert.location}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {alert.action && alert.actionView && (
                        <button onClick={e => { e.stopPropagation(); onNavigate?.(alert.actionView!); }}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold"
                          style={{ background: SEV_COLOR[alert.severity] + "15", color: SEV_COLOR[alert.severity] }}>
                          {alert.action} <ChevronRight size={10} />
                        </button>
                      )}
                      <button onClick={e => { e.stopPropagation(); dismissAlert(alert.id); }} className="p-1.5 rounded-lg hover:bg-white/5"><X size={13} style={{ color: T.textSub }} /></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="w-72 flex-shrink-0 space-y-4">
          <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
            <h3 className="font-black text-sm mb-4">Configurar Notificações</h3>
            {[
              { label: "Tela offline",        desc: "Avisar quando tela ficar offline",  on: true },
              { label: "Budget atingido",      desc: "Aviso ao atingir 90% do orçamento", on: true },
              { label: "Segurança",            desc: "Login suspeito e acessos negados",  on: true },
              { label: "Pagamentos",           desc: "Confirmação e falhas de cobrança",  on: true },
              { label: "Contratos vencendo",   desc: "Aviso 30 dias antes do vencimento", on: true },
              { label: "Atualizações",         desc: "Novas versões disponíveis",         on: false },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b last:border-0" style={{ borderColor: T.border + "60" }}>
                <div>
                  <div className="text-xs font-bold">{item.label}</div>
                  <div className="text-xs mt-0.5" style={{ color: T.textSub }}>{item.desc}</div>
                </div>
                <button className="relative w-9 h-5 rounded-full flex-shrink-0 ml-3 transition-all" style={{ background: item.on ? T.success : T.border }}>
                  <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all" style={{ left: item.on ? "calc(100% - 18px)" : "2px" }} />
                </button>
              </div>
            ))}
          </div>
          <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
            <h3 className="font-black text-sm mb-4">Canais de Entrega</h3>
            {[
              { channel: "WhatsApp", desc: "+55 11 9•••• ••••", active: true, color: T.success },
              { channel: "E-mail",   desc: "ops@doohplay.com.br", active: true, color: T.primary },
              { channel: "Push App", desc: "Android DOOHPLAY v0.7.1", active: false, color: T.accent },
              { channel: "Webhook",  desc: "api.meuapp.com/hooks", active: true, color: T.gold },
            ].map((c, i) => (
              <div key={i} className="flex items-center gap-2.5 py-2.5 border-b last:border-0" style={{ borderColor: T.border + "60" }}>
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c.active ? c.color : T.textSub }} />
                <div className="flex-1 min-w-0"><div className="text-xs font-bold">{c.channel}</div><div className="text-xs truncate" style={{ color: T.textSub }}>{c.desc}</div></div>
                <span className="text-xs font-bold" style={{ color: c.active ? c.color : T.textSub }}>{c.active ? "Ativo" : "Off"}</span>
              </div>
            ))}
          </div>
          {criticalCount > 0 && (
            <div className="p-4 rounded-2xl border" style={{ background: T.danger + "10", borderColor: T.danger + "30" }}>
              <div className="flex items-center gap-2 mb-2"><AlertCircle size={15} style={{ color: T.danger }} /><span className="text-sm font-black" style={{ color: T.danger }}>{criticalCount} alerta{criticalCount > 1 ? "s" : ""} crítico{criticalCount > 1 ? "s" : ""}</span></div>
              <p className="text-xs" style={{ color: T.textSub }}>Ação imediata recomendada. Verifique telas offline e atividade de segurança.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
