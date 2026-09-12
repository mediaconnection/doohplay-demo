// Implementação real vive em packages/shared-infra/db.ts (workspace
// package @doohplay/shared-infra) -- este arquivo é reexport puro, único
// caminho sancionado para import (@/lib/db e caminhos relativos pra cá,
// incluindo a ponte src/lib/db.ts, continuam funcionando sem mudança).
export { pool, getPool, db } from "@doohplay/shared-infra/db"