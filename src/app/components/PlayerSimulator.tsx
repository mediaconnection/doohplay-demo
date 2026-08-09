import { useState, useEffect } from "react";
import {
  ArrowLeft, Monitor, Wifi, WifiOff, Play, Pause, SkipForward,
  Volume2, VolumeX, Settings, RefreshCw, Smartphone, Zap,
  CheckCircle, AlertCircle, Clock, Shield
} from "lucide-react";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

interface AdSlot {
  id: string; advertiser: string; duration: number;
  type: "video" | "image"; bg: string; accent: string;
  headline: string; cta: string; proofId: string;
}

const PLAYLIST: AdSlot[] = [
  { id: "ad1", advertiser: "AutoFinance",  duration: 15, type: "video", bg: "#0A1428", accent: T.primary, headline: "Financie seu carro em 5 min", cta: "Simule grátis",  proofId: "POP-AF7K2M9X" },
  { id: "ad2", advertiser: "TechStore",    duration: 30, type: "video", bg: "#0D0A1E", accent: T.accent,  headline: "iPhone 16 Pro — chegou",    cta: "Ver na loja",    proofId: "POP-TS3N8P2R" },
  { id: "ad3", advertiser: "FitPlus",      duration: 15, type: "image", bg: "#041510", accent: T.success, headline: "Matrícula com 50% OFF",       cta: "Matricule-se",  proofId: "POP-FP9L4Q7V" },
  { id: "ad4", advertiser: "iFood",        duration: 15, type: "video", bg: "#150800", accent: T.warning, headline: "Delivery em 30 minutos",      cta: "Peça agora",   proofId: "POP-IF2B6D5W" },
  { id: "ad5", advertiser: "Bradesco",     duration: 30, type: "image", bg: "#010820", accent: T.primary, headline: "Conta digital sem taxas",    cta: "Abrir conta",   proofId: "POP-BD8C1F3Y" },
];

type PlayerStatus = "playing" | "paused" | "offline" | "updating";

interface Props { onBack: () => void; onNavigate?: (v: string) => void; }

