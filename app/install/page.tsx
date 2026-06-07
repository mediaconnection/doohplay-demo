"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"

type Status = "checking" | "found" | "invalid" | "ready" | "pending"

const STEPS = [
  { id: 1, label: "Conectar TV",        desc: "Dispositivo detectado na rede" },
  { id: 2, label: "Validar Código",     desc: "Código verificado com sucesso" },
  { id: 3, label: "Registrar Tela",     desc: "Registrando sua tela no sistema" },
  { id: 4, label: "Sincronizar Conteúdo", desc: "Aguardando conexão da TV" },
  { id: 5, label: "Tela Ativa",         desc: "Pronta para exibir conteúdo" },
]

const BENEFITS = [
  { icon: "📈", label: "Monetização",           desc: "Gere receita com anúncios e conteúdo estratégico." },
  { icon: "▶️", label: "Conteúdo Automatizado", desc: "Playlists dinâmicas e atualização de conteúdo em tempo real." },
  { icon: "🛡", label: "Proof-of-Play Blockchain", desc: "Todas as exibições são auditadas e registradas na blockchain." },
  { icon: "📡", label: "Gestão Remota",          desc: "Controle total da sua rede de telas de qualquer lugar." },
  { icon: "🔍", label: "Auditoria Enterprise",   desc: "Relatórios, certificados e compliance para grandes anunciantes." },
]

const TRUST = [
  { icon: "🔐", label: "ICP Brasil",   sub: "Certificação Digital" },
  { icon: "🔗", label: "Merkle Proof", sub: "Integridade dos Dados" },
  { icon: "⛓",  label: "Blockchain",  sub: "Registro Imutável" },
  { icon: "⭐", label: "Trust Score",  sub: "Rede Verificada" },
]

