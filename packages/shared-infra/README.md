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

## Achado colateral — investigado e fechado (2026-09-12)

`@/lib/redis` não são 2 clients Redis como o `CLAUDE.md` documentava —
são 5 arquivos físicos distintos. Investigação completa a partir de
`worker.ts` (o entrypoint real do serviço `doohplay-workers` no Render,
confirmado via `list_services` — não aparece no `render.yaml`, foi
configurado direto no painel): ele só importa de `lib/queue/workers/*`
na raiz, nunca de `src/lib/queue/*`. Confirmado por caminho exato:

- `lib/redis.ts` (agora aqui) — o único client oficial, usado pelos 5
  workers reais.
- `lib/queue/connection.ts` (raiz) — **zero consumidor**, morto.
- `src/lib/queue/connection.ts` — só usado por
  `src/lib/queue/{eventWorker,eventQueue}.ts`, que também têm **zero
  consumidor real** — cluster inteiro morto, mesmo padrão de árvore
  paralela inalcançável em `src/lib/` já documentado no `CLAUDE.md`
  (trust-graph, alerts engine).
- `lib/queue/redis.ts` (raiz, host hardcoded `127.0.0.1:6379`) — só
  alcançável via `scripts/run-block-finalization.ts`, script manual
  standalone, fora de qualquer pipeline automatizado.
- `src/lib/queue/redis.ts` — mesmo padrão, só alcançável via
  `src/lib/queue/alertQueue.ts` → `scripts/testAlertQueue.ts`, também
  script manual.

**Achado bem mais sério, encontrado no caminho**: o serviço
`doohplay-workers` tinha `buildFilter.paths` malformado (`["worker.ts
lib/** core/**"]`, um único item em vez de 3 padrões separados) —
nenhum commit tocando `lib/**` desde 03/09 disparou redeploy automático,
incluindo as 3 fases deste pacote. Deploy manual disparado pra corrigir
o sintoma imediato (worker agora roda o HEAD atual, confirmado limpo nos
logs); **corrigido pelo usuário no painel do Render e testado** (commit
seguinte, tocando só arquivo fora dos 3 padrões, confirmado que não
disparou redeploy indevido). Ver `STATUS_PROJETO.md` pro relato completo.

## Consolidação de conexões Redis (2026-09-12)

Motivada por uma análise de custo/risco real: o rate-limit do Upstash
voltou a aparecer nos logs (circuit-breaker em "tentativa 8", pausas até
120s) — a condição de revisita definida na decisão de 2026-09-08
("consolidar vs. upgrade, nenhum por ora") se confirmou.

Levantamento fresco (`grep -rn "new Redis(\|new IORedis("`) achou **14
instanciações reais** — mesmo número já documentado, mas **5 delas são
código morto ou só scripts manuais** (o cluster de `src/lib/queue/` +
`lib/queue/{connection,redis,alertQueue}.ts`, já mapeado acima), deixando
**9 genuinamente ativas em produção**.

Das 9, **7 tinham configuração simples/compatível** e foram consolidadas
pra reusar o client oficial (`@/lib/redis`, agora com as proteções de
timeout/retry do antigo `packages/proof-engine/proof/cache/redis.ts`
incorporadas — `connectTimeout`, `commandTimeout`, `keepAlive`,
`retryStrategy`): `app/api/metrics/prometheus/route.ts`,
`lib/observability/metricsRedis.ts`, `lib/queue/utils/idempotency.ts`,
`packages/proof-engine/blockchain/idempotency.ts`,
`packages/proof-engine/proof/cache/proofCache.ts`,
`packages/proof-engine/proof/cache/redis.ts` (esse último, na prática,
código morto — zero consumidor real confirmado, convertido em reexport
só por consistência), e `lib/queue/riskQueue.ts` (`Queue` do BullMQ,
compatível porque o client oficial já usa `maxRetriesPerRequest: null`,
exigido pelo BullMQ — múltiplas `Queue` compartilhando uma conexão é o
padrão que o próprio BullMQ recomenda pra reduzir conexões totais).

**2 mantidas separadas, por desenho, não por descuido**:
- `lib/security/rateLimit.ts` usa `maxRetriesPerRequest: 2` (finito) +
  `lazyConnect: true`, deliberadamente "fail-open" — se o Redis cair, a
  checagem de rate-limit falha rápido e libera a requisição em vez de
  travar rotas públicas de verificação.
- **Correção de um erro cometido nesta mesma consolidação**: `lib/queue/alertQueue.ts`
  (raiz) foi catalogado por engano como código morto/só-script no
  levantamento inicial — na verdade tem um consumidor real
  (`app/api/audit/campaign/[campaign_id]/route.ts` → `lib/queue/enqueueAlert.ts`
  → `lib/queue/alertQueue.ts`), achado só depois ao verificar import
  relativo `./alertQueue` de dentro de `lib/queue/enqueueAlert.ts` (mesmo
  tipo de erro de grep genérico já visto antes nesta sessão). Sua config
  (`maxRetriesPerRequest: 0`, `enableOfflineQueue: false`) é ainda mais
  agressivamente fail-fast que o rate-limiter — projetado pra nunca
  bloquear a rota de auditoria de campanha se o Redis de alertas falhar.
  **Não consolidado de propósito**, pelo mesmo motivo do rate-limiter.

Compartilhar a conexão oficial (`maxRetriesPerRequest: null` = retry
infinito) inverteria o comportamento de segurança dos dois. Documentado
aqui pra não serem "corrigidos" por engano numa limpeza futura.

**Cluster morto confirmado e removido (2026-09-12)**: `lib/queue/connection.ts`
(zero consumidor), `lib/queue/redis.ts` (só usado por
`scripts/run-block-finalization.ts`, que já tinha um bug pré-existente
desestruturando um campo inexistente — script já não funcionava), e a
árvore inteira `src/lib/queue/{alertQueue,connection,eventQueue,eventWorker,redis}.ts`
(5 arquivos, autocontida, zero consumidor externo real, mesmo padrão de
árvore paralela morta em `src/lib/` já documentado no `CLAUDE.md`) — só
usada por `scripts/testAlertQueue.ts`, que passa a ter import
pendurado (script manual, fora do escopo do `tsc`, já não crítico).

**Resultado final**: das 14 instanciações originais, **10 eram
genuinamente ativas** (não 9 — a correção do `alertQueue.ts` mudou a
conta), consolidadas em **3**: o client oficial compartilhado + 2
conexões fail-fast separadas por design (`rateLimit.ts`,
`alertQueue.ts`). Os 5 arquivos restantes eram código morto, removidos.
Validado sem regressão: `tsc --noEmit` (47, idêntico), `vitest` (81/81),
`next build` (compila).
