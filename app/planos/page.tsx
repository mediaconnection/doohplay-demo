import Link from "next/link"

// ─── Colors ───────────────────────────────────────────────────────────────────
const C = {
  bg:      "#F8FAFC",
  white:   "#FFFFFF",
  border:  "#E5E7EB",
  border2: "#F3F4F6",
  blue:    "#2563EB",
  blueLt:  "#EFF6FF",
  blueBd:  "#BFDBFE",
  green:   "#16A34A",
  greenLt: "#DCFCE7",
  greenBd: "#86EFAC",
  purple:  "#7C3AED",
  purpleLt:"#F5F3FF",
  purpleBd:"#DDD6FE",
  gray50:  "#F9FAFB",
  gray100: "#F3F4F6",
  gray200: "#E5E7EB",
  gray300: "#D1D5DB",
  gray400: "#9CA3AF",
  gray500: "#6B7280",
  gray700: "#374151",
  gray900: "#111827",
}

// ─── Plan data ────────────────────────────────────────────────────────────────

const PLANS = [
  {
    id: "local",
    name: "DOOHPLAY Local",
    desc: "Para pequenos negócios",
    price: null,
    priceLabel: "Grátis",
    priceSub: "para começar",
    priceBadge: "Comissão sobre receita de anúncios",
    highlight: false,
    badge: null,
    accentColor: C.green,
    accentLight: C.greenLt,
    accentBorder: C.greenBd,
    btnLabel: "Começar grátis",
    btnStyle: "outline-green",
    linkHref: "/onboarding",
    tagline: "A forma mais simples de monetizar sua TV e exibir promoções da sua loja.",
    features: [
      { label: "1 tela incluída",              available: true },
      { label: "Monetização com anúncios",     available: true },
      { label: "Conteúdo automático gratuito", available: true },
      { label: "Gestão pelo celular",          available: true },
      { label: "Relatórios básicos",           available: true },
      { label: "Suporte por email",            available: true },
      { label: "Pagamento mensal garantido",   available: true },
      { label: "Múltiplas unidades",           available: false },
      { label: "Campanhas personalizadas",     available: false },
      { label: "API & integrações",            available: false },
      { label: "Proof-of-Play blockchain",     available: false },
    ],
  },
  {
    id: "business",
    name: "DOOHPLAY Business",
    desc: "Para redes e franquias",
    price: 299,
    priceLabel: "R$ 299",
    priceSub: "por tela / mês",
    priceBadge: "Mínimo 3 telas · Faturamento anual",
    highlight: true,
    badge: "⭐ Recomendado",
    accentColor: C.blue,
    accentLight: C.blueLt,
    accentBorder: C.blueBd,
    btnLabel: "Ver plano Business",
    btnStyle: "solid-blue",
    linkHref: "/onboarding?plano=business",
    tagline: "Gestão centralizada de múltiplas unidades, campanhas por região e relatórios avançados.",
    features: [
      { label: "Telas ilimitadas por rede",    available: true },
      { label: "Gestão por unidade e região",  available: true },
      { label: "Campanhas personalizadas",     available: true },
      { label: "Mapa de unidades",             available: true },
      { label: "SLA e alertas operacionais",   available: true },
      { label: "Relatórios avançados",         available: true },
      { label: "Calendário de campanhas",      available: true },
      { label: "Suporte prioritário",          available: true },
      { label: "Onboarding dedicado",          available: true },
      { label: "ProofChain blockchain",        available: false },
      { label: "API enterprise",               available: false },
      { label: "Audit certificate",            available: false },
    ],
  },
  {
    id: "enterprise",
    name: "DOOHPLAY Enterprise",
    desc: "Para agências e grandes anunciantes",
    price: null,
    priceLabel: "Sob consulta",
    priceSub: "contrato customizado",
    priceBadge: "SLA garantido · Suporte 24/7",
    highlight: false,
    badge: "Enterprise",
    accentColor: C.purple,
    accentLight: C.purpleLt,
    accentBorder: C.purpleBd,
    btnLabel: "Falar com Enterprise",
    btnStyle: "outline-purple",
    linkHref: "https://wa.me/5511962050987?text=Quero+saber+mais+sobre+o+plano+Enterprise",
    tagline: "Inventário DOOH auditável, ProofChain blockchain, ICP Brasil e API enterprise.",
    features: [
      { label: "Telas e rede ilimitadas",      available: true },
      { label: "ProofChain blockchain",        available: true },
      { label: "ICP Brasil certificado",       available: true },
      { label: "Trust Score em tempo real",    available: true },
      { label: "Proof-of-Play auditável",      available: true },
      { label: "API & webhooks",               available: true },
      { label: "Retail Media Analytics",       available: true },
      { label: "Heatmap de inventário",        available: true },
      { label: "Audit Certificate PDF",        available: true },
      { label: "SLA 99.9% garantido",         available: true },
      { label: "Suporte 24/7 dedicado",       available: true },
      { label: "Integração com DMP/DSP",      available: true },
    ],
  },
]

