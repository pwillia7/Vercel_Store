'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import type { Category } from '@/lib/api/types'

interface CategoryFilterProps {
  categories: Category[]
  selected?: string
}

/**
 * CategoryFilter — Client Component.
 *
 * Renders a select dropdown and updates the URL `category` param.
 * Works in tandem with SearchControls — all state lives in the URL.
 */
export function CategoryFilter({ categories, selected }: CategoryFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'all') {
      params.set('category', value)
    } else {
      params.delete('category')
    }
    params.delete('page')
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor="category-filter"
        className="text-sm text-zinc-400 whitespace-nowrap"
      >
        Category
      </label>
      <select
        id="category-filter"
        value={selected ?? 'all'}
        onChange={(e) => handleChange(e.target.value)}
        className="h-10 rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-white outline-none transition-colors focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
        aria-label="Filter by category"
      >
        <option value="all">All categories</option>
        {categories.map((cat) => (
          <option
            key={cat.id ?? cat.slug ?? cat.name}
            value={cat.slug ?? cat.name.toLowerCase().replace(/\s+/g, '-')}
          >
            {cat.name}
          </option>
        ))}
      </select>
    </div>
  )
}
