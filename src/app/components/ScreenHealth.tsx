import { useState, useEffect } from "react";
import {
  ArrowLeft, Tv, Wifi, WifiOff, AlertTriangle, CheckCircle,
  RefreshCw, Thermometer, Clock, MapPin, Zap, Battery,
  TrendingUp, TrendingDown, Eye, Settings, Bell, Activity
} from "lucide-react";
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

type ScreenStatus = "online" | "warning" | "offline" | "updating";
interface HealthMetric {
  ts: string;
  cpu: number;
  mem: number;
  temp: number;
  latency: number;
}
interface Screen {
  id: string;
  name: string;
  location: string;
  status: ScreenStatus;
  uptime: number;
  fillRate: number;
  lastSeen: string;
  ip: string;
  firmware: string;
  cpu: number;
  mem: number;
  temp: number;
  latencyMs: number;
  totalImpressions: number;
  errors24h: number;
  history: HealthMetric[];
}

const mkHistory = (base: number, noise: number): HealthMetric[] =>
  Array.from({ length: 24 }, (_, i) => ({
    ts: `${String(i).padStart(2, "0")}:00`,
    cpu:  Math.min(99, Math.max(5, base + (Math.random() - 0.5) * noise)),
    mem:  Math.min(95, Math.max(20, 55 + (Math.random() - 0.5) * 20)),
    temp: Math.min(72, Math.max(28, 42 + (Math.random() - 0.5) * 14)),
    latency: Math.min(800, Math.max(12, 38 + (Math.random() - 0.5) * 40)),
  }));

const SCREENS: Screen[] = [
  { id: "s1", name: "Recepção Principal",   location: "São Paulo — Pinheiros",     status: "online",   uptime: 99.8, fillRate: 87, lastSeen: "agora",       ip: "192.168.1.101", firmware: "v0.7.1", cpu: 22, mem: 48, temp: 38, latencyMs: 28,  totalImpressions: 148420, errors24h: 0,  history: mkHistory(22, 18) },
  { id: "s2", name: "Vitrine Shopping",     location: "São Paulo — Moema",         status: "online",   uptime: 98.4, fillRate: 92, lastSeen: "2min atrás",  ip: "192.168.2.44",  firmware: "v0.7.1", cpu: 31, mem: 52, temp: 41, latencyMs: 35,  totalImpressions: 224810, errors24h: 1,  history: mkHistory(31, 22) },
  { id: "s3", name: "Salão de Espera",      location: "Campinas — Centro",         status: "warning",  uptime: 94.1, fillRate: 41, lastSeen: "8min atrás",  ip: "192.168.3.77",  firmware: "v0.6.9", cpu: 68, mem: 79, temp: 61, latencyMs: 340, totalImpressions: 89240,  errors24h: 14, history: mkHistory(68, 30) },
  { id: "s4", name: "Área de Checkout",     location: "Rio de Janeiro — Botafogo", status: "online",   uptime: 99.2, fillRate: 78, lastSeen: "agora",       ip: "10.0.1.18",     firmware: "v0.7.1", cpu: 18, mem: 44, temp: 36, latencyMs: 22,  totalImpressions: 312900, errors24h: 0,  history: mkHistory(18, 12) },
  { id: "s5", name: "Corredor B2",          location: "Curitiba — Água Verde",     status: "offline",  uptime: 71.3, fillRate: 0,  lastSeen: "3h atrás",    ip: "10.0.2.92",     firmware: "v0.6.8", cpu: 0,  mem: 0,  temp: 0,  latencyMs: 0,   totalImpressions: 44120,  errors24h: 38, history: mkHistory(50, 50) },
  { id: "s6", name: "Entrada Estacionam.",  location: "Belo Horizonte — Savassi",  status: "updating", uptime: 97.6, fillRate: 0,  lastSeen: "1min atrás",  ip: "172.16.0.33",   firmware: "v0.7.1", cpu: 45, mem: 61, temp: 44, latencyMs: 55,  totalImpressions: 98740,  errors24h: 2,  history: mkHistory(45, 20) },
];

const STATUS_CFG: Record<ScreenStatus, { label: string; color: string; bg: string; dot: string }> = {
  online:   { label: "Online",     color: T.success, bg: T.success + "15",  dot: T.success },
  warning:  { label: "Warning",    color: T.warning, bg: T.warning + "15",  dot: T.warning },
  offline:  { label: "Offline",    color: T.danger,  bg: T.danger  + "15",  dot: T.danger  },
  updating: { label: "Atualizando",color: T.primary, bg: T.primary + "15",  dot: T.primary },
};

