"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import type { ClientData, PlayerData, StatsData, PlaylistItem, Payment } from "./page"

const C = {
  bg:      "#F8FAFC",
  white:   "#FFFFFF",
  sidebar: "#FFFFFF",
  border:  "#E5E7EB",
  border2: "#F3F4F6",
  blue:    "#2563EB",
  blueLt:  "#EFF6FF",
  blueBd:  "#BFDBFE",
  green:   "#16A34A",
  greenLt: "#DCFCE7",
  greenBd: "#86EFAC",
  amber:   "#D97706",
  amberLt: "#FFFBEB",
  red:     "#DC2626",
  redLt:   "#FEF2F2",
  gray50:  "#F9FAFB",
  gray100: "#F3F4F6",
  gray200: "#E5E7EB",
  gray300: "#D1D5DB",
  gray400: "#9CA3AF",
  gray500: "#6B7280",
  gray700: "#374151",
  gray900: "#111827",
  text:    "#111827",
  text2:   "#6B7280",
  text3:   "#9CA3AF",
}

const NAV = [
  { id: "dashboard", label: "Dashboard",     icon: "⊞",  desc: "Visão geral da sua tela e ganhos" },
  { id: "tv",        label: "Minha TV",      icon: "📺", desc: "Veja em tempo real o que está passando" },
  { id: "conteudo",  label: "Conteúdo",      icon: "🖼", desc: "Suas fotos e vídeos — envie aqui" },
  { id: "anuncios",  label: "Anúncios",      icon: "📢", desc: "Anúncios pagos de outras empresas na sua tela" },
  { id: "ganhos",    label: "Ganhos",        icon: "💵", desc: "Quanto você já recebeu e vai receber" },
  { id: "relatorios",label: "Relatórios",    icon: "📊", desc: "Números de exibição e desempenho" },
  { id: "playlist",  label: "Playlist",      icon: "▶️", desc: "Ordem e duração de cada conteúdo na tela" },
  { id: "clube",     label: "Clube de Telas",icon: "🤝", desc: "Troque conteúdo com outros estabelecimentos do bairro" },
  { id: "clientes",  label: "Meus Clientes", icon: "👥", desc: "Quem escaneou seu QR code" },
  { id: "config",    label: "Configurações", icon: "⚙",  desc: "Dados da sua conta e da tela" },
]

function fmt(n: number) {
  if (n >= 1000000) return `${(n/1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n/1000).toFixed(1)}K`
  return n.toLocaleString("pt-BR")
}
function fmtR(n: number) {
  return `R$ ${n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
function fmtDate(d?: string | null, short = false) {
  if (!d) return "—"
  try {
    const opts: Intl.DateTimeFormatOptions = short
      ? { day: "2-digit", month: "short" }
      : { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" }
    return new Intl.DateTimeFormat("pt-BR", opts).format(new Date(d))
  } catch { return "—" }
}

function usePlayerStatus(playerId: string | null, initialOnline: boolean) {
  const [online, setOnline]     = useState(initialOnline)
  const [lastSeen, setLastSeen] = useState<string | null>(null)
  const [checking, setChecking] = useState(false)
  useEffect(() => {
    if (!playerId) return
    async function check() {
      setChecking(true)
      try {
        const res = await fetch(`/api/player/status?id=${playerId}`, { cache: "no-store" })
        if (res.ok) {
          const data = await res.json()
          const isOnline = data.last_ping ? (Date.now() - new Date(data.last_ping).getTime()) < 3 * 60 * 1000 : false
          setOnline(isOnline)
          setLastSeen(data.last_ping ?? null)
        }
      } catch {}
      finally { setChecking(false) }
    }
    check()
    const interval = setInterval(check, 30_000)
    return () => clearInterval(interval)
  }, [playerId])
  return { online, lastSeen, checking }
}

// ── Trial Banner ──────────────────────────────────────────────────────────────
function TrialBanner({ code }: { code: string }) {
  const [trial, setTrial] = useState<{ trial: boolean; days_left: number; plan: string; value: number; status: string } | null>(null)

  useEffect(() => {
    fetch(`/api/client/trial/${code}`)
      .then(r => r.json())
      .then(data => setTrial(data))
      .catch(() => {})
  }, [code])

  if (!trial || !trial.trial) return null

  const isUrgent  = trial.days_left <= 1
  const isWarning = trial.days_left <= 2

  const bg     = isUrgent ? "#450a0a" : isWarning ? "#431407" : "#052e16"
  const border = isUrgent ? "#ef444433" : isWarning ? "#f59e0b33" : "#16653433"
  const color  = isUrgent ? "#EF4444" : isWarning ? "#F59E0B" : "#4ade80"
  const icon   = isUrgent ? "⚠️" : isWarning ? "⏰" : "🎁"

  const message = trial.days_left === 0
    ? "Seu período grátis termina hoje! A cobrança começa amanhã."
    : trial.days_left === 1
    ? "Último dia do seu período grátis. A cobrança começa amanhã."
    : `Você tem ${trial.days_left} dias grátis restantes.`

  return (
    <div style={{
      background: bg,
      border: `1px solid ${border}`,
      borderRadius: 12,
      padding: "14px 20px",
      marginBottom: 20,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
      flexWrap: "wrap",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color }}>{message}</div>
          <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>
            Após o período, cobramos R$ {Number(trial.value).toFixed(2).replace(".", ",")} /mês via PIX ou boleto · Cancele quando quiser
          </div>
        </div>
      </div>
      {isWarning && (
        <a
          href={`https://wa.me/5511999999999?text=Oi! Sou o cliente ${code} e quero continuar com o DOOHPLAY`}
          target="_blank"
          rel="noreferrer"
          style={{
            background: color,
            color: "white",
            padding: "8px 16px",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 700,
            textDecoration: "none",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          Falar com suporte
        </a>
      )}
    </div>
  )
}

function KpiCard({ label, value, sub, icon, color = C.blue, onClick }: { label: string; value: string; sub?: string; icon: string; color?: string; onClick?: () => void }) {
  return (
    <div onClick={onClick} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 20px", cursor: onClick ? "pointer" : "default", flex: 1, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontSize: 12, color: C.text2, fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 18 }}>{icon}</span>
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, color: C.text, letterSpacing: "-0.03em" }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: sub.startsWith("+") ? C.green : C.text3, marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

function StatusBadge({ online, checking = false }: { online: boolean; checking?: boolean }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: online ? C.greenLt : C.redLt, border: `1px solid ${online ? C.greenBd : "#FECACA"}`, borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 500, color: online ? C.green : C.red, opacity: checking ? 0.6 : 1, transition: "opacity 0.3s" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor", display: "inline-block", animation: online ? "pulse 2s infinite" : "none" }} />
      {checking ? "Verificando…" : online ? "Online" : "Offline"}
    </span>
  )
}

function PlaylistThumb({ item, name }: { item: PlaylistItem; name: string }) {
  const [err, setErr] = useState(false)
  const isVideo = item.type === "video"
  if (item.asset_url && !err) {
    if (isVideo) return (
      <div style={{ height: 140, background: C.gray900, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
        <video src={item.asset_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} muted preload="metadata" onError={() => setErr(true)} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 28, opacity: 0.8 }}>▶</span></div>
      </div>
    )
    return <div style={{ height: 140, background: C.gray100, position: "relative" }}><img src={item.asset_url} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={() => setErr(true)} /></div>
  }
  return <div style={{ height: 140, background: C.gray100, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 40 }}>{isVideo ? "🎬" : "🖼"}</span></div>
}

