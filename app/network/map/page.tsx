"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

const BG      = "#080C18"
const SURFACE = "#0F1629"
const BORDER  = "rgba(255,255,255,0.07)"
const TEXT    = "#F1F5F9"
const TEXT2   = "#94A3B8"
const MUTED   = "#475569"
const BLUE    = "#3B82F6"
const GREEN   = "#10B981"
const AMBER   = "#F59E0B"
const RED     = "#EF4444"

const CITY_POS: Record<string, { svgX: number; svgY: number }> = {
  "São Paulo":      { svgX: 446, svgY: 490 },
  "Rio de Janeiro": { svgX: 513, svgY: 481 },
  "Belo Horizonte": { svgX: 496, svgY: 427 },
  "Brasília":       { svgX: 439, svgY: 362 },
  "Curitiba":       { svgX: 378, svgY: 527 },
  "Porto Alegre":   { svgX: 353, svgY: 632 },
  "Salvador":       { svgX: 564, svgY: 304 },
  "Recife":         { svgX: 631, svgY: 236 },
  "Fortaleza":      { svgX: 580, svgY: 168 },
  "Manaus":         { svgX: 202, svgY: 151 },
}

function extractCity(location: string | null): string {
  if (!location) return "Outros"
  const known = Object.keys(CITY_POS)
  for (const city of known) {
    if (location.includes(city)) return city
  }
  if (location.includes(", SP")) return "São Paulo"
  if (location.includes(", RJ")) return "Rio de Janeiro"
  if (location.includes(", MG")) return "Belo Horizonte"
  if (location.includes(", PR")) return "Curitiba"
  if (location.includes(", RS")) return "Porto Alegre"
  if (location.includes(", BA")) return "Salvador"
  if (location.includes(", PE")) return "Recife"
  if (location.includes(", CE")) return "Fortaleza"
  if (location.includes(", AM")) return "Manaus"
  if (location.includes(", DF")) return "Brasília"
  return "Outros"
}

