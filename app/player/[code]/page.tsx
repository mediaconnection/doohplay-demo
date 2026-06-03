"use client"

import { useEffect, useRef, useState, useCallback } from "react"

/* =========================
   TYPES
========================= */
type PlaylistItem = {
  campaign_id: string
  campaign_name: string
  media_id: string | null
  url: string
  type: string
  duration: number
  file_name: string | null
}

type PlayerInfo = {
  id: string
  name: string
  location: string | null
  code: string
}

type PlaylistResponse = {
  ok: boolean
  player: PlayerInfo
  playlist: PlaylistItem[]
  error?: string
}

/* =========================
   PLAYER PAGE
========================= */
export default function PlayerPage({ params }: { params: { code: string } }) {
  const [playlist, setPlaylist] = useState<PlaylistItem[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [player, setPlayer] = useState<PlayerInfo | null>(null)
  const [status, setStatus] = useState<"loading" | "playing" | "error" | "empty">("loading")
  const [errorMsg, setErrorMsg] = useState("")
  const [lastVerifyUrl, setLastVerifyUrl] = useState<string | null>(null)
  const [showVerify, setShowVerify] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const code = params.code.toUpperCase()

  /* ── Buscar playlist ── */
  const fetchPlaylist = useCallback(async () => {
    try {
      const res = await fetch(`/api/player/playlist?code=${code}`, { cache: "no-store" })
      const data: PlaylistResponse = await res.json()
      if (!data.ok || !data.playlist?.length) {
        setStatus("empty")
        return
      }
      setPlayer(data.player)
      setPlaylist(data.playlist)
      setStatus("playing")
    } catch {
      setStatus("error")
      setErrorMsg("Sem conexão com o servidor")
    }
  }, [code])

  useEffect(() => {
    fetchPlaylist()
    // Refresh da playlist a cada 5 minutos
    const interval = setInterval(fetchPlaylist, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [fetchPlaylist])

  /* ── Registrar exibição e avançar ── */
  const reportAndAdvance = useCallback(async (item: PlaylistItem) => {
    try {
      const res = await fetch("/api/player/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          player_code: code,
          campaign_id: item.campaign_id,
          duration: item.duration,
          media_id: item.media_id,
          played_at: new Date().toISOString(),
        }),
      })
      const data = await res.json()
      if (data.verify_url) {
        setLastVerifyUrl(data.verify_url)
        setShowVerify(true)
        setTimeout(() => setShowVerify(false), 4000)
      }
    } catch {
      // silencioso — não interrompe o player
    }
  }, [code])

  /* ── Avançar para próximo item ── */
  const advance = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % playlist.length)
  }, [playlist.length])

  /* ── Timer por item ── */
  useEffect(() => {
    if (status !== "playing" || !playlist.length) return
    const item = playlist[currentIndex]
    const isVideo = item.type?.includes("video") || item.url?.match(/\.(mp4|webm|mov|avi)$/i)

    if (!isVideo) {
      // Imagem: usar duration da campanha
      timerRef.current = setTimeout(async () => {
        await reportAndAdvance(item)
        advance()
      }, (item.duration ?? 30) * 1000)
    }

    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [currentIndex, playlist, status, advance, reportAndAdvance])

  const current = playlist[currentIndex]

  /* ── TELAS ── */

  if (status === "loading") {
    return (
      <div style={styles.fullscreen}>
        <div style={styles.loadingWrap}>
          <div style={styles.logo}>DOOHPLAY</div>
          <div style={styles.loadingDot} />
          <div style={{ color: "#C9A84C80", fontSize: 14 }}>Carregando playlist...</div>
          <div style={{ color: "#ffffff30", fontSize: 12, marginTop: 8 }}>{code}</div>
        </div>
      </div>
    )
  }

  if (status === "error" || status === "empty") {
    return (
      <div style={styles.fullscreen}>
        <div style={styles.loadingWrap}>
          <div style={styles.logo}>DOOHPLAY</div>
          <div style={{ color: "#ff6b6b", fontSize: 14, marginTop: 16 }}>
            {status === "error" ? errorMsg : "Nenhuma mídia configurada"}
          </div>
          <div style={{ color: "#ffffff30", fontSize: 12, marginTop: 8 }}>{code}</div>
          <button
            onClick={fetchPlaylist}
            style={{ marginTop: 20, padding: "8px 20px", background: "#C9A84C", color: "#000", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13 }}
          >
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  if (!current) return null

  const isVideo = current.type?.includes("video") || current.url?.match(/\.(mp4|webm|mov|avi)$/i)

  return (
    <div style={styles.fullscreen}>
      {/* ── Mídia ── */}
      {isVideo ? (
        <video
          key={current.url}
          src={current.url}
          autoPlay
          muted
          playsInline
          style={styles.media}
          onEnded={async () => {
            await reportAndAdvance(current)
            advance()
          }}
          onError={advance}
        />
      ) : (
        <img
          key={current.url}
          src={current.url}
          alt={current.campaign_name}
          style={styles.media}
          onError={advance}
        />
      )}

      {/* ── HUD — info discreta ── */}
      <div style={styles.hud}>
        <span style={styles.hudCode}>{code}</span>
        <span style={styles.hudName}>{current.campaign_name}</span>
      </div>

      {/* ── Toast de verificação ── */}
      {showVerify && lastVerifyUrl && (
        <div style={styles.verifyToast}>
          <span style={{ fontSize: 14 }}>🔐</span>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#C9A84C" }}>Exibição registrada</div>
            <div style={{ fontSize: 9, color: "#ffffff60", marginTop: 1 }}>Prova criptográfica gerada</div>
          </div>
        </div>
      )}
    </div>
  )
}

/* =========================
   STYLES
========================= */
const styles: Record<string, React.CSSProperties> = {
  fullscreen: {
    position: "fixed",
    inset: 0,
    background: "#000",
    overflow: "hidden",
    cursor: "none",
  },
  media: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  loadingWrap: {
    position: "absolute",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  logo: {
    fontSize: 32,
    fontWeight: 700,
    color: "#C9A84C",
    letterSpacing: "0.2em",
    fontFamily: "Georgia, serif",
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#C9A84C",
    animation: "pulse 1.5s infinite",
  },
  hud: {
    position: "absolute",
    bottom: 16,
    left: 16,
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#00000060",
    borderRadius: 6,
    padding: "4px 10px",
    backdropFilter: "blur(4px)",
  },
  hudCode: {
    fontSize: 10,
    color: "#C9A84C",
    fontFamily: "monospace",
    fontWeight: 700,
  },
  hudName: {
    fontSize: 10,
    color: "#ffffff60",
    maxWidth: 200,
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
  },
  verifyToast: {
    position: "absolute",
    bottom: 48,
    right: 16,
    background: "#0a0a0aee",
    border: "1px solid #C9A84C40",
    borderRadius: 8,
    padding: "8px 12px",
    display: "flex",
    alignItems: "center",
    gap: 8,
    backdropFilter: "blur(8px)",
  },
}
