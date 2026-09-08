import { useState, useEffect } from "react";
import { ArrowLeft, Tv, Wifi, WifiOff, RefreshCw, Power, Settings, AlertTriangle, CheckCircle, Cpu, HardDrive, Thermometer, Activity, Signal, Eye, Play, Pause, MoreVertical, MapPin, Clock, Zap, X } from "lucide-react";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280",
};

type ScreenStatus = "online" | "offline" | "warning";

interface Screen {
  id: string;
  name: string;
  location: string;
  status: ScreenStatus;
  ip: string;
  uptime: string;
  appVersion: string;
  lastSeen: string;
  cpu: number;
  ram: number;
  storage: number;
  temp: number;
  signal: number;
  latency: number;
  impressionsToday: number;
  revenueToday: number;
  contentPlaying: string;
}

function makeScreen(i: number): Screen {
  const statuses: ScreenStatus[] = ["online", "online", "online", "warning", "offline"];
  const status = statuses[i % statuses.length];
  return {
    id: `SCR-${["A3F7K2", "B9E1C4", "D2F580", "E7A3B1", "F1C9D6"][i % 5]}`,
    name: ["Recepção Principal", "Sala de Espera", "Corredor A", "Vitrine Externa", "Caixa"][i % 5],
    location: ["São Paulo, SP", "Rio de Janeiro, RJ", "Curitiba, PR", "Belo Horizonte, MG", "Porto Alegre, RS"][i % 5],
    status,
    ip: `192.168.1.${10 + i}`,
    uptime: status === "offline" ? "—" : `${Math.floor(Math.random() * 30 + 1)}d ${Math.floor(Math.random() * 24)}h`,
    appVersion: "v0.7.1",
    lastSeen: status === "offline" ? "4h atrás" : "agora",
    cpu: status === "offline" ? 0 : Math.floor(Math.random() * 30 + 5),
    ram: status === "offline" ? 0 : Math.floor(Math.random() * 40 + 30),
    storage: Math.floor(Math.random() * 50 + 20),
    temp: status === "offline" ? 0 : status === "warning" ? 68 + Math.floor(Math.random() * 10) : Math.floor(Math.random() * 20 + 38),
    signal: status === "offline" ? 0 : status === "warning" ? 30 + Math.floor(Math.random() * 20) : Math.floor(Math.random() * 30 + 65),
    latency: status === "offline" ? 0 : status === "warning" ? 180 + Math.floor(Math.random() * 100) : Math.floor(Math.random() * 40 + 8),
    impressionsToday: status === "offline" ? 0 : Math.floor(Math.random() * 1200 + 200),
    revenueToday: status === "offline" ? 0 : Math.random() * 80 + 10,
    contentPlaying: ["Promoção do Dia", "Cardápio Executivo", "Canal DOOHPLAY", "Institucional", "—"][i % 5],
  };
}

const SCREENS_DATA: Screen[] = Array.from({ length: 5 }, (_, i) => makeScreen(i));

function Gauge({ value, max = 100, color, size = 56 }: { value: number; max?: number; color: string; size?: number }) {
  const pct = value / max;
  const r = (size / 2) - 5;
  const circ = 2 * Math.PI * r;
  const dash = pct * circ * 0.75;
  const gap = circ - dash;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(135deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={T.border} strokeWidth={4} strokeDasharray={`${circ * 0.75} ${circ}`} strokeLinecap="round" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={4} strokeDasharray={`${dash} ${gap + circ * 0.25}`} strokeLinecap="round" style={{ transition: "stroke-dasharray 0.8s ease" }} />
    </svg>
  );
}

interface MetricBadge { label: string; value: number; unit: string; color: string; max?: number; icon: typeof Cpu; warn?: number; danger?: number; }

function MetricCard({ m }: { m: MetricBadge }) {
  const Icon = m.icon;
  const isWarn = m.warn && m.value >= m.warn;
  const isDanger = m.danger && m.value >= m.danger;
  const color = isDanger ? T.danger : isWarn ? T.warning : m.color;
  return (
    <div className="rounded-xl border p-3 flex flex-col items-center gap-1" style={{ background: T.panel, borderColor: (isDanger || isWarn) ? color + "30" : T.border }}>
      <div className="relative flex items-center justify-center">
        <Gauge value={m.value} max={m.max ?? 100} color={color} size={52} />
        <div className="absolute flex flex-col items-center">
          <span className="text-xs font-black leading-none" style={{ color }}>{m.value}</span>
        </div>
      </div>
      <div className="flex items-center gap-1 text-xs" style={{ color: T.textSub }}>
        <Icon size={11} />
        <span>{m.label}</span>
      </div>
    </div>
  );
}

interface Props { onBack: () => void; }

