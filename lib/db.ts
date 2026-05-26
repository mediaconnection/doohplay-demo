// @ts-nocheck
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

export const pool = new Proxy({} as Pool, {
  get(_, prop) {
    return (getPool() as any)[prop]
  }
})