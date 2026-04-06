import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getFeatureFlags } from '@/lib/config/features'
import { WishlistDisplay } from '@/components/wishlist/wishlist-display'

export const metadata: Metadata = {
  title: 'Wishlist',
  description: 'Your saved products.',
  robots: { index: false, follow: false },
}

/**
 * Wishlist page — gated by the `wishlist` feature flag.
 * Returns 404 if the feature is disabled so the route doesn't exist publicly.
 * All wishlist data is read from localStorage client-side — no API calls needed.
 */
export default async function WishlistPage() {
  const flags = await getFeatureFlags()
  if (!flags.wishlist) notFound()

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Wishlist</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Your saved products, stored locally on this device.
          {flags.productComparison && (
            <> Select up to {4} items to compare them side by side.</>
          )}
        </p>
      </div>
      <WishlistDisplay comparisonEnabled={flags.productComparison} />
    </div>
  )
}