export default function PlayerSimulator({ onBack, onNavigate }: Props) {
  const [status, setStatus] = useState<PlayerStatus>("playing");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [muted, setMuted] = useState(false);
  const [proofLog, setProofLog] = useState<{ id: string; time: string; adv: string }[]>([]);
  const [brightness, setBrightness] = useState(80);
  const [tab, setTab] = useState<"player" | "logs" | "settings">("player");

  const current = PLAYLIST[currentIdx];

  useEffect(() => {
    if (status !== "playing") return;
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          const now = new Date();
          const timeStr = `${now.getHours().toString().padStart(2,"0")}:${now.getMinutes().toString().padStart(2,"0")}:${now.getSeconds().toString().padStart(2,"0")}`;
          setProofLog(prev => [{ id: PLAYLIST[currentIdx].proofId, time: timeStr, adv: PLAYLIST[currentIdx].advertiser }, ...prev.slice(0, 19)]);
          setCurrentIdx(i => (i + 1) % PLAYLIST.length);
          return 0;
        }
        return p + (100 / (current.duration * 10));
      });
    }, 100);
    return () => clearInterval(interval);
  }, [status, currentIdx, current.duration]);

  const skip = () => { setCurrentIdx(i => (i + 1) % PLAYLIST.length); setProgress(0); };
  const togglePlay = () => setStatus(s => s === "playing" ? "paused" : "playing");
  const goOffline = () => setStatus(s => s === "offline" ? "playing" : "offline");

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5"><ArrowLeft size={18} style={{ color: T.textSub }} /></button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.primary + "20" }}>
              <Monitor size={18} style={{ color: T.primary }} />
            </div>
            <div>
              <h1 className="font-black text-lg">DOOHPLAY Player</h1>
              <p className="text-xs" style={{ color: T.textSub }}>Android v0.7.1 · SCR-A3F7K2 · simulação</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
              style={{
                background: status === "playing" ? T.success + "15" : status === "offline" ? T.danger + "15" : T.warning + "15",
                color:      status === "playing" ? T.success      : status === "offline" ? T.danger      : T.warning
              }}>
              <div className={`w-1.5 h-1.5 rounded-full ${status === "playing" ? "animate-pulse" : ""}`}
                style={{ background: status === "playing" ? T.success : status === "offline" ? T.danger : T.warning }} />
              {status === "playing" ? "Transmitindo" : status === "offline" ? "Offline" : status === "paused" ? "Pausado" : "Atualizando"}
            </div>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-6 pb-0 flex">
          {([["player","Player"],["logs","Proof Log"],["settings","Config"]] as const).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              className="px-5 py-2.5 text-sm font-medium border-b-2 transition-all"
              style={{ borderColor: tab === id ? T.primary : "transparent", color: tab === id ? T.primary : T.textSub }}>
              {label}
              {id === "logs" && proofLog.length > 0 && (
                <span className="ml-1.5 px-1.5 rounded-full text-xs font-black" style={{ background: T.success + "20", color: T.success }}>{proofLog.length}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6 space-y-5">
        {tab === "player" && (
          <>
            <div className="rounded-3xl overflow-hidden border-4 relative" style={{ borderColor: "#1a1a2e", aspectRatio: "16/9" }}>
              {status === "offline" ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: "#000" }}>
                  <WifiOff size={48} style={{ color: T.textSub, opacity: 0.3 }} className="mb-3" />
                  <p className="text-lg font-bold" style={{ color: T.textSub }}>Sem conexão</p>
                  <p className="text-sm mt-1" style={{ color: T.textSub, opacity: 0.5 }}>Verificando rede...</p>
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: current.bg, opacity: brightness / 100 }}>
                  <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 50% 20%, ${current.accent}20, transparent 60%)` }} />
                  {status === "paused" && (
                    <div className="absolute inset-0 flex items-center justify-center z-10" style={{ background: "rgba(0,0,0,0.5)" }}>
                      <Pause size={64} style={{ color: T.textSub, opacity: 0.5 }} />
                    </div>
                  )}
                  <div className="relative z-0 text-center px-8">
                    <div className="font-black text-4xl mb-3 leading-tight" style={{ color: current.accent }}>{current.headline}</div>
                    <div className="inline-block px-6 py-2.5 rounded-2xl font-black text-lg mt-2" style={{ background: current.accent, color: "#000" }}>{current.cta}</div>
                  </div>
                  <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: "rgba(0,0,0,0.5)" }}>
                    <Shield size={10} style={{ color: T.success }} />
                    <span className="text-xs font-bold" style={{ color: T.success }}>ProofChain</span>
                  </div>
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs" style={{ background: "rgba(0,0,0,0.5)", color: T.textSub }}>
                    {current.advertiser} · {current.type === "video" ? "▶" : "📷"} {current.duration}s
                  </div>
                </div>
              )}
              {status !== "offline" && (
                <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: "rgba(255,255,255,0.1)" }}>
                  <div className="h-full transition-all" style={{ width: `${progress}%`, background: current.accent }} />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <div className="flex items-center gap-3">
                <button onClick={togglePlay} className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: T.primary + "20", color: T.primary }}>
                  {status === "playing" ? <Pause size={18} /> : <Play size={18} />}
                </button>
                <button onClick={skip} className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: T.panel, color: T.textSub, border: `1px solid ${T.border}` }}>
                  <SkipForward size={18} />
                </button>
                <button onClick={() => setMuted(m => !m)} className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: T.panel, color: T.textSub, border: `1px solid ${T.border}` }}>
                  {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
              </div>
              <div className="text-center">
                <div className="font-bold text-sm">{current.advertiser}</div>
                <div className="text-xs" style={{ color: T.textSub }}>{Math.ceil((1 - progress / 100) * current.duration)}s restantes · {currentIdx + 1}/{PLAYLIST.length}</div>
              </div>
              <button onClick={goOffline} className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: status === "offline" ? T.danger + "20" : T.panel, color: status === "offline" ? T.danger : T.textSub, border: `1px solid ${T.border}` }}>
                {status === "offline" ? <WifiOff size={16} /> : <Wifi size={16} />}
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-sm" style={{ color: T.textSub }}>Playlist ativa ({PLAYLIST.length} slots)</h3>
              {PLAYLIST.map((ad, i) => (
                <div key={ad.id} className="flex items-center gap-3 p-3 rounded-xl border"
                  style={{ background: i === currentIdx ? T.primary + "10" : T.card, borderColor: i === currentIdx ? T.primary + "30" : T.border }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black" style={{ background: ad.accent + "20", color: ad.accent }}>
                    {i === currentIdx ? <Play size={14} /> : i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-sm">{ad.advertiser}</div>
                    <div className="text-xs" style={{ color: T.textSub }}>{ad.type} · {ad.duration}s</div>
                  </div>
                  {i === currentIdx && <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: T.success }} />}
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "logs" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm">Proof-of-Play Log</h3>
              <span className="text-xs" style={{ color: T.textSub }}>{proofLog.length} provas emitidas</span>
            </div>
            {proofLog.length === 0 ? (
              <div className="text-center py-12" style={{ color: T.textSub }}>
                <Shield size={32} className="mx-auto mb-2 opacity-20" />
                <p className="text-sm">Aguardando exibições para gerar provas...</p>
              </div>
            ) : (
              proofLog.map((log, i) => (
                <div key={i} className="flex items-center gap-3 p-3.5 rounded-xl border" style={{ background: T.card, borderColor: T.border }}>
                  <CheckCircle size={16} style={{ color: T.success }} />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm">{log.id}</div>
                    <div className="text-xs" style={{ color: T.textSub }}>{log.adv} · RSA-SHA256 · Polygon anchored</div>
                  </div>
                  <div className="text-xs font-mono" style={{ color: T.textSub }}>{log.time}</div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === "settings" && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <h4 className="font-bold text-sm mb-4">Dispositivo</h4>
              {[
                { label: "Modelo",         value: "Android TV Box — X96 Air" },
                { label: "Android",         value: "11.0 (API 30)"              },
                { label: "Player version",  value: "DOOHPLAY v0.7.1"            },
                { label: "Screen ID",       value: "SCR-A3F7K2"                 },
                { label: "IP local",        value: "192.168.1.104"              },
                { label: "MAC",             value: "A4:C3:F0:7E:2D:1B"         },
              ].map((item, i) => (
                <div key={i} className="flex justify-between py-2 border-b last:border-0" style={{ borderColor: T.border }}>
                  <span className="text-sm" style={{ color: T.textSub }}>{item.label}</span>
                  <span className="text-sm font-medium font-mono">{item.value}</span>
                </div>
              ))}
            </div>
            <div className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <h4 className="font-bold text-sm mb-3">Brilho da tela</h4>
              <div className="flex items-center gap-3">
                <Monitor size={16} style={{ color: T.textSub }} />
                <input type="range" min={20} max={100} value={brightness} onChange={e => setBrightness(Number(e.target.value))} className="flex-1 accent-blue-500" />
                <span className="w-10 text-right font-bold" style={{ color: T.primary }}>{brightness}%</span>
              </div>
            </div>
            <button className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2" style={{ background: T.warning + "15", color: T.warning, border: `1px solid ${T.warning}25` }}>
              <RefreshCw size={15} /> Verificar atualização (v0.7.2 disponível)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
