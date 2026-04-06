'use client'

import { useState, useEffect } from 'react'

export interface WishlistItem {
  id: string
  slug: string
  name: string
  price: number
  image?: string
  category?: string
  description?: string
  tags?: string[]
}

const STORAGE_KEY = 'wishlist'

function readList(): WishlistItem[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

function writeList(items: WishlistItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // ignore — private browsing, storage full, etc.
  }
}

interface WishlistButtonProps {
  product: WishlistItem
}

/**
 * WishlistButton — Client Component.
 *
 * Persists full product data (not just IDs) to localStorage so the wishlist
 * page can render without additional API calls.
 * Returns null on the server to avoid hydration mismatches.
 */
export function WishlistButton({ product }: WishlistButtonProps) {
  const [saved, setSaved] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setSaved(readList().some((item) => item.id === product.id))
  }, [product.id])

  function toggle() {
    const list = readList()
    if (saved) {
      writeList(list.filter((item) => item.id !== product.id))
    } else {
      writeList([product, ...list.filter((item) => item.id !== product.id)])
    }
    setSaved(!saved)
  }

  if (!mounted) return null

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
      aria-pressed={saved}
      className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
        saved
          ? 'text-red-400 hover:text-red-300'
          : 'text-zinc-500 hover:text-zinc-300'
      }`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill={saved ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      {saved ? 'Saved' : 'Save'}
    </button>
  )
}
