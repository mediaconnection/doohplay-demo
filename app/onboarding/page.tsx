"use client"

import { useState } from "react"

const BRAND_BLUE   = "#1B4FD8"
const BRAND_YELLOW = "#F5C300"
const BRAND_DARK   = "#0F2F8A"

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: 197,
    description: "Ideal para começar",
    features: [
      "1 tela ativa",
      "Certificado de veiculação mensal",
      "Portal público de verificação",
      "Relatório mensal via WhatsApp",
      "Score de confiança 100/100",
    ],
    adSpace: "30%",
    highlight: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: 347,
    description: "Mais recursos e visibilidade",
    features: [
      "1 tela ativa",
      "Tudo do Starter",
      "Conteúdo dinâmico (clima + notícias)",
      "Relatório de audiência mensal",
      "10% desconto após 3 meses",
    ],
    adSpace: "40%",
    highlight: true,
  },
  {
    id: "multi",
    name: "Multi",
    price: 547,
    description: "Para quem quer crescer",
    features: [
      "2 telas ativas",
      "Tudo do Pro",
      "Painel do cliente dedicado",
      "20% desconto após 6 meses",
      "Suporte prioritário",
    ],
    adSpace: "50%",
    highlight: false,
  },
]

const BUSINESS_TYPES = [
  "Lanchonete", "Cafeteria", "Restaurante", "Padaria",
  "Barbearia", "Salão de beleza", "Farmácia", "Academia",
  "Clínica", "Pet shop", "Outro",
]

const STEPS = [
  { label: "Estabelecimento", icon: "🏪" },
  { label: "Plano",           icon: "📦" },
  { label: "Contato",         icon: "👤" },
  { label: "Resumo",          icon: "✅" },
]

