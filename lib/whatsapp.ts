// lib/whatsapp.ts
// Centraliza o envio de WhatsApp via Evolution API. Extraído de
// app/api/webhooks/asaas/route.ts (Fase 14) pra reaproveitar no fluxo de
// login de cliente sem duplicar a mesma função em dois arquivos.
const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL!
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY!
const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE!

export async function sendWhatsApp(phone: string, message: string) {
  try {
    await fetch(`${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "apikey": EVOLUTION_API_KEY },
      body: JSON.stringify({ number: `55${phone.replace(/\D/g, "")}`, text: message }),
    })
    return true
  } catch (err) {
    console.error("[whatsapp] erro ao enviar:", err)
    return false
  }
}
