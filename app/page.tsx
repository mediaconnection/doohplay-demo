"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

const NAV_LINKS = [
  { label: "Instalar Tela", href: "/install" },
  { label: "Planos",        href: "/planos" },
  { label: "Enterprise",    href: "/enterprise" },
  { label: "Trust Center",  href: "/trust-center" },
  { label: "ProofChain",    href: "/proofchain" },
  { label: "Network Center",href: "/noc" },
]

const TAGS = ["Digital Signage", "Retail Media", "Blockchain", "ICP Brasil", "ProofChain", "Trust Score"]

const STATS = [
  { value: "12.847", label: "Telas ativas",         color: "#3B82F6" },
  { value: "84.2M",  label: "Impressões hoje",      color: "#10B981" },
  { value: "R$8.4M", label: "Receita gerada",       color: "#F59E0B" },
  { value: "96.8",   label: "Trust Score",          color: "#10B981" },
  { value: "99.9%",  label: "SLA",                  color: "#3B82F6" },
  { value: "4.8M",   label: "Provas auditadas",     color: "#8B5CF6" },
]

const SEGMENTS = [
  { icon: "🍞", label: "Padarias" },
  { icon: "☕", label: "Cafeterias" },
  { icon: "🍔", label: "Restaurantes" },
  { icon: "💊", label: "Farmácias" },
  { icon: "🏋", label: "Academias" },
  { icon: "🏪", label: "Franquias" },
  { icon: "📢", label: "Agências" },
  { icon: "🛒", label: "Supermercados" },
  { icon: "🏬", label: "Shoppings" },
  { icon: "🏢", label: "Redes Varejistas" },
]

const FEATURES = [
  { icon: "📺", title: "Digital Signage",         desc: "Transforme qualquer TV em uma tela profissional gerenciada remotamente. Conteúdo automático, promoções e anúncios." },
  { icon: "💰", title: "Retail Media",             desc: "Monetize suas telas com anúncios de marcas nacionais. Revenue share automático direto na sua conta." },
  { icon: "🛡",  title: "Proof-of-Play Auditável", desc: "Cada exibição registrada na blockchain com certificação ICP Brasil. Auditável em tempo real." },
  { icon: "🔗", title: "ProofChain",               desc: "Explorer de blockchain próprio. Cada evento tem TX hash, Merkle Root e certificado criptográfico." },
  { icon: "📊", title: "Analytics em tempo real", desc: "Impressões, reach, CPM, Trust Score e SLA monitorados ao vivo. Dashboard por tela, região e campanha." },
  { icon: "🌐", title: "Rede Nacional",            desc: "Telas em todo o Brasil. De São Paulo a Manaus. Inventário verificado e auditável." },
]

const PERSONAS = [
  {
    badge: "Mais popular",
    badgeColor: "#10B981",
    tag: "COMÉRCIO LOCAL",
    title: "Transforme sua TV em uma fonte de renda.",
    stats: [
      { value: "R$847", label: "Receita" },
      { value: "99.2%", label: "TV Online" },
      { value: "3",     label: "Anúncios" },
    ],
    features: ["Monetize sua TV", "Conteúdo automático", "Pagamentos garantidos", "Gestão simples"],
    cta: "Começar Agora",
    ctaColor: "#10B981",
    href: "/onboarding",
  },
  {
    badge: "Recomendado",
    badgeColor: "#3B82F6",
    tag: "REDE DE LOJAS",
    title: "Gerencie todas as telas da sua rede.",
    stats: [
      { value: "24",     label: "Telas" },
      { value: "8",      label: "Unidades" },
      { value: "R$12.4K", label: "Receita" },
    ],
    features: ["Gestão centralizada", "Campanhas por região", "Relatórios", "SLA operacional"],
    cta: "Gerenciar Rede",
    ctaColor: "#3B82F6",
    href: "/enterprise",
  },
  {
    badge: "Enterprise",
    badgeColor: "#8B5CF6",
    tag: "AGÊNCIA / ANUNCIANTE",
    title: "Compre mídia com Proof-of-Play auditável.",
    stats: [
      { value: "4.2M",  label: "Impressões" },
      { value: "98.7%", label: "SLA" },
      { value: "97.3",  label: "Trust" },
    ],
    features: ["Proof-of-Play", "Blockchain", "ICP Brasil", "APIs"],
    cta: "Acessar Enterprise",
    ctaColor: "#8B5CF6",
    href: "/enterprise",
  },
]

