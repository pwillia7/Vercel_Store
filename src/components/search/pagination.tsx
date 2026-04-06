'use client'

import Link from 'next/link'
import { useSearchParams, usePathname } from 'next/navigation'

interface PaginationProps {
  currentPage: number
  totalPages: number
}

/**
 * Pagination — Client Component.
 *
 * Renders page navigation using <Link> so each page is a real URL
 * (shareable, back/forward-safe). Preserves all existing URL params
 * (q, category, tags) and only updates the `page` param.
 */
export function Pagination({ currentPage, totalPages }: PaginationProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  if (totalPages <= 1) return null

  function buildHref(page: number) {
    const params = new URLSearchParams(searchParams.toString())
    if (page === 1) {
      params.delete('page')
    } else {
      params.set('page', String(page))
    }
    const qs = params.toString()
    return qs ? `${pathname}?${qs}` : pathname
  }

  /** Compute the sequence of page numbers / ellipsis markers to render. */
  function getPageItems(): (number | '...')[] {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    const items: (number | '...')[] = [1]

    const rangeStart = Math.max(2, currentPage - 1)
    const rangeEnd = Math.min(totalPages - 1, currentPage + 1)

    if (rangeStart > 2) items.push('...')

    for (let p = rangeStart; p <= rangeEnd; p++) items.push(p)

    if (rangeEnd < totalPages - 1) items.push('...')

    items.push(totalPages)
    return items
  }

  const items = getPageItems()
  const prevDisabled = currentPage <= 1
  const nextDisabled = currentPage >= totalPages

  const btnBase =
    'inline-flex h-9 min-w-[2.25rem] items-center justify-center rounded-md border px-2 text-sm font-medium transition-colors'
  const btnActive = 'border-white bg-white text-black'
  const btnDefault = 'border-zinc-700 bg-transparent text-zinc-400 hover:border-zinc-500 hover:text-white'
  const btnDisabled = 'border-zinc-800 text-zinc-700 pointer-events-none'

  return (
    <nav
      className="mt-8 flex items-center justify-center gap-1.5"
      aria-label="Pagination"
    >
      {/* Previous */}
      {prevDisabled ? (
        <span className={`${btnBase} ${btnDisabled}`} aria-disabled="true">
          ←
        </span>
      ) : (
        <Link
          href={buildHref(currentPage - 1)}
          className={`${btnBase} ${btnDefault}`}
          aria-label="Previous page"
          scroll={false}
        >
          ←
        </Link>
      )}

      {/* Page numbers */}
      {items.map((item, idx) =>
        item === '...' ? (
          <span key={`ellipsis-${idx}`} className="px-1 text-sm text-zinc-600">
            …
          </span>
        ) : (
          <Link
            key={item}
            href={buildHref(item)}
            className={`${btnBase} ${item === currentPage ? btnActive : btnDefault}`}
            aria-label={`Page ${item}`}
            aria-current={item === currentPage ? 'page' : undefined}
            scroll={false}
          >
            {item}
          </Link>
        ),
      )}

      {/* Next */}
      {nextDisabled ? (
        <span className={`${btnBase} ${btnDisabled}`} aria-disabled="true">
          →
        </span>
      ) : (
        <Link
          href={buildHref(currentPage + 1)}
          className={`${btnBase} ${btnDefault}`}
          aria-label="Next page"
          scroll={false}
        >
          →
        </Link>
      )}
    </nav>
  )
}
