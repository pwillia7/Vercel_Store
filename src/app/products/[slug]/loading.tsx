import { Skeleton, StockSkeleton } from '@/components/ui/skeleton'

export default function ProductLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Breadcrumb skeleton */}
      <div className="mb-8 flex items-center gap-2">
        <Skeleton className="h-4 w-10" />
        <span className="text-zinc-700">/</span>
        <Skeleton className="h-4 w-16" />
        <span className="text-zinc-700">/</span>
        <Skeleton className="h-4 w-32" />
      </div>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Image skeleton */}
        <Skeleton className="aspect-square w-full rounded-lg" />

        {/* Info skeleton */}
        <div className="flex flex-col gap-6">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-7 w-24" />
          <StockSkeleton />
          <div className="border-t border-zinc-800" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <Skeleton className="h-12 w-full rounded-md" />
        </div>
      </div>
    </div>
  )
}