export default function InstallV2Page() {
  const searchParams  = useSearchParams()
  const screenId      = searchParams.get("screen") || ""
  const code          = searchParams.get("code")?.toUpperCase() || ""
  const [status, setStatus]         = useState<Status>("checking")
  const [activeStep, setActiveStep] = useState(0)
  const [clientName, setClientName] = useState("")
  const [trustScore]                = useState(98.7)

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

  const Check = ({ done = false, active = false }) => (
    <div style={{
      width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      background: done ? "#10B981" : active ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.06)",
      border: `2px solid ${done ? "#10B981" : active ? "#3B82F6" : "rgba(255,255,255,0.1)"}`,
      transition: "all 0.4s",
    }}>
      {done && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
      {!done && active && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#3B82F6" }} />}
    </div>
  )

  return (
    <main style={{ minHeight: "100vh", background: "#0A0F1E", color: "#fff", fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* NAV */}
      <nav style={{ padding: "0 2.5rem", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 32, height: 32, background: "linear-gradient(135deg, #3B82F6, #6366F1)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </div>
          <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.03em" }}>DOOH<span style={{ color: "#3B82F6" }}>PLAY</span></span>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <a href="https://wa.me/5511962050987" style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "8px 16px", fontSize: 13, color: "#94A3B8", textDecoration: "none" }}>
            <span>?</span> Precisa de ajuda?
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "8px 16px", fontSize: 13, color: "#94A3B8" }}>
            🌐 Português
          </div>
        </div>
      </nav>

      {/* MAIN GRID */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "4rem 2rem", display: "grid", gridTemplateColumns: "1fr 580px", gap: "4rem", alignItems: "start" }}>

        {/* LEFT — Hero */}
        <div>
          <h1 style={{ fontSize: 56, fontWeight: 900, lineHeight: 1.05, letterSpacing: "-0.04em", margin: "0 0 20px" }}>
            Ative sua Tela no<br />
            <span style={{ color: "#3B82F6" }}>DOOHPLAY</span>
          </h1>
          <p style={{ fontSize: 18, color: "#94A3B8", lineHeight: 1.6, maxWidth: 420, margin: "0 0 2.5rem" }}>
            Transforme qualquer TV em um canal de mídia digital inteligente.
          </p>

          {/* Benefits */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: "3rem" }}>
            {BENEFITS.map(b => (
              <div key={b.label} style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                  {b.icon}
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 3 }}>{b.label}</div>
                  <div style={{ fontSize: 13, color: "#64748B", lineHeight: 1.5 }}>{b.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — Activation Card */}
        <div>
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, overflow: "hidden" }}>

            {/* Card Header */}
            <div style={{ padding: "1.5rem 1.75rem", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>Instalação da Tela</div>
                <div style={{ fontSize: 13, color: "#64748B" }}>Siga os passos para conectar sua TV ao DOOHPLAY</div>
              </div>
            </div>

            <div style={{ padding: "1.5rem 1.75rem" }}>

              {/* Status Banner */}
              {(status === "found" || status === "ready") && (
                <div style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 10, padding: "10px 14px", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10B981" }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#10B981" }}>Tela encontrada com sucesso!</span>
                </div>
              )}
              {status === "invalid" && (
                <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "10px 14px", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#EF4444" }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#EF4444" }}>Código inválido — verifique e tente novamente</span>
                </div>
              )}
              {status === "pending" && (
                <div style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 10, padding: "10px 14px", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#F59E0B" }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#F59E0B" }}>Aguardando código de ativação</span>
                </div>
              )}

              {/* Fields */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: "1.5rem" }}>
                <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "12px 14px" }}>
                  <div style={{ fontSize: 11, color: "#475569", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>ID da Tela</div>
                  <div style={{ fontSize: 13, color: "#CBD5E1", fontFamily: "monospace" }}>{screenId || "—"}</div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "12px 14px" }}>
                  <div style={{ fontSize: 11, color: "#475569", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Código de Ativação</div>
                  <div style={{ fontSize: 13, color: "#CBD5E1", fontFamily: "monospace", fontWeight: 700 }}>{code || "—"}</div>
                  {clientName && <div style={{ fontSize: 11, color: "#10B981", marginTop: 2 }}>{clientName}</div>}
                </div>
              </div>

              {/* Steps + Device Card */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: "1.5rem" }}>

                {/* Steps */}
                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {STEPS.map((step, i) => {
                    const done   = i < activeStep
                    const active = i === activeStep
                    return (
                      <div key={step.id} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: "50%", background: done ? "#10B981" : active ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.06)", border: `2px solid ${done ? "#10B981" : active ? "#3B82F6" : "rgba(255,255,255,0.1)"}`, transition: "all 0.4s", flexShrink: 0 }}>
                            {done
                              ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                              : <span style={{ fontSize: 11, fontWeight: 700, color: active ? "#3B82F6" : "#475569" }}>{step.id}</span>
                            }
                          </div>
                          {i < STEPS.length - 1 && <div style={{ width: 2, height: 20, background: done ? "#10B981" : "rgba(255,255,255,0.06)", transition: "background 0.4s" }} />}
                        </div>
                        <div style={{ paddingTop: 4, paddingBottom: i < STEPS.length - 1 ? 16 : 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: done ? "#fff" : active ? "#3B82F6" : "#475569" }}>{step.label}</div>
                          <div style={{ fontSize: 11, color: "#334155" }}>{step.desc}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Device Card */}
                <div style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 16, padding: "1rem" }}>
                  <div style={{ width: "100%", aspectRatio: "16/9", background: "linear-gradient(135deg, #1a1a2e, #16213e)", borderRadius: 10, marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>
                    📺
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 2 }}>Fire Stick / Android TV</div>
                  <div style={{ fontSize: 11, color: "#475569", marginBottom: 10 }}>Navegador Silk</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                      <span style={{ color: "#64748B" }}>Conexão</span>
                      <span style={{ color: status === "ready" || status === "found" ? "#10B981" : "#F59E0B", fontWeight: 600 }}>
                        {status === "ready" || status === "found" ? "● Online" : "○ Aguardando"}
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                      <span style={{ color: "#64748B" }}>Sinal</span>
                      <span style={{ color: "#3B82F6" }}>▐▐▐</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                      <span style={{ color: "#64748B" }}>Último Check-in</span>
                      <span style={{ color: "#94A3B8" }}>Agora há pouco</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Player URL */}
              {screenId && (
                <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "10px 14px", marginBottom: "1rem", fontFamily: "monospace", fontSize: 11, color: "#64748B", wordBreak: "break-all" }}>
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
                  <div style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 12, padding: "14px", textAlign: "center" }}>
                    <div style={{ fontSize: 20, marginBottom: 4 }}>▶</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#3B82F6" }}>Deixe o app aberto na sua TV</div>
                    <div style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>O DOOHPLAY será ativado automaticamente assim que a conexão for confirmada.</div>
                  </div>
                  <div style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 12, padding: "14px", textAlign: "center" }}>
                    <div style={{ fontSize: 20, marginBottom: 4 }}>⟳</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#6366F1" }}>Aguardando conexão da TV...</div>
                    <div style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>Este processo pode levar até 60 segundos.</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* TRUST SECTION */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "2.5rem 2rem" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: "2rem" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: "1.5rem" }}>Segurança e Auditoria de Nível Enterprise</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
              {TRUST.map(t => (
                <div key={t.label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "1rem", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                    {t.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{t.label}</div>
                    <div style={{ fontSize: 11, color: "#475569" }}>{t.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trust Score */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: "1.5rem 2rem", textAlign: "center", minWidth: 200 }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg, #3B82F6, #6366F1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontSize: 28 }}>
              🛡
            </div>
            <div style={{ fontSize: 13, color: "#64748B", marginBottom: 4 }}>Trust Score da Rede</div>
            <div style={{ fontSize: 42, fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1 }}>
              {trustScore}<span style={{ fontSize: 16, color: "#64748B" }}>/100</span>
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#10B981", marginTop: 4 }}>Excelente</div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "1.5rem 2.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 24, height: 24, background: "linear-gradient(135deg, #3B82F6, #6366F1)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </div>
          <span style={{ fontSize: 13, fontWeight: 700 }}>DOOH<span style={{ color: "#3B82F6" }}>PLAY</span></span>
          <span style={{ fontSize: 11, color: "#334155" }}>© 2026 DOOHPLAY · Todos os direitos reservados.</span>
        </div>
        <div style={{ display: "flex", gap: 20, fontSize: 12, color: "#334155" }}>
          <a href="#" style={{ color: "#334155", textDecoration: "none" }}>Política de Privacidade</a>
          <a href="#" style={{ color: "#334155", textDecoration: "none" }}>Termos de Uso</a>
          <a href="https://wa.me/5511962050987" style={{ color: "#334155", textDecoration: "none" }}>Suporte</a>
        </div>
      </div>
    </main>
  )
}
