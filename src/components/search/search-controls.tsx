'use client'

import { useCallback, useRef, useState } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'

/**
 * SearchControls — Client Component.
 *
 * Manages the search input state and updates URL search params.
 * URL params are the canonical search state (reload-safe, shareable).
 *
 * Auto-triggers after 3+ characters (debounced 400ms).
 * Also triggers on Enter key and search button click.
 *
 * The input is initialized from `initialQuery` (the server-rendered URL value).
 * It doesn't need to re-sync from the URL after the component mounts — if
 * the user navigates back/forward, Next.js re-renders the server component
 * which passes a fresh `initialQuery` prop.
 */
export function SearchControls({ initialQuery = '', placeholder = 'Search products…' }: { initialQuery?: string; placeholder?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [inputValue, setInputValue] = useState(initialQuery)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const updateQuery = useCallback(
    (q: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (q.trim()) {
        params.set('q', q.trim())
      } else {
        params.delete('q')
      }
      params.delete('page')
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [router, pathname, searchParams],
  )

  function handleChange(value: string) {
    setInputValue(value)

    // Clear previous debounce
    if (debounceRef.current) clearTimeout(debounceRef.current)

    // Auto-search after 3+ characters with 400ms debounce
    if (value.trim().length >= 3) {
      debounceRef.current = setTimeout(() => {
        updateQuery(value)
      }, 400)
    } else if (value.trim().length === 0) {
      // Clear search immediately when input is empty
      updateQuery('')
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (debounceRef.current) clearTimeout(debounceRef.current)
    updateQuery(inputValue)
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2" role="search">
      <div className="relative flex-1">
        <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-zinc-500"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </div>
        <input
          type="search"
          value={inputValue}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          aria-label="Search products"
          className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-900 pl-9 pr-4 text-sm text-white placeholder-zinc-500 outline-none transition-colors focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
        />
      </div>

      <button
        type="submit"
        className="h-10 rounded-md border border-zinc-700 bg-zinc-900 px-4 text-sm font-medium text-white transition-colors hover:border-zinc-500 hover:bg-zinc-800"
      >
        Search
      </button>
    </form>
  )
}
