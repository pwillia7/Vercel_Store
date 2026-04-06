import { cacheLife } from 'next/cache'
import { getFeatureFlags } from '@/lib/config/features'
import { RecentlyViewedDisplay } from './recently-viewed-client'

/**
 * RecentlyViewedSection — cached Server Component gate.
 *
 * Only checks a feature flag (getStoreConfig, cached for weeks).
 * "use cache" here prevents even that cheap flag lookup from running
 * on every request — the decision of whether to ship the client component
 * reference is cached for the same lifetime as the store config itself.
 */
export async function RecentlyViewedSection() {
  'use cache'
  cacheLife('weeks')

  const flags = await getFeatureFlags()
  if (!flags.recentlyViewed) return null
  return <RecentlyViewedDisplay />
}
