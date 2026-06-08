"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"

type Status = "checking" | "found" | "invalid" | "ready" | "pending"

const STEPS = [
  { id: 1, label: "Conectar TV",          desc: "Dispositivo detectado na rede" },
  { id: 2, label: "Validar Código",       desc: "Código verificado com sucesso" },
  { id: 3, label: "Registrar Tela",       desc: "Registrando sua tela no sistema" },
  { id: 4, label: "Sincronizar Conteúdo", desc: "Aguardando conexão da TV" },
  { id: 5, label: "Tela Ativa",           desc: "Pronta para exibir conteúdo" },
]

const BENEFITS = [
  { icon: "📈", label: "Monetização",            desc: "Gere receita com anúncios e conteúdo estratégico." },
  { icon: "▶️", label: "Conteúdo Automatizado",  desc: "Playlists dinâmicas e atualização em tempo real." },
  { icon: "🛡",  label: "Proof-of-Play Blockchain", desc: "Todas as exibições auditadas e registradas na blockchain." },
  { icon: "📡", label: "Gestão Remota",           desc: "Controle total da sua rede de telas de qualquer lugar." },
  { icon: "🔍", label: "Auditoria Enterprise",    desc: "Relatórios, certificados e compliance para anunciantes." },
]

const CHAIN = [
  { label: "ICP Brasil",  sub: "Assinatura digital" },
  { label: "Merkle Root", sub: "Prova criptográfica" },
  { label: "Blockchain",  sub: "Polygon Mainnet" },
  { label: "Auditoria",   sub: "Enterprise grade" },
]

const TIMELINE = [
  { label: "Tela registrada",        color: "#10B981" },
  { label: "Player sincronizado",    color: "#3B82F6" },
  { label: "Conteúdo baixado",       color: "#3B82F6" },
  { label: "Monitoramento ativo",    color: "#10B981" },
  { label: "Monetização habilitada", color: "#F59E0B" },
]

const TRUST = [
  { icon: "🔐", label: "ICP Brasil",   sub: "Certificação Digital" },
  { icon: "🔗", label: "Merkle Proof", sub: "Integridade dos Dados" },
  { icon: "⛓",  label: "Blockchain",  sub: "Registro Imutável" },
  { icon: "⭐", label: "Trust Score",  sub: "Rede Verificada" },
]

