'use client'

import { useState } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import type { TagFacet } from '@/lib/search/filter-products'

interface TagFacetsProps {
  facets: TagFacet[]
  activeTags: string[]
}

const MOBILE_THRESHOLD = 8
const DESKTOP_THRESHOLD = 12

/**
 * TagFacets — Client Component.
 *
 * Collapses to 8 tags on mobile and 12 on desktop by default.
 * Uses CSS (hidden sm:inline-flex) for the mobile/desktop split so there's
 * no JS breakpoint detection and no hydration mismatch.
 * Active tags are always surfaced above the threshold.
 * No DOM measurement — array slicing only, so layout is stable.
 */
export function TagFacets({ facets, activeTags }: TagFacetsProps) {
  const [expanded, setExpanded] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  if (facets.length === 0) return null

  // Render up to DESKTOP_THRESHOLD pills (plus any active tags beyond it).
  const visibleFacets = expanded
    ? facets
    : facets.filter((f, i) => i < DESKTOP_THRESHOLD || activeTags.includes(f.tag))

  const needsMobileCollapse = facets.length > MOBILE_THRESHOLD
  const needsDesktopCollapse = facets.length > DESKTOP_THRESHOLD
  const mobileHiddenCount = facets.length - MOBILE_THRESHOLD
  const desktopHiddenCount = facets.length - DESKTOP_THRESHOLD

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

      <div className="flex flex-wrap gap-2" role="group" aria-label="Tag filters">
        {visibleFacets.map(({ tag, count }, index) => {
          const active = activeTags.includes(tag)
          const isDisabled = count === 0 && !active
          // Pills 8–11 are CSS-hidden on mobile; revealed on sm+ without JS.
          const hiddenOnMobile = !expanded && index >= MOBILE_THRESHOLD && !active

          return (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              disabled={isDisabled}
              aria-pressed={active}
              className={`${hiddenOnMobile ? 'hidden sm:inline-flex' : 'inline-flex'} items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                isDisabled
                  ? 'cursor-not-allowed border-zinc-800 text-zinc-600'
                  : active
                  ? 'border-white bg-white text-black'
                  : 'border-zinc-700 bg-transparent text-zinc-400 hover:border-zinc-500 hover:text-white'
              }`}
            >
              {tag}
              <span
                className={`tabular-nums ${
                  active ? 'text-zinc-500' : isDisabled ? 'text-zinc-700' : 'text-zinc-600'
                }`}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Show more / less — separate buttons per breakpoint to display correct counts */}
      {!expanded && needsMobileCollapse && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="sm:hidden text-xs text-zinc-500 hover:text-zinc-300 transition-colors text-left"
        >
          ↓ Show {mobileHiddenCount} more
        </button>
      )}
      {!expanded && needsDesktopCollapse && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="hidden sm:block text-xs text-zinc-500 hover:text-zinc-300 transition-colors text-left"
        >
          ↓ Show {desktopHiddenCount} more
        </button>
      )}
      {expanded && needsMobileCollapse && (
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors text-left"
        >
          ↑ Show less
        </button>
      )}
    </div>
  )
}