function Gauge({ value, max, color, label }: { value: number; max: number; color: string; label: string }) {
  const pct = Math.min(100, (value / max) * 100);
  const r = 28, circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={72} height={72} viewBox="0 0 72 72">
        <circle cx={36} cy={36} r={r} fill="none" stroke={T.border} strokeWidth={5} />
        <circle cx={36} cy={36} r={r} fill="none" stroke={color} strokeWidth={5}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 36 36)"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
        <text x={36} y={40} textAnchor="middle" fontSize={14} fontWeight={700} fill={T.text}>{Math.round(value)}</text>
      </svg>
      <span className="text-xs" style={{ color: T.textSub }}>{label}</span>
    </div>
  );
}

export default function ScreenHealth({ onBack, onNavigate }: { onBack: () => void; onNavigate?: (v: string) => void }) {
  const [selected, setSelected] = useState<Screen | null>(null);
  const [tick, setTick] = useState(0);
  const [filter, setFilter] = useState<ScreenStatus | "all">("all");

  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 5000);
    return () => clearInterval(t);
  }, []);

  const counts = {
    online:   SCREENS.filter(s => s.status === "online").length,
    warning:  SCREENS.filter(s => s.status === "warning").length,
    offline:  SCREENS.filter(s => s.status === "offline").length,
    updating: SCREENS.filter(s => s.status === "updating").length,
  };

  const visible = filter === "all" ? SCREENS : SCREENS.filter(s => s.status === filter);

  if (selected) {
    const cfg = STATUS_CFG[selected.status];
    return (
      <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
        <div className="border-b px-6 py-4 flex items-center gap-4 sticky top-0 z-10" style={{ background: T.panel, borderColor: T.border }}>
          <button onClick={() => setSelected(null)} className="p-2 rounded-lg hover:bg-white/5">
            <ArrowLeft size={18} style={{ color: T.textSub }} />
          </button>
          <div>
            <h1 className="font-bold">{selected.name}</h1>
            <p className="text-xs flex items-center gap-1" style={{ color: T.textSub }}>
              <MapPin size={10} /> {selected.location}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: cfg.bg, color: cfg.color }}>
              {cfg.label}
            </span>
            <button onClick={() => onNavigate?.("player")} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold" style={{ background: T.primary + "20", color: T.primary }}>
              <Eye size={13} /> Player
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
          {/* Gauges */}
          <div className="p-6 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
            <h2 className="font-bold mb-5">Métricas em tempo real</h2>
            <div className="flex justify-around">
              <Gauge value={selected.cpu}  max={100} color={selected.cpu  > 80 ? T.danger : selected.cpu  > 60 ? T.warning : T.success} label="CPU %" />
              <Gauge value={selected.mem}  max={100} color={selected.mem  > 80 ? T.danger : selected.mem  > 60 ? T.warning : T.success} label="MEM %" />
              <Gauge value={selected.temp} max={80}  color={selected.temp > 65 ? T.danger : selected.temp > 50 ? T.warning : T.success} label="Temp °C" />
              <Gauge value={Math.min(selected.latencyMs, 500)} max={500} color={selected.latencyMs > 300 ? T.danger : selected.latencyMs > 100 ? T.warning : T.success} label="Latência ms" />
            </div>
          </div>

          {/* 24h history */}
          <div className="p-6 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
            <h2 className="font-bold mb-4">CPU — últimas 24h</h2>
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={selected.history}>
                <XAxis dataKey="ts" tick={{ fontSize: 9, fill: T.textSub }} axisLine={false} tickLine={false} interval={3} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: T.textSub }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 11 }}
                  formatter={(v: number) => [`${v.toFixed(0)}%`, "CPU"]} />
                <Line key="line-cpu" type="monotone" dataKey="cpu" stroke={T.primary} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Uptime",        value: `${selected.uptime}%`,                  color: selected.uptime > 95 ? T.success : T.warning },
              { label: "Fill Rate",     value: `${selected.fillRate}%`,                color: selected.fillRate > 70 ? T.success : T.warning },
              { label: "Impressões",    value: selected.totalImpressions.toLocaleString("pt-BR"), color: T.text },
              { label: "Erros 24h",     value: String(selected.errors24h),             color: selected.errors24h > 5 ? T.danger : T.success },
            ].map(m => (
              <div key={m.label} className="p-4 rounded-2xl border text-center" style={{ background: T.panel, borderColor: T.border }}>
                <p className="text-xs mb-1" style={{ color: T.textSub }}>{m.label}</p>
                <p className="text-xl font-bold" style={{ color: m.color }}>{m.value}</p>
              </div>
            ))}
          </div>

          {/* Device info */}
          <div className="p-6 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
            <h2 className="font-bold mb-4">Informações do dispositivo</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ["IP",            selected.ip],
                ["Firmware",      selected.firmware],
                ["Última conexão",selected.lastSeen],
                ["Localização",   selected.location],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-2 border-b" style={{ borderColor: T.border }}>
                  <span style={{ color: T.textSub }}>{k}</span>
                  <span className="font-mono text-xs font-semibold">{v}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-4">
              <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-colors hover:opacity-80" style={{ background: T.warning + "20", color: T.warning }}>
                <RefreshCw size={13} /> Reiniciar Player
              </button>
              <button onClick={() => onNavigate?.("device-manager")} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: T.border, color: T.textSub }}>
                <Settings size={13} /> Gerenciar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      <div className="border-b px-6 py-4 flex items-center gap-4 sticky top-0 z-10" style={{ background: T.panel, borderColor: T.border }}>
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5">
          <ArrowLeft size={18} style={{ color: T.textSub }} />
        </button>
        <div>
          <h1 className="font-bold text-lg">Screen Health</h1>
          <p className="text-xs" style={{ color: T.textSub }}>Monitoramento em tempo real · atualiza a cada 5s</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs" style={{ color: T.success }}>
            <Activity size={12} /> Ao vivo
          </span>
          <button onClick={() => onNavigate?.("notifications")} className="p-2 rounded-lg hover:bg-white/5">
            <Bell size={16} style={{ color: T.textSub }} />
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6">
        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {(["online", "warning", "offline", "updating"] as ScreenStatus[]).map(s => {
            const cfg = STATUS_CFG[s];
            return (
              <button
                key={s}
                onClick={() => setFilter(filter === s ? "all" : s)}
                className="p-4 rounded-2xl border text-left transition-all"
                style={{ background: filter === s ? cfg.bg : T.card, borderColor: filter === s ? cfg.color : T.border }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold" style={{ color: cfg.color }}>{cfg.label}</span>
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: cfg.dot }} />
                </div>
                <p className="text-3xl font-bold" style={{ color: cfg.color }}>{counts[s]}</p>
                <p className="text-xs mt-1" style={{ color: T.textSub }}>telas</p>
              </button>
            );
          })}
        </div>

        {/* Screen list */}
        <div className="space-y-3">
          {visible.map(screen => {
            const cfg = STATUS_CFG[screen.status];
            return (
              <button
                key={screen.id}
                onClick={() => setSelected(screen)}
                className="w-full p-5 rounded-2xl border text-left transition-all hover:border-opacity-60"
                style={{ background: T.card, borderColor: T.border }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: cfg.bg }}>
                      {screen.status === "offline" ? <WifiOff size={18} style={{ color: cfg.color }} /> : <Tv size={18} style={{ color: cfg.color }} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm">{screen.name}</p>
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                        {screen.errors24h > 0 && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs" style={{ background: T.danger + "20", color: T.danger }}>
                            <AlertTriangle size={10} /> {screen.errors24h} erros
                          </span>
                        )}
                      </div>
                      <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: T.textSub }}>
                        <MapPin size={9} /> {screen.location} · {screen.lastSeen}
                      </p>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center gap-6 text-xs">
                    <div className="text-center">
                      <p className="font-bold" style={{ color: screen.cpu > 80 ? T.danger : T.text }}>{screen.status === "offline" ? "—" : `${screen.cpu}%`}</p>
                      <p style={{ color: T.textSub }}>CPU</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold" style={{ color: screen.temp > 60 ? T.danger : T.text }}>{screen.status === "offline" ? "—" : `${screen.temp}°C`}</p>
                      <p style={{ color: T.textSub }}>Temp</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold" style={{ color: screen.latencyMs > 200 ? T.danger : T.text }}>{screen.status === "offline" ? "—" : `${screen.latencyMs}ms`}</p>
                      <p style={{ color: T.textSub }}>Latência</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold" style={{ color: screen.fillRate > 60 ? T.success : T.warning }}>{screen.fillRate}%</p>
                      <p style={{ color: T.textSub }}>Fill Rate</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold" style={{ color: screen.uptime > 95 ? T.success : T.warning }}>{screen.uptime}%</p>
                      <p style={{ color: T.textSub }}>Uptime</p>
                    </div>
                  </div>
                </div>

                {/* mini sparkline */}
                <div className="mt-3 h-10">
                  <ResponsiveContainer width="100%" height={40}>
                    <LineChart data={screen.history.slice(-12)}>
                      <Line key="line-cpu" type="monotone" dataKey="cpu" stroke={cfg.color} strokeWidth={1.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
