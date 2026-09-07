import { describe, it, expect } from "vitest"
import fs from "fs"
import path from "path"

// Regra do CLAUDE.md: "appendEventToLedger é o único ponto sancionado
// pra escrever em event_chain -- nunca INSERT INTO event_chain inline
// numa rota ou reimplementado". Este teste varre o filesystem de
// verdade (não confia em memória/documentação) procurando esse
// literal fora dos arquivos permitidos abaixo.
const REPO_ROOT = path.resolve(__dirname, "../../../../../")

// Repo inteiro, não só app/lib/@proof-engine -- achado real ao rodar
// este teste pela 1ª vez (07/09/2026): implementações divergentes de
// escrita em event_chain também existem fora dessas 3 árvores
// (services/, workers/, src/), então restringir o escopo escondia
// risco real em vez de expô-lo.
const SCAN_DIRS = [""]

// Caminhos relativos (posix, com "/") que têm permissão explícita de
// conter o literal. Qualquer outro arquivo que bater é uma violação.
const ALLOWLIST = new Set<string>([
  // Escritor canônico -- o próprio ponto sancionado.
  "packages/proof-engine/domain/ledger/appendEvent.ts",
  // Achado real (07/09/2026, ver arquiteto-agent): implementação
  // paralela com fórmula de hash divergente da canônica, DORMENTE --
  // sem produtor real desde 2026-09-03 (comentário datado em
  // lib/queue/workers/eventWorker.ts). Não apagada nem corrigida
  // aqui de propósito -- decisão de apagar o worker morto ou
  // reescrever pra delegar em appendEventToLedger é humana, fora do
  // escopo deste teste. Ver packages/proof-engine/domain/ledger/README.md.
  "packages/proof-engine/legacy/ledger/writeEvent.ts",
  // Confirmado morto no próprio arquivo (@deprecated, investigação de
  // 2026-08-26): builda blocos a partir de `evidence`, tabela que parou
  // de receber dado real em 2026-06-01. Pipeline real de produção é
  // runProofChainAggregator() (lib/proof/aggregator/proofChainAggregator.ts).
  "packages/proof-engine/proof/ledger/buildBlock.ts",
  // Confirmado morto em lib/alerts/engine/README.md (investigação de
  // 2026-09-06, Fase 0 da extração do proof-engine): zero consumidor real
  // de todo o pipeline evaluatePolicies→...→auditAlert. Pipeline real de
  // alertas em produção é lib/domain/alerts/*.
  "lib/alerts/engine/auditAlert.ts",
  // Mesma duplicata documentada em src/lib/alerts/engine/README.md.
  "src/lib/alerts/engine/auditAlert.ts",
  // Achado real ao rodar este teste pela 1ª vez (07/09/2026), não
  // documentado antes: appendToChain() usa uma 3ª fórmula/formato
  // divergente (colunas event_hash/previous_hash/payload, sem
  // previous_event_hash) e só é chamada por workers/eventProcessor.ts::startWorker(),
  // que por sua vez NUNCA é chamado por worker.ts (o entrypoint real,
  // ver npm run worker) nem por nenhum outro arquivo -- confirmado via
  // grep, zero consumidor de startWorker(). Código inalcançável, mas
  // não apagado aqui (decisão humana, fora do escopo deste teste).
  "services/proof.ts",
  "workers/eventProcessor.ts",
])

const INSERT_PATTERN = /INSERT\s+INTO\s+event_chain/i

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".next" || entry.name === ".git") continue

    const full = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      walk(full, out)
      continue
    }

    if (!/\.(ts|tsx)$/.test(entry.name)) continue
    // Arquivos de teste não são código de produção -- e os próprios
    // testes deste boundary citam o literal como string de asserção,
    // o que geraria falso positivo se fossem varridos.
    if (/\.test\.(ts|tsx)$/.test(entry.name)) continue

    out.push(full)
  }
  return out
}

describe("boundary: só appendEventToLedger grava em event_chain", () => {
  it("nenhum arquivo fora da allowlist contém INSERT INTO event_chain", () => {
    const violations: string[] = []

    for (const dir of SCAN_DIRS) {
      const absDir = path.join(REPO_ROOT, dir)
      if (!fs.existsSync(absDir)) continue

      for (const file of walk(absDir)) {
        const relPath = path.relative(REPO_ROOT, file).split(path.sep).join("/")
        if (ALLOWLIST.has(relPath)) continue

        const content = fs.readFileSync(file, "utf8")
        if (INSERT_PATTERN.test(content)) {
          violations.push(relPath)
        }
      }
    }

    expect(violations).toEqual([])
  })

  it("a allowlist em si ainda existe em disco (evita apontar pra arquivo fantasma)", () => {
    for (const relPath of ALLOWLIST) {
      const absPath = path.join(REPO_ROOT, ...relPath.split("/"))
      expect(fs.existsSync(absPath), `${relPath} não existe mais -- remova da allowlist`).toBe(true)
    }
  })
})