export default function OnboardingPage() {
  const [step, setStep]       = useState(0)
  const [loading, setLoading] = useState(false)
  const [done, setDone]       = useState(false)
  const [error, setError]     = useState("")

  const [form, setForm] = useState({
    // Step 1
    business_name: "",
    business_type: "",
    address: "",
    city: "",
    // Step 2
    plan: "pro",
    // Step 3
    contact_name: "",
    email: "",
    phone: "",
    // Meta
    how_heard: "",
    terms: false,
  })

  function update(field: string, value: string | boolean) {
    setForm(f => ({ ...f, [field]: value }))
    setError("")
  }

  function validateStep(): boolean {
    if (step === 0) {
      if (!form.business_name.trim()) { setError("Informe o nome do estabelecimento"); return false }
      if (!form.business_type)        { setError("Selecione o tipo do estabelecimento"); return false }
      if (!form.address.trim())       { setError("Informe o endereço"); return false }
      if (!form.city.trim())          { setError("Informe a cidade"); return false }
    }
    if (step === 2) {
      if (!form.contact_name.trim()) { setError("Informe seu nome"); return false }
      if (!form.email.trim() || !form.email.includes("@")) { setError("Informe um email válido"); return false }
      if (!form.phone.trim() || form.phone.length < 10)    { setError("Informe um WhatsApp válido (com DDD)"); return false }
    }
    if (step === 3) {
      if (!form.terms) { setError("Aceite os termos para continuar"); return false }
    }
    return true
  }

  function next() {
    if (!validateStep()) return
    setStep(s => s + 1)
    window.scrollTo(0, 0)
  }

  function back() {
    setStep(s => s - 1)
    setError("")
    window.scrollTo(0, 0)
  }

  async function submit() {
    if (!validateStep()) return
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Erro ao enviar")
      setDone(true)
    } catch (err: any) {
      setError(err.message || "Erro ao enviar. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const selectedPlan = PLANS.find(p => p.id === form.plan)!

  // ── DONE ─────────────────────────────────────────────────────────────────
  if (done) {
    return (
      <main style={{ minHeight: "100vh", background: "#f9fafb", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ maxWidth: 480, width: "100%", textAlign: "center" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111827", marginBottom: 8 }}>Cadastro recebido!</h1>
          <p style={{ fontSize: 15, color: "#6b7280", marginBottom: 32, lineHeight: 1.6 }}>
            Obrigado, <strong>{form.contact_name}</strong>! Nossa equipe vai entrar em contato em até <strong>24 horas</strong> pelo WhatsApp para agendar a instalação.
          </p>
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "1.5rem", marginBottom: 24, textAlign: "left" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: BRAND_BLUE, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Resumo do pedido</div>
            <div style={{ fontSize: 14, color: "#374151", lineHeight: 2 }}>
              <div>🏪 <strong>{form.business_name}</strong></div>
              <div>📦 Plano <strong>{selectedPlan.name}</strong> — R${selectedPlan.price}/mês</div>
              <div>📍 {form.city}</div>
              <div>📱 {form.phone}</div>
            </div>
          </div>
          <p style={{ fontSize: 12, color: "#9ca3af" }}>DOOHPLAY — Trust Infrastructure for DOOH Advertising</p>
        </div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: "100vh", background: "#f9fafb", fontFamily: "system-ui, sans-serif" }}>

      {/* HEADER */}
      <header style={{ background: BRAND_BLUE, padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ background: BRAND_YELLOW, borderRadius: 8, padding: "4px 12px", fontWeight: 800, fontSize: 18, color: BRAND_BLUE, letterSpacing: "-0.02em" }}>
            DOOH<span style={{ color: BRAND_BLUE }}>PLAY</span>
          </div>
        </div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>Cadastro gratuito · Sem cartão</div>
      </header>

      {/* HERO */}
      <div style={{ background: `linear-gradient(135deg, ${BRAND_BLUE} 0%, ${BRAND_DARK} 100%)`, color: "white", padding: "2rem 1.5rem", textAlign: "center" }}>
        <div style={{ fontSize: 12, color: BRAND_YELLOW, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Comece em 5 minutos</div>
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, letterSpacing: "-0.02em" }}>Coloque uma tela no seu estabelecimento</h1>
        <p style={{ fontSize: 13, opacity: 0.8, lineHeight: 1.6 }}>Publicidade verificada na blockchain · Certificado ICP-Brasil · Relatório mensal automático</p>
      </div>

      {/* STEPS */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "1rem 1.5rem" }}>
        <div style={{ maxWidth: 480, margin: "0 auto", display: "flex", justifyContent: "space-between", position: "relative" }}>
          <div style={{ position: "absolute", top: 16, left: "10%", right: "10%", height: 2, background: "#e5e7eb", zIndex: 0 }} />
          {STEPS.map((s, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, position: "relative", zIndex: 1 }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
                background: i < step ? BRAND_BLUE : i === step ? BRAND_YELLOW : "#f3f4f6",
                color: i < step ? "white" : i === step ? BRAND_BLUE : "#9ca3af",
                fontWeight: 700, border: i === step ? `2px solid ${BRAND_BLUE}` : "none",
              }}>
                {i < step ? "✓" : s.icon}
              </div>
              <div style={{ fontSize: 10, color: i === step ? BRAND_BLUE : "#9ca3af", fontWeight: i === step ? 700 : 400, whiteSpace: "nowrap" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FORM */}
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "1.5rem 1.25rem" }}>

        {/* STEP 0 — Estabelecimento */}
        {step === 0 && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#111827", marginBottom: 4 }}>Seu estabelecimento</h2>
            <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 24 }}>Conte um pouco sobre o seu negócio</p>

            <label style={labelStyle}>Nome do estabelecimento *</label>
            <input style={inputStyle} placeholder="Ex: Lanchonete do João" value={form.business_name} onChange={e => update("business_name", e.target.value)} />

            <label style={labelStyle}>Tipo do estabelecimento *</label>
            <select style={inputStyle} value={form.business_type} onChange={e => update("business_type", e.target.value)}>
              <option value="">Selecione...</option>
              {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>

            <label style={labelStyle}>Endereço *</label>
            <input style={inputStyle} placeholder="Rua, número, bairro" value={form.address} onChange={e => update("address", e.target.value)} />

            <label style={labelStyle}>Cidade *</label>
            <input style={inputStyle} placeholder="São Paulo" value={form.city} onChange={e => update("city", e.target.value)} />
          </div>
        )}

        {/* STEP 1 — Plano */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#111827", marginBottom: 4 }}>Escolha seu plano</h2>
            <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 24 }}>Todos incluem instalação gratuita e certificado ICP-Brasil</p>

            {PLANS.map(plan => (
              <div key={plan.id} onClick={() => update("plan", plan.id)} style={{
                border: `2px solid ${form.plan === plan.id ? BRAND_BLUE : "#e5e7eb"}`,
                borderRadius: 12, padding: "1.25rem", marginBottom: 12, cursor: "pointer",
                background: form.plan === plan.id ? "#EFF6FF" : "#fff",
                position: "relative",
              }}>
                {plan.highlight && (
                  <div style={{ position: "absolute", top: -10, right: 16, background: BRAND_YELLOW, color: BRAND_BLUE, fontSize: 10, fontWeight: 800, padding: "2px 10px", borderRadius: 20 }}>
                    MAIS POPULAR
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>{plan.name}</div>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>{plan.description}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: BRAND_BLUE }}>R${plan.price}</div>
                    <div style={{ fontSize: 11, color: "#9ca3af" }}>/mês</div>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 8 }}>📺 {plan.adSpace} da tela para anúncios de terceiros</div>
                {plan.features.map(f => (
                  <div key={f} style={{ fontSize: 12, color: "#374151", padding: "2px 0" }}>✓ {f}</div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* STEP 2 — Contato */}
        {step === 2 && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#111827", marginBottom: 4 }}>Seus dados de contato</h2>
            <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 24 }}>Entraremos em contato em até 24 horas</p>

            <label style={labelStyle}>Seu nome completo *</label>
            <input style={inputStyle} placeholder="João Silva" value={form.contact_name} onChange={e => update("contact_name", e.target.value)} />

            <label style={labelStyle}>Email *</label>
            <input style={inputStyle} type="email" placeholder="joao@email.com" value={form.email} onChange={e => update("email", e.target.value)} />

            <label style={labelStyle}>WhatsApp (com DDD) *</label>
            <input style={inputStyle} type="tel" placeholder="11 99999-9999" value={form.phone} onChange={e => update("phone", e.target.value.replace(/\D/g, ""))} />

            <label style={labelStyle}>Como nos conheceu?</label>
            <select style={inputStyle} value={form.how_heard} onChange={e => update("how_heard", e.target.value)}>
              <option value="">Selecione...</option>
              <option value="indicacao">Indicação de amigo</option>
              <option value="instagram">Instagram</option>
              <option value="google">Google</option>
              <option value="visita">Visita da equipe</option>
              <option value="outro">Outro</option>
            </select>
          </div>
        )}

        {/* STEP 3 — Resumo */}
        {step === 3 && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#111827", marginBottom: 4 }}>Confirme seu pedido</h2>
            <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 24 }}>Revise os dados antes de enviar</p>

            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "1.25rem", marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: BRAND_BLUE, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Estabelecimento</div>
              <div style={{ fontSize: 14, color: "#374151", lineHeight: 2 }}>
                <div>🏪 <strong>{form.business_name}</strong></div>
                <div>🍽 {form.business_type}</div>
                <div>📍 {form.address}, {form.city}</div>
              </div>
            </div>

            <div style={{ background: "#EFF6FF", border: `1px solid ${BRAND_BLUE}`, borderRadius: 12, padding: "1.25rem", marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: BRAND_BLUE, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Plano selecionado</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>{selectedPlan.name}</div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>{selectedPlan.description}</div>
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: BRAND_BLUE }}>R${selectedPlan.price}<span style={{ fontSize: 12, fontWeight: 400, color: "#6b7280" }}>/mês</span></div>
              </div>
            </div>

            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "1.25rem", marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: BRAND_BLUE, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Contato</div>
              <div style={{ fontSize: 14, color: "#374151", lineHeight: 2 }}>
                <div>👤 {form.contact_name}</div>
                <div>📧 {form.email}</div>
                <div>📱 {form.phone}</div>
              </div>
            </div>

            <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 12, padding: "1rem", marginBottom: 16, fontSize: 12, color: "#15803D" }}>
              ✅ Instalação gratuita · Sem fidelidade · Cancele quando quiser
            </div>

            <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", marginBottom: 8 }}>
              <input type="checkbox" checked={form.terms} onChange={e => update("terms", e.target.checked)} style={{ marginTop: 2, width: 16, height: 16, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.5 }}>
                Concordo com os <span style={{ color: BRAND_BLUE }}>termos de serviço</span> e <span style={{ color: BRAND_BLUE }}>política de privacidade</span> do DOOHPLAY.
              </span>
            </label>
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#DC2626" }}>
            ⚠️ {error}
          </div>
        )}

        {/* BUTTONS */}
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          {step > 0 && (
            <button onClick={back} style={{ flex: 1, padding: "14px", borderRadius: 10, border: "1px solid #e5e7eb", background: "#fff", fontSize: 14, fontWeight: 600, color: "#374151", cursor: "pointer" }}>
              ← Voltar
            </button>
          )}
          {step < 3 ? (
            <button onClick={next} style={{ flex: 2, padding: "14px", borderRadius: 10, border: "none", background: BRAND_BLUE, color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              Continuar →
            </button>
          ) : (
            <button onClick={submit} disabled={loading} style={{ flex: 2, padding: "14px", borderRadius: 10, border: "none", background: loading ? "#9ca3af" : BRAND_BLUE, color: "white", fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer" }}>
              {loading ? "Enviando..." : "🚀 Confirmar cadastro"}
            </button>
          )}
        </div>

        {/* TRUST */}
        <div style={{ textAlign: "center", marginTop: 24, padding: "1rem", borderTop: "1px solid #f3f4f6" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap", fontSize: 11, color: "#9ca3af" }}>
            <span>🔐 ICP-Brasil</span>
            <span>⛓ Blockchain</span>
            <span>📋 Certificado mensal</span>
            <span>✅ Score 100/100</span>
          </div>
        </div>
      </div>
    </main>
  )
}

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6, marginTop: 16,
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "12px 14px", borderRadius: 8, border: "1px solid #d1d5db",
  fontSize: 14, color: "#111827", background: "#fff", outline: "none",
  boxSizing: "border-box",
}
