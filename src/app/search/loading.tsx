import { ProductGridSkeleton } from '@/components/ui/skeleton'

export default function SearchLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8" aria-hidden="true">
      {/* Title — matches static shell */}
      <div className="mb-8">
        <div className="h-8 w-40 skeleton rounded" />
        <div className="mt-1.5 h-4 w-80 skeleton rounded" />
      </div>

      {/* Controls row: search form (input + button) + category filter */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex flex-1 gap-2">
          <div className="h-10 flex-1 skeleton rounded-md" />
          <div className="h-10 w-20 skeleton rounded-md" />
        </div>
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <div className="h-4 w-16 skeleton rounded shrink-0" />
          <div className="h-10 flex-1 skeleton rounded-md sm:flex-none sm:w-40" />
        </div>
      </div>

      {/* Tag facets panel — mirrors collapsed TagFacets: header + 8 pills + show-more */}
      <div className="mb-8 rounded-lg border border-zinc-800 bg-zinc-950 p-4">
        <div className="flex flex-col gap-3">
          <div className="h-4 w-24 skeleton rounded" />
          <div className="min-h-[60px] flex flex-wrap gap-2">
            {['w-14', 'w-20', 'w-16', 'w-24', 'w-14', 'w-20', 'w-16', 'w-14', 'w-20', 'w-16', 'w-24', 'w-14'].map((w, i) => (
              <div key={i} className={`h-7 skeleton rounded-full ${w} ${i >= 8 ? 'hidden sm:flex' : ''}`} />
            ))}
          </div>
          <div className="h-4 w-28 skeleton rounded sm:hidden" />
        </div>
      </div>

      {/* Product grid — columns=3 matches SearchResults default */}
      <ProductGridSkeleton count={6} columns={3} />
    </div>
  )
}
