// app/marketplace/filters.tsx
"use client"

import { useState } from "react"

const BG     = "#080C18"
const SURF   = "#0F1629"
const BORDER = "rgba(255,255,255,0.07)"
const TEXT   = "#F1F5F9"
const TEXT2  = "#94A3B8"
const MUTED  = "#475569"
const BLUE   = "#3B82F6"
const GREEN  = "#10B981"

function segmentIcon(seg: string): string {
  const map: Record<string, string> = {
    "Barbearia": "✂️", "Padaria": "🍞", "Farmácia": "💊",
    "Restaurante": "🍕", "Cafeteria": "☕", "Academia": "🏋️",
    "Salão de Beleza": "💅", "Shopping": "🛒", "Comércio": "🏪",
  }
  return map[seg] ?? "📺"
}

function cpmEstimate(plays: number): string {
  if (plays > 500) return "R$ 8,00"
  if (plays > 200) return "R$ 12,00"
  if (plays > 50)  return "R$ 15,00"
  return "R$ 18,00"
}

function audienceEstimate(plays: number): string {
  const daily = Math.max(plays, 50)
  return `${(daily * 30).toLocaleString("pt-BR")} / mês`
}

export default function MarketplaceFilters({ screens, cities, segments }: {
  screens: any[]
  cities: string[]
  segments: string[]
}) {
  const [cityFilter,    setCityFilter]    = useState("Todas")
  const [segmentFilter, setSegmentFilter] = useState("Todos")
  const [search,        setSearch]        = useState("")

  const filtered = screens.filter(s => {
    const matchCity    = cityFilter    === "Todas"  || s.city    === cityFilter
    const matchSegment = segmentFilter === "Todos"  || s.segment === segmentFilter
    const matchSearch  = !search || s.client_name?.toLowerCase().includes(search.toLowerCase())
                      || s.name?.toLowerCase().includes(search.toLowerCase())
                      || s.location?.toLowerCase().includes(search.toLowerCase())
    return matchCity && matchSegment && matchSearch
  })

  return (
    <div>
      {/* Busca */}
      <div style={{ marginBottom: 20 }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Buscar por nome, cidade ou endereço…"
          style={{ width: "100%", background: SURF, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "11px 16px", color: TEXT, fontSize: 14, outline: "none", boxSizing: "border-box" }}
        />
      </div>

      {/* Filtro cidade */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: TEXT2, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Cidade</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["Todas", ...cities].map(city => (
            <button key={city} onClick={() => setCityFilter(city)} style={{
              fontSize: 12, padding: "5px 14px", borderRadius: 20, cursor: "pointer",
              border: `1px solid ${cityFilter === city ? BLUE : BORDER}`,
              background: cityFilter === city ? BLUE + "22" : "transparent",
              color: cityFilter === city ? BLUE : TEXT2,
              fontWeight: cityFilter === city ? 600 : 400,
            }}>
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Filtro segmento */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: TEXT2, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Segmento</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["Todos", ...segments].map(seg => (
            <button key={seg} onClick={() => setSegmentFilter(seg)} style={{
              fontSize: 12, padding: "5px 14px", borderRadius: 20, cursor: "pointer",
              border: `1px solid ${segmentFilter === seg ? BLUE : BORDER}`,
              background: segmentFilter === seg ? BLUE + "22" : "transparent",
              color: segmentFilter === seg ? BLUE : TEXT2,
              fontWeight: segmentFilter === seg ? 600 : 400,
            }}>
              {segmentIcon(seg)} {seg}
            </button>
          ))}
        </div>
      </div>

      {/* Contador */}
      <div style={{ fontSize: 13, color: TEXT2, marginBottom: 16 }}>
        {filtered.length} tela{filtered.length !== 1 ? "s" : ""} encontrada{filtered.length !== 1 ? "s" : ""}
        {(cityFilter !== "Todas" || segmentFilter !== "Todos" || search) && (
          <button onClick={() => { setCityFilter("Todas"); setSegmentFilter("Todos"); setSearch("") }}
            style={{ marginLeft: 10, fontSize: 12, color: BLUE, background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
            Limpar filtros
          </button>
        )}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: TEXT2 }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Nenhuma tela encontrada</div>
          <div style={{ fontSize: 13 }}>Tente outros filtros ou limpe a busca</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16, marginBottom: 32 }}>
          {filtered.map(s => {
            const isOnline = s.last_ping && (Date.now() - new Date(s.last_ping).getTime()) < 3 * 60 * 1000
            return (
              <div key={s.id} style={{ background: SURF, border: `1px solid ${BORDER}`, borderRadius: 14, overflow: "hidden", transition: "all .15s", cursor: "default" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(59,130,246,0.4)"; e.currentTarget.style.transform = "translateY(-2px)" }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.transform = "none" }}
              >
                <div style={{ background: "#0A0F1E", height: 100, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 32 }}>{segmentIcon(s.segment)}</div>
                    <div style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>{s.device_type ?? "TV"}</div>
                  </div>
                  <div style={{ position: "absolute", top: 10, right: 12, display: "flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 700, color: isOnline ? GREEN : MUTED }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: isOnline ? GREEN : MUTED, display: "inline-block" }}/>
                    {isOnline ? "Online" : "Ativo"}
                  </div>
                  <div style={{ position: "absolute", top: 10, left: 12, fontSize: 10, fontWeight: 600, color: GREEN, background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", padding: "2px 8px", borderRadius: 10 }}>
                    ✓ Verificado
                  </div>
                </div>
                <div style={{ padding: "14px 16px" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: TEXT, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {s.client_name ?? s.name?.replace("Tela ", "")}
                  </div>
                  <div style={{ fontSize: 12, color: TEXT2, marginBottom: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    📍 {s.location ?? s.city}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
                    {[
                      { label: "Audiência", value: audienceEstimate(s.total_plays) },
                      { label: "CPM",       value: cpmEstimate(s.total_plays) },
                      { label: "Segmento",  value: s.segment },
                    ].map(m => (
                      <div key={m.label} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "8px 6px", textAlign: "center" }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: TEXT, marginBottom: 2 }}>{m.value}</div>
                        <div style={{ fontSize: 9, color: MUTED }}>{m.label}</div>
                      </div>
                    ))}
                  </div>
                  <a href={`/marketplace?anunciar=${s.id}&tela=${encodeURIComponent(s.client_name ?? s.name?.replace("Tela ","") ?? "")}&cidade=${encodeURIComponent(s.city)}`}
                    style={{ display: "block", width: "100%", background: BLUE, color: "#fff", borderRadius: 8, padding: "10px", fontSize: 13, fontWeight: 600, cursor: "pointer", textAlign: "center", textDecoration: "none" }}>
                    Anunciar nessa tela →
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
