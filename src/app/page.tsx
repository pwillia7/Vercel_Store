import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getStoreConfig } from '@/lib/api/client'
import { Hero } from '@/components/home/hero'
import { PromoBanner, PromoBannerFallback } from '@/components/home/promo-banner'
import { FeaturedProducts } from '@/components/home/featured-products'
import { RecentlyViewedSection } from '@/components/home/recently-viewed'

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
      {/* PromoBanner is dynamic (no use cache) — Suspense lets the static shell render first */}
      <Suspense fallback={<PromoBannerFallback />}>
        <PromoBanner />
      </Suspense>

      <Hero />

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* FeaturedProducts has 'use cache' — part of the prerendered shell, no Suspense needed */}
        <FeaturedProducts />
      </div>

      {/* RecentlyViewedSection has 'use cache' — part of the prerendered shell, no Suspense needed */}
      <RecentlyViewedSection />
    </>
  )
}
