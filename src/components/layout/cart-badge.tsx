import { getCart } from '@/lib/api/client'
import { getCartToken } from '@/lib/cart/cookie'
import Link from 'next/link'

/**
 * CartBadge — Server Component, always dynamic.
 *
 * Reads the session cookie and fetches the current cart count.
 * Wrapped in Suspense in the Header so it doesn't block cached layout content.
 */
export async function CartBadge() {
  const token = await getCartToken()

  let itemCount = 0
  if (token) {
    try {
      const cart = await getCart(token)
      itemCount = cart.itemCount ?? cart.items?.length ?? 0
    } catch {
      // Cart fetch failed — show 0. Don't crash the layout.
    }
  }

  return (
    <Link
      href="/cart"
      className="relative flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
      aria-label={`Cart${itemCount > 0 ? `, ${itemCount} item${itemCount !== 1 ? 's' : ''}` : ', empty'}`}
    >
      {/* Shopping bag icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>

      {itemCount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-white text-black text-[10px] font-bold leading-none">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}

      <span className="hidden sm:inline text-sm">Cart</span>
    </Link>
  )
}

/** Fallback shown while CartBadge is streaming in */
export function CartBadgeFallback() {
  return (
    <div className="flex items-center gap-2 text-zinc-600" aria-hidden="true">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
      <span className="hidden sm:inline text-sm">Cart</span>
    </div>
  )
}
