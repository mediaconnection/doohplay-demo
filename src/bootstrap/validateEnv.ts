// src/bootstrap/validateEnv.ts
import "dotenv/config";

/**
 * Validação de variáveis de ambiente críticas.
 * ⚠️ Fail-fast
 * ⚠️ Sem log de segredos
 */
export function validateEnv() {
  const requiredEnvs = [
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "NODE_ENV",
  ] as const;

  const missing = requiredEnvs.filter(
    (key) => !process.env[key] || process.env[key]?.trim() === ""
  );

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }

  if (
    process.env.NODE_ENV === "production" &&
    process.env.SUPABASE_SERVICE_ROLE_KEY?.startsWith("anon")
  ) {
    throw new Error(
      "Invalid SUPABASE_SERVICE_ROLE_KEY: anon key used in production"
    );
  }
}