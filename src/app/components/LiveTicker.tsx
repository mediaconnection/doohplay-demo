import { useState, useEffect, useRef } from "react";
import { Activity, TrendingUp, AlertTriangle, CheckCircle, Zap, Users, DollarSign, Tv } from "lucide-react";

const T = {
  panel: "#0A0C18", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82",
  warning: "#FFAA00", danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

type TickerEvent = {
  id: number;
  type: "impression" | "click" | "campaign" | "alert" | "revenue" | "screen" | "user";
  message: string;
  value?: string;
  color: string;
  icon: React.ElementType;
  time: string;
};

const EVENT_TEMPLATES = [
  { type: "impression" as const, icon: Tv,            color: T.primary, msgs: ["12.4k impressões · Shopping Morumbi","8.2k impressões · Paulista Ave","23.1k impressões · Congonhas","5.7k impressões · Itaim Bibi"] },
  { type: "revenue"    as const, icon: DollarSign,    color: T.gold,    msgs: ["Nova receita · Campanha Ambev +R$4.2k","Payout processado · Publisher SP +R$890","CPM otimizado · +12% receita estimada"] },
  { type: "campaign"   as const, icon: Zap,           color: T.accent,  msgs: ["Campanha Heineken ativada · 18 telas","A/B test iniciado · Criativo v2 vs v3","Campanha Nubank pausada por orçamento"] },
  { type: "click"      as const, icon: TrendingUp,    color: T.success, msgs: ["CTR 6.1% · acima da média +41%","Conversão record · Campanha iFood 8.3%","ROI 5.4x · Melhor campanha do mês"] },
  { type: "alert"      as const, icon: AlertTriangle, color: T.warning, msgs: ["Tela offline · Av. Rebouças #12","Criativo rejeitado · tamanho incompatível","Orçamento quase esgotado · Campanha XP"] },
  { type: "screen"     as const, icon: CheckCircle,   color: T.success, msgs: ["Tela reconectada · Terminal 2 GRU","Nova tela cadastrada · Shopping JK","Firmware atualizado · 34 dispositivos"] },
  { type: "user"       as const, icon: Users,         color: T.primary, msgs: ["Novo anunciante · Conta Enterprise","Login WhatsApp OTP · Agência DPZ","Plano Growth ativado · Nova conta"] },
];

function randomEvent(id: number): TickerEvent {
  const tmpl = EVENT_TEMPLATES[Math.floor(Math.random() * EVENT_TEMPLATES.length)];
  const msg   = tmpl.msgs[Math.floor(Math.random() * tmpl.msgs.length)];
  const now   = new Date();
  return {
    id, type: tmpl.type, message: msg,
    color: tmpl.color, icon: tmpl.icon,
    time: `${now.getHours().toString().padStart(2,"0")}:${now.getMinutes().toString().padStart(2,"0")}:${now.getSeconds().toString().padStart(2,"0")}`,
  };
}

export default function LiveTicker() {
  const [events, setEvents] = useState<TickerEvent[]>(() => Array.from({length: 8}, (_, i) => randomEvent(i)));
  const [paused, setPaused] = useState(false);
  const [newId, setNewId]   = useState<number | null>(null);
  const counter             = useRef(100);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      const ev = randomEvent(counter.current++);
      setNewId(ev.id);
      setEvents(prev => [ev, ...prev].slice(0, 20));
      setTimeout(() => setNewId(null), 600);
    }, 2800);
    return () => clearInterval(id);
  }, [paused]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 border-t"
      style={{ background: T.panel + "F0", borderColor: T.border, backdropFilter: "blur(12px)" }}>
      <div className="flex items-center h-8 overflow-hidden">
        {/* Label */}
        <div className="flex items-center gap-1.5 px-3 flex-shrink-0 border-r h-full"
          style={{ borderColor: T.border }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: T.success }} />
          <Activity size={10} style={{ color: T.success }} />
          <span className="text-xs font-black tracking-wider" style={{ color: T.success }}>LIVE</span>
        </div>

        {/* Scrolling events */}
        <div className="flex-1 overflow-hidden relative cursor-pointer"
          onClick={() => setPaused(p => !p)}>
          <div className="flex items-center gap-6 px-4 h-8 overflow-x-auto scrollbar-none"
            style={{ scrollbarWidth: "none" }}>
            {events.map(ev => (
              <div key={ev.id}
                className="flex items-center gap-1.5 flex-shrink-0 transition-all duration-300"
                style={{ opacity: newId === ev.id ? 1 : 0.75, transform: newId === ev.id ? "scale(1.02)" : "scale(1)" }}>
                <ev.icon size={10} style={{ color: ev.color }} />
                <span className="text-xs whitespace-nowrap" style={{ color: T.text }}>{ev.message}</span>
                <span className="text-xs font-mono" style={{ color: T.textSub }}>{ev.time}</span>
                <span className="text-xs" style={{ color: T.border }}>·</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pause indicator */}
        <div className="px-3 flex-shrink-0 border-l h-full flex items-center"
          style={{ borderColor: T.border }}>
          <span className="text-xs font-bold" style={{ color: T.textSub }}>
            {paused ? "⏸ pausado" : ""}
          </span>
        </div>
      </div>
    </div>
  );
}
