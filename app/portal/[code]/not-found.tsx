export default function PortalNotFound() {
  const BG     = "#0B1020"
  const BORDER = "rgba(255,255,255,0.07)"
  const TEXT   = "#F1F5F9"
  const TEXT2  = "#94A3B8"
  const MUTED  = "#4B5563"
  const BLUE   = "#3B82F6"

  return (
    <main style={{ minHeight: "100vh", background: BG, color: TEXT, fontFamily: "'Inter', system-ui, sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ width: 56, height: 56, background: "linear-gradient(135deg, #3B82F6, #6366F1)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.5rem" }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
          <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
        </svg>
      </div>
      <div style={{ fontSize: 11, color: BLUE, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600, marginBottom: 12 }}>DOOHPLAY · Portal do Cliente</div>
      <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 8px", textAlign: "center" }}>Cliente não encontrado</h1>
      <p style={{ fontSize: 13, color: TEXT2, textAlign: "center", maxWidth: 340, lineHeight: 1.7, margin: "0 0 28px" }}>
        O código informado não existe ou o acesso foi desativado. Verifique o link e tente novamente.
      </p>
      <a href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: BLUE, color: "#fff", borderRadius: 10, padding: "10px 22px", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
        ← Voltar ao início
      </a>
      <div style={{ marginTop: "3rem", paddingTop: "1.5rem", borderTop: `1px solid ${BORDER}`, width: "100%", maxWidth: 320, textAlign: "center" }}>
        <div style={{ fontSize: 9, color: MUTED, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          DOOHPLAY — Trust Infrastructure · © 2026
        </div>
      </div>
    </main>
  )
}
