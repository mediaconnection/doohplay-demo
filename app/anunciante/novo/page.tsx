"use client"

import { useState } from "react"
import Link from "next/link"

const BG      = "#0B1020"
const SURFACE = "#111827"
const BORDER  = "#1F2937"
const TEXT    = "#F9FAFB"
const TEXT2   = "#9CA3AF"
const MUTED   = "#4B5563"
const BLUE    = "#3B82F6"
const GREEN   = "#10B981"
const PURPLE  = "#8B5CF6"
const RED     = "#EF4444"

const inputStyle = {
  width: "100%", boxSizing: "border-box" as const,
  background: "#0B1020", border: `1px solid #1F2937`,
  borderRadius: 8, padding: "11px 14px",
  color: TEXT, fontSize: 14, outline: "none",
}

const SEGMENTS = [
  "Barbearia / Salão",
  "Restaurante / Lanchonete",
  "Padaria / Café",
  "Academia / Studio",
  "Clínica / Consultório",
  "Mercado / Loja",
  "Hotel / Pousada",
  "Escritório / Coworking",
  "Outro",
]

export default function AnuncianteNovo() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState<{ code: string; link: string } | null>(null)

  const [form, setForm] = useState({
    name: "", email: "", phone: "", cnpj: "",
    city: "", segment: "", agree: false,
  })

  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.agree) { setError("Aceite os termos para continuar."); return }
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/advertiser/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? "Erro ao cadastrar."); return }
      setResult(data)
      setStep(4)
    } catch {
      setError("Erro de conexão. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Inter', system-ui, sans-serif", display: "flex", flexDirection: "column" }}>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } input::placeholder, textarea::placeholder { color: #4B5563; } input:focus, select:focus { border-color: #3B82F6 !important; outline: none; } select option { background: #111827; }`}</style>

      {/* Header */}
      <div style={{ background: SURFACE, borderBottom: `1px solid ${BORDER}`, padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ width: 32, height: 32, borderRadius: 7, background: `linear-gradient(135deg,${BLUE},${PURPLE})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#fff" }}>D</div>
          <span style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>DOOHPLAY</span>
        </Link>
        <span style={{ fontSize: 13, color: TEXT2 }}>Cadastro de Anunciante</span>
      </div>

      {/* Conteúdo */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
        <div style={{ width: "100%", maxWidth: 520 }}>

          {/* Steps indicator */}
          {step < 4 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 36 }}>
              {[1, 2, 3].map(n => (
                <div key={n} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 700, fontSize: 14,
                    background: step > n ? GREEN : step === n ? BLUE : SURFACE,
                    color: step >= n ? "#fff" : TEXT2,
                    border: `2px solid ${step > n ? GREEN : step === n ? BLUE : BORDER}`,
                  }}>
                    {step > n ? "✓" : n}
                  </div>
                  {n < 3 && <div style={{ width: 40, height: 2, background: step > n ? GREEN : BORDER }} />}
                </div>
              ))}
            </div>
          )}

          {/* Aviso: confusão entre os dois cadastros já aconteceu de verdade */}
          {step === 1 && (
            <div style={{ background: "#1E293B", border: `1px solid ${BLUE}40`, borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 13, color: TEXT2, lineHeight: 1.5 }}>
              💡 Este cadastro é para quem quer <strong style={{ color: TEXT }}>anunciar nas telas de outros estabelecimentos</strong>.
              {" "}Se você tem um bar, barbearia, loja etc. e quer colocar <strong style={{ color: TEXT }}>a TV do seu próprio negócio</strong> no ar (em vez de anunciar na tela de terceiros), o cadastro certo é o{" "}
              <Link href="/cadastro" style={{ color: BLUE, textDecoration: "underline" }}>cadastro de dono de tela</Link>.
              {" "}(Já tem uma tela com a gente e quer também anunciar nas telas de outros parceiros? Pode seguir aqui mesmo, sem problema.)
            </div>
          )}

          {/* Card */}
          <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "32px" }}>

            {/* Step 1 — Empresa */}
            {step === 1 && (
              <>
                <div style={{ fontSize: 11, color: BLUE, fontWeight: 600, letterSpacing: 2, marginBottom: 8 }}>PASSO 1 DE 3</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: TEXT, marginBottom: 6 }}>Dados da empresa</div>
                <div style={{ fontSize: 13, color: TEXT2, marginBottom: 28 }}>Nos conte sobre o seu negócio.</div>

                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, color: TEXT2, marginBottom: 6 }}>NOME DA EMPRESA *</label>
                    <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Ex: Pizzaria Napoli" style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, color: TEXT2, marginBottom: 6 }}>SEGMENTO *</label>
                    <select value={form.segment} onChange={e => set("segment", e.target.value)} style={{ ...inputStyle, color: form.segment ? TEXT : MUTED }}>
                      <option value="">Selecione o segmento…</option>
                      {SEGMENTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, color: TEXT2, marginBottom: 6 }}>CIDADE *</label>
                    <input value={form.city} onChange={e => set("city", e.target.value)} placeholder="Ex: São Paulo, SP" style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, color: TEXT2, marginBottom: 6 }}>CPF OU CNPJ *</label>
                    <input value={form.cnpj} onChange={e => set("cnpj", e.target.value)} placeholder="00.000.000/0001-00" style={inputStyle} />
                    <div style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>Necessário para gerar cobrança quando você criar uma campanha.</div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (!form.name) { setError("Informe o nome da empresa."); return }
                    if (!form.segment) { setError("Selecione o segmento."); return }
                    if (!form.city) { setError("Informe a cidade."); return }
                    if (!form.cnpj) { setError("Informe o CPF ou CNPJ."); return }
                    setError(""); setStep(2)
                  }}
                  style={{ width: "100%", background: BLUE, color: "#fff", border: "none", borderRadius: 8, padding: "12px", fontSize: 14, fontWeight: 600, cursor: "pointer", marginTop: 24 }}
                >
                  Continuar →
                </button>
              </>
            )}

            {/* Step 2 — Contato */}
            {step === 2 && (
              <>
                <div style={{ fontSize: 11, color: BLUE, fontWeight: 600, letterSpacing: 2, marginBottom: 8 }}>PASSO 2 DE 3</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: TEXT, marginBottom: 6 }}>Dados de contato</div>
                <div style={{ fontSize: 13, color: TEXT2, marginBottom: 28 }}>Enviaremos o acesso pelo WhatsApp.</div>

                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, color: TEXT2, marginBottom: 6 }}>WHATSAPP *</label>
                    <input value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="(11) 99999-9999" style={inputStyle} />
                    <div style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>Seu link de acesso será enviado aqui.</div>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, color: TEXT2, marginBottom: 6 }}>EMAIL *</label>
                    <input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="contato@empresa.com.br" style={inputStyle} />
                    <div style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>Necessário para gerar cobrança quando você criar uma campanha.</div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                  <button onClick={() => { setError(""); setStep(1) }} style={{ flex: 1, background: "transparent", color: TEXT2, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "12px", fontSize: 14, cursor: "pointer" }}>
                    ← Voltar
                  </button>
                  <button
                    onClick={() => {
                      if (!form.phone) { setError("Informe o WhatsApp."); return }
                      if (!form.email) { setError("Informe o email."); return }
                      setError(""); setStep(3)
                    }}
                    style={{ flex: 2, background: BLUE, color: "#fff", border: "none", borderRadius: 8, padding: "12px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
                  >
                    Continuar →
                  </button>
                </div>
              </>
            )}

            {/* Step 3 — Confirmação */}
            {step === 3 && (
              <>
                <div style={{ fontSize: 11, color: BLUE, fontWeight: 600, letterSpacing: 2, marginBottom: 8 }}>PASSO 3 DE 3</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: TEXT, marginBottom: 6 }}>Confirme os dados</div>
                <div style={{ fontSize: 13, color: TEXT2, marginBottom: 24 }}>Revise antes de finalizar.</div>

                <div style={{ background: BG, borderRadius: 10, padding: "16px 20px", marginBottom: 20, display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    { label: "Empresa", value: form.name },
                    { label: "Segmento", value: form.segment || "—" },
                    { label: "Cidade", value: form.city || "—" },
                    { label: "WhatsApp", value: form.phone },
                    { label: "Email", value: form.email || "—" },
                  ].map(row => (
                    <div key={row.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                      <span style={{ color: TEXT2 }}>{row.label}</span>
                      <span style={{ color: TEXT, fontWeight: 500 }}>{row.value}</span>
                    </div>
                  ))}
                </div>

                {/* Termos */}
                <div
                  onClick={() => set("agree", !form.agree)}
                  style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", marginBottom: 20 }}
                >
                  <div style={{
                    width: 18, height: 18, borderRadius: 4, flexShrink: 0, marginTop: 2,
                    border: `2px solid ${form.agree ? GREEN : BORDER}`,
                    background: form.agree ? GREEN : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {form.agree && <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>✓</span>}
                  </div>
                  <span style={{ fontSize: 12, color: TEXT2, lineHeight: 1.5 }}>
                    Concordo com os <span style={{ color: BLUE }}>Termos de Uso</span> e <span style={{ color: BLUE }}>Política de Privacidade</span> do DOOHPLAY. Autorizo o recebimento de comunicações via WhatsApp.
                  </span>
                </div>

                {error && <div style={{ fontSize: 12, color: RED, marginBottom: 12 }}>{error}</div>}

                <div style={{ display: "flex", gap: 12 }}>
                  <button onClick={() => { setError(""); setStep(2) }} style={{ flex: 1, background: "transparent", color: TEXT2, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "12px", fontSize: 14, cursor: "pointer" }}>
                    ← Voltar
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    style={{ flex: 2, background: GREEN, color: "#fff", border: "none", borderRadius: 8, padding: "12px", fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}
                  >
                    {loading ? "Cadastrando…" : "Finalizar cadastro ✓"}
                  </button>
                </div>
              </>
            )}

            {/* Step 4 — Sucesso */}
            {step === 4 && result && (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: TEXT, marginBottom: 8 }}>Cadastro realizado!</div>
                <div style={{ fontSize: 14, color: TEXT2, marginBottom: 24 }}>
                  Enviamos o link de acesso para seu WhatsApp.
                </div>

                <div style={{ background: BG, borderRadius: 10, padding: "16px 20px", marginBottom: 24 }}>
                  <div style={{ fontSize: 11, color: TEXT2, marginBottom: 6 }}>SEU CÓDIGO DE ACESSO</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: BLUE, letterSpacing: 2 }}>{result.code}</div>
                </div>

                <Link
                  href={`/anunciante/${result.code}`}
                  style={{ display: "block", background: BLUE, color: "#fff", textDecoration: "none", borderRadius: 8, padding: "12px", fontSize: 14, fontWeight: 600, marginBottom: 12 }}
                >
                  Acessar meu portal →
                </Link>
                <Link href="/" style={{ fontSize: 13, color: TEXT2, textDecoration: "none" }}>Voltar para o início</Link>
              </div>
            )}

            {error && step < 3 && (
              <div style={{ fontSize: 12, color: RED, marginTop: 12 }}>{error}</div>
            )}
          </div>

          {/* Footer */}
          {step < 4 && (
            <div style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: MUTED }}>
              Já tem uma conta? <Link href="/anunciante/acesso" style={{ color: BLUE, textDecoration: "none" }}>Acesse aqui</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
