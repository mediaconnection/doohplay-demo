import { useState } from "react";
import { ArrowLeft, Home, Monitor, BarChart2, DollarSign, Bell, Play, Eye, TrendingUp, Zap, CheckCircle, Settings, Shield, RefreshCw, Wifi, WifiOff, AlertTriangle } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from "recharts";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

interface Props { onBack: () => void; onNavigate?: (v: string) => void; }

type MobileTab = "home" | "screens" | "stats" | "money" | "alerts";

const TREND = Array.from({ length: 7 }, (_, i) => ({
  d: ["Seg","Ter","Qua","Qui","Sex","Sab","Dom"][i],
  v: Math.floor(3200 + i * 180 + 1200),
}));

const SCREENS_DATA = [
  { id: 1, name: "Recepcao",    status: "online"  as const, viewers: 87,  content: "Happy Hour",  temp: 42 },
  { id: 2, name: "Sala Espera", status: "online"  as const, viewers: 54,  content: "Verao 2026",  temp: 39 },
  { id: 3, name: "Corredor",    status: "warning" as const, viewers: 31,  content: "Flash Sale",  temp: 58 },
  { id: 4, name: "Vitrine",     status: "offline" as const, viewers: 0,   content: "offline",     temp: 0  },
];

const ALERTS = [
  { id: 1, type: "warning", msg: "Tela Corredor com temperatura elevada (58 graus C)", time: "5min atras" },
  { id: 2, type: "success", msg: "Nova campanha aprovada: Flash Sale Fim de Semana",   time: "18min atras" },
  { id: 3, type: "info",    msg: "R$1.284 creditados - pagamento anunciante",          time: "2h atras" },
  { id: 4, type: "danger",  msg: "Tela Vitrine offline ha 4h",                         time: "4h atras" },
];

const statusColor = (s: "online"|"warning"|"offline") =>
  s === "online" ? T.success : s === "warning" ? T.warning : T.danger;

const tooltipStyle = { background: T.panel, border: `1px solid ${T.border}`, borderRadius: 12, color: T.text };

