import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import { getCategories, getProducts } from '@/lib/api/client'
import {
  filterProducts,
  extractTagFacets,
  parseTagsParam,
} from '@/lib/search/filter-products'
import { SearchControls } from '@/components/search/search-controls'
import { TagFacets } from '@/components/search/tag-facets'
import { SearchResults } from '@/components/search/search-results'
import { ProductGridSkeleton } from '@/components/ui/skeleton'
import type { Category } from '@/lib/api/types'

interface CategoryPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ q?: string; tags?: string }>
}

/** Synthetic category used for the "All Products" meta-category. */
const ALL_CATEGORY = { name: 'All Products', slug: 'all' } as const

export async function generateStaticParams() {
  try {
    const categories = await getCategories()
    return [
      { slug: 'all' },
      ...categories.map((cat) => ({
        slug: cat.slug ?? cat.name.toLowerCase().replace(/\s+/g, '-'),
      })),
    ]
  } catch {
    return [{ slug: 'all' }]
  }
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params

  if (slug === 'all') {
    return {
      title: 'All Products',
      description: 'Browse every product in the Vercel Swag Store.',
      openGraph: {
        title: 'All Products | Vercel Swag Store',
        description: 'Shop the full range of Vercel developer merchandise.',
      },
    }
  }

  const categories = await getCategories()
  const cat = categories.find(
    (c) => (c.slug ?? c.name.toLowerCase().replace(/\s+/g, '-')) === slug,
  )

  if (!cat) return { title: 'Category' }

  return {
    title: cat.name,
    description: `Browse the ${cat.name} category in the Vercel Swag Store.`,
    openGraph: {
      title: `${cat.name} | Vercel Swag Store`,
      description: `Shop ${cat.name} developer merchandise.`,
    },
  }
}

/**
 * CategoryFilterContent — async Server Component, the dynamic PPR hole.
 *
 * Awaiting `searchParams` here makes this the dynamic boundary. The page
 * function (below) serves as the static shell — breadcrumb and category
 * header render immediately from the pre-rendered cache. This component
 * streams in per-request with the real query/tag filters applied.
 */
async function CategoryFilterContent({
  slug,
  categoryProductCount,
  searchParams,
}: {
  slug: string
  categoryProductCount: number
  searchParams: CategoryPageProps['searchParams']
}) {
  const { q: query, tags: tagsParam } = await searchParams
  const activeTags = parseTagsParam(tagsParam)

  const allProducts = await getProducts()

  // 'all' is a meta-category — no category filter applied
  const categoryProducts =
    slug === 'all'
      ? allProducts
      : filterProducts(allProducts, { category: slug }, Infinity)

  const baseResults = query
    ? filterProducts(categoryProducts, { query }, Infinity)
    : categoryProducts
  const facets = extractTagFacets(baseResults)
  const results =
    activeTags.length > 0
      ? filterProducts(baseResults, { tags: activeTags }, Infinity)
      : baseResults
  const hasFilters = Boolean(query || activeTags.length > 0)

  // Hide tag facets when there's only one result, or when every tag applies to
  // every product in the set (tag filtering wouldn't narrow anything)
  const showTagFacets =
    results.length > 1 &&
    facets.length > 0 &&
    !facets.every((f) => f.count === baseResults.length)

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
      <aside className="w-full shrink-0 lg:w-56">
        <div className="mb-6">
          <SearchControls initialQuery={query ?? ''} placeholder="Search" />
        </div>

        {showTagFacets && (
          <TagFacets facets={facets} activeTags={activeTags} />
        )}

        {hasFilters && (
          <div className="mt-6">
            <Link
              href={`/categories/${slug}`}
              className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
            >
              ← Clear all filters
            </Link>
          </div>
        )}
      </aside>

      <div className="flex-1 min-w-0">
        {/* priorityCount=3: first row on desktop (3 cols) preloaded as LCP */}
        <SearchResults
          products={results}
          query={query}
          hasSearched={hasFilters}
          activeTags={activeTags}
          columns={3}
          priorityCount={3}
        />

        {!hasFilters && results.length > 0 && (
          <p className="mt-6 text-sm text-zinc-600">
            Showing all {categoryProductCount} products
          </p>
        )}
      </div>
    </div>
  )
}

/**
 * Category detail page.
 *
 * URL: /categories/[slug]?q=...&tags=sale,new-arrival
 *
 * The special slug "all" acts as a meta-category showing every product.
 *
 * Static shell: breadcrumb + header (rendered from cached data, no searchParams).
 * Dynamic hole: CategoryFilterContent (Suspense) — rendered per-request with
 * real query/tag filters. This is the PPR-correct way to handle filter params
 * without the `dynamic = 'force-dynamic'` route config (incompatible with
 * cacheComponents).
 */
export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params
  const isAll = slug === 'all'

  // Both fetches are "use cache" — return instantly, safe in the static shell
  const [categories, allProducts] = await Promise.all([getCategories(), getProducts()])

  const category: { name: string; slug: string } = isAll
    ? ALL_CATEGORY
    : ((categories.find(
        (c) => (c.slug ?? c.name.toLowerCase().replace(/\s+/g, '-')) === slug,
      ) as Category | undefined) ?? notFound())

  const categoryProducts = isAll
    ? allProducts
    : filterProducts(allProducts, { category: slug }, Infinity)
  const categoryProductCount = categoryProducts.length

  // Preload the first product image so the browser starts fetching it
  // at static shell time, before the Suspense/dynamic hole resolves.
  const lcpImageUrl = categoryProducts[0]?.images?.[0] ?? null

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* LCP preload — tells the browser to fetch the first product image before
          the Suspense/dynamic hole resolves, closing the discovery gap. */}
      {lcpImageUrl && (
        <link rel="preload" as="image" href={lcpImageUrl} fetchPriority="high" />
      )}

      {/* Breadcrumb — static */}
      <nav className="mb-8 flex items-center gap-2 text-sm text-zinc-500" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-zinc-300 transition-colors">Home</Link>
        <span aria-hidden="true">/</span>
        <Link href="/categories" className="hover:text-zinc-300 transition-colors">Categories</Link>
        <span aria-hidden="true">/</span>
        <span className="text-zinc-400">{category.name}</span>
      </nav>

      {/* Header — static (category name + total count from cache) */}
      <div className="mb-10">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-500">
          Category
        </p>
        <h1 className="text-3xl font-bold text-white">{category.name}</h1>
        <p className="mt-2 text-sm text-zinc-400">
          {categoryProductCount} product{categoryProductCount !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Filter content — dynamic PPR hole, streamed per-request */}
      <Suspense
        fallback={
          <div className="flex flex-col gap-8 lg:flex-row lg:gap-10" aria-hidden="true">
            {/* Sidebar — matches aside w-56 + SearchControls h-10 */}
            <div className="w-full shrink-0 lg:w-56">
              <div className="h-10 w-full skeleton rounded-md" />
            </div>
            {/* Grid — gap-6 and columns match SearchResults columns={3} */}
            <div className="flex-1 min-w-0">
              <ProductGridSkeleton count={6} columns={3} />
            </div>
          </div>
        }
      >
        <CategoryFilterContent
          slug={slug}
          categoryProductCount={categoryProductCount}
          searchParams={searchParams}
        />
      </Suspense>
    </div>
  )
}
