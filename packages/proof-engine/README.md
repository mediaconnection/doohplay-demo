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

## Status (2026-09-06)

Fase 0 (confirmação de código morto) concluída — ver `STATUS_PROJETO.md`.
Fase 1 (esta: estrutura vazia + alias, sem mover nada) em andamento.
Nenhum código foi movido pra dentro deste pacote ainda.

## Dívida técnica conhecida, aceita conscientemente

Este pacote vai herdar a bagunça de instanciação de client Supabase ainda
não consolidada (Etapa 2, item 3, sub-parte 2) — pelo menos
`lib/proof/adapters/supabase.ts` instancia seu próprio client inline. Não
é isolamento real ainda; decisão consciente do usuário de extrair antes de
consolidar Supabase, ver `STATUS_PROJETO.md`.
