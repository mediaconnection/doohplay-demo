// lib/network/countActivePartners.ts
//
// Etapa 2, Fase 5 (2026-09-08) — Clube de Telas v2. Função única de
// contagem do limite de 30 parceiros, usada tanto por
// app/api/admin/network-partnerships/suggest/route.ts quanto pela nova
// checagem em app/api/client/network-partnerships/[code]/respond/route.ts.
// Existir num lugar só é deliberado — achado do arquiteto-agent no
// planejamento: se cada rota reimplementasse a própria query, um ajuste
// futuro numa delas sem replicar na outra criaria inconsistência sobre
// o que conta como "cheio".
//
// Conta PARCEIROS DISTINTOS (não linhas): no modelo por-peça (Fase 2), o
// mesmo par de clientes pode ter várias linhas `accepted` ao longo do
// tempo (uma por peça aprovada) — contar linhas superestimaria o número
// real de parceiros diferentes.
import type { getPool } from "@/lib/db"

// `Pool` do driver `pg` não resolve como tipo neste projeto fora de
// lib/db.ts (achado ao implementar esta fase — `Cannot use namespace
// 'Pool' as a type`, mesmo com o import correto). Usa o tipo de retorno
// de `getPool()` em vez de importar `Pool` diretamente.
type DbPool = ReturnType<typeof getPool>

export async function countActivePartners(pool: DbPool, clientCode: string): Promise<number> {
  const { rows } = await pool.query<{ count: string }>(
    `
    SELECT count(DISTINCT other_code)::text AS count
    FROM (
      SELECT CASE WHEN requester_code = $1 THEN partner_code ELSE requester_code END AS other_code
      FROM network_partnerships
      WHERE status = 'accepted' AND (requester_code = $1 OR partner_code = $1)
    ) t
    `,
    [clientCode]
  )
  return parseInt(rows[0]?.count ?? "0", 10)
}

// Confirma se `clientCode` já tem `otherCode` como parceiro aceito
// (qualquer peça) — usado pra saber se aceitar um pedido novo cria uma
// relação NOVA (conta pro limite) ou só mais uma peça de um parceiro que
// já existe (não conta de novo).
export async function isAlreadyAcceptedPartner(
  pool: DbPool,
  clientCode: string,
  otherCode: string
): Promise<boolean> {
  const { rows } = await pool.query(
    `
    SELECT 1 FROM network_partnerships
    WHERE status = 'accepted'
      AND ((requester_code = $1 AND partner_code = $2) OR (requester_code = $2 AND partner_code = $1))
    LIMIT 1
    `,
    [clientCode, otherCode]
  )
  return rows.length > 0
}
