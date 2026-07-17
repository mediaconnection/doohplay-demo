// lib/whatsapp.ts
// Centraliza o envio de WhatsApp via Evolution API. Extraído de
// app/api/webhooks/asaas/route.ts (Fase 14) pra reaproveitar no fluxo de
// login de cliente sem duplicar a mesma função em dois arquivos.
const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL!
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY!
const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE!

// Achado em produção (17/07/2026): este fetch não tinha timeout. Quando a
// Evolution API ficava lenta ou instável, a chamada ficava pendurada até o
// Render encerrar a conexão por conta própria, devolvendo uma página de
// erro em vez de JSON — e isso aparecia pro usuário como "Erro de conexão"
// no login por WhatsApp (/dashboard/local/[code]), sem nenhum log de erro
// nosso, porque a requisição nunca chegava a terminar de um jeito que
// caísse no catch. Timeout curto aqui garante que sempre desistimos rápido
// e de forma controlada, em vez de deixar o chamador travado.
const SEND_TIMEOUT_MS = 8000

export async function sendWhatsApp(phone: string, message: string) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), SEND_TIMEOUT_MS)
  try {
    await fetch(`${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "apikey": EVOLUTION_API_KEY },
      body: JSON.stringify({ number: `55${phone.replace(/\D/g, "")}`, text: message }),
      signal: controller.signal,
    })
    return true
  } catch (err) {
    console.error("[whatsapp] erro ao enviar:", err)
    return false
  } finally {
    clearTimeout(timeout)
  }
}
