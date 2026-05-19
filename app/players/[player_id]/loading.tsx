export default function PlayersLoading() {
  return (
    <div className="space-y-6 animate-pulse" aria-hidden="true">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="h-8 w-40 rounded bg-gray-200" />
          <div className="h-4 w-80 max-w-full rounded bg-gray-100" />
        </div>

        <div className="h-10 w-28 rounded-lg bg-gray-100" />
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <SkeletonMetricCard key={index} />
        ))}
      </div>

      <section className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="space-y-2">
          <div className="h-6 w-40 rounded bg-gray-200" />
          <div className="h-4 w-72 max-w-full rounded bg-gray-100" />
        </div>

        <div className="mt-4 space-y-3">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="rounded-xl border bg-gray-50 px-3 py-4"
            >
              <div className="grid grid-cols-1 gap-3 md:grid-cols-8 md:items-center">
                <div className="space-y-2">
                  <div className="h-4 w-40 max-w-full rounded bg-gray-200" />
                  <div className="h-3 w-56 max-w-full rounded bg-gray-100" />
                </div>

                <div className="h-6 w-20 rounded-full bg-gray-100" />
                <div className="h-6 w-20 rounded-full bg-gray-100" />
                <div className="h-4 w-10 rounded bg-gray-200" />
                <div className="h-4 w-20 rounded bg-gray-100" />
                <div className="h-4 w-24 rounded bg-gray-100" />
                <div className="h-4 w-28 rounded bg-gray-100" />

                <div className="flex gap-2">
                  <div className="h-8 w-20 rounded-lg bg-white" />
                  <div className="h-8 w-16 rounded-lg bg-white" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function SkeletonMetricCard() {
  return (
    <div className="rounded-2xl border bg-white px-4 py-3 shadow-sm">
      <div className="h-3 w-16 rounded bg-gray-100" />
      <div className="mt-2 h-6 w-12 rounded bg-gray-200" />
    </div>
  )
}