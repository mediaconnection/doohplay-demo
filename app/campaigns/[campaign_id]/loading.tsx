export default function CampaignDetailsLoading() {
  return (
    <div className="space-y-6 animate-pulse" aria-hidden="true">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="h-8 w-64 rounded bg-gray-200" />
          <div className="h-4 w-80 max-w-full rounded bg-gray-100" />
        </div>

        <div className="flex gap-2">
          <div className="h-10 w-28 rounded-lg bg-gray-100" />
          <div className="h-10 w-28 rounded-lg bg-gray-100" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border bg-white px-4 py-3 shadow-sm"
          >
            <div className="h-3 w-16 rounded bg-gray-100" />
            <div className="mt-2 h-6 w-12 rounded bg-gray-200" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="h-6 w-40 rounded bg-gray-200" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="border-b pb-2 last:border-b-0">
                <div className="h-3 w-24 rounded bg-gray-100" />
                <div className="mt-2 h-4 w-56 rounded bg-gray-200" />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="h-6 w-40 rounded bg-gray-200" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="border-b pb-2 last:border-b-0">
                <div className="h-3 w-24 rounded bg-gray-100" />
                <div className="mt-2 h-4 w-40 rounded bg-gray-200" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}