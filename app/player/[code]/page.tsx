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

// Extrai o video_id de qualquer formato de URL do YouTube
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

function isHlsUrl(url: string, type: string): boolean {
  return type === "hls" || type === "stream" || /\.m3u8(\?|$)/i.test(url)
}

function isYouTubeUrl(url: string): boolean {
  return /youtube\.com|youtu\.be/.test(url)
}

function isVideoUrl(url: string, type: string): boolean {
  return type === "video" || /\.(mp4|webm|mov)(\?|$)/i.test(url)
}

function isImageUrl(url: string, type: string): boolean {
  return type === "image" || /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(url)
}

export default function PlayerPage({ params }: { params: { code: string } }) {
  const [items, setItems] = useState<PlaylistItem[]>([])
  const [index, setIndex] = useState(0)
  const [state, setState] = useState<PlayerState>("loading")
  const [errorMsg, setErrorMsg] = useState("")
  const [verified, setVerified] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hlsRef = useRef<Hls | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const code = params.code

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(code)

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
      setItems(data.items)
      setState("playing")
    } catch {
      setState("error")
      setErrorMsg("Sem conexão com o servidor")
    }
  }, [code, isUuid])

  useEffect(() => {
    fetchPlaylist()
    const iv = setInterval(fetchPlaylist, 5 * 60 * 1000)
    return () => {
      clearInterval(iv)
      hlsRef.current?.destroy()
    }
  }, [fetchPlaylist])

  const advance = useCallback(() => {
    setIndex(prev => (prev + 1) % items.length)
  }, [items.length])

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

  // Timer para imagens, iframes e YouTube
  useEffect(() => {
    if (state !== "playing" || !items.length) return
    const item = items[index]

    // Vídeo MP4 usa onEnded — não precisa de timer
    if (isVideoUrl(item.asset_url, item.type)) return

    reportStart(item)
    const duration = (item.duration ?? 30) * 1000
    timerRef.current = setTimeout(async () => {
      await reportEnd(item, item.duration ?? 30)
      advance()
    }, duration)

    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [index, items, state, advance, reportStart, reportEnd])

  // Attach HLS.js when streaming item is active
  useEffect(() => {
    if (state !== "playing" || !items.length) return
    const item = items[index]
    if (!isHlsUrl(item.asset_url, item.type)) return

    const video = videoRef.current
    if (!video) return

    hlsRef.current?.destroy()

    if (Hls.isSupported()) {
      const hls = new Hls({ lowLatencyMode: true })
      hlsRef.current = hls
      hls.loadSource(item.asset_url)
      hls.attachMedia(video)
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {})
        reportStart(item)
      })
      hls.on(Hls.Events.ERROR, (_e: any, data: any) => {
        if (data.fatal) advance()
      })
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Safari native HLS
      video.src = item.asset_url
      video.play().catch(() => {})
      reportStart(item)
    } else {
      advance()
    }

    return () => {
      hlsRef.current?.destroy()
      hlsRef.current = null
    }
  }, [index, items, state, advance, reportStart])

  if (state === "loading") return (
    <div style={S.screen}>
      <div style={S.center}>
        <div style={S.brand}>DOOHPLAY</div>
        <div style={S.spinner} />
        <div style={{ color: "#C9A84C60", fontSize: 13 }}>Carregando...</div>
      </div>
    </div>
  )

  if (state === "error" || state === "empty") return (
    <div style={S.screen}>
      <div style={S.center}>
        <div style={S.brand}>DOOHPLAY</div>
        <div style={{ color: state === "error" ? "#ff6b6b" : "#C9A84C80", fontSize: 13, marginTop: 16 }}>
          {state === "error" ? errorMsg : "Nenhuma mídia configurada"}
        </div>
        <div style={{ color: "#ffffff20", fontSize: 11, marginTop: 6 }}>{code}</div>
        <button onClick={fetchPlaylist} style={S.retryBtn}>Tentar novamente</button>
      </div>
    </div>
  )

  const current = items[index]
  if (!current) return null

  const ytId = isYouTubeUrl(current.asset_url) ? getYouTubeId(current.asset_url) : null
  const isHls = !ytId && isHlsUrl(current.asset_url, current.type)
  const isVid = !ytId && !isHls && isVideoUrl(current.asset_url, current.type)
  const isImg = !ytId && !isHls && !isVid && isImageUrl(current.asset_url, current.type)

  return (
    <div style={S.screen}>

      {/* ── HLS / Live stream ── */}
      {isHls && (
        <video
          key={current.asset_url}
          ref={videoRef}
          autoPlay muted playsInline
          style={S.fill}
          onPlay={() => reportStart(current)}
          onError={advance}
        />
      )}

      {/* ── YouTube embed ── */}
      {ytId && (
        <iframe
          key={`yt-${ytId}-${index}`}
          src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${ytId}&rel=0&showinfo=0&modestbranding=1&iv_load_policy=3`}
          style={{ ...S.fill, border: "none" }}
          allow="autoplay; fullscreen"
          allowFullScreen
          onLoad={() => reportStart(current)}
        />
      )}

      {/* ── Vídeo MP4 / WebM ── */}
      {!ytId && isVid && (
        <video
          key={current.asset_url}
          src={current.asset_url}
          autoPlay muted playsInline
          style={S.fill}
          onPlay={() => reportStart(current)}
          onEnded={async () => { await reportEnd(current, current.duration ?? 30); advance() }}
          onError={advance}
        />
      )}

      {/* ── Imagem ── */}
      {!ytId && !isVid && isImg && (
        <img
          key={current.asset_url}
          src={current.asset_url}
          alt=""
          style={S.fill}
          onLoad={() => reportStart(current)}
          onError={advance}
        />
      )}

      {/* ── URL / iframe (portal, studio preview, etc) ── */}
      {!ytId && !isVid && !isImg && (
        <iframe
          key={current.asset_url}
          src={current.asset_url}
          style={{ ...S.fill, border: "none" }}
          onLoad={() => reportStart(current)}
        />
      )}

      {/* ── HLS useEffect ── */}
      {isHls && (() => {
        // HLS setup happens via useEffect below — placeholder for render order
        return null
      })()}

      {/* ── HUD ── */}
      <div style={S.hud}>
        <span style={{ color: "#C9A84C", fontFamily: "monospace", fontSize: 10 }}>
          {code.slice(0, 8).toUpperCase()}
        </span>
        {current.campaign_id && (
          <span style={{ color: "#ffffff40", fontSize: 10 }}>
            {index + 1}/{items.length}
          </span>
        )}
        {ytId && (
          <span style={{ color: "#ff000080", fontSize: 9 }}>▶ YT</span>
        )}
        {isHls && (
          <span style={{ color: "#ef444480", fontSize: 9 }}>● LIVE</span>
        )}
      </div>

      {/* ── Toast verificado ── */}
      {verified && (
        <div style={S.toast}>
          <span>🔐</span>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#C9A84C" }}>Exibição registrada</div>
            <div style={{ fontSize: 9, color: "#ffffff50" }}>Prova criptográfica gerada</div>
          </div>
        </div>
      )}
    </div>
  )
}

const S: Record<string, React.CSSProperties> = {
  screen: { position: "fixed", inset: 0, background: "#000", overflow: "hidden", cursor: "none" },
  fill: { width: "100%", height: "100%", objectFit: "cover" },
  center: { position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 },
  brand: { fontSize: 28, fontWeight: 700, color: "#C9A84C", letterSpacing: "0.2em", fontFamily: "Georgia, serif" },
  spinner: { width: 8, height: 8, borderRadius: "50%", background: "#C9A84C" },
  retryBtn: { marginTop: 16, padding: "8px 20px", background: "#C9A84C", color: "#000", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13 },
  hud: { position: "absolute", bottom: 12, left: 12, display: "flex", gap: 8, alignItems: "center", background: "#00000070", borderRadius: 6, padding: "3px 8px" },
  toast: { position: "absolute", bottom: 44, right: 12, background: "#0a0a0aee", border: "1px solid #C9A84C40", borderRadius: 8, padding: "8px 12px", display: "flex", gap: 8, alignItems: "center" },
}
