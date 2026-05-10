/**
 * Cart page loading skeleton — shown by the router as an instant fallback
 * while the cart page streams in. Mirrors the full page layout so the
 * browser has something to paint before any data arrives.
 */
export default function CartLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8" aria-hidden="true">
      {/* Heading */}
      <div className="mb-8">
        <div className="h-8 w-32 rounded bg-zinc-800 skeleton" />
      </div>

      {/* Item count — text-sm = 20px = h-5 */}
      <div className="mb-6 h-5 w-16 rounded bg-zinc-800 skeleton" />

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Item rows */}
        <div className="lg:col-span-2">
          <div className="divide-y divide-zinc-800 rounded-lg border border-zinc-800">
            <div className="px-4">
              {Array.from({ length: 1 }).map((_, i) => (
                <div key={i} className="flex gap-4 py-4">
                  <div className="h-20 w-20 shrink-0 rounded-md bg-zinc-800 skeleton" />
                  <div className="flex flex-1 flex-col gap-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="h-5 w-3/4 rounded bg-zinc-800 skeleton" />
                      <div className="h-5 w-12 shrink-0 rounded bg-zinc-800 skeleton" />
                    </div>
                    <div className="h-4 w-1/4 rounded bg-zinc-800 skeleton" />
                    <div className="mt-2 flex items-center justify-between">
                      <div className="h-7 w-28 rounded bg-zinc-800 skeleton" />
                      <div className="h-4 w-10 rounded bg-zinc-800 skeleton" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 h-5 w-40 rounded bg-zinc-800 skeleton" />
        </div>

        {/* Summary panel */}
        <div className="lg:col-span-1">
          <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-6">
            <div className="mb-4 h-6 w-36 rounded bg-zinc-800 skeleton" />
            <div className="space-y-2">
              <div className="flex justify-between">
                <div className="h-5 w-16 rounded bg-zinc-800 skeleton" />
                <div className="h-5 w-16 rounded bg-zinc-800 skeleton" />
              </div>
              <div className="flex justify-between">
                <div className="h-5 w-16 rounded bg-zinc-800 skeleton" />
                <div className="h-5 w-40 rounded bg-zinc-800 skeleton" />
              </div>
            </div>
            <div className="my-4 border-t border-zinc-800" />
            <div className="flex justify-between">
              <div className="h-6 w-10 rounded bg-zinc-800 skeleton" />
              <div className="h-6 w-16 rounded bg-zinc-800 skeleton" />
            </div>
            <div className="mt-6 h-11 w-full rounded bg-zinc-800 skeleton" />
            <div className="mt-3 h-4 w-full rounded bg-zinc-800 skeleton" />
          </div>
        </div>
      </div>
    </div>
  )
}
