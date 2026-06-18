export const dynamic = "force-dynamic"

export function GET() {
  return new Response(`SEU_HTML_AQUI`, {
    headers: { "Content-Type": "text/html; charset=utf-8" }
  })
}
