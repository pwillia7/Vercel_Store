'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { formatPrice } from '@/lib/format/currency'
import { CompareTable } from './compare-table'
import type { WishlistItem } from '@/components/products/wishlist-button'

const STORAGE_KEY = 'wishlist'
const MAX_COMPARE = 4

interface WishlistDisplayProps {
  comparisonEnabled?: boolean
}

export function WishlistDisplay({ comparisonEnabled = false }: WishlistDisplayProps) {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [mounted, setMounted] = useState(false)
  const [selected, setSelected] = useState<string[]>([])
  const [comparing, setComparing] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      setItems(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'))
    } catch {
      setItems([])
    }
  }, [])

  function remove(id: string) {
    const updated = items.filter((item) => item.id !== id)
    setItems(updated)
    setSelected((s) => s.filter((sid) => sid !== id))
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    } catch {}
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((sid) => sid !== id)
      if (prev.length >= MAX_COMPARE) return prev
      return [...prev, id]
    })
    setComparing(false)
  }

  function clearComparison() {
    setSelected([])
    setComparing(false)
  }

  if (!mounted) return null

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-4 text-zinc-700" aria-hidden="true">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        <p className="text-zinc-400 font-medium">Your wishlist is empty</p>
        <p className="mt-1 text-sm text-zinc-600">Save items from product pages to find them here later.</p>
        <Link href="/search" className="mt-6 inline-flex h-10 items-center rounded-md bg-white px-5 text-sm font-medium text-black hover:bg-zinc-200 transition-colors">
          Browse Products
        </Link>
      </div>
    )
  }

  const atMax = selected.length >= MAX_COMPARE
  const selectedItems = items.filter((item) => selected.includes(item.id))

  return (
    <>
      {/* Product grid */}
      <div className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${selected.length > 0 ? 'pb-28' : ''}`}>
        {items.map((item) => {
          const isSelected = selected.includes(item.id)
          const isDisabled = comparisonEnabled && atMax && !isSelected

          return (
            <div
              key={item.id}
              className={`group relative flex flex-col rounded-lg border bg-zinc-950 overflow-hidden transition-all ${
                isSelected
                  ? 'border-white ring-1 ring-white'
                  : isDisabled
                  ? 'border-zinc-800 opacity-40'
                  : 'border-zinc-800'
              }`}
            >
              {/* Compare checkbox — shown when feature is on */}
              {comparisonEnabled && (
                <button
                  type="button"
                  onClick={() => toggleSelect(item.id)}
                  disabled={isDisabled}
                  aria-label={isSelected ? `Remove ${item.name} from comparison` : `Add ${item.name} to comparison`}
                  aria-pressed={isSelected}
                  className={`absolute left-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded border text-xs font-bold transition-colors disabled:cursor-not-allowed ${
                    isSelected
                      ? 'border-white bg-white text-black'
                      : 'border-zinc-600 bg-black/60 text-transparent hover:border-zinc-400'
                  }`}
                >
                  ✓
                </button>
              )}

              {/* Remove button */}
              <button
                type="button"
                onClick={() => remove(item.id)}
                aria-label={`Remove ${item.name} from wishlist`}
                className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-zinc-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>

              {/* Image */}
              <Link href={`/products/${item.slug}`} prefetch={true} className="block">
                <div className="relative aspect-square w-full bg-zinc-900">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover transition-transform duration-300 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-zinc-700">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                        <rect width="18" height="18" x="3" y="3" rx="2" />
                        <circle cx="9" cy="9" r="2" />
                        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                      </svg>
                    </div>
                  )}
                </div>
              </Link>

              {/* Info */}
              <div className="flex flex-1 flex-col gap-3 p-4">
                <div>
                  <Link href={`/products/${item.slug}`} prefetch={true} className="text-sm font-medium text-white hover:text-zinc-300 transition-colors line-clamp-2">
                    {item.name}
                  </Link>
                  <p className="mt-1 text-sm text-zinc-400">{formatPrice(item.price)}</p>
                </div>
                <Link href={`/products/${item.slug}`} prefetch={true} className="mt-auto inline-flex h-9 items-center justify-center rounded-md border border-zinc-700 px-4 text-xs font-medium text-white transition-colors hover:border-zinc-500 hover:bg-zinc-900">
                  View Product
                </Link>
              </div>
            </div>
          )
        })}
      </div>

      {/* Comparison table */}
      {comparing && selected.length >= 2 && (
        <CompareTable
          items={selectedItems}
          onClose={() => setComparing(false)}
        />
      )}

      {/* Sticky comparison bar — appears when 2+ items selected */}
      {comparisonEnabled && selected.length >= 2 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800 bg-black/95 backdrop-blur-sm">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
            {/* Selected thumbnails */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex -space-x-2">
                {selectedItems.map((item) => (
                  <div key={item.id} className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md border-2 border-black bg-zinc-900">
                    {item.image
                      ? <Image src={item.image} alt={item.name} fill sizes="36px" className="object-cover" />
                      : <div className="flex h-full items-center justify-center bg-zinc-800" />}
                  </div>
                ))}
              </div>
              <span className="text-sm text-zinc-400 truncate">
                {selected.length} of {MAX_COMPARE} selected
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={clearComparison}
                className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => {
                  setComparing(true)
                  document.getElementById('compare-table')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
                className="inline-flex h-9 items-center rounded-md bg-white px-4 text-sm font-medium text-black hover:bg-zinc-200 transition-colors"
              >
                Compare {selected.length} items
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
