# ⚠️ Código morto — não editar

@deprecated — mesmo critério já aplicado a `lib/proof/ledger/buildBlock.ts` e
`lib/proof/scheduler/runProofPipeline.ts` (achado de 2026-08-26, ver
`STATUS_PROJETO.md`): código morto mantido, não removido, só documentado.

Esta pasta (`src/lib/proof/`) é uma segunda implementação inteira do motor
de prova, com os mesmos nomes de arquivo da versão viva em `lib/proof/`
(raiz): `merkle.ts`, `types.ts`, `evaluateProofStatus.ts`,
`evaluateProofCryptography.ts`, `ledger.ts`, `persistProofValidation.ts`,
`tsa.ts`, e o subdiretório `validators/` inteiro (ver README próprio lá).

Investigação em 2026-08-30 (levantamento pra Etapa 2 do
`DOOHPLAY_Plano_Separacao_Fronts.docx`) confirmou:

1. **O alias de webpack em `next.config.ts` resolve `@/lib/proof/*` sempre
   para a raiz**, nunca para esta pasta:
   ```js
   "@/lib": path.resolve(__dirname, "lib"),
   ```
   Isso sobrescreve, em runtime, a resolução mais genérica (e ambígua) que
   o `tsconfig.json` sozinho sugeriria (`"@/*": ["./*", "./src/*"]`).

2. **Esta árvore é inalcançável em runtime**, apesar dos nomes de arquivo
   idênticos aos de `lib/proof/`. Nenhuma rota de `app/api/**`, nenhum
   arquivo de `worker.ts` nem nenhum outro ponto de entrada real importa
   especificamente estes arquivos — todo import de `@/lib/proof/...` cai na
   versão da raiz.

3. **Não editar nem estender.** Se precisar mexer no motor de prova, é em
   `lib/proof/` (raiz) — é essa a árvore que as 12 rotas de `app/api/**`
   (`verify/[hash]`, `audit/*`, `proof/*`, `trust*`, `graph/*`,
   `reputation/*`) e o `worker.ts` de fato executam.