export default function InstallContent() {
  const searchParams  = useSearchParams()
  const screenId      = searchParams.get("screen") || ""
  const code          = searchParams.get("code")?.toUpperCase() || ""
  const [status, setStatus]         = useState<Status>("checking")
  const [activeStep, setActiveStep] = useState(0)
  const [clientName, setClientName] = useState("")

  const playerUrl = screenId
    ? `https://doohplay-demo.onrender.com/player?screen=${screenId}`
    : `https://doohplay-demo.onrender.com/player?screen=YOUR_ID`

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
            let s = 0
            const adv = setInterval(() => {
              s++; setActiveStep(s)
              if (s >= 4) { clearInterval(adv); setStatus("ready") }
            }, 600)
          } else { setStatus("invalid") }
        } else {
          setStatus("found")
          let s = 0
          const adv = setInterval(() => {
            s++; setActiveStep(s)
            if (s >= 4) { clearInterval(adv); setStatus("ready") }
          }, 600)
        }
      } catch { setStatus("pending") }
    }, 800)
    return () => clearTimeout(t)
  }, [code, screenId])

  const statusMap: Record<Status, { color: string; bg: string; label: string; desc: string }> = {
    checking: { color: "#3B82F6", bg: "rgba(59,130,246,0.1)",  label: "Verificando...",       desc: "Validando credenciais" },
    found:    { color: "#10B981", bg: "rgba(16,185,129,0.1)",  label: "Tela encontrada",      desc: `Código ${code} validado` },
    ready:    { color: "#10B981", bg: "rgba(16,185,129,0.1)",  label: "Pronta para ativação", desc: "Todos os sistemas OK" },
    pending:  { color: "#F59E0B", bg: "rgba(245,158,11,0.1)",  label: "Conexão pendente",     desc: "Aguardando screen_id" },
    invalid:  { color: "#EF4444", bg: "rgba(239,68,68,0.1)",   label: "Código inválido",      desc: "Verifique o código" },
  }
  const st = statusMap[status]

  const Check = ({ color = "#fff" }: { color?: string }) => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
  )

  return (
    <main style={{ minHeight: "100vh", background: "#0A0F1E", color: "#fff", fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* NAV */}
      <nav style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 2rem", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0A0F1E", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, background: "linear-gradient(135deg, #3B82F6, #6366F1)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
          </div>
          <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-0.02em" }}>DOOH<span style={{ color: "#3B82F6" }}>PLAY</span></span>
          <span style={{ fontSize: 11, color: "#475569", background: "rgba(255,255,255,0.06)", padding: "2px 8px", borderRadius: 20, marginLeft: 4 }}>Enterprise</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981" }} />
          <span style={{ fontSize: 12, color: "#94A3B8" }}>Sistema operacional</span>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "3rem 1.5rem", display: "grid", gridTemplateColumns: "1fr 420px", gap: "3rem", alignItems: "start" }}>

        {/* LEFT */}
        <div>
          <div style={{ marginBottom: "3rem" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.25)", borderRadius: 20, padding: "4px 12px", fontSize: 12, color: "#3B82F6", marginBottom: 20 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#3B82F6" }} />
              Instalação guiada — TV & Android TV
            </div>
            <h1 style={{ fontSize: 48, fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.03em", margin: "0 0 16px" }}>
              Ative sua Tela no<br />
              <span style={{ color: "#3B82F6" }}>DOOHPLAY</span>
            </h1>
            <p style={{ fontSize: 18, color: "#94A3B8", lineHeight: 1.6, maxWidth: 480, margin: "0 0 2rem" }}>
              Transforme qualquer TV em um canal de mídia digital inteligente.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {BENEFITS.map(b => (
                <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{b.icon}</div>
                  <div>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{b.label}</span>
                    <span style={{ fontSize: 13, color: "#64748B", marginLeft: 8 }}>{b.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ProofChain */}
          <div style={{ background: "#12182B", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: "1.5rem", marginBottom: "1.5rem" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#3B82F6", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 16 }}>ProofChain Security — exclusivo DOOHPLAY</div>
            <div style={{ display: "flex", alignItems: "center" }}>
              {CHAIN.map((c, i) => (
                <div key={c.label} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                  <div style={{ flex: 1, textAlign: "center" }}>
                    <div style={{ background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: 10, padding: "8px 6px", marginBottom: 4 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#3B82F6" }}>{c.label}</div>
                    </div>
                    <div style={{ fontSize: 10, color: "#475569" }}>{c.sub}</div>
                  </div>
                  {i < CHAIN.length - 1 && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}><polyline points="9 18 15 12 9 6"/></svg>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div style={{ background: "#12182B", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: "1.5rem" }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>O que acontece após a ativação?</div>
            {TIMELINE.map((t, i) => (
              <div key={t.label} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                  <div style={{ width: 26, height: 26, borderRadius: "50%", background: `${t.color}18`, border: `1px solid ${t.color}40`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Check color={t.color} />
                  </div>
                  {i < TIMELINE.length - 1 && <div style={{ width: 1, height: 18, background: "rgba(255,255,255,0.06)", margin: "2px 0" }} />}
                </div>
                <div style={{ paddingTop: 3, paddingBottom: i < TIMELINE.length - 1 ? 14 : 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#CBD5E1" }}>{i + 1}. {t.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ position: "sticky", top: "4rem" }}>
          <div style={{ background: "#12182B", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, padding: "1.5rem", marginBottom: "1rem" }}>

            {/* Status */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: st.bg, borderRadius: 12, padding: "12px 14px", marginBottom: "1.5rem" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: st.color, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{st.label}</div>
                <div style={{ fontSize: 12, color: "#94A3B8" }}>{st.desc}</div>
              </div>
              <div style={{ fontSize: 11, color: st.color, background: `${st.color}20`, padding: "3px 10px", borderRadius: 20, border: `1px solid ${st.color}30` }}>
                {status === "ready" ? "Ativo" : status === "checking" ? "..." : status === "found" ? "OK" : status === "pending" ? "Aguardando" : "Erro"}
              </div>
            </div>

            {/* Stepper */}
            <div style={{ display: "flex", alignItems: "center", marginBottom: "1.25rem" }}>
              {STEPS.map((step, i) => (
                <div key={step.id} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? 1 : "none" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0, background: activeStep > i ? "#10B981" : activeStep === i ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.06)", border: `2px solid ${activeStep > i ? "#10B981" : activeStep === i ? "#3B82F6" : "rgba(255,255,255,0.1)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: activeStep >= i ? "#fff" : "#475569", transition: "all 0.3s" }}>
                    {activeStep > i ? <Check /> : step.id}
                  </div>
                  {i < STEPS.length - 1 && <div style={{ flex: 1, height: 1, background: activeStep > i + 1 ? "#10B981" : "rgba(255,255,255,0.08)", margin: "0 4px", transition: "background 0.3s" }} />}
                </div>
              ))}
            </div>

            {/* Step label */}
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "10px 14px", marginBottom: "1.25rem" }}>
              <div style={{ fontSize: 12, color: "#94A3B8" }}>
                {STEPS[Math.min(activeStep, 4)].label} — {STEPS[Math.min(activeStep, 4)].desc}
              </div>
            </div>

            {/* Fields */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: "1.25rem" }}>
              <div style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "10px 12px" }}>
                <div style={{ fontSize: 10, color: "#475569", marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>ID da Tela</div>
                <div style={{ fontSize: 12, color: "#CBD5E1", fontFamily: "monospace" }}>{screenId || "—"}</div>
              </div>
              <div style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "10px 12px" }}>
                <div style={{ fontSize: 10, color: "#475569", marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Código</div>
                <div style={{ fontSize: 12, color: "#CBD5E1", fontFamily: "monospace", fontWeight: 700 }}>{code || "—"}</div>
                {clientName && <div style={{ fontSize: 10, color: "#10B981", marginTop: 2 }}>{clientName}</div>}
              </div>
            </div>

            {/* Device */}
            <div style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)", borderRadius: 14, padding: "1rem", marginBottom: "1.25rem", display: "grid", gridTemplateColumns: "auto 1fr", gap: 12, alignItems: "center" }}>
              <div style={{ width: 48, height: 48, borderRadius: 10, background: "linear-gradient(135deg, #1a1a2e, #16213e)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>📺</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>Fire Stick / Android TV</div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                  <span style={{ color: "#64748B" }}>Conexão</span>
                  <span style={{ color: status === "ready" || status === "found" ? "#10B981" : "#F59E0B", fontWeight: 600 }}>
                    {status === "ready" || status === "found" ? "● Online" : "○ Aguardando"}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginTop: 4 }}>
                  <span style={{ color: "#64748B" }}>Último Check-in</span>
                  <span style={{ color: "#94A3B8" }}>Agora há pouco</span>
                </div>
              </div>
            </div>

            {/* Player URL */}
            {screenId && (
              <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "10px 12px", marginBottom: "1.25rem", fontFamily: "monospace", fontSize: 11, color: "#64748B", wordBreak: "break-all" }}>
                {playerUrl}
              </div>
            )}

            {/* CTA */}
            {status === "ready" ? (
              <a href={playerUrl} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", background: "linear-gradient(135deg, #3B82F6, #6366F1)", color: "#fff", borderRadius: 12, padding: "14px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer", textDecoration: "none", boxSizing: "border-box" }}>
                <span>Abrir Player na TV</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
              </a>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 12, padding: "12px", textAlign: "center" }}>
                  <div style={{ fontSize: 18, marginBottom: 4 }}>▶</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#3B82F6" }}>Deixe o app aberto na TV</div>
                  <div style={{ fontSize: 10, color: "#475569", marginTop: 4, lineHeight: 1.4 }}>Será ativado automaticamente.</div>
                </div>
                <div style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 12, padding: "12px", textAlign: "center" }}>
                  <div style={{ fontSize: 18, marginBottom: 4 }}>⟳</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#6366F1" }}>Aguardando conexão...</div>
                  <div style={{ fontSize: 10, color: "#475569", marginTop: 4, lineHeight: 1.4 }}>Até 60 segundos.</div>
                </div>
              </div>
            )}
          </div>

          {/* Trust badges */}
          <div style={{ background: "#12182B", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "1rem 1.25rem", marginBottom: "1rem" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Segurança & Auditoria</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {TRUST.map(t => (
                <span key={t.label} style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 20, padding: "4px 10px", fontSize: 11, color: "#3B82F6", fontWeight: 500 }}>
                  {t.icon} {t.label}
                </span>
              ))}
            </div>
          </div>

          {/* WhatsApp */}
          <a href="https://wa.me/5511962050987" style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "rgba(37,211,102,0.08)", border: "1px solid rgba(37,211,102,0.2)", borderRadius: 12, textDecoration: "none" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#25D366" }}>Suporte via WhatsApp</div>
              <div style={{ fontSize: 11, color: "#475569" }}>Resposta em minutos</div>
            </div>
          </a>
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "1.5rem 2rem", display: "flex", justifyContent: "space-between", fontSize: 12, color: "#334155" }}>
        <span>DOOHPLAY — Trust Infrastructure for DOOH Advertising</span>
        <span>ICP-Brasil · Blockchain · Enterprise</span>
      </div>
    </main>
  )
}