export default function DeviceManager({ onBack }: Props) {
  const [screens, setScreens] = useState<Screen[]>(SCREENS_DATA);
  const [selected, setSelected] = useState<Screen | null>(null);
  const [actionLog, setActionLog] = useState<string[]>([]);
  const [restarting, setRestarting] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | ScreenStatus>("all");

  useEffect(() => {
    const iv = setInterval(() => {
      setScreens(prev => prev.map(s => {
        if (s.status === "offline") return s;
        return {
          ...s,
          cpu: Math.min(95, Math.max(2, s.cpu + (Math.random() - 0.5) * 8)),
          ram: Math.min(95, Math.max(20, s.ram + (Math.random() - 0.5) * 4)),
          latency: Math.max(4, s.latency + Math.floor((Math.random() - 0.5) * 10)),
          impressionsToday: s.impressionsToday + (Math.random() > 0.7 ? 1 : 0),
          revenueToday: +(s.revenueToday + (Math.random() > 0.8 ? Math.random() * 0.2 : 0)).toFixed(2),
        };
      }));
    }, 2500);
    return () => clearInterval(iv);
  }, []);

  const handleRestart = (id: string) => {
    setRestarting(id);
    setActionLog(l => [`[${new Date().toLocaleTimeString("pt-BR")}] Reiniciando ${id}...`, ...l]);
    setTimeout(() => {
      setRestarting(null);
      setScreens(prev => prev.map(s => s.id === id ? { ...s, status: "online", latency: 12, cpu: 8 } : s));
      setActionLog(l => [`[${new Date().toLocaleTimeString("pt-BR")}] ${id} reiniciada com sucesso ✓`, ...l]);
    }, 3000);
  };

  const STATUS_COLOR: Record<ScreenStatus, string> = { online: T.success, warning: T.warning, offline: T.danger };
  const STATUS_LABEL: Record<ScreenStatus, string> = { online: "Online", warning: "Atenção", offline: "Offline" };

  const filtered = filter === "all" ? screens : screens.filter(s => s.status === filter);
  const online = screens.filter(s => s.status === "online").length;
  const warnings = screens.filter(s => s.status === "warning").length;
  const offline = screens.filter(s => s.status === "offline").length;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5"><ArrowLeft size={18} style={{ color: T.textSub }} /></button>
          <div>
            <h1 className="font-black text-lg">Gerenciador de Dispositivos</h1>
            <p className="text-xs" style={{ color: T.textSub }}>Frota de telas · monitoramento em tempo real</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs" style={{ color: T.success }}>
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: T.success }} />
              Live
            </div>
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-6 pb-3 flex gap-2">
          {([
            { id: "all",     label: `Todas (${screens.length})` },
            { id: "online",  label: `Online (${online})` },
            { id: "warning", label: `Atenção (${warnings})` },
            { id: "offline", label: `Offline (${offline})` },
          ] as const).map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
              style={{ background: filter === f.id ? T.primary : T.panel, color: filter === f.id ? "#fff" : T.textSub, border: `1px solid ${filter === f.id ? T.primary : T.border}` }}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6 w-full">
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: "Online", value: online, color: T.success, icon: "✓" },
            { label: "Atenção", value: warnings, color: T.warning, icon: "⚠" },
            { label: "Offline", value: offline, color: T.danger, icon: "✗" },
            { label: "Uptime médio", value: "99,8%", color: T.primary, icon: "↑" },
          ].map((s, i) => (
            <div key={i} className="rounded-xl border p-4" style={{ background: T.card, borderColor: T.border }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-black text-sm" style={{ color: s.color }}>{s.icon}</span>
                <span className="text-xs" style={{ color: T.textSub }}>{s.label}</span>
              </div>
              <div className="text-3xl font-black" style={{ color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-6">
          <div className="flex-1 space-y-3">
            {filtered.map(s => {
              const isRestarting = restarting === s.id;
              return (
                <div key={s.id}
                  onClick={() => setSelected(selected?.id === s.id ? null : s)}
                  className="rounded-2xl border cursor-pointer transition-all hover:border-opacity-80"
                  style={{ background: T.card, borderColor: selected?.id === s.id ? T.primary : s.status === "warning" ? T.warning + "25" : s.status === "offline" ? T.danger + "20" : T.border }}>
                  <div className="p-4 flex items-start gap-4">
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: STATUS_COLOR[s.status] + "15" }}>
                        {isRestarting ? <RefreshCw size={20} className="animate-spin" style={{ color: T.warning }} /> : <Tv size={20} style={{ color: STATUS_COLOR[s.status] }} />}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[#0F1120]"
                        style={{ background: STATUS_COLOR[s.status] }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-bold">{s.name}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: STATUS_COLOR[s.status] + "20", color: STATUS_COLOR[s.status] }}>
                          {STATUS_LABEL[s.status]}
                        </span>
                      </div>
                      <div className="text-xs flex items-center gap-3" style={{ color: T.textSub }}>
                        <span className="flex items-center gap-1"><MapPin size={10} />{s.location}</span>
                        <span className="font-mono">{s.id}</span>
                        <span className="flex items-center gap-1"><Clock size={10} />{s.lastSeen}</span>
                      </div>
                      {s.status !== "offline" && (
                        <div className="text-xs mt-1.5 truncate" style={{ color: T.textSub }}>
                          ▶ {s.contentPlaying}
                        </div>
                      )}
                    </div>
                    {s.status !== "offline" && (
                      <div className="hidden md:flex items-center gap-4 flex-shrink-0 text-xs">
                        <div className="text-center">
                          <div className="font-bold" style={{ color: s.cpu > 80 ? T.danger : s.cpu > 60 ? T.warning : T.success }}>{Math.round(s.cpu)}%</div>
                          <div style={{ color: T.textSub }}>CPU</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold" style={{ color: s.temp > 70 ? T.danger : s.temp > 55 ? T.warning : T.success }}>{Math.round(s.temp)}°C</div>
                          <div style={{ color: T.textSub }}>Temp</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold" style={{ color: s.latency > 150 ? T.danger : s.latency > 80 ? T.warning : T.success }}>{s.latency}ms</div>
                          <div style={{ color: T.textSub }}>Ping</div>
                        </div>
                      </div>
                    )}
                    <button
                      onClick={e => { e.stopPropagation(); handleRestart(s.id); }}
                      disabled={isRestarting}
                      className="flex-shrink-0 p-2 rounded-lg transition-all hover:bg-white/5 disabled:opacity-40"
                      style={{ color: T.textSub }}>
                      {isRestarting ? <RefreshCw size={16} className="animate-spin" /> : <Power size={16} />}
                    </button>
                  </div>

                  {selected?.id === s.id && s.status !== "offline" && (
                    <div className="px-4 pb-4 border-t pt-4" style={{ borderColor: T.border }}>
                      <div className="grid grid-cols-4 gap-3 mb-4">
                        {([
                          { label: "CPU", value: Math.round(s.cpu), unit: "%", color: s.cpu > 80 ? T.danger : T.success, max: 100, icon: Cpu, warn: 60, danger: 80 },
                          { label: "RAM", value: Math.round(s.ram), unit: "%", color: s.ram > 85 ? T.danger : T.primary, max: 100, icon: Activity, warn: 70, danger: 85 },
                          { label: "Temp", value: Math.round(s.temp), unit: "°C", color: s.temp > 70 ? T.danger : T.warning, max: 100, icon: Thermometer, warn: 55, danger: 70 },
                          { label: "Sinal", value: Math.round(s.signal), unit: "%", color: s.signal < 40 ? T.danger : T.success, max: 100, icon: Signal, warn: 40 },
                        ] as MetricBadge[]).map((m, i) => (
                          <MetricCard key={i} m={m} />
                        ))}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs mb-4">
                        {[
                          { l: "IP", v: s.ip },
                          { l: "Versão", v: s.appVersion },
                          { l: "Uptime", v: s.uptime },
                          { l: "Latência", v: `${s.latency}ms` },
                          { l: "Storage", v: `${s.storage}% usado` },
                          { l: "Impressões hoje", v: s.impressionsToday.toLocaleString("pt-BR") },
                          { l: "Receita hoje", v: `R$${s.revenueToday.toFixed(2)}` },
                          { l: "Último ping", v: s.lastSeen },
                        ].map((r, i) => (
                          <div key={i} className="p-2 rounded-lg" style={{ background: T.panel }}>
                            <div style={{ color: T.textSub }}>{r.l}</div>
                            <div className="font-mono font-medium">{r.v}</div>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <button onClick={e => { e.stopPropagation(); handleRestart(s.id); }}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium" style={{ background: T.warning + "15", color: T.warning }}>
                          <RefreshCw size={12} /> Reiniciar app
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium" style={{ background: T.primary + "15", color: T.primary }}>
                          <Eye size={12} /> Ver ao vivo
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium" style={{ background: T.panel, color: T.textSub, border: `1px solid ${T.border}` }}>
                          <Settings size={12} /> Configurar
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium" style={{ background: T.panel, color: T.textSub, border: `1px solid ${T.border}` }}>
                          <HardDrive size={12} /> Limpar cache
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {actionLog.length > 0 && (
            <div className="w-64 flex-shrink-0">
              <div className="rounded-2xl border p-4 sticky top-32" style={{ background: T.card, borderColor: T.border }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-sm">Log de ações</span>
                  <button onClick={() => setActionLog([])} style={{ color: T.textSub }}><X size={13} /></button>
                </div>
                <div className="space-y-2">
                  {actionLog.map((l, i) => (
                    <div key={i} className="font-mono text-xs p-2 rounded-lg" style={{ background: T.panel, color: i === 0 ? T.success : T.textSub }}>
                      {l}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
