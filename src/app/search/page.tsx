import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getProducts, getCategories } from '@/lib/api/client'
import {
  filterProducts,
  extractAllTagFacets,
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

  // Stable tag list: all tags from the full catalog, counts from the
  // query/category-filtered set. Tags absent from current results get count=0
  // and render disabled — the list never shrinks, so the panel never shifts.
  const facets = extractAllTagFacets(allProducts, baseResults)

  // Full filtered set (for pagination math) — then slice to the current page
  const allResults = hasFilters
    ? filterProducts(allProducts, { query, category, tags: activeTags }, Infinity)
    : allProducts
  const totalCount = allResults.length
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)
  const results = allResults.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const showFilters = baseResults.length > 1
  // Always show the tag panel when there are any tags — hides only when the
  // catalog has no tags at all, keeping the layout stable across filter changes.
  const showTagFacets = facets.length > 0

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <SearchControls initialQuery={query ?? ''} />
        </div>
        {showFilters && (
          <CategoryFilter categories={categories} selected={category} />
        )}
      </div>

      {showTagFacets && (
        <div className="mb-8 rounded-lg border border-zinc-800 bg-zinc-950 p-4">
          <TagFacets facets={facets} activeTags={activeTags} />
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

      <Pagination currentPage={safePage} totalPages={totalPages} />
    </>
  )
}

/**
 * Search page — synchronous static shell.
 *
 * The page function has no top-level awaits — all data fetching lives in
 * SearchContent (the Suspense-wrapped dynamic hole) which reads searchParams
 * and fetches fresh on every request.
 *
 * The title and subtitle live here so they render immediately from the
 * static shell with no Suspense delay and no layout shift.
 */
export default function SearchPage({ searchParams }: SearchPageProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Static title — always visible, no loading state */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Search Products</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Search by name, description, or tag. Filter by category or collection.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="flex flex-col gap-6" aria-hidden="true">
            {/* Controls row: search form (input + button) + category filter */}
            <div className="mb-0 flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex flex-1 gap-2">
                <div className="h-10 flex-1 skeleton rounded-md" />
                <div className="h-10 w-20 skeleton rounded-md" />
              </div>
              <div className="flex w-full items-center gap-2 sm:w-auto">
                <div className="h-4 w-16 skeleton rounded shrink-0" />
                <div className="h-10 flex-1 skeleton rounded-md sm:flex-none sm:w-40" />
              </div>
            </div>
            {/* Tag facets panel — mirrors collapsed TagFacets: header + 8 pills + show-more */}
            <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
              <div className="flex flex-col gap-3">
                <div className="h-4 w-24 skeleton rounded" />
                <div className="min-h-[60px] flex flex-wrap gap-2">
                  {['w-14', 'w-20', 'w-16', 'w-24', 'w-14', 'w-20', 'w-16', 'w-14', 'w-20', 'w-16', 'w-24', 'w-14'].map((w, i) => (
                    <div key={i} className={`h-7 skeleton rounded-full ${w} ${i >= 8 ? 'hidden sm:flex' : ''}`} />
                  ))}
                </div>
                <div className="h-4 w-28 skeleton rounded sm:hidden" />
              </div>
            </div>
            {/* Product grid — columns=3 matches SearchResults default */}
            <ProductGridSkeleton count={6} columns={3} />
          </div>
        }
      >
        <SearchContent searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
