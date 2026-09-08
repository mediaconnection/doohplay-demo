import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Play, Pause, SkipBack, Tv, Monitor, Smartphone, Sun, Moon, Volume2, RefreshCw, Maximize2 } from "lucide-react";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

interface Props { onBack: () => void; onNavigate?: (v: string) => void; }

type ScreenEnv = "outdoor-day" | "outdoor-night" | "indoor-bright" | "indoor-dim" | "transit" | "airport" | "retail";
type Orientation = "landscape" | "portrait";

const ENVIRONMENTS: { id: ScreenEnv; label: string; bg: string; bezel: string; brightness: number }[] = [
  { id: "outdoor-day",   label: "Outdoor — Dia",      bg: "linear-gradient(180deg,#87CEEB 0%,#b8e0f0 60%,#c8d8a8 100%)", bezel: "#2a2a2a", brightness: 1    },
  { id: "outdoor-night", label: "Outdoor — Noite",    bg: "linear-gradient(180deg,#05060E 0%,#0a0a1a 60%,#1a1a1a 100%)", bezel: "#1a1a1a", brightness: 0.85 },
  { id: "indoor-bright", label: "Indoor — Iluminado", bg: "#f5f5f0",                                                       bezel: "#333",    brightness: 0.92 },
  { id: "indoor-dim",    label: "Indoor — Escuro",     bg: "#1a1a2e",                                                       bezel: "#111",    brightness: 0.78 },
  { id: "transit",       label: "Metrô / Ônibus",      bg: "linear-gradient(135deg,#1a1a2e 0%,#16213e 100%)",               bezel: "#0d0d1a", brightness: 0.88 },
  { id: "airport",       label: "Aeroporto",           bg: "linear-gradient(180deg,#e8edf5 0%,#d0d8e8 100%)",               bezel: "#2d3a4a", brightness: 0.95 },
  { id: "retail",        label: "Varejo",              bg: "linear-gradient(135deg,#fff8f0 0%,#fef3e2 100%)",               bezel: "#c0392b", brightness: 0.9  },
];

const SAMPLE_ADS = [
  { id: "ad1", brand: "Nubank",       headline: "Seu dinheiro sem letras miúdas",  subline: "Abra sua conta em minutos",   bg: "#8A05BE", text: "#fff",    cta: "Abrir conta grátis"    },
  { id: "ad2", brand: "iFood",        headline: "Peça em 3 cliques",               subline: "Entrega em até 30 minutos",   bg: "#EA1D2C", text: "#fff",    cta: "Pedir agora"           },
  { id: "ad3", brand: "Itaú",         headline: "Feito para você evoluir",          subline: "Soluções financeiras completas",bg: "#FF6200", text: "#003D7A", cta: "Conheça"              },
  { id: "ad4", brand: "Magazine Luiza",headline: "Magalu. Toda hora, todo lugar",  subline: "As melhores ofertas estão aqui",bg: "#0086FF", text: "#fff",   cta: "Comprar agora"         },
  { id: "ad5", brand: "Ambev",        headline: "Tempo bom. Brahma.",              subline: "Beba com moderação",          bg: "#FFD700", text: "#1a1a1a", cta: "Saiba mais"             },
];

