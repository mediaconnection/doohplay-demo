export const dynamic = "force-dynamic"

import Link from "next/link"

const BRAND_BLUE   = "#1B4FD8"
const BRAND_YELLOW = "#F5C300"

const steps = [
  {
    num: 1,
    icon: "📦",
    title: "Conecte o Fire Stick na TV",
    desc: "Encaixe o Fire Stick na entrada HDMI da TV e conecte o cabo USB na tomada ou na própria TV para energia.",
    tip: "Use a entrada HDMI 1 para melhor compatibilidade.",
  },
  {
    num: 2,
    icon: "📶",
    title: "Conecte ao Wi-Fi",
    desc: "Na tela inicial do Fire Stick, vá em Configurações → Rede → Wi-Fi e conecte à internet do estabelecimento.",
    tip: "Use o Wi-Fi 5GHz se disponível para melhor desempenho.",
  },
  {
    num: 3,
    icon: "🌐",
    title: "Abra o navegador Silk",
    desc: "Na tela inicial do Fire Stick, clique em 'Aplicativos' e abra o 'Amazon Silk' (navegador).",
    tip: "Se não encontrar, pesquise 'Silk' na lupa de busca.",
  },
  {
    num: 4,
    icon: "🔗",
    title: "Acesse o endereço do player",
    desc: "No navegador Silk, acesse o endereço abaixo. O player vai carregar automaticamente e começar a exibir os anúncios.",
    tip: "Salve nos favoritos para facilitar o acesso futuro.",
    highlight: true,
  },
  {
    num: 5,
    icon: "🖥",
    title: "Deixe em tela cheia",
    desc: "Pressione qualquer botão do controle remoto para ativar o modo tela cheia. A playlist começará automaticamente.",
    tip: "A tela não vai desligar — o Wake Lock mantém ela ativa.",
  },
  {
    num: 6,
    icon: "✅",
    title: "Pronto! Tela ativa",
    desc: "A tela está funcionando. O sistema envia heartbeat a cada 30 segundos e atualiza a playlist a cada 1 minuto automaticamente.",
    tip: "Você pode gerenciar o conteúdo pelo Studio a qualquer hora.",
  },
]

const faqs = [
  {
    q: "A tela apagou, o que faço?",
    a: "Abra o navegador Silk novamente e acesse o mesmo endereço. Considere desativar o protetor de tela do Fire Stick em Configurações → Vídeo e Áudio.",
  },
  {
    q: "O conteúdo não atualizou",
    a: "A playlist atualiza automaticamente a cada 1 minuto. Se ainda não atualizou, pressione F5 ou feche e reabra o navegador.",
  },
  {
    q: "A internet caiu, o que acontece?",
    a: "O player exibe a última playlist carregada e fica tentando reconectar a cada 5 segundos automaticamente.",
  },
  {
    q: "Como trocar o conteúdo?",
    a: "Acesse doohplay-demo.onrender.com/studio/SEU_CODIGO pelo celular ou computador e publique novos anúncios. A tela atualiza em até 1 minuto.",
  },
  {
    q: "O Fire Stick reiniciou, preciso configurar de novo?",
    a: "Não. O Silk mantém o histórico. Abra o navegador e ele vai lembrar do endereço. Em 2 cliques a tela volta ao ar.",
  },
]

