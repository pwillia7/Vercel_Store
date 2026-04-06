interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`skeleton rounded ${className}`} aria-hidden="true" />
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="aspect-square w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/3" />
    </div>
  )
}

export function ProductGridSkeleton({ count = 8, columns = 4 }: { count?: number; columns?: 2 | 3 | 4 }) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
  }
  return (
    <div className={`grid gap-6 ${gridCols[columns]}`} aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function StockSkeleton() {
  return (
    <div className="flex items-center gap-2">
      <Skeleton className="h-2 w-2 rounded-full" />
      <Skeleton className="h-4 w-24" />
    </div>
  )
}