export default function MobileDashboard({ onBack, onNavigate }: Props) {
  const [tab, setTab] = useState<MobileTab>("home");
  const [dismissed, setDismissed] = useState<number[]>([]);

  const online  = SCREENS_DATA.filter(s => s.status === "online").length;
  const totalV  = SCREENS_DATA.filter(s => s.status === "online").reduce((a, s) => a + s.viewers, 0);
  const activeAlerts = ALERTS.filter(a => !dismissed.includes(a.id));

  const alertIcon = (type: string) =>
    type === "warning" ? <AlertTriangle size={14} style={{ color: T.warning }} /> :
    type === "success" ? <CheckCircle    size={14} style={{ color: T.success }} /> :
    type === "danger"  ? <WifiOff        size={14} style={{ color: T.danger  }} /> :
                         <Bell           size={14} style={{ color: T.primary }} />;

  return (
    <div className="min-h-screen flex items-center justify-center py-8" style={{ background: "#020308" }}>
      <div style={{ width: 390, minHeight: 844, position: "relative", fontFamily: "'Inter', sans-serif" }}>
        <div className="rounded-[44px] overflow-hidden border-4 shadow-2xl" style={{ borderColor: "#2a2a2a", boxShadow: "0 40px 80px rgba(0,0,0,0.8)" }}>
          <div className="flex items-center justify-between px-6 py-3" style={{ background: T.panel }}>
            <span className="text-xs font-bold" style={{ color: T.textSub }}>9:41</span>
            <div className="w-20 h-5 rounded-full" style={{ background: "#1a1a1a" }} />
            <div className="flex items-center gap-1"><Wifi size={12} style={{ color: T.textSub }} /><span className="text-xs font-bold" style={{ color: T.textSub }}>100%</span></div>
          </div>

          <div className="overflow-y-auto" style={{ background: T.bg, minHeight: 720, maxHeight: 720 }}>
            {tab === "home" && (
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div><p className="text-xs" style={{ color: T.textSub }}>Bom dia, Joao</p><h2 className="font-black text-xl">Sua rede hoje</h2></div>
                  <button onClick={onBack} className="p-2 rounded-xl" style={{ background: T.card }}><ArrowLeft size={16} style={{ color: T.textSub }} /></button>
                </div>
                <div className="p-5 rounded-3xl" style={{ background: `linear-gradient(135deg,${T.primary},${T.accent})` }}>
                  <div className="text-sm font-medium mb-1" style={{ color: "rgba(255,255,255,0.7)" }}>Receita hoje</div>
                  <div className="font-black text-4xl text-white mb-4">R$312</div>
                  <div className="flex items-center gap-1 mt-2" style={{ color: "rgba(255,255,255,0.8)" }}>
                    <TrendingUp size={12} /><span className="text-xs font-bold">+18% vs ontem</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Telas online",  value: `${online}/4`, color: T.success, icon: Monitor },
                    { label: "Viewers agora", value: totalV,        color: T.primary, icon: Eye },
                  ].map((s, i) => (
                    <div key={i} className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                      <div className="flex items-center gap-2 mb-2"><s.icon size={14} style={{ color: s.color }} /><span className="text-xs" style={{ color: T.textSub }}>{s.label}</span></div>
                      <div className="font-black text-2xl" style={{ color: s.color }}>{s.value}</div>
                    </div>
                  ))}
                </div>
                {activeAlerts.length > 0 && (
                  <div className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.warning + "30" }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold" style={{ color: T.warning }}>ALERTAS ({activeAlerts.length})</span>
                      <button onClick={() => setTab("alerts")} className="text-xs" style={{ color: T.primary }}>Ver todos</button>
                    </div>
                    <div className="flex items-start gap-2">{alertIcon(activeAlerts[0].type)}<span className="text-sm">{activeAlerts[0].msg}</span></div>
                  </div>
                )}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Monitor", icon: Monitor,  view: "live-monitor",    color: T.success },
                    { label: "Leilao",  icon: Zap,      view: "ad-auction",       color: T.gold },
                    { label: "Relatorio",icon: BarChart2,view: "revenue-report",  color: T.primary },
                  ].map((a, i) => (
                    <button key={i} onClick={() => onNavigate?.(a.view)} className="p-3 rounded-2xl border flex flex-col items-center gap-2" style={{ background: T.card, borderColor: T.border }}>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: a.color + "20" }}><a.icon size={16} style={{ color: a.color }} /></div>
                      <span className="text-xs font-bold" style={{ color: T.textSub }}>{a.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {tab === "screens" && (
              <div className="p-5 space-y-4">
                <h2 className="font-black text-xl">Minhas Telas</h2>
                {SCREENS_DATA.map(s => (
                  <div key={s.id} className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: statusColor(s.status) + "20" }}><Monitor size={16} style={{ color: statusColor(s.status) }} /></div>
                        <div><div className="font-bold">{s.name}</div><div className="text-xs" style={{ color: T.textSub }}>{s.content}</div></div>
                      </div>
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: statusColor(s.status) }} />
                    </div>
                    {s.status !== "offline" && (
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2 rounded-lg text-center" style={{ background: T.panel }}><div className="font-black text-lg" style={{ color: T.primary }}>{s.viewers}</div><div className="text-xs" style={{ color: T.textSub }}>viewers</div></div>
                        <div className="p-2 rounded-lg text-center" style={{ background: T.panel }}><div className="font-black text-lg" style={{ color: s.temp > 55 ? T.danger : T.success }}>{s.temp}C</div><div className="text-xs" style={{ color: T.textSub }}>temp</div></div>
                      </div>
                    )}
                    {s.status === "offline" && (
                      <div className="flex items-center gap-2 p-2 rounded-lg" style={{ background: T.danger + "10" }}><WifiOff size={12} style={{ color: T.danger }} /><span className="text-xs" style={{ color: T.danger }}>Tela offline</span></div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {tab === "stats" && (
              <div className="p-5 space-y-4">
                <h2 className="font-black text-xl">Estatisticas</h2>
                <div className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                  <div className="text-xs font-bold mb-3" style={{ color: T.textSub }}>RECEITA 7 DIAS (R$)</div>
                  <ResponsiveContainer width="100%" height={140}>
                    <AreaChart data={TREND}>
                      <defs><linearGradient id="mob-stats" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={T.primary} stopOpacity={0.35} /><stop offset="95%" stopColor={T.primary} stopOpacity={0} /></linearGradient></defs>
                      <XAxis dataKey="d" tick={{ fill: T.textSub, fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Area type="monotone" dataKey="v" stroke={T.primary} fill="url(#mob-stats)" strokeWidth={2} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                {[
                  { label: "Impressoes esta semana", value: "284.000", color: T.accent },
                  { label: "Fill rate medio",        value: "78%",     color: T.success },
                  { label: "CPM medio",              value: "R$42,80", color: T.gold },
                  { label: "ROI do plano",           value: "324%",    color: T.primary },
                ].map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                    <span className="text-sm" style={{ color: T.textSub }}>{s.label}</span>
                    <span className="font-black text-lg" style={{ color: s.color }}>{s.value}</span>
                  </div>
                ))}
              </div>
            )}

            {tab === "alerts" && (
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-black text-xl">Alertas</h2>
                  <button className="text-xs" style={{ color: T.primary }} onClick={() => setDismissed(ALERTS.map(a => a.id))}>Limpar tudo</button>
                </div>
                {ALERTS.map(a => !dismissed.includes(a.id) && (
                  <div key={a.id} className="p-4 rounded-2xl border flex items-start gap-3" style={{ background: T.card, borderColor: T.border }}>
                    {alertIcon(a.type)}
                    <div className="flex-1"><div className="text-sm">{a.msg}</div><div className="text-xs mt-0.5" style={{ color: T.textSub }}>{a.time}</div></div>
                    <button onClick={() => setDismissed(d => [...d, a.id])}><span className="text-xs" style={{ color: T.textSub }}>x</span></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center border-t py-2 px-4" style={{ background: T.panel, borderColor: T.border }}>
            {([
              { id: "home"    as MobileTab, icon: Home,      label: "Inicio" },
              { id: "screens" as MobileTab, icon: Monitor,   label: "Telas" },
              { id: "stats"   as MobileTab, icon: BarChart2, label: "Stats" },
              { id: "money"   as MobileTab, icon: DollarSign,label: "Receita" },
              { id: "alerts"  as MobileTab, icon: Bell,      label: "Alertas", badge: activeAlerts.length },
            ]).map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} className="flex-1 flex flex-col items-center gap-0.5 py-1 relative">
                {t.badge ? (
                  <div className="relative">
                    <t.icon size={20} style={{ color: tab === t.id ? T.primary : T.textSub }} />
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs font-black flex items-center justify-center" style={{ background: T.danger, color: "#fff", fontSize: 9 }}>{t.badge}</span>
                  </div>
                ) : <t.icon size={20} style={{ color: tab === t.id ? T.primary : T.textSub }} />}
                <span className="text-xs" style={{ color: tab === t.id ? T.primary : T.textSub }}>{t.label}</span>
              </button>
            ))}
          </div>

          <div className="flex justify-center py-2" style={{ background: T.panel }}>
            <div className="w-24 h-1 rounded-full" style={{ background: T.textSub + "60" }} />
          </div>
        </div>
        <div className="text-center mt-6"><span className="text-sm font-bold" style={{ color: T.textSub }}>DOOHPLAY Mobile</span></div>
      </div>
    </div>
  );
}
