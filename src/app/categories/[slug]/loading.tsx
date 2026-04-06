import { ProductGridSkeleton } from '@/components/ui/skeleton'

export default function CategoryLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <div className="mb-8 flex items-center gap-2">
        <div className="h-4 w-10 skeleton rounded" aria-hidden="true" />
        <span className="text-zinc-700">/</span>
        <div className="h-4 w-20 skeleton rounded" aria-hidden="true" />
        <span className="text-zinc-700">/</span>
        <div className="h-4 w-24 skeleton rounded" aria-hidden="true" />
      </div>

      {/* Header */}
      <div className="mb-10">
        <div className="mb-2 h-3 w-16 skeleton rounded" aria-hidden="true" />
        <div className="h-9 w-48 skeleton rounded" aria-hidden="true" />
        <div className="mt-2 h-4 w-24 skeleton rounded" aria-hidden="true" />
      </div>

      <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
        {/* Sidebar skeleton */}
        <div className="w-full shrink-0 lg:w-56 space-y-4">
          <div className="h-10 w-full skeleton rounded-md" aria-hidden="true" />
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-7 w-3/4 skeleton rounded-full" aria-hidden="true" />
            ))}
          </div>
        </div>

        {/* Results skeleton */}
        <div className="flex-1">
          <ProductGridSkeleton count={9} columns={3} />
        </div>
      </div>
    </div>
  )
}
