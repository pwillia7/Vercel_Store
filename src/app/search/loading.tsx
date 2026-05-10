import { ProductGridSkeleton } from '@/components/ui/skeleton'

export default function SearchLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Title matches the static shell so there is no shift on hydration */}
      <div className="mb-8">
        <div className="h-8 w-40 skeleton rounded" aria-hidden="true" />
        <div className="mt-1.5 h-4 w-80 skeleton rounded" aria-hidden="true" />
      </div>

      {/* Controls skeleton */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="h-10 flex-1 skeleton rounded-md" aria-hidden="true" />
        <div className="h-10 w-40 skeleton rounded-md" aria-hidden="true" />
      </div>

      {/* Results skeleton */}
      <ProductGridSkeleton count={8} columns={4} />
    </div>
  )
}
