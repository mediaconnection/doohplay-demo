import Link from "next/link"

export default function VerifyHashNotFound() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-amber-200 bg-white p-8 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700">
                PROOF NOT FOUND
              </div>

              <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
                Prova não encontrada
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                Não localizamos este hash no ledger público do DOOHPLAY. Isso pode
                significar que o hash é inválido, ainda não foi processado pelo
                pipeline de prova, ou não existe registro correspondente na cadeia
                auditável.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </div>
              <div className="mt-1 text-lg font-bold text-slate-900">
                Não localizado
              </div>
              <div className="mt-1 text-xs text-slate-500">
                Sem evidência pública disponível
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                O que verificar
              </div>

              <ul className="mt-3 space-y-2 pl-5 text-sm text-slate-700">
                <li className="list-disc">
                  Confirme se o hash foi copiado completamente, com 64 caracteres
                  hexadecimais válidos.
                </li>
                <li className="list-disc">
                  Verifique se o evento já passou pelo pipeline de certificação,
                  prova Merkle e publicação.
                </li>
                <li className="list-disc">
                  Confirme se a consulta está apontando para o hash correto e não
                  para um identificador interno diferente.
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Recomendação operacional
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-700">
                Se este ativo deveria existir, revise o processo de ingestão,
                certificação e persistência da prova. Em ambiente enterprise, esse
                cenário normalmente exige validação do registro de origem, do hash
                certificado e do pipeline de ancoragem.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/verify"
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Voltar para verificar
            </Link>

            <Link
              href="/"
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Ir para o portal
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}