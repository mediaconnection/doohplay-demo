import { useState, useEffect } from "react";
import { ArrowLeft, Monitor, Wifi, WifiOff, AlertTriangle, CheckCircle, RefreshCw, Eye, Thermometer, Cpu, Signal, Play, Pause, Volume2, VolumeX, ZoomIn } from "lucide-react";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

interface Props { onBack: () => void; onNavigate?: (v: string) => void; }

const SCREEN_NAMES = [
  "Recepção Principal", "Sala de Espera A", "Corredor B2", "Vitrine Norte",
  "Caixa 1", "Caixa 2", "Entrada Sul", "Lounge VIP", "Estacionamento",
  "Elevador Lobby", "Refeitório", "Hall Social",
];

const CONTENT_PLAYING = [
  "Campanha Verão 2026", "Promo Fim de Ano", "Institucional Marca", "Happy Hour Sexta",
  "Promoção Flash", "Cardápio Digital", "Novidades da Semana", "Delivery -30%",
];

function makeScreen(id: number) {
  const statuses = ["online", "online", "online", "online", "warning", "offline"] as const;
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  return {
    id,
    name: SCREEN_NAMES[id % SCREEN_NAMES.length],
    status,
    content: CONTENT_PLAYING[id % CONTENT_PLAYING.length],
    cpu: Math.floor(Math.random() * 40 + 15),
    mem: Math.floor(Math.random() * 50 + 30),
    temp: Math.floor(Math.random() * 20 + 38),
    viewers: Math.floor(Math.random() * 120 + 10),
    uptime: Math.floor(Math.random() * 720 + 24),
    signal: Math.floor(Math.random() * 40 + 60),
    muted: Math.random() > 0.7,
    resolution: ["1920×1080", "3840×2160", "1280×720"][id % 3],
    lastSeen: status === "offline" ? `${Math.floor(Math.random() * 60 + 5)}min atrás` : "Agora",
  };
}

const INITIAL_SCREENS = Array.from({ length: 12 }, (_, i) => makeScreen(i));

