// app/api/admin/media/[id]/route.ts
import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { getPool } from "@/lib/db"

export const dynamic = "force-dynamic"

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "")
  return digits.startsWith("55") ? digits : "55" + digits
}

async function sendWhatsApp(phone: string, message: string) {
  const url      = process.env.EVOLUTION_API_URL  || "http://2.25.180.53:32768"
  const key      = process.env.EVOLUTION_API_KEY ?? ""
  const instance = process.env.EVOLUTION_INSTANCE || "doohplay"
  const number   = normalizePhone(phone)
  try {
    const res = await fetch(url + "/message/sendText/" + instance, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: key },
      body: JSON.stringify({ number, text: message }),
    })
    console.log("[sendWhatsApp] status:", res.status, "number:", number)
  } catch (err) {
    console.error("[sendWhatsApp] erro:", err)
  }
}

export async function PATCH(req: NextRequest, context: any) {
  const session = await getServerSession()
  const body    = await req.json()

  const isNextAuth = !!session?.user
  const isLegacy   = body.secret && body.secret === process.env.ADMIN_SECRET

  if (!isNextAuth && !isLegacy) {
    return Response.json({ error: "unauthorized" }, { status: 401 })
  }

  const { id } = await context.params
  const { status, reason, tags } = body

  if (!["approved", "rejected"].includes(status)) {
    return Response.json({ error: "status invalido" }, { status: 400 })
  }

  const pool = getPool()

  try {
    // Fase 16 (12/07/2026): tags de brand-safety, opcional. Só atualiza
    // content_tags se o admin de fato mandou uma lista (não sobrescreve
    // com null se o campo não vier na requisição).
    if (Array.isArray(tags)) {
      await pool.query(
        `UPDATE "CampaignMedia" SET status = $1, content_tags = $2 WHERE id = $3`,
        [status, tags.length ? tags : null, id]
      )
    } else {
      await pool.query(
        `UPDATE "CampaignMedia" SET status = $1 WHERE id = $2`,
        [status, id]
      )
    }

    const { rows } = await pool.query(
      `SELECT m.name AS media_name, m.type,
              a.name AS advertiser_name, a.phone AS advertiser_phone,
              c.name AS campaign_name
       FROM "CampaignMedia" m
       JOIN "Campaign" c ON c.id = m."campaignId"
       JOIN "Advertiser" a ON a.code = c."advertiserCode"
       WHERE m.id = $1 LIMIT 1`,
      [id]
    )

    const media = rows[0]
    console.log("[admin/media PATCH] media:", media?.media_name, "phone:", media?.advertiser_phone, "status:", status)

    if (media && media.advertiser_phone) {
      if (status === "approved") {
        await sendWhatsApp(media.advertiser_phone, [
          "✅ *Mídia aprovada!*",
          "",
          "Olá, *" + media.advertiser_name + "*!",
          "Sua mídia *" + media.media_name + "* foi aprovada e já está sendo exibida nas telas.",
          "",
          "Campanha: " + media.campaign_name,
          "",
          "_DOOHPLAY — Trust Infrastructure for DOOH Advertising_",
        ].join("\n"))
      } else {
        await sendWhatsApp(media.advertiser_phone, [
          "❌ *Mídia rejeitada — DOOHPLAY*",
          "",
          "Olá, *" + media.advertiser_name + "*!",
          "Sua mídia *" + media.media_name + "* foi rejeitada.",
          reason ? "Motivo: " + reason : "",
          "",
          "Envie uma nova mídia pelo portal: https://doohplay.com.br/anunciante",
          "",
          "_DOOHPLAY — Trust Infrastructure for DOOH Advertising_",
        ].filter(Boolean).join("\n"))
      }
    } else {
      console.warn("[admin/media PATCH] sem phone — media:", media)
    }

    return Response.json({ ok: true, status })
  } catch (err) {
    console.error("[admin/media PATCH]", err)
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
