'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { formatPrice } from '@/lib/format/currency'
import { addToCart } from '@/app/actions/cart'
import type { WishlistItem } from '@/components/products/wishlist-button'

function AddToCartButton({ productId }: { productId: string }) {
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  function handleAdd() {
    startTransition(async () => {
      const result = await addToCart(productId, 1)
      setStatus(result.success ? 'success' : 'error')
      if (result.success) setTimeout(() => setStatus('idle'), 2500)
    })
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={isPending}
      className={`inline-flex h-9 items-center justify-center rounded-md border px-4 text-xs font-medium transition-colors disabled:cursor-not-allowed ${
        status === 'success'
          ? 'border-emerald-700 bg-emerald-950 text-emerald-400'
          : status === 'error'
          ? 'border-red-800 bg-red-950 text-red-400'
          : 'border-zinc-700 bg-zinc-900 text-white hover:border-zinc-500 hover:bg-zinc-800'
      }`}
    >
      {isPending ? 'Adding…' : status === 'success' ? 'Added ✓' : status === 'error' ? 'Failed' : 'Add to Cart'}
    </button>
  )
}

interface CompareTableProps {
  items: WishlistItem[]
  onClose: () => void
}

const PlaceholderImage = () => (
  <div className="flex h-full items-center justify-center text-zinc-700">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  </div>
)

export function CompareTable({ items, onClose }: CompareTableProps) {
  return (
    <div id="compare-table" className="mt-12 rounded-lg border border-zinc-800 bg-zinc-950 overflow-hidden">
      <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
        <h2 className="font-semibold text-white">
          Comparing {items.length} product{items.length !== 1 ? 's' : ''}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          Close ✕
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800">
              {/* Sticky label column */}
              <th className="w-28 shrink-0 p-4 bg-zinc-950 sticky left-0 z-10" aria-hidden="true" />
              {items.map((item) => (
                <th key={item.id} className="min-w-52 p-4 text-left align-top">
                  <div className="flex flex-col gap-3">
                    <div className="relative aspect-square w-36 overflow-hidden rounded-md border border-zinc-800 bg-zinc-900">
                      {item.image
                        ? <Image src={item.image} alt={item.name} fill sizes="144px" className="object-cover" />
                        : <PlaceholderImage />}
                    </div>
                    <Link
                      href={`/products/${item.slug}`}
                      prefetch={true}
                      className="text-sm font-medium text-white hover:text-zinc-300 transition-colors leading-snug"
                    >
                      {item.name}
                    </Link>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {/* Price */}
            <tr className="border-b border-zinc-800/50">
              <td className="p-4 text-xs font-semibold uppercase tracking-widest text-zinc-500 bg-zinc-950 sticky left-0 z-10 align-middle">
                Price
              </td>
              {items.map((item) => (
                <td key={item.id} className="p-4 align-middle">
                  <span className="text-lg font-semibold text-white">{formatPrice(item.price)}</span>
                </td>
              ))}
            </tr>

            {/* Category */}
            <tr className="border-b border-zinc-800/50">
              <td className="p-4 text-xs font-semibold uppercase tracking-widest text-zinc-500 bg-zinc-950 sticky left-0 z-10 align-top">
                Category
              </td>
              {items.map((item) => (
                <td key={item.id} className="p-4 align-top">
                  {item.category
                    ? <span className="text-sm text-zinc-300 capitalize">{item.category}</span>
                    : <span className="text-zinc-600">—</span>}
                </td>
              ))}
            </tr>

            {/* Description */}
            <tr className="border-b border-zinc-800/50">
              <td className="p-4 text-xs font-semibold uppercase tracking-widest text-zinc-500 bg-zinc-950 sticky left-0 z-10 align-top">
                Description
              </td>
              {items.map((item) => (
                <td key={item.id} className="p-4 align-top">
                  {item.description
                    ? <p className="text-sm text-zinc-400 leading-relaxed line-clamp-4">{item.description}</p>
                    : <span className="text-zinc-600">—</span>}
                </td>
              ))}
            </tr>

            {/* Tags */}
            <tr className="border-b border-zinc-800/50">
              <td className="p-4 text-xs font-semibold uppercase tracking-widest text-zinc-500 bg-zinc-950 sticky left-0 z-10 align-top">
                Tags
              </td>
              {items.map((item) => (
                <td key={item.id} className="p-4 align-top">
                  {item.tags && item.tags.length > 0
                    ? (
                      <div className="flex flex-wrap gap-1">
                        {item.tags.map((tag) => (
                          <span key={tag} className="inline-flex items-center rounded-full border border-zinc-800 px-2 py-0.5 text-xs text-zinc-500">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )
                    : <span className="text-zinc-600">—</span>}
                </td>
              ))}
            </tr>

            {/* CTAs */}
            <tr>
              <td className="p-4 bg-zinc-950 sticky left-0 z-10" />
              {items.map((item) => (
                <td key={item.id} className="p-4 align-middle">
                  <div className="flex flex-col gap-2">
                    <AddToCartButton productId={item.id} />
                    <Link
                      href={`/products/${item.slug}`}
                      prefetch={true}
                      className="inline-flex h-9 items-center justify-center rounded-md bg-white px-4 text-xs font-medium text-black hover:bg-zinc-200 transition-colors"
                    >
                      View Product →
                    </Link>
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
