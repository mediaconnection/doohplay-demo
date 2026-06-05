"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import Hls from "hls.js"

type PlaylistItem = {
  id: string
  playlist_id: string
  asset_url: string
  type: string
  duration: number
  campaign_id: string | null
  position: number
}

type PlayerState = "loading" | "playing" | "error" | "empty"
type Transition = "fade" | "slide" | "zoom" | "flash"

const TRANSITIONS: Transition[] = ["fade", "slide", "zoom", "flash"]
const PLAYLIST_REFRESH_MS = 5 * 60 * 1000   // 5 min
const WEATHER_REFRESH_MS  = 10 * 60 * 1000  // 10 min
const RETRY_MS            = 30 * 1000        // 30s retry on error
const HEARTBEAT_MS        = 60 * 1000        // 1 min heartbeat

function getYouTubeId(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtube\.com\/embed\/([^?&]+)/,
    /youtu\.be\/([^?&]+)/,
    /youtube\.com\/shorts\/([^?&]+)/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return m[1]
  }
  return null
}

function isHlsUrl(url: string, type: string) {
  return type === "hls" || type === "stream" || /\.m3u8(\?|$)/i.test(url)
}
function isYouTubeUrl(url: string) {
  return /youtube\.com|youtu\.be/.test(url)
}
function isVideoUrl(url: string, type: string) {
  return type === "video" || /\.(mp4|webm|mov)(\?|$)/i.test(url)
}
function isImageUrl(url: string, type: string) {
  return type === "image" || /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(url)
}

function getTransitionStyles(transition: Transition, phase: "enter" | "active" | "exit"): React.CSSProperties {
  const base: React.CSSProperties = { position: "absolute", inset: 0, width: "100%", height: "100%" }
  switch (transition) {
    case "fade":
      return { ...base, opacity: phase === "active" ? 1 : 0, transition: phase === "exit" ? "opacity 0.6s ease-out" : "opacity 0.6s ease-in" }
    case "slide":
      return { ...base, opacity: 1, transform: phase === "enter" ? "translateX(100%)" : phase === "active" ? "translateX(0%)" : "translateX(-100%)", transition: phase !== "enter" ? "transform 0.5s cubic-bezier(0.4,0,0.2,1)" : "none" }
    case "zoom":
      return { ...base, opacity: phase === "active" ? 1 : 0, transform: phase === "enter" ? "scale(1.08)" : phase === "active" ? "scale(1)" : "scale(0.95)", transition: phase !== "enter" ? "opacity 0.5s ease, transform 0.5s ease" : "none" }
    case "flash":
      return { ...base, opacity: phase === "active" ? 1 : 0, transition: phase === "exit" ? "opacity 0.15s ease-out" : "opacity 0.15s ease-in" }
    default:
      return { ...base, opacity: phase === "active" ? 1 : 0, transition: "opacity 0.5s" }
  }
}

