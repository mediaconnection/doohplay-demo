"use client"

import { useEffect, useState, useRef, useCallback } from "react"

interface PlaylistItem {
  id: string
  type: "image" | "video" | "url" | "youtube" | "hls"
  url: string
  duration: number
  campaign_id?: string
  asset_url?: string
}

const HEARTBEAT_INTERVAL = 30_000  // 30s
const RELOAD_INTERVAL    = 60_000  // 1min — atualiza playlist
const ERROR_RETRY        = 5_000   // 5s — retry em erro

export default function PlayerPage() {
  const [playlist, setPlaylist]   = useState<PlaylistItem[]>([])
  const [index, setIndex]         = useState(0)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState("")
  const [online, setOnline]       = useState(true)
  const [lastSync, setLastSync]   = useState<Date | null>(null)
  const wakeLockRef               = useRef<any>(null)
  const timerRef                  = useRef<ReturnType<typeof setTimeout> | null>(null)

  const screenId = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get("screen") ?? ""
    : ""

  // ── Wake Lock — mantém tela ligada ─────────────────────────────────────────
  const acquireWakeLock = useCallback(async () => {
    try {
      if ("wakeLock" in navigator) {
        wakeLockRef.current = await (navigator as any).wakeLock.request("screen")
        wakeLockRef.current.addEventListener("release", () => {
          // Re-adquire se perdeu (ex: tab ficou em background)
          setTimeout(acquireWakeLock, 1000)
        })
      }
    } catch {}
  }, [])

  // ── Online/Offline ──────────────────────────────────────────────────────────
  useEffect(() => {
    const onOnline  = () => setOnline(true)
    const onOffline = () => setOnline(false)
    window.addEventListener("online",  onOnline)
    window.addEventListener("offline", onOffline)
    return () => {
      window.removeEventListener("online",  onOnline)
      window.removeEventListener("offline", onOffline)
    }
  }, [])

  // ── Visibilidade — re-adquire wake lock quando volta ao foco ───────────────
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") acquireWakeLock()
    }
    document.addEventListener("visibilitychange", onVisible)
    acquireWakeLock()
    return () => document.removeEventListener("visibilitychange", onVisible)
  }, [acquireWakeLock])

  // ── Fullscreen automático (Fire Stick) ─────────────────────────────────────
  useEffect(() => {
    const goFullscreen = () => {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {})
      }
    }
    // Tenta fullscreen no primeiro clique/toque (Fire Stick remote)
    document.addEventListener("click", goFullscreen, { once: true })
    document.addEventListener("keydown", goFullscreen, { once: true })
  }, [])

  // ── Heartbeat ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!screenId) return
    const sendHeartbeat = () => {
      fetch("/api/events/players/heartbeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ screen_id: screenId }),
      }).catch(() => {})
    }
    sendHeartbeat()
    const interval = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL)
    return () => clearInterval(interval)
  }, [screenId])

  // ── Carrega playlist ────────────────────────────────────────────────────────
  const loadPlaylist = useCallback(async () => {
    if (!screenId) {
      setError("screen_id não informado. Acesse: /player?screen=SEU_ID")
      setLoading(false)
      return
    }
    try {
      const res  = await fetch(`/api/player/playlist?screen=${screenId}`)
      const data = await res.json()
      if (data.items?.length) {
        setPlaylist(data.items)
        setError("")
        setLastSync(new Date())
      }
    } catch {
      setError("Sem conexão — tentando reconectar...")
    } finally {
      setLoading(false)
    }
  }, [screenId])

  useEffect(() => {
    loadPlaylist()
    const interval = setInterval(loadPlaylist, RELOAD_INTERVAL)
    return () => clearInterval(interval)
  }, [loadPlaylist])

  // ── Retry automático em erro ────────────────────────────────────────────────
  useEffect(() => {
    if (!error) return
    const t = setTimeout(loadPlaylist, ERROR_RETRY)
    return () => clearTimeout(t)
  }, [error, loadPlaylist])

  // ── Registra exibição ───────────────────────────────────────────────────────
  const registerDisplay = useCallback((item: PlaylistItem) => {
    fetch("/api/events/display", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        screen_id:   screenId,
        campaign_id: item.campaign_id,
        asset_url:   item.url || item.asset_url,
        timestamp:   new Date().toISOString(),
      }),
    }).catch(() => {})
  }, [screenId])

  // ── Loop de playback ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!playlist.length) return
    if (timerRef.current) clearTimeout(timerRef.current)

    const item = playlist[index]
    registerDisplay(item)

    timerRef.current = setTimeout(() => {
      setIndex(prev => (prev + 1 >= playlist.length ? 0 : prev + 1))
    }, (item.duration || 15) * 1000)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [index, playlist, registerDisplay])

  // ── Tela de loading ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={fullscreen("#000")}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📺</div>
          <div style={{ color: "#fff", fontSize: 18, fontWeight: 600, marginBottom: 8 }}>DOOHPLAY</div>
          <div style={{ color: "#6b7280", fontSize: 14 }}>Carregando playlist...</div>
        </div>
      </div>
    )
  }

  // ── Tela de erro / sem playlist ─────────────────────────────────────────────
  if (error || !playlist.length) {
    return (
      <div style={fullscreen("#0a0a0a")}>
        <div style={{ textAlign: "center", maxWidth: 480, padding: "2rem" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>{online ? "⏳" : "📡"}</div>
          <div style={{ color: "#fff", fontSize: 20, fontWeight: 700, marginBottom: 8 }}>DOOHPLAY</div>
          <div style={{ color: "#9ca3af", fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
            {error || "Nenhum conteúdo na playlist ainda."}
          </div>
          <div style={{ color: "#4b5563", fontSize: 11 }}>
            {online ? "🟢 Online" : "🔴 Offline"} · Tentando reconectar...
            {lastSync && <span> · Última sync: {lastSync.toLocaleTimeString("pt-BR")}</span>}
          </div>
          {screenId && (
            <div style={{ marginTop: 16, background: "#1f2937", borderRadius: 8, padding: "8px 16px", fontSize: 11, color: "#6b7280", fontFamily: "monospace" }}>
              screen: {screenId}
            </div>
          )}
        </div>
      </div>
    )
  }

  const item = playlist[index]
  const url  = item.url || item.asset_url || ""
  const type = item.type || detectType(url)

  // ── Renderiza item atual ────────────────────────────────────────────────────
  return (
    <div style={fullscreen("#000")}>

      {/* Imagem */}
      {type === "image" && (
        <img
          key={url}
          src={url}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          alt=""
        />
      )}

      {/* Vídeo */}
      {type === "video" && (
        <video
          key={url}
          src={url}
          autoPlay
          muted
          playsInline
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onEnded={() => setIndex(prev => (prev + 1 >= playlist.length ? 0 : prev + 1))}
        />
      )}

      {/* Template / URL */}
      {(type === "url" || type === "template") && (
        <iframe
          key={url}
          src={url}
          style={{ width: "100%", height: "100%", border: "none" }}
          allowFullScreen
        />
      )}

      {/* YouTube */}
      {type === "youtube" && (
        <iframe
          key={url}
          src={toYouTubeEmbed(url)}
          style={{ width: "100%", height: "100%", border: "none" }}
          allow="autoplay; fullscreen"
          allowFullScreen
        />
      )}

      {/* HLS / Live */}
      {type === "hls" && (
        <video
          key={url}
          src={url}
          autoPlay
          muted
          playsInline
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      )}

      {/* Indicador de status — invisível mas presente para debug */}
      <div style={{
        position: "fixed", bottom: 8, right: 8,
        fontSize: 9, color: "rgba(255,255,255,0.15)",
        fontFamily: "monospace",
        pointerEvents: "none",
      }}>
        {index + 1}/{playlist.length} · {online ? "●" : "○"}
      </div>

    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function fullscreen(bg: string): React.CSSProperties {
  return {
    width: "100vw", height: "100vh", background: bg,
    display: "flex", alignItems: "center", justifyContent: "center",
    overflow: "hidden", margin: 0, padding: 0,
    fontFamily: "system-ui, sans-serif",
  }
}

function detectType(url: string): PlaylistItem["type"] {
  if (!url) return "image"
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube"
  if (url.endsWith(".m3u8")) return "hls"
  if (/\.(mp4|webm|mov)$/i.test(url)) return "video"
  if (url.startsWith("http") && !url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) return "url"
  return "image"
}

function toYouTubeEmbed(url: string): string {
  const id = url.match(/(?:v=|youtu\.be\/)([^&?]+)/)?.[1] ?? ""
  return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&modestbranding=1`
}
