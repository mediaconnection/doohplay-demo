import Link from "next/link"

export default function ProofHashNotFound() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-180px)] max-w-2xl items-center justify-center px-6 py-12">
      <div className="w-full rounded-2xl border bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border bg-gray-50 text-lg font-semibold text-gray-600">
          404
        </div>

        <h1 className="mt-4 text-2xl font-bold">Proof não encontrado</h1>

        <p className="mt-3 text-sm text-gray-500">
          Não foi possível localizar esse hash no Explorer técnico do DOOHPLAY.
          Verifique o identificador informado ou faça uma nova consulta.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/verify"
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Nova verificação
          </Link>

          <Link
            href="/"
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Ir para o portal
          </Link>
        </div>
      </div>
    </div>
  )
}