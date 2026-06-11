"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import type { ClientData, PlayerData, StatsData, PlaylistItem, Payment } from "./page"

// ─── Colors ───────────────────────────────────────────────────────────────────
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
  { id: "dashboard", label: "Dashboard",    icon: "⊞" },
  { id: "tv",        label: "Minha TV",     icon: "📺" },
  { id: "conteudo",  label: "Conteúdo",     icon: "🖼" },
  { id: "anuncios",  label: "Anúncios",     icon: "📢", badge: 3 },
  { id: "ganhos",    label: "Ganhos",       icon: "💵" },
  { id: "relatorios",label: "Relatórios",   icon: "📊" },
  { id: "config",    label: "Configurações",icon: "⚙" },
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

// ─── Hook: heartbeat polling ──────────────────────────────────────────────────
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
          const isOnline = data.last_ping
            ? (Date.now() - new Date(data.last_ping).getTime()) < 3 * 60 * 1000
            : false
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

// ─── Components ───────────────────────────────────────────────────────────────

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
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: online ? C.greenLt : C.redLt,
      border: `1px solid ${online ? C.greenBd : "#FECACA"}`,
      borderRadius: 20, padding: "3px 10px",
      fontSize: 12, fontWeight: 500,
      color: online ? C.green : C.red,
      opacity: checking ? 0.6 : 1,
      transition: "opacity 0.3s",
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: "50%",
        background: "currentColor", display: "inline-block",
        animation: online ? "pulse 2s infinite" : "none",
      }} />
      {checking ? "Verificando…" : online ? "Online" : "Offline"}
    </span>
  )
}

