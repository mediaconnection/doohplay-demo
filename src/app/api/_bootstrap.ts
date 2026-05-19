// src/app/api/_bootstrap.ts
// 🔐 Bootstrap server-side do DOOHPLAY
// Executa validações críticas antes de qualquer handler rodar

import { validateEnv } from "@/bootstrap/validateEnv";

// Validação imediata (fail-fast)
validateEnv();

/**
 * ⚠️ IMPORTANTE
 * Este arquivo deve ser importado NO TOPO
 * de qualquer route.ts, job ou worker server-side.
 *
 * Exemplo:
 *   import "@/app/api/_bootstrap";
 *
 * Isso garante que:
 * - variáveis de ambiente críticas existem
 * - SERVICE ROLE está correto
 * - o sistema não roda em estado inseguro
 *
 * ❌ Nunca importar este arquivo em código client-side
 */