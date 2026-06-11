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

const STATUS_COLOR: Record<string, string> = {
  online:  GREEN,
  idle:    AMBER,
  offline: RED,
}

function cityStatus(players: any[]): string {
  if (players.length === 0) return "offline"
  const online = players.filter(p => p.status === "online").length
  const ratio  = online / players.length
  if (ratio >= 0.8) return "online"
  if (ratio >= 0.4) return "idle"
  return "offline"
}

function groupByCity(players: any[]) {
  const map: Record<string, any[]> = {}
  for (const p of players) {
    const city = extractCity(p.location)
    if (!map[city]) map[city] = []
    map[city].push(p)
  }
  return map
}

// SVG path do contorno do Brasil (simplificado mas preciso)
const BRAZIL_PATH = "M6.429,213.94L33.412,223.657L76.648,238.393L109.278,253.44L123.921,259.862L123.901,260.378L123.515,260.625L123.252,260.738L123.081,261.012L122.482,261.174L122.212,261.246L121.887,261.483L121.473,261.78L121.067,262.06L120.559,262.583L120.249,263.011L119.769,262.951L119.638,263.237L119.389,263.46L119.314,263.649L119.009,263.829L118.841,264.045L118.529,264.386L118.253,264.739L117.707,265.026L117.689,265.444L117.337,265.943L116.95,266.047L116.713,266.313L116.121,266.44L115.428,266.569L115.24,267.086L114.45,267.323L113.974,267.1L113.554,267.065L113.102,267.158L112.671,267.115L112.214,267.069L112.319,267.777L112.002,268.046L111.689,268.16L111.229,268.077L110.689,268.064L110.671,268.521L110.283,269.073L109.838,269.421L109.045,269.703L108.554,269.928L108.08,270.103L107.542,270.638L107.236,271.269L106.639,271.978L105.96,272.885L105.295,273.748L105.042,273.475L104.699,273.326L104.31,273.147L103.991,272.872L103.548,272.671L103.02,272.542L102.696,272.513L102.407,272.542L102.008,272.758L101.45,272.693L100.923,272.725L100.342,272.777L100.019,273.021L99.643,273.262L99.259,273.605L98.985,273.96L99.139,274.416L98.925,274.928L98.693,275.178L98.179,275.637L97.9,275.945L97.498,276.364L97.225,277.045L96.953,277.436L96.66,277.996L96.227,278.316L95.688,278.525L95.139,278.802L94.332,278.978L94.019,279.553L93.647,279.35L93.126,279.45L92.399,279.698L91.95,280.203L88.836,280.889L88.224,280.255L88.012,279.648L88.161,279.225L88.047,278.693L87.611,278.724L87.365,278.526L86.853,278.804L86.622,278.574L86.163,278.936L85.843,278.911L85.297,278.926L84.86,278.89L84.636,278.557L84.152,278.851L83.785,278.607L83.437,278.414L83.176,278.321L82.75,278.096L82.375,278.256L81.94,278.26L81.662,278.084L81.397,277.954L80.791,277.801L80.24,277.79L79.74,277.77L79.36,277.794L79.02,277.783L78.483,277.702L78.195,277.855L77.694,277.708L77.5,277.679L77.281,277.63L76.993,277.514L76.398,277.582L76.211,277.802L75.756,277.826L75.265,277.572L74.778,277.85L74.128,277.678L73.663,277.909L73.119,277.904L72.515,278.004L71.93,278.205L71.411,278.023L70.702,277.5L69.952,277.525L69.511,277.513L69.161,277.374L68.534,277.494L68.044,277.386L67.789,277.571L67.444,277.697L67.199,277.95L66.784,278.152L66.508,278.272L66.185,278.433L65.569,278.481L65.32,278.706L65.067,278.886L64.779,279.104L64.224,279.383L63.521,279.566L63.142,279.51L62.607,279.641L62.215,279.767L61.455,279.808L60.753,279.659L60.332,279.476L59.719,279.247L59.299,278.469L58.862,278.052L58.423,277.711L56.621,269.382L56.678,260.373L57.185,258.188L57.545,257.834L58.112,257.444L58.158,256.999L58,256.085L57.571,255.796L57.237,255.224L57.212,254.711L57.152,254.168L58.159,162.146L58.675,163.108L59.346,162.705L59.717,162.327L60.636,162.112L61.554,162.795L62.252,162.768L61.892,164.008L62.257,164.569L62.786,164.788L63.408,165.253L63.961,165.956L64.586,165.448L64.358,164.947L65.135,164.685L65.507,164.79L66.003,165.347L66.959,165.465L67.889,164.481L69.851,154.667L72.004,142.933L73.73,133.082L74.588,128.356L75.089,125.564L76.305,117.809L76.624,116.278L77.002,115.59L76.928,113.75L76.921,112.586L77.269,111.687L76.81,110.263L76.77,109.516L76.179,108.852L75.659,108.354L75.105,107.938L74.325,106.596L74.099,105.775L73.604,105.053L73.793,104.439L74.153,103.777L74.218,102.86L74,101.975L73.667,101.251L73.133,100.741L72.695,100.36L72.059,100.126L71.277,99.505L70.933,99.161L70.392,98.904L69.472,98.284L68.655,98.13L68.084,97.522L67.464,96.776L66.646,95.953L66.441,94.339L66.373,91.274L67.233,83.204L70.009,63.656L70.981,63.41L71.916,63.07L72.919,63.19L73.838,62.732L74.689,62.273L75.696,62.653L76.1,62.77L76.96,62.927L82.222,63.255L97.861,62.784L97.292,62.496L96.703,62.17L96.375,61.108L97.09,59.636L97.733,59.119L98.556,59.109L99.144,60.038L100.74,61.115L102.108,61.278L102.463,60.457L103.325,59.937L103.969,59.147L105.985,58.366L107.208,58.364L108.294,56.724L109.715,55.459L110.779,54.617L111.938,56.651L112.097,57.725Z M112.148,58.263L112.675,60.276L113.26,61.017L114.702,61.17L115.945,63.915L116.271,65.606L116.419,68.146L116.152,70.992L120.043,71.721L131.714,79.701L174.195,228.284L173.616,229.603L172.439,231.164L171.791,233.079L169.884,232.616L169.053,233.391L169.112,235.171L169.031,236.842L168.695,237.616L168.213,238.015L167.84,238.837L166.917,239.59L165.68,240.688L165.516,242.025L165.171,243.824L162.849,243.654L160.601,244.102L158.859,244.126L157.833,244.776L156.279,244.324L154.868,244.299L152.855,245.27L152.39,247.11L152.525,247.997L152.364,248.856L151.521,249.471L150.979,250.384L150.528,251.065L149.735,251.474L148.781,252.03L148.359,251.137L147.772,249.773L146.37,249.245L144.806,250.257L143.823,250.126L143.702,251.528L143.332,252.449L142.497,252.114L140.607,251.821L139.837,252.769L138.789,253.924L137.969,254.481L137.404,253.534L136.81,253.204L135.274,251.933L133.879,251.325L132.376,251.464L130.647,251.785L129.616,251.664L128.878,251.739L127.58,251.433L127.332,253.46L125.425,255.47L124.204,255.834L122.253,257.39L120.891,258.389L88.557,244.497L57.463,229.112L22.404,221.112L3.266,212.465L4.119,211.363L4.4,210.619L4.107,209.759L4.152,209.148L4.621,208.307L4.895,207.781L6.268,206.119L7.213,205.779L7.992,205.025L8.675,204.832L9.391,204.599L10.245,204.121L10.962,203.616L12.266,203.498L12.904,203.147L13.264,203.129L13.39,202.789L13.859,202.467L14.299,201.882L14.608,201.242L14.832,200.508L14.366,199.861L14.216,199.313L13.918,198.63L13.521,197.916L13.227,197.522L12.841,196.493L12.474,195.471L12.687,194.427L12.987,193.841L13.423,193.424L13.523,192.531L13.806,191.899L14.121,191.259L14.693,190.823L15.057,190.402L15.946,189.327L16.506,188.905L16.791,188.419L17.039,187.808L17.181,187.284L17.391,186.374L17.432,185.763L17.429,184.477L17.672,183.993L18.001,183.116L18.294,182.623L18.646,181.922L18.949,181.28L18.91,180.2L18.613,179.623L19.276,179.172L20.076,178.598L20.689,178.321L21.134,177.912L21.726,177.675L22.563,177.599L23.274,176.908L23.767,176.412L24.593,175.959L24.937,175.836L25.377,175.871L25.787,175.231L26.08,175.143L26.434,174.609L27.014,174.146L27.248,173.411L28.043,173.078L28.782,173.26L29.338,172.961L30.246,172.636L30.783,172.129L31.802,171.642L32.438,170.818L33.175,170.44L33.626,170.309L34.404,169.994L34.668,169.429L34.778,168.959L35.225,168.815L35.708,168.666L36.449,168.212L37.338,168.142L37.845,167.978L38.586,168.339L39.225,168.228L39.778,167.797L40.84,168.15L41.545,167.729L41.784,167.648L42.223,167.259L42.969,167.56L43.769,167.032L44.477,167.114L45.145,167.212L45.733,167.119L46.105,166.362L46.639,166.318L47.144,166.786L47.624,166.632L48.205,166.567L48.932,166.266L49.522,166.317L50.2,166.323L50.69,165.872L51.38,166.119L51.859,165.406L52.412,164.695L52.933,164.059L53.177,163.477L54.098,162.597L55.051,162.945L55.768,162.995L56.133,162.29L56.612,162.202L57.156,162.869Z M383.804,24.918L383.896,25.791L384.6,26.457L385.503,26.876L385.56,27.77L385.481,28.811L385.437,29.49L385.34,30.461L385.666,33.539L385.524,34.178L385.555,35.77L385.921,36.798L386.219,37.634L386.424,38.804L386.29,39.505L386.684,41.247L387.098,42.458L387.448,43.414L387.84,45.232L388.46,45.735L388.852,46.779L389.42,47.934L389.601,49.043L389.344,50.275L389.738,50.379L390.503,50.557L390.826,51.223L390.953,52.39L391.181,53.167L391.478,53.975L391.701,54.818L392.192,56.164L395.384,55.324L396.279,55.542L396.695,55.959L397.352,56.884L397.767,57.543L398.069,58.377L398.518,59.226L400.41,61.961L401.914,62.267L405.125,63.891L405.328,64.628L405.508,65.905L405.756,67.399L405.717,68.357L405.572,69.479L405.272,70.435L405.496,71.984L405.125,73.114L404.66,73.701L404.691,75.708L404.089,76.294L402.983,78.013L402.711,78.301L402.787,78.667L402.532,79.043L402.127,79.496L396.084,82.818L394.337,87.264L388.197,91.145L386.921,92.368L385.119,93.972L381.887,96.47L379.932,99.524L377.25,102.911L375.165,107.929L373.762,111.593L371.288,111.48L370.615,111.94L370.26,111.893L368.977,112.468L368.177,112.698L367.309,111.51L364.438,111.204L363.119,110.074L362.975,108.681L363.289,107.361L362.377,106.397L361.038,106.595L361.597,104.992L361.427,103.5L360.062,102.214L358.648,101.164L358.581,99.41L358.248,97.353L355.827,95.113L354.372,94.825L353.53,91.926L352.794,90.702L352.337,89.778L350.954,87.374L350.527,85.559L350.477,83.634L350.736,82.324L350.912,80.766L349.808,79.371L348.756,78.676L347.188,77.412L346.19,75.778L345.9,74.79L345.52,73.27L346.486,72.932L345.97,71.504L344.022,71.752L343.747,70.438L342.224,69.625L341.243,69.135L340.29,68.934L339.483,68.721L338.893,68.89L338.276,68.734L337.692,68.154L336.62,67.535L336.031,67.067L335.076,67.423L334.557,66.324L334.141,65.21L333.748,64.779L333.172,65.08L332.274,64.217L331.917,63.886L331.626,63.542L331.194,63.321L330.842,63.078L330.032,62.743L329.242,62.798L328.317,62.907L327.83,63.003L326.778,62.49L325.973,62.469L324.962,62.656L323.827,62.36L323.939,61.471L323.54,60.575L323.669,59.433L323.078,58.643L322.71,57.707L322.806,56.814L323.036,56.178L323.216,55.828L323.012,54.717L322.864,53.858L322.469,52.666L323.869,50.824L325.245,53.257L336.561,54.774L375.201,24.815L375.944,24.359L376.166,23.595L376.689,22.243L376.951,20.878L377.134,19.776L377.357,18.745L378.136,17.708L380.412,19.472L382.068,21.213L382.983,22.384L383.413,23.227L383.659,24.118Z"