function ItemContent({ item, videoRef, onStart, onEnd, onAdvance }: {
  item: PlaylistItem
  videoRef?: React.RefObject<HTMLVideoElement>
  onStart: () => void
  onEnd: () => void
  onAdvance: () => void
}) {
  const ytId = isYouTubeUrl(item.asset_url) ? getYouTubeId(item.asset_url) : null
  const isHls = !ytId && isHlsUrl(item.asset_url, item.type)
  const isVid = !ytId && !isHls && isVideoUrl(item.asset_url, item.type)
  const isImg = !ytId && !isHls && !isVid && isImageUrl(item.asset_url, item.type)
  const isDynamic = item.type === "weather" || item.type === "news" || item.type === "social"
  const fill: React.CSSProperties = { width: "100%", height: "100%", objectFit: "cover" as const }

  if (isDynamic) return <iframe src={`/api/widgets/render?type=${item.type}&url=${encodeURIComponent(item.asset_url)}`} style={{ ...fill, border: "none" }} onLoad={onStart} />
  if (isHls) return <video ref={videoRef} autoPlay muted playsInline style={fill} onPlay={onStart} onError={onAdvance} />
  if (ytId) return <iframe src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${ytId}&rel=0&modestbranding=1&iv_load_policy=3`} style={{ ...fill, border: "none" }} allow="autoplay; fullscreen" allowFullScreen onLoad={onStart} />
  if (isVid) return <video src={item.asset_url} autoPlay muted playsInline style={fill} onPlay={onStart} onEnded={() => { onEnd(); onAdvance() }} onError={onAdvance} />
  if (isImg) return <img src={item.asset_url} alt="" style={fill} onLoad={onStart} onError={onAdvance} />
  return <iframe src={item.asset_url} style={{ ...fill, border: "none" }} onLoad={onStart} />
}

export default function PlayerPage({ params }: { params: { code: string } }) {
  const [items, setItems]               = useState<PlaylistItem[]>([])
  const [index, setIndex]               = useState(0)
  const [prevIndex, setPrevIndex]       = useState<number | null>(null)
  const [state, setState]               = useState<PlayerState>("loading")
  const [errorMsg, setErrorMsg]         = useState("")
  const [verified, setVerified]         = useState(false)
  const [transition, setTransition]     = useState<Transition>("fade")
  const [transitioning, setTransitioning] = useState(false)
  const [transitionCount, setTransitionCount] = useState(0)
  const [flashVisible, setFlashVisible] = useState(false)
  const [weather, setWeather]           = useState<{ temperature: number; emoji: string; condition: string; city: string } | null>(null)
  const [retryCount, setRetryCount]     = useState(0)
  const [lastActivity, setLastActivity] = useState(Date.now())

  const timerRef  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hlsRef    = useRef<Hls | null>(null)
  const videoRef  = useRef<HTMLVideoElement | null>(null)
  const wakeLock  = useRef<any>(null)

  const code   = params.code
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(code)

  // ── Wake Lock — impede a tela de dormir ──
  useEffect(() => {
    const acquire = async () => {
      try {
        if ("wakeLock" in navigator) {
          wakeLock.current = await (navigator as any).wakeLock.request("screen")
        }
      } catch {}
    }
    acquire()
    const reacquire = () => { if (document.visibilityState === "visible") acquire() }
    document.addEventListener("visibilitychange", reacquire)
    return () => document.removeEventListener("visibilitychange", reacquire)
  }, [])

  // ── Fullscreen automático ──
  useEffect(() => {
    const requestFs = () => {
      const el = document.documentElement
      if (el.requestFullscreen) el.requestFullscreen().catch(() => {})
    }
    // Fire Stick requer interação do usuário para fullscreen — tenta ao primeiro clique/keydown
    const handler = () => { requestFs(); document.removeEventListener("click", handler); document.removeEventListener("keydown", handler) }
    document.addEventListener("click", handler)
    document.addEventListener("keydown", handler)
    // Tenta direto (funciona em alguns players web)
    requestFs()
    return () => { document.removeEventListener("click", handler); document.removeEventListener("keydown", handler) }
  }, [])

  // ── Heartbeat — reporta que o player está vivo ──
  useEffect(() => {
    const beat = async () => {
      try {
        await fetch("/api/player/heartbeat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ screen_id: isUuid ? code : "cccccccc-0001-0001-0001-000000000001" }),
        })
      } catch {}
    }
    beat()
    const iv = setInterval(beat, HEARTBEAT_MS)
    return () => clearInterval(iv)
  }, [code, isUuid])

  // ── Fetch playlist com retry agressivo ──
  const fetchPlaylist = useCallback(async () => {
    try {
      let screenId = code
      if (!isUuid) {
        const pRes = await fetch(`/api/player/resolve?code=${code}`, { cache: "no-store" })
        if (pRes.ok) {
          const pData = await pRes.json()
          screenId = pData.screen_id ?? code
        }
      }
      const res = await fetch(`/api/player/playlist?screen=${screenId}&now=${new Date().toISOString()}`, { cache: "no-store" })
      const data = await res.json()
      if (!data.items?.length) { setState("empty"); return }
      setItems(prev => {
        // Só atualiza se a playlist mudou (evita reset do índice)
        const same = JSON.stringify(prev.map(i => i.id)) === JSON.stringify(data.items.map((i: any) => i.id))
        return same ? prev : data.items
      })
      setState("playing")
      setRetryCount(0)
    } catch {
      setRetryCount(c => c + 1)
      setState(prev => prev === "playing" ? prev : "error") // mantém playing se já estava
      setErrorMsg("Sem conexão — tentando novamente...")
    }
  }, [code, isUuid])

  useEffect(() => {
    fetchPlaylist()
    const iv = setInterval(fetchPlaylist, PLAYLIST_REFRESH_MS)
    return () => { clearInterval(iv); hlsRef.current?.destroy() }
  }, [fetchPlaylist])

  // Retry automático em caso de erro
  useEffect(() => {
    if (retryCount === 0) return
    const delay = Math.min(RETRY_MS * retryCount, 5 * 60 * 1000) // max 5 min
    const t = setTimeout(fetchPlaylist, delay)
    return () => clearTimeout(t)
  }, [retryCount, fetchPlaylist])

  // ── Clima ──
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch("/api/widgets/weather")
        const data = await res.json()
        if (data.ok) setWeather(data)
      } catch {}
    }
    fetchWeather()
    const iv = setInterval(fetchWeather, WEATHER_REFRESH_MS)
    return () => clearInterval(iv)
  }, [])

  // ── Avança com transição ──
  const advance = useCallback(() => {
    if (!items.length) return
    const nextTransition = TRANSITIONS[transitionCount % TRANSITIONS.length]
    setTransition(nextTransition)
    setTransitionCount(c => c + 1)
    const nextIndex = (index + 1) % items.length
    setPrevIndex(index)
    setTransitioning(true)
    const dur = nextTransition === "flash" ? 200 : 600
    setTimeout(() => {
      setIndex(nextIndex)
      setLastActivity(Date.now())
      setTimeout(() => { setPrevIndex(null); setTransitioning(false) }, dur)
    }, dur / 2)
  }, [items.length, index, transitionCount])

  // ── Proof-of-play ──
  const reportStart = useCallback(async (item: PlaylistItem) => {
    try {
      await fetch("/api/player/ad-start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          screen_id: isUuid ? code : "cccccccc-0001-0001-0001-000000000001",
          campaign_id: item.campaign_id,
          ad_id: item.id,
        }),
      })
    } catch {}
  }, [code, isUuid])

  const reportEnd = useCallback(async (item: PlaylistItem, duration: number) => {
    try {
      await fetch("/api/player/ad-end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          screen_id: isUuid ? code : "cccccccc-0001-0001-0001-000000000001",
          campaign_id: item.campaign_id,
          ad_id: item.id,
          duration,
        }),
      })
      setVerified(true)
      setTimeout(() => setVerified(false), 3000)
    } catch {}
  }, [code, isUuid])

  // ── Timer (imagens, iframes, YouTube) ──
  useEffect(() => {
    if (state !== "playing" || !items.length) return
    const item = items[index]
    if (isVideoUrl(item.asset_url, item.type)) return
    reportStart(item)
    const dur = (item.duration ?? 30) * 1000
    timerRef.current = setTimeout(async () => {
      await reportEnd(item, item.duration ?? 30)
      advance()
    }, dur)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [index, items, state, advance, reportStart, reportEnd])

  // ── HLS ──
  useEffect(() => {
    if (state !== "playing" || !items.length) return
    const item = items[index]
    if (!isHlsUrl(item.asset_url, item.type)) return
    const video = videoRef.current
    if (!video) return
    hlsRef.current?.destroy()
    if (Hls.isSupported()) {
      const hls = new Hls({ lowLatencyMode: true, maxBufferLength: 10 })
      hlsRef.current = hls
      hls.loadSource(item.asset_url)
      hls.attachMedia(video)
      hls.on(Hls.Events.MANIFEST_PARSED, () => { video.play().catch(() => {}); reportStart(item) })
      hls.on(Hls.Events.ERROR, (_e: any, data: any) => { if (data.fatal) advance() })
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = item.asset_url; video.play().catch(() => {}); reportStart(item)
    } else { advance() }
    return () => { hlsRef.current?.destroy(); hlsRef.current = null }
  }, [index, items, state, advance, reportStart])

  // ── Flash overlay ──
  useEffect(() => {
    if (transition === "flash" && transitioning) {
      setFlashVisible(true)
      setTimeout(() => setFlashVisible(false), 200)
    }
  }, [transition, transitioning, transitionCount])

  // ── Watchdog — reinicia se travar por mais de 5 min ──
  useEffect(() => {
    const watchdog = setInterval(() => {
      if (state === "playing" && Date.now() - lastActivity > 5 * 60 * 1000) {
        advance()
      }
    }, 60 * 1000)
    return () => clearInterval(watchdog)
  }, [state, lastActivity, advance])

  // ── LOADING ──
  if (state === "loading") return (
    <div style={S.screen}>
      <div style={S.center}>
        <div style={S.brand}>DOOHPLAY</div>
        <div style={S.spinnerWrap}>
          <div style={S.spinner} />
        </div>
        <div style={{ color: "#C9A84C60", fontSize: 13, letterSpacing: "0.1em" }}>Carregando...</div>
      </div>
    </div>
  )

  // ── ERROR / EMPTY ──
  if (state === "error" || state === "empty") return (
    <div style={S.screen}>
      <div style={S.center}>
        <div style={S.brand}>DOOHPLAY</div>
        <div style={{ color: state === "error" ? "#ff6b6b" : "#C9A84C80", fontSize: 13, marginTop: 20, textAlign: "center", maxWidth: 300 }}>
          {state === "error" ? errorMsg : "Nenhuma mídia configurada"}
        </div>
        {retryCount > 0 && (
          <div style={{ color: "#ffffff20", fontSize: 11, marginTop: 6 }}>
            Tentativa {retryCount}...
          </div>
        )}
        <div style={{ color: "#ffffff15", fontSize: 10, marginTop: 8, fontFamily: "monospace" }}>{code.slice(0, 12)}</div>
        <button onClick={fetchPlaylist} style={S.retryBtn}>↻ Tentar agora</button>
      </div>
    </div>
  )

  const current = items[index]
  const prev    = prevIndex !== null ? items[prevIndex] : null
  if (!current) return null

  const ytId  = isYouTubeUrl(current.asset_url) ? getYouTubeId(current.asset_url) : null
  const isHls = !ytId && isHlsUrl(current.asset_url, current.type)

  return (
    <div style={S.screen}>

      {/* Layer saindo */}
      {prev && transitioning && (
        <div style={getTransitionStyles(transition, "exit")}>
          <ItemContent item={prev} onStart={() => {}} onEnd={() => {}} onAdvance={() => {}} />
        </div>
      )}

      {/* Layer entrando */}
      <div style={getTransitionStyles(transition, transitioning ? "enter" : "active")}>
        <ItemContent
          item={current}
          videoRef={videoRef}
          onStart={() => reportStart(current)}
          onEnd={() => reportEnd(current, current.duration ?? 30)}
          onAdvance={advance}
        />
      </div>

      {/* Flash */}
      {flashVisible && (
        <div style={{ position: "absolute", inset: 0, background: "#fff", opacity: 0.85, pointerEvents: "none", zIndex: 10 }} />
      )}

      {/* Widget clima */}
      {weather && (
        <div style={S.weatherWidget}>
          <span style={{ fontSize: 26 }}>{weather.emoji}</span>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", lineHeight: 1 }}>{weather.temperature}°C</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", marginTop: 2 }}>{weather.city} · {weather.condition}</div>
          </div>
        </div>
      )}

      {/* HUD mínimo — só em desenvolvimento */}
      {process.env.NODE_ENV === "development" && (
        <div style={{ ...S.hud, zIndex: 20 }}>
          <span style={{ color: "#C9A84C", fontFamily: "monospace", fontSize: 9 }}>{code.slice(0, 8)}</span>
          <span style={{ color: "#ffffff30", fontSize: 9 }}>{index + 1}/{items.length}</span>
          {ytId && <span style={{ color: "#ff000070", fontSize: 9 }}>YT</span>}
          {isHls && <span style={{ color: "#ef444470", fontSize: 9 }}>LIVE</span>}
          <span style={{ color: "#ffffff15", fontSize: 9 }}>{transition}</span>
        </div>
      )}

      {/* Toast proof-of-play */}
      {verified && (
        <div style={{ ...S.toast, zIndex: 20 }}>
          <span style={{ fontSize: 14 }}>🔐</span>
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, color: "#C9A84C" }}>Exibição registrada</div>
            <div style={{ fontSize: 9, color: "#ffffff40" }}>Prova criptográfica gerada</div>
          </div>
        </div>
      )}
    </div>
  )
}

const S: Record<string, React.CSSProperties> = {
  screen:        { position: "fixed", inset: 0, background: "#000", overflow: "hidden", cursor: "none" },
  center:        { position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 },
  brand:         { fontSize: 32, fontWeight: 700, color: "#C9A84C", letterSpacing: "0.25em", fontFamily: "Georgia, serif" },
  spinnerWrap:   { width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center" },
  spinner:       { width: 10, height: 10, borderRadius: "50%", background: "#C9A84C", animation: "pulse 1.2s ease-in-out infinite" },
  retryBtn:      { marginTop: 20, padding: "10px 24px", background: "#C9A84C", color: "#000", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 },
  hud:           { position: "absolute", bottom: 10, left: 10, display: "flex", gap: 6, alignItems: "center", background: "#00000060", borderRadius: 5, padding: "2px 7px" },
  toast:         { position: "absolute", bottom: 40, right: 14, background: "#0a0a0af0", border: "1px solid #C9A84C30", borderRadius: 8, padding: "7px 12px", display: "flex", gap: 8, alignItems: "center" },
  weatherWidget: { position: "absolute", top: 14, right: 14, zIndex: 20, background: "rgba(0,0,0,0.5)", borderRadius: 10, padding: "8px 14px", display: "flex", alignItems: "center", gap: 10, border: "1px solid rgba(255,255,255,0.08)" },
}
