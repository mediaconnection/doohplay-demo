// app/api/advertiser/screens/route.ts
// Lista as telas REAIS disponíveis para um anunciante escolher ao criar uma
// campanha — substitui a lista fake de shoppings (sp-01, rj-01 etc.) que
// existia antes só como dado de demonstração.
import { getPool } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  const pool = getPool()
  try {
    const { rows } = await pool.query(`
      SELECT code AS id, name, city, business_type
      FROM studio_clients
      WHERE active = true
      ORDER BY city ASC NULLS LAST, name ASC
    `)
    return Response.json({ screens: rows })
  } catch (err) {
    console.error("[advertiser/screens GET]", err)
    return Response.json({ screens: [], error: String(err) }, { status: 500 })
  }
}
