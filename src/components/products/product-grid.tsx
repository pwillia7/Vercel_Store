import type { Product } from '@/lib/api/types'
import { ProductCard } from './product-card'

interface ProductGridProps {
  products: Product[]
  columns?: 2 | 3 | 4
  /**
   * Number of images to mark as priority (preloaded as LCP candidates).
   * Pass the number of cards visible in the first row on the largest breakpoint.
   * Defaults to 0 (lazy-load all) — set explicitly for above-the-fold grids.
   */
  priorityCount?: number
}

export function ProductGrid({ products, columns = 4, priorityCount = 0 }: ProductGridProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
  }

  return (
    <div className={`grid gap-6 ${gridCols[columns]}`}>
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} priority={index < priorityCount} />
      ))}
    </div>
  )
}
