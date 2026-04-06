import Link from 'next/link'
import { Suspense } from 'react'
import { CartBadge, CartBadgeFallback } from './cart-badge'
import { getFeatureFlags } from '@/lib/config/features'
import { getStoreConfig } from '@/lib/api/client'
import { ThemeToggle } from '@/components/theme/theme-toggle'
import { MobileMenu } from './mobile-menu'

/**
 * Header — async Server Component.
 *
 * Both getFeatureFlags() and getStoreConfig() are cached for weeks —
 * calling them here adds no latency after the first request.
 * CartBadge is isolated in Suspense because it reads the session cookie.
 *
 * Layout:
 *   Mobile (<md):  logo | theme + cart + hamburger
 *   Desktop (md+): logo | Home · Search · Categories · [Wishlist] · theme · cart
 */
export async function Header() {
  const [flags, config] = await Promise.all([getFeatureFlags(), getStoreConfig()])
  const storeName = config?.storeName ?? 'Swag Store'

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-black/90 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity shrink-0"
          aria-label={`${storeName} — Home`}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path d="M10 1L19 17H1L10 1Z" fill="currentColor" />
          </svg>
          <span className="text-sm font-semibold tracking-tight">{storeName}</span>
        </Link>

        {/* Desktop nav (md+) */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
          <Link href="/" className="text-sm text-zinc-400 hover:text-white transition-colors">
            Home
          </Link>
          <Link href="/search" className="text-sm text-zinc-400 hover:text-white transition-colors">
            Search
          </Link>
          <Link href="/categories" className="text-sm text-zinc-400 hover:text-white transition-colors">
            Categories
          </Link>

          {flags.wishlist && (
            <Link
              href="/wishlist"
              className="text-zinc-400 hover:text-white transition-colors"
              aria-label="Wishlist"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </Link>
          )}

          <ThemeToggle />

          <Suspense fallback={<CartBadgeFallback />}>
            <CartBadge />
          </Suspense>
        </nav>

        {/* Mobile right-side actions (< md) */}
        <div className="flex md:hidden items-center gap-1">
          <ThemeToggle />
          <Suspense fallback={<CartBadgeFallback />}>
            <CartBadge />
          </Suspense>
          <MobileMenu showWishlist={flags.wishlist} />
        </div>

      </div>
    </header>
  )
}
