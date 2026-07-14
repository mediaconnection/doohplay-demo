"use client"

import { useState, useEffect, useRef } from "react"

const BG      = "#0B1020"
const SURFACE = "#111827"
const SURFACE2 = "#1a2235"
const BORDER  = "#1F2937"
const TEXT     = "#F9FAFB"
const TEXT2    = "#9CA3AF"
const MUTED    = "#4B5563"
const BLUE     = "#3B82F6"
const GREEN    = "#10B981"
const AMBER    = "#F59E0B"
const RED      = "#EF4444"
const PURPLE   = "#8B5CF6"
const INDIGO   = "#6366F1"

const STAGES = [
  { id: "contato",  label: "Contato feito",    color: BLUE,   icon: "📞", desc: "Primeiro contato realizado" },
  { id: "visita",   label: "Visita agendada",  color: PURPLE, icon: "📅", desc: "Visita ou reunião marcada" },
  { id: "proposta", label: "Proposta enviada", color: AMBER,  icon: "📄", desc: "Proposta comercial enviada" },
  { id: "instalado",label: "Instalado",        color: INDIGO, icon: "📺", desc: "TV instalada e funcionando" },
  { id: "anunciando",label: "Anunciando",      color: GREEN,  icon: "💰", desc: "Primeiro anunciante ativo" },
]

const BUSINESS_TYPES = ["Barbearia", "Salão", "Farmácia", "Lanchonete", "Restaurante", "Academia", "Clínica", "Condomínio", "Outro"]

type Lead = {
  id: string
  name: string
  business_type: string
  city: string
  phone: string
  contact_name: string
  stage: string
  notes: string
  last_contact: string
  created_at: string
}

function newLead(): Lead {
  return {
    id: Math.random().toString(36).slice(2),
    name: "",
    business_type: "Barbearia",
    city: "São Paulo",
    phone: "",
    contact_name: "",
    stage: "contato",
    notes: "",
    last_contact: new Date().toISOString().slice(0, 10),
    created_at: new Date().toISOString(),
  }
}

function daysSince(date: string) {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 86400000)
  if (diff === 0) return "hoje"
  if (diff === 1) return "ontem"
  return `${diff}d atrás`
}

