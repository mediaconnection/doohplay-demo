import { useState, useEffect } from "react";
import { ArrowLeft, Bell, CheckCircle, AlertTriangle, DollarSign, Tv, Shield, Zap, Megaphone, TrendingUp, X, Filter, RefreshCw } from "lucide-react";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280",
};

type NType = "revenue" | "proof" | "campaign" | "screen" | "system" | "alert";

interface Notification {
  id: string;
  type: NType;
  title: string;
  body: string;
  time: string;
  read: boolean;
  value?: string;
}

const TYPE_META: Record<NType, { icon: typeof Bell; color: string; bg: string }> = {
  revenue:  { icon: DollarSign, color: T.success,  bg: T.success + "15" },
  proof:    { icon: Shield,     color: T.success,  bg: T.success + "12" },
  campaign: { icon: Megaphone,  color: T.primary,  bg: T.primary + "15" },
  screen:   { icon: Tv,         color: T.accent,   bg: T.accent + "15" },
  system:   { icon: Zap,        color: T.warning,  bg: T.warning + "15" },
  alert:    { icon: AlertTriangle, color: T.danger, bg: T.danger + "15" },
};

function msAgo(ms: number) {
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s atrás`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}min atrás`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h atrás`;
  return `${Math.floor(h / 24)}d atrás`;
}

function seed(): Notification[] {
  const now = Date.now();
  return [
    { id: "n1",  type: "revenue",  title: "Nova receita recebida",   body: "R$12,40 creditados — campanha Auto Finance · CPM R$42,00",           time: msAgo(240000),   read: false, value: "+R$12,40" },
    { id: "n2",  type: "proof",    title: "Lote de provas emitido",   body: "180 exibições verificadas nas últimas 2h · score 100/100",            time: msAgo(900000),   read: false },
    { id: "n3",  type: "campaign", title: "Nova campanha na sua tela", body: "Black Friday Eletrônicos (TechStore) começa agora em 22 telas",     time: msAgo(1800000),  read: false },
    { id: "n4",  type: "revenue",  title: "Meta diária atingida!",    body: "Você superou R$120/dia hoje. Receita mensal projetada: R$3.600",     time: msAgo(3600000),  read: true,  value: "R$120/dia" },
    { id: "n5",  type: "screen",   title: "Tela reconectada",         body: "SCR-A3F7K2 voltou online após 4min de queda · tudo normal",          time: msAgo(5400000),  read: true },
    { id: "n6",  type: "system",   title: "Atualização disponível",   body: "DOOHPLAY Player v0.7.2 disponível · melhorias de desempenho",        time: msAgo(10800000), read: true },
    { id: "n7",  type: "campaign", title: "Campanha encerrada",       body: "Promoção Verão 2026 (Moda & Estilo) finalizou · 89.400 impressões",  time: msAgo(18000000), read: true },
    { id: "n8",  type: "revenue",  title: "Pagamento processado",     body: "R$487,60 transferidos para sua conta · referente a Junho/2026",      time: msAgo(86400000), read: true,  value: "R$487,60" },
    { id: "n9",  type: "proof",    title: "Auditoria concluída",      body: "Relatório mensal de Proof-of-Play gerado · 4.320 provas · PDF pronto",time: msAgo(172800000),read: true },
    { id: "n10", type: "alert",    title: "Limite de IA próximo",     body: "Você usou 27/30 gerações de IA este mês · upgrade para continuar",   time: msAgo(259200000),read: true },
  ];
}

function newLiveNotification(i: number): Notification {
  const opts: Notification[] = [
    { id: `live-${i}-a`, type: "revenue",  title: "Receita recebida",       body: `R${(Math.random() * 15 + 5).toFixed(2)} · campanha ativa`,     time: "agora",    read: false, value: `+R$${(Math.random() * 15 + 5).toFixed(2)}` },
    { id: `live-${i}-b`, type: "proof",    title: "Prova emitida",           body: "POP-" + Math.random().toString(36).slice(2, 10).toUpperCase() + " · score 100", time: "agora", read: false },
    { id: `live-${i}-c`, type: "campaign", title: "Anúncio exibido",         body: "Black Friday Eletrônicos · 15s · SCR-A3F7K2",                  time: "agora",    read: false },
  ];
  return opts[i % opts.length];
}

interface Props { onBack: () => void; }

export default function NotificationsCenter({ onBack }: Props) {
  const [items, setItems] = useState<Notification[]>(seed);
  const [filter, setFilter] = useState<"all" | NType>("all");
  const [liveOn, setLiveOn] = useState(true);
  const [liveCount, setLiveCount] = useState(0);

  useEffect(() => {
    if (!liveOn) return;
    const iv = setInterval(() => {
      setLiveCount(c => {
        const n = newLiveNotification(c);
        setItems(prev => [n, ...prev.slice(0, 49)]);
        return c + 1;
      });
    }, 5000);
    return () => clearInterval(iv);
  }, [liveOn]);

  const markAllRead = () => setItems(prev => prev.map(n => ({ ...n, read: true })));
  const dismiss = (id: string) => setItems(prev => prev.filter(n => n.id !== id));
  const markRead = (id: string) => setItems(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  const unread = items.filter(n => !n.read).length;
  const filtered = filter === "all" ? items : items.filter(n => n.type === filter);

  const FILTERS: { id: "all" | NType; label: string }[] = [
    { id: "all",      label: "Todas" },
    { id: "revenue",  label: "Receita" },
    { id: "proof",    label: "Provas" },
    { id: "campaign", label: "Campanhas" },
    { id: "screen",   label: "Telas" },
    { id: "alert",    label: "Alertas" },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
            <ArrowLeft size={18} style={{ color: T.textSub }} />
          </button>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bell size={22} style={{ color: T.text }} />
              {unread > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-black"
                  style={{ background: T.danger, color: "#fff" }}>
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </div>
            <div>
              <h1 className="font-black">Notificações</h1>
              <p className="text-xs" style={{ color: T.textSub }}>{unread} não lidas</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => setLiveOn(l => !l)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
              style={{ background: liveOn ? T.success + "15" : T.panel, color: liveOn ? T.success : T.textSub, border: `1px solid ${liveOn ? T.success + "30" : T.border}` }}>
              <div className={`w-1.5 h-1.5 rounded-full ${liveOn ? "animate-pulse" : ""}`} style={{ background: liveOn ? T.success : T.textSub }} />
              {liveOn ? "Ao vivo" : "Pausado"}
            </button>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-xs px-3 py-1.5 rounded-lg" style={{ color: T.primary }}>
                Marcar tudo lido
              </button>
            )}
          </div>
        </div>

        {/* Filter pills */}
        <div className="max-w-2xl mx-auto px-6 pb-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {FILTERS.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 transition-all"
              style={{ background: filter === f.id ? T.primary : T.panel, color: filter === f.id ? "#fff" : T.textSub, border: `1px solid ${filter === f.id ? T.primary : T.border}` }}>
              {f.label}
              {f.id !== "all" && items.filter(n => n.type === f.id && !n.read).length > 0 && (
                <span className="ml-1.5 px-1.5 rounded-full text-xs font-black"
                  style={{ background: filter === f.id ? "rgba(255,255,255,0.3)" : T.primary, color: filter === f.id ? "#fff" : "#fff" }}>
                  {items.filter(n => n.type === f.id && !n.read).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <div className="border-b" style={{ borderColor: T.border, background: T.panel }}>
        <div className="max-w-2xl mx-auto px-6 py-3 flex items-center gap-6 overflow-x-auto">
          {[
            { label: "Receita hoje", value: "R$487,60", color: T.success },
            { label: "Provas emitidas", value: "1.284", color: T.primary },
            { label: "Campanhas ativas", value: "3", color: T.accent },
            { label: "Uptime", value: "99,8%", color: T.warning },
          ].map((s, i) => (
            <div key={i} className="text-center flex-shrink-0">
              <div className="text-lg font-black" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs whitespace-nowrap" style={{ color: T.textSub }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Notifications list */}
      <div className="flex-1 max-w-2xl mx-auto w-full px-6 py-4 space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-16" style={{ color: T.textSub }}>
            <Bell size={40} className="mx-auto mb-3 opacity-20" />
            <p>Nenhuma notificação nesta categoria.</p>
          </div>
        ) : (
          filtered.map((n, i) => {
            const meta = TYPE_META[n.type];
            const Icon = meta.icon;
            return (
              <div key={n.id}
                onClick={() => !n.read && markRead(n.id)}
                className="group flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all hover:border-opacity-60"
                style={{
                  background: !n.read ? meta.bg : T.card,
                  borderColor: !n.read ? meta.color + "30" : T.border,
                }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: meta.bg, border: `1.5px solid ${meta.color}30` }}>
                  <Icon size={18} style={{ color: meta.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-0.5">
                    <div className="font-bold text-sm flex items-center gap-2">
                      {n.title}
                      {!n.read && <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: meta.color }} />}
                    </div>
                    {n.value && (
                      <span className="text-sm font-black flex-shrink-0" style={{ color: meta.color }}>{n.value}</span>
                    )}
                  </div>
                  <p className="text-sm leading-snug" style={{ color: T.textSub }}>{n.body}</p>
                  <div className="text-xs mt-1.5" style={{ color: T.textSub }}>{n.time}</div>
                </div>
                <button onClick={e => { e.stopPropagation(); dismiss(n.id); }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-lg transition-all flex-shrink-0"
                  style={{ color: T.textSub }}>
                  <X size={14} />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* WhatsApp CTA */}
      <div className="max-w-2xl mx-auto w-full px-6 pb-8">
        <div className="rounded-2xl border p-5 flex items-center gap-4" style={{ background: T.card, borderColor: "#25D366" + "25" }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#25D366" + "20" }}>
            <span className="text-xl">📱</span>
          </div>
          <div className="flex-1">
            <div className="font-bold text-sm mb-0.5">Receber pelo WhatsApp</div>
            <div className="text-xs" style={{ color: T.textSub }}>Ative alertas de receita, provas e tela offline direto no seu WhatsApp.</div>
          </div>
          <button className="px-4 py-2 rounded-xl text-xs font-bold flex-shrink-0" style={{ background: "#25D366", color: "#fff" }}>
            Ativar
          </button>
        </div>
      </div>
    </div>
  );
}
