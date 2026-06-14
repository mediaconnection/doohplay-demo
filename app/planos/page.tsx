// app/planos/page.tsx
import Link from "next/link"
import DemoModalButton from "@/_components/DemoModalButton"

const BG     = "#080C18"
const SURF   = "#0F1629"
const BORDER = "rgba(255,255,255,0.07)"
const TEXT   = "#F1F5F9"
const TEXT2  = "#94A3B8"
const MUTED  = "#475569"
const BLUE   = "#3B82F6"
const GREEN  = "#10B981"
const PURPLE = "#8B5CF6"
const AMBER  = "#F59E0B"

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: "Grátis",
    period: "para sempre",
    color: GREEN,
    badge: null,
    desc: "Para comércios locais que querem monetizar sua TV.",
    features: [
      "1 tela conectada",
      "Conteúdo automático",
      "Anúncios de marcas nacionais",
      "Dashboard básico",
      "Relatório mensal via WhatsApp",
      "Trust Score auditável",
      "Suporte via WhatsApp",
    ],
    notIncluded: [
      "Múltiplas telas",
      "Campanhas personalizadas",
      "API de integração",
    ],
    cta: "Começar grátis",
    ctaHref: "/onboarding",
    ctaSecondary: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "R$ 197",
    period: "por tela / mês",
    color: BLUE,
    badge: "Mais popular",
    desc: "Para negócios que querem mais controle e receita.",
    features: [
      "Até 5 telas conectadas",
      "Conteúdo personalizado",
      "Campanhas segmentadas",
      "Dashboard completo",
      "Relatórios semanais",
      "Trust Score + Blockchain",
      "Suporte prioritário",
      "Revenue share 70/30",
      "API de integração",
    ],
    notIncluded: [
      "Telas ilimitadas",
      "SLA enterprise",
    ],
    cta: "Assinar Pro",
    ctaHref: "/onboarding?plano=pro",
    ctaSecondary: false,
  },
  {
    id: "multi",
    name: "Multi / Enterprise",
    price: "Sob consulta",
    period: "por rede",
    color: PURPLE,
    badge: "Enterprise",
    desc: "Para redes de lojas, shoppings e agências.",
    features: [
      "Telas ilimitadas",
      "Painel de agência centralizado",
      "Campanhas por região",
      "SLA 99.9% garantido",
      "Relatórios em tempo real",
      "ICP Brasil A3 dedicado",
      "Suporte 24/7",
      "Revenue share customizado",
      "API completa + webhooks",
      "Onboarding dedicado",
    ],
    notIncluded: [],
    cta: "Falar com especialista",
    ctaHref: "/marketplace?demo=1",
    ctaSecondary: true,
  },
]

const FAQ = [
  {
    q: "Como funciona o plano Grátis?",
    a: "Você instala o app DOOHPLAY na sua TV, conecta à internet e começa a receber anúncios automaticamente. A receita é depositada via PIX todo dia 10 do mês.",
  },
  {
    q: "Quanto vou ganhar com minha tela?",
    a: "Depende da localização, fluxo de pessoas e horário de funcionamento. A média da rede é R$ 847/mês por tela. Você pode ver uma estimativa no dashboard após conectar.",
  },
  {
    q: "O que é o Proof-of-Play?",
    a: "É a tecnologia da DOOHPLAY que registra cada exibição na blockchain com certificação ICP Brasil. Anunciantes têm prova auditável de que o anúncio foi exibido — o que aumenta o valor do inventário.",
  },
  {
    q: "Posso cancelar a qualquer momento?",
    a: "Sim. O plano Starter é gratuito e não tem fidelidade. Os planos pagos podem ser cancelados a qualquer momento, sem multa.",
  },
  {
    q: "Que tipo de TV funciona?",
    a: "Fire Stick (Amazon), Android TV, Chromecast, Raspberry Pi e qualquer TV com HDMI. O app funciona em qualquer dispositivo Android com acesso à internet.",
  },
  {
    q: "Como funciona o painel de agência?",
    a: "No plano Multi você tem acesso a um painel centralizado para gerenciar todas as telas da sua rede, com KPIs consolidados, filtros por unidade e relatórios automáticos.",
  },
]

