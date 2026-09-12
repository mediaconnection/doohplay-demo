# packages/proof-engine

Extração incremental do motor de prova criptográfica da DOOHPLAY para um
caminho próprio, dentro da Etapa 2 (Separação Lógica) do
`DOOHPLAY_Plano_Separacao_Fronts.docx`. Ver `STATUS_PROJETO.md` pra
histórico completo e status de cada fase.

## Acesso

Importar sempre via `@proof-engine/...` (alias único, sem fallback duplo —
ver `next.config.ts`, `tsconfig.json` e `vitest.config.ts`, os 3 precisam
ficar em sincronia). Nunca importar por caminho relativo cruzando pra fora
deste pacote nem pelo caminho antigo (`@/lib/proof/...` etc.) depois que um
módulo for movido pra cá.

## Status (2026-09-10)

Extração completa desde 2026-09-07 (Etapa 2 inteira do
`DOOHPLAY_Plano_Separacao_Fronts.docx` fechada: extração do motor de
prova, consolidação de clients Supabase, testes de contrato). ~192
arquivos vivem aqui hoje.

**Novo (2026-09-10)**: este diretório agora é também um **npm workspace
real** (`package.json` próprio, `name: "@doohplay/proof-engine"`,
declarado em `"workspaces"` no `package.json` raiz). Isso é preparação de
baixo risco para uma eventual Etapa 3 (separação física), não a Etapa 3
em si — ver `STATUS_PROJETO.md` pra decisão e validação (`tsc`/`vitest`/
`next build`, todos sem regressão). Os 89 consumidores continuam
importando via alias `@proof-engine/*` (`tsconfig.json`/`next.config.ts`/
`vitest.config.ts`) — o pacote novo não substituiu isso ainda, os dois
mecanismos coexistem.

~~Dívida do client Supabase inline (`lib/proof/adapters/supabase.ts`)~~ —
**resolvida** na Etapa 2, item 3, sub-parte 2, Fase 4 (2026-09-06): o
adapter (agora em `proof/adapters/supabase.ts`) passou a reusar o client
oficial `@/lib/supabaseServer.ts` em vez de instanciar o próprio.

## Dívida técnica conhecida, aceita conscientemente (2026-09-10/11)

Ter `package.json` próprio **não torna este pacote portável** — ele
continua fisicamente preso a este repositório. Levantamento real
(`grep` dentro de `packages/proof-engine/**`, não presumido):

- **Antes de mover qualquer coisa: 49 arquivos, 63 imports** de volta pra
  `@/lib/*` fora do pacote: `@/lib/db` (38× — o pool `pg.Pool` inteiro,
  280 consumidores externos ao todo), `@/lib/supabaseServer` (31 externos),
  `@/lib/redis` (12), `@/lib/merkle`/`@/lib/crypto/merkle` (5 cada),
  `@/lib/observability/*` (3), `@/lib/config/env` (3),
  `@/lib/crypto/ledgerVerify` (3), `@/lib/crypto/assinarComA1` (2),
  `@/lib/prisma` (1 — só aparece com `import()` dinâmico, não com `from`
  estático; ver achado abaixo sobre metodologia). **Nenhum desses é
  candidato a "mover pra dentro"** — são infraestrutura genuinamente
  compartilhada com o resto do produto. Resolver isso de verdade exigiria
  um pacote compartilhado à parte (ex: `@doohplay/db-client`), o que já é
  trabalho de Etapa 3 física, não preparação de baixo risco.
- **Movidos pra dentro do pacote (2026-09-11)**: `crypto/pkcs7Signer.ts` e
  `crypto/tsaRFC3161.ts` (ex-`lib/crypto/*.ts`) — confirmado, com busca
  por nome de arquivo (não só por alias), que `generateProofCertificate.ts`
  era o único consumidor real de cada um. Passaram a depender de
  `node-forge`/`node-fetch` como dependências diretas do pacote (adicionadas
  ao `package.json`). Reduz o levantamento acima pra 49 arquivos / 61
  imports (o arquivo `generateProofCertificate.ts` continua na lista por
  causa do `@/lib/db`, que é infra compartilhada, não candidato a mover).
