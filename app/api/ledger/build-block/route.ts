export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

// Bloqueada em 2026-09-12: createBlock() usa uma convenção de hash de
// merkle (pareamento direto, sem prefixo de domínio) incompatível com o
// verificador público real (packages/proof-engine/proof/merkle/verifyMerkleProof.ts,
// que usa sha256(0x01 || bytes(left) || bytes(right)), a mesma convenção
// do pipeline real proofChainAggregator.ts). Qualquer bloco criado por
// esta rota teria prova permanentemente inverificável em /api/verify/[hash].
// Testado empiricamente contra produção (STATUS_PROJETO.md, achado de
// 2026-09-12) e confirmado que nunca foi disparada até agora — bloqueada
// preventivamente, não como correção de um incidente já ocorrido.
export async function POST() {
  return Response.json(
    {
      error: "ROUTE_DISABLED",
      reason:
        "createBlock() usa uma convenção de hash de merkle incompatível " +
        "com o verificador público real. Ver STATUS_PROJETO.md, achado de " +
        "2026-09-12, antes de reativar esta rota."
    },
    { status: 403 }
  );
}