// ─── Thumbnail de playlist item ───────────────────────────────────────────────
function PlaylistThumb({ item, name }: { item: PlaylistItem; name: string }) {
  const [err, setErr] = useState(false)
  const isVideo = item.type === "video"

  if (item.asset_url && !err) {
    if (isVideo) {
      return (
        <div style={{ height: 140, background: C.gray900, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
          <video
            src={item.asset_url}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            muted
            preload="metadata"
            onError={() => setErr(true)}
          />
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 28, opacity: 0.8 }}>▶</span>
          </div>
        </div>
      )
    }
    return (
      <div style={{ height: 140, background: C.gray100, position: "relative" }}>
        <img
          src={item.asset_url}
          alt={name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={() => setErr(true)}
        />
      </div>
    )
  }

  // fallback
  return (
    <div style={{ height: 140, background: C.gray100, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ fontSize: 40 }}>{isVideo ? "🎬" : "🖼"}</span>
    </div>
  )
}

// ─── Modal de Upload ──────────────────────────────────────────────────────────
function ModalPromocao({ code, onClose }: { code: string; onClose: () => void }) {
  const [nome, setNome]       = useState("")
  const [duracao, setDuracao] = useState("15")
  const [file, setFile]       = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError]     = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (f: File) => { setFile(f); setPreview(URL.createObjectURL(f)) }
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }

  const handleSubmit = async () => {
    if (!nome.trim()) { setError("Informe o nome da promoção."); return }
    if (!file)        { setError("Selecione uma imagem ou vídeo."); return }
    setLoading(true); setError("")
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("name", nome)
      formData.append("duration", duracao)
      formData.append("code", code)
      const res = await fetch("/api/studio/upload", { method: "POST", body: formData })
      if (!res.ok) throw new Error("Erro ao enviar.")
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || "Erro ao enviar. Tente novamente.")
    } finally { setLoading(false) }
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: C.white, borderRadius: 16, width: "100%", maxWidth: 480, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ padding: "20px 24px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>Enviar conteúdo para sua tela</div>
            <div style={{ fontSize: 12, color: C.text3 }}>Será revisado pela equipe antes de ir ao ar</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: C.text3, lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: "20px 24px" }}>
          {success ? (
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
                <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Combo do Dia, Promoção de Verão…" style={{ width: "100%", boxSizing: "border-box", border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", fontSize: 14, color: C.text, outline: "none" }} />
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
                <div onDrop={handleDrop} onDragOver={e => e.preventDefault()} onClick={() => inputRef.current?.click()} style={{ border: `2px dashed ${file ? C.green : C.border}`, borderRadius: 10, padding: "20px", textAlign: "center", cursor: "pointer", background: file ? C.greenLt : C.gray50, transition: "all .15s" }}>
                  {preview ? (
                    file?.type.startsWith("video")
                      ? <video src={preview} style={{ maxHeight: 120, maxWidth: "100%", borderRadius: 6 }} controls />
                      : <img src={preview} alt="preview" style={{ maxHeight: 120, maxWidth: "100%", borderRadius: 6, objectFit: "cover" }} />
                  ) : (
                    <>
                      <div style={{ fontSize: 28, marginBottom: 8 }}>📁</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 4 }}>Clique ou arraste o arquivo</div>
                      <div style={{ fontSize: 11, color: C.text3 }}>Imagem (JPG, PNG) ou Vídeo (MP4) · Máx. 50MB</div>
                    </>
                  )}
                  <input ref={inputRef} type="file" accept="image/*,video/*" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
                </div>
                {file && <div style={{ fontSize: 11, color: C.green, marginTop: 6 }}>✓ {file.name}</div>}
              </div>
              {error && <div style={{ background: C.redLt, border: `1px solid #FECACA`, borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: C.red }}>⚠️ {error}</div>}
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={onClose} style={{ flex: 1, padding: "11px", borderRadius: 8, border: `1px solid ${C.border}`, background: "transparent", fontSize: 13, fontWeight: 600, color: C.text2, cursor: "pointer" }}>Cancelar</button>
                <button onClick={handleSubmit} disabled={loading} style={{ flex: 2, padding: "11px", borderRadius: 8, border: "none", background: loading ? C.gray300 : C.blue, color: C.white, fontSize: 13, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer" }}>{loading ? "Enviando…" : "Enviar para aprovação →"}</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

function TabDashboard({ client, player, stats, playlist, payments, onNav, onAddPromo, online, lastSeen, checking }: any) {
  const revenue   = stats.revenue_month || 0
  const campanhas = 3
  const vizToday  = stats.plays_today

  const sinceText = lastSeen
    ? (() => {
        const diff = Math.floor((Date.now() - new Date(lastSeen).getTime()) / 1000)
        if (diff < 60)   return `${diff}s atrás`
        if (diff < 3600) return `${Math.floor(diff / 60)}min atrás`
        return `${Math.floor(diff / 3600)}h atrás`
      })()
    : player?.last_ping
      ? (() => {
          const diff = Math.floor((Date.now() - new Date(player.last_ping).getTime()) / 1000)
          if (diff < 60)   return `${diff}s atrás`
          if (diff < 3600) return `${Math.floor(diff / 60)}min atrás`
          return `${Math.floor(diff / 3600)}h atrás`
        })()
      : "sem dados"

  const ads = [
    { name: "Bradesco — Black Friday", cat: "Banco",    views: 1240, value: 180, status: "Ativo"   },
    { name: "iFood — Cupom 30%",       cat: "Delivery", views: 980,  value: 140, status: "Ativo"   },
    { name: "Natura — Perfumes",       cat: "Beleza",   views: 650,  value: 90,  status: "Pausado" },
  ]

  const futuros = [
    { month: "Jul/26", value: 980,  label: "Receita prevista"  },
    { month: "Ago/26", value: 1120, label: "Estimado pela IA"  },
    { month: "Set/26", value: 1240, label: "Projeção otimista" },
  ]

  return (
    <div>
      <div style={{ background: online ? C.greenLt : C.redLt, border: `1px solid ${online ? C.greenBd : "#FECACA"}`, borderRadius: 12, padding: "14px 20px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, background: online ? C.green : C.red, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: online ? C.green : C.red }}>
              {online ? "Sua TV está online e funcionando" : "Sua TV está offline"}
            </div>
            <div style={{ fontSize: 12, color: online ? C.green : C.red, opacity: 0.8 }}>
              Última sincronização: {sinceText} · {checking ? "verificando…" : "3 anúncios em exibição"}
            </div>
          </div>
        </div>
        <StatusBadge online={online} checking={checking} />
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <KpiCard label="Receita este mês" value={fmtR(revenue)}     sub="+23% vs mai"      icon="💵" color={C.green} />
        <KpiCard label="Saldo a receber"  value={fmtR(revenue)}     sub="em 10/Jul"        icon="📅" color={C.blue}  />
        <KpiCard label="Campanhas ativas" value={String(campanhas)} sub="1 pausada"        icon="▶"  color={C.blue}  />
        <KpiCard label="Visualizações"    value={fmt(vizToday)}     sub="+12% esta semana" icon="👁" color={C.blue}  />
        <KpiCard label="Status da TV"     value={online ? "Online" : "Offline"} sub={player?.id ? `SCR-${player.id.slice(0,5).toUpperCase()}` : "—"} icon="📶" color={online ? C.green : C.red} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16, marginBottom: 20, alignItems: "start" }}>
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border2}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Minha TV Agora</div>
            <button onClick={() => onNav("tv")} style={{ fontSize: 12, color: C.blue, background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>Ao vivo na sua TV →</button>
          </div>
          <div style={{ background: "#0F172A", margin: 16, borderRadius: 10, padding: "28px 16px", textAlign: "center", minHeight: 140, position: "relative" }}>
            <div style={{ position: "absolute", top: 10, left: 14, background: online ? C.green : C.red, color: C.white, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>
              {online ? "● AO VIVO" : "● OFFLINE"}
            </div>
            <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 6 }}>☕ PROMOÇÃO DO DIA</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: C.white, marginBottom: 4 }}>Café + Pão de Queijo</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.green }}>R$ 9,90</div>
            <div style={{ fontSize: 11, color: "#64748B", marginTop: 4 }}>Bradesco · Válido hoje</div>
            <div style={{ position: "absolute", bottom: 10, right: 14, fontSize: 10, color: "#475569" }}>00:12 restante</div>
          </div>
        </div>

        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 12 }}>Em exibição agora</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 2 }}>Café + Pão de Queijo</div>
          <div style={{ fontSize: 12, color: C.text2, marginBottom: 16 }}>Bradesco Black Friday · ativo</div>
          <div style={{ width: 80, height: 80, background: C.gray100, borderRadius: 8, margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>⬛</div>
          <div style={{ fontSize: 10, color: C.text3, textAlign: "center", marginBottom: 16 }}>Escaneie para ver a promoção</div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.text2, marginBottom: 6 }}><span>Próximo anúncio</span><span style={{ fontWeight: 500 }}>iFood · 00:43</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.text2, marginBottom: 6 }}><span>Visualizações hoje</span><span style={{ fontWeight: 600, color: C.text }}>{fmt(vizToday)}</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.text2 }}><span>Ganho hoje</span><span style={{ fontWeight: 600, color: C.green }}>{fmtR(stats.revenue_today || 42)}</span></div>
        </div>
      </div>

      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden", marginBottom: 16 }}>
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border2}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Quais anúncios estão rodando?</div>
          <button onClick={() => onNav("anuncios")} style={{ fontSize: 12, color: C.blue, background: "none", border: "none", cursor: "pointer" }}>Ver todos</button>
        </div>
        {ads.map((ad, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", padding: "12px 18px", borderBottom: i < ads.length - 1 ? `1px solid ${C.border2}` : "none" }}>
            <div style={{ width: 36, height: 36, background: C.gray100, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, marginRight: 12 }}>📢</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{ad.name}</div>
              <div style={{ fontSize: 11, color: C.text3 }}>{ad.cat} · {ad.views.toLocaleString("pt-BR")} visualizações</div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 20, background: ad.status === "Ativo" ? C.greenLt : C.gray100, color: ad.status === "Ativo" ? C.green : C.text3, marginRight: 12 }}>{ad.status}</span>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.green }}>R$ {ad.value}</div>
              <div style={{ fontSize: 10, color: C.text3 }}>este mês</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 18px" }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 14 }}>Ganhos Futuros</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
          {futuros.map((f, i) => (
            <div key={i} style={{ background: i === 0 ? C.blueLt : C.gray50, border: `1px solid ${i === 0 ? C.blueBd : C.border2}`, borderRadius: 10, padding: "14px" }}>
              <div style={{ fontSize: 11, color: C.text3, marginBottom: 4 }}>{f.month}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: i === 0 ? C.blue : C.green }}>{fmtR(f.value)}</div>
              <div style={{ fontSize: 11, color: C.text3, marginTop: 4 }}>{f.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function TabTV({ client, player, playlist, online, checking }: any) {
  const items = playlist.length > 0 ? playlist : [
    { id: "1", type: "ad",      duration: 15, position: 1, asset_url: null },
    { id: "2", type: "content", duration: 30, position: 2, asset_url: null },
    { id: "3", type: "ad",      duration: 15, position: 3, asset_url: null },
    { id: "4", type: "content", duration: 20, position: 4, asset_url: null },
  ]
  const names: Record<string, string> = { "1": "Bradesco — Black Friday", "2": "Cardápio do Dia", "3": "iFood — Cupom 30%", "4": "Boas-vindas Clientes" }

  return (
    <div>
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden", marginBottom: 16 }}>
        <div style={{ background: "#0F172A", height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 40 }}>📺</div>
            <div style={{ fontSize: 12, color: "#64748B", marginTop: 8 }}>Preview indisponível</div>
          </div>
        </div>
        <div style={{ padding: "16px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>TV Entrada Principal</div>
              <div style={{ fontSize: 12, color: C.text3 }}>{player?.id ? `SCR-${player.id.slice(0,5).toUpperCase()}` : "SCR-00847"} · Android TV 11</div>
            </div>
            <StatusBadge online={online} checking={checking} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
            {[
              { label: "Sinal",  value: "Excelente", color: C.green },
              { label: "Uptime", value: `${(player?.sla_30d ?? 99.8).toFixed(1)}%`, color: C.blue },
              { label: "Temp.",  value: "42°C", color: C.amber },
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
          <span style={{ fontSize: 12, color: C.text3 }}>{items.length} itens · ~{Math.round(items.reduce((a: number, b: any) => a + (b.duration || 15), 0) / 60)}min loop</span>
        </div>
        {items.map((item: any, i: number) => (
          <div key={item.id} style={{ display: "flex", alignItems: "center", padding: "12px 18px", borderBottom: i < items.length - 1 ? `1px solid ${C.border2}` : "none" }}>
            <span style={{ width: 24, fontSize: 12, color: C.text3, fontWeight: 600 }}>{i + 1}</span>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: item.type === "ad" ? C.blueLt : C.greenLt, display: "flex", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
              <span style={{ fontSize: 12 }}>{item.type === "ad" ? "📢" : "🖼"}</span>
            </div>
            <div style={{ flex: 1, fontSize: 13, color: C.text, fontWeight: i === 0 ? 600 : 400 }}>
              {names[item.id] || (item.type === "ad" ? "Anúncio" : "Conteúdo")}
            </div>
            <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: item.type === "ad" ? C.blueLt : C.greenLt, color: item.type === "ad" ? C.blue : C.green, marginRight: 12 }}>
              {item.type === "ad" ? "Anúncio" : "Conteúdo"}
            </span>
            <span style={{ fontSize: 12, color: C.text3, minWidth: 30 }}>{item.duration || 15}s</span>
            {i === 0 && <span style={{ width: 8, height: 8, borderRadius: "50%", background: C.green, marginLeft: 8 }} />}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── TabConteudo: usa playlist real com imagens do R2 ─────────────────────────
function TabConteudo({ client, playlist, onAddPromo }: any) {
  const realItems = (playlist as PlaylistItem[]).filter(i => i.type === "content" || i.type === "image" || i.type === "video")

  // Nomes genéricos se não houver nome no item
  const nameFor = (item: PlaylistItem, idx: number) =>
    (item as any).name || `Conteúdo ${idx + 1}`

  const statusFor = (_item: PlaylistItem) => "Ativo"

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button onClick={onAddPromo} style={{ background: C.blue, color: C.white, border: "none", borderRadius: 8, padding: "10px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>+ Enviar mídia</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16, marginBottom: 16 }}>
        {realItems.length > 0 ? realItems.map((item, i) => {
          const name   = nameFor(item, i)
          const status = statusFor(item)
          const tipo   = item.type === "video" ? "Video" : "Imagem"
          return (
            <div key={item.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
              <div style={{ position: "relative" }}>
                <PlaylistThumb item={item} name={name} />
                <div style={{ position: "absolute", bottom: 8, left: 8, background: "rgba(0,0,0,0.6)", color: C.white, fontSize: 10, padding: "2px 7px", borderRadius: 4 }}>{tipo}</div>
                <div style={{ position: "absolute", bottom: 8, right: 8, background: "rgba(0,0,0,0.6)", color: C.white, fontSize: 10, padding: "2px 7px", borderRadius: 4 }}>{item.duration || 15}s</div>
              </div>
              <div style={{ padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 2 }}>{name}</div>
                  <div style={{ fontSize: 11, color: C.text3 }}>⏱ {item.duration || 15}s</div>
                </div>
                <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: status === "Ativo" ? C.greenLt : C.gray100, color: status === "Ativo" ? C.green : C.text3 }}>{status}</span>
              </div>
            </div>
          )
        }) : (
          // Fallback se playlist vazia
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px", color: C.text3, background: C.white, borderRadius: 12, border: `1px solid ${C.border}` }}>
            Nenhum conteúdo na playlist ainda.
          </div>
        )}

        {/* Card de upload */}
        <div onClick={onAddPromo} style={{ background: C.white, border: `2px dashed ${C.gray300}`, borderRadius: 12, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 200, gap: 8, cursor: "pointer" }}>
          <div style={{ fontSize: 28, color: C.blue }}>+</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Adicionar nova mídia</div>
          <div style={{ fontSize: 12, color: C.text3 }}>Upload de imagem ou vídeo da sua loja</div>
          <button style={{ marginTop: 8, background: C.blue, color: C.white, border: "none", borderRadius: 8, padding: "8px 18px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Escolher arquivo</button>
        </div>
      </div>
    </div>
  )
}

function TabAnuncios({ stats, payments, code, onAddPromo }: any) {
  const ads = [
    { name: "Bradesco — Black Friday", cat: "Banco",    views: 1240, value: 180, status: "Ativo"   },
    { name: "iFood — Cupom 30%",       cat: "Delivery", views: 980,  value: 140, status: "Ativo"   },
    { name: "Natura — Perfumes",       cat: "Beleza",   views: 650,  value: 90,  status: "Pausado" },
  ]
  const suggestions = [
    { icon: "🏦", text: "Novo anunciante disponível: Banco Itaú",   sub: "Campanha de 90 dias · CPM R$ 12,00 · alto match com seu público.", value: "+R$ 240/mês",       color: C.green },
    { icon: "🌤", text: "Adicione promoção de fim de tarde",         sub: "Telas com conteúdo próprio 16h–18h têm 3× mais engajamento.",     value: "+34% views",       color: C.amber },
    { icon: "💡", text: "Potencial não realizado: R$ 320/mês",      sub: "Com 3 melhorias simples, você pode chegar a R$ 1.167/mês.",       value: "R$ 1.167 em set/26", color: C.blue },
  ]
  const months = ["Jan","Fev","Mar","Abr","Mai","Jun"]
  const vals   = [420, 520, 580, 640, 720, stats.revenue_month || 847]
  const maxVal = Math.max(...vals)

  return (
    <div>
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: "18px 20px", marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Quanto ganhei este mês?</div>
            <div style={{ fontSize: 11, color: C.text3 }}>Receita dos últimos 6 meses</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: C.green }}>{fmtR(stats.revenue_month || 847)}</div>
            <div style={{ fontSize: 11, color: C.green }}>+23%</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 80 }}>
          {vals.map((v, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ width: "100%", background: i === vals.length - 1 ? C.green : C.greenLt, borderRadius: "4px 4px 0 0", height: `${(v / maxVal) * 64}px`, transition: "height 0.3s" }} />
              <span style={{ fontSize: 9, color: C.text3 }}>{months[i]}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16, marginBottom: 16 }}>
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border2}`, display: "flex", justifyContent: "space-between" }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Quais anúncios estão rodando?</div>
            <button style={{ fontSize: 12, color: C.blue, background: "none", border: "none", cursor: "pointer" }}>Ver todos</button>
          </div>
          {ads.map((ad, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", padding: "12px 18px", borderBottom: i < ads.length - 1 ? `1px solid ${C.border2}` : "none" }}>
              <div style={{ width: 32, height: 32, background: C.gray100, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", marginRight: 10, fontSize: 16 }}>📢</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{ad.name}</div>
                <div style={{ fontSize: 11, color: C.text3 }}>{ad.cat} · {ad.views.toLocaleString("pt-BR")} visualizações</div>
              </div>
              <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: ad.status === "Ativo" ? C.greenLt : C.gray100, color: ad.status === "Ativo" ? C.green : C.text3, marginRight: 10 }}>{ad.status}</span>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.green }}>R$ {ad.value}</div>
                <div style={{ fontSize: 10, color: C.text3 }}>este mês</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border2}`, fontSize: 14, fontWeight: 600 }}>Calendário de pagamentos</div>
          {payments.length > 0 ? payments.slice(0, 3).map((p: Payment, i: number) => (
            <div key={p.id} style={{ padding: "12px 18px", borderBottom: i < 2 ? `1px solid ${C.border2}` : "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 12, color: C.text3 }}>{fmtDate(p.paid_at || p.created_at, true)}</div>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>{fmtR(p.value)}</div>
                </div>
                <span style={{ fontSize: 11, padding: "3px 9px", borderRadius: 20, background: p.status === "paid" ? C.greenLt : p.status === "pending" ? C.blueLt : C.amberLt, color: p.status === "paid" ? C.green : p.status === "pending" ? C.blue : C.amber }}>
                  {p.status === "paid" ? "Processado" : p.status === "pending" ? "Agendado" : "Pendente"}
                </span>
              </div>
            </div>
          )) : [
            { label: "10 Jun", value: "R$ 420,00", status: "Processado", bg: C.greenLt, color: C.green },
            { label: "10 Jul", value: "R$ 847,00", status: "Agendado",   bg: C.blueLt,  color: C.blue  },
            { label: "10 Ago", value: "R$ —",       status: "Pendente",   bg: C.gray100, color: C.text3 },
          ].map((p, i) => (
            <div key={i} style={{ padding: "12px 18px", borderBottom: i < 2 ? `1px solid ${C.border2}` : "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 12, color: C.text3 }}>{p.label}</div>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>{p.value}</div>
                </div>
                <span style={{ fontSize: 11, padding: "3px 9px", borderRadius: 20, background: p.bg, color: p.color }}>{p.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: C.blueLt, border: `1px solid ${C.blueBd}`, borderRadius: 12, padding: "14px 18px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ fontSize: 20 }}>⚡</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.blue }}>Adicione uma promoção da sua loja</div>
            <div style={{ fontSize: 12, color: C.text3 }}>Aumente o engajamento em até 40% com conteúdo próprio.</div>
          </div>
        </div>
        <button onClick={onAddPromo} style={{ background: C.blue, color: C.white, border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>+ Adicionar promoção</button>
      </div>

      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border2}`, display: "flex", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 16 }}>⭐</span>
            <span style={{ fontSize: 14, fontWeight: 600 }}>Sugestões de IA</span>
          </div>
          <span style={{ fontSize: 12, color: C.blue }}>4 oportunidades</span>
        </div>
        {suggestions.map((s, i) => (
          <div key={i} style={{ padding: "12px 18px", borderBottom: i < suggestions.length - 1 ? `1px solid ${C.border2}` : "none", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
            <div style={{ display: "flex", gap: 10 }}>
              <span style={{ fontSize: 18 }}>{s.icon}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{s.text}</div>
                <div style={{ fontSize: 11, color: C.text3 }}>{s.sub}</div>
              </div>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: s.color, whiteSpace: "nowrap" }}>{s.value}</span>
          </div>
        ))}
        <div style={{ padding: "12px 18px" }}>
          <a href={`/dashboard/local/${code}/ai-revenue`} style={{ display: "block", width: "100%", background: C.blue, color: C.white, border: "none", borderRadius: 8, padding: "10px", fontSize: 13, fontWeight: 600, cursor: "pointer", textAlign: "center", textDecoration: "none" }}>
            ⭐ Ver AI Revenue Center completo
          </a>
        </div>
      </div>
    </div>
  )
}

function TabGanhos({ stats, payments, code }: any) {
  const days    = ["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"]
  const dayVals = [42, 38, 55, 61, 85, 72, 48]
  const maxDay  = Math.max(...dayVals)
  const history = payments.length > 0 ? payments : [
    { id: "1", paid_at: "2026-05-10", value: 720, status: "paid" },
    { id: "2", paid_at: "2026-04-10", value: 680, status: "paid" },
    { id: "3", paid_at: "2026-03-10", value: 590, status: "paid" },
    { id: "4", paid_at: "2026-02-10", value: 640, status: "paid" },
  ]
  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <KpiCard label="Este mês"        value={fmtR(stats.revenue_month || 847)} sub="+23% vs mai"      icon="💵" color={C.green} />
        <KpiCard label="Média mensal"    value="R$ 662,50"                         sub="últimos 4 meses" icon="📈" color={C.blue}  />
        <KpiCard label="Total acumulado" value="R$ 4.250,00"                       sub="desde o início"  icon="🏆" color={C.blue}  />
      </div>
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: "18px 20px", marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Ganhos por dia da semana</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 100 }}>
          {dayVals.map((v, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ width: "100%", background: C.green, borderRadius: "4px 4px 0 0", height: `${(v / maxDay) * 80}px` }} />
              <span style={{ fontSize: 9, color: C.text3 }}>{days[i]}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border2}`, display: "flex", justifyContent: "space-between" }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Histórico de pagamentos</div>
          <button style={{ fontSize: 12, color: C.blue, background: "none", border: "none", cursor: "pointer" }}>↓ Exportar</button>
        </div>
        {history.map((p: any, i: number) => (
          <div key={p.id} style={{ padding: "14px 18px", borderBottom: i < history.length - 1 ? `1px solid ${C.border2}` : "none", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ width: 32, height: 32, background: C.greenLt, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
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
  return (
    <div>
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden", marginBottom: 16 }}>
        <div style={{ background: "#0F172A", height: 160, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.white }}>Café + Pão de Queijo</div>
            <div style={{ fontSize: 18, color: C.green }}>R$ 9,90</div>
            <div style={{ fontSize: 11, color: "#64748B" }}>Bradesco · Válido hoje</div>
            <div style={{ position: "absolute", bottom: 8, right: 16, fontSize: 10, color: "#475569" }}>00:12 restante</div>
          </div>
        </div>
        <div style={{ padding: "16px 20px", display: "grid", gridTemplateColumns: "1fr 200px", gap: 20 }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>Quanto ganhei este mês?</div>
                <div style={{ fontSize: 11, color: C.text3 }}>Receita dos últimos 6 meses</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: C.green }}>{fmtR(stats.revenue_month || 847)}</div>
                <div style={{ fontSize: 11, color: C.green }}>+23%</div>
              </div>
            </div>
            <div style={{ height: 60, background: C.gray50, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 12, color: C.text3 }}>📈 Gráfico de receita</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Calendário de pagamentos</div>
            {[
              { label: "10 Jun", value: "R$ 420,00", status: "Processado", color: C.green, bg: C.greenLt },
              { label: "10 Jul", value: "R$ 847,00", status: "Agendado",   color: C.blue,  bg: C.blueLt  },
              { label: "10 Ago", value: "R$ —",       status: "Pendente",   color: C.text3, bg: C.gray100 },
            ].map((p, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 11, color: C.text3 }}>{p.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{p.value}</div>
                </div>
                <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 20, background: p.bg, color: p.color }}>{p.status}</span>
              </div>
            ))}
            <button style={{ width: "100%", background: C.greenLt, color: C.green, border: `1px solid ${C.greenBd}`, borderRadius: 8, padding: "8px", fontSize: 12, fontWeight: 600, cursor: "pointer", marginTop: 4 }}>
              $ Ver meus ganhos
            </button>
            <a href={`/dashboard/financeiro/${code}`} style={{ display: "block", textAlign: "center", marginTop: 8, fontSize: 12, color: C.blue, textDecoration: "none", fontWeight: 500 }}>
              Ver dashboard financeiro completo →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
  client:   ClientData
  player:   PlayerData | null
  stats:    StatsData
  playlist: PlaylistItem[]
  payments: Payment[]
}

export default function DashboardClient({ client, player, stats, playlist, payments }: Props) {
  const [tab, setTab]           = useState("dashboard")
  const [sideOpen, setSideOpen] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const onNav      = useCallback((t: string) => setTab(t), [])
  const onAddPromo = useCallback(() => setShowModal(true), [])

  const { online, lastSeen, checking } = usePlayerStatus(
    client.player_id,
    player?.online ?? false
  )

  const initials = client.name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase()

  const tabContent: Record<string, React.ReactNode> = {
    dashboard: <TabDashboard client={client} player={player} stats={stats} playlist={playlist} payments={payments} onNav={onNav} onAddPromo={onAddPromo} online={online} lastSeen={lastSeen} checking={checking} />,
    tv:        <TabTV client={client} player={player} playlist={playlist} online={online} checking={checking} />,
    conteudo:  <TabConteudo client={client} playlist={playlist} onAddPromo={onAddPromo} />,
    anuncios:  <TabAnuncios stats={stats} payments={payments} code={client.code} onAddPromo={onAddPromo} />,
    ganhos:    <TabGanhos stats={stats} payments={payments} code={client.code} />,
    relatorios:<TabRelatorios stats={stats} payments={payments} code={client.code} />,
    config:    <div style={{ padding: 40, textAlign: "center", color: C.text3 }}>Configurações em breve</div>,
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.bg, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
      `}</style>

      {showModal && <ModalPromocao code={client.code} onClose={() => setShowModal(false)} />}

      {/* SIDEBAR */}
      <aside style={{ width: sideOpen ? 200 : 60, background: C.sidebar, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", transition: "width 0.2s", flexShrink: 0 }}>
        <div style={{ padding: "16px 16px 12px", borderBottom: `1px solid ${C.border2}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* ✅ Logo corrigido: gradiente + ícone monitor */}
            <div style={{ width: 28, height: 28, background: "linear-gradient(135deg, #3B82F6, #6366F1)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <rect x="2" y="3" width="20" height="14" rx="2"/>
                <line x1="8" y1="21" x2="16" y2="21"/>
                <line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
            </div>
            {/* ✅ Texto: DOOH branco + PLAY azul */}
            {sideOpen && (
              <span style={{ fontSize: 14, fontWeight: 800, letterSpacing: "-0.02em" }}>
                <span style={{ color: C.text }}>DOOH</span><span style={{ color: C.blue }}>PLAY</span>
              </span>
            )}
          </div>
          {sideOpen && <div style={{ fontSize: 10, color: C.green, fontWeight: 600, marginTop: 4 }}>● Local</div>}
        </div>

        <nav style={{ flex: 1, padding: "8px 0" }}>
          {NAV.map(item => (
            <button key={item.id} onClick={() => setTab(item.id)} style={{
              width: "100%", display: "flex", alignItems: "center", gap: 10,
              padding: sideOpen ? "9px 16px" : "9px 0",
              justifyContent: sideOpen ? "flex-start" : "center",
              background: tab === item.id ? C.blueLt : "none",
              border: "none", cursor: "pointer",
              borderLeft: `3px solid ${tab === item.id ? C.blue : "transparent"}`,
              color: tab === item.id ? C.blue : C.text2,
              fontWeight: tab === item.id ? 600 : 400, fontSize: 13,
            }}>
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {sideOpen && <span style={{ flex: 1, textAlign: "left" }}>{item.label}</span>}
              {sideOpen && item.badge && (
                <span style={{ background: C.blue, color: C.white, fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 10 }}>{item.badge}</span>
              )}
            </button>
          ))}
        </nav>

        <div style={{ padding: "12px 16px", borderTop: `1px solid ${C.border2}`, display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: C.blue, color: C.white, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
            {initials}
          </div>
          {sideOpen && (
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{client.name}</div>
              <div style={{ fontSize: 10, color: C.text3 }}>{client.code}</div>
            </div>
          )}
        </div>
      </aside>

      {/* MAIN */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <header style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => setSideOpen(!sideOpen)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: C.text3 }}>☰</button>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>
                {tab === "dashboard"  && `Dashboard — ${client.name}`}
                {tab === "tv"         && `Minha TV — ${client.name}`}
                {tab === "conteudo"   && `Conteúdo — ${client.name}`}
                {tab === "anuncios"   && `Anúncios — ${client.name}`}
                {tab === "ganhos"     && `Ganhos — ${client.name}`}
                {tab === "relatorios" && `Relatórios — ${client.name}`}
                {tab === "config"     && `Configurações`}
              </div>
              <div style={{ fontSize: 11, color: C.text3 }}>
                {new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }).format(new Date())}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <StatusBadge online={online} checking={checking} />
            <button style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 10px", cursor: "pointer", fontSize: 16, color: C.text2 }}>🔔</button>
            <button onClick={onAddPromo} style={{ background: C.blue, color: C.white, border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              + Enviar mídia
            </button>
          </div>
        </header>

        <main style={{ flex: 1, overflow: "auto", padding: "24px" }}>
          {tabContent[tab]}
        </main>
      </div>
    </div>
  )
}
