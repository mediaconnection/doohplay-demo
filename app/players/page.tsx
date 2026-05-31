export const dynamic = "force-dynamic"
import Link from "next/link"
import { pool } from "@/lib/db"

export default async function PlayersPage() {
  let players: any[] = []
  try {
    const result = await pool.query(
      "SELECT id, name, player_code, platform, location, last_ping, is_active FROM players ORDER BY created_at DESC LIMIT 50"
    )
    players = result.rows
  } catch {}
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-2xl font-bold mb-6">Players</h1>
      <div className="grid gap-4">
        {players.map((p: any) => (
          <Link key={p.id} href={"/players/" + p.id} className="block border rounded-lg p-4 hover:bg-gray-50">
            <div className="font-semibold">{p.name || p.player_code || p.id}</div>
            <div className="text-sm text-gray-500">{p.platform} {p.location}</div>
          </Link>
        ))}
        {players.length === 0 && <p className="text-gray-500">Nenhum player encontrado.</p>}
      </div>
    </div>
  )
}
