'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { formatPrice } from '@/lib/format/currency'

export interface RecentItem {
  id: string
  slug: string
  name: string
  price: number
  image?: string
}

const STORAGE_KEY = 'recently_viewed'
const MAX_ITEMS = 6

/**
 * Saves minimal product data to localStorage when mounted on a product page.
 * Renders nothing — pure side-effect component.
 */
export function RecentlyViewedTracker({ product }: { product: RecentItem }) {
  useEffect(() => {
    try {
      const stored: RecentItem[] = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
      const deduped = stored.filter((p) => p.id !== product.id)
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify([product, ...deduped].slice(0, MAX_ITEMS)),
      )
    } catch {
      // localStorage may be blocked (private browsing, etc.) — fail silently
    }
  }, [product.id]) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}

/**
 * Reads recently-viewed products from localStorage and renders a mini grid.
 * Shows nothing on first render (SSR) to avoid hydration mismatch.
 */
export function RecentlyViewedDisplay() {
  const [items, setItems] = useState<RecentItem[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setItems(JSON.parse(stored))
    } catch {
      // ignore
    }
  }, [])

  if (!mounted || items.length === 0) return null

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 border-t border-zinc-800">
      <h2 className="mb-6 text-lg font-semibold text-white">Recently Viewed</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/products/${item.slug}`}
            prefetch={true}
            className="group flex flex-col gap-2"
          >
            <div className="relative aspect-square w-full overflow-hidden rounded-md border border-zinc-800 bg-zinc-900">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-zinc-700">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <rect width="18" height="18" x="3" y="3" rx="2" />
                    <circle cx="9" cy="9" r="2" />
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                  </svg>
                </div>
              )}
            </div>
            <p className="text-xs font-medium text-white line-clamp-2 group-hover:text-zinc-300 transition-colors">
              {item.name}
            </p>
            <p className="text-xs text-zinc-500">{formatPrice(item.price)}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}
