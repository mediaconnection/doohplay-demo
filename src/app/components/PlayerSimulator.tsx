import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft, Monitor, Wifi, WifiOff, Play, Pause, SkipForward,
  Volume2, VolumeX, Shield, MapPin, Clock, Thermometer,
  Zap, CheckCircle, Eye, BarChart2, Signal, Settings2,
  ChevronRight, Radio
} from "lucide-react";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

interface AdSlot {
  id: string;
  advertiser: string;
  category: string;
  duration: number;
  type: "video" | "image";
  photo: string;
  bg: string;
  accent: string;
  headline: string;
  sub: string;
  cta: string;
  logo: string;
  proofId: string;
  price: string;
}

const PLAYLIST: AdSlot[] = [
  {
    id: "ad1", advertiser: "Barbearia Zimerman", category: "Beleza",
    duration: 15, type: "video",
    photo: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=900&h=500&fit=crop&auto=format",
    bg: "#0A0C14", accent: "#4F6EF7",
    headline: "Corte + Barba por R$49", sub: "Agende pelo WhatsApp agora",
    cta: "Reservar horário", logo: "✂️", proofId: "POP-ZIM-8K4F2N9X", price: "R$49",
  },
  {
    id: "ad2", advertiser: "Padaria Bella", category: "Alimentação",
    duration: 20, type: "video",
    photo: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=900&h=500&fit=crop&auto=format",
    bg: "#120A00", accent: "#FFAA00",
    headline: "Pão fresquinho às 6h", sub: "Café da manhã completo por R$18",
    cta: "Ver cardápio", logo: "🥖", proofId: "POP-PAD-3N8P2R7V", price: "R$18",
  },
  {
    id: "ad3", advertiser: "FitPlus Academia", category: "Fitness",
    duration: 15, type: "image",
    photo: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=900&h=500&fit=crop&auto=format",
    bg: "#041510", accent: "#00DC82",
    headline: "Matrícula com 50% OFF", sub: "Primeira mensalidade grátis",
    cta: "Matricule-se hoje", logo: "💪", proofId: "POP-FIT-9L4Q7V5W", price: "R$89",
  },
  {
    id: "ad4", advertiser: "Farmácia Popular", category: "Saúde",
    duration: 15, type: "image",
    photo: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=900&h=500&fit=crop&auto=format",
    bg: "#010A20", accent: "#4F6EF7",
    headline: "Delivery de remédios em 30min", sub: "Sem taxa de entrega acima de R$30",
    cta: "Peça agora", logo: "💊", proofId: "POP-FAR-2B6D5W8Y", price: "Grátis",
  },
  {
    id: "ad5", advertiser: "AutoCar Multimarcas", category: "Automotivo",
    duration: 30, type: "video",
    photo: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=900&h=500&fit=crop&auto=format",
    bg: "#0A0008", accent: "#7C5CFC",
    headline: "Financie em 5 minutos", sub: "Parcelas a partir de R$349/mês",
    cta: "Simular agora", logo: "🚗", proofId: "POP-AUT-8C1F3Y6Z", price: "R$349",
  },
];

type PlayerStatus = "playing" | "paused" | "offline" | "updating";

interface Props { onBack: () => void; onNavigate?: (v: string) => void; }