- **Achado de metodologia (2026-09-11), importante para quem revisitar
  isso**: uma primeira tentativa desta sessão quis mover também
  `lib/crypto/merkleRoot.ts`, catalogado como "0 consumidores externos" —
  mas essa contagem só buscava pelo alias `@/lib/crypto/merkleRoot`.
  `next build` real quebrou com `Module not found`: o arquivo tem
  consumidores via **import relativo** (`lib/merkle/index.ts`,
  `lib/crypto/merkle.ts`) que o grep por alias não pegava. Revertido antes
  do commit. **Sempre checar consumidores por nome de arquivo
  (`grep -rE "from [\"'][^\"']*/nomeDoArquivo[\"']"`), nunca só pelo
  caminho de import usado dentro deste pacote** — um arquivo pode ter zero
  consumidores via `@/lib/*` e ainda assim ser importado de outro lugar por
  caminho relativo.
- **Achado maior, investigado e parcialmente limpo (2026-09-11/12)**: a
  investigação de `merkleRoot` revelou **16+ arquivos físicos** de merkle
  root espalhados pelo repositório, com 2 convenções de algoritmo
  coexistindo (ver `STATUS_PROJETO.md`, seção "Investigação de merkle root
  duplicado", pro relato completo incluindo 2 acusações de bug feitas e
  retratadas na mesma sessão). Fechado: `app/api/proof/audience/[campaign_id]`
  e `app/api/proof/impressions/campaign/[campaign_id]` corrigidas pra usar a
  convenção canônica. **Limpeza de duplicação executada (2026-09-11/12)**,
  só nos casos com consumidores reais 100% mapeados por caminho exato (não
  por nome de arquivo genérico, que já deu falso-positivo uma vez nesta
  investigação): `src/core/audit/{generateProof,merkleRoot,timestampProof}.ts`
  e `core/audit/timestamp-proof/route.ts` +
  `src/core/audit/timestamp-proof/route.ts` (órfãos, fora de `app/`, nunca
  foram rotas de verdade) removidos; `packages/proof-engine/domain/proof/merkle.ts`
  e `packages/proof-engine/proof/buildImpressionMerkle.ts` removidos (zero
  consumidor real). Os 4 arquivos que apontavam pra `src/core/audit/merkleRoot.ts`
  (`lib/crypto/merkle.ts`, `lib/merkle/index.ts`,
  `packages/proof-engine/domain/proof/{buildMerkleRoot,merkleBatch}.ts`)
  redirecionados pro `core/audit/merkleRoot.ts` (raiz — confirmado via
  `next.config.ts` que `@/core` sempre resolve pra raiz, não `src/`).
  Validado sem regressão: `tsc` 47 (idêntico), `vitest` 81/81, `next build`
  compila.
  **Reconferido e limpo (2026-09-12)**:
  `legacy/proof/{buildMerkleRoot,merkle,merkleBatch,merkleProof}.ts` e
  `packages/proof-engine/proof/helpers/merkle.ts` confirmados mortos por
  caminho exato (a checagem inicial por nome genérico tinha dado
  falso-positivo, mesmo padrão já visto com `merkleRoot`). Removido, junto
  com o fechamento completo de consumidores internos também mortos
  (`legacy/proof/{generateProof,batchMerkle,verifyMerkleProof,
  batchCrossLayerVerify}.ts`, 9 arquivos ao todo). **`packages/proof-engine/proof/layers/merkle.ts`
  não é morto** — é usado por `proof/engine.ts` (`runProofEngine`), que roda
  dentro de `/api/verify/[hash]`, o endpoint público principal de
  verificação. Isso levou a um achado maior: `layers/merkle.ts` usa uma
  **terceira convenção de hash** (`sha256(0x01 || bytes(left) || bytes(right))`,
  binária com prefixo de domínio, diferente das convenções (a)/(b) já
  documentadas acima), que bate exato com o `hashNode` do pipeline real
  (`proof/aggregator/proofChainAggregator.ts::buildCompatibleMerkleTree`) —
  escritor e verificador reais consistentes entre si, sem bug. Mas
  `packages/proof-engine/domain/block/createBlock.ts` (vivo via rota manual
  `/api/ledger/build-block`, sem cron) usa a convenção (a), incompatível —
  risco latente não corrigido, testado empiricamente contra dado real de
  produção (query recursiva com `pgcrypto`) e **não disparado até agora**.
  Ver `STATUS_PROJETO.md` pro relato completo. Os 6 arquivos físicos
  distintos chamados
  `generateProof.ts` (`app/api/audit/generateProof.ts`,
  `core/audit/generateProof.ts`, `legacy/proof/generateProof.ts`,
  `packages/proof-engine/proof/generateProof.ts`, `scripts/generateProof.ts`)
  também não foram tocados — pelo menos 2 são features genuinamente
  diferentes com nome coincidente (uma sem parâmetro, outra parametrizada
  por `event_hash`), renomear é refactor maior, não limpeza rápida.
  **Achado novo, fora de escopo, não investigado**: `core/audit/eventChainRepository.ts`
  e `src/core/audit/eventChainRepository.ts` **divergem de verdade**
  (schemas de INSERT diferentes, não são cópia idêntica) — a versão `src/`
  parece órfã (zero consumidor via alias, que sempre resolve pra raiz, nem
  via relativo), mas isso liga a `core/players/pairingService.ts` vs.
  `src/core/players/pairingService.ts` (outro par `core/`/`src/core/` não
  investigado). Registrado pra investigação futura dedicada, não decidido
  aqui.