function ModalPromocao({ code, onClose, onRefresh }: { code: string; onClose: () => void; onRefresh?: () => void }) {
  // Limites espelhando exatamente SIZE_LIMITS em app/api/studio/upload/route.ts
  const MAX_SIZE_MB_IMAGE = 10
  const MAX_SIZE_MB_VIDEO = 100
  const [mode, setMode]       = useState<"upload" | "ia">("upload")
  // ── Modo IA ──
  const [product, setProduct] = useState("")
  const [price, setPrice]     = useState("")
  const [detail, setDetail]   = useState("")
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated]   = useState<{ title: string; subtitle: string; cta: string; url: string } | null>(null)
  // ── Modo upload ──
  const [nome, setNome]       = useState("")
  const [duracao, setDuracao] = useState("15")
  const [file, setFile]       = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError]     = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const [photo, setPhoto] = useState<File | null>(null)

  const handleGenerate = async () => {
    if (!product.trim()) { setError("Informe o produto ou serviço"); return }
    setGenerating(true); setError("")
    try {
      const form = new FormData()
      form.append("code", code)
      form.append("product", product)
      form.append("price", price)
      form.append("detail", detail)
      if (photo) form.append("photo", photo)
      const res = await fetch("/api/client/generate-creative", { method: "POST", body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Erro ao gerar criativo")
      setGenerated({ ...data.copy, url: data.url })
      onRefresh?.()
    } catch (err: any) { setError(err.message || "Erro ao gerar criativo") }
    setGenerating(false)
  }

  const fmtSize = (bytes: number) => {
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
    return `${Math.round(bytes / 1024)}KB`
  }

  const handleFile = (f: File) => {
    setError("")
    const isVideo = f.type.startsWith("video")
    const maxMB = isVideo ? MAX_SIZE_MB_VIDEO : MAX_SIZE_MB_IMAGE
    const maxBytes = maxMB * 1024 * 1024
    if (f.size > maxBytes) {
      setError(`Esse arquivo tem ${fmtSize(f.size)}, e o limite pra ${isVideo ? "vídeo" : "imagem"} é ${maxMB}MB. Escolha um arquivo menor ou comprima antes de enviar.`)
      setFile(null)
      setPreview(null)
      return
    }
    if (!f.type.startsWith("image") && !f.type.startsWith("video")) {
      setError("Formato não suportado. Envie uma imagem (JPG, PNG) ou vídeo (MP4).")
      setFile(null)
      setPreview(null)
      return
    }
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }
  const handleSubmit = async () => {
    if (!nome.trim()) { setError("Informe o nome da promoção."); return }
    if (!file)        { setError("Selecione uma imagem ou vídeo."); return }
    setLoading(true); setError("")
    try {
      const formData = new FormData()
      formData.append("file", file); formData.append("name", nome); formData.append("duration", duracao); formData.append("code", code)
      const res = await fetch("/api/studio/upload", { method: "POST", body: formData })
      if (!res.ok) {
        let msg = "Erro ao enviar. Tente novamente."
        if (res.status === 413) {
          const maxMB = file?.type.startsWith("video") ? MAX_SIZE_MB_VIDEO : MAX_SIZE_MB_IMAGE
          msg = `Arquivo muito grande para o servidor (limite de ${maxMB}MB). Tente um arquivo menor.`
        } else {
          try {
            const data = await res.json()
            if (data?.error) {
              msg = data.error.toLowerCase().includes("limite")
                ? `${data.error} Exclua uma mídia antiga na aba Conteúdo para liberar espaço e enviar uma nova.`
                : data.error
            }
          } catch {}
        }
        throw new Error(msg)
      }
      setSuccess(true)
    } catch (err: any) { setError(err.message || "Erro ao enviar. Tente novamente.") }
    finally { setLoading(false) }
  }
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: C.white, borderRadius: 16, width: "100%", maxWidth: 480, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ padding: "20px 24px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>Enviar conteúdo para sua tela</div>
            <div style={{ fontSize: 12, color: C.text3 }}>Envie um arquivo ou gere um criativo com IA</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: C.text3, lineHeight: 1 }}>×</button>
        </div>

        {/* Seletor de modo */}
        <div style={{ display: "flex", borderBottom: `1px solid ${C.border}`, padding: "0 24px" }}>
          {([{ id: "ia", label: "✨ Gerar com IA" }, { id: "upload", label: "📁 Enviar arquivo" }] as const).map(m => (
            <button key={m.id} onClick={() => { setMode(m.id); setError("") }} style={{ padding: "12px 20px", fontSize: 13, fontWeight: mode === m.id ? 700 : 400, color: mode === m.id ? C.blue : C.text2, background: "none", border: "none", borderBottom: `2px solid ${mode === m.id ? C.blue : "transparent"}`, cursor: "pointer", marginBottom: -1 }}>
              {m.label}
            </button>
          ))}
        </div>

        <div style={{ padding: "20px 24px" }}>
          {mode === "ia" ? (
            generated ? (
              <div style={{ textAlign: "center", padding: "12px 0" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 6 }}>Criativo gerado com sucesso!</div>
                <div style={{ background: C.gray50, borderRadius: 10, padding: 14, marginBottom: 16, textAlign: "left" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{generated.title}</div>
                  <div style={{ fontSize: 12, color: C.text2 }}>{generated.subtitle}</div>
                  <div style={{ fontSize: 11, color: C.blue, marginTop: 4 }}>CTA: {generated.cta}</div>
                </div>
                <img src={generated.url} alt="criativo gerado" style={{ width: "100%", borderRadius: 8, marginBottom: 16 }} />
                <div style={{ fontSize: 12, color: C.text3, marginBottom: 16 }}>Adicionado à sua playlist — em análise antes de ir ao ar.</div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setGenerated(null)} style={{ flex: 1, padding: "10px", borderRadius: 8, border: `1px solid ${C.border}`, background: "transparent", fontSize: 13, color: C.text2, cursor: "pointer" }}>Gerar outro</button>
                  <button onClick={onClose} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "none", background: C.blue, color: C.white, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Fechar</button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.text2, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>O que você quer divulgar? *</label>
                  <input value={product} onChange={e => setProduct(e.target.value)} placeholder="Ex: Corte + Barba, Combo do Dia, Promoção de Aniversário…" style={{ width: "100%", boxSizing: "border-box", border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", fontSize: 14, color: C.text, outline: "none" }} />
                </div>
                <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.text2, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>Preço (opcional)</label>
                    <input value={price} onChange={e => setPrice(e.target.value)} placeholder="Ex: R$ 45" style={{ width: "100%", boxSizing: "border-box", border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", fontSize: 14, color: C.text, outline: "none" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.text2, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>Detalhe (opcional)</label>
                    <input value={detail} onChange={e => setDetail(e.target.value)} placeholder="Ex: Válido essa semana" style={{ width: "100%", boxSizing: "border-box", border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", fontSize: 14, color: C.text, outline: "none" }} />
                  </div>
                </div>
                {error && <div style={{ background: C.redLt, border: `1px solid #FECACA`, borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: C.red }}>⚠️ {error}</div>}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.text2, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>Foto do produto/espaço (opcional)</label>
                  <div onClick={() => document.getElementById("photo-input-ia")?.click()} style={{ border: `2px dashed ${photo ? C.green : C.border}`, borderRadius: 10, padding: "14px", textAlign: "center", cursor: "pointer", background: photo ? C.greenLt : C.gray50 }}>
                    {photo ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                        <img src={URL.createObjectURL(photo)} alt="preview" style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 6 }} />
                        <span style={{ fontSize: 12, color: C.green, fontWeight: 600 }}>✓ {photo.name}</span>
                      </div>
                    ) : (
                      <div style={{ fontSize: 12, color: C.text3 }}>📷 Clique pra adicionar uma foto — ela entra no layout do criativo</div>
                    )}
                  </div>
                  <input id="photo-input-ia" type="file" accept="image/*" style={{ display: "none" }} onChange={e => setPhoto(e.target.files?.[0] ?? null)} />
                </div>
                <button onClick={handleGenerate} disabled={generating} style={{ width: "100%", padding: "13px", borderRadius: 8, border: "none", background: generating ? C.gray300 : C.blue, color: C.white, fontSize: 14, fontWeight: 700, cursor: generating ? "not-allowed" : "pointer" }}>
                  {generating ? "Gerando criativo com IA… (pode levar até 30s)" : "✨ Gerar criativo agora"}
                </button>
                <div style={{ fontSize: 11, color: C.text3, marginTop: 10, textAlign: "center" }}>A IA cria o texto e o layout. A peça ainda passa pela revisão da equipe antes de ir ao ar.</div>
              </>
            )
          ) : (
            success ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 8 }}>Enviado com sucesso!</div>
                <div style={{ fontSize: 13, color: C.text2, marginBottom: 20 }}>Sua promoção está em análise. Em breve você receberá uma confirmação pelo WhatsApp.</div>
                <button onClick={onClose} style={{ background: C.blue, color: C.white, border: "none", borderRadius: 8, padding: "10px 24px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Fechar</button>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.text2, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>Nome da promoção *</label>
                  <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Combo do Dia…" style={{ width: "100%", boxSizing: "border-box", border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", fontSize: 14, color: C.text, outline: "none" }} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.text2, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>Duração em tela</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    {["10", "15", "20", "30"].map(s => (
                      <button key={s} onClick={() => setDuracao(s)} style={{ flex: 1, padding: "8px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", background: duracao === s ? C.blue : C.gray50, color: duracao === s ? C.white : C.text2, border: `1px solid ${duracao === s ? C.blue : C.border}` }}>{s}s</button>
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.text2, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>Arquivo *</label>
                  <div onDrop={handleDrop} onDragOver={e => e.preventDefault()} onClick={() => inputRef.current?.click()} style={{ border: `2px dashed ${file ? C.green : C.border}`, borderRadius: 10, padding: "20px", textAlign: "center", cursor: "pointer", background: file ? C.greenLt : C.gray50 }}>
                    {preview ? (
                      file?.type.startsWith("video") ? <video src={preview} style={{ maxHeight: 120, maxWidth: "100%", borderRadius: 6 }} controls /> : <img src={preview} alt="preview" style={{ maxHeight: 120, maxWidth: "100%", borderRadius: 6, objectFit: "cover" }} />
                    ) : (
                      <><div style={{ fontSize: 28, marginBottom: 8 }}>📁</div><div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 4 }}>Clique ou arraste o arquivo</div><div style={{ fontSize: 11, color: C.text3 }}>Imagem (JPG, PNG, máx. {MAX_SIZE_MB_IMAGE}MB) ou Vídeo (MP4, máx. {MAX_SIZE_MB_VIDEO}MB)</div></>
                    )}
                    <input ref={inputRef} type="file" accept="image/*,video/*" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
                  </div>
                  {file && <div style={{ fontSize: 11, color: C.green, marginTop: 6 }}>✓ {file.name} ({fmtSize(file.size)})</div>}
                </div>
                {error && <div style={{ background: C.redLt, border: `1px solid #FECACA`, borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: C.red }}>⚠️ {error}</div>}
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={onClose} style={{ flex: 1, padding: "11px", borderRadius: 8, border: `1px solid ${C.border}`, background: "transparent", fontSize: 13, fontWeight: 600, color: C.text2, cursor: "pointer" }}>Cancelar</button>
                  <button onClick={handleSubmit} disabled={loading} style={{ flex: 2, padding: "11px", borderRadius: 8, border: "none", background: loading ? C.gray300 : C.blue, color: C.white, fontSize: 13, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer" }}>{loading ? "Enviando…" : "Enviar para aprovação →"}</button>
                </div>
              </>
            )
          )}
        </div>
      </div>
    </div>
  )
}

function ModalConfirmDelete({ name, onConfirm, onCancel, loading }: { name: string; onConfirm: () => void; onCancel: () => void; loading: boolean }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: C.white, borderRadius: 16, width: "100%", maxWidth: 380, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", padding: "24px" }}>
        <div style={{ fontSize: 40, textAlign: "center", marginBottom: 12 }}>🗑️</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: C.text, textAlign: "center", marginBottom: 8 }}>Excluir esta mídia?</div>
        <div style={{ fontSize: 13, color: C.text2, textAlign: "center", marginBottom: 20 }}>
          "<strong>{name}</strong>" será removida da sua TV permanentemente. Essa ação não pode ser desfeita.
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancel} disabled={loading} style={{ flex: 1, padding: "11px", borderRadius: 8, border: `1px solid ${C.border}`, background: "transparent", fontSize: 13, fontWeight: 600, color: C.text2, cursor: "pointer" }}>
            Cancelar
          </button>
          <button onClick={onConfirm} disabled={loading} style={{ flex: 1, padding: "11px", borderRadius: 8, border: "none", background: loading ? C.gray300 : C.red, color: C.white, fontSize: 13, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "Excluindo…" : "Sim, excluir"}
          </button>
        </div>
      </div>
    </div>
  )
}

