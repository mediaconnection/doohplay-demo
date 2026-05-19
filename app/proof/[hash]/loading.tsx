export default function ProofHashLoading() {
  return (
    <div className="space-y-6 px-6 py-8 animate-pulse" aria-hidden="true">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <div className="h-4 w-48 rounded bg-gray-100" />
          <div className="h-8 w-56 rounded bg-gray-200" />
          <div className="h-4 w-96 max-w-full rounded bg-gray-100" />
        </div>

        <div className="h-10 w-28 rounded-lg bg-gray-100" />
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <div className="h-8 w-40 rounded bg-gray-200" />
            <div className="h-4 w-64 rounded bg-gray-100" />
          </div>

          <div className="h-7 w-24 rounded-full bg-gray-100" />
        </div>
      </section>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border bg-white px-4 py-4 shadow-sm"
          >
            <div className="h-3 w-16 rounded bg-gray-100" />
            <div className="mt-2 h-6 w-20 rounded bg-gray-200" />
          </div>
        ))}
      </div>

      {Array.from({ length: 6 }).map((_, index) => (
        <section
          key={index}
          className="rounded-2xl border bg-white p-5 shadow-sm"
        >
          <div className="h-6 w-44 rounded bg-gray-200" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 3 }).map((__, row) => (
              <div key={row} className="space-y-2">
                <div className="h-4 w-24 rounded bg-gray-100" />
                <div className="h-4 w-56 max-w-full rounded bg-gray-200" />
              </div>
            ))}
          </div>
        </section>
      ))}

      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="h-6 w-32 rounded bg-gray-200" />
        <div className="mt-4 h-52 rounded-xl bg-zinc-950/90" />
      </section>
    </div>
  )
}