- **1 import de `next/server`** (`proof/certificate.ts`, tipos
  `NextRequest`/`NextResponse`) — acoplamento ao framework do app
  comercial, não só ao `lib/`.
- **1 import relativo quebrado, mas inofensivo**: `proof/types.ts` linha
  11 reexporta de `"../../../lib/proof/types"`, caminho que **não existe**
  (o arquivo real é `src/lib/proof/types.ts`, resolvido hoje só via alias
  `@/lib/*`, não por caminho relativo). Não quebra build nem runtime
  porque é `export type {...}` (apagado na compilação) dentro de um
  arquivo com `// @ts-nocheck` (erro de tipo nunca checado) — mas é
  resíduo confuso da extração de 06/09, provavelmente devia apontar pro
  próprio `./types` do pacote ou usar o alias `@/lib/proof/types`.
  Corrigir fica fora do escopo desta tarefa (não muda comportamento real
  hoje), registrado aqui pra não ser recriado por engano depois.
- **Achado colateral, não corrigido**: `src/lib/tsa/createTsaToken.ts` é
  um duplicado órfão byte-idêntico de `lib/tsa/createTsaToken.ts`, sem
  nenhum consumidor real (o alias `@/lib/tsa/createTsaToken` sempre
  resolve pro caminho raiz, que é tentado primeiro). Registrado, não
  removido.

**Atualização (2026-09-12)**: começou a extração dessa infra compartilhada
pra um pacote próprio, `packages/shared-infra` (`@doohplay/shared-infra`)
— ver README dele. Fase 1 (`@/lib/redis`) concluída via reexport puro,
zero import mudou. `@/lib/db` e `@/lib/supabaseServer` pausados de
propósito — tocam rotas comerciais reais, exigem confirmação explícita do
usuário antes (zona de "parar e confirmar" do `CLAUDE.md`), mesmo sendo
reexport sem mudança de comportamento. Plano técnico completo das 3 fases
em `STATUS_PROJETO.md`. Decisão de separar em repos físicos (Etapa 3 de
verdade) continua em aberto e é do usuário — isso aqui ainda é só
preparação de baixo risco.
