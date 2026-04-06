'use client'

import { useState, useRef, useLayoutEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import type { TagFacet } from '@/lib/search/filter-products'

interface TagFacetsProps {
  facets: TagFacet[]
  activeTags: string[]
}

/**
 * TagFacets — Client Component.
 *
 * Renders interactive tag filter pills. Facets are computed server-side from
 * the post-query/category product set and passed as props — this component
 * only handles the URL interaction, not any data fetching.
 *
 * Clicking a tag toggles it in the URL `tags` param (comma-separated).
 * Multiple tags use OR logic: products matching ANY selected tag are shown.
 *
 * Collapsed state shows only the pills that fit on one row. `useLayoutEffect`
 * measures which pills land on the first row and slices before the browser
 * paints, so no flash of the full list is visible. A ResizeObserver re-triggers
 * measurement when the container width changes.
 */
export function TagFacets({ facets, activeTags }: TagFacetsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [expanded, setExpanded] = useState(false)
  const [firstRowCount, setFirstRowCount] = useState<number | null>(null)
  const pillsRef = useRef<HTMLDivElement>(null)

  // Re-measure whenever the facet set changes or we collapse back
  useLayoutEffect(() => {
    if (expanded) return
    setFirstRowCount(null)
  }, [expanded, facets])

  // Count how many pills land on the first row.
  // Runs after every render where firstRowCount is null (measurement pass).
  // useLayoutEffect fires before the browser paints, so the full-list state
  // is never visible — the browser only paints the sliced result.
  useLayoutEffect(() => {
    if (expanded || firstRowCount !== null || !pillsRef.current) return
    const children = Array.from(pillsRef.current.children) as HTMLElement[]
    if (children.length === 0) return
    const firstTop = children[0].offsetTop
    const count = children.filter((c) => c.offsetTop === firstTop).length
    setFirstRowCount(count)
  })

  // Re-measure when the container is resized (e.g. window resize, sidebar toggle)
  useLayoutEffect(() => {
    const el = pillsRef.current
    if (!el) return
    const observer = new ResizeObserver(() => {
      if (!expanded) setFirstRowCount(null)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [expanded])

  if (facets.length === 0) return null

  // While measuring (firstRowCount === null) render all pills so offsetTop is accurate.
  // opacity-0 ensures they're invisible during the measurement pass.
  const isMeasuring = firstRowCount === null && !expanded
  const visibleFacets = expanded || firstRowCount === null
    ? facets
    : facets.slice(0, firstRowCount)
  const collapsible = firstRowCount !== null && facets.length > firstRowCount
  const hiddenCount = firstRowCount !== null ? facets.length - firstRowCount : 0

  function toggleTag(tag: string) {
    const params = new URLSearchParams(searchParams.toString())
    const current = activeTags.includes(tag)
      ? activeTags.filter((t) => t !== tag)
      : [...activeTags, tag]

    if (current.length > 0) {
      params.set('tags', current.join(','))
    } else {
      params.delete('tags')
    }
    params.delete('page')
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  function clearTags() {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('tags')
    params.delete('page')
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
          Filter by Tag
        </h3>
        {activeTags.length > 0 && (
          <button
            type="button"
            onClick={clearTags}
            className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      <div
        ref={pillsRef}
        className={`flex flex-wrap gap-2 ${isMeasuring ? 'opacity-0' : ''}`}
        role="group"
        aria-label="Tag filters"
      >
        {visibleFacets.map(({ tag, count }) => {
          const active = activeTags.includes(tag)
          return (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              aria-pressed={active}
              className={`
                inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs
                font-medium transition-colors
                ${
                  active
                    ? 'border-white bg-white text-black'
                    : 'border-zinc-700 bg-transparent text-zinc-400 hover:border-zinc-500 hover:text-white'
                }
              `}
            >
              {tag}
              <span className={`tabular-nums ${active ? 'text-zinc-500' : 'text-zinc-600'}`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {collapsible && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          {expanded ? '↑ Show less' : `↓ Show ${hiddenCount} more`}
        </button>
      )}
    </div>
  )
}
