"use client"

import { useState } from "react"
import Link from "next/link"

const BG = "#080C18", SURFACE = "#0F1629", BORDER = "rgba(255,255,255,0.07)"
const TEXT = "#F1F5F9", TEXT2 = "#94A3B8", MUTED = "#475569"
const BLUE = "#3B82F6", GREEN = "#10B981", AMBER = "#F59E0B", RED = "#EF4444"

const CITIES = [
  { name: "São Paulo",      telas: 412, total: 430, camp: 47, sla: 98,  trust: 97.3, status: "Online",   x: 44, y: 76 },
  { name: "Rio de Janeiro", telas: 218, total: 224, camp: 28, sla: 97,  trust: 96.8, status: "Online",   x: 49, y: 72 },
  { name: "Belo Horizonte", telas: 142, total: 156, camp: 19, sla: 91,  trust: 94.1, status: "Warning",  x: 47, y: 67 },
  { name: "Brasília",       telas: 89,  total: 97,  camp: 12, sla: 96,  trust: 95.2, status: "Online",   x: 43, y: 58 },
  { name: "Curitiba",       telas: 98,  total: 102, camp: 11, sla: 96,  trust: 96.1, status: "Online",   x: 42, y: 82 },
  { name: "Porto Alegre",   telas: 76,  total: 78,  camp: 9,  sla: 99,  trust: 98.2, status: "Verified", x: 40, y: 88 },
  { name: "Salvador",       telas: 88,  total: 94,  camp: 10, sla: 94,  trust: 93.7, status: "Online",   x: 62, y: 55 },
  { name: "Recife",         telas: 54,  total: 64,  camp: 6,  sla: 84,  trust: 89.4, status: "Warning",  x: 72, y: 44 },
  { name: "Fortaleza",      telas: 32,  total: 41,  camp: 4,  sla: 78,  trust: 85.1, status: "Critical", x: 68, y: 33 },
  { name: "Manaus",         telas: 8,   total: 10,  camp: 1,  sla: 92,  trust: 91.2, status: "Offline",  x: 22, y: 30 },
]

const SC: Record<string,string> = { Online: GREEN, Verified: BLUE, Warning: AMBER, Critical: RED, Offline: "#64748B" }
const FILTERS = ["Todos","Online","Verified","Warning","Offline","Critical"]