export default function PlanosPage() {
  return (
    <main style={{ minHeight: "100vh", background: BG, color: TEXT, fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* NAV */}
      <nav style={{ background: "rgba(8,12,24,0.95)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${BORDER}`, padding: "0 1.5rem", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <div style={{ width: 28, height: 28, background: "linear-gradient(135deg,#3B82F6,#6366F1)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
          </div>
          <span style={{ fontSize: 15, fontWeight: 800, color: TEXT }}>DOOH<span style={{ color: BLUE }}>PLAY</span></span>
        </Link>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/marketplace" style={{ fontSize: 12, color: TEXT2, textDecoration: "none", padding: "6px 12px", border: `1px solid ${BORDER}`, borderRadius: 8 }}>Marketplace</Link>
          <Link href="/onboarding" style={{ fontSize: 12, color: "#fff", textDecoration: "none", padding: "6px 14px", background: BLUE, borderRadius: 8, fontWeight: 600 }}>Instalar Tela</Link>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "4rem 1.5rem" }}>

        {/* HEADER */}
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.25)", borderRadius: 20, padding: "4px 14px", fontSize: 12, color: BLUE, fontWeight: 500, marginBottom: 16 }}>
            💰 Planos e Preços
          </div>
          <h1 style={{ fontSize: 40, fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 12 }}>
            Simples, transparente,<br />
            <span style={{ color: BLUE }}>sem surpresas.</span>
          </h1>
          <p style={{ fontSize: 16, color: TEXT2, maxWidth: 520, margin: "0 auto" }}>
            Comece grátis com uma tela. Escale conforme seu negócio cresce.
          </p>
        </div>

        {/* PLANOS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: "4rem" }}>
          {PLANS.map(plan => (
            <div key={plan.id} style={{
              background: SURF,
              border: `1px solid ${plan.badge === "Mais popular" ? plan.color + "44" : BORDER}`,
              borderRadius: 20,
              padding: "2rem",
              display: "flex",
              flexDirection: "column",
              position: "relative",
              boxShadow: plan.badge === "Mais popular" ? `0 0 40px ${plan.color}18` : "none",
            }}>
              {plan.badge && (
                <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: plan.color, color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 14px", borderRadius: 20, whiteSpace: "nowrap" }}>
                  {plan.badge}
                </div>
              )}

              <div style={{ marginBottom: "1.5rem" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: plan.color, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>{plan.name}</div>
                <div style={{ fontSize: 36, fontWeight: 900, color: TEXT, letterSpacing: "-0.03em", marginBottom: 4 }}>{plan.price}</div>
                <div style={{ fontSize: 13, color: MUTED }}>{plan.period}</div>
                <div style={{ fontSize: 13, color: TEXT2, marginTop: 12, lineHeight: 1.5 }}>{plan.desc}</div>
              </div>

              <div style={{ flex: 1, marginBottom: "1.5rem" }}>
                {plan.features.map(f => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", fontSize: 13, color: TEXT }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={plan.color} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                    {f}
                  </div>
                ))}
                {plan.notIncluded.map(f => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", fontSize: 13, color: MUTED }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    {f}
                  </div>
                ))}
              </div>

              {plan.ctaSecondary ? (
                <DemoModalButton
                  label={plan.cta + " →"}
                  segment="Enterprise"
                  style={{
                    display: "block", width: "100%", textAlign: "center", padding: "13px",
                    borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer",
                    background: "transparent", color: plan.color,
                    border: `1px solid ${plan.color}`,
                  }}
                />
              ) : (
                <Link href={plan.ctaHref} style={{
                  display: "block", textAlign: "center", padding: "13px",
                  borderRadius: 12, fontSize: 14, fontWeight: 700, textDecoration: "none",
                  background: plan.color, color: "#fff",
                  border: `1px solid ${plan.color}`,
                }}>
                  {plan.cta} →
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* COMPARATIVO */}
        <div style={{ background: SURF, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: "hidden", marginBottom: "4rem" }}>
          <div style={{ padding: "1.5rem", borderBottom: `1px solid ${BORDER}` }}>
            <div style={{ fontSize: 18, fontWeight: 700 }}>Comparativo completo</div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                  <th style={{ padding: "12px 20px", textAlign: "left", fontSize: 12, color: TEXT2, fontWeight: 600 }}>Recurso</th>
                  {PLANS.map(p => (
                    <th key={p.id} style={{ padding: "12px 20px", textAlign: "center", fontSize: 12, color: p.color, fontWeight: 700 }}>{p.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["Telas conectadas",        "1",        "Até 5",    "Ilimitadas"],
                  ["Proof-of-Play",           "✓",        "✓",        "✓"],
                  ["Trust Score",             "✓",        "✓",        "✓"],
                  ["Blockchain auditável",    "✓",        "✓",        "✓"],
                  ["ICP Brasil",              "✓",        "✓",        "✓ dedicado"],
                  ["Dashboard",               "Básico",   "Completo", "Enterprise"],
                  ["Relatórios",              "Mensal",   "Semanal",  "Tempo real"],
                  ["API",                     "—",        "✓",        "✓ + webhooks"],
                  ["Painel de agência",       "—",        "—",        "✓"],
                  ["Revenue share",           "60/40",    "70/30",    "Custom"],
                  ["Suporte",                 "WhatsApp", "Prioritário", "24/7"],
                  ["SLA",                     "—",        "99.5%",    "99.9%"],
                ].map(([feature, ...values], i) => (
                  <tr key={feature} style={{ borderBottom: i < 11 ? `1px solid rgba(255,255,255,0.04)` : "none" }}>
                    <td style={{ padding: "12px 20px", fontSize: 13, color: TEXT2 }}>{feature}</td>
                    {values.map((v, j) => (
                      <td key={j} style={{ padding: "12px 20px", textAlign: "center", fontSize: 13, color: v === "—" ? MUTED : TEXT, fontWeight: v === "✓" ? 600 : 400 }}>{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div style={{ marginBottom: "4rem" }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "2rem", textAlign: "center" }}>Perguntas frequentes</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {FAQ.map((item, i) => (
              <div key={i} style={{ background: SURF, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "1.25rem 1.5rem" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: TEXT, marginBottom: 8 }}>{item.q}</div>
                <div style={{ fontSize: 13, color: TEXT2, lineHeight: 1.6 }}>{item.a}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA FINAL */}
        <div style={{ background: `linear-gradient(135deg, rgba(59,130,246,0.1), rgba(99,102,241,0.1))`, border: `1px solid rgba(59,130,246,0.2)`, borderRadius: 16, padding: "2.5rem", textAlign: "center" }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Pronto para começar?</h2>
          <p style={{ fontSize: 15, color: TEXT2, marginBottom: 24 }}>Instale grátis em menos de 5 minutos. Sem contrato, sem cartão de crédito.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <Link href="/onboarding" style={{ background: BLUE, color: "#fff", borderRadius: 10, padding: "13px 28px", fontSize: 15, fontWeight: 700, textDecoration: "none" }}>
              Instalar uma Tela — Grátis →
            </Link>
            <Link href="/marketplace" style={{ background: "transparent", color: TEXT2, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "13px 28px", fontSize: 15, textDecoration: "none" }}>
              Ver Marketplace
            </Link>
          </div>
        </div>

      </div>

      {/* FOOTER */}
      <footer style={{ borderTop: `1px solid ${BORDER}`, padding: "1.5rem", textAlign: "center", fontSize: 12, color: MUTED }}>
        © 2026 DOOHPLAY · <Link href="/trust-center" style={{ color: MUTED, textDecoration: "none" }}>Trust Center</Link> · <Link href="/privacy" style={{ color: MUTED, textDecoration: "none" }}>Privacidade</Link>
      </footer>
    </main>
  )
}
