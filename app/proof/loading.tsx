export default function ProofLoading() {
  return (
    <div className="flex min-h-[calc(100vh-120px)] items-center justify-center bg-zinc-50 px-6 py-12">
      <main className="w-full max-w-5xl">
        <div
          className="space-y-10 rounded-3xl border bg-white px-6 py-12 shadow-sm md:px-10 animate-pulse"
          aria-hidden="true"
        >
          <div className="space-y-4 text-center">
            <div className="flex justify-center">
              <div className="h-4 w-36 rounded bg-gray-100" />
            </div>

            <div className="mx-auto h-10 w-64 rounded bg-gray-200" />
            <div className="mx-auto h-4 w-[32rem] max-w-full rounded bg-gray-100" />
          </div>

          <div className="mx-auto max-w-2xl space-y-3">
            <div className="space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="h-12 flex-1 rounded bg-gray-100" />
                <div className="h-12 w-32 rounded bg-gray-200" />
              </div>

              <div className="h-3 w-72 rounded bg-gray-100" />
            </div>

            <div className="flex justify-center gap-3">
              <div className="h-4 w-12 rounded bg-gray-100" />
              <div className="h-4 w-20 rounded bg-gray-100" />
              <div className="h-4 w-24 rounded bg-gray-100" />
            </div>
          </div>

          <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="rounded-2xl border bg-gray-50 p-4"
              >
                <div className="h-4 w-32 rounded bg-gray-200" />
                <div className="mt-2 h-4 w-full rounded bg-gray-100" />
                <div className="mt-2 h-4 w-5/6 rounded bg-gray-100" />
              </div>
            ))}
          </section>

          <div className="mx-auto max-w-2xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="h-4 w-28 rounded bg-gray-200" />
              <div className="h-4 w-24 rounded bg-gray-100" />
            </div>

            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="w-full rounded border bg-white p-3"
                >
                  <div className="h-4 w-56 rounded bg-gray-100" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}