const FAQS = [
  { q: "Preciso de contrato para começar?",             a: "Não. O plano Local é gratuito, sem contrato e sem taxa de adesão. Você começa em minutos." },
  { q: "Como funciona o pagamento no plano Local?",     a: "Você recebe uma comissão toda vez que um anúncio é exibido na sua TV. O pagamento é feito mensalmente via PIX, direto na sua conta." },
  { q: "Posso trocar de plano depois?",                 a: "Sim, a qualquer momento. Você pode fazer upgrade para Business ou Enterprise sem perder seus dados ou histórico." },
  { q: "O que é o ProofChain?",                         a: "É nossa tecnologia de Proof-of-Play blockchain. Cada exibição é registrada de forma imutável na blockchain, gerando um certificado verificável por qualquer pessoa." },
  { q: "Quais dispositivos são compatíveis?",           a: "Qualquer TV com Android TV, Fire TV Stick ou Chromecast. Também funciona em TVs com entrada HDMI usando um stick Android." },
  { q: "Existe suporte em português?",                  a: "Sim. Nosso suporte é 100% em português, via WhatsApp, email e chat. O plano Enterprise inclui gerente de conta dedicado." },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PlanosPage() {
  function Check({ available }: { available: boolean }) {
    if (available) {
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}>
          <circle cx="12" cy="12" r="10" fill={C.blueLt} stroke={C.blueBd}/>
          <polyline points="8 12 11 15 16 9" stroke={C.blue} strokeWidth="2"/>
        </svg>
      )
    }
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
        <circle cx="12" cy="12" r="10" fill={C.gray100} stroke={C.gray200}/>
        <line x1="9" y1="9" x2="15" y2="15" stroke={C.gray300} strokeWidth="2" strokeLinecap="round"/>
        <line x1="15" y1="9" x2="9" y2="15" stroke={C.gray300} strokeWidth="2" strokeLinecap="round"/>
      </svg>
    )
  }

  return (
    <main style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter', system-ui, sans-serif", color: C.gray900 }}>

      {/* ── NAV ── */}
      <nav style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: "0 1.5rem", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <div style={{ width: 28, height: 28, background: C.blue, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
          </div>
          <span style={{ fontSize: 16, fontWeight: 800, color: C.gray900, letterSpacing: "-0.02em" }}>DOOHPLAY</span>
        </Link>
        <Link href="/onboarding" style={{ background: C.blue, color: C.white, borderRadius: 8, padding: "7px 16px", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
          Entrar
        </Link>
      </nav>

      {/* ── HERO ── */}
      <div style={{ textAlign: "center", padding: "56px 1.5rem 48px", maxWidth: 680, margin: "0 auto" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: C.blueLt, border: `1px solid ${C.blueBd}`, borderRadius: 20, padding: "4px 14px", fontSize: 12, fontWeight: 500, color: C.blue, marginBottom: 20 }}>
          ⭐ Planos e Preços
        </div>
        <h1 style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.15, margin: "0 0 16px", color: C.gray900 }}>
          Escolha o plano ideal para você
        </h1>
        <p style={{ fontSize: 16, color: C.gray500, lineHeight: 1.65, margin: 0 }}>
          Do pequeno comércio à maior rede DOOH do Brasil. Comece grátis, escale quando precisar.
        </p>
      </div>

      {/* ── PLANS GRID ── */}
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 1.5rem 64px", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, alignItems: "start" }}>
        {PLANS.map(plan => (
          <div key={plan.id} style={{
            background: C.white,
            border: `${plan.highlight ? 2 : 1}px solid ${plan.highlight ? C.blue : C.border}`,
            borderRadius: 16,
            overflow: "hidden",
            position: "relative",
            boxShadow: plan.highlight ? "0 8px 32px rgba(37,99,235,0.12)" : "none",
          }}>
            {/* Badge */}
            {plan.badge && (
              <div style={{ position: "absolute", top: -1, left: "50%", transform: "translateX(-50%)" }}>
                <div style={{ background: plan.highlight ? C.blue : plan.accentColor, color: C.white, fontSize: 11, fontWeight: 700, padding: "4px 14px", borderRadius: "0 0 10px 10px", whiteSpace: "nowrap" }}>
                  {plan.badge}
                </div>
              </div>
            )}

            <div style={{ padding: "28px 24px 24px" }}>
              {/* Icon + name */}
              <div style={{ width: 40, height: 40, background: plan.accentLight, border: `1px solid ${plan.accentBorder}`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                {plan.id === "local"      && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={plan.accentColor} strokeWidth="2" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>}
                {plan.id === "business"   && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={plan.accentColor} strokeWidth="2" strokeLinecap="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>}
                {plan.id === "enterprise" && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={plan.accentColor} strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>}
              </div>

              <div style={{ fontSize: 18, fontWeight: 700, color: C.gray900, marginBottom: 4 }}>{plan.name}</div>
              <div style={{ fontSize: 13, color: C.gray500, marginBottom: 20 }}>{plan.desc}</div>

              {/* Price */}
              <div style={{ marginBottom: 8 }}>
                <span style={{ fontSize: plan.price ? 36 : 26, fontWeight: 800, color: C.gray900, letterSpacing: "-0.03em", lineHeight: 1 }}>
                  {plan.priceLabel}
                </span>
                {plan.price && (
                  <span style={{ fontSize: 13, color: C.gray500, marginLeft: 6 }}>{plan.priceSub}</span>
                )}
                {!plan.price && plan.id === "enterprise" && (
                  <span style={{ fontSize: 13, color: C.gray500, marginLeft: 6 }}>{plan.priceSub}</span>
                )}
              </div>
              <div style={{ fontSize: 12, color: C.gray400, marginBottom: 24 }}>{plan.priceBadge}</div>

              {/* Tagline */}
              <p style={{ fontSize: 13, color: C.gray700, lineHeight: 1.65, marginBottom: 24 }}>{plan.tagline}</p>

              {/* Features */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
                {plan.features.map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <Check available={f.available} />
                    <span style={{ fontSize: 13, color: f.available ? C.gray700 : C.gray300, lineHeight: 1.4 }}>{f.label}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <Link href={plan.linkHref} style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: "100%", borderRadius: 10, padding: "12px 0",
                fontSize: 14, fontWeight: 600, textDecoration: "none",
                boxSizing: "border-box",
                ...(plan.btnStyle === "solid-blue"     ? { background: C.blue,    color: C.white, border: "none" } :
                    plan.btnStyle === "outline-green"  ? { background: "none",    color: C.green,  border: `1.5px solid ${C.green}` } :
                    { background: "none", color: C.purple, border: `1.5px solid ${C.purple}` })
              }}>
                {plan.btnLabel}
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* ── DISCLAIMER ── */}
      <div style={{ textAlign: "center", fontSize: 13, color: C.gray400, padding: "0 1.5rem 56px" }}>
        Todas as contas incluem suporte, atualizações automáticas e conformidade com LGPD.
      </div>

      {/* ── COMPARISON TABLE ── */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 1.5rem 80px" }}>
        <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", textAlign: "center", marginBottom: 8 }}>Compare os planos</h2>
        <p style={{ textAlign: "center", color: C.gray500, fontSize: 14, marginBottom: 36 }}>Veja em detalhe o que cada plano oferece.</p>

        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden" }}>
          {/* Header */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", borderBottom: `1px solid ${C.border}` }}>
            <div style={{ padding: "16px 20px", fontSize: 13, fontWeight: 600, color: C.gray500 }}>Recurso</div>
            {PLANS.map(p => (
              <div key={p.id} style={{ padding: "16px 12px", textAlign: "center", borderLeft: `1px solid ${C.border2}`, background: p.highlight ? C.blueLt : "transparent" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: p.highlight ? C.blue : C.gray900 }}>{p.id === "local" ? "Local" : p.id === "business" ? "Business" : "Enterprise"}</div>
                <div style={{ fontSize: 11, color: p.accentColor, fontWeight: 600 }}>{p.id === "local" ? "Grátis" : p.id === "business" ? "R$299/tela" : "Consulte"}</div>
              </div>
            ))}
          </div>

          {/* Rows */}
          {[
            { label: "Telas",                    local: "1",        business: "Ilimitadas", enterprise: "Ilimitadas" },
            { label: "Monetização com anúncios", local: true,       business: true,         enterprise: true },
            { label: "Conteúdo automático",      local: true,       business: true,         enterprise: true },
            { label: "Gestão remota",            local: true,       business: true,         enterprise: true },
            { label: "Relatórios",               local: "Básico",   business: "Avançado",   enterprise: "Enterprise" },
            { label: "Múltiplas unidades",       local: false,      business: true,         enterprise: true },
            { label: "Campanhas por região",     local: false,      business: true,         enterprise: true },
            { label: "SLA garantido",            local: false,      business: "99.5%",      enterprise: "99.9%" },
            { label: "Suporte",                  local: "Email",    business: "Prioritário",enterprise: "24/7 dedicado" },
            { label: "ProofChain blockchain",    local: false,      business: false,        enterprise: true },
            { label: "ICP Brasil certificado",   local: false,      business: false,        enterprise: true },
            { label: "API & webhooks",           local: false,      business: false,        enterprise: true },
            { label: "Audit Certificate PDF",    local: false,      business: false,        enterprise: true },
          ].map((row, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", borderBottom: i < 12 ? `1px solid ${C.border2}` : "none", background: i % 2 === 0 ? C.white : C.gray50 }}>
              <div style={{ padding: "13px 20px", fontSize: 13, color: C.gray700 }}>{row.label}</div>
              {([row.local, row.business, row.enterprise] as any[]).map((val, j) => (
                <div key={j} style={{ padding: "13px 12px", textAlign: "center", borderLeft: `1px solid ${C.border2}`, background: j === 1 && PLANS[1].highlight ? "rgba(239,246,255,0.4)" : "transparent" }}>
                  {val === true  ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2.5" strokeLinecap="round" style={{ margin: "0 auto", display: "block" }}><polyline points="20 6 9 17 4 12"/></svg> :
                   val === false ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.gray300} strokeWidth="2" strokeLinecap="round" style={{ margin: "0 auto", display: "block" }}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> :
                   <span style={{ fontSize: 12, fontWeight: 500, color: C.gray700 }}>{val}</span>}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── FAQ ── */}
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 1.5rem 80px" }}>
        <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", textAlign: "center", marginBottom: 8 }}>Perguntas frequentes</h2>
        <p style={{ textAlign: "center", color: C.gray500, fontSize: 14, marginBottom: 36 }}>Tudo que você precisa saber antes de começar.</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {FAQS.map((faq, i) => (
            <div key={i} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: "18px 20px" }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.gray900, marginBottom: 8 }}>{faq.q}</div>
              <div style={{ fontSize: 13, color: C.gray500, lineHeight: 1.65 }}>{faq.a}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA FINAL ── */}
      <div style={{ background: C.gray900, padding: "64px 1.5rem", textAlign: "center" }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.1)", borderRadius: 20, padding: "4px 14px", fontSize: 12, color: "rgba(255,255,255,0.7)", marginBottom: 20 }}>
            ● 1.333 telas ativas agora
          </div>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: C.white, letterSpacing: "-0.03em", marginBottom: 12 }}>
            Comece a monetizar sua TV hoje.
          </h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", marginBottom: 32, lineHeight: 1.65 }}>
            Grátis para comércios locais. Sem contrato. Sem taxa de adesão. Sem pegadinhas.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/onboarding" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: C.blue, color: C.white, borderRadius: 10, padding: "13px 28px", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
              Instalar uma Tela — Grátis
            </Link>
            <a href="https://wa.me/5511962050987?text=Quero+solicitar+uma+demo+Enterprise" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.08)", color: C.white, border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, padding: "13px 28px", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>
              Solicitar Demo Enterprise
            </a>
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div style={{ background: C.gray900, borderTop: "1px solid rgba(255,255,255,0.06)", padding: "24px 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 24, height: 24, background: C.blue, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.white }}>DOOHPLAY</span>
        </div>
        <div style={{ display: "flex", gap: 20 }}>
          {["99.9% uptime", "ProofChain", "ICP Brasil A3", "LGPD Compliance"].map(tag => (
            <span key={tag} style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>✓ {tag}</span>
          ))}
        </div>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>© 2026 DOOHPLAY. Todos os direitos reservados.</span>
      </div>
    </main>
  )
}
