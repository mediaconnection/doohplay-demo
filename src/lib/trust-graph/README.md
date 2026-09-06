# ⚠️ Código morto — não editar

@deprecated — mesmo critério já aplicado a `src/lib/proof/` (Achado 1,
2026-08-30) e a outras árvores duplicadas raiz/`src/` já documentadas em
`CLAUDE.md`: código morto mantido, não removido, só documentado.

Esta pasta (`src/lib/trust-graph/`) é uma segunda implementação do Trust
Graph, com os mesmos nomes de arquivo da versão viva em `lib/trust-graph/`
(raiz): `types.ts`, `queries.ts`, `service.ts`, `layout.ts`,
`buildForceGraph.ts`, `analyzeTrustNetwork.ts`, `detectFraudClusters.ts`,
`fraud.ts`, `fraudScore.ts`, `metrics.ts`.

Investigação em 2026-09-06 (Fase 0 da extração de `packages/proof-engine`,
Etapa 2 do `DOOHPLAY_Plano_Separacao_Fronts.docx`) confirmou:

1. **O alias de webpack em `next.config.ts` resolve `@/lib/trust-graph/*`
   sempre para a raiz**, nunca para esta pasta (`"@/lib": path.resolve(__dirname, "lib")`).
2. **Esta árvore é inalcançável em runtime.** As únicas rotas/páginas reais
   que usam Trust Graph (`app/network/page.tsx`, `app/trust/page.tsx`,
   `app/network/trust/page.tsx`, `app/api/trust/graph/route.ts`,
   `app/api/trust/network/route.ts`) importam via `@/lib/trust-graph/...` ou
   `@/components/trust/...`, que resolvem sempre pra raiz.
3. **Não editar nem estender.** Se precisar mexer em Trust Graph, é em
   `lib/trust-graph/` (raiz).

Achado colateral, corrigido em seguida (2026-09-06): a versão viva
(`lib/trust-graph/buildForceGraph.ts`) tinha um `../../../` com um nível a
mais que o necessário no re-export de `lib/domain/trust-graph/buildForceGraph`
— sem efeito prático até aqui porque só era consumido por código também
morto (`components/trust/TrustGraph.tsx`/`TrustGraphContainer.tsx`, nenhuma
página real usa esses componentes — todas usam `TrustGraphCanvas`
diretamente), mas corrigido pra `../domain/trust-graph/buildForceGraph`
mesmo assim, pra não voltar a quebrar se algum desses componentes for
reativado no futuro.
