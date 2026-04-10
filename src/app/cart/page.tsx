import { Suspense } from 'react'
import type { Metadata } from 'next'
import { getCart } from '@/lib/api/client'
import { getCartToken } from '@/lib/cart/cookie'
import { CartItemRow } from '@/components/cart/cart-item-row'
import { CartSummary } from '@/components/cart/cart-summary'
import { EmptyCart } from '@/components/cart/empty-cart'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Cart',
  description: 'Review and manage your cart.',
  robots: { index: false, follow: false },
}

/**
 * Cart page — synchronous shell + streamed content.
 *
 * The outer page renders immediately (TTFB = layout render only).
 * All async work is deferred into <CartContent> behind a <Suspense>
 * boundary so the "Your Cart" heading is the LCP element — it paints
 * with the first HTML chunk before any API call completes.
 *
 * Why not use cache / use cache: remote / use cache: private here?
 * See notes/caching.md → Cart Page section.
 */
export default function CartPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Your Cart</h1>
      </div>

      <Suspense fallback={<CartSkeleton />}>
        <CartContent />
      </Suspense>
    </div>
  )
}

/**
 * CartContent — async server component, deferred behind Suspense.
 *
 * All cookie reads and API calls live here so they don't block the
 * static shell above.
 */
async function CartContent() {
  const token = await getCartToken()

  if (!token) {
    return <EmptyCart />
  }

  let cart
  try {
    cart = await getCart(token)
  } catch {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="mb-2 text-zinc-400">Unable to load cart.</p>
        <p className="mb-6 text-sm text-zinc-600">
          Your cart may have expired. Please try adding items again.
        </p>
        <Link
          href="/search"
          className="inline-flex h-10 items-center rounded-md bg-white px-5 text-sm font-medium text-black hover:bg-zinc-200 transition-colors"
        >
          Browse Products
        </Link>
      </div>
    )
  }

  const items = cart.items ?? []

  if (items.length === 0) {
    return <EmptyCart />
  }

  const itemCount = cart.itemCount ?? items.length

  return (
    <>
      <p className="mb-6 text-sm text-zinc-500">
        {itemCount} {itemCount === 1 ? 'item' : 'items'}
      </p>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Line items */}
        <div className="lg:col-span-2">
          <div className="divide-y divide-zinc-800 rounded-lg border border-zinc-800">
            <div className="px-4">
              {items.map((item, index) => (
                <CartItemRow key={item.id ?? item.productId ?? String(index)} item={item} />
              ))}
            </div>
          </div>

          <Link
            href="/search"
            className="mt-4 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            ← Continue Shopping
          </Link>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <CartSummary cart={cart} />
        </div>
      </div>
    </>
  )
}

/**
 * CartSkeleton — Suspense fallback.
 *
 * Matches the populated-cart layout dimensions to prevent CLS when
 * the real content streams in.
 */
function CartSkeleton() {
  return (
    <div aria-hidden="true">
      {/* Item count line */}
      <div className="mb-6 h-4 w-16 rounded bg-zinc-800 skeleton" />

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Item rows */}
        <div className="lg:col-span-2">
          <div className="divide-y divide-zinc-800 rounded-lg border border-zinc-800">
            <div className="px-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex gap-4 py-4">
                  {/* Thumbnail */}
                  <div className="h-20 w-20 shrink-0 rounded-md bg-zinc-800 skeleton" />
                  {/* Text lines */}
                  <div className="flex flex-1 flex-col gap-2 pt-1">
                    <div className="h-4 w-3/4 rounded bg-zinc-800 skeleton" />
                    <div className="h-3 w-1/4 rounded bg-zinc-800 skeleton" />
                    <div className="mt-2 h-7 w-28 rounded bg-zinc-800 skeleton" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary panel */}
        <div className="lg:col-span-1">
          <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-6 space-y-3">
            <div className="h-4 w-32 rounded bg-zinc-800 skeleton" />
            <div className="h-3 w-full rounded bg-zinc-800 skeleton" />
            <div className="h-3 w-full rounded bg-zinc-800 skeleton" />
            <div className="my-4 border-t border-zinc-800" />
            <div className="h-4 w-24 rounded bg-zinc-800 skeleton" />
            <div className="mt-2 h-11 w-full rounded bg-zinc-800 skeleton" />
          </div>
        </div>
      </div>
    </div>
  )
}
