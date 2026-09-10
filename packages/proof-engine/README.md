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

## Dívida técnica conhecida, aceita conscientemente (2026-09-10)

Ter `package.json` próprio **não torna este pacote portável** — ele
continua fisicamente preso a este repositório. Levantamento real
(`grep` dentro de `packages/proof-engine/**`, não presumido):

- **49 arquivos, 63 imports** de volta pra `@/lib/*` fora do pacote:
  `@/lib/db` (38× — o pool `pg.Pool` inteiro), `@/lib/crypto` (8×),
  `@/lib/observability` (4×), `@/lib/redis` (3×), `@/lib/merkle` (3×),
  `@/lib/config` (2×), e 1× cada de `@/lib/tsa`, `@/lib/supabaseServer`,
  `@/lib/prisma`, `@/lib/ledger`, `@/lib/cache`.
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

**Isso é o item maior de uma eventual Etapa 3 física** — resolver esse
acoplamento reverso pesa mais que decidir empacotamento/dependências.
Nenhuma ação necessária agora; decisão de separar em repos físicos
continua em aberto e é do usuário.
