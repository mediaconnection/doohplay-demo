// app/admin/page.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

const BG      = "#0B1020"
const SURFACE = "#111827"
const BORDER  = "#1F2937"
const TEXT     = "#F9FAFB"
const TEXT2    = "#9CA3AF"
const MUTED    = "#4B5563"
const BLUE     = "#3B82F6"
const GREEN    = "#10B981"
const AMBER    = "#F59E0B"
const RED      = "#EF4444"
const PURPLE   = "#8B5CF6"

const fmt = (d?: string | null) => {
  if (!d) return "—"
  try { return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" }).format(new Date(d)) }
  catch { return "—" }
}
const brl = (n: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n ?? 0)

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: color + "22", color, border: "1px solid " + color + "44" }}>
      {label}
    </span>
  )
}

function KpiCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div style={{ background: SURFACE, border: "1px solid " + BORDER, borderRadius: 12, padding: "20px 24px", flex: 1, minWidth: 160 }}>
      <div style={{ fontSize: 11, color: TEXT2, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: color ?? TEXT }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: TEXT2, marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

// ── Preview de mídia ──────────────────────────────────────────────────────────
function MediaPreview({ url, type, name }: { url: string; type: string; name: string }) {
  const [expanded, setExpanded] = useState(false)
  if (!url) return (
    <div style={{ width: 80, height: 60, background: BORDER, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>
      {type === "video" ? "🎬" : "🖼️"}
    </div>
  )
  if (type === "video") {
    return (
      <div style={{ flexShrink: 0 }}>
        {expanded ? (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setExpanded(false)}>
            <div onClick={e => e.stopPropagation()} style={{ maxWidth: 800, width: "90%" }}>
              <video src={url} controls autoPlay style={{ width: "100%", borderRadius: 12, maxHeight: "80vh" }} />
              <button onClick={() => setExpanded(false)} style={{ marginTop: 12, background: SURFACE, color: TEXT2, border: "1px solid " + BORDER, borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 13 }}>Fechar</button>
            </div>
          </div>
        ) : (
          <div onClick={() => setExpanded(true)} style={{ width: 100, height: 70, background: BORDER, borderRadius: 8, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", gap: 4, border: "1px solid " + MUTED }}>
            <span style={{ fontSize: 24 }}>🎬</span>
            <span style={{ fontSize: 9, color: TEXT2 }}>▶ Ver vídeo</span>
          </div>
        )}
      </div>
    )
  }
  return (
    <div style={{ flexShrink: 0 }}>
      {expanded ? (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setExpanded(false)}>
          <div onClick={e => e.stopPropagation()} style={{ maxWidth: 900, width: "90%" }}>
            <img src={url} alt={name} style={{ width: "100%", borderRadius: 12, maxHeight: "85vh", objectFit: "contain" }} />
            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              <button onClick={() => setExpanded(false)} style={{ background: SURFACE, color: TEXT2, border: "1px solid " + BORDER, borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 13 }}>Fechar</button>
              <a href={url} target="_blank" rel="noreferrer" style={{ background: BLUE, color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 13, textDecoration: "none" }}>Abrir original ↗</a>
            </div>
          </div>
        </div>
      ) : (
        <img src={url} alt={name} onClick={() => setExpanded(true)}
          style={{ width: 100, height: 70, objectFit: "cover", borderRadius: 8, cursor: "pointer", border: "1px solid " + MUTED, display: "block" }}
          onError={e => { (e.target as HTMLImageElement).style.display = "none" }}
        />
      )}
    </div>
  )
}

// ── Modal CSV Import ──────────────────────────────────────────────────────────
function ModalCsvImport({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [step, setStep]         = useState<"upload" | "preview" | "result">("upload")
  const [preview, setPreview]   = useState<any[]>([])
  const [results, setResults]   = useState<any[]>([])
  const [summary, setSummary]   = useState<any>(null)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState("")
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const CSV_TEMPLATE = "name,business_type,address,city,phone,email,plan\nBarbearia Silva,Barbearia,Rua X 123,São Paulo,11999998888,silva@email.com,pro\nPadaria Central,Padaria,Av Y 456,Campinas,19988887777,padaria@email.com,starter"

  const downloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: "text/csv" })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement("a"); a.href = url; a.download = "clientes-template.csv"; a.click()
    URL.revokeObjectURL(url)
  }

  const handleFile = async (file: File) => {
    if (!file.name.endsWith(".csv")) { setError("Selecione um arquivo .csv"); return }
    setLoading(true); setError("")
    try {
      const text = await file.text()
      const res  = await fetch("/api/admin/clients/import?" + new URLSearchParams({ data: encodeURIComponent(text) }))
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Erro ao processar CSV")
      setPreview(data.preview)
      setStep("preview")
    } catch (err: any) {
      setError(err.message || "Erro ao processar arquivo")
    }
    setLoading(false)
  }

  const handleImport = async () => {
    setLoading(true); setError("")
    try {
      const res  = await fetch("/api/admin/clients/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: preview }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Erro na importação")
      setResults(data.results)
      setSummary(data.summary)
      setStep("result")
      if (data.summary.ok > 0) onSuccess()
    } catch (err: any) {
      setError(err.message || "Erro na importação")
    }
    setLoading(false)
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: SURFACE, border: "1px solid " + BORDER, borderRadius: 16, width: "100%", maxWidth: step === "preview" ? 800 : 520, maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>

        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid " + BORDER, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: TEXT }}>
              {step === "upload"  && "Importar Clientes via CSV"}
              {step === "preview" && `Preview — ${preview.length} linhas encontradas`}
              {step === "result"  && "Importação concluída"}
            </div>
            <div style={{ fontSize: 12, color: TEXT2, marginTop: 3 }}>
              {step === "upload"  && "Cadastre múltiplos clientes de uma vez"}
              {step === "preview" && `${preview.filter(r => r.valid).length} válidas · ${preview.filter(r => !r.valid).length} com erro`}
              {step === "result"  && `${summary?.ok} importados · ${summary?.error} erros`}
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: TEXT2, fontSize: 20, cursor: "pointer", lineHeight: 1 }}>×</button>
        </div>

        <div style={{ flex: 1, overflow: "auto", padding: "20px 24px" }}>
          {step === "upload" && (
            <div>
              <div style={{ background: BG, border: "1px solid " + BORDER, borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 12, color: TEXT2 }}>
                <div style={{ fontWeight: 600, color: TEXT, marginBottom: 6 }}>Colunas esperadas:</div>
                <code style={{ fontSize: 11, color: BLUE }}>name, business_type, address, city, phone, email, plan</code>
                <div style={{ marginTop: 6, color: MUTED }}>Obrigatórios: <strong style={{ color: TEXT }}>name, city, phone</strong> · Planos: starter, pro, multi</div>
              </div>
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
                onClick={() => fileRef.current?.click()}
                style={{ border: `2px dashed ${dragOver ? BLUE : BORDER}`, borderRadius: 12, padding: "40px 24px", textAlign: "center", cursor: "pointer", background: dragOver ? BLUE + "0A" : BG, transition: "all .2s", marginBottom: 16 }}
              >
                <div style={{ fontSize: 36, marginBottom: 12 }}>📄</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: TEXT, marginBottom: 6 }}>
                  {loading ? "Processando…" : "Clique ou arraste o arquivo CSV"}
                </div>
                <div style={{ fontSize: 12, color: TEXT2 }}>Apenas arquivos .csv</div>
                <input ref={fileRef} type="file" accept=".csv" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
              </div>
              <button onClick={downloadTemplate} style={{ width: "100%", background: "transparent", border: "1px solid " + BORDER, borderRadius: 8, padding: "10px", color: TEXT2, fontSize: 13, cursor: "pointer" }}>
                ↓ Baixar template CSV
              </button>
            </div>
          )}

          {step === "preview" && (
            <div style={{ background: SURFACE, border: "1px solid " + BORDER, borderRadius: 10, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid " + BORDER }}>
                    {["#","Nome","Tipo","Cidade","Telefone","Plano","Status"].map(h => (
                      <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: 11, color: TEXT2, textTransform: "uppercase", letterSpacing: 1, fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, i) => (
                    <tr key={i} style={{ borderBottom: i < preview.length - 1 ? "1px solid " + BORDER : "none", background: row.valid ? "transparent" : RED + "08" }}>
                      <td style={{ padding: "8px 12px", color: TEXT2 }}>{row.line}</td>
                      <td style={{ padding: "8px 12px", color: TEXT, fontWeight: 500 }}>{row.name || "—"}</td>
                      <td style={{ padding: "8px 12px", color: TEXT2 }}>{row.business_type || "—"}</td>
                      <td style={{ padding: "8px 12px", color: TEXT2 }}>{row.city || "—"}</td>
                      <td style={{ padding: "8px 12px", color: TEXT2 }}>{row.phone || "—"}</td>
                      <td style={{ padding: "8px 12px" }}><Badge label={row.plan || "starter"} color={BLUE} /></td>
                      <td style={{ padding: "8px 12px" }}>
                        {row.valid
                          ? <span style={{ color: GREEN, fontSize: 11, fontWeight: 600 }}>✓ OK</span>
                          : <span style={{ color: RED, fontSize: 11 }}>⚠ {row.errors?.join(", ")}</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {step === "result" && (
            <div>
              <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
                <div style={{ flex: 1, background: GREEN + "12", border: "1px solid " + GREEN + "33", borderRadius: 10, padding: "16px", textAlign: "center" }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: GREEN }}>{summary?.ok}</div>
                  <div style={{ fontSize: 12, color: TEXT2, marginTop: 4 }}>Importados</div>
                </div>
                <div style={{ flex: 1, background: RED + "12", border: "1px solid " + RED + "33", borderRadius: 10, padding: "16px", textAlign: "center" }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: RED }}>{summary?.error}</div>
                  <div style={{ fontSize: 12, color: TEXT2, marginTop: 4 }}>Erros</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {results.map((r, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: BG, borderRadius: 8, border: "1px solid " + BORDER }}>
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 500, color: TEXT }}>{r.name}</span>
                      {r.code && <span style={{ fontSize: 11, color: TEXT2, background: BORDER, padding: "1px 6px", borderRadius: 8, marginLeft: 8 }}>{r.code}</span>}
                    </div>
                    {r.status === "ok"
                      ? <span style={{ fontSize: 12, color: GREEN, fontWeight: 600 }}>✓ Criado</span>
                      : <span style={{ fontSize: 11, color: RED }}>✕ {r.error}</span>
                    }
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div style={{ background: RED + "18", border: "1px solid " + RED + "44", borderRadius: 8, padding: "10px 14px", marginTop: 14, fontSize: 13, color: RED }}>
              ⚠️ {error}
            </div>
          )}
        </div>

        <div style={{ padding: "16px 24px", borderTop: "1px solid " + BORDER, display: "flex", gap: 10, flexShrink: 0 }}>
          {step === "upload" && (
            <button onClick={onClose} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "1px solid " + BORDER, background: "transparent", color: TEXT2, fontSize: 13, cursor: "pointer" }}>Cancelar</button>
          )}
          {step === "preview" && (
            <>
              <button onClick={() => setStep("upload")} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "1px solid " + BORDER, background: "transparent", color: TEXT2, fontSize: 13, cursor: "pointer" }}>← Voltar</button>
              <button onClick={handleImport} disabled={loading || preview.filter(r => r.valid).length === 0} style={{ flex: 2, padding: "10px", borderRadius: 8, border: "none", background: loading ? MUTED : GREEN, color: "#fff", fontSize: 13, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer" }}>
                {loading ? "Importando…" : `Importar ${preview.filter(r => r.valid).length} clientes →`}
              </button>
            </>
          )}
          {step === "result" && (
            <button onClick={onClose} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "none", background: BLUE, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Fechar</button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Modal Assinatura ──────────────────────────────────────────────────────────
function ModalAssinatura({ client, onClose, onSuccess }: { client: any; onClose: () => void; onSuccess: () => void }) {
  const [plan, setPlan]       = useState("starter")
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState("")

  const PLANS_INFO: Record<string, { label: string; value: string; desc: string }> = {
    starter:  { label: "Starter",  value: "R$ 97/mês",  desc: "1 TV · Suporte básico" },
    pro:      { label: "Pro",      value: "R$ 197/mês", desc: "1 TV · Relatórios · Prioridade" },
    business: { label: "Business", value: "R$ 397/mês", desc: "Até 3 TVs · Suporte dedicado" },
  }

  const handleCreate = async () => {
    setLoading(true); setError("")
    try {
      const res  = await fetch("/api/admin/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: client.code, plan }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Erro ao criar assinatura")
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message)
    }
    setLoading(false)
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: SURFACE, border: "1px solid " + BORDER, borderRadius: 16, padding: 28, width: "100%", maxWidth: 420 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: TEXT }}>💳 Criar Assinatura</h3>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: TEXT2, fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>

        <div style={{ background: BG, borderRadius: 10, padding: "12px 16px", marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>{client.name}</div>
          <div style={{ fontSize: 12, color: TEXT2, marginTop: 2 }}>{client.code} · {client.email ?? "sem email"}</div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, color: TEXT2, display: "block", marginBottom: 8 }}>Selecione o plano</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {Object.entries(PLANS_INFO).map(([key, info]) => (
              <div key={key} onClick={() => setPlan(key)}
                style={{ background: plan === key ? "#1e3a5f" : BG, border: `1px solid ${plan === key ? BLUE : BORDER}`, borderRadius: 10, padding: "12px 16px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>{info.label}</div>
                  <div style={{ fontSize: 12, color: TEXT2 }}>{info.desc}</div>
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: BLUE }}>{info.value}</div>
              </div>
            ))}
          </div>
        </div>

        {error && <div style={{ fontSize: 13, color: RED, background: RED + "18", borderRadius: 8, padding: "10px 14px", marginBottom: 16 }}>{error}</div>}

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "10px", background: "transparent", border: "1px solid " + BORDER, borderRadius: 8, color: TEXT2, fontSize: 14, cursor: "pointer" }}>
            Cancelar
          </button>
          <button onClick={handleCreate} disabled={loading}
            style={{ flex: 2, padding: "10px", background: BLUE, border: "none", borderRadius: 8, color: "white", fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
            {loading ? "Criando..." : `Criar · ${PLANS_INFO[plan].value}`}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Tab Clientes ──────────────────────────────────────────────────────────────
function TabClientes({ data, onRefresh }: { data: any; onRefresh: () => void }) {
  const [showCsv, setShowCsv] = useState(false)
  const [showSub, setShowSub] = useState<any>(null)
  const [deletingCode, setDeletingCode] = useState<string | null>(null)
  const { clients, subscriptions } = data
  const subMap = Object.fromEntries(subscriptions.map((s: any) => [s.code, s]))

  const handleDelete = async (code: string, name: string) => {
    const typed = prompt(`Isso exclui "${name}" (${code}) e todos os dados relacionados (mídia, playlist, parcerias) pra sempre. Digite o código "${code}" pra confirmar:`)
    if (typed !== code) {
      if (typed !== null) alert("Código não corresponde. Nada foi excluído.")
      return
    }
    setDeletingCode(code)
    try {
      const res = await fetch(`/api/admin/clients/${code}`, { method: "DELETE" })
      if (!res.ok) throw new Error((await res.json()).error ?? "Erro ao excluir")
      onRefresh()
    } catch (err: any) {
      alert("Erro ao excluir: " + err.message)
    }
    setDeletingCode(null)
  }

  return (
    <div>
      {showCsv && <ModalCsvImport onClose={() => setShowCsv(false)} onSuccess={onRefresh} />}
      {showSub && <ModalAssinatura client={showSub} onClose={() => setShowSub(null)} onSuccess={onRefresh} />}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: TEXT }}>
          Clientes <span style={{ fontSize: 13, color: TEXT2, fontWeight: 400 }}>({clients.length})</span>
        </div>
        <button onClick={() => setShowCsv(true)} style={{ display: "flex", alignItems: "center", gap: 6, background: BLUE + "18", border: "1px solid " + BLUE + "44", color: BLUE, borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          📄 Importar CSV
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {clients.map((c: any) => {
          const sub = subMap[c.code]
          const hasActiveSub = sub?.status === "ACTIVE"
          return (
            <div key={c.code} style={{ background: SURFACE, border: "1px solid " + BORDER, borderRadius: 12, padding: "16px 20px", display: "grid", gridTemplateColumns: "1fr auto auto auto auto", alignItems: "center", gap: 20 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, color: TEXT, fontSize: 15 }}>{c.name}</span>
                  <span style={{ fontSize: 11, color: TEXT2, background: BORDER, padding: "1px 7px", borderRadius: 10 }}>{c.code}</span>
                </div>
                <div style={{ fontSize: 12, color: TEXT2 }}>{c.business_type} · {c.address ?? "Sem endereço"}</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 11, color: TEXT2, marginBottom: 4 }}>Player</div>
                <Badge label={c.player_status ?? "offline"} color={c.player_status === "online" ? GREEN : MUTED} />
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 11, color: TEXT2, marginBottom: 4 }}>Plano</div>
                <Badge label={sub?.plan ?? "—"} color={sub ? BLUE : MUTED} />
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 11, color: TEXT2, marginBottom: 4 }}>Assinatura</div>
                <Badge label={sub?.status ?? "sem assinatura"} color={hasActiveSub ? GREEN : AMBER} />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {!hasActiveSub && (
                  <button onClick={() => setShowSub(c)}
                    style={{ fontSize: 12, background: GREEN, border: "none", borderRadius: 6, color: "white", cursor: "pointer", padding: "5px 10px", fontWeight: 600 }}>
                    💳 Assinar
                  </button>
                )}
                <Link href={"/dashboard/local/" + c.code} target="_blank"
                  style={{ fontSize: 12, color: PURPLE, textDecoration: "none", padding: "5px 10px", border: "1px solid " + PURPLE + "44", borderRadius: 6 }}>
                  Dashboard
                </Link>
                <button
                  onClick={() => handleDelete(c.code, c.name)}
                  disabled={deletingCode === c.code}
                  style={{ fontSize: 12, color: RED, background: "transparent", border: "1px solid " + RED + "44", borderRadius: 6, padding: "5px 10px", cursor: deletingCode === c.code ? "not-allowed" : "pointer" }}
                >
                  {deletingCode === c.code ? "Excluindo…" : "🗑 Excluir"}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function TabAssinaturas({ data }: { data: any }) {
  const { subscriptions, clients } = data
  const clientMap = Object.fromEntries(clients.map((c: any) => [c.code, c]))
  const mrr = subscriptions.filter((s: any) => s.status === "ACTIVE").reduce((a: number, s: any) => a + Number(s.value), 0)
  return (
    <div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 28 }}>
        <KpiCard label="MRR"                value={brl(mrr)}                                                                                    color={GREEN}  />
        <KpiCard label="Assinaturas Ativas" value={subscriptions.filter((s: any) => s.status === "ACTIVE").length}                              color={BLUE}   />
        <KpiCard label="ARR Projetado"      value={brl(mrr * 12)}                                                                               color={PURPLE} />
        <KpiCard label="Ticket Médio"       value={brl(subscriptions.length > 0 ? mrr / subscriptions.length : 0)} />
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, color: TEXT, marginBottom: 16 }}>Assinaturas</div>
      <div style={{ background: SURFACE, border: "1px solid " + BORDER, borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid " + BORDER }}>
              {["Cliente","Plano","Valor","Status","Asaas ID","Criado em"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, color: TEXT2, textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((s: any, i: number) => (
              <tr key={s.code} style={{ borderBottom: i < subscriptions.length - 1 ? "1px solid " + BORDER : "none" }}>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ fontWeight: 600, color: TEXT }}>{clientMap[s.code]?.name ?? s.code}</div>
                  <div style={{ fontSize: 11, color: TEXT2 }}>{s.code}</div>
                </td>
                <td style={{ padding: "12px 16px" }}><Badge label={s.plan} color={BLUE} /></td>
                <td style={{ padding: "12px 16px", color: GREEN, fontWeight: 600 }}>{brl(s.value)}</td>
                <td style={{ padding: "12px 16px" }}><Badge label={s.status} color={s.status === "ACTIVE" ? GREEN : AMBER} /></td>
                <td style={{ padding: "12px 16px", fontSize: 11, color: TEXT2, fontFamily: "monospace" }}>{s.asaas_subscription_id ?? "—"}</td>
                <td style={{ padding: "12px 16px", fontSize: 12, color: TEXT2 }}>{fmt(s.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function TabAnunciantes({ data }: { data: any }) {
  const { advertisers, campaigns } = data
  const campByAdv = campaigns.reduce((acc: any, c: any) => { acc[c.advertiserCode] = (acc[c.advertiserCode] ?? 0) + 1; return acc }, {})
  return (
    <div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 28 }}>
        <KpiCard label="Anunciantes"     value={advertisers.length}                                                                          color={BLUE}   />
        <KpiCard label="Campanhas"       value={campaigns.length}                                                                            color={PURPLE} />
        <KpiCard label="Ativas"          value={campaigns.filter((c: any) => c.status === "active").length}                                  color={GREEN}  />
        <KpiCard label="Invest. Total"   value={brl(campaigns.reduce((a: number, c: any) => a + Number(c.budget ?? 0), 0))}                  color={AMBER}  />
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, color: TEXT, marginBottom: 16 }}>Anunciantes</div>
      {advertisers.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", background: SURFACE, borderRadius: 12, border: "1px dashed " + BORDER, color: TEXT2 }}>Nenhum anunciante cadastrado.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {advertisers.map((a: any) => (
            <div key={a.id} style={{ background: SURFACE, border: "1px solid " + BORDER, borderRadius: 12, padding: "16px 20px", display: "grid", gridTemplateColumns: "1fr auto auto auto", alignItems: "center", gap: 20 }}>
              <div>
                <div style={{ fontWeight: 600, color: TEXT, marginBottom: 4 }}>{a.name}</div>
                <div style={{ fontSize: 12, color: TEXT2 }}>{a.email ?? "—"} · {a.phone ?? "—"}</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: PURPLE }}>{campByAdv[a.code] ?? 0}</div>
                <div style={{ fontSize: 11, color: TEXT2 }}>Campanhas</div>
              </div>
              <span style={{ fontSize: 11, color: TEXT2, background: BORDER, padding: "2px 8px", borderRadius: 10 }}>#{a.code}</span>
              <Link href={"/anunciante/" + a.code} target="_blank" style={{ fontSize: 12, color: BLUE, textDecoration: "none", padding: "5px 10px", border: "1px solid " + BLUE + "44", borderRadius: 6 }}>Portal</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function TabAlertas({ data, onRefresh }: { data: any; onRefresh: () => void }) {
  const alerts: any[] = data.duplicateAlerts ?? []
  const pending = alerts.filter(a => !a.resolved)

  const markResolved = async (id: string) => {
    try {
      await fetch("/api/admin/duplicate-alerts/" + id, { method: "PATCH" })
      onRefresh()
    } catch {}
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 28 }}>
        <KpiCard label="A verificar" value={pending.length} color={pending.length > 0 ? AMBER : GREEN} />
        <KpiCard label="Total já detectado" value={alerts.length} color={BLUE} />
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, color: TEXT, marginBottom: 8 }}>Telefones cadastrados como dono de tela E anunciante</div>
      <div style={{ fontSize: 13, color: TEXT2, marginBottom: 16 }}>
        Não é necessariamente um problema — pode ser um dono de tela anunciando de propósito nas telas de outros parceiros. Mas também é o padrão exato de quando alguém usa o portal errado por engano para fazer upload do próprio conteúdo. Vale dar uma olhada e confirmar com a pessoa se tiver dúvida.
      </div>
      {alerts.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", background: SURFACE, borderRadius: 12, border: "1px dashed " + BORDER, color: TEXT2 }}>
          Nenhum cadastro duplicado detectado ainda.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {alerts.map((a: any) => (
            <div key={a.id} style={{ background: SURFACE, border: "1px solid " + (a.resolved ? BORDER : AMBER + "66"), borderRadius: 12, padding: "16px 20px", display: "grid", gridTemplateColumns: "1fr 1fr auto auto", alignItems: "center", gap: 20 }}>
              <div>
                <div style={{ fontSize: 11, color: TEXT2, marginBottom: 4 }}>DONO DE TELA</div>
                <div style={{ fontWeight: 600, color: TEXT }}>{a.studio_client_name ?? "—"}</div>
                <div style={{ fontSize: 12, color: TEXT2 }}>#{a.studio_client_code ?? "—"}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: TEXT2, marginBottom: 4 }}>ANUNCIANTE</div>
                <div style={{ fontWeight: 600, color: TEXT }}>{a.advertiser_name ?? "—"}</div>
                <div style={{ fontSize: 12, color: TEXT2 }}>#{a.advertiser_code ?? "—"}</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 13, color: TEXT2 }}>{a.phone}</div>
                <div style={{ fontSize: 11, color: TEXT2 }}>{new Date(a.detected_at).toLocaleDateString("pt-BR")}</div>
              </div>
              {a.resolved ? (
                <span style={{ fontSize: 11, color: GREEN, background: GREEN + "22", padding: "4px 10px", borderRadius: 10 }}>Resolvido</span>
              ) : (
                <button onClick={() => markResolved(a.id)} style={{ fontSize: 12, color: TEXT, background: "transparent", border: "1px solid " + BORDER, borderRadius: 6, padding: "6px 12px", cursor: "pointer" }}>
                  Marcar resolvido
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function TabEventos({ data }: { data: any }) {
  const { events, blocks } = data
  return (
    <div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 28 }}>
        <KpiCard label="Total de Eventos"  value={events.total?.toLocaleString("pt-BR")}    color={BLUE}   />
        <KpiCard label="Últimas 24h"       value={events.last_24h?.toLocaleString("pt-BR")} color={GREEN}  />
        <KpiCard label="Últimos 7 dias"    value={events.last_7d?.toLocaleString("pt-BR")}  color={PURPLE} />
        <KpiCard label="Blocos Totais"     value={blocks.total?.toLocaleString("pt-BR")}    />
        <KpiCard label="Blocos Ancorados"  value={blocks.anchored?.toLocaleString("pt-BR")} color={AMBER}
          sub={Math.round((blocks.anchored / blocks.total) * 100) + "% do total"} />
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        <Link href="/explorer" target="_blank" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: SURFACE, border: "1px solid " + BORDER, color: TEXT, textDecoration: "none", borderRadius: 8, padding: "10px 18px", fontSize: 13 }}>
          🔍 ProofChain Explorer
        </Link>
      </div>
    </div>
  )
}

function TabRede({ data, onRefresh }: { data: any; onRefresh: () => void }) {
  const [loading, setLoading] = useState<string | null>(null)
  const items = data.networkMedia ?? []
  const pending = items.filter((m: any) => m.status === "pending_review")
  const others  = items.filter((m: any) => m.status !== "pending_review")

  const handle = async (id: string, status: "approved" | "rejected") => {
    setLoading(id)
    try {
      await fetch("/api/admin/network-media/" + id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      onRefresh()
    } catch {}
    setLoading(null)
  }

  return (
    <div>
      <div style={{ fontSize: 18, fontWeight: 700, color: TEXT, marginBottom: 8 }}>
        Mídia do Clube de Telas <span style={{ fontSize: 13, color: TEXT2, fontWeight: 400 }}>({pending.length} pendente{pending.length !== 1 ? "s" : ""})</span>
      </div>
      <div style={{ fontSize: 13, color: TEXT2, marginBottom: 20 }}>
        Ao aprovar, a mídia é distribuída automaticamente para todos os parceiros já aceitos do dono.
      </div>
      {pending.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px", background: SURFACE, borderRadius: 12, border: "1px dashed " + BORDER, color: TEXT2, marginBottom: 24 }}>
          Nenhuma mídia de rede pendente. ✅
        </div>
      )}
      {pending.map((m: any) => (
        <div key={m.id} style={{ background: SURFACE, border: "1px solid " + AMBER + "44", borderRadius: 12, padding: "16px 20px", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
            <MediaPreview url={m.url} type={m.type} name={m.name} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, color: TEXT, marginBottom: 4, fontSize: 14 }}>{m.name}</div>
              <div style={{ fontSize: 12, color: TEXT2, marginBottom: 2 }}>{m.owner_name ?? m.owner_code} · #{m.owner_code}</div>
              <div style={{ fontSize: 11, color: MUTED }}>{m.partner_count ?? 0} parceiro(s) aceito(s) vão receber essa mídia se aprovada</div>
            </div>
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <button onClick={() => handle(m.id, "approved")} disabled={loading === m.id} style={{ background: GREEN + "22", color: GREEN, border: "1px solid " + GREEN + "44", borderRadius: 7, padding: "7px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                {loading === m.id ? "…" : "✓ Aprovar"}
              </button>
              <button onClick={() => handle(m.id, "rejected")} disabled={loading === m.id} style={{ background: RED + "22", color: RED, border: "1px solid " + RED + "44", borderRadius: 7, padding: "7px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                ✕ Rejeitar
              </button>
            </div>
          </div>
        </div>
      ))}
      {others.length > 0 && (
        <>
          <div style={{ fontSize: 13, fontWeight: 600, color: TEXT2, marginBottom: 12, marginTop: 8 }}>Histórico</div>
          <div style={{ background: SURFACE, border: "1px solid " + BORDER, borderRadius: 12, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid " + BORDER }}>
                  {["Mídia","Dono","Tipo","Status","Data"].map(h => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, color: TEXT2, textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {others.map((m: any, i: number) => (
                  <tr key={m.id} style={{ borderBottom: i < others.length - 1 ? "1px solid " + BORDER : "none" }}>
                    <td style={{ padding: "10px 16px", color: TEXT, fontWeight: 500 }}>{m.name}</td>
                    <td style={{ padding: "10px 16px", fontSize: 12, color: TEXT2 }}>{m.owner_name ?? m.owner_code}</td>
                    <td style={{ padding: "10px 16px", fontSize: 12, color: TEXT2 }}>{m.type === "video" ? "🎬 Vídeo" : "🖼️ Imagem"}</td>
                    <td style={{ padding: "10px 16px" }}><Badge label={m.status} color={m.status === "approved" ? GREEN : m.status === "rejected" ? RED : AMBER} /></td>
                    <td style={{ padding: "10px 16px", fontSize: 12, color: TEXT2 }}>{fmt(m.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

function TabMidias({ data, onRefresh }: { data: any; onRefresh: () => void }) {
  const [loading, setLoading]   = useState<string | null>(null)
  const [rejectId, setRejectId] = useState<string | null>(null)
  const [reason, setReason]     = useState("")
  const medias  = data.medias ?? []
  const pending = medias.filter((m: any) => m.status === "pending")
  const others  = medias.filter((m: any) => m.status !== "pending")

  const handle = async (id: string, status: "approved" | "rejected", r?: string) => {
    setLoading(id)
    try {
      await fetch("/api/admin/media/" + id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, reason: r }),
      })
      setRejectId(null); setReason(""); onRefresh()
    } catch {}
    setLoading(null)
  }

  return (
    <div>
      <div style={{ fontSize: 18, fontWeight: 700, color: TEXT, marginBottom: 20 }}>
        Mídias <span style={{ fontSize: 13, color: TEXT2, fontWeight: 400 }}>({pending.length} pendente{pending.length !== 1 ? "s" : ""})</span>
      </div>
      {pending.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px", background: SURFACE, borderRadius: 12, border: "1px dashed " + BORDER, color: TEXT2, marginBottom: 24 }}>
          Nenhuma mídia pendente. ✅
        </div>
      )}
      {pending.map((m: any) => (
        <div key={m.id} style={{ background: SURFACE, border: "1px solid " + AMBER + "44", borderRadius: 12, padding: "16px 20px", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
            <MediaPreview url={m.url} type={m.type} name={m.name} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, color: TEXT, marginBottom: 4, fontSize: 14 }}>{m.name}</div>
              <div style={{ fontSize: 12, color: TEXT2, marginBottom: 2 }}>{m.advertiser_name} · {m.campaign_name}</div>
              <div style={{ fontSize: 11, color: MUTED, marginBottom: 8 }}>{fmt(m.createdAt)} · {m.type === "video" ? "🎬 Vídeo" : "🖼️ Imagem"}</div>
              {m.url && <a href={m.url} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: BLUE, textDecoration: "none" }}>↗ Abrir arquivo original</a>}
            </div>
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <button onClick={() => handle(m.id, "approved")} disabled={loading === m.id} style={{ background: GREEN + "22", color: GREEN, border: "1px solid " + GREEN + "44", borderRadius: 7, padding: "7px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                {loading === m.id ? "…" : "✓ Aprovar"}
              </button>
              <button onClick={() => setRejectId(rejectId === m.id ? null : m.id)} disabled={loading === m.id} style={{ background: RED + "22", color: RED, border: "1px solid " + RED + "44", borderRadius: 7, padding: "7px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                ✕ Rejeitar
              </button>
            </div>
          </div>
          {rejectId === m.id && (
            <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
              <input value={reason} onChange={e => setReason(e.target.value)} placeholder="Motivo da rejeição…" style={{ flex: 1, background: BG, border: "1px solid " + BORDER, borderRadius: 7, padding: "8px 12px", color: TEXT, fontSize: 13, outline: "none" }} />
              <button onClick={() => handle(m.id, "rejected", reason)} style={{ background: RED, color: "#fff", border: "none", borderRadius: 7, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Confirmar</button>
              <button onClick={() => { setRejectId(null); setReason("") }} style={{ background: "transparent", color: TEXT2, border: "1px solid " + BORDER, borderRadius: 7, padding: "8px 12px", fontSize: 13, cursor: "pointer" }}>Cancelar</button>
            </div>
          )}
        </div>
      ))}
      {others.length > 0 && (
        <>
          <div style={{ fontSize: 13, fontWeight: 600, color: TEXT2, marginBottom: 12, marginTop: 8 }}>Histórico</div>
          <div style={{ background: SURFACE, border: "1px solid " + BORDER, borderRadius: 12, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid " + BORDER }}>
                  {["Preview","Mídia","Anunciante","Campanha","Tipo","Status","Data"].map(h => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, color: TEXT2, textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {others.map((m: any, i: number) => (
                  <tr key={m.id} style={{ borderBottom: i < others.length - 1 ? "1px solid " + BORDER : "none" }}>
                    <td style={{ padding: "10px 16px" }}>
                      {m.url ? (
                        m.type === "video"
                          ? <a href={m.url} target="_blank" rel="noreferrer" style={{ fontSize: 20, textDecoration: "none" }}>🎬</a>
                          : <a href={m.url} target="_blank" rel="noreferrer"><img src={m.url} alt={m.name} style={{ width: 48, height: 36, objectFit: "cover", borderRadius: 6, display: "block" }} onError={e => { (e.target as HTMLImageElement).style.display = "none" }} /></a>
                      ) : <span style={{ fontSize: 20 }}>{m.type === "video" ? "🎬" : "🖼️"}</span>}
                    </td>
                    <td style={{ padding: "10px 16px", color: TEXT, fontWeight: 500 }}>{m.name}</td>
                    <td style={{ padding: "10px 16px", fontSize: 12, color: TEXT2 }}>{m.advertiser_name}</td>
                    <td style={{ padding: "10px 16px", fontSize: 12, color: TEXT2 }}>{m.campaign_name}</td>
                    <td style={{ padding: "10px 16px", fontSize: 12, color: TEXT2 }}>{m.type === "video" ? "🎬 Vídeo" : "🖼️ Imagem"}</td>
                    <td style={{ padding: "10px 16px" }}><Badge label={m.status} color={m.status === "approved" ? GREEN : m.status === "rejected" ? RED : AMBER} /></td>
                    <td style={{ padding: "10px 16px", fontSize: 12, color: TEXT2 }}>{fmt(m.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router  = useRouter()
  const [data, setData]       = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [tab, setTab]         = useState("clientes")

  useEffect(() => {
    if (status === "unauthenticated") router.push("/admin/login")
    if (status === "authenticated")  load()
  }, [status])

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/stats")
      if (res.ok) setData(await res.json())
    } catch {}
    setLoading(false)
  }

  if (status === "loading" || loading || !data) return (
    <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", color: TEXT2, fontFamily: "'Inter', system-ui, sans-serif" }}>
      Carregando…
    </div>
  )

  const pendingMedias = data.medias?.filter((m: any) => m.status === "pending").length ?? 0
  const pendingAlerts = data.duplicateAlerts?.filter((a: any) => !a.resolved).length ?? 0
  const pendingNetworkMedia = data.networkMedia?.filter((m: any) => m.status === "pending_review").length ?? 0

  const TABS = [
    { id: "clientes",    label: "Clientes",    icon: "👥", count: data.clients?.length },
    { id: "assinaturas", label: "Assinaturas", icon: "💳", count: data.subscriptions?.length },
    { id: "anunciantes", label: "Anunciantes", icon: "📢", count: data.advertisers?.length },
    { id: "midias",      label: "Mídias",      icon: "🎬", count: pendingMedias, alert: pendingMedias > 0 },
    { id: "rede",        label: "Rede",        icon: "🤝", count: pendingNetworkMedia, alert: pendingNetworkMedia > 0 },
    { id: "alertas",     label: "Alertas",     icon: "🚨", count: pendingAlerts, alert: pendingAlerts > 0 },
    { id: "eventos",     label: "Eventos",     icon: "⚡" },
  ]

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } input::placeholder { color: #4B5563; }`}</style>

      <div style={{ background: SURFACE, borderBottom: "1px solid " + BORDER, padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #3B82F6, #6366F1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
          </div>
          <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-0.02em" }}>
            <span style={{ color: TEXT }}>DOOH</span><span style={{ color: BLUE }}>PLAY</span>
          </span>
          <span style={{ fontSize: 11, color: TEXT2, background: BORDER, padding: "2px 8px", borderRadius: 10, marginLeft: 4 }}>Admin</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 12, color: TEXT2 }}>{session?.user?.email}</span>
          <Link href="/" style={{ fontSize: 12, color: TEXT2, textDecoration: "none" }}>← Site</Link>
          <button onClick={() => signOut({ callbackUrl: "/admin/login" })} style={{ fontSize: 12, color: RED, background: "transparent", border: "1px solid " + RED + "44", borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}>
            Sair
          </button>
        </div>
      </div>

      <div style={{ background: SURFACE, borderBottom: "1px solid " + BORDER, padding: "0 24px", display: "flex", gap: 4 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ background: "transparent", border: "none", cursor: "pointer", padding: "14px 18px", fontSize: 13, fontWeight: tab === t.id ? 600 : 400, color: tab === t.id ? BLUE : TEXT2, borderBottom: "2px solid " + (tab === t.id ? BLUE : "transparent"), display: "flex", alignItems: "center", gap: 6 }}>
            {t.icon} {t.label}
            {t.count !== undefined && (
              <span style={{ fontSize: 11, padding: "1px 6px", borderRadius: 10, background: (t as any).alert ? AMBER + "33" : BORDER, color: (t as any).alert ? AMBER : TEXT2, fontWeight: (t as any).alert ? 700 : 400 }}>{t.count}</span>
            )}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
        {tab === "clientes"    && <TabClientes    data={data} onRefresh={load} />}
        {tab === "assinaturas" && <TabAssinaturas data={data} />}
        {tab === "anunciantes" && <TabAnunciantes data={data} />}
        {tab === "midias"      && <TabMidias      data={data} onRefresh={load} />}
        {tab === "rede"        && <TabRede        data={data} onRefresh={load} />}
        {tab === "alertas"     && <TabAlertas     data={data} onRefresh={load} />}
        {tab === "eventos"     && <TabEventos     data={data} />}
      </div>
    </div>
  )
}
