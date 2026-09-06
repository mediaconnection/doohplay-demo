export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

import { NextRequest } from "next/server"

export const runtime = "nodejs"

export async function GET(req: NextRequest) {
    const { validateTransaction } = await import("@proof-engine/blockchain/validateTx")

  const { searchParams } = new URL(req.url)

  const txHash = searchParams.get("tx")

  if (!txHash) {
    return new Response("Missing tx", { status: 400 })
  }

  const stream = new ReadableStream({
    async start(controller) {

      let lastConfirmations = -1

      while (true) {
        try {
          const tx = await validateTransaction(txHash)

          if (tx.confirmations !== lastConfirmations) {
            lastConfirmations = tx.confirmations

            controller.enqueue(
              `data: ${JSON.stringify(tx)}\n\n`
            )
          }

          // 🔥 parar quando estabilizar
          if (tx.confirmations >= 12) {
            controller.enqueue(`event: done\ndata: done\n\n`)
            break
          }

        } catch (e) {
          controller.enqueue(
            `event: error\ndata: error\n\n`
          )
        }

        await new Promise(r => setTimeout(r, 3000))
      }

      controller.close()
    }
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive"
    }
  })
}

