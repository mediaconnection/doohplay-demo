# `event_chain` — escritor canônico e testes de contrato

`appendEventToLedger` (`appendEvent.ts`) é o **único ponto sancionado** pra
escrever em `event_chain` — regra já documentada no `CLAUDE.md`. Fórmula
canônica: `event_hash = sha256(previous_event_hash + hash)`, encadeando
por `previous_event_hash` (nunca recalculado a partir do payload — é por
isso que é seguro trocar a fórmula no meio da cadeia, `verifyChain.ts` só
segue ponteiros).

Consumidores reais confirmados: `app/api/player/event/route.ts` e
`lib/adserver/registerImpression.ts`. Os dois tratam falha do ledger como
melhor esforço — nunca derrubam a gravação real (`display_events`/
`impressions`).

## Testes de contrato (Etapa 2, item 4 do `DOOHPLAY_Plano_Separacao_Fronts.docx`, 2026-09-07)

Planejados pelo `arquiteto-agent`, cobrindo o caminho que já teve um bug
real de divergência de hash (corrigido 2026-09-06, ver `CLAUDE.md`):

- `appendEvent.test.ts` — pina a fórmula canônica (com e sem evento
  anterior).
- `__contracts__/onlyCanonicalWriterTouchesEventChain.test.ts` — varredura
  estática do **repositório inteiro** (não só `app/`/`lib/`/`packages/`)
  procurando `INSERT INTO event_chain` fora da allowlist. É o teste que
  teria pego o bug de 06/09 e o padrão do incidente de 25/06/2026 dentro
  deste boundary.
- `registerImpression.test.ts` / `app/api/player/event/route.test.ts` —
  fixam o payload gravado no ledger e confirmam o comportamento de melhor
  esforço (falha no ledger não derruba a gravação principal).

Todos validados simulando de propósito os 3 bugs reais (fórmula errada,
INSERT direto fora do escritor canônico, chamada removida) e confirmando
vermelho → revertido → verde de novo antes do commit.

## Dívida técnica confirmada, não corrigida aqui (decisão humana)

A varredura do `__contracts__` encontrou **3 implementações mortas**
adicionais que gravam (ou gravariam) em `event_chain` com fórmulas
divergentes da canônica — nenhuma tem consumidor real hoje, todas ficam
na allowlist do teste, documentadas em vez de escondidas:

| Arquivo | Por que está morto | Ativado por |
|---|---|---|
| `legacy/ledger/writeEvent.ts` | Sem produtor real desde 2026-09-03 (ver comentário datado em `lib/queue/workers/eventWorker.ts`) | `lib/queue/workers/eventWorker.ts` (fila `event-queue`, dormente) |
| `proof/ledger/buildBlock.ts` | `@deprecated` desde a própria investigação de 2026-08-26 — lê de `evidence`, tabela sem dado novo desde 2026-06-01 | Nada (`buildBlock` sem importador) |
| `lib/alerts/engine/auditAlert.ts` + `src/lib/alerts/engine/auditAlert.ts` | Pipeline `evaluatePolicies→...→auditAlert` sem consumidor real (ver `lib/alerts/engine/README.md`) | Nada |
| `services/proof.ts` (`appendToChain`) | **Achado ao rodar este teste pela 1ª vez (07/09/2026)**: 3ª fórmula/formato divergente (`event_hash`/`previous_hash`/`payload`, sem `previous_event_hash`). Única chamadora é `workers/eventProcessor.ts::startWorker()`, que por sua vez **nunca é chamada** por `worker.ts` (entrypoint real, `npm run worker`) nem por nenhum outro arquivo — confirmado via grep, zero consumidor | `workers/eventProcessor.ts` (usa `redis.xread` num Stream `events_stream`, mecanismo diferente do BullMQ usado pelo resto do projeto; também sem chamador) |

Nenhum desses foi apagado ou corrigido — decisão de apagar código morto
ou reescrever pra delegar em `appendEventToLedger` é humana. O valor
deste teste é tornar o risco **visível e travado**: se qualquer um desses
workers dormentes for reativado no futuro sem primeiro corrigir a fórmula,
o teste continua vermelho até alguém decidir conscientemente.
