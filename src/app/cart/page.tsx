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
 * Cart page — Server Component, always fully dynamic.
 *
 * This page reads the session cookie (making it dynamic by default) and
 * always fetches fresh cart data. We do NOT cache cart data because:
 *   1. It's session-specific (per cart token)
 *   2. It changes on every add/update/remove action
 *   3. Stale cart data could lead to inventory/pricing issues
 *
 * After Server Actions mutate the cart, revalidatePath('/cart') ensures
 * this page re-renders with fresh data on the next navigation.
 */
export default async function CartPage() {
  const token = await getCartToken()

  // No cart token = no cart session = empty cart
  if (!token) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <PageHeader itemCount={0} />
        <EmptyCart />
      </div>
    )
  }

  let cart
  try {
    cart = await getCart(token)
  } catch {
    // Cart fetch failed (token expired, service down, etc.)
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <PageHeader itemCount={0} />
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
      </div>
    )
  }

  const items = cart.items ?? []
  const itemCount = cart.itemCount ?? items.length

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <PageHeader itemCount={0} />
        <EmptyCart />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <PageHeader itemCount={itemCount} />

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
    </div>
  )
}

function PageHeader({ itemCount }: { itemCount: number }) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-white">
        Your Cart
        {itemCount > 0 && (
          <span className="ml-2 text-lg font-normal text-zinc-500">
            ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </span>
        )}
      </h1>
    </div>
  )
}
