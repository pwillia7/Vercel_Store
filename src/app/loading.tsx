import { ProductGridSkeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 h-6 w-48 skeleton rounded" aria-hidden="true" />
      <ProductGridSkeleton count={8} />
    </div>
  )
}
