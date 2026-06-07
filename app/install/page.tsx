"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"

type Status = "checking" | "found" | "invalid" | "ready" | "pending"

const STEPS = [
  { id: 1, icon: "tv",              label: "Conectar TV",          desc: "Fire Stick ou Android TV" },
  { id: 2, icon: "shield-check",    label: "Validar Código",       desc: "Autenticação segura" },
  { id: 3, icon: "device-tv",       label: "Registrar Tela",       desc: "Vincular ao ecossistema" },
  { id: 4, icon: "refresh",         label: "Sincronizar",          desc: "Conteúdo e playlist" },
  { id: 5, icon: "circle-check",    label: "Tela Ativa",           desc: "Monitoramento habilitado" },
]

const CHAIN = [
  { label: "ICP Brasil",    sub: "Assinatura digital" },
  { label: "Merkle Root",   sub: "Prova criptográfica" },
  { label: "Blockchain",    sub: "Polygon Mainnet" },
  { label: "Auditoria",     sub: "Enterprise grade" },
]

const BENEFITS = [
  { icon: "coin",           label: "Monetização",          desc: "Revenue share automático" },
  { icon: "bolt",           label: "Conteúdo Automático",  desc: "IA + clima + agenda" },
  { icon: "shield-check",   label: "Proof-of-Play",        desc: "Blockchain verificável" },
  { icon: "device-remote",  label: "Gestão Remota",        desc: "Studio web em tempo real" },
  { icon: "report-search",  label: "Auditoria Enterprise", desc: "Merkle proof + ICP-Brasil" },
]

const TIMELINE = [
  { icon: "check",         label: "Tela registrada",        color: "#10B981" },
  { icon: "refresh",       label: "Player sincronizado",    color: "#3B82F6" },
  { icon: "download",      label: "Conteúdo baixado",       color: "#3B82F6" },
  { icon: "activity",      label: "Monitoramento ativo",    color: "#10B981" },
  { icon: "coin",          label: "Monetização habilitada", color: "#F59E0B" },
]

