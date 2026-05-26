import { Pool } from "pg"

let _pool: Pool | null = null

export function getPool(): Pool {
  if (!_pool) {
    _pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    })
    _pool.on("error", (err) => console.error("[DB] pool error:", err.message))
  }
  return _pool
}

// Proxy com .bind() — garante que o `this` correto é preservado nos métodos
export const pool = new Proxy({} as Pool, {
  get(_, prop) {
    const client = getPool()
    const value = client[prop as keyof Pool]
    return typeof value === "function" ? (value as Function).bind(client) : value
  },
})

// Alias para compatibilidade com imports existentes: import { db } from "@/lib/db"
export const db = pool