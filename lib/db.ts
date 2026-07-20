import { Pool } from "pg"

let _pool: Pool | null = null

export function getPool(): Pool {
  if (!_pool) {
    _pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      // Mesma classe de bug já corrigida no WhatsApp/e-mail (fetch sem timeout):
      // aqui, sem esses limites, uma conexão ou query travada podia prender a
      // requisição indefinidamente até o Render encerrar a conexão sozinho.
      connectionTimeoutMillis: 8000, // tempo máx. esperando uma conexão livre no pool
      query_timeout: 10000,          // timeout do lado do cliente por query
      statement_timeout: 10000,      // timeout do lado do Postgres por statement
      idleTimeoutMillis: 30000,      // fecha conexões ociosas no pool
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