function LeadCard({ lead, onMove, onEdit, onDelete }: {
  lead: Lead
  onMove: (id: string, stage: string) => void
  onEdit: (lead: Lead) => void
  onDelete: (id: string) => void
}) {
  const stage = STAGES.find(s => s.id === lead.stage)!
  const stageIdx = STAGES.findIndex(s => s.id === lead.stage)
  const [menu, setMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menu) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenu(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [menu])

  const whatsapp = lead.phone.replace(/\D/g, "")

  return (
    <div style={{
      background: SURFACE2,
      border: `1px solid ${BORDER}`,
      borderLeft: `3px solid ${stage.color}`,
      borderRadius: 10,
      padding: "12px 14px",
      marginBottom: 8,
      cursor: "grab",
      position: "relative",
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: TEXT, marginBottom: 2 }}>{lead.name}</div>
          <div style={{ fontSize: 11, color: TEXT2 }}>
            <span style={{ background: BORDER, padding: "1px 6px", borderRadius: 8, marginRight: 6 }}>{lead.business_type}</span>
            {lead.city}
          </div>
        </div>
        <div style={{ position: "relative" }} ref={menuRef}>
          <button onClick={() => setMenu(!menu)} style={{ background: "transparent", border: "none", color: TEXT2, cursor: "pointer", fontSize: 16, padding: "0 4px", lineHeight: 1 }}>⋮</button>
          {menu && (
            <div style={{ position: "absolute", right: 0, top: 24, background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 8, zIndex: 100, minWidth: 140, boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>
              <button onClick={() => { onEdit(lead); setMenu(false) }} style={{ display: "block", width: "100%", padding: "8px 14px", background: "transparent", border: "none", color: TEXT, fontSize: 13, cursor: "pointer", textAlign: "left" }}>✏️ Editar</button>
              {whatsapp && (
                <a href={`https://wa.me/55${whatsapp}`} target="_blank" rel="noreferrer" style={{ display: "block", padding: "8px 14px", color: GREEN, fontSize: 13, textDecoration: "none" }}>💬 WhatsApp</a>
              )}
              <button onClick={() => { onDelete(lead.id); setMenu(false) }} style={{ display: "block", width: "100%", padding: "8px 14px", background: "transparent", border: "none", color: RED, fontSize: 13, cursor: "pointer", textAlign: "left" }}>🗑️ Excluir</button>
            </div>
          )}
        </div>
      </div>

      {/* Contato */}
      {lead.contact_name && <div style={{ fontSize: 12, color: TEXT2, marginBottom: 4 }}>👤 {lead.contact_name}</div>}
      {lead.phone && <div style={{ fontSize: 12, color: TEXT2, marginBottom: 4 }}>📱 {lead.phone}</div>}

      {/* Notas */}
      {lead.notes && (
        <div style={{ fontSize: 12, color: TEXT2, background: SURFACE, borderRadius: 6, padding: "6px 8px", marginTop: 6, marginBottom: 6, lineHeight: 1.5 }}>
          {lead.notes}
        </div>
      )}

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
        <span style={{ fontSize: 11, color: MUTED }}>🕐 {daysSince(lead.last_contact)}</span>
        <div style={{ display: "flex", gap: 4 }}>
          {stageIdx > 0 && (
            <button onClick={() => onMove(lead.id, STAGES[stageIdx - 1].id)} style={{ fontSize: 11, background: "transparent", border: `1px solid ${BORDER}`, borderRadius: 6, color: TEXT2, cursor: "pointer", padding: "2px 6px" }}>← Voltar</button>
          )}
          {stageIdx < STAGES.length - 1 && (
            <button onClick={() => onMove(lead.id, STAGES[stageIdx + 1].id)} style={{ fontSize: 11, background: BLUE, border: "none", borderRadius: 6, color: "white", cursor: "pointer", padding: "2px 8px", fontWeight: 600 }}>Avançar →</button>
          )}
        </div>
      </div>
    </div>
  )
}

function Modal({ lead, onSave, onClose }: { lead: Lead; onSave: (l: Lead) => void; onClose: () => void }) {
  const [form, setForm] = useState<Lead>({ ...lead })

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 28, width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: TEXT }}>
            {lead.name ? "Editar lead" : "Novo lead"}
          </h3>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: TEXT2, fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>

        {[
          { label: "Nome do estabelecimento *", key: "name", type: "text", placeholder: "Ex: Barbearia do João" },
          { label: "Nome do contato", key: "contact_name", type: "text", placeholder: "Ex: João Silva" },
          { label: "Telefone (WhatsApp)", key: "phone", type: "text", placeholder: "11999999999" },
          { label: "Cidade", key: "city", type: "text", placeholder: "São Paulo" },
          { label: "Último contato", key: "last_contact", type: "date", placeholder: "" },
        ].map(f => (
          <div key={f.key} style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: TEXT2, display: "block", marginBottom: 5 }}>{f.label}</label>
            <input
              type={f.type}
              value={(form as any)[f.key]}
              placeholder={f.placeholder}
              onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
              style={{ width: "100%", background: BG, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "9px 12px", color: TEXT, fontSize: 13, outline: "none" }}
            />
          </div>
        ))}

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, color: TEXT2, display: "block", marginBottom: 5 }}>Tipo de negócio</label>
          <select value={form.business_type} onChange={e => setForm(p => ({ ...p, business_type: e.target.value }))}
            style={{ width: "100%", background: BG, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "9px 12px", color: TEXT, fontSize: 13, outline: "none" }}>
            {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, color: TEXT2, display: "block", marginBottom: 5 }}>Etapa</label>
          <select value={form.stage} onChange={e => setForm(p => ({ ...p, stage: e.target.value }))}
            style={{ width: "100%", background: BG, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "9px 12px", color: TEXT, fontSize: 13, outline: "none" }}>
            {STAGES.map(s => <option key={s.id} value={s.id}>{s.icon} {s.label}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, color: TEXT2, display: "block", marginBottom: 5 }}>Anotações</label>
          <textarea
            value={form.notes}
            placeholder="Observações sobre o lead..."
            onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
            rows={3}
            style={{ width: "100%", background: BG, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "9px 12px", color: TEXT, fontSize: 13, outline: "none", resize: "vertical" }}
          />
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "10px", background: "transparent", border: `1px solid ${BORDER}`, borderRadius: 8, color: TEXT2, fontSize: 14, cursor: "pointer" }}>
            Cancelar
          </button>
          <button
            onClick={() => { if (!form.name.trim()) return; onSave(form); onClose() }}
            style={{ flex: 2, padding: "10px", background: BLUE, border: "none", borderRadius: 8, color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
          >
            Salvar lead
          </button>
        </div>
      </div>
    </div>
  )
}

