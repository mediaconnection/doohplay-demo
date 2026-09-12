# packages/shared-infra

Workspace package (`@doohplay/shared-infra`) para infraestrutura
genuinamente compartilhada entre `app/` (produto comercial) e
`packages/proof-engine` (motor de prova) — não é código exclusivo de
nenhum dos dois fronts. Preparação de baixo risco para uma eventual
Etapa 3 física do `DOOHPLAY_Plano_Separacao_Fronts.docx`, plano técnico
completo em `STATUS_PROJETO.md` ("Plano — extração de infraestrutura
compartilhada", 2026-09-12).

## Status (2026-09-12)

**Fase 1 (Redis) concluída.** `lib/redis.ts` (o client oficial, `ioredis`
com singleton lazy via `getRedis()`/`Proxy`) virou reexport puro de
`redis.ts` deste pacote — os ~14 consumidores reais confirmados por
caminho exato (`lib/cache.ts`, `lib/queue/{dlq,eventQueue,eventWorker}.ts`,
`lib/queue/workers/*` ×6, `packages/proof-engine/proof/queue/*` ×3,
`workers/eventProcessor.ts`, mais `app/api/trust/summary/route.ts` via
import dinâmico, mais `lib/queue.ts` via import relativo `./redis`)
continuam funcionando sem nenhuma mudança de import. Validado sem
regressão: `tsc --noEmit` (47, idêntico), `vitest` (81/81), `next build`
(compila).

**Fases 2 (`lib/db.ts`) e 3 (`lib/supabaseServer.ts`) não iniciadas** —
pausa deliberada: os dois arquivos são consumidos por rotas comerciais
reais (`app/api/client/*`, `admin/*`, `advertiser/*`, `studio/*`,
`finance/*`), zona de "parar e confirmar" do `CLAUDE.md`. Mesmo sendo
reexport puro (sem mudança de comportamento), exige confirmação explícita
do usuário antes de tocar, não decidida sozinho.

## Achado colateral, fora de escopo, não investigado

`@/lib/redis` não são 2 clients Redis como o `CLAUDE.md` documentava —
são **5 arquivos físicos distintos**: o oficial (`lib/redis.ts`, agora
aqui), `lib/queue/connection.ts` (zero consumidor real encontrado,
candidato a código morto, não confirmado com o mesmo rigor), `lib/queue/redis.ts`
(raiz, host hardcoded `127.0.0.1:6379`, 1 consumidor via `import()` em
`scripts/run-block-finalization.ts` — que tem um bug pré-existente
desestruturando `{ connection }` de um módulo que só exporta `redis`),
`src/lib/queue/redis.ts` (host hardcoded, usado só por
`src/lib/queue/alertQueue.ts` → `scripts/testAlertQueue.ts`, script
manual) e `src/lib/queue/connection.ts` (byte-idêntico ao da raiz, usado
por `src/lib/queue/{eventWorker,eventQueue}.ts` cujo status real em
produção não está confirmado). **Achado mais sério**: `render.yaml` não
declara nenhum processo worker separado — o status real do BullMQ em
produção (`npm run worker`) está incerto. Não investigado a fundo aqui,
fica registrado para investigação dedicada antes de decidir o que fazer
com os outros 4 arquivos.
