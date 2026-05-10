import { ProductGridSkeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8" aria-hidden="true">
        <div className="mb-8 h-6 w-48 skeleton rounded" />
        <ProductGridSkeleton count={8} />
      </div>

      {/* Recently Viewed skeleton — matches RecentlyViewedDisplay layout */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 border-t border-zinc-800" aria-hidden="true">
        <div className="mb-6 h-7 w-40 skeleton rounded" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="aspect-square w-full skeleton rounded-md" />
              <div className="h-4 w-3/4 skeleton rounded" />
              <div className="h-4 w-1/3 skeleton rounded" />
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
