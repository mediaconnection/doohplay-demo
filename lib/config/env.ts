function getEnv(name: string): string | undefined {
  const value = process.env[name]
  if (typeof value !== "string") return undefined

  const trimmed = value.trim()
  return trimmed.length ? trimmed : undefined
}

function getRequiredEnv(name: string): string {
  const value = getEnv(name)
  if (!value) {
    throw new Error(`${name}_NOT_CONFIGURED`)
  }
  return value
}

function getNumberEnv(name: string, fallback: number): number {
  const raw = getEnv(name)
  if (!raw) return fallback

  const value = Number(raw)
  return Number.isFinite(value) ? value : fallback
}

function getBooleanEnv(name: string, fallback: boolean): boolean {
  const raw = getEnv(name)
  if (!raw) return fallback

  const normalized = raw.toLowerCase()
  if (["1", "true", "yes", "on"].includes(normalized)) return true
  if (["0", "false", "no", "off"].includes(normalized)) return false

  return fallback
}

export const appEnv = {
  nodeEnv: getEnv("NODE_ENV") ?? "development",
  baseUrl: getEnv("NEXT_PUBLIC_BASE_URL") ?? "http://localhost:3000"
}

export const dbEnv = {
  databaseUrl: getRequiredEnv("DATABASE_URL"),
  host: getEnv("PGHOST") ?? "127.0.0.1",
  port: getNumberEnv("PGPORT", 5432),
  user: getEnv("PGUSER") ?? "postgres",
  password: getEnv("PGPASSWORD") ?? "",
  database: getEnv("PGDATABASE") ?? "postgres",
  supabaseDbUrl: getEnv("SUPABASE_DB_URL")
}

export const supabaseEnv = {
  url: getEnv("SUPABASE_URL"),
  serviceRoleKey: getEnv("SUPABASE_SERVICE_ROLE_KEY"),
  publicUrl: getEnv("NEXT_PUBLIC_SUPABASE_URL"),
  anonKey: getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
}

export const tsaEnv = {
  url: getRequiredEnv("TSA_URL"),
  timeoutMs: getNumberEnv("TSA_TIMEOUT_MS", 5000)
}

export const verifyEnv = {
  engineTimeoutMs: getNumberEnv("VERIFY_ENGINE_TIMEOUT_MS", 4000),
  rateLimitMax: getNumberEnv("RATE_LIMIT_MAX", 30),
  rateLimitWindowMs: getNumberEnv("RATE_LIMIT_WINDOW_MS", 60_000),
  verifyRateLimit: getNumberEnv("VERIFY_RATE_LIMIT", 30)
}

export const blockchainEnv = {
  rpc: getEnv("BLOCKCHAIN_RPC") ?? "https://polygon-rpc.com",
  rpcFallback1: getEnv("BLOCKCHAIN_RPC_FALLBACK_1") ?? "https://rpc.ankr.com/polygon",
  rpcFallback2: getEnv("BLOCKCHAIN_RPC_FALLBACK_2") ?? "https://polygon.llamarpc.com",
  minConfirmations: getNumberEnv("BLOCKCHAIN_MIN_CONFIRMATIONS", 3),
  privateKey: getEnv("BLOCKCHAIN_PRIVATE_KEY"),
  explorerBaseUrl: getEnv("BLOCKCHAIN_EXPLORER") ?? "https://polygonscan.com/tx/",
  anchorContractAddress: getEnv("ANCHOR_CONTRACT_ADDRESS")
}

export const signingEnv = {
  mode: (getEnv("SIGNING_MODE") ?? "pem").toLowerCase() as "pem" | "pfx",
  pfxPath: getEnv("CERT_PFX_PATH"),
  pfxPassword: getEnv("CERT_PFX_PASSWORD"),
  privateKeyPem: getEnv("SIGNING_PRIVATE_KEY_PEM")?.replace(/\\n/g, "\n"),
  certificatePem: getEnv("SIGNING_CERTIFICATE_PEM")?.replace(/\\n/g, "\n"),
  certificateChainPem: getEnv("SIGNING_CERTIFICATE_CHAIN_PEM")?.replace(/\\n/g, "\n"),
  debug: getBooleanEnv("DEBUG", false),
  logLevel: getEnv("LOG_LEVEL") ?? "info"
}

export const mapEnv = {
  mapboxToken: getEnv("NEXT_PUBLIC_MAPBOX_TOKEN")
}