export default function NetworkMapPage() {
  const [players,   setPlayers]   = useState<any[]>([])
  const [summary,   setSummary]   = useState({ total: 0, online: 0, idle: 0, offline: 0 })
  const [loading,   setLoading]   = useState(true)
  const [filter,    setFilter]    = useState("Todos")
  const [selCity,   setSelCity]   = useState<string | null>(null)
  const [selPlayer, setSelPlayer] = useState<any | null>(null)

  const load = async () => {
    try {
      const res = await fetch("/api/admin/network-map", { cache: "no-store" })
      if (!res.ok) return
      const data = await res.json()
      setPlayers(data.players ?? [])
      setSummary(data.summary ?? {})
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load(); const t = setInterval(load, 30_000); return () => clearInterval(t) }, [])

  const byCity  = groupByCity(players)
  const cities  = Object.keys(CITY_POS)

  const filteredPlayers = filter === "Todos" ? players : players.filter(p => p.status === filter)
  const cityPlayers     = selCity ? (byCity[selCity] ?? []) : []
  const displayPlayers  = selCity
    ? (filter === "Todos" ? cityPlayers : cityPlayers.filter(p => p.status === filter))
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
          <button onClick={load} style={{ background: "transparent", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "5px 12px", color: TEXT2, fontSize: 12, cursor: "pointer" }}>↻</button>
        </div>
      </nav>

      {/* KPI BAR */}
      <div style={{ padding: "8px 1.5rem", borderBottom: `1px solid ${BORDER}`, display: "flex", gap: 8, flexWrap: "wrap" }}>
        {[
          { id: "Todos",   label: `${summary.total} Total`,    color: BLUE  },
          { id: "online",  label: `${summary.online} Online`,  color: GREEN },
          { id: "idle",    label: `${summary.idle} Inativo`,   color: AMBER },
          { id: "offline", label: `${summary.offline} Offline`,color: RED   },
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

            {/* Dots das cidades com dados reais */}
            {cities.map(cityName => {
              const pos      = CITY_POS[cityName]
              const cPlayers = byCity[cityName] ?? []
              const total    = cPlayers.length
              const st       = cityStatus(cPlayers)
              const color    = STATUS_COLOR[st] ?? MUTED
              const isSelected = selCity === cityName
              const r        = isSelected ? 22 : Math.max(14, Math.min(20, 10 + total * 2))
              if (total === 0) return null
              return (
                <g key={cityName} style={{ cursor: "pointer" }} onClick={() => { setSelCity(selCity === cityName ? null : cityName); setSelPlayer(null) }}>
                  {isSelected && <circle cx={pos.svgX} cy={pos.svgY} r={r + 9} fill={`${color}12`}/>}
                  <circle cx={pos.svgX} cy={pos.svgY} r={r} fill={`${color}22`} stroke={color} strokeWidth={isSelected ? 2.5 : 1.5}/>
                  <text x={pos.svgX} y={pos.svgY + 5} textAnchor="middle" fill={color} fontSize={isSelected ? 13 : 11} fontWeight="800">{total}</text>
                  {(isSelected || cityName === "Brasília") && (
                    <text x={pos.svgX} y={pos.svgY + r + 13} textAnchor="middle" fill={TEXT2} fontSize={9}>{cityName}</text>
                  )}
                </g>
              )
            })}

            {/* Legenda */}
            {[[GREEN,"Online"],[AMBER,"Inativo"],[RED,"Offline"]].map(([c, l], i) => (
              <g key={l as string} transform={`translate(16, ${622 + i * 16})`}>
                <circle cx={5} cy={5} r={4} fill={c as string} opacity={0.8}/>
                <text x={14} y={9} fill={TEXT2} fontSize={10}>{l as string}</text>
              </g>
            ))}
          </svg>
        </div>

        {/* SIDEBAR */}
        <div style={{ display: "flex", flexDirection: "column", overflow: "hidden", background: SURFACE }}>

          {/* Detalhe player selecionado */}
          {selPlayer && (
            <div style={{ padding: "14px 18px", borderBottom: `1px solid ${BORDER}`, background: "#0A0F1E" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, maxWidth: 230 }}>{selPlayer.name}</div>
                <button onClick={() => setSelPlayer(null)} style={{ background: "none", border: "none", color: MUTED, fontSize: 18, cursor: "pointer", lineHeight: 1 }}>×</button>
              </div>
              <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
                <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: `${STATUS_COLOR[selPlayer.status] ?? MUTED}22`, color: STATUS_COLOR[selPlayer.status] ?? MUTED, border: `1px solid ${STATUS_COLOR[selPlayer.status] ?? MUTED}44` }}>
                  ● {selPlayer.status}
                </span>
                {selPlayer.device_type && (
                  <span style={{ fontSize: 11, color: TEXT2, background: "rgba(255,255,255,0.06)", padding: "2px 8px", borderRadius: 20 }}>{selPlayer.device_type}</span>
                )}
              </div>
              {[
                { label: "Localização", value: selPlayer.location },
                { label: "Cliente",     value: selPlayer.client_name ?? "—" },
                { label: "Último ping", value: timeSince(selPlayer.last_ping) },
                { label: "Plataforma",  value: selPlayer.platform ?? "—" },
              ].map(row => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "4px 0", borderBottom: `1px solid rgba(255,255,255,0.04)` }}>
                  <span style={{ color: TEXT2 }}>{row.label}</span>
                  <span style={{ color: TEXT, fontWeight: 500, maxWidth: 165, textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.value}</span>
                </div>
              ))}
              {selPlayer.client_code && (
                <a href={`/dashboard/local/${selPlayer.client_code}`} target="_blank" rel="noreferrer" style={{ display: "block", marginTop: 10, background: BLUE, color: "#fff", borderRadius: 8, padding: "7px", textAlign: "center", fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
                  Abrir Dashboard →
                </a>
              )}
            </div>
          )}

          {/* Header */}
          <div style={{ padding: "12px 18px", borderBottom: `1px solid ${BORDER}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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
                {displayPlayers.length} tela{displayPlayers.length !== 1 ? "s" : ""}{filter !== "Todos" ? ` · ${filter}` : ""}
              </div>
            )}
          </div>

          {/* Lista */}
          <div style={{ flex: 1, overflow: "auto" }}>
            {displayPlayers.length === 0 && !loading && (
              <div style={{ padding: "40px 18px", textAlign: "center", color: MUTED, fontSize: 13 }}>Nenhuma tela encontrada.</div>
            )}
            {displayPlayers.map(p => {
              const color = STATUS_COLOR[p.status] ?? MUTED
              return (
                <button key={p.id} onClick={() => setSelPlayer(selPlayer?.id === p.id ? null : p)} style={{
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "10px 18px", borderBottom: `1px solid rgba(255,255,255,0.04)`,
                  background: selPlayer?.id === p.id ? `${BLUE}12` : "none",
                  border: "none", cursor: "pointer",
                  borderLeft: `3px solid ${selPlayer?.id === p.id ? BLUE : "transparent"}`,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: color, flexShrink: 0 }}/>
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontSize: 12, fontWeight: 500, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 190 }}>{p.name}</div>
                      <div style={{ fontSize: 10, color: MUTED, marginTop: 1 }}>{timeSince(p.last_ping)}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 20, background: `${color}15`, color, flexShrink: 0 }}>{p.status}</span>
                </button>
              )
            })}
          </div>

          {/* Footer */}
          <div style={{ padding: "12px 18px", borderTop: `1px solid ${BORDER}` }}>
            <Link href="/noc" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: BLUE, color: "#fff", borderRadius: 10, padding: "10px", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
              🌐 Abrir Network Center →
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
