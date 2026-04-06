import type { Product } from '@/lib/api/types'

export interface FilterOptions {
  query?: string
  category?: string
  /** OR logic: a product matches if it has at least one of the selected tags */
  tags?: string[]
}

export interface TagFacet {
  tag: string
  /** Number of products carrying this tag in the current result set */
  count: number
}

/**
 * Filter a product list in-memory using query, category, and tags.
 *
 * Application order:
 *   1. category — exact slug/name match
 *   2. query    — substring across name, description, category, tags
 *   3. tags     — OR logic: product must have at least one selected tag
 *
 * Pass limit=Infinity to return all matches (e.g. for category pages).
 * Default limit=5 satisfies the search page spec.
 */
export function filterProducts(
  products: Product[],
  { query, category, tags }: FilterOptions,
  limit = 5,
): Product[] {
  let results = products

  if (category && category !== 'all') {
    results = results.filter(
      (p) =>
        p.category.toLowerCase() === category.toLowerCase() ||
        p.category.toLowerCase().replace(/\s+/g, '-') === category.toLowerCase(),
    )
  }

  if (query && query.trim().length > 0) {
    const q = query.trim().toLowerCase()
    results = results.filter((p) => {
      const searchable = [p.name, p.description, p.category, ...(p.tags ?? [])]
        .join(' ')
        .toLowerCase()
      return searchable.includes(q)
    })
  }

  if (tags && tags.length > 0) {
    const normalised = tags.map((t) => t.toLowerCase())
    results = results.filter((p) =>
      (p.tags ?? []).some((t) => normalised.includes(t.toLowerCase())),
    )
  }

  return limit === Infinity ? results : results.slice(0, limit)
}

/**
 * Extract tag facets from a product set.
 *
 * Facets are computed from the pre-tag-filtered product set (i.e. after
 * applying query + category but before applying tag filters). This lets
 * users see how many products each tag would add/keep without the counts
 * collapsing as they select tags.
 *
 * Returns tags sorted by count descending.
 */
export function extractTagFacets(products: Product[]): TagFacet[] {
  const counts = new Map<string, number>()
  for (const product of products) {
    for (const tag of product.tags ?? []) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1)
    }
  }
  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
}

/**
 * Parse a comma-separated tags URL param into a string array.
 * e.g. "sale,new-arrival" → ["sale", "new-arrival"]
 */
export function parseTagsParam(raw: string | undefined): string[] {
  if (!raw) return []
  return raw
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
}