export default function LiveMonitor({ onBack, onNavigate }: Props) {
  const [screens, setScreens] = useState(INITIAL_SCREENS);
  const [filter, setFilter] = useState<"all" | "online" | "warning" | "offline">("all");
  const [selected, setSelected] = useState<number | null>(null);
  const [grid, setGrid] = useState<"4x3" | "3x2" | "list">("4x3");
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setScreens(prev => prev.map(s => ({
        ...s,
        viewers: Math.max(0, s.viewers + Math.floor(Math.random() * 10 - 5)),
        cpu: Math.min(95, Math.max(5, s.cpu + Math.floor(Math.random() * 6 - 3))),
      })));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setScreens(Array.from({ length: 12 }, (_, i) => makeScreen(i)));
      setLastRefresh(new Date());
      setRefreshing(false);
    }, 800);
  };

  const filtered = screens.filter(s => filter === "all" || s.status === filter);
  const online = screens.filter(s => s.status === "online").length;
  const warning = screens.filter(s => s.status === "warning").length;
  const offline = screens.filter(s => s.status === "offline").length;
  const totalViewers = screens.filter(s => s.status === "online").reduce((a, s) => a + s.viewers, 0);

  const statusColor = (s: string) =>
    s === "online" ? T.success : s === "warning" ? T.warning : T.danger;
  const statusIcon = (s: string) =>
    s === "online" ? CheckCircle : s === "warning" ? AlertTriangle : WifiOff;

  const selectedScreen = selected !== null ? screens.find(s => s.id === selected) : null;

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5"><ArrowLeft size={18} style={{ color: T.textSub }} /></button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.success + "20" }}>
                <Monitor size={18} style={{ color: T.success }} />
              </div>
              <div>
                <h1 className="font-black text-lg">Monitor ao Vivo</h1>
                <p className="text-xs" style={{ color: T.textSub }}>
                  Atualizado: {lastRefresh.toLocaleTimeString("pt-BR")}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Grid toggle */}
            <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: T.card, border: `1px solid ${T.border}` }}>
              {(["4x3", "3x2", "list"] as const).map(g => (
                <button key={g} onClick={() => setGrid(g)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                  style={{ background: grid === g ? T.primary : "transparent", color: grid === g ? "#fff" : T.textSub }}>
                  {g}
                </button>
              ))}
            </div>
            <button onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:opacity-80"
              style={{ background: T.primary + "20", color: T.primary, border: `1px solid ${T.primary}30` }}>
              <RefreshCw size={14} style={{ animation: refreshing ? "spin 0.8s linear infinite" : "none" }} />
              Atualizar
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Stats bar */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Online", value: online, color: T.success, icon: Wifi },
            { label: "Alerta", value: warning, color: T.warning, icon: AlertTriangle },
            { label: "Offline", value: offline, color: T.danger, icon: WifiOff },
            { label: "Viewers agora", value: totalViewers.toLocaleString("pt-BR"), color: T.primary, icon: Eye },
          ].map((stat, i) => (
            <div key={i} className="p-4 rounded-2xl border flex items-center gap-4" style={{ background: T.card, borderColor: T.border }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: stat.color + "20" }}>
                <stat.icon size={18} style={{ color: stat.color }} />
              </div>
              <div>
                <div className="font-black text-2xl" style={{ color: stat.color }}>{stat.value}</div>
                <div className="text-xs" style={{ color: T.textSub }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2">
          {(["all", "online", "warning", "offline"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all"
              style={{
                background: filter === f ? (f === "all" ? T.primary : f === "online" ? T.success : f === "warning" ? T.warning : T.danger) + "20" : T.card,
                color: filter === f ? (f === "all" ? T.primary : f === "online" ? T.success : f === "warning" ? T.warning : T.danger) : T.textSub,
                border: `1px solid ${filter === f ? (f === "all" ? T.primary : f === "online" ? T.success : f === "warning" ? T.warning : T.danger) + "40" : T.border}`,
              }}>
              {f === "all" ? `Todas (${screens.length})` : f === "online" ? `Online (${online})` : f === "warning" ? `Alerta (${warning})` : `Offline (${offline})`}
            </button>
          ))}
        </div>

        {/* Grid view */}
        {grid !== "list" && (
          <div className={`grid gap-4 ${grid === "4x3" ? "grid-cols-4" : "grid-cols-3"}`}>
            {filtered.map(screen => {
              const SIcon = statusIcon(screen.status);
              return (
                <div key={screen.id} onClick={() => setSelected(screen.id === selected ? null : screen.id)}
                  className="rounded-2xl border overflow-hidden cursor-pointer transition-all hover:scale-[1.02]"
                  style={{
                    background: T.card,
                    borderColor: selected === screen.id ? statusColor(screen.status) : T.border,
                    boxShadow: selected === screen.id ? `0 0 0 1px ${statusColor(screen.status)}40` : "none",
                  }}>
                  {/* Screen preview */}
                  <div className="relative aspect-video flex items-center justify-center"
                    style={{ background: screen.status === "offline" ? "#0a0a0a" : `linear-gradient(135deg, ${T.primary}15, ${T.accent}15)` }}>
                    {screen.status === "offline" ? (
                      <WifiOff size={24} style={{ color: T.danger + "60" }} />
                    ) : (
                      <>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center px-2">
                            <div className="text-xs font-bold truncate" style={{ color: T.text, maxWidth: 120 }}>{screen.content}</div>
                            <div className="flex items-center justify-center gap-1 mt-1">
                              {screen.muted ? <VolumeX size={10} style={{ color: T.textSub }} /> : <Volume2 size={10} style={{ color: T.success }} />}
                              <span className="text-xs" style={{ color: T.textSub }}>{screen.resolution}</span>
                            </div>
                          </div>
                        </div>
                        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold"
                          style={{ background: T.success + "30", color: T.success }}>
                          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: T.success }} />
                          AO VIVO
                        </div>
                      </>
                    )}
                    <div className="absolute bottom-2 left-2 flex items-center gap-1 text-xs" style={{ color: T.textSub }}>
                      <Eye size={10} />
                      {screen.viewers}
                    </div>
                  </div>

                  {/* Screen info */}
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm truncate">{screen.name}</span>
                      <SIcon size={14} style={{ color: statusColor(screen.status), flexShrink: 0 }} />
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <div className="text-center">
                        <div className="text-xs font-bold" style={{ color: screen.cpu > 70 ? T.danger : T.text }}>{screen.cpu}%</div>
                        <div className="text-xs" style={{ color: T.textSub }}>CPU</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs font-bold" style={{ color: screen.temp > 55 ? T.warning : T.text }}>{screen.temp}°C</div>
                        <div className="text-xs" style={{ color: T.textSub }}>Temp</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs font-bold" style={{ color: T.success }}>{screen.signal}%</div>
                        <div className="text-xs" style={{ color: T.textSub }}>Sinal</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* List view */}
        {grid === "list" && (
          <div className="rounded-2xl border overflow-hidden" style={{ borderColor: T.border }}>
            <table className="w-full">
              <thead>
                <tr style={{ background: T.card, borderBottom: `1px solid ${T.border}` }}>
                  {["Tela", "Status", "Conteúdo", "CPU", "Temp", "Viewers", "Sinal", "Último ping"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold" style={{ color: T.textSub }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((screen, i) => {
                  const SIcon = statusIcon(screen.status);
                  return (
                    <tr key={screen.id} onClick={() => setSelected(screen.id === selected ? null : screen.id)}
                      className="cursor-pointer transition-colors hover:bg-white/2"
                      style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${T.border}` : "none", background: selected === screen.id ? T.primary + "08" : "transparent" }}>
                      <td className="px-4 py-3 font-medium">{screen.name}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <SIcon size={12} style={{ color: statusColor(screen.status) }} />
                          <span className="text-xs capitalize" style={{ color: statusColor(screen.status) }}>{screen.status}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: T.textSub }}>{screen.status === "offline" ? "—" : screen.content}</td>
                      <td className="px-4 py-3 text-sm" style={{ color: screen.cpu > 70 ? T.danger : T.text }}>{screen.cpu}%</td>
                      <td className="px-4 py-3 text-sm" style={{ color: screen.temp > 55 ? T.warning : T.text }}>{screen.temp}°C</td>
                      <td className="px-4 py-3 text-sm">{screen.status === "offline" ? "—" : screen.viewers}</td>
                      <td className="px-4 py-3 text-sm" style={{ color: T.success }}>{screen.signal}%</td>
                      <td className="px-4 py-3 text-xs" style={{ color: T.textSub }}>{screen.lastSeen}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Detail panel */}
        {selectedScreen && (
          <div className="p-6 rounded-2xl border" style={{ background: T.card, borderColor: statusColor(selectedScreen.status) + "40" }}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: statusColor(selectedScreen.status) + "20" }}>
                  <Monitor size={18} style={{ color: statusColor(selectedScreen.status) }} />
                </div>
                <div>
                  <h3 className="font-black text-lg">{selectedScreen.name}</h3>
                  <p className="text-sm" style={{ color: T.textSub }}>ID #{selectedScreen.id + 1} · {selectedScreen.resolution}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold capitalize"
                style={{ background: statusColor(selectedScreen.status) + "20", color: statusColor(selectedScreen.status) }}>
                {selectedScreen.status}
              </div>
            </div>

            <div className="grid grid-cols-6 gap-4">
              {[
                { label: "CPU", value: `${selectedScreen.cpu}%`, color: selectedScreen.cpu > 70 ? T.danger : T.success, icon: Cpu },
                { label: "Memória", value: `${selectedScreen.mem}%`, color: selectedScreen.mem > 80 ? T.danger : T.text, icon: Cpu },
                { label: "Temperatura", value: `${selectedScreen.temp}°C`, color: selectedScreen.temp > 55 ? T.warning : T.success, icon: Thermometer },
                { label: "Sinal", value: `${selectedScreen.signal}%`, color: T.success, icon: Signal },
                { label: "Viewers", value: selectedScreen.viewers.toString(), color: T.primary, icon: Eye },
                { label: "Uptime", value: `${selectedScreen.uptime}h`, color: T.success, icon: Play },
              ].map((m, i) => (
                <div key={i} className="p-3 rounded-xl text-center" style={{ background: T.panel }}>
                  <div className="font-black text-xl mb-1" style={{ color: m.color }}>{m.value}</div>
                  <div className="text-xs" style={{ color: T.textSub }}>{m.label}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 rounded-xl" style={{ background: T.panel }}>
              <span className="text-xs font-bold" style={{ color: T.textSub }}>Exibindo agora: </span>
              <span className="text-sm font-bold" style={{ color: T.text }}>{selectedScreen.content}</span>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
                style={{ background: T.primary + "20", color: T.primary, border: `1px solid ${T.primary}30` }}>
                <ZoomIn size={14} /> Ver Detalhes
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
                style={{ background: T.warning + "20", color: T.warning, border: `1px solid ${T.warning}30` }}>
                <Pause size={14} /> Pausar Tela
              </button>
              <button onClick={() => onNavigate?.("screen-health")}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
                style={{ background: T.accent + "20", color: T.accent, border: `1px solid ${T.accent}30` }}>
                <Cpu size={14} /> Health Check
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
