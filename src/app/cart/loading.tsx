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

      {/* Item count */}
      <div className="mb-6 h-4 w-16 rounded bg-zinc-800 skeleton" />

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Item rows */}
        <div className="lg:col-span-2">
          <div className="divide-y divide-zinc-800 rounded-lg border border-zinc-800">
            <div className="px-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-4 py-4">
                  <div className="h-20 w-20 shrink-0 rounded-md bg-zinc-800 skeleton" />
                  <div className="flex flex-1 flex-col gap-2 pt-1">
                    <div className="h-4 w-3/4 rounded bg-zinc-800 skeleton" />
                    <div className="h-3 w-1/4 rounded bg-zinc-800 skeleton" />
                    <div className="mt-2 h-7 w-28 rounded bg-zinc-800 skeleton" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary panel */}
        <div className="lg:col-span-1">
          <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-6 space-y-3">
            <div className="h-4 w-32 rounded bg-zinc-800 skeleton" />
            <div className="h-3 w-full rounded bg-zinc-800 skeleton" />
            <div className="h-3 w-full rounded bg-zinc-800 skeleton" />
            <div className="my-4 border-t border-zinc-800" />
            <div className="h-4 w-24 rounded bg-zinc-800 skeleton" />
            <div className="mt-2 h-11 w-full rounded bg-zinc-800 skeleton" />
          </div>
        </div>
      </div>
    </div>
  )
}
