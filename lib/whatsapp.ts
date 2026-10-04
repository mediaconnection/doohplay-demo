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

// Resultado do envio, separando falha confirmada de falta de resposta
// (04/10/2026). Quem precisa reagir diferente aos dois casos — o login por
// código, que só descarta o código quando a falha é confirmada — usa esta.
//   "sent"    — a Evolution API aceitou a mensagem (HTTP 2xx)
//   "failed"  — a Evolution API respondeu com erro (ex.: instância
//               desconectada, "Connection Closed"): a mensagem não saiu
//   "unknown" — sem resposta: estourou o timeout ou a conexão caiu no meio.
//               A mensagem pode ter saído e chegar atrasada.
export type WhatsAppSendResult = "sent" | "failed" | "unknown"

export async function sendWhatsAppDetailed(phone: string, message: string): Promise<WhatsAppSendResult> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), SEND_TIMEOUT_MS)
  try {
    // Achado em produção (2026-09-13): telefones já salvos com "55" na
    // frente (ex: "+55 11 95475-1622", formato usado pra LEMEL186) tinham
    // o "55" duplicado aqui, virando um JID inválido na Evolution API
    // ("555511954751622" em vez de "5511954751622") — a mensagem nunca
    // saía, sem erro visível pro cliente (login por WhatsApp simplesmente
    // não chegava). Mesma checagem de idempotência já usada em outras
    // implementações do repo (app/api/auth/otp/send, cron/monthly-report).
    const digits = phone.replace(/\D/g, "")
    const number = digits.startsWith("55") ? digits : `55${digits}`
    const res = await fetch(`${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "apikey": EVOLUTION_API_KEY },
      body: JSON.stringify({ number, text: message }),
      signal: controller.signal,
    })

    // Achado 2026-09-08: antes disso a função retornava true sempre que o
    // fetch não lançava exceção -- mas uma instância desconectada responde
    // com erro HTTP (não derruba a conexão), então uma mensagem que nunca
    // saiu de verdade era reportada como enviada com sucesso.
    if (!res.ok) {
      const body = await res.text().catch(() => "")
      console.error("[whatsapp] Evolution API respondeu erro:", res.status, body.slice(0, 500))
      return "failed"
    }

    return "sent"
  } catch (err) {
    const timedOut = controller.signal.aborted
    console.error(timedOut
      ? `[whatsapp] sem resposta da Evolution API em ${SEND_TIMEOUT_MS}ms (envio não confirmado):`
      : "[whatsapp] erro de rede ao enviar (envio não confirmado):", err)
    return "unknown"
  } finally {
    clearTimeout(timeout)
  }
}

// Versão booleana de sempre, usada pelos demais chamadores (alertas,
// relatórios, cadastro…): true só quando o envio foi confirmado.
export async function sendWhatsApp(phone: string, message: string): Promise<boolean> {
  return (await sendWhatsAppDetailed(phone, message)) === "sent"
}
