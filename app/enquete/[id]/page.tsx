"use client"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"

export default function EnquetePage() {
  const params = useParams()
  const id = params.id as string
  const [poll, setPoll] = useState<any>(null)
  const [voted, setVoted] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch(`/api/polls/${id}`)
      .then(r => r.json())
      .then(d => setPoll(d))
      .catch(() => setError("Não foi possível carregar a enquete"))
      .finally(() => setLoading(false))
  }, [id])

  const vote = async (optionIndex: number) => {
    setSubmitting(true); setError("")
    try {
      const res = await fetch(`/api/polls/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ option_index: optionIndex }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || "Erro ao votar")
      setVoted(true)
    } catch (err: any) {
      setError(err.message || "Erro ao votar")
    }
    setSubmitting(false)
  }

  const bg = "#05070D"
  const card = "linear-gradient(155deg, rgba(255,255,255,.06), rgba(255,255,255,.02))"

  if (loading) {
    return <div style={{ minHeight: "100vh", background: bg, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>Carregando...</div>
  }
  if (error && !poll) {
    return <div style={{ minHeight: "100vh", background: bg, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", padding: 24, textAlign: "center" }}>{error}</div>
  }
  if (!poll?.active) {
    return <div style={{ minHeight: "100vh", background: bg, display: "flex", alignItems: "center", justifyContent: "center", color: "#9AA3B8", padding: 24, textAlign: "center", fontFamily: "system-ui" }}>Essa enquete não está mais ativa.</div>
  }

  return (
    <div style={{ minHeight: "100vh", background: bg, color: "#F5F7FA", fontFamily: "-apple-system, system-ui, sans-serif", padding: "32px 20px", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".12em", color: "#00D9FF", textTransform: "uppercase", marginBottom: 12, textAlign: "center" }}>
          DOOHPLAY · Enquete
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, textAlign: "center", marginBottom: 28, lineHeight: 1.3 }}>{poll.question}</h1>

        {voted ? (
          <div style={{ textAlign: "center", padding: "32px 16px", background: card, borderRadius: 16, border: "1px solid rgba(255,255,255,.08)" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>Voto registrado, obrigado!</div>
            <div style={{ fontSize: 13, color: "#9AA3B8", marginTop: 6 }}>Olha o resultado na tela.</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {(poll.options as string[]).map((opt, i) => (
              <button key={i} disabled={submitting} onClick={() => vote(i)} style={{
                background: card, border: "1px solid rgba(255,255,255,.1)", borderRadius: 14,
                padding: "18px 20px", fontSize: 16, fontWeight: 600, color: "#F5F7FA",
                textAlign: "left", cursor: "pointer", opacity: submitting ? 0.6 : 1,
              }}>
                {opt}
              </button>
            ))}
          </div>
        )}

        {error && <div style={{ color: "#FB7185", fontSize: 13, marginTop: 16, textAlign: "center" }}>{error}</div>}
      </div>
    </div>
  )
}
