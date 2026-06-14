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
      formData.append("file", file); formData.append("name", nome); formData.append("duration", duracao); formData.append("code", code)
      const res = await fetch("/api/studio/upload", { method: "POST", body: formData })
      if (!res.ok) throw new Error("Erro ao enviar.")
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
                    <><div style={{ fontSize: 28, marginBottom: 8 }}>📁</div><div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 4 }}>Clique ou arraste o arquivo</div><div style={{ fontSize: 11, color: C.text3 }}>Imagem (JPG, PNG) ou Vídeo (MP4) · Máx. 50MB</div></>
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

function TabDashboard({ client, player, stats, playlist, payments, onNav, onAddPromo, online, lastSeen, checking }: any) {
  const revenue = stats.revenue_month || 0
  const vizToday = stats.plays_today
  const sinceText = lastSeen
    ? (() => { const diff = Math.floor((Date.now() - new Date(lastSeen).getTime()) / 1000); if (diff < 60) return `${diff}s atrás`; if (diff < 3600) return `${Math.floor(diff/60)}min atrás`; return `${Math.floor(diff/3600)}h atrás` })()
    : player?.last_ping
      ? (() => { const diff = Math.floor((Date.now() - new Date(player.last_ping).getTime()) / 1000); if (diff < 60) return `${diff}s atrás`; if (diff < 3600) return `${Math.floor(diff/60)}min atrás`; return `${Math.floor(diff/3600)}h atrás` })()
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
        <KpiCard label="Receita este mês" value={fmtR(revenue)}    sub="+23% vs mai"      icon="💵" color={C.green} />
        <KpiCard label="Saldo a receber"  value={fmtR(revenue)}    sub="em 10/Jul"        icon="📅" color={C.blue}  />
        <KpiCard label="Campanhas ativas" value="3"                sub="1 pausada"        icon="▶"  color={C.blue}  />
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
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.text2, marginBottom: 6 }}><span>Próximo anúncio</span><span style={{ fontWeight: 500 }}>iFood · 00:43</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.text2, marginBottom: 6 }}><span>Visualizações hoje</span><span style={{ fontWeight: 600, color: C.text }}>{fmt(vizToday)}</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.text2 }}><span>Ganho hoje</span><span style={{ fontWeight: 600, color: C.green }}>{fmtR(stats.revenue_today || 42)}</span></div>
        </div>
      </div>

      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden", marginBottom: 16 }}>
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border2}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Anúncios rodando</div>
          <button onClick={() => onNav("anuncios")} style={{ fontSize: 12, color: C.blue, background: "none", border: "none", cursor: "pointer" }}>Ver todos</button>
        </div>
        {ads.map((ad, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", padding: "12px 18px", borderBottom: i < ads.length - 1 ? `1px solid ${C.border2}` : "none" }}>
            <div style={{ width: 36, height: 36, background: C.gray100, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, marginRight: 12, flexShrink: 0 }}>📢</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ad.name}</div>
              <div style={{ fontSize: 11, color: C.text3 }}>{ad.views.toLocaleString("pt-BR")} views</div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.green }}>R$ {ad.value}</div>
              <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 10, background: ad.status === "Ativo" ? C.greenLt : C.gray100, color: ad.status === "Ativo" ? C.green : C.text3 }}>{ad.status}</span>
            </div>
          </div>
        ))}
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
          <div style={{ textAlign: "center" }}><div style={{ fontSize: 40 }}>📺</div><div style={{ fontSize: 12, color: "#64748B", marginTop: 8 }}>Preview indisponível</div></div>
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
            {[{ label: "Sinal", value: "Excelente", color: C.green }, { label: "Uptime", value: `${(player?.sla_30d ?? 99.8).toFixed(1)}%`, color: C.blue }, { label: "Temp.", value: "42°C", color: C.amber }].map(k => (
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

function TabConteudo({ client, playlist, onAddPromo }: any) {
  const realItems = (playlist as PlaylistItem[]).filter(i => i.type === "content" || i.type === "image" || i.type === "video")
  const nameFor = (item: PlaylistItem, idx: number) => (item as any).name || `Conteúdo ${idx + 1}`
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button onClick={onAddPromo} style={{ background: C.blue, color: C.white, border: "none", borderRadius: 8, padding: "10px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>+ Enviar mídia</button>
      </div>
      <div className="db-content-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16, marginBottom: 16 }}>
        {realItems.length > 0 ? realItems.map((item, i) => {
          const name = nameFor(item, i)
          return (
            <div key={item.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
              <div style={{ position: "relative" }}>
                <PlaylistThumb item={item} name={name} />
                <div style={{ position: "absolute", bottom: 8, left: 8, background: "rgba(0,0,0,0.6)", color: C.white, fontSize: 10, padding: "2px 7px", borderRadius: 4 }}>{item.type === "video" ? "Video" : "Imagem"}</div>
                <div style={{ position: "absolute", bottom: 8, right: 8, background: "rgba(0,0,0,0.6)", color: C.white, fontSize: 10, padding: "2px 7px", borderRadius: 4 }}>{item.duration || 15}s</div>
              </div>
              <div style={{ padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</div>
                  <div style={{ fontSize: 11, color: C.text3 }}>⏱ {item.duration || 15}s</div>
                </div>
                <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: C.greenLt, color: C.green, flexShrink: 0 }}>Ativo</span>
              </div>
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
  const ads = [
    { name: "Bradesco — Black Friday", cat: "Banco",    views: 1240, value: 180, status: "Ativo"   },
    { name: "iFood — Cupom 30%",       cat: "Delivery", views: 980,  value: 140, status: "Ativo"   },
    { name: "Natura — Perfumes",       cat: "Beleza",   views: 650,  value: 90,  status: "Pausado" },
  ]
  const vals = [420, 520, 580, 640, 720, stats.revenue_month || 847]
  const maxVal = Math.max(...vals)
  const months = ["Jan","Fev","Mar","Abr","Mai","Jun"]
  return (
    <div>
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: "18px 20px", marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div><div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Receita este mês</div><div style={{ fontSize: 11, color: C.text3 }}>Últimos 6 meses</div></div>
          <div style={{ textAlign: "right" }}><div style={{ fontSize: 22, fontWeight: 700, color: C.green }}>{fmtR(stats.revenue_month || 847)}</div><div style={{ fontSize: 11, color: C.green }}>+23%</div></div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 80 }}>
          {vals.map((v, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ width: "100%", background: i === vals.length - 1 ? C.green : C.greenLt, borderRadius: "4px 4px 0 0", height: `${(v / maxVal) * 64}px` }} />
              <span style={{ fontSize: 9, color: C.text3 }}>{months[i]}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden", marginBottom: 16 }}>
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border2}`, display: "flex", justifyContent: "space-between" }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Anúncios ativos</div>
        </div>
        {ads.map((ad, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", padding: "12px 18px", borderBottom: i < ads.length - 1 ? `1px solid ${C.border2}` : "none" }}>
            <div style={{ width: 32, height: 32, background: C.gray100, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", marginRight: 10, fontSize: 16, flexShrink: 0 }}>📢</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ad.name}</div>
              <div style={{ fontSize: 11, color: C.text3 }}>{ad.views.toLocaleString("pt-BR")} views</div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.green }}>R$ {ad.value}</div>
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
  const days = ["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"]
  const dayVals = [42, 38, 55, 61, 85, 72, 48]
  const maxDay = Math.max(...dayVals)
  const history = payments.length > 0 ? payments : [
    { id: "1", paid_at: "2026-05-10", value: 720, status: "paid" },
    { id: "2", paid_at: "2026-04-10", value: 680, status: "paid" },
    { id: "3", paid_at: "2026-03-10", value: 590, status: "paid" },
    { id: "4", paid_at: "2026-02-10", value: 640, status: "paid" },
  ]
  return (
    <div>
      <div className="db-kpis" style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <KpiCard label="Este mês"        value={fmtR(stats.revenue_month || 847)} sub="+23% vs mai"     icon="💵" color={C.green} />
        <KpiCard label="Média mensal"    value="R$ 662,50"                        sub="últimos 4 meses" icon="📈" color={C.blue}  />
        <KpiCard label="Total acumulado" value="R$ 4.250,00"                      sub="desde o início"  icon="🏆" color={C.blue}  />
      </div>
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: "18px 20px", marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Ganhos por dia</div>
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
  return (
    <div>
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden", marginBottom: 16 }}>
        <div style={{ background: "#0F172A", height: 140, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.white }}>Café + Pão de Queijo</div>
            <div style={{ fontSize: 18, color: C.green }}>R$ 9,90</div>
            <div style={{ fontSize: 11, color: "#64748B" }}>Bradesco · Válido hoje</div>
          </div>
        </div>
        <div style={{ padding: "16px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div><div style={{ fontSize: 14, fontWeight: 600 }}>Receita este mês</div><div style={{ fontSize: 11, color: C.text3 }}>Últimos 6 meses</div></div>
            <div style={{ textAlign: "right" }}><div style={{ fontSize: 20, fontWeight: 700, color: C.green }}>{fmtR(stats.revenue_month || 847)}</div><div style={{ fontSize: 11, color: C.green }}>+23%</div></div>
          </div>
          <div style={{ marginBottom: 16 }}>
            {[
              { label: "10 Jun", value: "R$ 420,00", status: "Processado", color: C.green, bg: C.greenLt },
              { label: "10 Jul", value: "R$ 847,00", status: "Agendado",   color: C.blue,  bg: C.blueLt  },
              { label: "10 Ago", value: "R$ —",       status: "Pendente",   color: C.text3, bg: C.gray100 },
            ].map((p, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div><div style={{ fontSize: 11, color: C.text3 }}>{p.label}</div><div style={{ fontSize: 13, fontWeight: 600 }}>{p.value}</div></div>
                <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 20, background: p.bg, color: p.color }}>{p.status}</span>
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
  const [form, setForm] = useState({ name: "", business_type: "", address: "", city: "", phone: "", email: "", cpf_cnpj: "", notif_whatsapp: true, notif_email: false })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError]     = useState("")
  useEffect(() => {
    fetch(`/api/client/settings/${code}`).then(r => r.json()).then(d => setForm({ name: d.name ?? "", business_type: d.business_type ?? "", address: d.address ?? "", city: d.city ?? "", phone: d.phone ?? "", email: d.email ?? "", cpf_cnpj: d.cpf_cnpj ?? "", notif_whatsapp: d.notif_whatsapp ?? true, notif_email: d.notif_email ?? false })).catch(() => setError("Erro ao carregar")).finally(() => setLoading(false))
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
  const { online, lastSeen, checking } = usePlayerStatus(client.player_id, player?.online ?? false)
  const initials = client.name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase()

  const tabContent: Record<string, React.ReactNode> = {
    dashboard:  <TabDashboard client={client} player={player} stats={stats} playlist={playlist} payments={payments} onNav={onNav} onAddPromo={onAddPromo} online={online} lastSeen={lastSeen} checking={checking} />,
    tv:         <TabTV client={client} player={player} playlist={playlist} online={online} checking={checking} />,
    conteudo:   <TabConteudo client={client} playlist={playlist} onAddPromo={onAddPromo} />,
    anuncios:   <TabAnuncios stats={stats} payments={payments} code={client.code} onAddPromo={onAddPromo} />,
    ganhos:     <TabGanhos stats={stats} payments={payments} code={client.code} />,
    relatorios: <TabRelatorios stats={stats} payments={payments} code={client.code} />,
    config:     <TabConfiguracoes code={client.code} />,
  }

  const tabLabel: Record<string, string> = {
    dashboard: `Dashboard`, tv: `Minha TV`, conteudo: `Conteúdo`,
    anuncios: `Anúncios`, ganhos: `Ganhos`, relatorios: `Relatórios`, config: `Configurações`,
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

      {showModal && <ModalPromocao code={client.code} onClose={() => setShowModal(false)} />}

      {/* DRAWER OVERLAY — mobile */}
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
                <button key={item.id} onClick={() => onNav(item.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", background: tab === item.id ? C.blueLt : "none", border: "none", cursor: "pointer", borderLeft: `3px solid ${tab === item.id ? C.blue : "transparent"}`, color: tab === item.id ? C.blue : C.text2, fontWeight: tab === item.id ? 600 : 400, fontSize: 14 }}>
                  <span style={{ fontSize: 18 }}>{item.icon}</span>
                  <span style={{ flex: 1, textAlign: "left" }}>{item.label}</span>
                  {item.badge && <span style={{ background: C.blue, color: C.white, fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 10 }}>{item.badge}</span>}
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

      {/* SIDEBAR — desktop */}
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
            <button key={item.id} onClick={() => setTab(item.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: sideOpen ? "9px 16px" : "9px 0", justifyContent: sideOpen ? "flex-start" : "center", background: tab === item.id ? C.blueLt : "none", border: "none", cursor: "pointer", borderLeft: `3px solid ${tab === item.id ? C.blue : "transparent"}`, color: tab === item.id ? C.blue : C.text2, fontWeight: tab === item.id ? 600 : 400, fontSize: 13 }}>
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {sideOpen && <span style={{ flex: 1, textAlign: "left" }}>{item.label}</span>}
              {sideOpen && item.badge && <span style={{ background: C.blue, color: C.white, fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 10 }}>{item.badge}</span>}
            </button>
          ))}
        </nav>
        <div style={{ padding: "12px 16px", borderTop: `1px solid ${C.border2}`, display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: C.blue, color: C.white, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{initials}</div>
          {sideOpen && <div style={{ overflow: "hidden" }}><div style={{ fontSize: 12, fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{client.name}</div><div style={{ fontSize: 10, color: C.text3 }}>{client.code}</div></div>}
        </div>
      </aside>

      {/* MAIN */}
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

        {/* BOTTOM NAV — mobile */}
        <nav className="db-bottom-nav" style={{ display: "none", position: "fixed", bottom: 0, left: 0, right: 0, background: C.white, borderTop: `1px solid ${C.border}`, zIndex: 100, justifyContent: "space-around", padding: "8px 0 4px" }}>
          {NAV.slice(0, 5).map(item => (
            <button key={item.id} onClick={() => onNav(item.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, background: "none", border: "none", cursor: "pointer", padding: "4px 8px", color: tab === item.id ? C.blue : C.text3, position: "relative" }}>
              {item.badge && <span style={{ position: "absolute", top: 0, right: 4, background: C.blue, color: C.white, fontSize: 9, fontWeight: 700, padding: "0px 4px", borderRadius: 8 }}>{item.badge}</span>}
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