export default function InstallEnterprisePage() {
  const searchParams  = useSearchParams()
  const screenId      = searchParams.get("screen") || ""
  const code          = searchParams.get("code")?.toUpperCase() || ""
  const [status, setStatus]       = useState<Status>("checking")
  const [activeStep, setActiveStep] = useState(1)
  const [clientName, setClientName] = useState("")

  const playerUrl = screenId
    ? `https://doohplay-demo.onrender.com/player?screen=${screenId}`
    : `https://doohplay-demo.onrender.com/player?screen=YOUR_SCREEN_ID`

  useEffect(() => {
    if (!code && !screenId) { setStatus("pending"); return }
    const t = setTimeout(async () => {
      try {
        if (code) {
          const res  = await fetch(`/api/studio/auth?code=${code}`)
          const data = await res.json()
          if (data.ok) {
            setClientName(data.client?.name || code)
            setStatus("found")
            let s = 1
            const advance = setInterval(() => {
              s++; setActiveStep(s)
              if (s >= 5) { clearInterval(advance); setStatus("ready") }
            }, 800)
          } else { setStatus("invalid") }
        } else {
          setStatus("found")
          setTimeout(() => { setActiveStep(3); setTimeout(() => { setActiveStep(5); setStatus("ready") }, 1200) }, 800)
        }
      } catch { setStatus("pending") }
    }, 900)
    return () => clearTimeout(t)
  }, [code, screenId])

  const statusMap: Record<Status, { icon: string; color: string; label: string; desc: string }> = {
    checking: { icon: "loader",        color: "#3B82F6", label: "Verificando...",          desc: "Validando credenciais" },
    found:    { icon: "circle-check",  color: "#10B981", label: "Tela encontrada",         desc: `Código ${code} validado` },
    ready:    { icon: "player-play",   color: "#10B981", label: "Pronta para ativação",    desc: "Todos os sistemas OK" },
    pending:  { icon: "alert-circle",  color: "#F59E0B", label: "Conexão pendente",        desc: "Aguardando screen_id" },
    invalid:  { icon: "circle-x",      color: "#EF4444", label: "Código inválido",         desc: "Verifique o código" },
  }

  const st = statusMap[status]

  return (
    <main style={{ minHeight: "100vh", background: "#0B1020", color: "#fff", fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* NAV */}
      <nav style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, background: "#3B82F6", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="5" height="5" rx="1" fill="white"/><rect x="9" y="2" width="5" height="5" rx="1" fill="white" opacity="0.6"/><rect x="2" y="9" width="5" height="5" rx="1" fill="white" opacity="0.6"/><rect x="9" y="9" width="5" height="5" rx="1" fill="white" opacity="0.3"/></svg>
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.02em" }}>DOOHPLAY</span>
          <span style={{ fontSize: 11, color: "#475569", background: "rgba(255,255,255,0.06)", padding: "2px 8px", borderRadius: 20, marginLeft: 4 }}>Enterprise</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981" }} />
          <span style={{ fontSize: 12, color: "#94A3B8" }}>Sistema operacional</span>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "3rem 1.5rem", display: "grid", gridTemplateColumns: "1fr 420px", gap: "3rem", alignItems: "start" }}>

        {/* LEFT — Hero + Benefits */}
        <div>
          <div style={{ marginBottom: "3rem" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.25)", borderRadius: 20, padding: "4px 12px", fontSize: 12, color: "#3B82F6", marginBottom: 20 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#3B82F6" }} />
              Instalação guiada — TV & Android TV
            </div>
            <h1 style={{ fontSize: 48, fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.03em", marginBottom: 16, margin: "0 0 16px" }}>
              Ative sua Tela no<br />
              <span style={{ color: "#3B82F6" }}>DOOHPLAY</span>
            </h1>
            <p style={{ fontSize: 18, color: "#94A3B8", lineHeight: 1.6, maxWidth: 480, margin: "0 0 2rem" }}>
              Transforme qualquer TV em um canal de mídia digital inteligente. Conteúdo automatizado, monetização e auditoria blockchain.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {BENEFITS.map(b => (
                <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <div>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{b.label}</span>
                    <span style={{ fontSize: 13, color: "#64748B", marginLeft: 8 }}>{b.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ProofChain Security */}
          <div style={{ background: "#12182B", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: "1.5rem", marginBottom: "2rem" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#3B82F6", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 16 }}>
              ProofChain Security — exclusivo DOOHPLAY
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
              {CHAIN.map((c, i) => (
                <div key={c.label} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                  <div style={{ flex: 1, textAlign: "center" }}>
                    <div style={{ background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: 12, padding: "10px 8px", marginBottom: 6 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#3B82F6" }}>{c.label}</div>
                    </div>
                    <div style={{ fontSize: 11, color: "#475569" }}>{c.sub}</div>
                  </div>
                  {i < CHAIN.length - 1 && (
                    <div style={{ width: 20, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* After activation timeline */}
          <div style={{ background: "#12182B", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: "1.5rem" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 16 }}>O que acontece após a ativação?</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {TIMELINE.map((t, i) => (
                <div key={t.label} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: `${t.color}18`, border: `1px solid ${t.color}40`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={t.color} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    {i < TIMELINE.length - 1 && <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.06)", margin: "2px 0" }} />}
                  </div>
                  <div style={{ paddingBottom: i < TIMELINE.length - 1 ? 16 : 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "#CBD5E1" }}>{i + 1}. {t.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT — Activation Card */}
        <div style={{ position: "sticky", top: "1.5rem" }}>

          {/* Status Card */}
          <div style={{ background: "#12182B", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: "1.5rem", marginBottom: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1.25rem" }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${st.color}18`, border: `1px solid ${st.color}40`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={st.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {status === "checking" && <><path d="M21 12a9 9 0 11-18 0"/></>}
                  {(status === "found" || status === "ready") && <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>}
                  {status === "pending" && <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>}
                  {status === "invalid" && <><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></>}
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{st.label}</div>
                <div style={{ fontSize: 12, color: "#64748B" }}>{st.desc}</div>
              </div>
              <div style={{ marginLeft: "auto", fontSize: 11, background: `${st.color}18`, color: st.color, padding: "3px 10px", borderRadius: 20, border: `1px solid ${st.color}30` }}>
                {status === "ready" ? "Ativo" : status === "checking" ? "..." : status === "found" ? "OK" : status === "pending" ? "Aguardando" : "Erro"}
              </div>
            </div>

            {/* Stepper */}
            <div style={{ display: "flex", alignItems: "center", marginBottom: "1.5rem" }}>
              {STEPS.map((step, i) => (
                <div key={step.id} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? 1 : "none" }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                    background: activeStep > step.id ? "#10B981" : activeStep === step.id ? "#3B82F6" : "rgba(255,255,255,0.06)",
                    border: `1px solid ${activeStep > step.id ? "#10B981" : activeStep === step.id ? "#3B82F6" : "rgba(255,255,255,0.1)"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 700,
                    color: activeStep >= step.id ? "#fff" : "#475569",
                    transition: "all 0.3s",
                  }}>
                    {activeStep > step.id
                      ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                      : step.id
                    }
                  </div>
                  {i < STEPS.length - 1 && (
                    <div style={{ flex: 1, height: 1, background: activeStep > step.id + 1 ? "#10B981" : "rgba(255,255,255,0.08)", margin: "0 4px", transition: "background 0.3s" }} />
                  )}
                </div>
              ))}
            </div>

            {/* Active step label */}
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "10px 14px", marginBottom: "1.25rem" }}>
              <div style={{ fontSize: 12, color: "#94A3B8" }}>
                {STEPS[Math.min(activeStep - 1, 4)].label} — {STEPS[Math.min(activeStep - 1, 4)].desc}
              </div>
            </div>

            {/* Player URL */}
            {screenId && (
              <div style={{ marginBottom: "1.25rem" }}>
                <div style={{ fontSize: 11, color: "#475569", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>URL do player</div>
                <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "10px 12px", fontFamily: "monospace", fontSize: 11, color: "#94A3B8", wordBreak: "break-all" }}>
                  {playerUrl}
                </div>
              </div>
            )}

            {/* Code */}
            {code && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1.25rem" }}>
                <div style={{ flex: 1, background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "10px 14px" }}>
                  <div style={{ fontSize: 11, color: "#475569", marginBottom: 2 }}>Código de ativação</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", fontFamily: "monospace", letterSpacing: "0.1em" }}>{code}</div>
                  {clientName && <div style={{ fontSize: 11, color: "#10B981", marginTop: 2 }}>{clientName}</div>}
                </div>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: status === "ready" ? "rgba(16,185,129,0.15)" : "rgba(59,130,246,0.1)", border: `1px solid ${status === "ready" ? "rgba(16,185,129,0.3)" : "rgba(59,130,246,0.2)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={status === "ready" ? "#10B981" : "#3B82F6"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </div>
              </div>
            )}

            {/* CTA */}
            {status === "ready" ? (
              <a href={playerUrl} target="_blank" rel="noopener noreferrer" style={{ display: "block", width: "100%", background: "#10B981", color: "#fff", border: "none", borderRadius: 12, padding: "14px", fontSize: 14, fontWeight: 700, cursor: "pointer", textDecoration: "none", textAlign: "center", letterSpacing: "0.02em", boxSizing: "border-box" }}>
                Abrir Player na TV
              </a>
            ) : (
              <div style={{ width: "100%", background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 12, padding: "14px", fontSize: 14, color: "#3B82F6", textAlign: "center", fontWeight: 600 }}>
                {status === "checking" ? "Validando..." : status === "invalid" ? "Código inválido" : "Aguardando ativação"}
              </div>
            )}
          </div>

          {/* Trust badges */}
          <div style={{ background: "#12182B", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "1rem 1.25rem" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Segurança & Auditoria</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {["ICP-Brasil", "Merkle Proof", "Polygon Mainnet", "Certificado Digital", "Trust Score 100"].map(badge => (
                <span key={badge} style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 20, padding: "4px 10px", fontSize: 11, color: "#3B82F6", fontWeight: 500 }}>
                  {badge}
                </span>
              ))}
            </div>
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.05)", fontSize: 11, color: "#334155", lineHeight: 1.5 }}>
              Único sistema DOOH com certificado de veiculação assinado digitalmente por ICP-Brasil — validade jurídica garantida.
            </div>
          </div>

          {/* WhatsApp support */}
          <a href="https://wa.me/5511962050987?text=Preciso%20de%20ajuda%20com%20a%20instala%C3%A7%C3%A3o" style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12, padding: "12px 16px", background: "rgba(37,211,102,0.08)", border: "1px solid rgba(37,211,102,0.2)", borderRadius: 12, textDecoration: "none" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#25D366" }}>Suporte via WhatsApp</div>
              <div style={{ fontSize: 11, color: "#475569" }}>Resposta em minutos</div>
            </div>
            <svg style={{ marginLeft: "auto" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
          </a>
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "1.5rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 12, color: "#334155" }}>DOOHPLAY — Trust Infrastructure for DOOH Advertising</div>
        <div style={{ fontSize: 12, color: "#334155" }}>ICP-Brasil · Blockchain · Enterprise</div>
      </div>
    </main>
  )
}