export default function NetworkMapPage() {
  const [sel, setSel] = useState(CITIES[0])
  const [filt, setFilt] = useState("Todos")
  const shown = filt === "Todos" ? CITIES : CITIES.filter(c => c.status === filt)
  const counts = { online: CITIES.filter(c=>c.status==="Online"||c.status==="Verified").length, verified: CITIES.filter(c=>c.status==="Verified").length, warning: CITIES.filter(c=>c.status==="Warning").length, critical: CITIES.filter(c=>c.status==="Critical").length, offline: CITIES.filter(c=>c.status==="Offline").length }

  return (
    <main style={{ minHeight:"100vh", background:BG, color:TEXT, fontFamily:"'Inter',system-ui,sans-serif", display:"flex", flexDirection:"column" }}>
      <nav style={{ background:"rgba(8,12,24,0.95)", backdropFilter:"blur(12px)", borderBottom:`1px solid ${BORDER}`, padding:"0 1.5rem", height:52, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:10 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <Link href="/" style={{ display:"flex", alignItems:"center", gap:8, textDecoration:"none" }}>
            <div style={{ width:26, height:26, background:"linear-gradient(135deg,#3B82F6,#6366F1)", borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            </div>
            <span style={{ fontSize:14, fontWeight:800, color:TEXT }}>DOOH<span style={{color:BLUE}}>PLAY</span></span>
          </Link>
          <span style={{color:MUTED}}>/</span>
          <span style={{ fontSize:13, color:TEXT2 }}>Network Map</span>
          <span style={{ fontSize:12, color:GREEN, fontWeight:600 }}>● 1.247 telas · 10 cidades · Tempo real</span>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <span style={{ background:"rgba(16,185,129,0.15)", border:"1px solid rgba(16,185,129,0.3)", color:GREEN, fontSize:11, fontWeight:700, padding:"4px 12px", borderRadius:20 }}>⚡ LIVE</span>
          {counts.critical > 0 && <span style={{ background:"rgba(239,68,68,0.15)", border:"1px solid rgba(239,68,68,0.3)", color:RED, fontSize:11, fontWeight:600, padding:"4px 10px", borderRadius:20 }}>{counts.critical} crítico</span>}
        </div>
      </nav>

      <div style={{ padding:"0.75rem 1.5rem", borderBottom:`1px solid ${BORDER}`, display:"flex", gap:8 }}>
        {[[`${counts.online} Online`,GREEN],[`${counts.verified} Verified`,BLUE],[`${counts.warning} Warning`,AMBER],[`${counts.critical} Critical`,RED],[`${counts.offline} Offline`,MUTED]].map(([l,c]) => (
          <span key={l as string} style={{ display:"flex", alignItems:"center", gap:5, fontSize:12, color:c as string, background:`${c}12`, border:`1px solid ${c}30`, padding:"4px 12px", borderRadius:20, fontWeight:500 }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:c as string, display:"inline-block" }}/>{l}
          </span>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", flex:1, overflow:"hidden" }}>
        {/* MAP */}
        <div style={{ position:"relative", background:"#080D1A", borderRight:`1px solid ${BORDER}`, overflow:"hidden", minHeight:500 }}>
          {/* Brazil map via background image */}
          <div style={{
            position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
            backgroundImage: `url("https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Brazil_location_map.svg/500px-Brazil_location_map.svg.png")`,
            backgroundSize: "65%",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "52% 48%",
            opacity: 0.18,
            filter: "invert(1) sepia(1) saturate(2) hue-rotate(180deg) brightness(1.2)",
          }} />
          {CITIES.map(city => (
            <button key={city.name} onClick={() => setSel(city)} style={{ position:"absolute", left:`${city.x}%`, top:`${city.y}%`, transform:"translate(-50%,-50%)", background:"none", border:"none", cursor:"pointer", padding:0, zIndex:2 }}>
              <div style={{ width:sel.name===city.name?42:32, height:sel.name===city.name?42:32, borderRadius:"50%", background:`${SC[city.status]}18`, border:`2px solid ${SC[city.status]}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:800, color:SC[city.status], transition:"all 0.2s", boxShadow:sel.name===city.name?`0 0 0 5px ${SC[city.status]}20`:"none" }}>{city.telas}</div>
              {(city.name==="São Paulo"||city.name==="Brasília"||sel.name===city.name) && <div style={{ fontSize:9, color:TEXT2, textAlign:"center", marginTop:2, whiteSpace:"nowrap" }}>{city.name}</div>}
            </button>
          ))}
          <div style={{ position:"absolute", bottom:16, left:16, display:"flex", gap:14 }}>
            {[["Online",GREEN],["Verified",BLUE],["Warning",AMBER],["Offline","#64748B"]].map(([l,c]) => (
              <span key={l} style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:TEXT2 }}>
                <span style={{ width:7, height:7, borderRadius:"50%", background:c, display:"inline-block" }}/>{l}
              </span>
            ))}
          </div>
        </div>

        {/* SIDEBAR */}
        <div style={{ display:"flex", flexDirection:"column", overflow:"hidden", background:SURFACE }}>
          <div style={{ padding:"1.25rem 1.5rem", borderBottom:`1px solid ${BORDER}` }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
              <div>
                <div style={{ fontSize:15, fontWeight:700 }}>{sel.name}</div>
                <div style={{ fontSize:11, color:TEXT2, marginTop:1 }}>{sel.telas}/{sel.total} telas online</div>
              </div>
              <span style={{ fontSize:11, fontWeight:600, padding:"3px 10px", borderRadius:20, background:`${SC[sel.status]}15`, color:SC[sel.status], border:`1px solid ${SC[sel.status]}30` }}>{sel.status}</span>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              {[{l:"Campanhas",v:sel.camp},{l:"Trust Score",v:sel.trust,c:GREEN},{l:"SLA",v:`${sel.sla}%`,c:BLUE},{l:"Telas",v:`${sel.telas}/${sel.total}`}].map(s => (
                <div key={s.l} style={{ background:"rgba(255,255,255,0.04)", borderRadius:8, padding:"10px 12px" }}>
                  <div style={{ fontSize:10, color:MUTED, marginBottom:3 }}>{s.l}</div>
                  <div style={{ fontSize:15, fontWeight:700, color:(s as any).c||TEXT }}>{s.v}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding:"8px 1.5rem 6px", borderBottom:`1px solid ${BORDER}` }}>
            <div style={{ fontSize:11, fontWeight:700, color:MUTED, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:6 }}>Todas as cidades</div>
            <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
              {FILTERS.map(f => (
                <button key={f} onClick={() => setFilt(f)} style={{ fontSize:10, fontWeight:600, padding:"3px 9px", borderRadius:20, cursor:"pointer", border:"none", background:filt===f?BLUE:"rgba(255,255,255,0.06)", color:filt===f?"#fff":TEXT2 }}>{f}</button>
              ))}
            </div>
          </div>

          <div style={{ flex:1, overflow:"auto" }}>
            {shown.map(city => (
              <button key={city.name} onClick={() => setSel(city)} style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"11px 1.5rem", borderBottom:`1px solid rgba(255,255,255,0.04)`, background:sel.name===city.name?"rgba(59,130,246,0.08)":"none", border:"none", cursor:"pointer", borderLeft:`3px solid ${sel.name===city.name?BLUE:"transparent"}` }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ width:7, height:7, borderRadius:"50%", background:SC[city.status], display:"inline-block", flexShrink:0 }}/>
                  <div style={{ textAlign:"left" }}>
                    <div style={{ fontSize:13, fontWeight:500, color:TEXT }}>{city.name}</div>
                    <div style={{ fontSize:10, color:MUTED }}>{city.telas}/{city.total} telas · {city.camp} campanhas</div>
                  </div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <span style={{ fontSize:10, fontWeight:600, padding:"2px 7px", borderRadius:20, background:`${SC[city.status]}15`, color:SC[city.status] }}>{city.status}</span>
                  <div style={{ fontSize:10, color:MUTED, marginTop:1 }}>{city.sla}%</div>
                </div>
              </button>
            ))}
          </div>

          <div style={{ padding:"1rem 1.5rem", borderTop:`1px solid ${BORDER}` }}>
            <Link href="/noc" style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6, background:BLUE, color:"#fff", borderRadius:10, padding:"10px", fontSize:13, fontWeight:600, textDecoration:"none" }}>
              🌐 Abrir Network Center →
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
