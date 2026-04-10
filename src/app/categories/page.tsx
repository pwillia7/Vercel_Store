import type { Metadata } from 'next'
import Link from 'next/link'
import { cacheTag, cacheLife } from 'next/cache'
import { getCategories, getProducts } from '@/lib/api/client'
import { filterProducts } from '@/lib/search/filter-products'
import { CACHE_TAGS } from '@/lib/cache/tags'

export const metadata: Metadata = {
  title: 'Categories',
  description: 'Browse all product categories in the Vercel Swag Store.',
  openGraph: {
    title: 'Categories | Vercel Swag Store',
    description: 'Find the perfect developer swag by category.',
  },
}

/**
 * Categories listing page — Server Component, cached data.
 *
 * Fetches categories and computes a product count for each one in-memory
 * from the cached product list — no extra API calls per category.
 */
export default async function CategoriesPage() {
  'use cache'
  cacheTag(CACHE_TAGS.CATEGORIES)
  cacheTag(CACHE_TAGS.PRODUCTS)
  cacheLife('hours')

  const [categories, allProducts] = await Promise.all([getCategories(), getProducts()])

  // Compute product count per category in-memory from cached data, drop empties
  const categoriesWithCounts = categories
    .map((cat) => {
      const slug = cat.slug ?? cat.name.toLowerCase().replace(/\s+/g, '-')
      const count = filterProducts(allProducts, { category: slug }, Infinity).length
      return { ...cat, slug, count }
    })
    .filter((cat) => cat.count > 0)

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-500">
          Browse
        </p>
        <h1 className="text-3xl font-bold text-white">Categories</h1>
        <p className="mt-2 text-zinc-400">
          {allProducts.length} products across {categoriesWithCounts.length} categories
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categoriesWithCounts.map((cat) => (
          <Link
            key={cat.id ?? cat.slug}
            href={`/categories/${cat.slug}`}
            className="group relative flex flex-col justify-between overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 p-6 transition-colors hover:border-zinc-600"
            prefetch={true}
          >
            {/* Category name */}
            <div>
              <h2 className="text-lg font-semibold text-white group-hover:text-zinc-300 transition-colors">
                {cat.name}
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                {cat.count} product{cat.count !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Arrow indicator */}
            <div className="mt-6 flex items-center gap-2 text-sm text-zinc-600 group-hover:text-zinc-400 transition-colors">
              <span>Browse category</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
