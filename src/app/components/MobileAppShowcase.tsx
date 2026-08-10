import { useState } from "react";
import {
  ArrowLeft, Smartphone, Play, ChevronLeft, ChevronRight,
  Tv, BarChart2, Bell, Settings, Plus, Check, Zap, Activity
} from "lucide-react";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

interface Props { onBack: () => void; onNavigate?: (v: string) => void; }

type AppScreen = "splash" | "home" | "campaigns" | "screens" | "analytics" | "notifications";

const APP_SCREENS: { id: AppScreen; label: string; icon: React.ElementType }[] = [
  { id: "splash",        label: "Splash",    icon: Zap        },
  { id: "home",          label: "Home",      icon: Activity   },
  { id: "campaigns",     label: "Campanhas", icon: Play       },
  { id: "screens",       label: "Telas",     icon: Tv         },
  { id: "analytics",     label: "Analytics", icon: BarChart2  },
  { id: "notifications", label: "Alertas",   icon: Bell       },
];

function PhoneFrame({ children, color = T.primary }: { children: React.ReactNode; color?: string }) {
  return (
    <div className="relative mx-auto" style={{ width: 280 }}>
      <div className="rounded-[2.8rem] overflow-hidden border-[10px] shadow-2xl" style={{ borderColor: "#1a1a2e", background: T.bg, boxShadow: `0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px #2a2a4a` }}>
        <div className="flex justify-center pt-2 pb-1" style={{ background: T.bg }}>
          <div className="w-24 h-5 rounded-full" style={{ background: "#0d0d1a" }}>
            <div className="flex items-center justify-center h-full gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: "#1a1a3a" }} />
              <div className="w-8 h-1.5 rounded-full" style={{ background: "#1a1a3a" }} />
            </div>
          </div>
        </div>
        <div style={{ height: 560, overflow: "hidden" }}>{children}</div>
        <div className="flex justify-center py-3" style={{ background: T.bg }}>
          <div className="w-28 h-1 rounded-full" style={{ background: "#2a2a4a" }} />
        </div>
      </div>
    </div>
  );
}

function SplashScreen() {
  return (
    <div className="h-full flex flex-col items-center justify-center" style={{ background: `linear-gradient(160deg, #05060E 0%, #0a0c25 100%)` }}>
      <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5" style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}>
        <Tv size={36} style={{ color: "#fff" }} />
      </div>
      <div className="font-black text-2xl" style={{ color: T.text }}>DOOHPLAY</div>
      <div className="text-xs mt-1" style={{ color: T.textSub }}>v0.7.1</div>
      <div className="mt-12 w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: T.primary, borderTopColor: "transparent" }} />
    </div>
  );
}

