import Link from 'next/link'
import { cacheTag, cacheLife } from 'next/cache'
import { getProducts } from '@/lib/api/client'
import { CACHE_TAGS } from '@/lib/cache/tags'
import { ProductGrid } from '@/components/products/product-grid'

/**
 * FeaturedProducts — cached Server Component.
 *
 * "use cache" here caches the entire rendered RSC payload, not just the data.
 * Without it, this component re-renders on every request even though
 * getProducts() returns the same cached data each time — wasting CPU on
 * JSX diffing, product filtering, and Link generation.
 *
 * Cache tag matches getProducts() so revalidateTag(CACHE_TAGS.PRODUCTS)
 * invalidates both the data and the rendered component together.
 */
export async function FeaturedProducts() {
  'use cache'
  cacheTag(CACHE_TAGS.PRODUCTS)
  cacheLife('hours')

  const products = await getProducts()

  const featured = products.filter((p) => p.featured).slice(0, 8)
  const displayed = featured.length >= 6 ? featured : products.slice(0, 8)

  if (displayed.length === 0) {
    return (
      <div className="py-16 text-center text-zinc-500">
        <p>No products available at the moment. Check back soon.</p>
      </div>
    )
  }

  return (
    <section>
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Featured Products</h2>
        <Link
          href="/search"
          prefetch={true}
          className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          View all →
        </Link>
      </div>
      {/* priorityCount=4: first row on desktop (4 cols) preloaded as LCP candidates */}
      <ProductGrid products={displayed} priorityCount={4} />
    </section>
  )
}
