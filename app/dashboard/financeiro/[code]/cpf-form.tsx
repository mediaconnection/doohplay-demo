"use client"
import { useState } from "react"

const C = {
  white:"#FFFFFF", border:"#E5E7EB", border2:"#F3F4F6",
  blue:"#2563EB", blueLt:"#EFF6FF", blueBd:"#BFDBFE",
  green:"#16A34A", greenLt:"#DCFCE7", greenBd:"#86EFAC",
  red:"#DC2626", redLt:"#FEF2F2",
  gray50:"#F9FAFB", gray100:"#F3F4F6", gray400:"#9CA3AF",
  gray500:"#6B7280", gray700:"#374151", gray900:"#111827",
}

function formatDoc(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 14)
  if (d.length <= 11) {
    return d.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, (_, a, b, c, e) =>
      [a, b, c].filter(Boolean).join(".") + (e ? `-${e}` : ""))
  }
  return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})/, (_, a, b, c, e, f) =>
    [a, b, c].filter(Boolean).join(".") + (e ? `/${e}` : "") + (f ? `-${f}` : ""))
}

export default function CpfForm({ code }: { code: string }) {
  const [doc, setDoc]       = useState("")
  const [email, setEmail]   = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ ok?: boolean; error?: string; asaas_id?: string } | null>(null)

  const clean = doc.replace(/\D/g, "")
  const valid = clean.length === 11 || clean.length === 14
  const label = clean.length <= 11 ? "CPF" : "CNPJ"

  async function submit() {
    if (!valid) return
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch("/api/finance/asaas", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, cpf_cnpj: clean, email: email || undefined }),
      })
      const data = await res.json()
      setResult(data)
    } catch { setResult({ error: "Erro de conexão" }) }
    finally { setLoading(false) }
  }

  if (result?.ok) {
    return (
      <div style={{ background: C.greenLt, border: `1px solid ${C.greenBd}`, borderRadius: 12, padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 20 }}>✅</span>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.green }}>Documento cadastrado com sucesso!</div>
          <div style={{ fontSize: 12, color: C.green, opacity: 0.8 }}>ID Asaas: {result.asaas_id} · Agora você pode ativar uma assinatura.</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: "1.25rem 1.5rem" }}>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Cadastrar CPF / CNPJ</div>
      <div style={{ fontSize: 12, color: C.gray500, marginBottom: 16 }}>
        Necessário para emitir cobranças via Asaas. Seus dados são protegidos conforme a LGPD.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: C.gray700, display: "block", marginBottom: 4 }}>
            CPF ou CNPJ *
          </label>
          <input
            type="text"
            placeholder="000.000.000-00 ou 00.000.000/0000-00"
            value={doc}
            onChange={e => setDoc(formatDoc(e.target.value))}
            style={{
              width: "100%", padding: "9px 12px", borderRadius: 8, border: `1px solid ${valid ? C.green : C.border}`,
              fontSize: 14, outline: "none", boxSizing: "border-box", background: valid ? C.greenLt : C.white,
            }}
          />
          {doc && !valid && <div style={{ fontSize: 10, color: C.red, marginTop: 3 }}>CPF (11 dígitos) ou CNPJ (14 dígitos)</div>}
          {valid && <div style={{ fontSize: 10, color: C.green, marginTop: 3 }}>✓ {label} válido</div>}
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: C.gray700, display: "block", marginBottom: 4 }}>
            E-mail (opcional)
          </label>
          <input
            type="email"
            placeholder="contato@empresa.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{
              width: "100%", padding: "9px 12px", borderRadius: 8, border: `1px solid ${C.border}`,
              fontSize: 14, outline: "none", boxSizing: "border-box",
            }}
          />
        </div>
      </div>

      {result?.error && (
        <div style={{ background: C.redLt, border: `1px solid #FECACA`, borderRadius: 8, padding: "8px 12px", marginBottom: 12, fontSize: 12, color: C.red }}>
          ❌ {result.error}
        </div>
      )}

      <button
        onClick={submit}
        disabled={!valid || loading}
        style={{
          background: valid ? C.blue : C.gray100, color: valid ? "#fff" : C.gray400,
          border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 600,
          cursor: valid ? "pointer" : "not-allowed", opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? "Salvando..." : `Salvar ${label}`}
      </button>
    </div>
  )
}