function TabDashboard({ client, player, stats, playlist, payments, onNav, onAddPromo, online, lastSeen, checking }: any) {
  const revenue = stats.revenue_month || 0
  const vizToday = stats.plays_today
  const sinceText = lastSeen
    ? (() => { const diff = Math.floor((Date.now() - new Date(lastSeen).getTime()) / 1000); if (diff < 60) return `${diff}s atrás`; if (diff < 3600) return `${Math.floor(diff/60)}min atrás`; return `${Math.floor(diff/3600)}h atrás` })()
    : player?.last_ping
      ? (() => { const diff = Math.floor((Date.now() - new Date(player.last_ping).getTime()) / 1000); if (diff < 60) return `${diff}s atrás`; if (diff < 3600) return `${Math.floor(diff/60)}min atrás`; return `${Math.floor(diff/3600)}h atrás` })()
      : "sem dados"

  // Anúncios reais — antes era um array mockado (Bradesco/iFood/Natura)
  // sempre exibido independente de existir anúncio real ou não. Reaproveita
  // a mesma rota já usada em TabAnuncios (GET /api/client/ads/[code]).
  const [ads, setAds] = useState<any[]>([])
  const [loadingAds, setLoadingAds] = useState(true)
  useEffect(() => {
    fetch(`/api/client/ads/${client.code}`)
      .then(r => r.json())
      .then(d => setAds(d.ads ?? []))
      .catch(() => setAds([]))
      .finally(() => setLoadingAds(false))
  }, [client.code])
  const activeAds = ads.filter((a: any) => a.status === "Ativo")
  const currentAd = activeAds[0] ?? null
  const nextAd = activeAds[1] ?? null
  const futuros = [
    { month: "Jul/26", value: 980,  label: "Receita prevista"  },
    { month: "Ago/26", value: 1120, label: "Estimado pela IA"  },
    { month: "Set/26", value: 1240, label: "Projeção otimista" },
  ]
  return (
    <div>
      {/* Trial Banner */}
      <TrialBanner code={client.code} />

      <div style={{ background: online ? C.greenLt : C.redLt, border: `1px solid ${online ? C.greenBd : "#FECACA"}`, borderRadius: 12, padding: "14px 20px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, background: online ? C.green : C.red, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: online ? C.green : C.red }}>{online ? "Sua TV está online e funcionando" : "Sua TV está offline"}</div>
            <div style={{ fontSize: 12, color: online ? C.green : C.red, opacity: 0.8 }}>Última sincronização: {sinceText}</div>
          </div>
        </div>
        <StatusBadge online={online} checking={checking} />
      </div>

      <div className="db-kpis" style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <KpiCard label="Receita este mês" value={fmtR(revenue)}    sub="Confirmado"       icon="💵" color={C.green} />
        <KpiCard label="Campanhas ativas" value={String(activeAds.length)} sub={ads.length > activeAds.length ? `${ads.length - activeAds.length} pausada(s)` : "—"} icon="▶"  color={C.blue}  />
        <KpiCard label="Visualizações"    value={fmt(vizToday)}    sub="+12% esta semana" icon="👁" color={C.blue}  />
        <KpiCard label="Status da TV"     value={online ? "Online" : "Offline"} sub={player?.id ? `SCR-${player.id.slice(0,5).toUpperCase()}` : "—"} icon="📶" color={online ? C.green : C.red} />
      </div>

      <div className="db-tv-grid" style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16, marginBottom: 20, alignItems: "start" }}>
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border2}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Minha TV Agora</div>
            <button onClick={() => onNav("tv")} style={{ fontSize: 12, color: C.blue, background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>Ao vivo →</button>
          </div>
          <div style={{ background: "#0F172A", margin: 16, borderRadius: 10, padding: "28px 16px", textAlign: "center", minHeight: 140, position: "relative" }}>
            <div style={{ position: "absolute", top: 10, left: 14, background: online ? C.green : C.red, color: C.white, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>{online ? "● AO VIVO" : "● OFFLINE"}</div>
            {loadingAds ? (
              <div style={{ fontSize: 12, color: "#94A3B8" }}>Carregando…</div>
            ) : currentAd ? (
              <>
                <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 6 }}>📢 ANÚNCIO ATIVO</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: C.white, marginBottom: 4 }}>{currentAd.campaign_name}</div>
                <div style={{ fontSize: 11, color: "#64748B", marginTop: 4 }}>{currentAd.advertiser_name}</div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 13, color: "#94A3B8", marginTop: 30 }}>Nenhum anúncio de terceiro ativo agora</div>
                <div style={{ fontSize: 11, color: "#64748B", marginTop: 4 }}>Sua tela está exibindo conteúdo próprio</div>
              </>
            )}
          </div>
        </div>
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 12 }}>Em exibição agora</div>
          {currentAd ? (
            <>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 2 }}>{currentAd.campaign_name}</div>
              <div style={{ fontSize: 12, color: C.text2, marginBottom: 16 }}>{currentAd.advertiser_name} · ativo</div>
            </>
          ) : (
            <div style={{ fontSize: 12, color: C.text2, marginBottom: 16 }}>Sem anúncio de terceiro no momento</div>
          )}
          <div style={{ width: 80, height: 80, background: C.gray100, borderRadius: 8, margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>⬛</div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.text2, marginBottom: 6 }}><span>Próximo anúncio</span><span style={{ fontWeight: 500 }}>{nextAd ? nextAd.campaign_name : "—"}</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.text2, marginBottom: 6 }}><span>Visualizações hoje</span><span style={{ fontWeight: 600, color: C.text }}>{fmt(vizToday)}</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.text2 }}><span>Ganho hoje</span><span style={{ fontWeight: 600, color: C.green }}>{fmtR(stats.revenue_today || 0)}</span></div>
        </div>
      </div>

      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden", marginBottom: 16 }}>
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border2}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Anúncios rodando</div>
          <button onClick={() => onNav("anuncios")} style={{ fontSize: 12, color: C.blue, background: "none", border: "none", cursor: "pointer" }}>Ver todos</button>
        </div>
        {loadingAds ? (
          <div style={{ padding: "20px 18px", fontSize: 13, color: C.text3 }}>Carregando…</div>
        ) : ads.length === 0 ? (
          <div style={{ padding: "20px 18px", fontSize: 13, color: C.text3 }}>Nenhum anúncio de terceiro cadastrado ainda.</div>
        ) : (
          ads.map((ad, i) => (
            <div key={ad.campaign_id ?? i} style={{ display: "flex", alignItems: "center", padding: "12px 18px", borderBottom: i < ads.length - 1 ? `1px solid ${C.border2}` : "none" }}>
              <div style={{ width: 36, height: 36, background: C.gray100, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, marginRight: 12, flexShrink: 0 }}>📢</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ad.campaign_name}</div>
                <div style={{ fontSize: 11, color: C.text3 }}>{ad.advertiser_name} · {Number(ad.views ?? 0).toLocaleString("pt-BR")} views</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 10, background: ad.status === "Ativo" ? C.greenLt : C.gray100, color: ad.status === "Ativo" ? C.green : C.text3 }}>{ad.status}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 18px" }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 14 }}>Ganhos Futuros</div>
        <div className="db-futuros" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
          {futuros.map((f, i) => (
            <div key={i} style={{ background: i === 0 ? C.blueLt : C.gray50, border: `1px solid ${i === 0 ? C.blueBd : C.border2}`, borderRadius: 10, padding: "14px" }}>
              <div style={{ fontSize: 11, color: C.text3, marginBottom: 4 }}>{f.month}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: i === 0 ? C.blue : C.green }}>{fmtR(f.value)}</div>
              <div style={{ fontSize: 10, color: C.text3, marginTop: 4 }}>{f.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function TabTV({ client, player, playlist, online, checking }: any) {
  // Telas físicas reais do cliente — a maioria tem só 1, então essa seção só
  // aparece visualmente quando há 2+ telas, pra não poluir o caso comum.
  const [screens, setScreens] = useState<any[]>([]);
  const [savingScreen, setSavingScreen] = useState<string | null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const loadScreens = () => {
    fetch(`/api/client/screens/${client.code}`)
      .then(r => r.json())
      .then(d => {
        setScreens(d.screens ?? [])
        if (!selectedPlayerId && d.screens?.length > 0) {
          setSelectedPlayerId(d.screens[0].player_id)
        }
      })
      .catch(() => setScreens([]));
  };
  useEffect(() => { loadScreens() }, [client.code]);

  const toggleSameContent = async (screenId: string, current: boolean) => {
    setSavingScreen(screenId)
    try {
      await fetch(`/api/client/screens/${client.code}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ screen_id: screenId, same_content: !current }),
      })
      loadScreens()
    } catch {}
    setSavingScreen(null)
  }

  const items = playlist.length > 0 ? playlist : [
    { id: "1", type: "ad",      duration: 15, position: 1, asset_url: null },
    { id: "2", type: "content", duration: 30, position: 2, asset_url: null },
    { id: "3", type: "ad",      duration: 15, position: 3, asset_url: null },
    { id: "4", type: "content", duration: 20, position: 4, asset_url: null },
  ]
  const names: Record<string, string> = { "1": "Bradesco — Black Friday", "2": "Cardápio do Dia", "3": "iFood — Cupom 30%", "4": "Boas-vindas Clientes" }
  const isPortrait = client?.screen_orientation === "portrait"
  return (
    <div>
      {screens.length > 1 && (
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden", marginBottom: 16 }}>
          <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border2}` }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Minhas Telas ({screens.length})</div>
            <div style={{ fontSize: 11, color: C.text3 }}>Escolha se cada tela repete o mesmo conteúdo ou tem playlist própria</div>
          </div>
          {screens.map((s: any) => (
            <div key={s.player_id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px", borderBottom: `1px solid ${C.border2}`, gap: 10, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text, display: "flex", alignItems: "center", gap: 5 }}>
                  {s.label || s.device_type}
                  {s.verified && (
                    <span title="Tela com histórico real de uptime comprovado nos últimos 30 dias" style={{ fontSize: 10, fontWeight: 700, color: C.green, background: C.greenLt, border: `1px solid ${C.greenBd}`, borderRadius: 20, padding: "1px 7px" }}>
                      ✓ Verificada
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 11, color: C.text3 }}>
                  {s.device_type} · {s.platform}
                  {!s.verified && s.uptime_days_tracked > 0 && (
                    <> · {s.uptime_days_tracked < 14 ? `coletando histórico (${s.uptime_days_tracked}/14 dias)` : `${s.uptime_days_present}/${s.uptime_days_tracked} dias online`}</>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button
                  onClick={() => toggleSameContent(s.id, s.same_content)}
                  disabled={savingScreen === s.id}
                  style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 20, cursor: savingScreen === s.id ? "not-allowed" : "pointer", border: `1px solid ${s.same_content ? C.border : C.blue}`, background: s.same_content ? C.gray50 : C.blueLt, color: s.same_content ? C.text2 : C.blue }}
                >
                  {savingScreen === s.id ? "Salvando…" : s.same_content ? "Mesma playlist" : "Conteúdo próprio"}
                </button>
                <StatusBadge online={s.online} />
              </div>
            </div>
          ))}
          {screens.some((s: any) => !s.same_content) && (
            <div style={{ padding: "10px 18px", fontSize: 11, color: C.text3, background: C.gray50 }}>
              💡 Telas com "Conteúdo próprio" não mostram nada até você atribuir mídias a elas na aba Conteúdo.
            </div>
          )}
        </div>
      )}
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden", marginBottom: 16 }}>
        {screens.length > 1 && (
          <div style={{ padding: "12px 18px", borderBottom: `1px solid ${C.border2}`, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, color: C.text2, fontWeight: 600 }}>Visualizando:</span>
            {screens.map((s: any) => (
              <button
                key={s.player_id}
                onClick={() => setSelectedPlayerId(s.player_id)}
                style={{
                  fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 20, cursor: "pointer",
                  background: selectedPlayerId === s.player_id ? C.blue : C.gray50,
                  color: selectedPlayerId === s.player_id ? C.white : C.text2,
                  border: `1px solid ${selectedPlayerId === s.player_id ? C.blue : C.border}`,
                }}
              >
                {s.label || s.device_type}
                <span style={{ marginLeft: 5, width: 6, height: 6, borderRadius: "50%", background: s.online ? C.green : C.red, display: "inline-block", verticalAlign: "middle" }} />
              </button>
            ))}
          </div>
        )}
        <div style={{ background: "#0F172A", display: "flex", justifyContent: "center", padding: isPortrait ? "16px 0" : 0 }}>
          <div style={{
            position: "relative", overflow: "hidden",
            width: isPortrait ? 180 : "100%",
            aspectRatio: isPortrait ? "9 / 16" : "16 / 9",
            maxHeight: isPortrait ? 600 : 480,
          }}>
            {client?.code ? (
              <iframe
                key={selectedPlayerId || client.code}
                src={`/player?screen=${client.code}&preview=1${selectedPlayerId ? `&player_id=${selectedPlayerId}` : ""}`}
                title="Preview da TV"
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none", pointerEvents: "none" }}
                sandbox="allow-scripts allow-same-origin"
              />
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                <div style={{ textAlign: "center" }}><div style={{ fontSize: 40 }}>📺</div><div style={{ fontSize: 12, color: "#64748B", marginTop: 8 }}>Preview indisponível</div></div>
              </div>
            )}
          </div>
        </div>
        <div style={{ padding: "16px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{player?.name || "Sua tela"}</div>
              <div style={{ fontSize: 12, color: C.text3 }}>
                {player?.id ? `SCR-${player.id.slice(0,5).toUpperCase()}` : "—"}
                {player?.platform && ` · ${player.platform}`}
              </div>
            </div>
            <StatusBadge online={online} checking={checking} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
            {[
              { label: "Dispositivo", value: player?.device_type || "—", color: C.blue },
              { label: "Plataforma", value: player?.platform || "—", color: C.green },
              { label: "Uptime 30d", value: player?.sla_30d != null ? `${Number(player.sla_30d).toFixed(1)}%` : "—", color: C.blue },
            ].map(k => (
              <div key={k.label} style={{ background: C.gray50, borderRadius: 8, padding: "10px 14px", textAlign: "center" }}>
                <div style={{ fontSize: 11, color: C.text3, marginBottom: 4 }}>{k.label}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: k.color }}>{k.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border2}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Playlist em execução</div>
          <span style={{ fontSize: 12, color: C.text3 }}>{items.length} itens</span>
        </div>
        {items.map((item: any, i: number) => (
          <div key={item.id} style={{ display: "flex", alignItems: "center", padding: "12px 18px", borderBottom: i < items.length - 1 ? `1px solid ${C.border2}` : "none" }}>
            <span style={{ width: 24, fontSize: 12, color: C.text3, fontWeight: 600, flexShrink: 0 }}>{i + 1}</span>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: item.type === "ad" ? C.blueLt : C.greenLt, display: "flex", alignItems: "center", justifyContent: "center", marginRight: 12, flexShrink: 0 }}>
              <span style={{ fontSize: 12 }}>{item.type === "ad" ? "📢" : "🖼"}</span>
            </div>
            <div style={{ flex: 1, fontSize: 13, color: C.text, fontWeight: i === 0 ? 600 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{names[item.id] || (item.type === "ad" ? "Anúncio" : "Conteúdo")}</div>
            <span style={{ fontSize: 12, color: C.text3, flexShrink: 0 }}>{item.duration || 15}s</span>
            {i === 0 && <span style={{ width: 8, height: 8, borderRadius: "50%", background: C.green, marginLeft: 8, flexShrink: 0 }} />}
          </div>
        ))}
      </div>
    </div>
  )
}

function TabConteudo({ client, playlist, onAddPromo, onRefresh }: any) {
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [toast, setToast] = useState("")
  const [screens, setScreens] = useState<any[]>([])
  const [savingMedia, setSavingMedia] = useState<string | null>(null)
  const [localPlaylist, setLocalPlaylist] = useState<PlaylistItem[]>(playlist as PlaylistItem[])

  useEffect(() => {
    setLocalPlaylist(playlist as PlaylistItem[])
  }, [playlist])

  useEffect(() => {
    fetch(`/api/client/screens/${client.code}`)
      .then(r => r.json())
      .then(d => setScreens(d.screens ?? []))
      .catch(() => setScreens([]))
  }, [client.code])
  const hasCustomScreens = screens.length > 1 && screens.some((s: any) => !s.same_content)

  // Galeria de Exemplos — biblioteca de mídia pronta por segmento, pro
  // cliente que não sabe criar conteúdo próprio ter algo profissional no
  // ar rapidamente (existia o backend pronto, nunca tinha UI consumindo).
  const [examples, setExamples] = useState<any[]>([])
  const [loadingExamples, setLoadingExamples] = useState(true)
  const [activatingExample, setActivatingExample] = useState<string | null>(null)
  const slugNiche = (client.business_type || "generico").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-")

  useEffect(() => {
    fetch(`/api/media-examples?niche=${encodeURIComponent(slugNiche)}`)
      .then(r => r.json())
      .then(d => setExamples(d.examples ?? []))
      .catch(() => setExamples([]))
      .finally(() => setLoadingExamples(false))
  }, [slugNiche])

  const activateExample = async (exampleId: string) => {
    setActivatingExample(exampleId)
    try {
      const res = await fetch(`/api/client/media-examples/activate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: client.code, exampleIds: [exampleId] }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || "Erro ao ativar exemplo")
      setToast("✓ Adicionado à sua tela!")
      setTimeout(() => setToast(""), 2500)
      onRefresh?.()
    } catch (err: any) {
      setToast("⚠️ " + (err.message || "Erro ao ativar exemplo"))
      setTimeout(() => setToast(""), 4000)
    }
    setActivatingExample(null)
  }

  const assignScreen = async (mediaId: string, screenId: string | null) => {
    setSavingMedia(mediaId)
    try {
      const res = await fetch(`/api/client/media/${mediaId}/screen`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_code: client.code, screen_id: screenId }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || "Erro ao alterar tela da mídia")
      setLocalPlaylist(items => items.map(item => (
        item.id === mediaId ? { ...item, screen_id: screenId } as PlaylistItem : item
      )))
      setToast("✓ Tela da mídia atualizada")
      setTimeout(() => setToast(""), 2500)
    } catch (err: any) {
      setToast("⚠️ " + (err.message || "Erro ao alterar tela da mídia"))
      setTimeout(() => setToast(""), 4000)
    }
    setSavingMedia(null)
  }

  const realItems = localPlaylist.filter(i => i.type === "content" || i.type === "image" || i.type === "video")
  const nameFor = (item: PlaylistItem, idx: number) => (item as any).name || `Conteúdo ${idx + 1}`

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/client/media/${deleteTarget.id}?code=${client.code}`, { method: "DELETE" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Erro ao excluir")
      setToast("✓ Mídia excluída com sucesso")
      setDeleteTarget(null)
      onRefresh?.()
      setTimeout(() => setToast(""), 3000)
    } catch (err: any) {
      setToast("⚠️ " + (err.message || "Erro ao excluir"))
      setTimeout(() => setToast(""), 4000)
    }
    setDeleting(false)
  }

  return (
    <div>
      {deleteTarget && (
        <ModalConfirmDelete
          name={deleteTarget.name}
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {toast && (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 1100, background: toast.startsWith("✓") ? C.green : C.red, color: C.white, padding: "12px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: "0 8px 24px rgba(0,0,0,0.15)" }}>
          {toast}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button onClick={onAddPromo} style={{ background: C.blue, color: C.white, border: "none", borderRadius: 8, padding: "10px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>+ Enviar mídia</button>
      </div>

      {!loadingExamples && examples.length > 0 && (
        <div style={{ background: realItems.length === 0 ? C.blueLt : C.white, border: `1px solid ${realItems.length === 0 ? C.blueBd : C.border}`, borderRadius: 12, padding: "16px", marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 2 }}>📚 Galeria de Exemplos</div>
          <div style={{ fontSize: 12, color: C.text3, marginBottom: 12 }}>
            {realItems.length === 0
              ? "Ainda não tem nada na sua tela? Use um destes modelos prontos pra começar agora mesmo — depois é só trocar pelo seu conteúdo quando quiser."
              : "Modelos prontos pro seu segmento, prontos pra usar direto na sua tela."}
          </div>
          <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 }}>
            {examples.map((ex: any) => (
              <div key={ex.id} style={{ flexShrink: 0, width: 140, background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden" }}>
                <div style={{ height: 80, background: C.gray100 }}>
                  {ex.type === "video"
                    ? <video src={ex.url} style={{ width: "100%", height: "100%", objectFit: "cover" }} muted preload="metadata" />
                    : <img src={ex.url} alt={ex.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                </div>
                <div style={{ padding: "8px 10px" }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: C.text, marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ex.name}</div>
                  <button
                    onClick={() => activateExample(ex.id)}
                    disabled={activatingExample === ex.id}
                    style={{ width: "100%", fontSize: 11, fontWeight: 600, padding: "5px", borderRadius: 6, border: "none", background: C.blue, color: C.white, cursor: activatingExample === ex.id ? "not-allowed" : "pointer" }}
                  >
                    {activatingExample === ex.id ? "Adicionando…" : "Usar este"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="db-content-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16, marginBottom: 16 }}>
        {realItems.length > 0 ? realItems.map((item, i) => {
          const name = nameFor(item, i)
          return (
            <div key={item.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
              <div style={{ position: "relative" }}>
                <PlaylistThumb item={item} name={name} />
                <div style={{ position: "absolute", bottom: 8, left: 8, background: "rgba(0,0,0,0.6)", color: C.white, fontSize: 10, padding: "2px 7px", borderRadius: 4 }}>{item.type === "video" ? "Video" : "Imagem"}</div>
                <div style={{ position: "absolute", bottom: 8, right: 8, background: "rgba(0,0,0,0.6)", color: C.white, fontSize: 10, padding: "2px 7px", borderRadius: 4 }}>{item.duration || 15}s</div>
                <button
                  onClick={() => setDeleteTarget({ id: item.id, name })}
                  title="Excluir mídia"
                  style={{ position: "absolute", top: 8, right: 8, width: 28, height: 28, borderRadius: 8, background: "rgba(0,0,0,0.55)", border: "none", color: C.white, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  🗑️
                </button>
              </div>
              <div style={{ padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</div>
                  <div style={{ fontSize: 11, color: C.text3 }}>⏱ {item.duration || 15}s</div>
                </div>
                <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: C.greenLt, color: C.green, flexShrink: 0 }}>Ativo</span>
              </div>
              {hasCustomScreens && (
                <div style={{ padding: "0 14px 12px" }}>
                  <select
                    value={(item as any).screen_id ?? ""}
                    onChange={e => assignScreen(item.id, e.target.value || null)}
                    disabled={savingMedia === item.id}
                    style={{ width: "100%", fontSize: 11, border: `1px solid ${C.border}`, borderRadius: 6, padding: "5px 8px", color: C.text2, background: C.gray50 }}
                  >
                    <option value="">Todas as telas</option>
                    {screens.map((s: any) => (
                      <option key={s.id} value={s.id}>{s.label || s.device_type}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )
        }) : (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px", color: C.text3, background: C.white, borderRadius: 12, border: `1px solid ${C.border}` }}>Nenhum conteúdo na playlist ainda.</div>
        )}
        <div onClick={onAddPromo} style={{ background: C.white, border: `2px dashed ${C.gray300}`, borderRadius: 12, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 200, gap: 8, cursor: "pointer" }}>
          <div style={{ fontSize: 28, color: C.blue }}>+</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Adicionar nova mídia</div>
          <div style={{ fontSize: 12, color: C.text3 }}>Upload de imagem ou vídeo</div>
        </div>
      </div>
    </div>
  )
}

function TabAnuncios({ stats, payments, code, onAddPromo }: any) {
  const [ads, setAds] = useState<any[]>([])
  const [loadingAds, setLoadingAds] = useState(true)

  useEffect(() => {
    fetch(`/api/client/ads/${code}`)
      .then(r => r.json())
      .then(d => setAds(d.ads ?? []))
      .catch(() => setAds([]))
      .finally(() => setLoadingAds(false))
  }, [code])
  return (
    <div>
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: "18px 20px", marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div><div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Receita este mês</div><div style={{ fontSize: 11, color: C.text3 }}>Soma de anúncios pagos confirmados</div></div>
          <div style={{ textAlign: "right" }}><div style={{ fontSize: 22, fontWeight: 700, color: C.green }}>{fmtR(stats.revenue_month || 0)}</div></div>
        </div>
      </div>
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden", marginBottom: 16 }}>
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border2}`, display: "flex", justifyContent: "space-between" }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Anúncios de terceiros na sua tela</div>
        </div>
        {loadingAds ? (
          <div style={{ padding: "24px 18px", textAlign: "center", color: C.text3, fontSize: 13 }}>Carregando…</div>
        ) : ads.length === 0 ? (
          <div style={{ padding: "24px 18px", textAlign: "center", color: C.text3, fontSize: 13 }}>
            Nenhum anunciante rodando na sua tela ainda. Fale com a DOOHPLAY pra começar a receber anúncios pagos.
          </div>
        ) : ads.map((ad, i) => (
          <div key={ad.campaign_id ?? i} style={{ display: "flex", alignItems: "center", padding: "12px 18px", borderBottom: i < ads.length - 1 ? `1px solid ${C.border2}` : "none" }}>
            <div style={{ width: 32, height: 32, background: C.gray100, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", marginRight: 10, fontSize: 16, flexShrink: 0 }}>📢</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ad.advertiser_name ?? ad.campaign_name}</div>
              <div style={{ fontSize: 11, color: C.text3 }}>{ad.campaign_name} · {Number(ad.views ?? 0).toLocaleString("pt-BR")} exibições</div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 10, background: ad.status === "Ativo" ? C.greenLt : C.gray100, color: ad.status === "Ativo" ? C.green : C.text3 }}>{ad.status}</span>
            </div>
          </div>
        ))}
      </div>
      <div style={{ background: C.blueLt, border: `1px solid ${C.blueBd}`, borderRadius: 12, padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.blue }}>Adicione uma promoção da sua loja</div>
          <div style={{ fontSize: 12, color: C.text3 }}>Aumente o engajamento em até 40%</div>
        </div>
        <button onClick={onAddPromo} style={{ background: C.blue, color: C.white, border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>+ Adicionar</button>
      </div>
    </div>
  )
}

function TabGanhos({ stats, payments, code }: any) {
  const history = payments ?? []
  return (
    <div>
      <div className="db-kpis" style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <KpiCard label="Este mês" value={fmtR(stats.revenue_month || 0)} sub="Receita confirmada" icon="💵" color={C.green} />
      </div>
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border2}`, display: "flex", justifyContent: "space-between" }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Histórico de pagamentos</div>
          <button style={{ fontSize: 12, color: C.blue, background: "none", border: "none", cursor: "pointer" }}>↓ Exportar</button>
        </div>
        {history.length === 0 ? (
          <div style={{ padding: "24px 18px", textAlign: "center", color: C.text3, fontSize: 13 }}>
            Nenhum pagamento confirmado ainda.
          </div>
        ) : history.map((p: any, i: number) => (
          <div key={p.id} style={{ padding: "14px 18px", borderBottom: i < history.length - 1 ? `1px solid ${C.border2}` : "none", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ width: 32, height: 32, background: C.greenLt, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{fmtDate(p.paid_at || p.created_at, true)}</div>
                <div style={{ fontSize: 11, color: C.text3 }}>PIX</div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.green }}>{fmtR(p.value)}</div>
              <span style={{ fontSize: 11, color: C.green }}>Pago</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function TabRelatorios({ stats, payments, code }: any) {
  const recentPayments = (payments ?? []).slice(0, 3)
  return (
    <div>
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden", marginBottom: 16 }}>
        <div style={{ padding: "16px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div><div style={{ fontSize: 14, fontWeight: 600 }}>Receita este mês</div><div style={{ fontSize: 11, color: C.text3 }}>Soma de anúncios pagos confirmados</div></div>
            <div style={{ textAlign: "right" }}><div style={{ fontSize: 20, fontWeight: 700, color: C.green }}>{fmtR(stats.revenue_month || 0)}</div></div>
          </div>
          <div style={{ marginBottom: 16 }}>
            {recentPayments.length === 0 ? (
              <div style={{ fontSize: 12, color: C.text3, textAlign: "center", padding: "12px 0" }}>Nenhum pagamento registrado ainda.</div>
            ) : recentPayments.map((p: any, i: number) => (
              <div key={p.id ?? i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div><div style={{ fontSize: 11, color: C.text3 }}>{fmtDate(p.paid_at || p.created_at, true)}</div><div style={{ fontSize: 13, fontWeight: 600 }}>{fmtR(p.value || 0)}</div></div>
                <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 20, background: p.status === "paid" ? C.greenLt : C.gray100, color: p.status === "paid" ? C.green : C.text3 }}>{p.status === "paid" ? "Processado" : p.status ?? "Pendente"}</span>
              </div>
            ))}
          </div>
          <a href={`/dashboard/financeiro/${code}`} style={{ display: "block", textAlign: "center", fontSize: 12, color: C.blue, textDecoration: "none", fontWeight: 500 }}>Ver dashboard financeiro completo →</a>
        </div>
      </div>
    </div>
  )
}

function TabConfiguracoes({ code }: { code: string }) {
  const [form, setForm] = useState({ name: "", business_type: "", address: "", city: "", phone: "", email: "", cpf_cnpj: "", notif_whatsapp: true, notif_email: false, screen_orientation: "landscape" as "landscape" | "portrait" })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError]     = useState("")
  useEffect(() => {
    fetch(`/api/client/settings/${code}`).then(r => r.json()).then(d => setForm({ name: d.name ?? "", business_type: d.business_type ?? "", address: d.address ?? "", city: d.city ?? "", phone: d.phone ?? "", email: d.email ?? "", cpf_cnpj: d.cpf_cnpj ?? "", notif_whatsapp: d.notif_whatsapp ?? true, notif_email: d.notif_email ?? false, screen_orientation: d.screen_orientation === "portrait" ? "portrait" : "landscape" })).catch(() => setError("Erro ao carregar")).finally(() => setLoading(false))
  }, [code])
  const save = async () => {
    if (!form.name.trim()) { setError("Nome é obrigatório"); return }
    setSaving(true); setError(""); setSuccess(false)
    try {
      const res = await fetch(`/api/client/settings/${code}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Erro ao salvar")
      setSuccess(true); setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) { setError(err.message || "Erro ao salvar") }
    setSaving(false)
  }
  const inp: React.CSSProperties = { width: "100%", boxSizing: "border-box", background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", color: C.text, fontSize: 14, outline: "none" }
  const lbl: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 600, color: C.text2, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }
  if (loading) return <div style={{ padding: 40, textAlign: "center", color: C.text3 }}>Carregando…</div>
  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: "24px", marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 20 }}>Dados do estabelecimento</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ gridColumn: "1 / -1" }}><label style={lbl}>Nome *</label><input style={inp} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
          <div><label style={lbl}>Tipo</label><input style={inp} value={form.business_type} onChange={e => setForm(f => ({ ...f, business_type: e.target.value }))} placeholder="Ex: Barbearia" /></div>
          <div><label style={lbl}>Cidade</label><input style={inp} value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} /></div>
          <div style={{ gridColumn: "1 / -1" }}><label style={lbl}>Endereço</label><input style={inp} value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
        </div>
      </div>
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: "24px", marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 6 }}>Formato da tela</div>
        <div style={{ fontSize: 12, color: C.text3, marginBottom: 16 }}>Como sua TV está instalada — usado pra mostrar o preview no formato certo.</div>
        <div style={{ display: "flex", gap: 10 }}>
          {[
            { key: "landscape" as const, label: "Horizontal (16:9)", icon: "🖥️" },
            { key: "portrait"  as const, label: "Vertical (9:16)",   icon: "📱" },
          ].map(opt => (
            <div
              key={opt.key}
              onClick={() => setForm(f => ({ ...f, screen_orientation: opt.key }))}
              style={{
                flex: 1, cursor: "pointer", textAlign: "center", padding: "16px 12px", borderRadius: 10,
                border: `2px solid ${form.screen_orientation === opt.key ? C.blue : C.border}`,
                background: form.screen_orientation === opt.key ? C.blue + "0D" : C.white,
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 6 }}>{opt.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: form.screen_orientation === opt.key ? C.blue : C.text2 }}>{opt.label}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: "24px", marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 20 }}>Contato</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div><label style={lbl}>WhatsApp *</label><input style={inp} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, "") }))} type="tel" /></div>
          <div><label style={lbl}>Email</label><input style={inp} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} type="email" /></div>
        </div>
      </div>
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: "24px", marginBottom: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 20 }}>Notificações</div>
        {[{ key: "notif_whatsapp", label: "WhatsApp", desc: "Relatórios mensais pelo WhatsApp" }, { key: "notif_email", label: "Email", desc: "Notificações por email" }].map(n => (
          <div key={n.key} onClick={() => setForm(f => ({ ...f, [n.key]: !(f as any)[n.key] }))} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: n.key === "notif_whatsapp" ? `1px solid ${C.border2}` : "none", cursor: "pointer" }}>
            <div><div style={{ fontSize: 14, fontWeight: 500 }}>{n.label}</div><div style={{ fontSize: 12, color: C.text3 }}>{n.desc}</div></div>
            <div style={{ width: 44, height: 24, borderRadius: 12, background: (form as any)[n.key] ? C.blue : C.gray200, position: "relative", flexShrink: 0 }}>
              <div style={{ width: 18, height: 18, borderRadius: "50%", background: C.white, position: "absolute", top: 3, left: (form as any)[n.key] ? 23 : 3, transition: "left .2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
            </div>
          </div>
        ))}
      </div>
      {error   && <div style={{ background: C.redLt,   border: `1px solid #FECACA`,      borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: C.red   }}>⚠️ {error}</div>}
      {success && <div style={{ background: C.greenLt, border: `1px solid ${C.greenBd}`, borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: C.green }}>✓ Configurações salvas!</div>}
      <button onClick={save} disabled={saving} style={{ background: saving ? C.gray300 : C.blue, color: C.white, border: "none", borderRadius: 10, padding: "12px 28px", fontSize: 14, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer" }}>{saving ? "Salvando…" : "Salvar configurações"}</button>
    </div>
  )
}

function CalendarioSemanal({ items }: { items: any[] }) {
  const DAYS_PT = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"]
  const DAYS_EN = ["sun","mon","tue","wed","thu","fri","sat"]
  const HOURS   = [6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22]
  const COLORS = [
    { bg: "#EFF6FF", border: "#BFDBFE", text: "#1D4ED8" },
    { bg: "#DCFCE7", border: "#86EFAC", text: "#15803D" },
    { bg: "#FEF3C7", border: "#FDE68A", text: "#B45309" },
    { bg: "#FEE2E2", border: "#FECACA", text: "#B91C1C" },
    { bg: "#F3E8FF", border: "#DDD6FE", text: "#7C3AED" },
    { bg: "#ECFDF5", border: "#A7F3D0", text: "#065F46" },
    { bg: "#FFF7ED", border: "#FED7AA", text: "#C2410C" },
    { bg: "#F0F9FF", border: "#BAE6FD", text: "#0369A1" },
  ]
  const activeItems = items.filter(i => i.active)
  const getItemsForCell = (dayEN: string, hour: number) => {
    return activeItems.filter(item => {
      const dayOk = !item.days_of_week || item.days_of_week.length === 0 || item.days_of_week.includes(dayEN)
      if (!dayOk) return false
      if (item.start_time && item.end_time) {
        const startH = parseInt(item.start_time.split(":")[0])
        const endH   = parseInt(item.end_time.split(":")[0])
        return hour >= startH && hour < endH
      }
      return true
    })
  }
  return (
    <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden", marginBottom: 16 }}>
      <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border2}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>📅 Calendário Semanal</div>
        <div style={{ fontSize: 11, color: C.text3 }}>Visualização de programação por dia e horário</div>
      </div>
      <div style={{ padding: "10px 18px", borderBottom: `1px solid ${C.border2}`, display: "flex", gap: 8, flexWrap: "wrap" }}>
        {activeItems.map((item, idx) => (
          <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: COLORS[idx % COLORS.length].bg, border: `1px solid ${COLORS[idx % COLORS.length].border}` }} />
            <span style={{ fontSize: 11, color: C.text2 }}>{item.name}</span>
          </div>
        ))}
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
          <thead>
            <tr>
              <th style={{ width: 50, padding: "8px 6px", fontSize: 11, color: C.text3, fontWeight: 500, textAlign: "right", borderBottom: `1px solid ${C.border2}` }}>Hora</th>
              {DAYS_PT.map(day => (
                <th key={day} style={{ padding: "8px 4px", fontSize: 11, fontWeight: 600, color: C.text, textAlign: "center", borderBottom: `1px solid ${C.border2}` }}>{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HOURS.map(hour => (
              <tr key={hour}>
                <td style={{ padding: "4px 6px", fontSize: 10, color: C.text3, textAlign: "right", verticalAlign: "top", whiteSpace: "nowrap", borderBottom: `1px solid ${C.border2}` }}>{hour}:00</td>
                {DAYS_EN.map(day => {
                  const cellItems = getItemsForCell(day, hour)
                  return (
                    <td key={day} style={{ padding: 2, borderBottom: `1px solid ${C.border2}`, borderLeft: `1px solid ${C.border2}`, verticalAlign: "top", minWidth: 80 }}>
                      {cellItems.length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                          {cellItems.map((item, idx) => {
                            const color = COLORS[activeItems.indexOf(item) % COLORS.length]
                            return (
                              <div key={item.id} style={{ background: color.bg, border: `1px solid ${color.border}`, borderRadius: 4, padding: "2px 4px", fontSize: 9, color: color.text, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {item.name}
                              </div>
                            )
                          })}
                        </div>
                      ) : <div style={{ height: 20 }} />}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ padding: "10px 18px", borderTop: `1px solid ${C.border2}`, fontSize: 11, color: C.text3 }}>
        💡 Mídias sem restrição de horário aparecem em todos os slots · Configure em "⚙ Programar"
      </div>
    </div>
  )
}

const DAYS_PT = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"]
const DAYS_EN = ["sun","mon","tue","wed","thu","fri","sat"]

function TabPlaylist({ code }: { code: string }) {
  const [items,    setItems]    = useState<any[]>([])
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [success,  setSuccess]  = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    fetch(`/api/client/playlist/${code}`)
      .then(r => r.json())
      .then(d => setItems(d.items ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [code])

  const handleDeleteItem = async (id: string, name: string) => {
    if (!confirm(`Excluir "${name}" pra sempre? Essa ação não pode ser desfeita.`)) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/client/media/${id}?code=${code}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      load()
    } catch {
      alert("Erro ao excluir. Tenta de novo.")
    }
    setDeletingId(null)
  }

  const move = (idx: number, dir: -1 | 1) => {
    const newItems = [...items]
    const swapIdx = idx + dir
    if (swapIdx < 0 || swapIdx >= newItems.length) return
    ;[newItems[idx], newItems[swapIdx]] = [newItems[swapIdx], newItems[idx]]
    setItems(newItems.map((it, i) => ({ ...it, position: i + 1 })))
  }

  const update = (idx: number, field: string, val: any) => {
    setItems(items.map((it, i) => i === idx ? { ...it, [field]: val } : it))
  }

  const toggleDay = (idx: number, day: string) => {
    const item = items[idx]
    const days = item.days_of_week ?? []
    const next = days.includes(day) ? days.filter((d: string) => d !== day) : [...days, day]
    update(idx, "days_of_week", next.length === 0 ? null : next)
  }

  const save = async () => {
    setSaving(true)
    try {
      await fetch(`/api/client/playlist/${code}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((it, i) => ({
            id:           it.id,
            position:     i + 1,
            period:       it.period,
            duration:     it.duration,
            active:       it.active,
            days_of_week: it.days_of_week ?? null,
            start_time:   it.start_time   ?? null,
            end_time:     it.end_time     ?? null,
            start_date:   it.start_date   ?? null,
            end_date:     it.end_date     ?? null,
          }))
        }),
      })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch {}
    setSaving(false)
  }

  const totalLoop = items.filter(i => i.active).reduce((a, i) => a + (Number(i.duration) || 15), 0)

  const scheduleLabel = (item: any) => {
    const parts: string[] = []
    if (item.days_of_week?.length > 0) {
      parts.push(item.days_of_week.map((d: string) => DAYS_PT[DAYS_EN.indexOf(d)] ?? d).join(", "))
    }
    if (item.start_time && item.end_time) parts.push(`${item.start_time}–${item.end_time}`)
    if (item.start_date && item.end_date) parts.push(`${item.start_date} a ${item.end_date}`)
    return parts.length > 0 ? parts.join(" · ") : "Sempre"
  }

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: C.text3 }}>Carregando…</div>

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>Programação da Playlist</div>
          <div style={{ fontSize: 12, color: C.text3 }}>{items.filter(i => i.active).length} mídias ativas · Loop de {totalLoop}s (~{Math.round(totalLoop/60)}min)</div>
        </div>
        <button onClick={save} disabled={saving} style={{ background: saving ? C.gray300 : C.blue, color: C.white, border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer" }}>
          {saving ? "Salvando…" : "💾 Salvar programação"}
        </button>
      </div>

      {success && <div style={{ background: C.greenLt, border: `1px solid ${C.greenBd}`, borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: C.green }}>✓ Programação salva com sucesso!</div>}

      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 18px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 20 }}>🔄</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6 }}>Loop de exibição</div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {items.filter(i => i.active).map(item => (
              <div key={item.id} style={{ background: item.type === "video" ? C.blueLt : C.greenLt, border: `1px solid ${item.type === "video" ? C.blueBd : C.greenBd}`, borderRadius: 6, padding: "3px 8px", fontSize: 11, color: item.type === "video" ? C.blue : C.green, fontWeight: 500 }}>
                {item.name} · {item.duration}s
              </div>
            ))}
          </div>
        </div>
        <div style={{ textAlign: "center", flexShrink: 0 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.blue }}>{totalLoop}s</div>
          <div style={{ fontSize: 11, color: C.text3 }}>por loop</div>
        </div>
      </div>

      <CalendarioSemanal items={items} />

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.length === 0 && (
          <div style={{ padding: "40px", textAlign: "center", color: C.text3, background: C.white, borderRadius: 12, border: `1px solid ${C.border}` }}>
            Nenhuma mídia. Faça upload na aba Conteúdo.
          </div>
        )}
        {items.map((item, i) => (
          <div key={item.id} style={{ background: C.white, border: `1px solid ${item.active ? C.border : C.border2}`, borderRadius: 12, overflow: "hidden", opacity: item.active ? 1 : 0.6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.text3, width: 20, flexShrink: 0 }}>{i + 1}</span>
              <div style={{ width: 60, height: 40, borderRadius: 6, overflow: "hidden", background: C.gray100, flexShrink: 0 }}>
                {item.asset_url ? (
                  item.type === "video"
                    ? <video src={item.asset_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} muted preload="metadata" />
                    : <img src={item.asset_url} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>{item.type === "video" ? "🎬" : "🖼"}</div>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
                <div style={{ fontSize: 11, color: C.text3 }}>{scheduleLabel(item)} · {item.duration}s</div>
              </div>
              <select value={item.duration ?? 15} onChange={e => update(i, "duration", Number(e.target.value))} style={{ fontSize: 12, border: `1px solid ${C.border}`, borderRadius: 6, padding: "4px 6px", color: C.text, background: C.white, outline: "none" }}>
                {[5,10,15,20,30,60].map(d => <option key={d} value={d}>{d}s</option>)}
              </select>
              <div onClick={() => update(i, "active", !item.active)} style={{ cursor: "pointer", flexShrink: 0 }}>
                <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 20, background: item.active ? C.greenLt : C.gray100, color: item.active ? C.green : C.text3, border: `1px solid ${item.active ? C.greenBd : C.border}` }}>
                  {item.active ? "Ativo" : "Pausado"}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2, flexShrink: 0 }}>
                <button onClick={() => move(i, -1)} disabled={i === 0} style={{ background: C.gray50, border: `1px solid ${C.border}`, borderRadius: 4, padding: "1px 5px", fontSize: 11, cursor: i === 0 ? "default" : "pointer", opacity: i === 0 ? 0.4 : 1 }}>▲</button>
                <button onClick={() => move(i, 1)} disabled={i === items.length-1} style={{ background: C.gray50, border: `1px solid ${C.border}`, borderRadius: 4, padding: "1px 5px", fontSize: 11, cursor: i === items.length-1 ? "default" : "pointer", opacity: i === items.length-1 ? 0.4 : 1 }}>▼</button>
              </div>
              <button onClick={() => setExpanded(expanded === item.id ? null : item.id)} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 6, padding: "4px 8px", fontSize: 11, cursor: "pointer", color: C.text2, flexShrink: 0 }}>
                {expanded === item.id ? "▲ Fechar" : "⚙ Programar"}
              </button>
              <button
                onClick={() => handleDeleteItem(item.id, item.name)}
                disabled={deletingId === item.id}
                style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 6, padding: "4px 8px", fontSize: 11, cursor: deletingId === item.id ? "not-allowed" : "pointer", color: C.red, flexShrink: 0 }}
              >
                {deletingId === item.id ? "Excluindo…" : "🗑 Excluir"}
              </button>
            </div>
            {expanded === item.id && (
              <div style={{ borderTop: `1px solid ${C.border2}`, padding: "16px", background: C.gray50 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: C.text2, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.04em" }}>Dias da semana</div>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {DAYS_EN.map((day, di) => {
                        const active = item.days_of_week?.includes(day)
                        return (
                          <button key={day} onClick={() => toggleDay(i, day)} style={{ padding: "4px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", background: active ? C.blue : C.white, color: active ? C.white : C.text2, border: `1px solid ${active ? C.blue : C.border}` }}>
                            {DAYS_PT[di]}
                          </button>
                        )
                      })}
                    </div>
                    <div style={{ fontSize: 10, color: C.text3, marginTop: 6 }}>Vazio = todos os dias</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: C.text2, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.04em" }}>Horário</div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: 10, color: C.text3, marginBottom: 4 }}>De</div>
                        <input type="time" value={item.start_time ?? ""} onChange={e => update(i, "start_time", e.target.value || null)} style={{ border: `1px solid ${C.border}`, borderRadius: 6, padding: "5px 8px", fontSize: 12, color: C.text, background: C.white, outline: "none" }} />
                      </div>
                      <span style={{ fontSize: 12, color: C.text3, marginTop: 16 }}>até</span>
                      <div>
                        <div style={{ fontSize: 10, color: C.text3, marginBottom: 4 }}>Até</div>
                        <input type="time" value={item.end_time ?? ""} onChange={e => update(i, "end_time", e.target.value || null)} style={{ border: `1px solid ${C.border}`, borderRadius: 6, padding: "5px 8px", fontSize: 12, color: C.text, background: C.white, outline: "none" }} />
                      </div>
                    </div>
                    <div style={{ fontSize: 10, color: C.text3, marginTop: 6 }}>Vazio = dia todo</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: C.text2, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.04em" }}>Data (opcional)</div>
                    <div>
                      <div style={{ fontSize: 10, color: C.text3, marginBottom: 4 }}>De</div>
                      <input type="date" value={item.start_date ?? ""} onChange={e => update(i, "start_date", e.target.value || null)} style={{ border: `1px solid ${C.border}`, borderRadius: 6, padding: "5px 8px", fontSize: 12, color: C.text, background: C.white, outline: "none", width: "100%", boxSizing: "border-box" as const }} />
                    </div>
                    <div style={{ marginTop: 6 }}>
                      <div style={{ fontSize: 10, color: C.text3, marginBottom: 4 }}>Até</div>
                      <input type="date" value={item.end_date ?? ""} onChange={e => update(i, "end_date", e.target.value || null)} style={{ border: `1px solid ${C.border}`, borderRadius: 6, padding: "5px 8px", fontSize: 12, color: C.text, background: C.white, outline: "none", width: "100%", boxSizing: "border-box" as const }} />
                    </div>
                  </div>
                </div>
                <button onClick={() => { update(i, "days_of_week", null); update(i, "start_time", null); update(i, "end_time", null); update(i, "start_date", null); update(i, "end_date", null) }} style={{ marginTop: 12, background: "none", border: `1px solid ${C.border}`, borderRadius: 6, padding: "5px 12px", fontSize: 11, cursor: "pointer", color: C.text3 }}>
                  🗑 Limpar programação
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12, fontSize: 12, color: C.text3, textAlign: "center" }}>
        Clique em "⚙ Programar" para definir dias, horários e datas de cada mídia
      </div>
    </div>
  )
}

// ── Clube de Telas do Bairro ──────────────────────────────────────────────────
function TabClubeDeTelas({ code }: { code: string }) {
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [accepted,    setAccepted]    = useState<any[]>([])
  const [loading,     setLoading]     = useState(true)
  const [responding,  setResponding]  = useState<string | null>(null)
  const [error,       setError]       = useState<string | null>(null)

  const loadPartnerships = () => {
    setLoading(true)
    fetch(`/api/client/network-partnerships/${code}`)
      .then(r => r.json())
      .then(d => {
        setSuggestions(d.suggestions ?? [])
        setAccepted(d.accepted ?? [])
      })
      .catch(() => setError("Não foi possível carregar as parcerias."))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadPartnerships()
  }, [code])

  const respond = async (partnershipId: string, decision: "accepted" | "rejected") => {
    setResponding(partnershipId)
    setError(null)
    try {
      const res = await fetch(`/api/admin/network-partnerships/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partnership_id: partnershipId,
          responding_client_code: code,
          decision,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Erro ao responder parceria.")
      } else {
        loadPartnerships()
      }
    } catch {
      setError("Erro de conexão ao responder parceria.")
    }
    setResponding(null)
  }

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: C.text3 }}>Carregando…</div>

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>Clube de Telas do Bairro</div>
        <div style={{ fontSize: 12, color: C.text3 }}>
          {accepted.length} de 30 parceiros ativos · Sua TV exibe parceiros próximos e aparece nas telas deles também
        </div>
      </div>

      {error && (
        <div style={{ background: C.redLt, color: C.red, padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* Sugestões pendentes */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.text2, marginBottom: 10 }}>
          Sugestões de parceria ({suggestions.length})
        </div>

        {suggestions.length === 0 ? (
          <div style={{ background: C.gray50, border: `1px solid ${C.gray200}`, borderRadius: 10, padding: 24, textAlign: "center", color: C.text3, fontSize: 13 }}>
            Nenhuma sugestão por agora. Conforme mais parceiros se cadastrarem perto de você, vão aparecer aqui.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {suggestions.map((s) => (
              <div key={s.id} style={{ background: C.white, border: `1px solid ${C.gray200}`, borderRadius: 10, padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{s.partner_name}</div>
                  <div style={{ fontSize: 12, color: C.text3 }}>
                    {s.partner_business_type ?? "Categoria não informada"} · {Number(s.distance_km).toFixed(1)} km de distância
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => respond(s.id, "rejected")}
                    disabled={responding === s.id}
                    style={{ background: C.white, color: C.text2, border: `1px solid ${C.gray300}`, borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: responding === s.id ? "not-allowed" : "pointer" }}
                  >
                    Recusar
                  </button>
                  <button
                    onClick={() => respond(s.id, "accepted")}
                    disabled={responding === s.id}
                    style={{ background: responding === s.id ? C.gray300 : C.blue, color: C.white, border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: responding === s.id ? "not-allowed" : "pointer" }}
                  >
                    {responding === s.id ? "Aguarde…" : "Aceitar parceria"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Parceiros já aceitos */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.text2, marginBottom: 10 }}>
          Parceiros ativos ({accepted.length}/30)
        </div>

        {accepted.length === 0 ? (
          <div style={{ background: C.gray50, border: `1px solid ${C.gray200}`, borderRadius: 10, padding: 24, textAlign: "center", color: C.text3, fontSize: 13 }}>
            Você ainda não tem parceiros na rede. Aceite uma sugestão acima para começar.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {accepted.map((p) => (
              <div key={p.id} style={{ background: C.white, border: `1px solid ${C.gray200}`, borderRadius: 10, padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{p.partner_name}</div>
                  <div style={{ fontSize: 12, color: C.text3 }}>
                    {p.partner_business_type ?? "Categoria não informada"} · {Number(p.distance_km).toFixed(1)} km
                  </div>
                </div>
                <div style={{ background: C.gray100, color: C.text2, borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 600 }}>
                  Ativo
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mídia destinada à rede de parceiros */}
      <NetworkMediaSection code={code} />
    </div>
  )
}

// ── Mídia do Clube de Telas (upload + lista do que o dono já enviou) ────────
function NetworkMediaSection({ code }: { code: string }) {
  const [items, setItems] = useState<any[]>([])
  const [incoming, setIncoming] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const load = () => {
    setLoading(true)
    Promise.all([
      fetch(`/api/client/network-media/${code}`).then(r => r.json()).catch(() => ({ media: [] })),
      fetch(`/api/client/network-media-incoming/${code}`).then(r => r.json()).catch(() => ({ media: [] })),
    ]).then(([sent, recv]) => {
      setItems(sent.media ?? [])
      setIncoming(recv.media ?? [])
    }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [code])

  const handleUpload = async (file: File) => {
    setUploading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("name", file.name)
      const res = await fetch(`/api/client/network-media/${code}`, { method: "POST", body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Erro ao enviar")
      load()
    } catch (err: any) {
      setError(err.message ?? "Erro ao enviar mídia")
    }
    setUploading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir essa mídia? Ela vai parar de aparecer nas telas dos parceiros.")) return
    setDeletingId(id)
    try {
      await fetch(`/api/client/network-media/${code}?id=${id}`, { method: "DELETE" })
      load()
    } catch {}
    setDeletingId(null)
  }

  const STATUS_LABEL: Record<string, { label: string; bg: string; color: string }> = {
    pending_review: { label: "Em análise", bg: C.amberLt, color: C.amber },
    approved:       { label: "Aprovada · circulando", bg: C.greenLt, color: C.green },
    rejected:       { label: "Não aprovada", bg: C.redLt, color: C.red },
  }

  return (
    <div style={{ marginTop: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.text2 }}>Mídia que você manda pra rede ({items.length})</div>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          style={{ background: uploading ? C.gray300 : C.blue, color: C.white, border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 12, fontWeight: 600, cursor: uploading ? "not-allowed" : "pointer" }}
        >
          {uploading ? "Enviando…" : "+ Adicionar mídia"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
          style={{ display: "none" }}
          onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f) }}
        />
      </div>
      <div style={{ fontSize: 12, color: C.text3, marginBottom: 14 }}>
        Essa mídia é separada do seu conteúdo pessoal — ela vai pras telas dos seus parceiros aceitos, depois de aprovada pela DOOHPLAY. Pra trocar uma mídia, exclua a antiga e envie a nova.
      </div>

      {error && (
        <div style={{ background: C.redLt, color: C.red, padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 14 }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ padding: 24, textAlign: "center", color: C.text3, fontSize: 13 }}>Carregando…</div>
      ) : items.length === 0 ? (
        <div style={{ background: C.gray50, border: `1px solid ${C.gray200}`, borderRadius: 10, padding: 24, textAlign: "center", color: C.text3, fontSize: 13 }}>
          Você ainda não enviou nenhuma mídia pra rede.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 }}>
          {items.map((m: any) => {
            const st = STATUS_LABEL[m.status] ?? STATUS_LABEL.pending_review
            return (
              <div key={m.id} style={{ background: C.white, border: `1px solid ${C.gray200}`, borderRadius: 10, padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 16 }}>{m.type === "video" ? "🎬" : "🖼️"}</span>
                  <span style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>{m.name}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 12, background: st.bg, color: st.color }}>{st.label}</span>
                  <button
                    onClick={() => handleDelete(m.id)}
                    disabled={deletingId === m.id}
                    style={{ fontSize: 11, color: C.red, background: "transparent", border: `1px solid ${C.gray200}`, borderRadius: 6, padding: "4px 10px", cursor: deletingId === m.id ? "not-allowed" : "pointer" }}
                  >
                    {deletingId === m.id ? "Excluindo…" : "Excluir"}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div style={{ fontSize: 13, fontWeight: 600, color: C.text2, marginBottom: 10 }}>Mídia de parceiros tocando na sua tela ({incoming.length})</div>
      {loading ? null : incoming.length === 0 ? (
        <div style={{ background: C.gray50, border: `1px solid ${C.gray200}`, borderRadius: 10, padding: 24, textAlign: "center", color: C.text3, fontSize: 13 }}>
          Nenhum parceiro com mídia rodando na sua tela ainda.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {incoming.map((m: any) => (
            <div key={m.id} style={{ background: C.white, border: `1px solid ${C.gray200}`, borderRadius: 10, padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 16 }}>{m.type === "video" ? "🎬" : "🖼️"}</span>
                <div>
                  <div style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>{m.name}</div>
                  <div style={{ fontSize: 11, color: C.text3 }}>de {m.owner_name ?? m.owner_code}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Meus Clientes (leads capturados via QR) ──────────────────────────────────
function TabMeusClientes({ code }: { code: string }) {
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/client/leads/${code}`)
      .then(r => r.json())
      .then(d => setLeads(d.leads ?? []))
      .catch(() => setError("Não foi possível carregar seus clientes."))
      .finally(() => setLoading(false))
  }, [code])

  const fmtPhone = (phone: string) => {
    // 5511999998888 -> (11) 99999-8888
    const digits = phone.replace(/\D/g, "")
    const local = digits.length > 11 ? digits.slice(-11) : digits
    if (local.length === 11) {
      return `(${local.slice(0,2)}) ${local.slice(2,7)}-${local.slice(7)}`
    }
    return phone
  }

  const waLink = (phone: string) => `https://wa.me/${phone.replace(/\D/g, "")}`

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: C.text3 }}>Carregando…</div>

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>Meus Clientes</div>
        <div style={{ fontSize: 12, color: C.text3 }}>
          {leads.length} pessoas cadastradas pelo QR code da sua TV
        </div>
      </div>

      {error && (
        <div style={{ background: C.redLt, color: C.red, padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {leads.length === 0 ? (
        <div style={{ background: C.gray50, border: `1px solid ${C.gray200}`, borderRadius: 10, padding: 32, textAlign: "center", color: C.text3, fontSize: 13 }}>
          Nenhum cliente cadastrado ainda. O QR code já está na sua TV — quando alguém escanear e se cadastrar, vai aparecer aqui.
        </div>
      ) : (
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
          {leads.map((lead, i) => (
            <div key={lead.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: i < leads.length - 1 ? `1px solid ${C.border2}` : "none" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{lead.name}</div>
                <div style={{ fontSize: 12, color: C.text3 }}>{fmtPhone(lead.phone)} · {fmtDate(lead.created_at, true)}</div>
              </div>
              <a
                href={waLink(lead.phone)}
                target="_blank"
                rel="noreferrer"
                style={{ background: C.greenLt, color: C.green, border: `1px solid ${C.greenBd}`, borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 600, textDecoration: "none" }}
              >
                💬 WhatsApp
              </a>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 16, fontSize: 12, color: C.text3, textAlign: "center" }}>
        Esses contatos aceitaram receber novidades pelo WhatsApp. Em breve você poderá enviar promoções para todos de uma vez.
      </div>
    </div>
  )
}

interface Props { client: ClientData; player: PlayerData | null; stats: StatsData; playlist: PlaylistItem[]; payments: Payment[] }

export default function DashboardClient({ client, player, stats, playlist, payments }: Props) {
  const [tab,       setTab]       = useState("dashboard")
  const [sideOpen,  setSideOpen]  = useState(true)
  const [drawerOpen,setDrawerOpen]= useState(false)
  const [showModal, setShowModal] = useState(false)
  const [isMobile,  setIsMobile]  = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  const onNav = useCallback((t: string) => { setTab(t); setDrawerOpen(false) }, [])
  const onAddPromo = useCallback(() => setShowModal(true), [])
  const onRefresh = useCallback(() => { window.location.reload() }, [])
  const { online, lastSeen, checking } = usePlayerStatus(client.player_id, player?.online ?? false)
  const initials = client.name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase()

  const tabContent: Record<string, React.ReactNode> = {
    dashboard:  <TabDashboard client={client} player={player} stats={stats} playlist={playlist} payments={payments} onNav={onNav} onAddPromo={onAddPromo} online={online} lastSeen={lastSeen} checking={checking} />,
    tv:         <TabTV client={client} player={player} playlist={playlist} online={online} checking={checking} />,
    conteudo:   <TabConteudo client={client} playlist={playlist} onAddPromo={onAddPromo} onRefresh={onRefresh} />,
    anuncios:   <TabAnuncios stats={stats} payments={payments} code={client.code} onAddPromo={onAddPromo} />,
    ganhos:     <TabGanhos stats={stats} payments={payments} code={client.code} />,
    relatorios: <TabRelatorios stats={stats} payments={payments} code={client.code} />,
    playlist:   <TabPlaylist code={client.code} />,
    clube:      <TabClubeDeTelas code={client.code} />,
    clientes:   <TabMeusClientes code={client.code} />,
    config:     <TabConfiguracoes code={client.code} />,
  }

  const tabLabel: Record<string, string> = {
    dashboard: "Dashboard", tv: "Minha TV", conteudo: "Conteúdo",
    anuncios: "Anúncios", ganhos: "Ganhos", relatorios: "Relatórios",
    playlist: "Playlist", clube: "Clube de Telas", clientes: "Meus Clientes", config: "Configurações",
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.bg, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        html, body { overflow-x: hidden; }
        @media (max-width: 768px) {
          .db-sidebar { display: none !important; }
          .db-bottom-nav { display: flex !important; }
          .db-header-date { display: none !important; }
          .db-header-actions { gap: 6px !important; }
          .db-header-add { display: none !important; }
          .db-kpis { display: grid !important; grid-template-columns: 1fr 1fr !important; }
          .db-tv-grid { grid-template-columns: 1fr !important; }
          .db-futuros { grid-template-columns: 1fr 1fr 1fr !important; }
          .db-content-grid { grid-template-columns: 1fr !important; }
          .db-main { padding: 16px 12px 80px !important; }
        }
      `}</style>

      {showModal && <ModalPromocao code={client.code} onClose={() => setShowModal(false)} onRefresh={onRefresh} />}

      {drawerOpen && (
        <div onClick={() => setDrawerOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 200 }}>
          <div onClick={e => e.stopPropagation()} style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 220, background: C.white, boxShadow: "4px 0 20px rgba(0,0,0,0.15)", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "20px 16px 12px", borderBottom: `1px solid ${C.border2}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 28, height: 28, background: "linear-gradient(135deg, #3B82F6, #6366F1)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                </div>
                <span style={{ fontSize: 14, fontWeight: 800 }}><span style={{ color: C.text }}>DOOH</span><span style={{ color: C.blue }}>PLAY</span></span>
              </div>
              <div style={{ fontSize: 10, color: C.green, fontWeight: 600, marginTop: 4 }}>● Local — {client.name}</div>
            </div>
            <nav style={{ flex: 1, padding: "8px 0", overflowY: "auto" }}>
              {NAV.map(item => (
                <button key={item.id} onClick={() => onNav(item.id)} style={{ width: "100%", display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 16px", background: tab === item.id ? C.blueLt : "none", border: "none", cursor: "pointer", borderLeft: `3px solid ${tab === item.id ? C.blue : "transparent"}`, color: tab === item.id ? C.blue : C.text2, fontWeight: tab === item.id ? 600 : 400, fontSize: 14, textAlign: "left" }}>
                  <span style={{ fontSize: 18 }}>{item.icon}</span>
                  <span style={{ flex: 1 }}>
                    <div>{item.label}</div>
                    <div style={{ fontSize: 11, color: C.text3, fontWeight: 400, marginTop: 1 }}>{item.desc}</div>
                  </span>
                </button>
              ))}
            </nav>
            <div style={{ padding: "12px 16px", borderTop: `1px solid ${C.border2}`, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: C.blue, color: C.white, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>{initials}</div>
              <div style={{ overflow: "hidden" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{client.name}</div>
                <div style={{ fontSize: 10, color: C.text3 }}>{client.code}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <aside className="db-sidebar" style={{ width: sideOpen ? 200 : 60, background: C.sidebar, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", transition: "width 0.2s", flexShrink: 0 }}>
        <div style={{ padding: "16px 16px 12px", borderBottom: `1px solid ${C.border2}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, background: "linear-gradient(135deg, #3B82F6, #6366F1)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            </div>
            {sideOpen && <span style={{ fontSize: 14, fontWeight: 800, letterSpacing: "-0.02em" }}><span style={{ color: C.text }}>DOOH</span><span style={{ color: C.blue }}>PLAY</span></span>}
          </div>
          {sideOpen && <div style={{ fontSize: 10, color: C.green, fontWeight: 600, marginTop: 4 }}>● Local</div>}
        </div>
        <nav style={{ flex: 1, padding: "8px 0" }}>
          {NAV.map(item => (
            <button key={item.id} title={item.desc} onClick={() => setTab(item.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: sideOpen ? "9px 16px" : "9px 0", justifyContent: sideOpen ? "flex-start" : "center", background: tab === item.id ? C.blueLt : "none", border: "none", cursor: "pointer", borderLeft: `3px solid ${tab === item.id ? C.blue : "transparent"}`, color: tab === item.id ? C.blue : C.text2, fontWeight: tab === item.id ? 600 : 400, fontSize: 13 }}>
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {sideOpen && <span style={{ flex: 1, textAlign: "left" }}>{item.label}</span>}
            </button>
          ))}
        </nav>
        <div style={{ padding: "12px 16px", borderTop: `1px solid ${C.border2}`, display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: C.blue, color: C.white, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{initials}</div>
          {sideOpen && <div style={{ overflow: "hidden" }}><div style={{ fontSize: 12, fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{client.name}</div><div style={{ fontSize: 10, color: C.text3 }}>{client.code}</div></div>}
        </div>
      </aside>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        <header style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: "0 16px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={() => isMobile ? setDrawerOpen(true) : setSideOpen(!sideOpen)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: C.text3, padding: 4 }}>☰</button>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{tabLabel[tab] || "Dashboard"}</div>
              <div className="db-header-date" style={{ fontSize: 11, color: C.text3 }}>{new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "long" }).format(new Date())}</div>
            </div>
          </div>
          <div className="db-header-actions" style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <StatusBadge online={online} checking={checking} />
            <button className="db-header-add" onClick={onAddPromo} style={{ background: C.blue, color: C.white, border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>+ Enviar mídia</button>
          </div>
        </header>

        <main className="db-main" style={{ flex: 1, overflow: "auto", padding: "24px" }}>
          {tabContent[tab]}
        </main>

        <nav className="db-bottom-nav" style={{ display: "none", position: "fixed", bottom: 0, left: 0, right: 0, background: C.white, borderTop: `1px solid ${C.border}`, zIndex: 100, justifyContent: "space-around", padding: "8px 0 4px" }}>
          {NAV.slice(0, 5).map(item => (
            <button key={item.id} title={item.desc} onClick={() => onNav(item.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, background: "none", border: "none", cursor: "pointer", padding: "4px 8px", color: tab === item.id ? C.blue : C.text3, position: "relative" }}>
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <span style={{ fontSize: 10, fontWeight: tab === item.id ? 600 : 400 }}>{item.label.split(" ")[0]}</span>
            </button>
          ))}
          <button onClick={() => setDrawerOpen(true)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, background: "none", border: "none", cursor: "pointer", padding: "4px 8px", color: C.text3 }}>
            <span style={{ fontSize: 20 }}>⊕</span>
            <span style={{ fontSize: 10 }}>Mais</span>
          </button>
        </nav>
      </div>
    </div>
  )
}
