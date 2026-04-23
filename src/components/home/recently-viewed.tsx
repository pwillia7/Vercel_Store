import { cacheLife } from 'next/cache'
import { getStoreConfig } from '@/lib/api/client'
import { RecentlyViewedDisplay } from './recently-viewed-client'

/**
 * RecentlyViewedSection — cached Server Component gate.
 *
 * Only checks a feature flag (getStoreConfig, cached for days).
 * "use cache" here prevents even that cheap flag lookup from running
 * on every request — the decision of whether to ship the client component
 * reference is cached for the same lifetime as the store config itself.
 */
export async function RecentlyViewedSection() {
  'use cache'
  cacheLife('days')

  const config = await getStoreConfig()
  if (!config?.features?.recentlyViewed) return null
  return <RecentlyViewedDisplay />
}
