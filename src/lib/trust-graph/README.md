# ⚠️ Código morto — não editar

@deprecated — mesmo critério já aplicado a `src/lib/proof/` (Achado 1,
2026-08-30) e a outras árvores duplicadas raiz/`src/` já documentadas em
`CLAUDE.md`: código morto mantido, não removido, só documentado.

Esta pasta (`src/lib/trust-graph/`) é uma segunda implementação do Trust
Graph, com os mesmos nomes de arquivo da versão que era viva em
`lib/trust-graph/` (raiz): `types.ts`, `queries.ts`, `service.ts`,
`layout.ts`, `buildForceGraph.ts`, `analyzeTrustNetwork.ts`,
`detectFraudClusters.ts`, `fraud.ts`, `fraudScore.ts`, `metrics.ts`.

Investigação em 2026-09-06 (Fase 0 da extração de `packages/proof-engine`,
Etapa 2 do `DOOHPLAY_Plano_Separacao_Fronts.docx`) confirmou:

1. **O alias de webpack em `next.config.ts` resolvia `@/lib/trust-graph/*`
   sempre para a raiz**, nunca para esta pasta (`"@/lib": path.resolve(__dirname, "lib")`).
2. **Esta árvore era inalcançável em runtime.** As únicas rotas/páginas reais
   que usam Trust Graph (`app/network/page.tsx`, `app/trust/page.tsx`,
   `app/network/trust/page.tsx`, `app/api/trust/graph/route.ts`,
   `app/api/trust/network/route.ts`) importavam via `@/lib/trust-graph/...` ou
   `@/components/trust/...`, que resolviam sempre pra raiz.
3. **Atualização (Fase 2, mesmo dia)**: a raiz (`lib/trust-graph/`) foi
   esvaziada — o código vivo foi movido pra `packages/proof-engine/trust-graph/`,
   com o alias `@proof-engine/trust-graph/*` atualizado em todos os
   consumidores reais. **Não editar nem estender esta pasta (`src/lib/`).**
   Se precisar mexer em Trust Graph, é em `packages/proof-engine/trust-graph/`.
4. **Achado colateral, não corrigido**: `src/app/network/page.tsx` e
   `src/components/trust/TrustGraph.tsx`/`TrustGraphContainer.tsx` também
   importam `@/lib/trust-graph/...` — depois da Fase 2 esse caminho não
   resolve mais nem pra raiz nem pra cá via webpack (só via fallback
   genérico do `tsconfig.json`, que ainda aponta pra esta pasta morta).
   Sem efeito prático confirmado: o Next.js usa `app/` (raiz) quando
   `app/` e `src/app/` coexistem, então `src/app/` nunca é servido — mas
   fica registrado, não corrigido, fora do escopo desta extração.

Achado colateral, corrigido em seguida (2026-09-06): a versão viva
(`lib/trust-graph/buildForceGraph.ts`) tinha um `../../../` com um nível a
mais que o necessário no re-export de `lib/domain/trust-graph/buildForceGraph`
— sem efeito prático até aqui porque só era consumido por código também
morto (`components/trust/TrustGraph.tsx`/`TrustGraphContainer.tsx`, nenhuma
página real usa esses componentes — todas usam `TrustGraphCanvas`
diretamente), mas corrigido pra `../domain/trust-graph/buildForceGraph`
mesmo assim, pra não voltar a quebrar se algum desses componentes for
reativado no futuro.