function timeSince(ts: string | null) {
  if (!ts) return "sem dados"
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000)
  if (diff < 60)    return `${diff}s atrás`
  if (diff < 3600)  return `${Math.floor(diff / 60)}min atrás`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`
  return `${Math.floor(diff / 86400)}d atrás`
}

const RISK_COLOR: Record<string, string> = {
  SAFE:      GREEN,
  WATCH:     AMBER,
  HIGH_RISK: RED,
}

const STATUS_COLOR: Record<string, string> = {
  online:  GREEN,
  offline: RED,
}

function cityStatus(players: any[]): string {
  if (players.length === 0) return "offline"
  const online = players.filter(p => p.status === "online").length
  const ratio  = online / players.length
  if (ratio >= 0.8) return "online"
  if (ratio >= 0.4) return "watch"
  return "offline"
}

function cityColor(st: string): string {
  if (st === "online")  return GREEN
  if (st === "watch")   return AMBER
  return RED
}

function groupByCity(players: any[]) {
  const map: Record<string, any[]> = {}
  for (const p of players) {
    const city = extractCity(p.metadata?.location)
    if (!map[city]) map[city] = []
    map[city].push(p)
  }
  return map
}

const BRAZIL_PATH = "M6.429,213.94L33.412,223.657L76.648,238.393L109.278,253.44L123.921,259.862L88.557,244.497L57.463,229.112L22.404,221.112L3.266,212.465ZM112.148,58.263L112.675,60.276L113.26,61.017L114.702,61.17L115.945,63.915L116.271,65.606L116.419,68.146L116.152,70.992L120.043,71.721L131.714,79.701L174.195,228.284L173.616,229.603L172.439,231.164L171.791,233.079L169.884,232.616L169.053,233.391L169.112,235.171L169.031,236.842L168.695,237.616L168.213,238.015L167.84,238.837L166.917,239.59L165.68,240.688L165.516,242.025L165.171,243.824L162.849,243.654L160.601,244.102L158.859,244.126L157.833,244.776L156.279,244.324L154.868,244.299L152.855,245.27L152.39,247.11L152.525,247.997L152.364,248.856L151.521,249.471L150.979,250.384L150.528,251.065L149.735,251.474L148.781,252.03L148.359,251.137L147.772,249.773L146.37,249.245L144.806,250.257L143.823,250.126L143.702,251.528L143.332,252.449L142.497,252.114L140.607,251.821L139.837,252.769L138.789,253.924L137.969,254.481L137.404,253.534L136.81,253.204L135.274,251.933L133.879,251.325L132.376,251.464L130.647,251.785L129.616,251.664L128.878,251.739L127.58,251.433L127.332,253.46L125.425,255.47L124.204,255.834L122.253,257.39L120.891,258.389L88.557,244.497ZM383.804,24.918L383.896,25.791L384.6,26.457L385.503,26.876L385.56,27.77L385.481,28.811L385.437,29.49L385.34,30.461L385.666,33.539L385.524,34.178L385.555,35.77L385.921,36.798L386.219,37.634L386.424,38.804L386.29,39.505L386.684,41.247L387.098,42.458L387.448,43.414L387.84,45.232L388.46,45.735L388.852,46.779L389.42,47.934L389.601,49.043L389.344,50.275L389.738,50.379L390.503,50.557L390.826,51.223L390.953,52.39L391.181,53.167L391.478,53.975L391.701,54.818L392.192,56.164L395.384,55.324L396.279,55.542L396.695,55.959L397.352,56.884L397.767,57.543L398.069,58.377L398.518,59.226L400.41,61.961L401.914,62.267L405.125,63.891L405.328,64.628L405.508,65.905L405.756,67.399L405.717,68.357L405.572,69.479L405.272,70.435L405.496,71.984L405.125,73.114L404.66,73.701L404.691,75.708L404.089,76.294L402.983,78.013L396.084,82.818L394.337,87.264L388.197,91.145L386.921,92.368L385.119,93.972L381.887,96.47L379.932,99.524L377.25,102.911L375.165,107.929L373.762,111.593L371.288,111.48L370.615,111.94L364.438,111.204L363.119,110.074L362.975,108.681L363.289,107.361L362.377,106.397L361.038,106.595L361.597,104.992L361.427,103.5L360.062,102.214L358.648,101.164L358.581,99.41L358.248,97.353L355.827,95.113L354.372,94.825L353.53,91.926L352.794,90.702L352.337,89.778L350.954,87.374L350.527,85.559L350.477,83.634L350.736,82.324L350.912,80.766L349.808,79.371L348.756,78.676L347.188,77.412L346.19,75.778L345.9,74.79L345.52,73.27L344.022,71.752L342.224,69.625L341.243,69.135L340.29,68.934L339.483,68.721L338.276,68.734L337.692,68.154L336.62,67.535L335.076,67.423L334.557,66.324L334.141,65.21L333.172,65.08L332.274,64.217L330.032,62.743L329.242,62.798L328.317,62.907L326.778,62.49L324.962,62.656L323.827,62.36L323.939,61.471L323.54,60.575L323.078,58.643L322.469,52.666L323.869,50.824L325.245,53.257L336.561,54.774L375.201,24.815L375.944,24.359L376.166,23.595L376.689,22.243L376.951,20.878L377.134,19.776L378.136,17.708L380.412,19.472L382.068,21.213L382.983,22.384L383.413,23.227L383.659,24.118Z"

export default function NetworkMapPage() {
  const [players,   setPlayers]   = useState<any[]>([])
  const [summary,   setSummary]   = useState<any>({ total: 0, online: 0, offline: 0, safe: 0, watch: 0, highRisk: 0 })
  const [loading,   setLoading]   = useState(true)
  const [filter,    setFilter]    = useState("todos")
  const [selCity,   setSelCity]   = useState<string | null>(null)
  const [selPlayer, setSelPlayer] = useState<any | null>(null)
  const [geocoding, setGeocoding] = useState(false)
  const [geocodeMsg, setGeocodeMsg] = useState("")

  const runGeocode = async () => {
    setGeocoding(true); setGeocodeMsg("")
    try {
      const res = await fetch("/api/admin/geocode-clients", { method: "POST" })
      const data = await res.json()
      if (!res.ok) { setGeocodeMsg(data.error || "Erro ao geocodificar"); setGeocoding(false); return }
      setGeocodeMsg(`✓ ${data.summary.success} geocodificados, ${data.summary.skipped_no_address} sem endereço, ${data.summary.failed_not_found} não encontrados`)
      load()
    } catch {
      setGeocodeMsg("Erro de conexão")
    }
    setGeocoding(false)
  }

  const load = async () => {
    try {
      const res = await fetch("/api/network/map", { cache: "no-store" })
      if (!res.ok) return
      const data = await res.json()
      if (data.success) {
        setPlayers(data.data ?? [])
        setSummary(data.summary ?? {})
      }
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load(); const t = setInterval(load, 30_000); return () => clearInterval(t) }, [])

  const byCity = groupByCity(players)
  const cities = Object.keys(CITY_POS)

  const filteredPlayers = filter === "todos"     ? players
    : filter === "online"   ? players.filter(p => p.status === "online")
    : filter === "offline"  ? players.filter(p => p.status === "offline")
    : filter === "high_risk"? players.filter(p => p.risk === "HIGH_RISK")
    : filter === "watch"    ? players.filter(p => p.risk === "WATCH")
    : players

  const cityPlayers    = selCity ? (byCity[selCity] ?? []) : []
  const displayPlayers = selCity
    ? (filter === "todos" ? cityPlayers : cityPlayers.filter(p =>
        filter === "online"    ? p.status === "online"
        : filter === "offline" ? p.status === "offline"
        : filter === "high_risk" ? p.risk === "HIGH_RISK"
        : filter === "watch"   ? p.risk === "WATCH"
        : true
      ))
    : filteredPlayers

  return (
    <main style={{ minHeight: "100vh", background: BG, color: TEXT, fontFamily: "'Inter', system-ui, sans-serif", display: "flex", flexDirection: "column" }}>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-track { background: ${BG}; } ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; } @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:.35 } }`}</style>

      {/* NAV */}
      <nav style={{ background: "rgba(8,12,24,0.95)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${BORDER}`, padding: "0 1.5rem", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/admin" style={{ fontSize: 12, color: TEXT2, textDecoration: "none" }}>← Admin</Link>
          <span style={{ color: MUTED }}>/</span>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <div style={{ width: 26, height: 26, background: "linear-gradient(135deg,#3B82F6,#6366F1)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            </div>
            <span style={{ fontSize: 14, fontWeight: 800 }}>DOOH<span style={{ color: BLUE }}>PLAY</span></span>
          </Link>
          <span style={{ color: MUTED }}>/</span>
          <span style={{ fontSize: 13, color: TEXT2 }}>Network Map</span>
          {!loading && <span style={{ fontSize: 12, color: GREEN, fontWeight: 600 }}>● {summary.total} telas · {summary.online} online</span>}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", color: GREEN, fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20 }}>⚡ LIVE</span>
          {geocodeMsg && <span style={{ fontSize: 11, color: TEXT2 }}>{geocodeMsg}</span>}
          <button onClick={runGeocode} disabled={geocoding} style={{ background: "transparent", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "5px 12px", color: TEXT2, fontSize: 12, cursor: geocoding ? "not-allowed" : "pointer", opacity: geocoding ? 0.6 : 1 }}>
            {geocoding ? "Geocodificando…" : "📍 Geocodificar clientes"}
          </button>
          <button onClick={load} style={{ background: "transparent", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "5px 12px", color: TEXT2, fontSize: 12, cursor: "pointer" }}>↻</button>
        </div>
      </nav>

      {/* KPI BAR */}
      <div style={{ padding: "8px 1.5rem", borderBottom: `1px solid ${BORDER}`, display: "flex", gap: 8, flexWrap: "wrap" }}>
        {[
          { id: "todos",     label: `${summary.total} Total`,      color: BLUE  },
          { id: "online",    label: `${summary.online} Online`,     color: GREEN },
          { id: "offline",   label: `${summary.offline} Offline`,   color: RED   },
          { id: "watch",     label: `${summary.watch} Watch`,       color: AMBER },
          { id: "high_risk", label: `${summary.highRisk} High Risk`,color: RED   },
        ].map(k => (
          <button key={k.id} onClick={() => setFilter(k.id)} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: k.color, background: filter === k.id ? `${k.color}18` : `${k.color}0A`, border: `1px solid ${filter === k.id ? k.color + "44" : k.color + "22"}`, padding: "4px 12px", borderRadius: 20, fontWeight: 500, cursor: "pointer" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: k.color, display: "inline-block" }}/>{k.label}
          </button>
        ))}
      </div>

      {/* BODY */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", flex: 1, overflow: "hidden" }}>

        {/* MAPA SVG */}
        <div style={{ position: "relative", background: "#080D1A", borderRight: `1px solid ${BORDER}`, overflow: "hidden", minHeight: 500 }}>
          {loading && (
            <div style={{ position: "absolute", inset: 0, background: BG, display: "flex", alignItems: "center", justifyContent: "center", color: TEXT2, fontSize: 14, zIndex: 5 }}>
              Carregando dados…
            </div>
          )}
          <svg viewBox="0 0 700 700" xmlns="http://www.w3.org/2000/svg" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}>
            <path d={BRAZIL_PATH} fill="rgba(59,130,246,0.08)" stroke="#3B82F6" strokeWidth="1.2" strokeLinejoin="round" fillRule="evenodd"/>

            {/* Dots das cidades */}
            {cities.map(cityName => {
              const pos      = CITY_POS[cityName]
              const cPlayers = byCity[cityName] ?? []
              const total    = cPlayers.length
              if (total === 0) return null
              const st       = cityStatus(cPlayers)
              const color    = cityColor(st)
              const isSelected = selCity === cityName
              const r        = isSelected ? 22 : Math.max(14, Math.min(20, 10 + total * 2))
              return (
                <g key={cityName} style={{ cursor: "pointer" }} onClick={() => { setSelCity(selCity === cityName ? null : cityName); setSelPlayer(null) }}>
                  {isSelected && <circle cx={pos.svgX} cy={pos.svgY} r={r + 9} fill={`${color}12`}/>}
                  <circle cx={pos.svgX} cy={pos.svgY} r={r} fill={`${color}22`} stroke={color} strokeWidth={isSelected ? 2.5 : 1.5}
                    style={{ animation: st === "online" ? "pulse 2s infinite" : "none" }}
                  />
                  <text x={pos.svgX} y={pos.svgY + 5} textAnchor="middle" fill={color} fontSize={isSelected ? 13 : 11} fontWeight="800">{total}</text>
                  {(isSelected || cityName === "Brasília") && (
                    <text x={pos.svgX} y={pos.svgY + r + 13} textAnchor="middle" fill={TEXT2} fontSize={9}>{cityName}</text>
                  )}
                </g>
              )
            })}

            {/* Legenda */}
            {[[GREEN,"Online"],[AMBER,"Watch"],[RED,"Offline/Risk"]].map(([c, l], i) => (
              <g key={l as string} transform={`translate(16, ${622 + i * 16})`}>
                <circle cx={5} cy={5} r={4} fill={c as string} opacity={0.8}/>
                <text x={14} y={9} fill={TEXT2} fontSize={10}>{l as string}</text>
              </g>
            ))}
          </svg>
        </div>

        {/* SIDEBAR */}
        <div style={{ display: "flex", flexDirection: "column", overflow: "hidden", background: SURFACE }}>

          {/* Detalhe player */}
          {selPlayer && (
            <div style={{ padding: "14px 18px", borderBottom: `1px solid ${BORDER}`, background: "#0A0F1E", flexShrink: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, maxWidth: 230 }}>{selPlayer.name}</div>
                <button onClick={() => setSelPlayer(null)} style={{ background: "none", border: "none", color: MUTED, fontSize: 18, cursor: "pointer", lineHeight: 1 }}>×</button>
              </div>
              <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
                <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: `${STATUS_COLOR[selPlayer.status] ?? MUTED}22`, color: STATUS_COLOR[selPlayer.status] ?? MUTED, border: `1px solid ${STATUS_COLOR[selPlayer.status] ?? MUTED}44` }}>
                  ● {selPlayer.status}
                </span>
                <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: `${RISK_COLOR[selPlayer.risk] ?? MUTED}22`, color: RISK_COLOR[selPlayer.risk] ?? MUTED, border: `1px solid ${RISK_COLOR[selPlayer.risk] ?? MUTED}44` }}>
                  {selPlayer.risk}
                </span>
              </div>
              {[
                { label: "Trust Score",  value: `${selPlayer.score}/100` },
                { label: "Localização",  value: selPlayer.metadata?.location },
                { label: "Cliente",      value: selPlayer.metadata?.clientName ?? "—" },
                { label: "Último ping",  value: timeSince(selPlayer.lastSeenAt) },
                { label: "Execuções",    value: selPlayer.executions?.toLocaleString("pt-BR") },
                { label: "Plataforma",   value: selPlayer.metadata?.platform ?? "—" },
              ].map(row => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "4px 0", borderBottom: `1px solid rgba(255,255,255,0.04)` }}>
                  <span style={{ color: TEXT2 }}>{row.label}</span>
                  <span style={{ color: row.label === "Trust Score" ? (selPlayer.score >= 80 ? GREEN : selPlayer.score >= 50 ? AMBER : RED) : TEXT, fontWeight: 500, maxWidth: 165, textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.value}</span>
                </div>
              ))}
              {selPlayer.metadata?.clientCode && (
                <a href={`/dashboard/local/${selPlayer.metadata.clientCode}`} target="_blank" rel="noreferrer" style={{ display: "block", marginTop: 10, background: BLUE, color: "#fff", borderRadius: 8, padding: "7px", textAlign: "center", fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
                  Abrir Dashboard →
                </a>
              )}
            </div>
          )}

          {/* Header */}
          <div style={{ padding: "12px 18px", borderBottom: `1px solid ${BORDER}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
            {selCity ? (
              <>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>{selCity}</div>
                  <div style={{ fontSize: 11, color: TEXT2, marginTop: 2 }}>
                    {cityPlayers.filter(p => p.status === "online").length} online · {cityPlayers.length} total
                  </div>
                </div>
                <button onClick={() => { setSelCity(null); setSelPlayer(null) }} style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${BORDER}`, borderRadius: 6, padding: "4px 10px", color: TEXT2, fontSize: 11, cursor: "pointer" }}>Voltar</button>
              </>
            ) : (
              <div style={{ fontSize: 12, fontWeight: 600, color: TEXT2, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {displayPlayers.length} tela{displayPlayers.length !== 1 ? "s" : ""}{filter !== "todos" ? ` · ${filter}` : ""}
              </div>
            )}
          </div>

          {/* Lista */}
          <div style={{ flex: 1, overflow: "auto" }}>
            {displayPlayers.length === 0 && !loading && (
              <div style={{ padding: "40px 18px", textAlign: "center", color: MUTED, fontSize: 13 }}>Nenhuma tela encontrada.</div>
            )}
            {displayPlayers.map(p => {
              const statusColor = STATUS_COLOR[p.status] ?? MUTED
              const riskColor   = RISK_COLOR[p.risk] ?? MUTED
              return (
                <button key={p.id} onClick={() => setSelPlayer(selPlayer?.id === p.id ? null : p)} style={{
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "10px 18px", borderBottom: `1px solid rgba(255,255,255,0.04)`,
                  background: selPlayer?.id === p.id ? `${BLUE}12` : "none",
                  border: "none", cursor: "pointer",
                  borderLeft: `3px solid ${selPlayer?.id === p.id ? BLUE : "transparent"}`,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: statusColor, flexShrink: 0, animation: p.status === "online" ? "pulse 2s infinite" : "none" }}/>
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontSize: 12, fontWeight: 500, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 170 }}>{p.name}</div>
                      <div style={{ fontSize: 10, color: MUTED, marginTop: 1 }}>{timeSince(p.lastSeenAt)} · score {p.score}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 10, background: `${statusColor}15`, color: statusColor }}>{p.status}</span>
                    {p.risk !== "SAFE" && (
                      <span style={{ fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 10, background: `${riskColor}15`, color: riskColor }}>{p.risk}</span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Footer */}
          <div style={{ padding: "12px 18px", borderTop: `1px solid ${BORDER}`, flexShrink: 0 }}>
            <Link href="/noc" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: BLUE, color: "#fff", borderRadius: 10, padding: "10px", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
              🌐 Abrir Network Center →
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
