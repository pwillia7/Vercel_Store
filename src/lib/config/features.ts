import { getStoreConfig } from '@/lib/api/client'
import type { StoreConfig } from '@/lib/api/types'

const DEFAULT_FLAGS: StoreConfig['features'] = {
  liveChat: false,
  productComparison: false,
  recentlyViewed: false,
  reviews: false,
  wishlist: false,
}

/**
 * Returns feature flags from the store config.
 * getStoreConfig() is cached for weeks, so this is effectively free after
 * the first call. Falls back to all-false if the config fetch fails.
 */
export async function getFeatureFlags(): Promise<StoreConfig['features']> {
  const config = await getStoreConfig()
  return config?.features ?? DEFAULT_FLAGS
}
