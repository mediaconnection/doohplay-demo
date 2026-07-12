// app/instalar/[code]/page.tsx
import { getPool } from "@/lib/db"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

const APK_URL = "https://doohplay.com.br/downloads/doohplay-player-native.apk"

async function getClient(code: string) {
  const pool = getPool()
  try {
    const { rows } = await pool.query(
      `SELECT name, business_type, city FROM studio_clients WHERE code = $1 AND active = true LIMIT 1`,
      [code.toUpperCase()]
    )
    return rows[0] ?? null
  } catch {
    return null
  }
}

export const metadata = {
  title: "Instalar DOOHPLAY",
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
}

export default async function InstalarPage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = await params
  const client = await getClient(code)

  if (!client) notFound()

  const pageUrl = `https://doohplay.com.br/instalar/${code.toUpperCase()}`

  return (
    <>
      <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: system-ui, -apple-system, sans-serif;
            background: #0F172A;
            color: #F1F5F9;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 24px;
          }
        `}</style>
        <div className="card" style={{ background: "#1E293B", borderRadius: 20, padding: 40, maxWidth: 480, width: "100%", textAlign: "center", border: "1px solid #334155" }}>

          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 32 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg, #3B82F6, #6366F1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <rect x="2" y="3" width="20" height="14" rx="2"/>
                <line x1="8" y1="21" x2="16" y2="21"/>
                <line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
            </div>
            <span style={{ fontSize: 22, fontWeight: 900, color: "#F9FAFB", letterSpacing: -0.5 }}>
              DOOH<span style={{ color: "#3B82F6" }}>PLAY</span>
            </span>
          </div>

          {/* Cliente */}
          <div style={{ fontSize: 13, color: "#64748B", marginBottom: 4 }}>Instalação para</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4, color: "#F1F5F9" }}>{client.name}</h1>
          <div style={{ fontSize: 13, color: "#94A3B8", marginBottom: 20 }}>{client.city}</div>

          {/* Aviso de Wi-Fi — antes de tudo */}
          <div style={{ background: "#0F172A", border: "1px solid #F59E0B66", borderRadius: 12, padding: "14px 16px", marginBottom: 28, textAlign: "left", display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>📶</span>
            <div style={{ fontSize: 13, color: "#FCD34D", lineHeight: 1.5 }}>
              <strong>Antes de tudo:</strong> conecte o Wi-Fi da TV/Fire Stick nas <strong>Configurações do próprio aparelho</strong> (fora desse navegador). Sem isso, o app não vai conseguir baixar nem mostrar conteúdo depois.
            </div>
          </div>

          {/* Código */}
          <div style={{ fontSize: 12, color: "#64748B", marginBottom: 8 }}>Seu código de tela</div>
          <div style={{ display: "inline-block", background: "#0F172A", border: "2px solid #3B82F6", borderRadius: 12, padding: "12px 28px", fontSize: 30, fontWeight: 900, color: "#3B82F6", letterSpacing: 4, marginBottom: 32 }}>
            {code.toUpperCase()}
          </div>

          {/* Passos */}
          <div style={{ textAlign: "left", marginBottom: 28 }}>
            {[
              { n: 1, text: <><strong>Conecte o Wi-Fi</strong> da TV (nas configurações do aparelho, não aqui)</> },
              { n: 2, text: <><strong>Baixe o app</strong> clicando no botão abaixo</> },
              { n: 3, text: <><strong>Abra o arquivo</strong> baixado na sua TV Android e instale</> },
              { n: 4, text: <><strong>Se o app pedir um código</strong>, digite <span style={{ color: "#3B82F6", fontWeight: 700 }}>{code.toUpperCase()}</span>. Se a tela ficar esperando sem pedir nada, chame nosso suporte (WhatsApp abaixo) que finalizamos a configuração remotamente — é rápido.</> },
              { n: 5, text: <><strong>Pronto!</strong> Seu conteúdo vai aparecer automaticamente 🎉</> },
            ].map(({ n, text }) => (
              <div key={n} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "14px 0", borderBottom: n < 5 ? "1px solid #334155" : "none" }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#3B82F6", color: "white", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {n}
                </div>
                <div style={{ fontSize: 14, color: "#CBD5E1", lineHeight: 1.5, paddingTop: 3 }}>{text}</div>
              </div>
            ))}
          </div>

          {/* Botão download */}
          <a
            href={APK_URL}
            style={{ display: "block", width: "100%", padding: 16, background: "linear-gradient(135deg, #3B82F6, #6366F1)", color: "white", fontSize: 16, fontWeight: 700, borderRadius: 12, textDecoration: "none", marginBottom: 12 }}
          >
            ⬇️ Baixar App DOOHPLAY
          </a>

          <div style={{ fontSize: 12, color: "#475569" }}>
            Compatível com Android TV, Fire Stick e Android Box
          </div>

          {/* QR Code */}
          <div style={{ marginTop: 28, paddingTop: 28, borderTop: "1px solid #334155" }}>
            <div style={{ fontSize: 12, color: "#64748B", marginBottom: 14 }}>
              Ou escaneie o QR code com o celular para abrir esta página na TV
            </div>
            <div style={{ width: 160, height: 160, margin: "0 auto", background: "white", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", padding: 8 }}>
              {/* QR code gerado via Google Charts API */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=144x144&data=${encodeURIComponent(pageUrl)}`}
                alt="QR Code"
                width={144}
                height={144}
                style={{ borderRadius: 4 }}
              />
            </div>
          </div>

          <div style={{ marginTop: 20, fontSize: 12, color: "#334155" }}>
            Dúvidas? WhatsApp: (11) 9 6205-0987
          </div>

        </div>
    </>
  )
}
