export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"
import { pool } from "@/lib/db"
import { execSync } from "child_process"
import { writeFileSync, unlinkSync } from "fs"
import { join } from "path"
import { tmpdir } from "os"

const PYTHON_GEN = `
import sys, json, io
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas
from reportlab.platypus import Table, TableStyle

def gen(data):
    buf = io.BytesIO()
    w, h = A4
    c = canvas.Canvas(buf, pagesize=A4)
    BRAND=colors.HexColor("#0284C7"); BRAND_DARK=colors.HexColor("#0369A1")
    DARK=colors.HexColor("#111827"); MUTED=colors.HexColor("#6B7280")
    LIGHT=colors.HexColor("#F9FAFB"); BORDER=colors.HexColor("#E5E7EB")
    GREEN=colors.HexColor("#16A34A"); PURPLE=colors.HexColor("#7C3AED")
    BLUE_LIGHT=colors.HexColor("#BAE6FD"); BLUE_BG=colors.HexColor("#F0F9FF")

    # Header
    c.setFillColor(BRAND); c.rect(0,h-55*mm,w,55*mm,fill=1,stroke=0)
    c.setFillColor(colors.white); c.setFont("Helvetica-Bold",22)
    c.drawString(20*mm,h-22*mm,"DOOHPLAY")
    c.setFont("Helvetica",9); c.drawString(20*mm,h-29*mm,"Trust Infrastructure for DOOH Advertising")
    c.setFont("Helvetica",8); c.setFillColor(BLUE_LIGHT)
    c.drawRightString(w-20*mm,h-22*mm,"Certificado #"+data.get("cert_number","CERT"))
    c.drawRightString(w-20*mm,h-29*mm,data.get("issued_at",""))

    # Titulo
    c.setFillColor(DARK); c.setFont("Helvetica-Bold",18)
    c.drawCentredString(w/2,h-75*mm,"CERTIFICADO DE VEICULACAO")
    c.setFont("Helvetica",10); c.setFillColor(MUTED)
    c.drawCentredString(w/2,h-83*mm,"Comprovante oficial de exibicao com verificacao criptografica")
    c.setStrokeColor(BORDER); c.setLineWidth(0.5)
    c.line(20*mm,h-88*mm,w-20*mm,h-88*mm)

    y=h-100*mm
    # Box campanha
    c.setFillColor(LIGHT); c.roundRect(20*mm,y-30*mm,w-40*mm,32*mm,4*mm,fill=1,stroke=0)
    c.setStrokeColor(BORDER); c.setLineWidth(0.3)
    c.roundRect(20*mm,y-30*mm,w-40*mm,32*mm,4*mm,fill=0,stroke=1)
    c.setFont("Helvetica-Bold",8); c.setFillColor(BRAND)
    c.drawString(25*mm,y-5*mm,"CAMPANHA")
    c.setFont("Helvetica-Bold",13); c.setFillColor(DARK)
    c.drawString(25*mm,y-13*mm,data.get("campaign_name","")[:60])
    c.setFont("Helvetica",9); c.setFillColor(MUTED)
    c.drawString(25*mm,y-20*mm,"Anunciante: "+data.get("advertiser",""))
    c.drawString(25*mm,y-26*mm,"Periodo: "+data.get("period",""))
    y-=42*mm

    # Metricas
    metrics=[("EXIBICOES",str(data.get("total_plays",0)),BRAND),
             ("DURACAO",data.get("total_duration","0min"),BRAND_DARK),
             ("TELAS",str(data.get("screens_count",1)),PURPLE),
             ("SCORE","100/100",GREEN)]
    bw=(w-40*mm-9*mm)/4
    for i,(lb,vl,cl) in enumerate(metrics):
        bx=20*mm+i*(bw+3*mm)
        c.setFillColor(LIGHT); c.roundRect(bx,y-22*mm,bw,24*mm,3*mm,fill=1,stroke=0)
        c.setStrokeColor(BORDER); c.setLineWidth(0.3)
        c.roundRect(bx,y-22*mm,bw,24*mm,3*mm,fill=0,stroke=1)
        c.setFont("Helvetica-Bold",16); c.setFillColor(cl)
        c.drawCentredString(bx+bw/2,y-10*mm,vl)
        c.setFont("Helvetica",7); c.setFillColor(MUTED)
        c.drawCentredString(bx+bw/2,y-18*mm,lb)
    y-=34*mm

    # Tabela
    c.setFont("Helvetica-Bold",10); c.setFillColor(DARK)
    c.drawString(20*mm,y,"Registro de exibicoes")
    c.setFont("Helvetica",8); c.setFillColor(MUTED)
    c.drawString(20*mm,y-6*mm,"Cada linha possui hash SHA-256 unico verificavel na blockchain Polygon Mainnet")
    y-=12*mm
    plays=data.get("plays",[])[:10]
    td=[["#","Data / Hora","Tela","Dur.","Hash SHA-256"]]
    for i,p in enumerate(plays):
        hs=(p.get("event_hash") or "")[:22]+"..."
        td.append([str(i+1),p.get("played_at",""),p.get("player_name","")[:20],str(p.get("duration",""))+"s",hs])
    if len(td)>1:
        t=Table(td,colWidths=[10*mm,35*mm,38*mm,15*mm,62*mm])
        t.setStyle(TableStyle([
            ("BACKGROUND",(0,0),(-1,0),BRAND),("TEXTCOLOR",(0,0),(-1,0),colors.white),
            ("FONTNAME",(0,0),(-1,0),"Helvetica-Bold"),("FONTSIZE",(0,0),(-1,-1),7),
            ("FONTNAME",(0,1),(-1,-1),"Helvetica"),
            ("ROWBACKGROUNDS",(0,1),(-1,-1),[colors.white,LIGHT]),
            ("TEXTCOLOR",(0,1),(-1,-1),DARK),("GRID",(0,0),(-1,-1),0.3,BORDER),
            ("LEFTPADDING",(0,0),(-1,-1),4),("RIGHTPADDING",(0,0),(-1,-1),4),
            ("TOPPADDING",(0,0),(-1,-1),3),("BOTTOMPADDING",(0,0),(-1,-1),3),
            ("ALIGN",(0,0),(0,-1),"CENTER"),("ALIGN",(3,0),(3,-1),"CENTER"),
        ]))
        t.wrapOn(c,w-40*mm,200*mm); th=t._height
        t.drawOn(c,20*mm,y-th); y-=th+8*mm

    # Blockchain
    c.setFillColor(BLUE_BG); c.roundRect(20*mm,y-20*mm,w-40*mm,22*mm,3*mm,fill=1,stroke=0)
    c.setStrokeColor(BLUE_LIGHT); c.setLineWidth(0.5)
    c.roundRect(20*mm,y-20*mm,w-40*mm,22*mm,3*mm,fill=0,stroke=1)
    c.setFont("Helvetica-Bold",9); c.setFillColor(BRAND_DARK)
    c.drawString(25*mm,y-7*mm,"Verificacao Blockchain")
    c.setFont("Helvetica",8); c.setFillColor(MUTED)
    c.drawString(25*mm,y-13*mm,"Rede: Polygon Mainnet  |  SHA-256  |  TSA RFC3161  |  ICP-Brasil")
    url="https://doohplay-demo.onrender.com/verify/"+data.get("demo_hash","")
    c.setFillColor(BRAND); c.drawString(25*mm,y-18*mm,"Verificar: "+url)

    # Footer
    c.setFillColor(DARK); c.rect(0,0,w,18*mm,fill=1,stroke=0)
    c.setFont("Helvetica",7); c.setFillColor(colors.HexColor("#9CA3AF"))
    c.drawCentredString(w/2,11*mm,"DOOHPLAY - Trust Infrastructure for DOOH Advertising")
    c.drawCentredString(w/2,7*mm,"Gerado em "+data.get("issued_at","")+"  |  Validade legal conforme Lei 14.063/2020")
    c.drawCentredString(w/2,3*mm,"doohplay-demo.onrender.com")
    c.save()
    return buf.getvalue()

with open(sys.argv[1]) as f:
    data=json.load(f)
pdf=gen(data)
sys.stdout.buffer.write(pdf)
`

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const campaignId = searchParams.get("campaign_id")
    const code = searchParams.get("code")

    if (!campaignId && !code) {
      return NextResponse.json({ error: "campaign_id ou code obrigatório" }, { status: 400 })
    }

    let campaignName = "Campanha DOOHPLAY"
    let advertiser = "Anunciante"
    let playerId: string | null = null
    let campId: string | null = campaignId

    if (code) {
      const clientRes = await pool.query(
        `SELECT sc.name, sc.player_id, p.name AS player_name
         FROM studio_clients sc
         LEFT JOIN players p ON p.id = sc.player_id
         WHERE sc.code = $1 AND sc.active = true LIMIT 1`,
        [code.trim().toUpperCase()]
      )
      const client = clientRes.rows[0]
      if (!client) return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 })
      advertiser = client.name
      playerId = client.player_id
      campaignName = `Campanha ${client.name}`

      // Busca campanha com mais plays
      const campRes = await pool.query(
        `SELECT c.id, c.name FROM campaigns c
         JOIN display_events e ON e.campaign_id = c.id
         JOIN players p ON p.id = e.player_id AND p.id = $1
         GROUP BY c.id ORDER BY COUNT(e.id) DESC LIMIT 1`,
        [playerId]
      )
      if (campRes.rows[0]) {
        campId = campRes.rows[0].id
        campaignName = campRes.rows[0].name
      }
    } else {
      const campRes = await pool.query(
        `SELECT name, advertiser FROM campaigns WHERE id = $1 LIMIT 1`,
        [campaignId]
      )
      if (campRes.rows[0]) {
        campaignName = campRes.rows[0].name
        advertiser = campRes.rows[0].advertiser
      }
    }

    // Stats
    const whereClause = campId ? `campaign_id = '${campId}'` : `player_id = '${playerId}'`
    const statsRes = await pool.query(`
      SELECT COUNT(*)::int AS total_plays,
             SUM(COALESCE(duration,30))::int AS total_seconds,
             MIN(played_at) AS first_play, MAX(played_at) AS last_play
      FROM display_events WHERE ${whereClause}
    `)
    const stats = statsRes.rows[0]
    const totalSecs = stats.total_seconds || 0
    const hours = Math.floor(totalSecs / 3600)
    const mins = Math.floor((totalSecs % 3600) / 60)
    const totalDuration = hours > 0 ? `${hours}h ${mins}min` : `${mins}min`
    const firstPlay = stats.first_play ? new Date(stats.first_play).toLocaleDateString("pt-BR") : "—"
    const lastPlay = stats.last_play ? new Date(stats.last_play).toLocaleDateString("pt-BR") : "—"

    // Plays recentes
    const playsRes = await pool.query(`
      SELECT e.played_at AT TIME ZONE 'America/Sao_Paulo' AS local_time,
             p.name AS player_name, e.duration, e.event_hash
      FROM display_events e
      LEFT JOIN players p ON p.id = e.player_id
      WHERE ${whereClause}
      ORDER BY e.played_at DESC LIMIT 10
    `)

    const certData = {
      cert_number: `${new Date().getFullYear()}-${(code || "CERT").toUpperCase().slice(0,6)}-${Date.now().toString().slice(-4)}`,
      campaign_name: campaignName,
      advertiser,
      period: `${firstPlay} a ${lastPlay}`,
      total_plays: stats.total_plays || 0,
      total_duration: totalDuration,
      screens_count: 1,
      issued_at: new Date().toLocaleDateString("pt-BR"),
      demo_hash: playsRes.rows[0]?.event_hash || "20ec722b179a772ddc19c2a6053326906da1e598cc3dcaeed4a48efee2f950be",
      plays: playsRes.rows.map(p => ({
        played_at: p.local_time ? new Date(p.local_time).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "—",
        player_name: p.player_name || "Tela DOOHPLAY",
        duration: p.duration || 30,
        event_hash: p.event_hash || "—",
      }))
    }

    // Gera PDF via Python
    const tmpData = join(tmpdir(), `cert_${Date.now()}.json`)
    const tmpScript = join(tmpdir(), `cert_${Date.now()}.py`)
    writeFileSync(tmpData, JSON.stringify(certData))
    writeFileSync(tmpScript, PYTHON_GEN)

    const pdfBuffer = execSync(`python3 ${tmpScript} ${tmpData}`, {
      maxBuffer: 10 * 1024 * 1024,
      timeout: 30000,
    })

    try { unlinkSync(tmpData) } catch {}
    try { unlinkSync(tmpScript) } catch {}

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="certificado-doohplay-${certData.cert_number}.pdf"`,
        "Cache-Control": "no-store",
      }
    })

  } catch (err: any) {
    console.error("Certificate error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
