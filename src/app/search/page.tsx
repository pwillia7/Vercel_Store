import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getProducts, getCategories } from '@/lib/api/client'
import {
  filterProducts,
  extractTagFacets,
  parseTagsParam,
} from '@/lib/search/filter-products'
import { SearchControls } from '@/components/search/search-controls'
import { CategoryFilter } from '@/components/search/category-filter'
import { SearchResults } from '@/components/search/search-results'
import { TagFacets } from '@/components/search/tag-facets'
import { Pagination } from '@/components/search/pagination'
import { ProductGridSkeleton } from '@/components/ui/skeleton'

const PAGE_SIZE = 5

interface SearchPageProps {
  searchParams: Promise<{
    q?: string
    category?: string
    tags?: string
    page?: string
  }>
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams
  const title = q ? `Search: "${q}"` : 'Search Products'
  return {
    title,
    description: q
      ? `Search results for "${q}" in the Vercel Swag Store.`
      : 'Search and filter our full catalog of developer merchandise.',
    openGraph: {
      title: `${title} | Vercel Swag Store`,
      description: 'Find the perfect developer swag.',
    },
    robots: { index: false, follow: true },
  }
}

/**
 * SearchContent — async Server Component, the dynamic PPR hole.
 *
 * Awaiting `searchParams` here (not in the page function) is what makes this
 * the dynamic boundary. Because it's wrapped in a Suspense by the page, PPR
 * serves the static outer shell immediately and streams this content in
 * per-request with the real filter params.
 *
 * Filtering pipeline:
 *   allProducts → [category + query] → baseResults
 *   baseResults → extractTagFacets() → facets
 *   baseResults → [tags] → [limit 5] → results
 */
async function SearchContent({ searchParams }: SearchPageProps) {
  const { q: query, category, tags: tagsParam, page: pageParam } = await searchParams
  const activeTags = parseTagsParam(tagsParam)
  const currentPage = Math.max(1, parseInt(pageParam ?? '1', 10) || 1)

  const [allProducts, allCategories] = await Promise.all([getProducts(), getCategories()])

  const categories = allCategories.filter((cat) => {
    const slug = cat.slug ?? cat.name.toLowerCase().replace(/\s+/g, '-')
    return filterProducts(allProducts, { category: slug }, Infinity).length > 0
  })

  const hasFilters = Boolean(query || (category && category !== 'all') || activeTags.length > 0)
  const baseResults = filterProducts(allProducts, { query, category }, Infinity)
  const facets = extractTagFacets(baseResults)

  // Full filtered set (for pagination math) — then slice to the current page
  const allResults = hasFilters
    ? filterProducts(allProducts, { query, category, tags: activeTags }, Infinity)
    : allProducts
  const totalCount = allResults.length
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)
  const results = allResults.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  // Show filters based on the pre-tag result set — using totalCount (post-tag)
  // would hide the tag cloud when deselecting a tag narrows results to 1.
  const showFilters = baseResults.length > 1
  const allTagsMatchAll = facets.length > 0 && facets.every((f) => f.count === baseResults.length)
  const showTagFacets = showFilters && facets.length > 0 && !allTagsMatchAll

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          {query ? `Results for "${query}"` : 'Search Products'}
        </h1>
        {!hasFilters && (
          <p className="mt-1 text-sm text-zinc-500">
            Search by name, description, or tag. Filter by category or collection.
          </p>
        )}
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Suspense fallback={<div className="h-10 w-full skeleton rounded-md" aria-hidden="true" />}>
            <SearchControls initialQuery={query ?? ''} />
          </Suspense>
        </div>
        {showFilters && (
          <Suspense fallback={<div className="h-10 w-40 skeleton rounded-md" aria-hidden="true" />}>
            <CategoryFilter categories={categories} selected={category} />
          </Suspense>
        )}
      </div>

      {showTagFacets && (
        <div className="mb-8 rounded-lg border border-zinc-800 bg-zinc-950 p-4">
          <Suspense fallback={null}>
            <TagFacets facets={facets} activeTags={activeTags} />
          </Suspense>
        </div>
      )}

      {/* priorityCount=4: first row on desktop (4 cols) preloaded as LCP */}
      <SearchResults
        products={results}
        query={query}
        hasSearched={hasFilters}
        activeTags={activeTags}
        totalBeforeLimit={totalCount}
        priorityCount={4}
      />

      <Suspense fallback={null}>
        <Pagination currentPage={safePage} totalPages={totalPages} />
      </Suspense>
    </>
  )
}

/**
 * Search page — static shell.
 *
 * The page function itself does NOT await `searchParams`, keeping it part of
 * the PPR static shell. All filter logic lives in SearchContent (above), which
 * is the Suspense-wrapped dynamic hole rendered fresh on every request.
 */
export default async function SearchPage({ searchParams }: SearchPageProps) {
  const products = await getProducts()
  const lcpImageUrl = products[0]?.images?.[0] ?? null

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* LCP preload — browser starts fetching the first product image at static
          shell time, before SearchContent's Suspense boundary resolves. */}
      {lcpImageUrl && (
        <link rel="preload" as="image" href={lcpImageUrl} fetchPriority="high" />
      )}
      <Suspense
        fallback={
          <div className="flex flex-col gap-8" aria-hidden="true">
            {/* Title — matches h1 text-2xl line-height */}
            <div className="h-8 w-48 skeleton rounded" />
            {/* Controls row — matches SearchControls h-10 + CategoryFilter h-10 */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="h-10 flex-1 skeleton rounded-md" />
              <div className="h-10 w-40 skeleton rounded-md" />
            </div>
            {/* Grid — gap-6 and columns match ProductGrid default (columns=4) */}
            <ProductGridSkeleton count={8} columns={4} />
          </div>
        }
      >
        <SearchContent searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