export default function PlayerSimulator({ onBack, onNavigate }: Props) {
  const [status, setStatus] = useState<PlayerStatus>("playing");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [muted, setMuted] = useState(false);
  const [proofLog, setProofLog] = useState<{ id: string; time: string; adv: string; hash: string }[]>([]);
  const [tab, setTab] = useState<"preview" | "playlist" | "logs">("preview");
  const [now, setNow] = useState(new Date());
  const [temp] = useState(24);
  const [impressions, setImpressions] = useState(1847);
  const [revenue, setRevenue] = useState(312.40);

  const current = PLAYLIST[currentIdx];

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (status !== "playing") return;
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          const t = new Date();
          const ts = `${t.getHours().toString().padStart(2,"0")}:${t.getMinutes().toString().padStart(2,"0")}:${t.getSeconds().toString().padStart(2,"0")}`;
          const hash = "0x" + Math.random().toString(16).slice(2, 10).toUpperCase() + "...";
          setProofLog(prev => [{ id: PLAYLIST[currentIdx].proofId, time: ts, adv: PLAYLIST[currentIdx].advertiser, hash }, ...prev.slice(0, 29)]);
          setImpressions(i => i + 1);
          setRevenue(r => parseFloat((r + (Math.random() * 2 + 0.5)).toFixed(2)));
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
  const toggleOffline = () => setStatus(s => s === "offline" ? "playing" : "offline");

  const timeStr = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="min-h-screen flex flex-col" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>

      {/* Top bar */}
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F0", borderColor: T.border, backdropFilter: "blur(20px)" }}>
        <div className="px-6 py-3 flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
            <ArrowLeft size={18} style={{ color: T.textSub }} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: T.primary + "25" }}>
              <Monitor size={16} style={{ color: T.primary }} />
            </div>
            <div>
              <div className="font-black text-sm" style={{ fontFamily: "'Inter Tight', sans-serif" }}>TV Preview — DOOHPLAY Player</div>
              <div className="text-xs" style={{ color: T.textSub }}>SCR-A3F7K2 · Barbearia Zimerman · São Paulo, SP</div>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-4 mr-4">
              <div className="text-right">
                <div className="text-xs font-bold" style={{ color: T.success }}>{impressions.toLocaleString("pt-BR")}</div>
                <div className="text-xs" style={{ color: T.textSub }}>impressões</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold" style={{ color: T.gold }}>R$ {revenue.toFixed(2)}</div>
                <div className="text-xs" style={{ color: T.textSub }}>receita hoje</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
              style={{
                background: status === "playing" ? T.success + "15" : status === "offline" ? T.danger + "15" : T.warning + "15",
                color: status === "playing" ? T.success : status === "offline" ? T.danger : T.warning
              }}>
              <div className={`w-1.5 h-1.5 rounded-full ${status === "playing" ? "animate-pulse" : ""}`}
                style={{ background: status === "playing" ? T.success : status === "offline" ? T.danger : T.warning }} />
              {status === "playing" ? "Ao vivo" : status === "offline" ? "Offline" : status === "paused" ? "Pausado" : "Atualizando"}
            </div>
          </div>
        </div>

        <div className="px-6 flex border-t" style={{ borderColor: T.border }}>
          {([["preview","Simulador TV"],["playlist","Playlist"],["logs","Proof Log"]] as const).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              className="px-5 py-2.5 text-sm font-medium border-b-2 transition-all"
              style={{ borderColor: tab === id ? T.primary : "transparent", color: tab === id ? T.text : T.textSub }}>
              {label}
              {id === "logs" && proofLog.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs font-black" style={{ background: T.success + "25", color: T.success }}>
                  {proofLog.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 px-4 py-6 max-w-7xl mx-auto w-full">

        {tab === "preview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            <div className="lg:col-span-2 space-y-4">
              <div className="relative flex flex-col items-center">
                <div className="absolute inset-0 pointer-events-none" style={{
                  background: `radial-gradient(ellipse 70% 50% at 50% 45%, ${current.accent}18, transparent 70%)`
                }} />

                <div className="relative w-full rounded-2xl p-[10px] shadow-2xl" style={{
                  background: "linear-gradient(180deg, #1C1C28 0%, #0E0E18 100%)",
                  boxShadow: `0 40px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05), 0 0 60px ${current.accent}15`
                }}>
                  <div className="relative overflow-hidden rounded-xl" style={{ aspectRatio: "16/9", background: "#000" }}>

                    {status === "offline" ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: "#000" }}>
                        <WifiOff size={48} style={{ color: "#333", marginBottom: 12 }} />
                        <p className="text-lg font-bold" style={{ color: "#444" }}>Sem conexão</p>
                        <p className="text-sm mt-1" style={{ color: "#333" }}>Aguardando rede...</p>
                        <div className="mt-6 flex gap-1">
                          {[0,1,2].map(i => (
                            <div key={i} className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#333", animationDelay: `${i * 0.3}s` }} />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <>
                        <img
                          src={current.photo}
                          alt={current.advertiser}
                          className="absolute inset-0 w-full h-full object-cover"
                          style={{ opacity: status === "paused" ? 0.4 : 0.55 }}
                        />
                        <div className="absolute inset-0" style={{
                          background: `linear-gradient(135deg, ${current.bg}DD 0%, ${current.bg}99 50%, transparent 100%)`
                        }} />
                        <div className="absolute inset-0" style={{
                          background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)"
                        }} />

                        {status === "paused" && (
                          <div className="absolute inset-0 flex items-center justify-center z-20" style={{ background: "rgba(0,0,0,0.55)" }}>
                            <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)" }}>
                              <Pause size={36} style={{ color: "rgba(255,255,255,0.8)" }} />
                            </div>
                          </div>
                        )}

                        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 pt-3">
                          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(10px)" }}>
                            <span className="text-base">{current.logo}</span>
                            <span className="text-xs font-bold text-white/90">{current.advertiser}</span>
                            <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: current.accent + "30", color: current.accent }}>{current.category}</span>
                          </div>
                          <div className="flex items-center gap-3 px-3 py-1 rounded-full" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(10px)" }}>
                            <div className="flex items-center gap-1 text-xs text-white/70">
                              <Thermometer size={11} />
                              <span>24°C</span>
                            </div>
                            <div className="w-px h-3" style={{ background: "rgba(255,255,255,0.2)" }} />
                            <div className="text-xs font-mono font-bold text-white/90">{timeStr}</div>
                          </div>
                        </div>

                        <div className="absolute inset-0 z-10 flex flex-col justify-center px-8 pt-8">
                          <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: current.accent, opacity: 0.8 }}>
                            {current.type === "video" ? "▶ Vídeo" : "📷 Imagem"} · {current.duration}s
                          </div>
                          <h2 className="font-black leading-tight mb-3" style={{
                            fontFamily: "'Inter Tight', sans-serif",
                            fontSize: "clamp(1.4rem, 3.5vw, 2.2rem)",
                            color: "#fff",
                            textShadow: "0 2px 20px rgba(0,0,0,0.8)"
                          }}>
                            {current.headline}
                          </h2>
                          <p className="text-sm mb-5" style={{ color: "rgba(255,255,255,0.7)", maxWidth: 320 }}>{current.sub}</p>
                          <div className="flex items-center gap-3">
                            <div className="px-5 py-2.5 rounded-xl font-black text-sm" style={{ background: current.accent, color: "#fff" }}>
                              {current.cta}
                            </div>
                            <div className="px-4 py-2.5 rounded-xl font-black text-lg" style={{ background: "rgba(255,255,255,0.12)", color: "#fff", backdropFilter: "blur(8px)" }}>
                              {current.price}
                            </div>
                          </div>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 z-10 flex items-end justify-between px-4 pb-3">
                          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs" style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(10px)", color: "rgba(255,255,255,0.6)" }}>
                            <MapPin size={10} />
                            <span>Av. Paulista, São Paulo</span>
                          </div>
                          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-bold" style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(10px)", color: T.success }}>
                            <Shield size={10} />
                            <span>ProofChain</span>
                          </div>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 h-1 z-20" style={{ background: "rgba(255,255,255,0.08)" }}>
                          <div className="h-full transition-none" style={{ width: `${progress}%`, background: current.accent }} />
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex items-center justify-center pt-2.5 pb-1 gap-3">
                    <div className="w-12 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }} />
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: status === "playing" ? T.success : status === "offline" ? T.danger : T.warning, boxShadow: status === "playing" ? `0 0 6px ${T.success}` : "none" }} />
                      <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 10 }}>DOOHPLAY · Android TV</span>
                    </div>
                    <div className="w-12 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }} />
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-16 h-3" style={{ background: "linear-gradient(180deg, #1A1A28 0%, #0E0E18 100%)" }} />
                  <div className="w-28 h-2 rounded-sm" style={{ background: "#0E0E18", boxShadow: "0 2px 8px rgba(0,0,0,0.5)" }} />
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <button onClick={togglePlay}
                  className="w-11 h-11 rounded-xl flex items-center justify-center transition-all hover:scale-105"
                  style={{ background: T.primary, color: "#fff", boxShadow: `0 0 20px ${T.primary}40` }}>
                  {status === "playing" ? <Pause size={18} /> : <Play size={18} />}
                </button>
                <button onClick={skip}
                  className="w-11 h-11 rounded-xl flex items-center justify-center transition-colors hover:bg-white/5"
                  style={{ background: T.panel, color: T.textSub, border: `1px solid ${T.border}` }}>
                  <SkipForward size={18} />
                </button>
                <button onClick={() => setMuted(m => !m)}
                  className="w-11 h-11 rounded-xl flex items-center justify-center transition-colors hover:bg-white/5"
                  style={{ background: T.panel, color: muted ? T.danger : T.textSub, border: `1px solid ${T.border}` }}>
                  {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <div className="flex-1 text-center">
                  <div className="font-bold text-sm">{current.advertiser}</div>
                  <div className="text-xs" style={{ color: T.textSub }}>
                    {Math.max(0, Math.ceil((1 - progress / 100) * current.duration))}s · {currentIdx + 1}/{PLAYLIST.length} na fila
                  </div>
                </div>
                <button onClick={toggleOffline}
                  className="w-11 h-11 rounded-xl flex items-center justify-center transition-all"
                  style={{
                    background: status === "offline" ? T.danger + "20" : T.panel,
                    color: status === "offline" ? T.danger : T.textSub,
                    border: `1px solid ${status === "offline" ? T.danger + "40" : T.border}`
                  }}>
                  {status === "offline" ? <WifiOff size={16} /> : <Wifi size={16} />}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border p-4 space-y-3" style={{ background: T.card, borderColor: T.border }}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: T.textSub }}>Informações da Tela</span>
                  <Signal size={14} style={{ color: T.success }} />
                </div>
                {[
                  ["ID", "SCR-A3F7K2"],
                  ["Local", "Barbearia Zimerman"],
                  ["Endereço", "Av. Paulista, 1234"],
                  ["Cidade", "São Paulo, SP"],
                  ["Resolução", "1920 × 1080"],
                  ["Player", "Android 12 v0.7.1"],
                  ["Uptime", "99.8%"],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: T.textSub }}>{k}</span>
                    <span className="text-xs font-bold">{v}</span>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border p-4 space-y-3" style={{ background: T.card, borderColor: T.border }}>
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: T.textSub }}>Métricas em Tempo Real</span>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Impressões", value: impressions.toLocaleString("pt-BR"), color: T.primary, icon: <Eye size={14} /> },
                    { label: "Receita", value: `R$ ${revenue.toFixed(2)}`, color: T.gold, icon: <BarChart2 size={14} /> },
                    { label: "Proofs", value: proofLog.length.toString(), color: T.success, icon: <Shield size={14} /> },
                    { label: "CPM médio", value: "R$ 32,50", color: T.accent, icon: <Zap size={14} /> },
                  ].map(item => (
                    <div key={item.label} className="rounded-xl p-3 flex flex-col gap-1" style={{ background: T.panel }}>
                      <div style={{ color: item.color }}>{item.icon}</div>
                      <div className="font-black text-sm" style={{ color: item.color }}>{item.value}</div>
                      <div className="text-xs" style={{ color: T.textSub }}>{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border p-4 space-y-2" style={{ background: T.card, borderColor: T.border }}>
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: T.textSub }}>Próximo na fila</span>
                {[0,1,2].map(i => {
                  const item = PLAYLIST[(currentIdx + i + 1) % PLAYLIST.length];
                  return (
                    <div key={item.id} className="flex items-center gap-2 p-2 rounded-xl" style={{ background: i === 0 ? item.accent + "10" : "transparent", border: i === 0 ? `1px solid ${item.accent}25` : "1px solid transparent" }}>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0" style={{ background: item.accent + "20" }}>
                        {item.logo}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold truncate">{item.advertiser}</div>
                        <div className="text-xs" style={{ color: T.textSub }}>{item.duration}s</div>
                      </div>
                      {i === 0 && <ChevronRight size={12} style={{ color: item.accent }} />}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {tab === "playlist" && (
          <div className="max-w-3xl mx-auto space-y-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-black text-lg" style={{ fontFamily: "'Inter Tight', sans-serif" }}>Playlist ativa</h2>
              <span className="text-sm px-3 py-1 rounded-full" style={{ background: T.primary + "15", color: T.primary }}>{PLAYLIST.length} anúncios</span>
            </div>
            {PLAYLIST.map((ad, i) => (
              <div key={ad.id} className="flex items-center gap-4 p-4 rounded-2xl border transition-all"
                style={{ background: i === currentIdx ? ad.accent + "10" : T.card, borderColor: i === currentIdx ? ad.accent + "40" : T.border }}>
                <div className="relative w-20 h-12 rounded-xl overflow-hidden flex-shrink-0" style={{ background: ad.bg }}>
                  <img src={ad.photo} alt={ad.advertiser} className="w-full h-full object-cover opacity-70" />
                  {i === currentIdx && (
                    <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.5)" }}>
                      <Radio size={16} className="animate-pulse" style={{ color: ad.accent }} />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{ad.logo}</span>
                    <span className="font-bold text-sm">{ad.advertiser}</span>
                    {i === currentIdx && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold animate-pulse" style={{ background: T.success + "20", color: T.success }}>AO VIVO</span>
                    )}
                  </div>
                  <div className="text-sm mt-0.5" style={{ color: T.textSub }}>{ad.headline}</div>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs px-2 py-0.5 rounded" style={{ background: T.panel, color: T.textSub }}>{ad.category}</span>
                    <span className="text-xs" style={{ color: T.textSub }}>{ad.type === "video" ? "▶" : "📷"} {ad.duration}s</span>
                    <span className="text-xs font-bold" style={{ color: ad.accent }}>{ad.price}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xs font-mono" style={{ color: T.textSub }}>{ad.proofId.slice(0, 14)}</div>
                  {i === currentIdx && (
                    <div className="mt-1 h-1 w-20 rounded-full overflow-hidden" style={{ background: T.border }}>
                      <div className="h-full rounded-full transition-none" style={{ width: `${progress}%`, background: ad.accent }} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "logs" && (
          <div className="max-w-3xl mx-auto space-y-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-black text-lg" style={{ fontFamily: "'Inter Tight', sans-serif" }}>Proof-of-Play Log</h2>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: T.success }} />
                <span className="text-sm" style={{ color: T.success }}>Gravando na blockchain</span>
              </div>
            </div>
            {proofLog.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20" style={{ color: T.textSub }}>
                <Shield size={40} className="mb-3 opacity-20" />
                <p className="text-sm">Aguardando exibições...</p>
                <p className="text-xs mt-1 opacity-60">Os proofs aparecem aqui após cada anúncio</p>
              </div>
            ) : (
              proofLog.map((log, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl border" style={{ background: T.card, borderColor: T.border }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: T.success + "15" }}>
                    <CheckCircle size={16} style={{ color: T.success }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">{log.adv}</span>
                      <span className="text-xs px-2 py-0.5 rounded" style={{ background: T.success + "15", color: T.success }}>Verificado</span>
                    </div>
                    <div className="text-xs mt-0.5 font-mono" style={{ color: T.textSub }}>{log.id}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs font-mono" style={{ color: T.textSub }}>{log.time}</div>
                    <div className="text-xs font-mono mt-0.5" style={{ color: T.primary, opacity: 0.7 }}>{log.hash}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
