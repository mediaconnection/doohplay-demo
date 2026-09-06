// scripts/run-aggregator-once.ts
//
// Dispara runProofChainAggregator() manualmente, em loop, sem depender do
// agendamento via Redis (que está falhando por rate-limit do Upstash desde
// pelo menos 2026-07-24 — ver STATUS_PROJETO.md). Processa o backlog de
// eventos pendentes em event_chain em lotes de 500, na mesma ordem
// (ORDER BY created_at ASC) que o agregador real já usa.
//
// TRANSPARÊNCIA DE DUAS DATAS: cada lote processado hoje contém eventos que
// ocorreram de verdade em datas passadas (às vezes meses atrás). Este script
// sempre reporta a data original dos eventos (event_chain.created_at, min/max
// do lote) separada da data de processamento (agora, quando a certificação é
// de fato criada). A tabela `certifications` não tem coluna própria pra isso
// hoje (só created_at/updated_at da linha e tsa_timestamp, que é sempre "agora"
// por definição de TSA) — a data original só é recuperável via join com
// event_chain.event_hash = certifications.content_hash. Fica registrado aqui
// como lacuna de schema pendente, não resolvida por este script.
//
// Uso:
//   npx tsx scripts/run-aggregator-once.ts --dry-run   (so' le, nao grava nada)
//   npx tsx scripts/run-aggregator-once.ts             (roda de verdade)
//
// Requer rodar no ambiente de producao (DATABASE_URL, PRIVATE_PEM,
// BLOCKCHAIN_RPC, PRIVATE_KEY/BLOCKCHAIN_PRIVATE_KEY, POLYGON_CONTRACT_ADDRESS
// reais) — nao funciona a partir de um ambiente local sem essas credenciais.

import { config as loadEnv } from "dotenv"
loadEnv({ path: ".env.local" })

const DRY_RUN = process.argv.includes("--dry-run")
const BATCH_SIZE = 500
const DELAY_BETWEEN_BATCHES_MS = 3000

function fmtDate(d: Date | string | null): string {
  if (!d) return "—"
  return new Date(d).toISOString()
}

async function peekNextBatch(pool: any) {
  const { rows } = await pool.query(
    `
    SELECT min(created_at) AS oldest, max(created_at) AS newest, count(*)::int AS count
    FROM (
      SELECT created_at
      FROM public.event_chain
      WHERE block_id IS NULL AND event_hash IS NOT NULL AND length(event_hash) = 64
        AND event_hash != 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
      ORDER BY created_at ASC
      LIMIT $1
    ) sub
    `,
    [BATCH_SIZE]
  )
  return rows[0] as { oldest: string | null; newest: string | null; count: number }
}

async function totalPending(pool: any): Promise<number> {
  const { rows } = await pool.query(
    `
    SELECT count(*)::int AS total
    FROM public.event_chain
    WHERE block_id IS NULL AND event_hash IS NOT NULL AND length(event_hash) = 64
      AND event_hash != 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
    `
  )
  return rows[0].total as number
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function main() {
  const { pool } = await import("../lib/db")

  const total = await totalPending(pool)
  const batches = Math.ceil(total / BATCH_SIZE)

  console.log(`\n=== run-aggregator-once ${DRY_RUN ? "(DRY-RUN — nenhuma escrita será feita)" : "(MODO REAL — vai gravar e ancorar de verdade)"} ===`)
  console.log(`Total de eventos pendentes: ${total}`)
  console.log(`Lotes estimados (${BATCH_SIZE}/lote): ${batches}\n`)

  if (total === 0) {
    console.log("Nada pendente. Encerrando.")
    await pool.end()
    return
  }

  if (DRY_RUN) {
    // Só inspeciona os primeiros lotes, sem chamar o agregador de verdade.
    let remaining = total
    let batchNum = 0
    const preview = Math.min(batches, 5)

    while (batchNum < preview) {
      const peek = await peekNextBatch(pool)
      batchNum++
      console.log(
        `[dry-run] Lote ${batchNum}: ${peek.count} eventos | ` +
        `data original (min–max): ${fmtDate(peek.oldest)} → ${fmtDate(peek.newest)} | ` +
        `seria processado em: ${fmtDate(new Date())}`
      )
      remaining -= peek.count
      // dry-run não avança o cursor de verdade (block_id continua null),
      // então simulamos só a leitura repetida do mesmo topo pra mostrar
      // a janela de datas real do começo do backlog.
      break
    }

    console.log(`\n[dry-run] Preview de 1 lote mostrado (de ${batches} totais). Nenhuma escrita foi feita.`)
    console.log(`[dry-run] Para rodar de verdade: npx tsx scripts/run-aggregator-once.ts`)
    await pool.end()
    return
  }

  // ─── MODO REAL ──────────────────────────────────────────────────────────
  const { runProofChainAggregator } = await import(
    "../packages/proof-engine/proof/aggregator/proofChainAggregator"
  )

  let iteration = 0
  let totalProcessed = 0

  while (true) {
    iteration++

    const peek = await peekNextBatch(pool)
    if (peek.count === 0) {
      console.log(`\nNenhum evento pendente restante. Total processado nesta sessão: ${totalProcessed}.`)
      break
    }

    console.log(
      `\n[iteração ${iteration}] Processando ${peek.count} eventos | ` +
      `data original (min–max): ${fmtDate(peek.oldest)} → ${fmtDate(peek.newest)} | ` +
      `processando em: ${fmtDate(new Date())}`
    )

    const result = await runProofChainAggregator()

    if (result.skipped) {
      console.log(`[iteração ${iteration}] Nada a fazer (skipped). Encerrando.`)
      break
    }

    totalProcessed += result.events_processed
    console.log(
      `[iteração ${iteration}] OK — block_id=${result.block_id} merkle_root=${result.merkle_root} ` +
      `tx_hash=${result.tx_hash ?? "(anchor falhou/pendente)"} tsa_ok=${result.tsa_ok} ` +
      `eventos_processados=${result.events_processed} total_acumulado=${totalProcessed}`
    )

    await sleep(DELAY_BETWEEN_BATCHES_MS)
  }

  await pool.end()
}

main().catch((err) => {
  console.error("❌ ERRO FATAL:", err)
  process.exitCode = 1
})