export default function AdPreviewPlayer({ onBack }: Props) {
  const [env, setEnv]                   = useState<ScreenEnv>("outdoor-day");
  const [orientation, setOrientation]   = useState<Orientation>("landscape");
  const [adIndex, setAdIndex]           = useState(0);
  const [playing, setPlaying]           = useState(false);
  const [progress, setProgress]         = useState(0);
  const [duration]                      = useState(15); // seconds
  const [showSafeZone, setShowSafeZone] = useState(false);
  const intervalRef                     = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentEnv = ENVIRONMENTS.find(e => e.id === env)!;
  const currentAd  = SAMPLE_ADS[adIndex];

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            setAdIndex(i => (i + 1) % SAMPLE_ADS.length);
            return 0;
          }
          return p + (100 / (duration * 10));
        });
      }, 100);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing, duration]);

  const reset = () => { setProgress(0); setPlaying(false); };

  const W = orientation === "landscape" ? 560 : 315;
  const H = orientation === "landscape" ? 315 : 560;

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5">
              <ArrowLeft size={18} style={{ color: T.textSub }} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.accent + "20" }}>
                <Monitor size={18} style={{ color: T.accent }} />
              </div>
              <div>
                <h1 className="font-black text-lg">Ad Preview Player</h1>
                <p className="text-xs" style={{ color: T.textSub }}>Simule como seus anúncios aparecem em diferentes telas e ambientes</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setOrientation(o => o === "landscape" ? "portrait" : "landscape")}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all"
              style={{ background: T.card, color: T.textSub, border: `1px solid ${T.border}` }}>
              {orientation === "landscape" ? <Monitor size={13} /> : <Smartphone size={13} />}
              {orientation === "landscape" ? "Landscape" : "Portrait"}
            </button>
            <button onClick={() => setShowSafeZone(s => !s)}
              className="px-3 py-2 rounded-xl text-sm font-bold"
              style={{ background: showSafeZone ? T.warning + "20" : T.card, color: showSafeZone ? T.warning : T.textSub, border: `1px solid ${showSafeZone ? T.warning + "40" : T.border}` }}>
              Safe Zone
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 grid grid-cols-3 gap-6">
        {/* Left: environment + ad selector */}
        <div className="space-y-4">
          <div className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
            <div className="text-xs font-black mb-3" style={{ color: T.textSub }}>AMBIENTE</div>
            <div className="space-y-1.5">
              {ENVIRONMENTS.map(e => (
                <button key={e.id} onClick={() => setEnv(e.id)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all text-left"
                  style={{ background: env === e.id ? T.primary + "20" : "transparent", color: env === e.id ? T.text : T.textSub }}>
                  <div className="w-4 h-4 rounded" style={{ background: typeof e.bg === "string" && e.bg.startsWith("linear") ? "linear-gradient(135deg,#4F6EF7,#7C5CFC)" : e.bg }} />
                  {e.label}
                  {env === e.id && <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: T.primary }} />}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
            <div className="text-xs font-black mb-3" style={{ color: T.textSub }}>ANÚCIO</div>
            <div className="space-y-1.5">
              {SAMPLE_ADS.map((ad, i) => (
                <button key={ad.id} onClick={() => { setAdIndex(i); reset(); }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all text-left"
                  style={{ background: adIndex === i ? ad.bg + "30" : "transparent", color: adIndex === i ? T.text : T.textSub }}>
                  <div className="w-4 h-4 rounded" style={{ background: ad.bg }} />
                  <span className="font-bold">{ad.brand}</span>
                  {adIndex === i && <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: currentAd.bg }} />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center: screen preview */}
        <div className="col-span-2 flex flex-col items-center gap-6">
          {/* Screen environment */}
          <div className="w-full rounded-2xl overflow-hidden relative flex items-center justify-center"
            style={{ background: currentEnv.bg, minHeight: H + 80, padding: "40px 60px" }}>

            {/* Ambient elements for outdoors */}
            {env === "outdoor-day" && (
              <>
                <div className="absolute top-4 right-12 w-16 h-8 rounded-full opacity-60" style={{ background: "#fff" }} />
                <div className="absolute bottom-0 left-0 right-0 h-12 opacity-40" style={{ background: "#8fbc5a" }} />
              </>
            )}
            {env === "outdoor-night" && (
              <div className="absolute inset-0 flex items-end justify-around pb-2 opacity-20">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="w-1 rounded-t" style={{ height: `${20 + i * 8}px`, background: "#FFAA00" }} />
                ))}
              </div>
            )}

            {/* The screen bezel */}
            <div className="relative shadow-2xl"
              style={{ width: W + 16, height: H + 16, background: currentEnv.bezel, borderRadius: 8, padding: 6 }}>
              {/* Inner screen content */}
              <div className="relative overflow-hidden"
                style={{ width: W, height: H, background: currentAd.bg, borderRadius: 4 }}>

                {/* Ad content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center"
                  style={{ filter: `brightness(${currentEnv.brightness})` }}>
                  <div className="font-black text-xs mb-4 px-2 py-1 rounded"
                    style={{ background: "rgba(0,0,0,0.2)", color: currentAd.text, opacity: 0.7 }}>
                    {currentAd.brand.toUpperCase()}
                  </div>
                  <div className="font-black leading-tight mb-2"
                    style={{ color: currentAd.text, fontSize: orientation === "landscape" ? "22px" : "18px" }}>
                    {currentAd.headline}
                  </div>
                  <div className="mb-6 opacity-80"
                    style={{ color: currentAd.text, fontSize: orientation === "landscape" ? "12px" : "11px" }}>
                    {currentAd.subline}
                  </div>
                  <div className="px-5 py-2 rounded-full font-black text-xs"
                    style={{ background: "rgba(255,255,255,0.2)", color: currentAd.text, border: "1px solid rgba(255,255,255,0.4)" }}>
                    {currentAd.cta}
                  </div>
                </div>

                {/* Safe zone overlay */}
                {showSafeZone && (
                  <div className="absolute inset-0 pointer-events-none"
                    style={{ border: "2px dashed rgba(255,200,0,0.6)", margin: "8%" }}>
                    <div className="absolute top-0 left-0 text-xs px-1" style={{ color: "#FFD700", background: "rgba(0,0,0,0.5)", fontSize: "8px" }}>SAFE ZONE</div>
                  </div>
                )}

                {/* Progress bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: "rgba(0,0,0,0.3)" }}>
                  <div className="h-full transition-none" style={{ width: `${progress}%`, background: T.success }} />
                </div>
              </div>
            </div>

            {/* Brightness badge */}
            <div className="absolute top-3 left-3 flex items-center gap-1 text-xs px-2 py-1 rounded-lg"
              style={{ background: "rgba(0,0,0,0.5)", color: "#fff" }}>
              <Sun size={10} />
              {Math.round(currentEnv.brightness * 1000)} nits
            </div>
          </div>

          {/* Controls */}
          <div className="w-full p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
            <div className="flex items-center gap-4 mb-3">
              <button onClick={reset} className="p-2 rounded-lg hover:bg-white/5">
                <SkipBack size={16} style={{ color: T.textSub }} />
              </button>
              <button onClick={() => setPlaying(p => !p)}
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: T.primary }}>
                {playing ? <Pause size={16} style={{ color: "#fff" }} /> : <Play size={16} style={{ color: "#fff" }} />}
              </button>
              <div className="flex-1">
                <div className="h-2 rounded-full overflow-hidden" style={{ background: T.border }}>
                  <div className="h-full rounded-full transition-none" style={{ width: `${progress}%`, background: T.primary }} />
                </div>
              </div>
              <span className="text-xs font-mono" style={{ color: T.textSub }}>
                {Math.floor(progress / 100 * duration)}s / {duration}s
              </span>
              <button onClick={() => setAdIndex(i => (i + 1) % SAMPLE_ADS.length)}
                className="p-2 rounded-lg hover:bg-white/5">
                <RefreshCw size={14} style={{ color: T.textSub }} />
              </button>
            </div>
            <div className="flex items-center justify-between text-xs" style={{ color: T.textSub }}>
              <span>Ad {adIndex + 1}/{SAMPLE_ADS.length} · {currentAd.brand}</span>
              <span>{orientation} · {W}×{H}px · {currentEnv.label}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
