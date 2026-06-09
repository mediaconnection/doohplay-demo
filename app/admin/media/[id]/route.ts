import { getPool } from "@/lib/db"
import { NextRequest } from "next/server"

export const dynamic = "force-dynamic"

async function sendWhatsApp(phone: string, message: string) {
  try {
    await fetch("https://evo.doohplay.com.br/message/sendText/doohplay", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": "q8nC1RGZczvlT7T5figPsLUJTsnsXjtI",
      },
      body: JSON.stringify({
        number: phone.replace(/\D/g, ""),
        text: message,
      }),
    })
  } catch (err) {
    console.error("[media PATCH] WhatsApp error:", err)
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const pool = getPool()

  try {
    const body = await req.json()
    const { status, reason, secret } = body

    if (secret !== process.env.ADMIN_SECRET) {
      return Response.json({ error: "unauthorized" }, { status: 401 })
    }

    if (!["approved", "rejected"].includes(status)) {
      return Response.json({ error: "status deve ser approved ou rejected" }, { status: 400 })
    }

    // Atualiza status da mídia
    const mediaRes = await pool.query(
      `UPDATE "CampaignMedia" SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    )

    if (mediaRes.rows.length === 0) {
      return Response.json({ error: "Mídia não encontrada" }, { status: 404 })
    }

    const media = mediaRes.rows[0]

    // Busca dados do anunciante para notificar
    const advRes = await pool.query(
      `SELECT a.name, a.phone, a.code, c.name AS campaign_name
       FROM "Campaign" c
       JOIN "Advertiser" a ON a.code = c."advertiserCode"
       WHERE c.id = $1`,
      [media.campaignId]
    )

    if (advRes.rows.length > 0) {
      const adv = advRes.rows[0]
      const firstName = adv.name.split(" ")[0]
      const portalLink = `https://doohplay.com.br/anunciante/${adv.code}`

      const message = status === "approved"
        ? `✅ Olá ${firstName}! Sua mídia *${media.name}* foi *aprovada* e já está ativa na campanha *${adv.campaign_name}*.\n\nAcesse seu portal para acompanhar: ${portalLink}`
        : `⚠️ Olá ${firstName}! Sua mídia *${media.name}* foi *rejeitada*.\n\n*Motivo:* ${reason ?? "Não informado"}\n\nEnvie uma nova versão em: ${portalLink}`

      if (adv.phone) {
        await sendWhatsApp(adv.phone, message)
      }
    }

    return Response.json({ ok: true, media: mediaRes.rows[0] })
  } catch (err) {
    console.error("[media PATCH]", err)
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
