import Link from "next/link"

export default function PlayerNotFound() {
  return (
    <div className="mx-auto max-w-2xl rounded-2xl border bg-white p-8 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border bg-gray-50 text-lg font-semibold text-gray-600">
        404
      </div>

      <h1 className="mt-4 text-2xl font-bold">Player não encontrado</h1>

      <p className="mt-3 text-sm text-gray-500">
        Não foi possível localizar esse player na base do DOOHPLAY.
        Verifique o identificador informado ou volte para a lista de players.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/players"
          className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          Ver players
        </Link>

        <Link
          href="/network/map"
          className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          Voltar ao mapa
        </Link>

        <Link
          href="/"
          className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          Ir para Home
        </Link>
      </div>
    </div>
  )
}