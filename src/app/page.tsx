import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getStoreConfig } from '@/lib/api/client'
import { Hero } from '@/components/home/hero'
import { PromoBanner, PromoBannerFallback } from '@/components/home/promo-banner'
import { FeaturedProducts } from '@/components/home/featured-products'
import { RecentlyViewedSection } from '@/components/home/recently-viewed'
import { ProductGridSkeleton } from '@/components/ui/skeleton'

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStoreConfig()
  const siteName = config?.storeName ?? 'Vercel Swag Store'
  const description =
    config?.seo.defaultDescription ??
    'Shop the official Vercel Swag Store. Premium developer gear, hoodies, tees, and more.'

  return {
    title: 'Home',
    description,
    openGraph: {
      title: `${siteName} — Official Developer Merchandise`,
      description,
      url: '/',
    },
  }
}

export default function HomePage() {
  return (
    <>
      <Suspense fallback={<PromoBannerFallback />}>
        <PromoBanner />
      </Suspense>

      <Hero />

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Suspense fallback={<ProductGridSkeleton count={8} />}>
          <FeaturedProducts />
        </Suspense>
      </div>

      {/* Recently viewed — only rendered when feature flag is on; reads localStorage client-side */}
      <Suspense fallback={null}>
        <RecentlyViewedSection />
      </Suspense>
    </>
  )
}
