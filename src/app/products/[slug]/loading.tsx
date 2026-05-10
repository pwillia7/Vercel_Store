import { Skeleton } from '@/components/ui/skeleton'
import { ProductPriceSkeleton } from '@/components/products/product-price'
import { ProductActionsSkeleton } from '@/components/products/product-actions'

export default function ProductLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <div className="mb-8 flex items-center gap-2">
        <Skeleton className="h-4 w-10" />
        <span className="text-zinc-700">/</span>
        <Skeleton className="h-4 w-16" />
        <span className="text-zinc-700">/</span>
        <Skeleton className="h-4 w-32" />
      </div>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Image */}
        <Skeleton className="aspect-square w-full rounded-lg" />

        {/* Info — gap-6 matches ProductDetail */}
        <div className="flex flex-col gap-6">
          {/* Category — text-xs line-height = 16px = h-4 */}
          <Skeleton className="h-4 w-20" />
          {/* Name — text-2xl line-height = 32px = h-8 */}
          <Skeleton className="h-8 w-3/4" />
          {/* Price */}
          <ProductPriceSkeleton />
          {/* Actions (badge + urgency placeholder + form) */}
          <ProductActionsSkeleton />
          {/* Description — leading-7 lines */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    </div>
  )
}
