"use client"

import { useEffect, useState, useRef, Suspense } from "react"
import { useSearchParams } from "next/navigation"

const BG    = "#000000"
const TEXT  = "#FFFFFF"
const BLUE  = "#3B82F6"
const GREEN = "#10B981"
const GRAY  = "#1F2937"

type Slide = {
  id: string
  type: "image" | "video" | "text"
  url?: string
  title?: string
  subtitle?: string
  duration: number
  bg?: string
}

const DEFAULT_SLIDES: Slide[] = [
  {
    id: "d1", type: "text",
    title: "Bem-vindo ao DOOHPLAY",
    subtitle: "Publicidade verificada em blockchain",
    duration: 8000, bg: "#0B1020",
  },
  {
    id: "d2", type: "text",
    title: "Sua tela está ativa",
    subtitle: "Anúncios serão exibidos em breve",
    duration: 8000, bg: "#111827",
  },
]

function Clock() {
  const [time, setTime] = useState("")
  const [date, setDate] = useState("")

  useEffect(() => {
    const tick = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }))
      setDate(now.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" }))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div style={{ textAlign: "right" }}>
      <div style={{ fontSize: 28, fontWeight: 700, color: TEXT, fontVariantNumeric: "tabular-nums" }}>{time}</div>
      <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2, textTransform: "capitalize" }}>{date}</div>
    </div>
  )
}

function PlayerInner() {
  const params      = useSearchParams()
  const code        = params.get("screen") ?? params.get("code") ?? ""
  const [slides, setSlides]       = useState<Slide[]>(DEFAULT_SLIDES)
  const [current, setCurrent]     = useState(0)
  const [loaded, setLoaded]       = useState(false)
  const [online, setOnline]       = useState(true)
  const [clientName, setClientName] = useState("")
  const timerRef    = useRef<ReturnType<typeof setTimeout> | null>(null)
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Carrega playlist do cliente
  useEffect(() => {
    if (!code) return
    fetch(`/api/player/playlist?code=${code}`)
      .then(r => r.json())
      .then(d => {
        if (d.slides?.length > 0) setSlides(d.slides)
        if (d.name) setClientName(d.name)
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [code])

  // Heartbeat a cada 30s
  useEffect(() => {
    if (!code) return
    const ping = () => {
      fetch("/api/player/heartbeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      })
        .then(() => setOnline(true))
        .catch(() => setOnline(false))
    }
    ping()
    heartbeatRef.current = setInterval(ping, 30000)
    return () => { if (heartbeatRef.current) clearInterval(heartbeatRef.current) }
  }, [code])

  // Avança slides automaticamente
  useEffect(() => {
    if (!loaded || slides.length === 0) return
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setCurrent(c => (c + 1) % slides.length)
    }, slides[current]?.duration ?? 8000)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [current, slides, loaded])

  // Fullscreen automático ao clicar
  const handleClick = () => {
    const el = document.documentElement
    if (!document.fullscreenElement) {
      el.requestFullscreen?.()
    }
  }

  const slide = slides[current]

  return (
    <div
      onClick={handleClick}
      style={{
        width: "100vw", height: "100vh", overflow: "hidden",
        background: BG, cursor: "none", position: "relative",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* Slide principal */}
      {slide.type === "text" && (
        <div style={{
          width: "100%", height: "100%",
          background: slide.bg ?? BG,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "10%",
        }}>
          {/* Logo */}
          <div style={{ marginBottom: 32, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: 10, background: BLUE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800, color: TEXT }}>D</div>
            <span style={{ fontSize: 22, fontWeight: 800, color: TEXT, letterSpacing: "-0.02em" }}>DOOHPLAY</span>
          </div>
          {clientName && (
            <div style={{ fontSize: 16, color: "#9CA3AF", marginBottom: 20, fontWeight: 500 }}>{clientName}</div>
          )}
          <div style={{ fontSize: 48, fontWeight: 800, color: TEXT, textAlign: "center", lineHeight: 1.2, marginBottom: 16 }}>
            {slide.title}
          </div>
          <div style={{ fontSize: 22, color: "#9CA3AF", textAlign: "center" }}>{slide.subtitle}</div>
        </div>
      )}

      {slide.type === "image" && slide.url && (
        <img
          src={slide.url}
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      )}

      {slide.type === "video" && slide.url && (
        <video
          key={slide.url}
          src={slide.url}
          autoPlay muted playsInline
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onEnded={() => setCurrent(c => (c + 1) % slides.length)}
        />
      )}

      {/* HUD — barra inferior */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        padding: "16px 32px",
        background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)",
        display: "flex", alignItems: "flex-end", justifyContent: "space-between",
      }}>
        {/* Logo + status */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: online ? GREEN : "#EF4444" }} />
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>
            DOOHPLAY {code && `· ${code.toUpperCase()}`}
          </span>
        </div>

        {/* Indicador de slides */}
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {slides.map((_, i) => (
            <div key={i} style={{
              width: i === current ? 20 : 6, height: 6,
              borderRadius: 3,
              background: i === current ? BLUE : "rgba(255,255,255,0.3)",
              transition: "all .3s",
            }} />
          ))}
        </div>

        {/* Relógio */}
        <Clock />
      </div>

      {/* Tela de pareamento se não tiver código */}
      {!code && (
        <div style={{
          position: "absolute", inset: 0,
          background: "rgba(0,0,0,0.92)",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 16,
        }}>
          <div style={{ fontSize: 48, fontWeight: 800, color: TEXT, marginBottom: 8 }}>DOOHPLAY</div>
          <div style={{ fontSize: 18, color: "#9CA3AF", marginBottom: 24 }}>Tela não configurada</div>
          <div style={{ background: GRAY,
