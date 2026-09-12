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

**Fase 2 (`lib/db.ts`) concluída, com confirmação explícita do usuário
antes de tocar** (zona de "parar e confirmar" do `CLAUDE.md` — `@/lib/db`
é consumido por rotas comerciais reais). `lib/db.ts` (o `pg.Pool`
singleton, com timeouts já documentados contra a classe de bug de
conexão travada) virou reexport puro de `db.ts` deste pacote. Consumidores
reconferidos por caminho exato antes de mexer: 256 estáticos + 58
dinâmicos via `@/lib/db`, mais a ponte `src/lib/db.ts` → `scripts/alertWorker.ts`
— nenhum precisou mudar. Validado sem regressão: `tsc --noEmit` (47,
idêntico — os 5 erros pré-existentes de `Pool`/`err: any` só mudaram de
arquivo, acompanhando o código), `vitest` (81/81), `next build` (compila
em toda a árvore, incluindo as rotas comerciais).

**Fase 3 (`lib/supabaseServer.ts`) concluída, com confirmação explícita
do usuário antes de tocar.** `lib/supabaseServer.ts` (client Supabase
admin/service-role, `createClient` + singleton lazy via
`getSupabaseAdmin()`/`Proxy`, validação eager de env vars no topo do
módulo) virou reexport puro de `supabaseServer.ts` deste pacote.
Consumidores reconferidos por caminho exato: 28 estáticos + 2 dinâmicos
via `@/lib/supabaseServer`, mais a ponte `lib/supabase.ts` (da
consolidação de Supabase de 06-07/09) → nenhum precisou mudar. Atenção
redobrada ao histórico já documentado de "Proxy lazy-loaded não incluído
pelo webpack" — **não se reproduziu**: `next build` compilou limpo, e
**testado de ponta a ponta contra produção real** (`GET /api/verify/[hash]`
com um `event_hash` genuíno do banco) devolveu `200` com dado de
certificação real recuperado via Supabase. Validado sem regressão: `tsc
--noEmit` (47, idêntico), `vitest` (81/81), `next build` (compila).

**As 3 fases do plano de infraestrutura compartilhada estão concluídas.**
`@/lib/redis`, `@/lib/db` e `@/lib/supabaseServer` são hoje reexports
puros de `packages/shared-infra`, cada um validado e deployado
individualmente, com confirmação explícita do usuário antes de tocar
`db.ts`/`supabaseServer.ts` (zona comercial do `CLAUDE.md`). Isso deixa o
repositório pronto — mas não decidido — para uma eventual Etapa 3 física;
a decisão de separar em repos continua em aberto e é do usuário.

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