const TRUST_BADGES = [
  { label: "ICP Brasil A3",      color: "#10B981" },
  { label: "Ethereum Mainnet",   color: "#3B82F6" },
  { label: "LGPD Compliance",    color: "#F59E0B" },
  { label: "97.3 Trust Score",   color: "#10B981" },
]

export default function LandingPage() {
  const [impressions, setImpressions] = useState(1333)
  const [screens]    = useState(1333)

  useEffect(() => {
    const t = setInterval(() => {
      setImpressions(p => p + Math.floor(Math.random() * 3) + 1)
    }, 1500)
    return () => clearInterval(t)
  }, [])

  return (
    <main style={{ minHeight: "100vh", background: "#080C18", color: "#fff", fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* NAV */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(8,12,24,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 2rem", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 32, height: 32, background: "linear-gradient(135deg, #3B82F6, #6366F1)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
          </div>
          <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.03em" }}>DOOH<span style={{ color: "#3B82F6" }}>PLAY</span></span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {NAV_LINKS.map(link => (
            <Link key={link.label} href={link.href} style={{ padding: "6px 12px", fontSize: 13, color: "#94A3B8", textDecoration: "none", borderRadius: 8, transition: "color 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={e => (e.currentTarget.style.color = "#94A3B8")}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/studio" style={{ padding: "8px 16px", fontSize: 13, color: "#94A3B8", textDecoration: "none", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)" }}>
            Entrar
          </Link>
          <Link href="/onboarding" style={{ padding: "8px 16px", fontSize: 13, color: "#fff", textDecoration: "none", borderRadius: 8, background: "#3B82F6", fontWeight: 600 }}>
            Instalar uma Tela
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "5rem 2rem 3rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center" }}>
        <div>
          {/* Tags */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: "1.5rem" }}>
            {TAGS.map(tag => (
              <span key={tag} style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.25)", borderRadius: 20, padding: "4px 12px", fontSize: 12, color: "#3B82F6", fontWeight: 500 }}>
                ✓ {tag}
              </span>
            ))}
          </div>

          <h1 style={{ fontSize: 52, fontWeight: 900, lineHeight: 1.05, letterSpacing: "-0.04em", margin: "0 0 20px" }}>
            Transforme qualquer TV em uma plataforma de{" "}
            <span style={{ color: "#3B82F6" }}>conteúdo, publicidade e receita.</span>
          </h1>

          <p style={{ fontSize: 18, color: "#94A3B8", lineHeight: 1.6, margin: "0 0 2rem", maxWidth: 500 }}>
            Digital Signage, Retail Media e Proof-of-Play Auditável em uma única plataforma Enterprise.
          </p>

          <div style={{ display: "flex", gap: 12, marginBottom: "2rem" }}>
            <Link href="/onboarding" style={{ display: "flex", alignItems: "center", gap: 8, background: "#3B82F6", color: "#fff", padding: "14px 24px", borderRadius: 12, fontSize: 15, fontWeight: 700, textDecoration: "none" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
              Instalar uma Tela →
            </Link>
            <Link href="/enterprise" style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.06)", color: "#fff", padding: "14px 24px", borderRadius: 12, fontSize: 15, fontWeight: 600, textDecoration: "none", border: "1px solid rgba(255,255,255,0.1)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
              Solicitar Demonstração
            </Link>
          </div>

          <Link href="#video" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#64748B", textDecoration: "none" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            Assistir Vídeo
          </Link>
        </div>

        {/* Hero Dashboard */}
        <div style={{ position: "relative" }}>
          <div style={{ background: "#0F1629", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "1.25rem", boxShadow: "0 25px 60px rgba(0,0,0,0.5)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <div style={{ display: "flex", gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#EF4444" }} />
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#F59E0B" }} />
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#10B981" }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#10B981" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981" }} /> LIVE · NOC
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: "1rem" }}>
              {[
                { value: "12.847", label: "Telas", color: "#3B82F6" },
                { value: "84.2M",  label: "Impressões", color: "#10B981" },
                { value: "97.3",   label: "Trust", color: "#10B981" },
              ].map(s => (
                <div key={s.label} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "10px 12px" }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: "#64748B" }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ fontSize: 11, color: "#64748B", marginBottom: 8 }}>Receita Mensal (R$ M)</div>
            <div style={{ height: 60, background: "rgba(59,130,246,0.05)", borderRadius: 8, overflow: "hidden", position: "relative", marginBottom: "1rem" }}>
              <svg width="100%" height="100%" viewBox="0 0 300 60" preserveAspectRatio="none">
                <polyline points="0,50 50,40 100,35 150,28 200,20 250,15 300,8" fill="none" stroke="#3B82F6" strokeWidth="2"/>
                <polygon points="0,50 50,40 100,35 150,28 200,20 250,15 300,8 300,60 0,60" fill="rgba(59,130,246,0.1)"/>
              </svg>
            </div>

            <div style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 10, padding: "10px 12px", display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10B981" }} />
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#10B981" }}>ProofChain</div>
                <div style={{ fontSize: 10, color: "#64748B" }}>0x7f2a...c4e1 · Verificado · Bloco #18.2M</div>
              </div>
            </div>
          </div>

          {/* Floating card */}
          <div style={{ position: "absolute", top: -20, right: -20, background: "#12182B", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "12px 16px", boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>
            <div style={{ fontSize: 11, color: "#64748B", marginBottom: 4 }}>Retail Media</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#10B981" }}>R$8.4M</div>
            <div style={{ fontSize: 11, color: "#10B981" }}>+23% esse mês</div>
          </div>
        </div>
      </section>

      {/* LIVE NETWORK STATUS */}
      <section style={{ maxWidth: 760, margin: "0 auto", padding: "0 2rem 4rem" }}>
        <div style={{ background: "#0F1629", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 16, padding: "1.25rem 1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, color: "#10B981", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981" }} />
            LIVE NETWORK STATUS
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 36, fontWeight: 900, letterSpacing: "-0.03em" }}>{screens.toLocaleString("pt-BR")}</div>
              <div style={{ fontSize: 13, color: "#64748B" }}>telas online agora</div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#3B82F6" }}>
              +{impressions - screens}
              <div style={{ fontSize: 13, color: "#64748B", fontWeight: 400 }}>exibições verificadas / 30s</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 16, fontSize: 12 }}>
            <span style={{ color: "#10B981" }}>● Blockchain Sync</span>
            <span style={{ color: "#3B82F6" }}>● ICP Brasil Ativo</span>
            <span style={{ color: "#F59E0B" }}>● Trust 97.3</span>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ background: "#0A0F1E", borderTop: "1px solid rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.04)", padding: "3rem 2rem" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 0 }}>
          {STATS.map((s, i) => (
            <div key={s.label} style={{ textAlign: "center", padding: "1rem", borderRight: i < STATS.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: s.color, letterSpacing: "-0.02em" }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* QUEM USA */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "5rem 2rem" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 12px" }}>Quem usa o DOOHPLAY?</h2>
          <p style={{ fontSize: 16, color: "#64748B" }}>Da padaria ao shopping center — uma plataforma para todos os tamanhos.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
          {SEGMENTS.map(s => (
            <div key={s.label} style={{ background: "#0F1629", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "1.25rem", textAlign: "center", cursor: "pointer", transition: "border-color 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(59,130,246,0.4)")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)")}
            >
              <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#CBD5E1" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ background: "#0A0F1E", padding: "5rem 2rem" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 12px" }}>Tecnologia de ponta. Simplicidade na prática.</h2>
            <p style={{ fontSize: 16, color: "#64748B" }}>Do pequeno comércio à agência global — tudo em uma plataforma.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {FEATURES.map(f => (
              <div key={f.title} style={{ background: "#0F1629", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "1.5rem", transition: "border-color 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(59,130,246,0.3)")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)")}
              >
                <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{f.title}</div>
                <div style={{ fontSize: 14, color: "#64748B", lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PERSONAS */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "5rem 2rem" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 12px" }}>Como você pretende utilizar o DOOHPLAY?</h2>
          <p style={{ fontSize: 16, color: "#64748B" }}>Escolha a experiência ideal para seu negócio.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {PERSONAS.map(p => (
            <div key={p.tag} style={{ background: "#0F1629", border: `1px solid rgba(255,255,255,0.08)`, borderRadius: 20, padding: "1.5rem", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                <span style={{ background: p.badgeColor, color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>{p.badge}</span>
                <span style={{ fontSize: 11, color: p.badgeColor, fontWeight: 600 }}>● {p.tag}</span>
              </div>

              {/* Mini dashboard */}
              <div style={{ background: "#080C18", borderRadius: 12, padding: "1rem", marginBottom: "1rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 10 }}>
                  {p.stats.map(s => (
                    <div key={s.label} style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: p.badgeColor }}>{s.value}</div>
                      <div style={{ fontSize: 10, color: "#64748B" }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: "70%", background: p.badgeColor, borderRadius: 2 }} />
                </div>
              </div>

              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: "1rem", lineHeight: 1.3 }}>{p.title}</div>

              <div style={{ flex: 1, marginBottom: "1.5rem" }}>
                {p.features.map(f => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", fontSize: 13, color: "#CBD5E1" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={p.badgeColor} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                    {f}
                  </div>
                ))}
              </div>

              <Link href={p.href} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: p.badgeColor, color: "#fff", padding: "13px", borderRadius: 12, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
                {p.cta} →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* PROOFCHAIN BANNER */}
      <section style={{ background: "#080C18", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "1.25rem 2rem" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Proof-of-Play Auditável com ICP Brasil & Blockchain</div>
            <div style={{ fontSize: 13, color: "#64748B" }}>Cada exibição registrada de forma imutável. Trust Score em tempo real. LGPD compliance.</div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {TRUST_BADGES.map(b => (
              <span key={b.label} style={{ background: `${b.color}15`, border: `1px solid ${b.color}40`, borderRadius: 20, padding: "6px 14px", fontSize: 12, color: b.color, fontWeight: 600, whiteSpace: "nowrap" }}>
                ✓ {b.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ padding: "6rem 2rem", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.25)", borderRadius: 20, padding: "6px 14px", fontSize: 12, color: "#3B82F6", marginBottom: "1.5rem" }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981" }} />
          {screens.toLocaleString("pt-BR")} telas ativas agora
        </div>
        <h2 style={{ fontSize: 48, fontWeight: 900, letterSpacing: "-0.04em", margin: "0 0 16px" }}>
          Comece a monetizar sua TV hoje.
        </h2>
        <p style={{ fontSize: 18, color: "#64748B", margin: "0 0 2rem" }}>
          Grátis para comércios locais. Sem contrato. Sem taxa de adesão.
        </p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center" }}>
          <Link href="/onboarding" style={{ display: "flex", alignItems: "center", gap: 8, background: "#3B82F6", color: "#fff", padding: "16px 32px", borderRadius: 14, fontSize: 16, fontWeight: 700, textDecoration: "none" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            Instalar uma Tela — Grátis →
          </Link>
          <Link href="/enterprise" style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.06)", color: "#fff", padding: "16px 32px", borderRadius: 14, fontSize: 16, fontWeight: 600, textDecoration: "none", border: "1px solid rgba(255,255,255,0.1)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
            Solicitar Demo Enterprise
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#080C18", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "3rem 2rem 2rem" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "2rem", marginBottom: "2rem" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <div style={{ width: 28, height: 28, background: "linear-gradient(135deg, #3B82F6, #6366F1)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                </div>
                <span style={{ fontSize: 16, fontWeight: 800 }}>DOOH<span style={{ color: "#3B82F6" }}>PLAY</span></span>
              </div>
              <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.6, maxWidth: 280 }}>
                Digital Signage, Retail Media e Proof-of-Play Auditável em uma única plataforma Enterprise.
              </p>
            </div>
            {[
              { title: "PLATAFORMA", links: ["Instalar Tela", "Planos", "Enterprise", "Studio"] },
              { title: "SEGURANÇA",  links: ["ProofChain", "ICP Brasil", "Blockchain", "LGPD"] },
              { title: "CERTIFICAÇÕES", links: ["Trust Center", "Audit Center", "Network Center", "Suporte"] },
            ].map(col => (
              <div key={col.title}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>{col.title}</div>
                {col.links.map(link => (
                  <div key={link} style={{ fontSize: 13, color: "#64748B", marginBottom: 8, cursor: "pointer" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                    onMouseLeave={e => (e.currentTarget.style.color = "#64748B")}
                  >{link}</div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "1.5rem", display: "flex", justifyContent: "space-between", fontSize: 12, color: "#334155" }}>
            <span>© 2026 DOOHPLAY. Todos os direitos reservados.</span>
            <div style={{ display: "flex", gap: 16 }}>
              <span style={{ color: "#10B981" }}>↑ 99.9% uptime</span>
              <span>LGPD Compliance</span>
              <span>ICP Brasil</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