export default function InstallPage({
  searchParams,
}: {
  searchParams: { screen?: string; code?: string }
}) {
  const screenId = searchParams.screen || ""
  const code     = searchParams.code?.toUpperCase() || ""
  const playerUrl = screenId
    ? `https://doohplay-demo.onrender.com/player?screen=${screenId}`
    : `https://doohplay-demo.onrender.com/player?screen=SEU_SCREEN_ID`

  return (
    <main style={{ minHeight: "100vh", background: "#f9fafb", fontFamily: "system-ui, sans-serif" }}>

      {/* HEADER */}
      <header style={{ background: BRAND_BLUE, padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ background: BRAND_YELLOW, borderRadius: 8, padding: "4px 12px", fontWeight: 800, fontSize: 18, color: BRAND_BLUE }}>
            DOOHPLAY
          </div>
        </div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>Guia de instalação</div>
      </header>

      {/* HERO */}
      <div style={{ background: `linear-gradient(135deg, ${BRAND_BLUE}, #0F2F8A)`, color: "white", padding: "2.5rem 1.5rem", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📺</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, letterSpacing: "-0.02em" }}>
          Instale sua tela DOOHPLAY
        </h1>
        <p style={{ fontSize: 14, opacity: 0.8, maxWidth: 480, margin: "0 auto" }}>
          Siga os 6 passos abaixo e sua tela estará funcionando em menos de 10 minutos
        </p>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "2rem 1.25rem" }}>

        {/* URL DO PLAYER */}
        {screenId && (
          <div style={{ background: "#fff", border: `2px solid ${BRAND_BLUE}`, borderRadius: 16, padding: "1.5rem", marginBottom: "2rem", textAlign: "center" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: BRAND_BLUE, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
              🔗 URL da sua tela
            </div>
            <div style={{ background: "#f3f4f6", borderRadius: 10, padding: "12px 16px", fontFamily: "monospace", fontSize: 13, color: "#111827", wordBreak: "break-all", marginBottom: 12 }}>
              {playerUrl}
            </div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>
              Cole esse endereço no navegador Silk do Fire Stick
            </div>
          </div>
        )}

        {/* STEPS */}
        <div style={{ marginBottom: "2rem" }}>
          {steps.map((step, i) => (
            <div key={step.num} style={{ display: "flex", gap: 16, marginBottom: 24 }}>
              {/* Line */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{
                  width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
                  background: step.highlight ? BRAND_YELLOW : BRAND_BLUE,
                  color: step.highlight ? BRAND_BLUE : "white",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, fontWeight: 800,
                }}>
                  {step.num}
                </div>
                {i < steps.length - 1 && (
                  <div style={{ width: 2, flex: 1, background: "#e5e7eb", margin: "6px 0" }} />
                )}
              </div>

              {/* Content */}
              <div style={{ flex: 1, paddingBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 20 }}>{step.icon}</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>{step.title}</span>
                </div>
                <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.6, marginBottom: 8 }}>
                  {step.desc}
                </p>
                {step.highlight && screenId && (
                  <div style={{ background: "#EFF6FF", border: `1px solid ${BRAND_BLUE}`, borderRadius: 10, padding: "10px 14px", fontFamily: "monospace", fontSize: 12, color: BRAND_BLUE, wordBreak: "break-all", marginBottom: 8 }}>
                    {playerUrl}
                  </div>
                )}
                <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#92400E" }}>
                  💡 {step.tip}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* LINKS RÁPIDOS */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: "1.5rem", marginBottom: "2rem" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 16 }}>Links úteis</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { icon: "🎨", label: "Acessar o Studio", desc: "Gerencie o conteúdo da tela", href: code ? `/studio/${code}` : "/studio" },
              { icon: "📊", label: "Ver certificado", desc: "Comprovante de exibições", href: code ? `/api/certificate?code=${code}` : "/api/certificate" },
              { icon: "🔐", label: "Portal de verificação", desc: "Página pública do estabelecimento", href: code ? `/${code.toLowerCase()}` : "/" },
            ].map(link => (
              <a key={link.label} href={link.href} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "#f9fafb", borderRadius: 10, textDecoration: "none", border: "1px solid #e5e7eb" }}>
                <span style={{ fontSize: 20 }}>{link.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{link.label}</div>
                  <div style={{ fontSize: 12, color: "#9ca3af" }}>{link.desc}</div>
                </div>
                <span style={{ marginLeft: "auto", color: "#9ca3af", fontSize: 16 }}>→</span>
              </a>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 16 }}>❓ Dúvidas frequentes</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {faqs.map((faq, i) => (
              <div key={i} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "14px 16px" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", marginBottom: 6 }}>
                  {faq.q}
                </div>
                <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6 }}>
                  {faq.a}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SUPORTE */}
        <div style={{ background: BRAND_BLUE, borderRadius: 16, padding: "1.5rem", textAlign: "center", color: "white" }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>💬</div>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Precisa de ajuda?</div>
          <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 16 }}>
            Nossa equipe está disponível pelo WhatsApp para te ajudar na instalação.
          </div>
          <a href="https://wa.me/5511962050987?text=Olá!%20Preciso%20de%20ajuda%20com%20a%20instalação%20do%20DOOHPLAY" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#25D366", color: "white", borderRadius: 10, padding: "12px 24px", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
            📱 Falar no WhatsApp
          </a>
        </div>

        <div style={{ textAlign: "center", marginTop: 24, fontSize: 11, color: "#9ca3af" }}>
          DOOHPLAY — Trust Infrastructure for DOOH Advertising
        </div>
      </div>
    </main>
  )
}
