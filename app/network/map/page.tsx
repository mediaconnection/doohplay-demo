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
          <svg viewBox="0 0 800 900" style={{ width:"100%", height:"100%", opacity:0.18, position:"absolute", top:0, left:0 }} fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Brazil mainland */}
            <path d="
              M 340,60 L 370,55 L 400,58 L 430,65 L 460,75 L 490,90 L 510,105 L 525,125
              L 535,148 L 540,170 L 548,188 L 560,200 L 575,208 L 588,218 L 598,232
              L 602,248 L 598,262 L 590,272 L 578,278 L 568,290 L 562,308 L 558,325
              L 555,342 L 552,358 L 548,370 L 540,380 L 528,388 L 515,392 L 502,390
              L 490,385 L 478,388 L 468,395 L 462,408 L 458,422 L 455,438 L 452,454
              L 448,468 L 442,480 L 432,490 L 420,498 L 408,502 L 395,504 L 382,502
              L 370,498 L 358,492 L 348,484 L 340,474 L 332,462 L 325,450 L 318,438
              L 310,426 L 300,416 L 288,408 L 275,402 L 262,398 L 250,398 L 238,400
              L 228,406 L 220,414 L 214,424 L 210,436 L 208,450 L 208,464 L 210,478
              L 215,492 L 222,504 L 230,514 L 238,522 L 244,532 L 248,544 L 250,558
              L 250,572 L 248,585 L 244,596 L 238,605 L 230,612 L 220,616 L 210,618
              L 200,616 L 190,610 L 182,602 L 175,592 L 170,580 L 168,568 L 168,556
              L 170,544 L 174,532 L 175,520 L 172,508 L 166,498 L 158,490 L 148,484
              L 138,480 L 128,478 L 118,478 L 108,480 L 100,485 L 94,492 L 90,501
              L 88,512 L 88,523 L 90,534 L 94,543 L 100,550 L 108,555 L 116,558
              L 122,562 L 126,568 L 128,576 L 128,584 L 126,592 L 122,598 L 116,602
              L 108,604 L 100,602 L 93,598 L 88,592 L 85,584 L 84,574 L 82,564
              L 78,554 L 72,546 L 64,540 L 55,536 L 46,534 L 38,534 L 30,536
              L 24,540 L 20,546 L 18,554 L 18,562 L 20,570 L 24,577 L 30,582
              L 38,586 L 48,588 L 58,588 L 68,586 L 76,582 L 82,577 L 86,572
              L 90,578 L 96,585 L 104,590 L 113,593 L 123,594 L 132,592 L 140,588
              L 147,595 L 152,604 L 154,614 L 153,624 L 149,633 L 142,640 L 133,644
              L 123,646 L 113,644 L 104,640 L 98,634 L 95,626 L 95,618 L 98,642
              L 104,660 L 112,675 L 122,688 L 134,698 L 148,705 L 163,710 L 178,712
              L 193,712 L 208,710 L 222,705 L 235,698 L 246,689 L 255,678 L 262,665
              L 268,650 L 272,635 L 274,620 L 274,605 L 272,591 L 268,578 L 263,567
              L 258,558 L 255,548 L 255,540 L 258,534 L 263,530 L 270,528 L 278,528
              L 286,530 L 293,534 L 298,540 L 302,548 L 304,557 L 304,567 L 302,577
              L 298,586 L 294,594 L 292,602 L 292,610 L 295,618 L 300,625 L 307,630
              L 315,633 L 323,634 L 331,633 L 338,630 L 344,625 L 348,618 L 350,610
              L 350,602 L 348,594 L 345,587 L 342,580 L 341,573 L 342,567 L 345,563
              L 350,560 L 356,559 L 362,560 L 368,563 L 373,568 L 376,575 L 377,583
              L 376,591 L 373,599 L 369,606 L 367,614 L 367,622 L 369,630 L 373,637
              L 378,643 L 385,648 L 393,651 L 401,652 L 409,651 L 416,648 L 422,643
              L 426,637 L 428,630 L 428,622 L 426,615 L 422,609 L 418,604 L 416,598
              L 416,593 L 418,589 L 422,586 L 427,585 L 433,586 L 438,589 L 442,594
              L 444,600 L 444,607 L 442,614 L 438,620 L 434,626 L 432,633 L 432,641
              L 435,649 L 440,656 L 447,661 L 455,664 L 464,665 L 473,663 L 480,659
              L 486,653 L 489,645 L 490,637 L 488,629 L 484,622 L 479,617 L 474,613
              L 471,608 L 470,602 L 471,597 L 475,593 L 480,591 L 486,591 L 492,593
              L 497,597 L 500,603 L 501,610 L 500,617 L 497,624 L 495,631 L 495,639
              L 498,647 L 503,654 L 510,659 L 518,662 L 527,663 L 536,661 L 543,657
              L 548,651 L 551,643 L 551,635 L 549,627 L 545,620 L 540,615 L 535,611
              L 532,606 L 532,600 L 535,595 L 540,592 L 546,591 L 552,592 L 557,596
              L 560,602 L 561,609 L 559,616 L 555,622 L 551,628 L 549,635 L 550,643
              L 555,651 L 563,657 L 573,661 L 584,663 L 595,661 L 604,657 L 610,650
              L 613,641 L 612,632 L 608,624 L 601,618 L 593,614 L 585,612 L 578,612
              L 572,614 L 568,618 L 567,624 L 568,630 L 570,636 L 570,642 L 568,647
              L 563,651 L 557,652 L 551,650 L 546,645 L 544,638 L 545,631 L 549,625
              L 555,621 L 561,619 L 566,619 L 570,622 L 573,627 L 573,633
              M 340,60 Z
            " stroke="#3B82F6" strokeWidth="1" fill="rgba(59,130,246,0.06)" strokeLinejoin="round"/>
            {/* State borders approximation */}
            <path d="M 340,200 L 420,195 M 300,300 L 380,310 M 250,400 L 340,390 M 200,480 L 280,470" stroke="#3B82F6" strokeWidth="0.4" opacity="0.4"/>
          </svg>
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