const STORAGE_KEY = "doohplay_crm_leads"
const PIN = "dooh2026"

export default function CrmPage() {
  const [auth, setAuth] = useState(false)
  const [pin, setPin] = useState("")
  const [pinError, setPinError] = useState(false)
  const [leads, setLeads] = useState<Lead[]>([])
  const [modal, setModal] = useState<Lead | null>(null)
  const [search, setSearch] = useState("")
  const [filterStage, setFilterStage] = useState("todos")
  const [view, setView] = useState<"kanban" | "lista">("kanban")

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) setLeads(JSON.parse(saved))
    const authed = sessionStorage.getItem("crm_auth")
    if (authed === "1") setAuth(true)
  }, [])

  const save = (updated: Lead[]) => {
    setLeads(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }

  const handleSave = (lead: Lead) => {
    const existing = leads.find(l => l.id === lead.id)
    if (existing) {
      save(leads.map(l => l.id === lead.id ? lead : l))
    } else {
      save([lead, ...leads])
    }
  }

  const handleMove = (id: string, stage: string) => {
    save(leads.map(l => l.id === id ? { ...l, stage, last_contact: new Date().toISOString().slice(0, 10) } : l))
  }

  const handleDelete = (id: string) => {
    if (confirm("Excluir este lead?")) save(leads.filter(l => l.id !== id))
  }

  const exportCSV = () => {
    const headers = ["Nome", "Tipo", "Cidade", "Contato", "Telefone", "Etapa", "Último contato", "Notas"]
    const rows = leads.map(l => [l.name, l.business_type, l.city, l.contact_name, l.phone, STAGES.find(s => s.id === l.stage)?.label ?? l.stage, l.last_contact, l.notes])
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n")
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url; a.download = `doohplay-crm-${new Date().toISOString().slice(0,10)}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  const filtered = leads.filter(l => {
    const q = search.toLowerCase()
    const matchSearch = !q || l.name.toLowerCase().includes(q) || l.city.toLowerCase().includes(q) || l.contact_name.toLowerCase().includes(q) || l.business_type.toLowerCase().includes(q)
    const matchStage = filterStage === "todos" || l.stage === filterStage
    return matchSearch && matchStage
  })

  // LOGIN
  if (!auth) return (
    <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 40, width: "100%", maxWidth: 360, textAlign: "center" }}>
        <div style={{ fontSize: 32, fontWeight: 900, color: TEXT, marginBottom: 8 }}>DOOH<span style={{ color: BLUE }}>PLAY</span></div>
        <div style={{ fontSize: 14, color: TEXT2, marginBottom: 28 }}>CRM — Acesso restrito</div>
        <input
          type="password"
          placeholder="Digite o PIN"
          value={pin}
          onChange={e => { setPin(e.target.value); setPinError(false) }}
          onKeyDown={e => {
            if (e.key === "Enter") {
              if (pin === PIN) { setAuth(true); sessionStorage.setItem("crm_auth", "1") }
              else setPinError(true)
            }
          }}
          style={{ width: "100%", background: BG, border: `1px solid ${pinError ? RED : BORDER}`, borderRadius: 10, padding: "12px 16px", color: TEXT, fontSize: 18, textAlign: "center", letterSpacing: 6, outline: "none", marginBottom: 12 }}
        />
        {pinError && <div style={{ fontSize: 13, color: RED, marginBottom: 12 }}>PIN incorreto</div>}
        <button
          onClick={() => {
            if (pin === PIN) { setAuth(true); sessionStorage.setItem("crm_auth", "1") }
            else setPinError(true)
          }}
          style={{ width: "100%", padding: "12px", background: BLUE, border: "none", borderRadius: 10, color: "white", fontSize: 15, fontWeight: 700, cursor: "pointer" }}
        >
          Entrar
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT, fontFamily: "system-ui, sans-serif" }}>
      <style>{`* { box-sizing:border-box; margin:0; padding:0; } input,select,textarea { font-family:inherit; } button:hover { opacity:0.85; }`}</style>

      {/* NAV */}
      <nav style={{ background: "rgba(11,16,32,0.97)", borderBottom: `1px solid ${BORDER}`, padding: "0 20px", height: 54, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, background: `linear-gradient(135deg,${BLUE},${INDIGO})`, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
          </div>
          <span style={{ fontSize: 15, fontWeight: 800 }}>DOOH<span style={{ color: BLUE }}>PLAY</span></span>
          <span style={{ color: MUTED }}>/</span>
          <span style={{ fontSize: 13, color: TEXT2 }}>CRM Pipeline</span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 12, color: TEXT2 }}>{leads.length} leads</span>
          <button onClick={exportCSV} style={{ fontSize: 12, background: "transparent", border: `1px solid ${BORDER}`, borderRadius: 8, color: TEXT2, cursor: "pointer", padding: "5px 10px" }}>⬇ CSV</button>
          <button onClick={() => setModal(newLead())} style={{ fontSize: 13, background: BLUE, border: "none", borderRadius: 8, color: "white", cursor: "pointer", padding: "6px 14px", fontWeight: 600 }}>+ Novo lead</button>
        </div>
      </nav>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "20px 16px" }}>

        {/* STATS */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          {STAGES.map(s => {
            const count = leads.filter(l => l.stage === s.id).length
            return (
              <div key={s.id} onClick={() => setFilterStage(filterStage === s.id ? "todos" : s.id)}
                style={{ background: filterStage === s.id ? s.color + "22" : SURFACE, border: `1px solid ${filterStage === s.id ? s.color : BORDER}`, borderRadius: 10, padding: "10px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, minWidth: 130 }}>
                <span style={{ fontSize: 18 }}>{s.icon}</span>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{count}</div>
                  <div style={{ fontSize: 11, color: TEXT2 }}>{s.label}</div>
                </div>
              </div>
            )
          })}
          <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "10px 16px", display: "flex", alignItems: "center", gap: 8, minWidth: 130 }}>
            <span style={{ fontSize: 18 }}>📊</span>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: TEXT }}>{leads.length}</div>
              <div style={{ fontSize: 11, color: TEXT2 }}>Total</div>
            </div>
          </div>
        </div>

        {/* FILTROS */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Buscar por nome, cidade ou tipo..."
            style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "8px 14px", color: TEXT, fontSize: 13, outline: "none", minWidth: 260 }}
          />
          <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
            {(["kanban", "lista"] as const).map(v => (
              <button key={v} onClick={() => setView(v)} style={{ padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: "pointer", background: view === v ? BLUE : "transparent", border: `1px solid ${view === v ? BLUE : BORDER}`, color: view === v ? "white" : TEXT2 }}>
                {v === "kanban" ? "⬛ Kanban" : "☰ Lista"}
              </button>
            ))}
          </div>
        </div>

        {/* KANBAN */}
        {view === "kanban" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, overflowX: "auto" }}>
            {STAGES.map(stage => {
              const stageLeads = filtered.filter(l => l.stage === stage.id)
              return (
                <div key={stage.id} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 12, minHeight: 200 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12, paddingBottom: 10, borderBottom: `1px solid ${BORDER}` }}>
                    <span style={{ fontSize: 16 }}>{stage.icon}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: stage.color }}>{stage.label}</span>
                    <span style={{ marginLeft: "auto", fontSize: 11, background: stage.color + "22", color: stage.color, padding: "1px 7px", borderRadius: 10, fontWeight: 700 }}>{stageLeads.length}</span>
                  </div>
                  {stageLeads.map(lead => (
                    <LeadCard key={lead.id} lead={lead} onMove={handleMove} onEdit={setModal} onDelete={handleDelete} />
                  ))}
                  {stageLeads.length === 0 && (
                    <div style={{ textAlign: "center", padding: "20px 0", color: MUTED, fontSize: 12 }}>Nenhum lead aqui</div>
                  )}
                  <button onClick={() => setModal({ ...newLead(), stage: stage.id })} style={{ width: "100%", padding: "7px", background: "transparent", border: `1px dashed ${BORDER}`, borderRadius: 8, color: MUTED, fontSize: 12, cursor: "pointer", marginTop: 8 }}>
                    + Adicionar
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {/* LISTA */}
        {view === "lista" && (
          <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                  {["Estabelecimento", "Tipo", "Cidade", "Contato", "Telefone", "Etapa", "Último contato", "Ações"].map(h => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, color: TEXT2, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead, i) => {
                  const stage = STAGES.find(s => s.id === lead.stage)!
                  const stageIdx = STAGES.findIndex(s => s.id === lead.stage)
                  const whatsapp = lead.phone.replace(/\D/g, "")
                  return (
                    <tr key={lead.id} style={{ borderBottom: `1px solid ${BORDER}`, background: i % 2 === 0 ? "transparent" : SURFACE2 }}>
                      <td style={{ padding: "10px 14px", fontSize: 13, fontWeight: 600, color: TEXT }}>{lead.name}</td>
                      <td style={{ padding: "10px 14px", fontSize: 12, color: TEXT2 }}>{lead.business_type}</td>
                      <td style={{ padding: "10px 14px", fontSize: 12, color: TEXT2 }}>{lead.city}</td>
                      <td style={{ padding: "10px 14px", fontSize: 12, color: TEXT2 }}>{lead.contact_name || "—"}</td>
                      <td style={{ padding: "10px 14px", fontSize: 12, color: TEXT2 }}>{lead.phone || "—"}</td>
                      <td style={{ padding: "10px 14px" }}>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: stage.color + "22", color: stage.color, border: `1px solid ${stage.color}44` }}>
                          {stage.icon} {stage.label}
                        </span>
                      </td>
                      <td style={{ padding: "10px 14px", fontSize: 12, color: TEXT2 }}>{daysSince(lead.last_contact)}</td>
                      <td style={{ padding: "10px 14px" }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => setModal(lead)} style={{ fontSize: 11, background: "transparent", border: `1px solid ${BORDER}`, borderRadius: 6, color: TEXT2, cursor: "pointer", padding: "3px 8px" }}>✏️</button>
                          {whatsapp && <a href={`https://wa.me/55${whatsapp}`} target="_blank" rel="noreferrer" style={{ fontSize: 11, background: "transparent", border: `1px solid ${GREEN}44`, borderRadius: 6, color: GREEN, cursor: "pointer", padding: "3px 8px", textDecoration: "none" }}>💬</a>}
                          {stageIdx < STAGES.length - 1 && <button onClick={() => handleMove(lead.id, STAGES[stageIdx + 1].id)} style={{ fontSize: 11, background: BLUE, border: "none", borderRadius: 6, color: "white", cursor: "pointer", padding: "3px 8px" }}>→</button>}
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} style={{ padding: "32px", textAlign: "center", color: MUTED, fontSize: 13 }}>Nenhum lead encontrado. Clique em "+ Novo lead" para começar.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && <Modal lead={modal} onSave={handleSave} onClose={() => setModal(null)} />}
    </div>
  )
}