function HomeScreen() {
  return (
    <div className="h-full flex flex-col" style={{ background: T.bg }}>
      <div className="flex justify-between px-4 pt-2 pb-1 text-xs" style={{ color: T.textSub }}><span>9:41</span><span>5G</span></div>
      <div className="px-4 py-3 flex items-center justify-between">
        <div><div className="text-xs" style={{ color: T.textSub }}>Bom dia, Ana</div><div className="font-black text-base" style={{ color: T.text }}>Dashboard</div></div>
        <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm" style={{ background: T.primary + "30", color: T.primary }}>AL</div>
      </div>
      <div className="px-3 grid grid-cols-2 gap-2 mb-3">
        {[
          { label: "Impressoes hoje", value: "2.4M",  color: T.primary },
          { label: "Receita hoje",    value: "R$18k", color: T.gold    },
          { label: "Telas ativas",   value: "1.247",  color: T.success },
          { label: "CTR medio",      value: "4.8%",   color: T.accent  },
        ].map((k, i) => (
          <div key={i} className="p-3 rounded-2xl" style={{ background: T.card }}>
            <div className="font-black text-lg" style={{ color: k.color }}>{k.value}</div>
            <div className="text-xs" style={{ color: T.textSub }}>{k.label}</div>
          </div>
        ))}
      </div>
      <div className="mt-auto px-2 py-2 flex items-center justify-around border-t" style={{ borderColor: T.border }}>
        {[{ icon: Activity, label: "Home", active: true }, { icon: Play, label: "Camps.", active: false }, { icon: Tv, label: "Telas", active: false }, { icon: BarChart2, label: "Stats", active: false }].map(({ icon: Icon, label, active }) => (
          <div key={label} className="flex flex-col items-center gap-0.5">
            <Icon size={18} style={{ color: active ? T.primary : T.textSub }} />
            <span style={{ fontSize: 9, color: active ? T.primary : T.textSub }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CampaignsScreen() {
  return (
    <div className="h-full flex flex-col" style={{ background: T.bg }}>
      <div className="flex justify-between px-4 pt-2 pb-1 text-xs" style={{ color: T.textSub }}><span>9:41</span><span>5G</span></div>
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="font-black text-base" style={{ color: T.text }}>Campanhas</div>
        <button className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: T.primary }}><Plus size={16} style={{ color: "#fff" }} /></button>
      </div>
      <div className="px-3 space-y-2 flex-1 overflow-hidden">
        {[
          { name: "Ambev Black Friday", status: "Ativa",    imp: "12.4M", ctr: "5.2%", color: T.success },
          { name: "iFood Janeiro",      status: "Pausada",  imp: "8.1M",  ctr: "4.1%", color: T.warning },
          { name: "Nubank Awareness",   status: "Ativa",    imp: "6.7M",  ctr: "4.8%", color: T.success },
        ].map((c, i) => (
          <div key={i} className="p-3 rounded-2xl" style={{ background: T.card }}>
            <div className="flex items-center justify-between mb-1">
              <div className="font-bold text-sm" style={{ color: T.text }}>{c.name}</div>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: c.color + "20", color: c.color }}>{c.status}</span>
            </div>
            <div className="flex gap-3 text-xs" style={{ color: T.textSub }}><span>{c.imp} imp.</span><span>CTR {c.ctr}</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnalyticsScreen() {
  return (
    <div className="h-full flex flex-col" style={{ background: T.bg }}>
      <div className="flex justify-between px-4 pt-2 pb-1 text-xs" style={{ color: T.textSub }}><span>9:41</span><span>5G</span></div>
      <div className="px-4 py-3 font-black text-base" style={{ color: T.text }}>Analytics</div>
      <div className="px-3 space-y-3 flex-1 overflow-hidden">
        <div className="p-3 rounded-2xl" style={{ background: T.card }}>
          <div className="text-xs font-black mb-2" style={{ color: T.textSub }}>Impressoes por dia</div>
          <div className="flex items-end gap-1 h-20">
            {[40,62,45,80,58,92,76,88,64,95,72,100].map((h, i) => (
              <div key={i} className="flex-1 rounded-t" style={{ height: `${h * 0.78}px`, background: i >= 10 ? T.primary : T.primary + "40" }} />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Alcance",  value: "1.8M",  color: T.accent  },
            { label: "CTR",      value: "4.8%",  color: T.success },
            { label: "ROI",      value: "4.2x",  color: T.gold    },
            { label: "CPM",      value: "R$48",  color: T.primary },
          ].map((m, i) => (
            <div key={i} className="p-3 rounded-2xl" style={{ background: T.card }}>
              <div className="font-black text-lg" style={{ color: m.color }}>{m.value}</div>
              <div className="text-xs" style={{ color: T.textSub }}>{m.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function NotificationsScreen() {
  const items = [
    { icon: Check, color: T.success, title: "Tela reconectada", sub: "Terminal Tiete esta online", time: "2m" },
    { icon: Zap,   color: T.gold,    title: "Budget 80% gasto", sub: "Campanha Ambev",              time: "15m" },
    { icon: Bell,  color: T.warning, title: "Tela offline",     sub: "Av. Reboucas #12",            time: "2h"  },
  ];
  return (
    <div className="h-full flex flex-col" style={{ background: T.bg }}>
      <div className="flex justify-between px-4 pt-2 pb-1 text-xs" style={{ color: T.textSub }}><span>9:41</span><span>5G</span></div>
      <div className="px-4 py-3 font-black text-base" style={{ color: T.text }}>Notificacoes</div>
      <div className="px-3 space-y-2 flex-1 overflow-hidden">
        {items.map((n, i) => (
          <div key={i} className="flex items-start gap-3 p-3 rounded-2xl" style={{ background: T.card }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: n.color + "20" }}><n.icon size={14} style={{ color: n.color }} /></div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm" style={{ color: T.text }}>{n.title}</div>
              <div className="text-xs" style={{ color: T.textSub }}>{n.sub}</div>
            </div>
            <div className="text-xs flex-shrink-0" style={{ color: T.textSub }}>{n.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScreensScreen() {
  return (
    <div className="h-full flex flex-col" style={{ background: T.bg }}>
      <div className="flex justify-between px-4 pt-2 pb-1 text-xs" style={{ color: T.textSub }}><span>9:41</span><span>5G</span></div>
      <div className="px-4 py-3 font-black text-base" style={{ color: T.text }}>Minhas Telas</div>
      <div className="px-3 space-y-2 flex-1 overflow-hidden">
        {[
          { name: "Paulista #1374",  city: "SP", status: "online", imp: "48.2k" },
          { name: "Ibirapuera Mall", city: "SP", status: "online", imp: "22.1k" },
          { name: "Ipanema P.9",     city: "RJ", status: "online", imp: "41.5k" },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-2xl" style={{ background: T.card }}>
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: T.success }} />
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm truncate" style={{ color: T.text }}>{s.name}</div>
              <div className="text-xs" style={{ color: T.textSub }}>{s.city} - {s.status}</div>
            </div>
            <div className="text-xs font-bold" style={{ color: T.primary }}>{s.imp}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const SCREEN_COMPONENTS: Record<AppScreen, React.FC> = {
  splash: SplashScreen, home: HomeScreen, campaigns: CampaignsScreen,
  screens: ScreensScreen, analytics: AnalyticsScreen, notifications: NotificationsScreen,
};

export default function MobileAppShowcase({ onBack }: Props) {
  const [current, setCurrent] = useState<AppScreen>("home");
  const idx = APP_SCREENS.findIndex(s => s.id === current);
  const ScreenComp = SCREEN_COMPONENTS[current];

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5"><ArrowLeft size={18} style={{ color: T.textSub }} /></button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.primary + "20" }}><Smartphone size={18} style={{ color: T.primary }} /></div>
              <div><h1 className="font-black text-lg">DOOHPLAY Android</h1><p className="text-xs" style={{ color: T.textSub }}>App v0.7.1 - Preview interativo</p></div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {APP_SCREENS.map(s => (
              <button key={s.id} onClick={() => setCurrent(s.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all" style={{ background: current === s.id ? T.primary + "20" : "transparent", color: current === s.id ? T.primary : T.textSub }}>
                <s.icon size={11} />{s.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-2 gap-12 items-center">
        <div>
          <PhoneFrame><ScreenComp /></PhoneFrame>
          <div className="flex items-center justify-center gap-4 mt-6">
            <button onClick={() => idx > 0 && setCurrent(APP_SCREENS[idx - 1].id)} disabled={idx === 0} className="p-2 rounded-xl" style={{ opacity: idx === 0 ? 0.3 : 1, background: T.card, border: `1px solid ${T.border}` }}>
              <ChevronLeft size={16} style={{ color: T.textSub }} />
            </button>
            <span className="text-sm font-bold" style={{ color: T.textSub }}>{APP_SCREENS[idx].label}</span>
            <button onClick={() => idx < APP_SCREENS.length - 1 && setCurrent(APP_SCREENS[idx + 1].id)} disabled={idx === APP_SCREENS.length - 1} className="p-2 rounded-xl" style={{ opacity: idx === APP_SCREENS.length - 1 ? 0.3 : 1, background: T.card, border: `1px solid ${T.border}` }}>
              <ChevronRight size={16} style={{ color: T.textSub }} />
            </button>
          </div>
        </div>
        <div className="space-y-5">
          <div>
            <h2 className="font-black text-3xl mb-1" style={{ color: T.text }}>App nativo Android</h2>
            <p style={{ color: T.textSub }}>Gerencie campanhas, monitore telas em tempo real e acesse analytics de qualquer lugar.</p>
          </div>
          <div className="space-y-3">
            {[
              { icon: Zap,      color: T.primary, title: "Push notifications inteligentes", desc: "Alertas de tela offline, budget critico e CTR record em tempo real" },
              { icon: Check,    color: T.success, title: "Aprovacao de criativos no app",   desc: "Aprove ou rejeite criativos com 1 toque" },
              { icon: Activity, color: T.accent,  title: "Realtime metrics",               desc: "Impressoes ao vivo, atualizacao a cada 30 segundos" },
              { icon: Settings, color: T.gold,    title: "Gestao de telas",                desc: "Reinicialize players, altere playlists e veja status de saude" },
            ].map((f, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-2xl" style={{ background: T.card, border: `1px solid ${T.border}` }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: f.color + "20" }}><f.icon size={16} style={{ color: f.color }} /></div>
                <div><div className="font-black text-sm mb-0.5" style={{ color: T.text }}>{f.title}</div><div className="text-xs" style={{ color: T.textSub }}>{f.desc}</div></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
