import { ProductGrid } from '@/components/products/product-grid'
import type { Product } from '@/lib/api/types'

interface SearchResultsProps {
  products: Product[]
  query?: string
  hasSearched: boolean
  activeTags?: string[]
  /** Override the default column count (default 3) */
  columns?: 2 | 3 | 4
  /** When undefined, hides the result count line */
  totalBeforeLimit?: number
  /** Number of images to preload as LCP candidates (first row above the fold) */
  priorityCount?: number
}

export function SearchResults({
  products,
  query,
  hasSearched,
  activeTags = [],
  columns = 3,
  totalBeforeLimit,
  priorityCount = 0,
}: SearchResultsProps) {
  if (hasSearched && products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 text-zinc-700">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </div>
        <p className="text-zinc-400 font-medium">
          No results
          {query && (
            <> for <span className="text-white">&ldquo;{query}&rdquo;</span></>
          )}
          {activeTags.length > 0 && (
            <> tagged <span className="text-white">{activeTags.join(', ')}</span></>
          )}
        </p>
        <p className="mt-1 text-sm text-zinc-600">
          Try adjusting your search or clearing some filters.
        </p>
      </div>
    )
  }

  const displayCount = totalBeforeLimit ?? products.length

  return (
    <div>
      {hasSearched && (
        <p className="mb-4 text-sm text-zinc-500" aria-live="polite">
          {displayCount} result{displayCount !== 1 ? 's' : ''}
          {query && (
            <> for <span className="text-zinc-300">&ldquo;{query}&rdquo;</span></>
          )}
          {activeTags.length > 0 && (
            <> · tagged <span className="text-zinc-300">{activeTags.join(', ')}</span></>
          )}
        </p>
      )}
      <ProductGrid products={products} columns={columns} priorityCount={priorityCount} />
    </div>
  )
}
