# ⚠️ Maioria código morto — só 3 arquivos vivos, confira antes de editar

Investigação em 2026-09-06 (Fase 0 da extração de `packages/proof-engine`,
Etapa 2 do `DOOHPLAY_Plano_Separacao_Fronts.docx`): apesar do nome da pasta
sugerir "tudo morto", só **3 dos 49 arquivos `.ts`** têm consumidor real
confirmado por import fora da própria pasta.

## Vivos — não mover/apagar sem atualizar quem importa

- **`legacy/ledger/writeEvent.ts`** — importado por `lib/ledger/writeEvent.ts`
  (re-export), usado por `lib/queue/workers/eventWorker.ts` (worker BullMQ
  real, roda dentro de `worker.ts` em produção).
- **`legacy/proof/service.ts`** — importado por `lib/domain/proof/service.ts`
  (re-export), usado por `app/api/proof/[hash]/status/route.ts` e
  `app/api/proof/[hash]/certificate/route.ts` (rotas públicas reais).
- **`legacy/proof/signature.ts`** — importado por `legacy/proof/service.ts`
  (o arquivo acima), mesma cadeia de uso.

## Mortos — todo o resto (46 arquivos)

Zero import de qualquer um fora da própria pasta `legacy/`, confirmado por
grep exaustivo. Inclui `legacy/ledger/` (6 restantes: `anchorMerkleRoot`,
`buildDailyMerkle`, `createBlock`, `createCheckpoint`, `insertEvent`,
`publishTransparencyLog`), `legacy/proof/` (25 restantes), e
`legacy/verification/` (14, todos).

Duas curiosidades encontradas nesta investigação, sem efeito prático (só
código morto, mas valem nota pra quem for limpar depois):
- `legacy/proof/layers/a1SignatureLayer.ts` e
  `legacy/proof/layers/layersa1SignatureLayer.ts` — nomes quase idênticos,
  provável cópia acidental.
- `legacy/verification/route.ts` — apesar do nome, não é uma rota Next.js
  real (está fora de `app/`), é só um módulo comum morto.

**Não editar/estender nada aqui além dos 3 arquivos vivos listados acima.**
Se precisar de lógica nova de ledger/proof, use `lib/domain/ledger/` ou
`lib/domain/proof/` (os caminhos vivos que já re-exportam os 3 arquivos
desta pasta).
