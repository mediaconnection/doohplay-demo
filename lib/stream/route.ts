import { proofStream } from "@/lib/stream/streamEmitter"

export async function GET(req: Request) {

  const { readable, writable } = new TransformStream()

  const writer = writable.getWriter()

  proofStream.on("proof-event", async (event) => {

    await writer.write(
      `data: ${JSON.stringify(event)}\n\n`
    )

  })

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive"
    }
  })

}