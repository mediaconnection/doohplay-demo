"use client"

import { useEffect, useState } from "react"

export default function ProofPage() {
  const [result, setResult] = useState<Record<string, unknown> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const parts = window.location.pathname.split("/")
    const hash = parts[parts.length - 1] ?? ""

    if (!hash || !/^[a-f0-9]{64}$/i.test(hash)) {
      setError("Hash inválido.")
      setLoading(false)
      return
    }

    fetch(`/api/verify/${hash}`, { headers: { Accept: "application/json" } })
      .then((r) => r.json())
      .then((data) => setResult(data))
      .catch(() => setError("Erro ao buscar verificação."))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p style={{ padding: 32 }}>Verificando...</p>
  if (error)   return <p style={{ padding: 32, color: "red" }}>{error}</p>

  const r = result ?? {}
  const hash = String(r.hash ?? r.hash_0x ?? "")

  return (
    <main style={{ fontFamily: "monospace", padding: 32, maxWidth: 900 }}>
      <h1 style={{ fontSize: 20, marginBottom: 16 }}>Prova DOOHPLAY</h1>

      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <tbody>
          {(
            [
              ["Status",  String(r.status     ?? "—")],
              ["Score",   String(r.score      ?? "—")],
              ["Trust",   String(r.trust_level ?? r.trust ?? "—")],
              ["Risk",    String(r.risk_level  ?? r.risk  ?? "—")],
              ["Valid",   String(r.valid       ?? "—")],
              ["Hash",    hash || "—"],
            ] as [string, string][]
          ).map(([label, value]) => (
            <tr key={label} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: "6px 12px 6px 0", color: "#555", whiteSpace: "nowrap" }}>
                {label}
              </td>
              <td style={{ padding: "6px 0", wordBreak: "break-all" }}>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <details style={{ marginTop: 24 }}>
        <summary style={{ cursor: "pointer", color: "#555" }}>JSON completo</summary>
        <pre
          style={{
            marginTop: 8,
            fontSize: 12,
            overflowX: "auto",
            background: "#f5f5f5",
            padding: 16,
          }}
        >
          {JSON.stringify(result, null, 2)}
        </pre>
      </details>
    </main>
  )
}
