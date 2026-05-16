import { Pool } from "pg"

type PgPoolInstance = InstanceType<typeof Pool>

type PgQueryResultRow = Record<string, unknown>

type PgQueryResult<T extends PgQueryResultRow = PgQueryResultRow> = {
  rows: T[]
  rowCount: number | null
}

type PgPoolConfig = ConstructorParameters<typeof Pool>[0]

declare global {
  // eslint-disable-next-line no-var
  var __dbPool: PgPoolInstance | undefined
  // eslint-disable-next-line no-var
  var __dbPoolConnectionString: string | undefined
}

function maskConnectionString(value: string): string {
  try {
    const url = new URL(value)
    const protocol = url.protocol || "postgresql:"
    const user = url.username || "unknown-user"
    const host = url.hostname || "unknown-host"
    const port = url.port || "default"
    const database = url.pathname.replace(/^\//, "") || "unknown-db"

    return `${protocol}//${user}:****@${host}:${port}/${database}`
  } catch {
    return "INVALID_DATABASE_URL"
  }
}

function getDatabaseUrl(): string {
  const value = process.env.DATABASE_URL?.trim()

  if (!value) {
    throw new Error("DATABASE_URL is not defined")
  }

  return value
}

function getPoolConfig(connectionString: string): PgPoolConfig {
  const isProduction = process.env.NODE_ENV === "production"

  console.log("DATABASE_URL_ACTIVE =", maskConnectionString(connectionString))

  return {
    connectionString,
    ssl: isProduction ? { rejectUnauthorized: false } : false,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000
  }
}

function createPool(connectionString: string): PgPoolInstance {
  const instance = new Pool(getPoolConfig(connectionString))

  instance.on("error", (error: Error) => {
    console.error("PG_POOL_ERROR", error)
  })

  return instance
}

const activeConnectionString = getDatabaseUrl()

if (
  global.__dbPool &&
  global.__dbPoolConnectionString &&
  global.__dbPoolConnectionString !== activeConnectionString
) {
  console.warn("DATABASE_URL_CHANGED_RECREATING_POOL", {
    from: maskConnectionString(global.__dbPoolConnectionString),
    to: maskConnectionString(activeConnectionString)
  })

  global.__dbPool.end().catch((error: Error) => {
    console.error("PG_POOL_CLOSE_ERROR", error)
  })

  global.__dbPool = undefined
  global.__dbPoolConnectionString = undefined
}

export const pool: PgPoolInstance =
  global.__dbPool ?? createPool(activeConnectionString)

if (!global.__dbPool) {
  global.__dbPool = pool
  global.__dbPoolConnectionString = activeConnectionString
  console.log("🧱 DB Pool initialized")
}

export const db = {
  async query<T extends PgQueryResultRow = PgQueryResultRow>(
    text: string,
    params?: unknown[]
  ): Promise<PgQueryResult<T>> {
    const result = await pool.query(text, params)

    return {
      rows: result.rows as T[],
      rowCount: result.rowCount
    }
  }
}